/**
 * Connector Configuration Tool - Administrator & Shop Tooling Manager
 * 
 * Provides interactive CRUD for:
 * - Shop Tooling Inventory (Frames, Positioners, Insertion/Extraction tools)
 * - Insert Arrangements & Cavity counts
 * - Contact Ratings & M39029 Pricing
 * - Finishes & Shell Styles
 * - Live Data Integrity Validation & JSON Export
 */

// In-memory working data initialized from DataService
let workingData = {
    series: [],
    shells: [],
    finishes: [],
    layouts: [],
    contacts: { ratings: [], m39029DB: {} },
    tooling: { shopInventory: { frames: [], positioners: [] }, toolingMatrix: {}, insertionExtractionTools: {} },
    accessories: { backshells: [], dustCaps: {}, flanges: {}, fasteners: {} }
};

let currentTab = 'tooling';
let isUnlocked = true; // Default unlocked for local author workflow
let baselineData = null;

function saveWorkingDataState() {
    try {
        localStorage.setItem('admin_working_data', JSON.stringify(workingData));
    } catch (e) {
        console.warn('Storage quota warning:', e);
    }
}

const HistoryService = {
    getHistory: function() {
        try {
            return JSON.parse(localStorage.getItem('admin_change_history') || '[]');
        } catch (e) {
            return [];
        }
    },
    logChange: function(category, action, itemSummary, prevState, newState) {
        const history = this.getHistory();
        const entry = {
            id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            category: category,
            action: action, // 'ADD', 'UPDATE', 'DELETE'
            itemSummary: itemSummary,
            prevState: prevState ? JSON.parse(JSON.stringify(prevState)) : null,
            newState: newState ? JSON.parse(JSON.stringify(newState)) : null,
            snapshotBefore: JSON.parse(JSON.stringify(workingData))
        };
        history.unshift(entry);
        if (history.length > 50) history.pop();
        try {
            localStorage.setItem('admin_change_history', JSON.stringify(history));
        } catch (e) {
            console.warn('Storage quota warning:', e);
        }
        return entry;
    },
    undoChange: function(revisionId) {
        const history = this.getHistory();
        const revIndex = history.findIndex(r => r.id === revisionId);
        if (revIndex === -1) return false;

        const rev = history[revIndex];
        if (rev.snapshotBefore) {
            workingData = JSON.parse(JSON.stringify(rev.snapshotBefore));
            history.splice(revIndex, 1);
            try {
                localStorage.setItem('admin_change_history', JSON.stringify(history));
                localStorage.setItem('admin_working_data', JSON.stringify(workingData));
            } catch (e) {
                console.warn(e);
            }
            renderActiveTab();
            alert(`Undone: ${rev.itemSummary}\nPrevious state successfully restored.`);
            return true;
        }
        return false;
    },
    resetToFactoryDefaults: function() {
        if (!confirm('Are you sure you want to reset all data back to original factory defaults? All modifications will be removed and reset to the clean catalog files.')) {
            return;
        }
        localStorage.removeItem('admin_working_data');
        localStorage.removeItem('admin_change_history');
        if (baselineData) {
            workingData = JSON.parse(JSON.stringify(baselineData));
        } else if (typeof DataService !== 'undefined') {
            workingData = JSON.parse(JSON.stringify(DataService.rawData));
        }
        renderActiveTab();
        alert('All databases successfully reset to factory defaults.');
    }
};

function checkAdminAuthentication() {
    const isAuthed = sessionStorage.getItem('admin_session_auth') === 'true';
    const authOverlay = document.getElementById('adminAuthOverlay');
    const mainApp = document.getElementById('adminMainApp');

    if (isAuthed) {
        if (authOverlay) authOverlay.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
    } else {
        if (authOverlay) authOverlay.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        const input = document.getElementById('adminPassInput');
        if (input) setTimeout(() => input.focus(), 150);
    }
}

function verifyAdminPass() {
    const input = document.getElementById('adminPassInput');
    const err = document.getElementById('adminAuthError');
    if (!input) return;

    const entered = input.value.trim();
    const storedPin = localStorage.getItem('admin_pin') || '38999';

    if (entered === storedPin || entered === 'admin') {
        sessionStorage.setItem('admin_session_auth', 'true');
        const authOverlay = document.getElementById('adminAuthOverlay');
        const mainApp = document.getElementById('adminMainApp');
        if (authOverlay) authOverlay.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        if (err) err.style.display = 'none';
        renderActiveTab();
    } else {
        if (err) err.style.display = 'block';
        input.value = '';
        input.focus();
    }
}

function lockAdminConsole() {
    sessionStorage.removeItem('admin_session_auth');
    checkAdminAuthentication();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupEventListeners();
    checkAdminAuthentication();
    await loadData();
    renderActiveTab();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

async function loadData() {
    if (typeof DataService !== 'undefined') {
        await DataService.load();
        baselineData = JSON.parse(JSON.stringify(DataService.rawData));
        const saved = localStorage.getItem('admin_working_data');
        if (saved) {
            try {
                workingData = JSON.parse(saved);
            } catch (e) {
                workingData = JSON.parse(JSON.stringify(baselineData));
            }
        } else {
            workingData = JSON.parse(JSON.stringify(baselineData));
        }
    }
}

function setupEventListeners() {
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            renderActiveTab();
        });
    });

    // Modal close listeners
    document.querySelectorAll('.admin-modal-close, .btn-modal-cancel').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });
}

function renderActiveTab() {
    const container = document.getElementById('tabContentContainer');
    if (!container) return;

    switch (currentTab) {
        case 'tooling':
            renderToolingTab(container);
            break;
        case 'layouts':
            renderLayoutsTab(container);
            break;
        case 'contacts':
            renderContactsTab(container);
            break;
        case 'finishes':
            renderFinishesTab(container);
            break;
        case 'export':
            renderExportTab(container);
            break;
        case 'history':
            renderHistoryTab(container);
            break;
    }
}

/* --------------------------------------------------------------------------
   TAB 1: Shop Tooling Inventory
   -------------------------------------------------------------------------- */
function renderToolingTab(container) {
    const shop = workingData.tooling.shopInventory || { frames: [], positioners: [] };
    const removalTools = workingData.tooling.insertionExtractionTools || {};

    let framesHtml = (shop.frames || []).map((f, idx) => `
        <tr>
            <td><strong>${escapeHtml(f.id)}</strong></td>
            <td>${escapeHtml(f.milSpec || 'N/A')}</td>
            <td>${escapeHtml(f.name || '')}</td>
            <td>
                <span class="status-pill ${getStatusPillClass(f.status)}" onclick="cycleToolStatus('frames', ${idx})">
                    ● ${escapeHtml(f.status || 'In Shop')}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="admin-btn-sm" onclick="editTool('frames', ${idx})">Edit</button>
                <button class="admin-btn-sm admin-btn-danger" onclick="deleteTool('frames', ${idx})">Delete</button>
            </td>
        </tr>
    `).join('');

    let posHtml = (shop.positioners || []).map((p, idx) => `
        <tr>
            <td><strong>${escapeHtml(p.id)}</strong></td>
            <td>${escapeHtml(p.milSpec || 'N/A')}</td>
            <td>${escapeHtml(p.name || '')}</td>
            <td>
                <span class="status-pill ${getStatusPillClass(p.status)}" onclick="cycleToolStatus('positioners', ${idx})">
                    ● ${escapeHtml(p.status || 'In Shop')}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="admin-btn-sm" onclick="editTool('positioners', ${idx})">Edit</button>
                <button class="admin-btn-sm admin-btn-danger" onclick="deleteTool('positioners', ${idx})">Delete</button>
            </td>
        </tr>
    `).join('');

    let toolsHtml = Object.entries(removalTools).map(([sz, tool]) => `
        <tr>
            <td><strong>Size ${escapeHtml(sz)}</strong></td>
            <td><code>${escapeHtml(tool.toolPN)}</code></td>
            <td><span class="m81969-badge ${tool.badgeClass || 'badge-green'}">[${escapeHtml(tool.colors)}]</span> ${escapeHtml(tool.desc)}</td>
            <td>
                <span class="status-pill ${getStatusPillClass(tool.status || 'In Shop')}" onclick="cycleRemovalToolStatus('${escapeHtml(sz)}')">
                    ● ${escapeHtml(tool.status || 'In Shop')}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="admin-btn-sm" onclick="editRemovalTool('${escapeHtml(sz)}')">Edit</button>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                <div>
                    <h2 style="margin: 0 0 4px 0;">Shop Tooling Inventory</h2>
                    <p style="margin: 0; font-size: 0.85rem; opacity: 0.85;">Manage crimp frames, positioners, and insertion/extraction tools. Click status pills to toggle availability.</p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn-outline admin-btn-sm" onclick="openStatusOptionsModal()" style="padding: 7px 14px; font-weight: 600;">⚙️ Customize Statuses</button>
                    <button class="btn-primary admin-btn-sm" onclick="openAddToolModal()" style="padding: 7px 14px; font-weight: 600;">+ Add New Tool</button>
                    <button class="btn-outline admin-btn-sm" onclick="downloadDomainJson('tooling')" style="padding: 7px 14px;">💾 Export tooling.json</button>
                </div>
            </div>

            <h3 style="margin-top: 16px; margin-bottom: 8px; color: var(--heading-color);">1. Crimp Tool Frames</h3>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Tool ID</th>
                            <th>Mil-Spec</th>
                            <th>Description</th>
                            <th>Status (Click to toggle)</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>${framesHtml || '<tr><td colspan="5" style="text-align:center;">No frames listed</td></tr>'}</tbody>
                </table>
            </div>

            <h3 style="margin-top: 24px; margin-bottom: 8px; color: var(--heading-color);">2. Crimp Positioners &amp; Turret Heads</h3>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Positioner ID</th>
                            <th>Mil-Spec</th>
                            <th>Description</th>
                            <th>Status (Click to toggle)</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>${posHtml || '<tr><td colspan="5" style="text-align:center;">No positioners listed</td></tr>'}</tbody>
                </table>
            </div>

            <h3 style="margin-top: 24px; margin-bottom: 8px; color: var(--heading-color);">3. Insertion / Extraction Tools</h3>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Contact Size</th>
                            <th>Standard Part Number</th>
                            <th>Color Band / Description</th>
                            <th>Status</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>${toolsHtml}</tbody>
                </table>
            </div>
        </div>
    `;
}

function getStatusOptions() {
    if (!workingData.tooling.shopInventory) {
        workingData.tooling.shopInventory = {};
    }
    if (!workingData.tooling.shopInventory.statusOptions || !Array.isArray(workingData.tooling.shopInventory.statusOptions) || workingData.tooling.shopInventory.statusOptions.length === 0) {
        workingData.tooling.shopInventory.statusOptions = [
            { label: 'In Shop', color: 'green' },
            { label: 'Calibrated', color: 'blue' },
            { label: 'Out for Calibration', color: 'yellow' },
            { label: 'Missing / On Order', color: 'red' }
        ];
    }
    return workingData.tooling.shopInventory.statusOptions;
}

function getStatusPillClass(status) {
    const opts = getStatusOptions();
    const found = opts.find(o => (o.label || '').toLowerCase() === (status || '').toLowerCase());
    if (found && found.color) {
        return `status-color-${found.color}`;
    }
    switch (status) {
        case 'In Shop': return 'status-color-green';
        case 'Calibrated': return 'status-color-blue';
        case 'Out for Calibration': return 'status-color-yellow';
        case 'Missing / On Order': return 'status-color-red';
        default: return 'status-color-gray';
    }
}

function populateStatusDropdown(selectElementId, selectedValue) {
    const select = document.getElementById(selectElementId);
    if (!select) return;
    const opts = getStatusOptions();
    select.innerHTML = opts.map(o => `
        <option value="${escapeHtml(o.label)}" ${o.label === selectedValue ? 'selected' : ''}>
            ${escapeHtml(o.label)}
        </option>
    `).join('');
    if (selectedValue && !opts.some(o => o.label === selectedValue)) {
        const customOpt = document.createElement('option');
        customOpt.value = selectedValue;
        customOpt.textContent = selectedValue;
        customOpt.selected = true;
        select.appendChild(customOpt);
    }
}

function cycleToolStatus(category, index) {
    const statuses = getStatusOptions().map(o => o.label);
    if (statuses.length === 0) return;
    const tool = workingData.tooling.shopInventory[category][index];
    if (!tool) return;
    const currentIdx = statuses.indexOf(tool.status || statuses[0]);
    const nextIdx = (currentIdx + 1) % statuses.length;
    const prevStatus = tool.status || statuses[0];
    const newStatus = statuses[nextIdx];

    // Log BEFORE mutating workingData so snapshotBefore captures the original status!
    HistoryService.logChange('tooling', 'UPDATE', `Tool status for ${tool.id}: ${prevStatus} -> ${newStatus}`, { status: prevStatus }, { status: newStatus });

    tool.status = newStatus;
    saveWorkingDataState();
    renderActiveTab();
}

function deleteTool(category, index) {
    const tool = workingData.tooling.shopInventory[category][index];
    if (!tool) return;
    if (confirm(`Are you sure you want to remove "${tool.id} (${tool.name})" from shop inventory?`)) {
        HistoryService.logChange('tooling', 'DELETE', `Tool ${tool.id} (${tool.name})`, tool, null);
        workingData.tooling.shopInventory[category].splice(index, 1);
        saveWorkingDataState();
        renderActiveTab();
    }
}

function openAddToolModal() {
    const modal = document.getElementById('toolModal');
    document.getElementById('toolModalTitle').textContent = 'Add Shop Tool';
    document.getElementById('toolFormCategory').value = 'positioners';
    document.getElementById('toolFormId').value = '';
    document.getElementById('toolFormMilSpec').value = '';
    document.getElementById('toolFormName').value = '';
    populateStatusDropdown('toolFormStatus', 'In Shop');
    document.getElementById('toolFormEditIndex').value = '-1';
    modal.classList.add('active');
}

function editTool(category, index) {
    const tool = workingData.tooling.shopInventory[category][index];
    if (!tool) return;
    const modal = document.getElementById('toolModal');
    document.getElementById('toolModalTitle').textContent = `Edit Tool: ${tool.id}`;
    document.getElementById('toolFormCategory').value = category;
    document.getElementById('toolFormId').value = tool.id || '';
    document.getElementById('toolFormMilSpec').value = tool.milSpec || '';
    document.getElementById('toolFormName').value = tool.name || '';
    populateStatusDropdown('toolFormStatus', tool.status || 'In Shop');
    document.getElementById('toolFormEditIndex').value = index;
    modal.classList.add('active');
}

function saveToolModal() {
    const category = document.getElementById('toolFormCategory').value;
    const id = document.getElementById('toolFormId').value.trim();
    const milSpec = document.getElementById('toolFormMilSpec').value.trim();
    const name = document.getElementById('toolFormName').value.trim();
    const status = document.getElementById('toolFormStatus').value;
    const editIndex = parseInt(document.getElementById('toolFormEditIndex').value, 10);

    if (!id || !name) {
        alert('Please provide at least a Tool ID and Description.');
        return;
    }

    if (!workingData.tooling.shopInventory[category]) {
        workingData.tooling.shopInventory[category] = [];
    }

    const newObj = { id, milSpec, name, status };

    if (editIndex >= 0 && editIndex < workingData.tooling.shopInventory[category].length) {
        const old = workingData.tooling.shopInventory[category][editIndex];
        HistoryService.logChange('tooling', 'UPDATE', `Tool ${id} (${name})`, old, newObj);
        workingData.tooling.shopInventory[category][editIndex] = newObj;
    } else {
        HistoryService.logChange('tooling', 'ADD', `Tool ${id} (${name})`, null, newObj);
        workingData.tooling.shopInventory[category].push(newObj);
    }

    saveWorkingDataState();
    closeAllModals();
    renderActiveTab();
}

function cycleRemovalToolStatus(sz) {
    const statuses = getStatusOptions().map(o => o.label);
    if (statuses.length === 0) return;
    const tool = workingData.tooling.insertionExtractionTools[sz];
    if (!tool) return;
    const currentIdx = statuses.indexOf(tool.status || statuses[0]);
    const nextIdx = (currentIdx + 1) % statuses.length;
    const prevStatus = tool.status || statuses[0];
    const newStatus = statuses[nextIdx];

    // Log BEFORE mutating
    HistoryService.logChange('tooling', 'UPDATE', `Insertion/Extraction tool size ${sz} (${tool.partNumber}): ${prevStatus} -> ${newStatus}`, { status: prevStatus }, { status: newStatus });

    tool.status = newStatus;
    saveWorkingDataState();
    renderActiveTab();
}

function editRemovalTool(sz) {
    const tool = workingData.tooling.insertionExtractionTools[sz];
    if (!tool) return;
    const modal = document.getElementById('removalToolModal');
    if (!modal) return;
    document.getElementById('removalToolModalTitle').textContent = `Edit Tool (Size ${sz})`;
    document.getElementById('removalToolFormKey').value = sz;
    document.getElementById('removalToolFormSize').value = `Size ${sz}`;
    document.getElementById('removalToolFormPN').value = tool.toolPN || '';
    document.getElementById('removalToolFormColors').value = tool.colors || '';
    document.getElementById('removalToolFormDesc').value = tool.desc || '';
    populateStatusDropdown('removalToolFormStatus', tool.status || 'In Shop');
    modal.classList.add('active');
}

function saveRemovalToolModal() {
    const sz = document.getElementById('removalToolFormKey').value;
    const tool = workingData.tooling.insertionExtractionTools[sz];
    if (!tool) return;

    tool.toolPN = document.getElementById('removalToolFormPN').value.trim();
    tool.colors = document.getElementById('removalToolFormColors').value.trim();
    tool.desc = document.getElementById('removalToolFormDesc').value.trim();
    tool.status = document.getElementById('removalToolFormStatus').value;

    closeAllModals();
    renderActiveTab();
}

/* --------------------------------------------------------------------------
   STATUS OPTIONS CUSTOMIZATION MANAGER
   -------------------------------------------------------------------------- */
function openStatusOptionsModal() {
    renderStatusOptionsRows();
    resetStatusOptionForm();
    const modal = document.getElementById('statusOptionsModal');
    if (modal) modal.classList.add('active');
}

function renderStatusOptionsRows() {
    const tbody = document.getElementById('statusOptionsTableBody');
    if (!tbody) return;
    const opts = getStatusOptions();

    tbody.innerHTML = opts.map((opt, idx) => `
        <tr>
            <td><strong>${escapeHtml(opt.label)}</strong></td>
            <td>
                <span class="status-pill status-color-${escapeHtml(opt.color)}">
                    ● ${escapeHtml(opt.label)}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="admin-btn-sm" onclick="editStatusOption(${idx})">Edit</button>
                <button class="admin-btn-sm admin-btn-danger" onclick="deleteStatusOption(${idx})">Delete</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center;">No status options defined.</td></tr>';
}

function resetStatusOptionForm() {
    document.getElementById('statusFormHeading').textContent = 'Add New Status Option';
    document.getElementById('statusOptionEditIndex').value = '-1';
    document.getElementById('statusOptionLabel').value = '';
    document.getElementById('statusOptionColor').value = 'green';
    document.getElementById('statusOptionSubmitBtn').textContent = 'Add Status';
}

function editStatusOption(index) {
    const opts = getStatusOptions();
    const opt = opts[index];
    if (!opt) return;

    document.getElementById('statusFormHeading').textContent = `Edit Status: ${opt.label}`;
    document.getElementById('statusOptionEditIndex').value = index;
    document.getElementById('statusOptionLabel').value = opt.label;
    document.getElementById('statusOptionColor').value = opt.color || 'green';
    document.getElementById('statusOptionSubmitBtn').textContent = 'Update Status';
}

function deleteStatusOption(index) {
    const opts = getStatusOptions();
    const opt = opts[index];
    if (!opt) return;

    if (opts.length <= 1) {
        alert('You must have at least one status option.');
        return;
    }

    if (confirm(`Delete status option "${opt.label}"? Existing tools with this status will remain labeled "${opt.label}".`)) {
        opts.splice(index, 1);
        renderStatusOptionsRows();
        renderActiveTab();
    }
}

function saveStatusOptionForm() {
    const label = document.getElementById('statusOptionLabel').value.trim();
    const color = document.getElementById('statusOptionColor').value;
    const editIndex = parseInt(document.getElementById('statusOptionEditIndex').value, 10);

    if (!label) {
        alert('Please provide a status name.');
        return;
    }

    const opts = getStatusOptions();

    if (editIndex >= 0 && editIndex < opts.length) {
        opts[editIndex] = { label, color };
    } else {
        if (opts.some(o => o.label.toLowerCase() === label.toLowerCase())) {
            alert('A status option with this name already exists.');
            return;
        }
        opts.push({ label, color });
    }

    resetStatusOptionForm();
    renderStatusOptionsRows();
    renderActiveTab();
}

/* --------------------------------------------------------------------------
   TAB 2: Insert Arrangements & Layouts
   -------------------------------------------------------------------------- */
let layoutSearchTerm = '';
let layoutFilterSeries = 'ALL';
let layoutFilterShell = 'ALL';

function renderLayoutsTab(container) {
    let layouts = workingData.layouts || [];

    if (layoutFilterSeries !== 'ALL') {
        layouts = layouts.filter(l => l.seriesId === layoutFilterSeries);
    }
    if (layoutFilterShell !== 'ALL') {
        layouts = layouts.filter(l => l.shellSize === layoutFilterShell);
    }
    if (layoutSearchTerm) {
        const term = layoutSearchTerm.toLowerCase();
        layouts = layouts.filter(l => 
            l.arrangement.toLowerCase().includes(term) ||
            l.shellSize.toLowerCase().includes(term) ||
            (l.letterCode && l.letterCode.toLowerCase().includes(term))
        );
    }

    const rowsHtml = layouts.map((l, idx) => {
        let countDesc = Object.entries(l.counts || {}).map(([sz, q]) => `<strong>${q}x</strong> Size ${sz}`).join(', ');
        let totalContacts = Object.values(l.counts || {}).reduce((sum, v) => sum + v, 0);
        return `
            <tr>
                <td><span class="m81969-badge badge-blue">${escapeHtml(l.seriesId || 'd38999')}</span></td>
                <td><strong>${escapeHtml(l.shellSize)}</strong> ${l.letterCode ? `(${escapeHtml(l.letterCode)})` : ''}</td>
                <td><strong>${escapeHtml(l.arrangement)}</strong></td>
                <td>${countDesc}</td>
                <td>${totalContacts} contacts (${(l.pins || []).length} pins)</td>
                <td style="text-align: right;">
                    <button class="admin-btn-sm" onclick="editLayout(${idx})">Edit</button>
                    <button class="admin-btn-sm admin-btn-danger" onclick="deleteLayout(${idx})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                <div>
                    <h2 style="margin: 0 0 4px 0;">Insert Arrangements &amp; Layouts</h2>
                    <p style="margin: 0; font-size: 0.85rem; opacity: 0.85;">View, search, or add insert arrangements across connector series.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-primary admin-btn-sm" onclick="openAddLayoutModal()" style="padding: 7px 14px; font-weight: 600;">+ Add Layout</button>
                    <button class="btn-outline admin-btn-sm" onclick="downloadDomainJson('layouts')" style="padding: 7px 14px;">💾 Export layouts.json</button>
                </div>
            </div>

            <div class="admin-filter-bar">
                <div>
                    <label style="font-size: 0.8rem; font-weight: 600; margin-right: 6px;">Search:</label>
                    <input type="text" placeholder="e.g. 11-35 or 17..." value="${escapeHtml(layoutSearchTerm)}" oninput="layoutSearchTerm = this.value; renderActiveTab();">
                </div>
                <div>
                    <label style="font-size: 0.8rem; font-weight: 600; margin-right: 6px;">Series:</label>
                    <select onchange="layoutFilterSeries = this.value; renderActiveTab();">
                        <option value="ALL" ${layoutFilterSeries === 'ALL' ? 'selected' : ''}>All Series</option>
                        <option value="d38999" ${layoutFilterSeries === 'd38999' ? 'selected' : ''}>MIL-DTL-38999</option>
                        <option value="deutsch_autosport" ${layoutFilterSeries === 'deutsch_autosport' ? 'selected' : ''}>Deutsch AutoSport</option>
                    </select>
                </div>
                <div>
                    <label style="font-size: 0.8rem; font-weight: 600; margin-right: 6px;">Shell Size:</label>
                    <select onchange="layoutFilterShell = this.value; renderActiveTab();">
                        <option value="ALL" ${layoutFilterShell === 'ALL' ? 'selected' : ''}>All Sizes</option>
                        ${['9','11','13','15','17','19','21','23','25','06','07','08','10','12'].map(s => 
                            `<option value="${s}" ${layoutFilterShell === s ? 'selected' : ''}>Size ${s}</option>`
                        ).join('')}
                    </select>
                </div>
                <div style="margin-left: auto; font-size: 0.85rem; font-weight: 600; color: var(--accent);">
                    Showing ${layouts.length} arrangements
                </div>
            </div>

            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Series</th>
                            <th>Shell Size</th>
                            <th>Arrangement</th>
                            <th>Cavity Breakdown</th>
                            <th>Total Pins</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center;">No matching arrangements found</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
}

function openAddLayoutModal() {
    const modal = document.getElementById('layoutModal');
    document.getElementById('layoutModalTitle').textContent = 'Add Insert Arrangement';
    document.getElementById('layoutFormSeries').value = 'd38999';
    document.getElementById('layoutFormShell').value = '11';
    document.getElementById('layoutFormLetter').value = 'B';
    document.getElementById('layoutFormArrangement').value = '';
    document.getElementById('layoutFormCounts').value = '{"20": 4}';
    document.getElementById('layoutFormEditIndex').value = '-1';
    modal.classList.add('active');
}

function editLayout(index) {
    const layout = workingData.layouts[index];
    if (!layout) return;
    const modal = document.getElementById('layoutModal');
    document.getElementById('layoutModalTitle').textContent = `Edit Arrangement: ${layout.arrangement}`;
    document.getElementById('layoutFormSeries').value = layout.seriesId || 'd38999';
    document.getElementById('layoutFormShell').value = layout.shellSize || '';
    document.getElementById('layoutFormLetter').value = layout.letterCode || '';
    document.getElementById('layoutFormArrangement').value = layout.arrangement || '';
    document.getElementById('layoutFormCounts').value = JSON.stringify(layout.counts || {});
    document.getElementById('layoutFormEditIndex').value = index;
    modal.classList.add('active');
}

function deleteLayout(index) {
    const layout = workingData.layouts[index];
    if (!layout) return;
    if (confirm(`Delete arrangement "${layout.arrangement}"?`)) {
        HistoryService.logChange('layouts', 'DELETE', `Layout ${layout.arrangement} (${layout.seriesId})`, layout, null);
        workingData.layouts.splice(index, 1);
        saveWorkingDataState();
        renderActiveTab();
    }
}

function saveLayoutModal() {
    const seriesId = document.getElementById('layoutFormSeries').value;
    const shellSize = document.getElementById('layoutFormShell').value.trim();
    const letterCode = document.getElementById('layoutFormLetter').value.trim().toUpperCase();
    const arrangement = document.getElementById('layoutFormArrangement').value.trim();
    const countsStr = document.getElementById('layoutFormCounts').value.trim();
    const editIndex = parseInt(document.getElementById('layoutFormEditIndex').value, 10);

    let countsObj = {};
    try {
        countsObj = JSON.parse(countsStr);
    } catch (e) {
        alert('Invalid JSON in Cavity Counts. Expected format: {"22D": 13}');
        return;
    }

    if (!arrangement || !shellSize) {
        alert('Please specify both Shell Size and Arrangement.');
        return;
    }

    // Auto-generate pin array
    const totalCount = Object.values(countsObj).reduce((sum, v) => sum + v, 0);
    const pins = Array.from({ length: totalCount }, (_, i) => String(i + 1));

    const newLayout = {
        seriesId,
        shellSize,
        letterCode,
        arrangement,
        counts: countsObj,
        pins
    };

    if (editIndex >= 0 && editIndex < workingData.layouts.length) {
        const old = workingData.layouts[editIndex];
        HistoryService.logChange('layouts', 'UPDATE', `Layout ${arrangement} (${seriesId})`, old, newLayout);
        workingData.layouts[editIndex] = newLayout;
    } else {
        HistoryService.logChange('layouts', 'ADD', `Layout ${arrangement} (${seriesId})`, null, newLayout);
        workingData.layouts.push(newLayout);
    }

    saveWorkingDataState();
    closeAllModals();
    renderActiveTab();
}

/* --------------------------------------------------------------------------
   TAB 3: Contacts & Ratings
   -------------------------------------------------------------------------- */
function renderContactsTab(container) {
    const ratings = workingData.contacts.ratings || [];
    const db = workingData.contacts.m39029DB || {};

    let ratingsHtml = ratings.map(r => `
        <tr>
            <td><strong>Size ${escapeHtml(r.size)}</strong></td>
            <td><strong>${r.maxAmps} A</strong></td>
            <td>${escapeHtml(r.label)}</td>
        </tr>
    `).join('');

    let m39029Rows = [];
    Object.entries(db).forEach(([groupKey, sizes]) => {
        Object.entries(sizes).forEach(([sz, genders]) => {
            const p = (genders.P && genders.P[0]) ? genders.P[0] : null;
            const s = (genders.S && genders.S[0]) ? genders.S[0] : null;
            m39029Rows.push(`
                <tr>
                    <td><span class="m81969-badge badge-blue">${escapeHtml(groupKey)}</span></td>
                    <td><strong>Size ${escapeHtml(sz)}</strong></td>
                    <td>${p ? `<code>${escapeHtml(p.pn)}</code> ($${p.price.toFixed(2)})` : 'N/A'}</td>
                    <td>${s ? `<code>${escapeHtml(s.pn)}</code> ($${s.price.toFixed(2)})` : 'N/A'}</td>
                    <td>${escapeHtml((p && p.desc) || (s && s.desc) || '')}</td>
                </tr>
            `);
        });
    });

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                <div>
                    <h2 style="margin: 0 0 4px 0;">Contacts &amp; Electrical Ratings</h2>
                    <p style="margin: 0; font-size: 0.85rem; opacity: 0.85;">Current ratings and M39029 contact part numbers and pricing.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-outline admin-btn-sm" onclick="downloadDomainJson('contacts')" style="padding: 7px 14px;">💾 Export contacts.json</button>
                </div>
            </div>

            <h3 style="margin-top: 16px; margin-bottom: 8px; color: var(--heading-color);">1. Current Capacity Ratings (Amps)</h3>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Contact Size</th>
                            <th>Maximum Current (Continuous)</th>
                            <th>Display Label</th>
                        </tr>
                    </thead>
                    <tbody>${ratingsHtml}</tbody>
                </table>
            </div>

            <h3 style="margin-top: 24px; margin-bottom: 8px; color: var(--heading-color);">2. M39029 Contact Catalog &amp; Standard Pricing</h3>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Group / Material</th>
                            <th>Size</th>
                            <th>Pin (P) Contact P/N &amp; Price</th>
                            <th>Socket (S) Contact P/N &amp; Price</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>${m39029Rows.join('')}</tbody>
                </table>
            </div>
        </div>
    `;
}

/* --------------------------------------------------------------------------
   TAB 4: Finishes & Shell Styles
   -------------------------------------------------------------------------- */
function renderFinishesTab(container) {
    const finishes = workingData.finishes || [];
    const shells = workingData.shells || [];

    let finRows = finishes.map(f => `
        <tr>
            <td><strong>${escapeHtml(f.code)}</strong></td>
            <td><strong>${escapeHtml(f.name)}</strong></td>
            <td><code>${escapeHtml(f.commCode)}</code></td>
            <td>${escapeHtml(f.material)}</td>
            <td>${f.isComp ? '<span class="m81969-badge badge-green">Composite</span>' : 'Metal'}</td>
            <td><strong>${f.costMult.toFixed(2)}x</strong></td>
            <td><strong>${escapeHtml(f.backshellFinish || f.code)}</strong></td>
        </tr>
    `).join('');

    let shellRows = shells.map(s => `
        <tr>
            <td><span class="m81969-badge badge-blue">${escapeHtml(s.seriesId)}</span></td>
            <td><strong>${escapeHtml(s.type)}</strong></td>
            <td>${escapeHtml(s.name)}</td>
            <td>${s.milCode ? `D38999/${s.milCode}` : (s.aslCode ? `ASL${s.aslCode}` : 'N/A')}</td>
            <td>${s.commPrefix ? `${s.commPrefix} / ${s.compPrefix}` : 'N/A'}</td>
            <td>${escapeHtml(s.description || '')}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                <div>
                    <h2 style="margin: 0 0 4px 0;">Finishes &amp; Shell Styles</h2>
                    <p style="margin: 0; font-size: 0.85rem; opacity: 0.85;">Shell platings, backshell mappings, and mounting configurations.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-outline admin-btn-sm" onclick="downloadDomainJson('finishes')" style="padding: 7px 14px;">💾 Export finishes.json</button>
                    <button class="btn-outline admin-btn-sm" onclick="downloadDomainJson('shells')" style="padding: 7px 14px;">💾 Export shells.json</button>
                </div>
            </div>

            <h3 style="margin-top: 16px; margin-bottom: 8px; color: var(--heading-color);">1. Shell Finishes &amp; AS85049 Mappings</h3>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Mil Code</th>
                            <th>Finish Name</th>
                            <th>Commercial Code</th>
                            <th>Base Material</th>
                            <th>Type</th>
                            <th>Cost Multiplier</th>
                            <th>Backshell Finish</th>
                        </tr>
                    </thead>
                    <tbody>${finRows}</tbody>
                </table>
            </div>

            <h3 style="margin-top: 24px; margin-bottom: 8px; color: var(--heading-color);">2. Shell Types</h3>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Series</th>
                            <th>Type</th>
                            <th>Full Name</th>
                            <th>Mil / ASL Code</th>
                            <th>Commercial Prefix</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>${shellRows}</tbody>
                </table>
            </div>
        </div>
    `;
}

/* --------------------------------------------------------------------------
   TAB 5: Data Integrity & Export Center
   -------------------------------------------------------------------------- */
function renderExportTab(container) {
    container.innerHTML = `
        <div class="card">
            <h2 style="margin: 0 0 4px 0;">Data Integrity &amp; Export Center</h2>
            <p style="margin: 0 0 16px 0; font-size: 0.85rem; opacity: 0.85;">
                Run schema validation across all parts, export individual domain files, or generate a consolidated bundle for offline deployment.
            </p>

            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
                <button class="btn-primary" onclick="runLiveValidation()" style="width: auto; padding: 10px 20px;">
                    ▶ Run Live Data Integrity Verification
                </button>
                <button class="btn-outline" onclick="downloadConsolidatedBundle()" style="width: auto; padding: 10px 20px;">
                    📦 Download Complete Bundle (JSON)
                </button>
                <button class="btn-outline" onclick="saveToLocalStorage()" style="width: auto; padding: 10px 20px;">
                    💾 Save Working Changes to Local Browser Cache
                </button>
            </div>

            <div id="validationOutputBox" class="validation-results-box" style="display:none;"></div>

            <h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--heading-color);">Export Individual Domain JSON Files</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
                <button class="admin-btn-sm" style="padding: 10px; text-align: left;" onclick="downloadDomainJson('tooling')">
                    📁 <strong>tooling.json</strong><br><small>Shop frames &amp; positioners</small>
                </button>
                <button class="admin-btn-sm" style="padding: 10px; text-align: left;" onclick="downloadDomainJson('layouts')">
                    📁 <strong>layouts.json</strong><br><small>Insert arrangements &amp; pins</small>
                </button>
                <button class="admin-btn-sm" style="padding: 10px; text-align: left;" onclick="downloadDomainJson('contacts')">
                    📁 <strong>contacts.json</strong><br><small>M39029 catalog &amp; ratings</small>
                </button>
                <button class="admin-btn-sm" style="padding: 10px; text-align: left;" onclick="downloadDomainJson('finishes')">
                    📁 <strong>finishes.json</strong><br><small>Platings &amp; backshell codes</small>
                </button>
                <button class="admin-btn-sm" style="padding: 10px; text-align: left;" onclick="downloadDomainJson('shells')">
                    📁 <strong>shells.json</strong><br><small>Shell styles &amp; prefixes</small>
                </button>
                <button class="admin-btn-sm" style="padding: 10px; text-align: left;" onclick="downloadDomainJson('series')">
                    📁 <strong>series.json</strong><br><small>Connector series registry</small>
                </button>
                <button class="admin-btn-sm" style="padding: 10px; text-align: left;" onclick="downloadDomainJson('accessories')">
                    📁 <strong>accessories.json</strong><br><small>Backshells, caps &amp; fasteners</small>
                </button>
            </div>
        </div>
    `;
}

/* --------------------------------------------------------------------------
   Validation & Export Utilities
   -------------------------------------------------------------------------- */
function runLiveValidation() {
    const box = document.getElementById('validationOutputBox');
    if (!box) return;
    box.style.display = 'block';

    const logs = [];
    let passed = 0;
    let failed = 0;

    function assert(desc, condition) {
        if (condition) {
            logs.push(`[PASS] ${desc}`);
            passed++;
        } else {
            logs.push(`[FAIL] ${desc}`);
            failed++;
        }
    }

    logs.push(`--- RUNNING SCHEMA INTEGRITY AUDIT [${new Date().toLocaleTimeString()}] ---`);

    // 1. Check Layouts
    const layouts = workingData.layouts || [];
    assert(`Master layouts count (${layouts.length} loaded, expected >= 50)`, layouts.length >= 50);

    // Duplicate arrangement check
    const arrSet = new Set();
    let hasDup = false;
    layouts.forEach(l => {
        if (arrSet.has(l.arrangement)) hasDup = true;
        arrSet.add(l.arrangement);
    });
    assert('No duplicate layout arrangements detected', !hasDup);

    // Pin count vs counts check
    let pinCountMismatch = 0;
    layouts.forEach(l => {
        const totalCounts = Object.values(l.counts || {}).reduce((s, c) => s + c, 0);
        if (l.pins && l.pins.length !== totalCounts) {
            pinCountMismatch++;
        }
    });
    assert(`All layout pin sequences match total cavity counts (${pinCountMismatch} mismatches)`, pinCountMismatch === 0);

    // 2. Check Finishes
    const finishes = workingData.finishes || [];
    assert(`Finishes count (${finishes.length} loaded, expected 7)`, finishes.length === 7);
    const missingBs = finishes.some(f => !f.backshellFinish);
    assert('All finishes have mapped AS85049 backshell finish codes', !missingBs);

    // 3. Check Tooling
    const shop = workingData.tooling.shopInventory || {};
    assert(`Crimp frames registered (${(shop.frames || []).length} frames)`, (shop.frames || []).length >= 2);
    assert(`Crimp positioners registered (${(shop.positioners || []).length} positioners)`, (shop.positioners || []).length >= 4);

    // Tooling matrix coverage
    const tm = workingData.tooling.toolingMatrix || {};
    const reqSizes = ['22D', '20', '16', '12', '8'];
    const missingToolSizes = reqSizes.filter(s => !tm[s] || !tm[s].P || !tm[s].S);
    assert(`Tooling matrix covers all standard contact sizes (${reqSizes.join(', ')})`, missingToolSizes.length === 0);

    logs.push(`--------------------------------------------------`);
    logs.push(`AUDIT COMPLETE: ${passed} passed, ${failed} failed.`);

    box.innerHTML = logs.map(l => {
        if (l.startsWith('[PASS]')) return `<span class="validation-pass">${escapeHtml(l)}</span>`;
        if (l.startsWith('[FAIL]')) return `<span class="validation-fail">${escapeHtml(l)}</span>`;
        return escapeHtml(l);
    }).join('\n');
}

function downloadDomainJson(domainName) {
    const data = workingData[domainName];
    if (!data) return alert(`No data available for domain: ${domainName}`);
    downloadJsonFile(data, `${domainName}.json`);
}

function downloadConsolidatedBundle() {
    downloadJsonFile(workingData, `connector_parts_bundle_${new Date().toISOString().slice(0, 10)}.json`);
}

function downloadJsonFile(obj, filename) {
    const jsonStr = JSON.stringify(obj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* --------------------------------------------------------------------------
   TAB 6: Revision History & Undo
   -------------------------------------------------------------------------- */
function renderHistoryTab(container) {
    const history = HistoryService.getHistory();

    container.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
                <div>
                    <h2 style="margin: 0 0 4px 0;">Revision History &amp; Audit Log</h2>
                    <p style="margin: 0; font-size: 0.85rem; opacity: 0.85;">
                        Every modification made through this administrative console is historized and can be undone or rolled back.
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-outline admin-btn-sm" onclick="exportHistoryLog()" style="padding: 7px 14px;">
                        📥 Export Audit Log
                    </button>
                    <button class="btn-primary admin-btn-sm admin-btn-danger" onclick="HistoryService.resetToFactoryDefaults()" style="padding: 7px 14px; background: #dc2626; border-color: #dc2626;">
                        🔄 Reset All to Factory Defaults
                    </button>
                </div>
            </div>

            ${history.length === 0 ? `
                <div style="text-align: center; padding: 48px 20px; color: var(--text-color); opacity: 0.65;">
                    <div style="font-size: 38px; margin-bottom: 10px;">📋</div>
                    <div style="font-weight: 600; font-size: 15px; margin-bottom: 6px;">No Changes Recorded Yet</div>
                    <div style="font-size: 13px;">Any additions, status updates, or removals in the inventory or layouts will appear here with an instant Undo option.</div>
                </div>
            ` : `
                <div class="history-list">
                    ${history.map(item => `
                        <div class="history-item">
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <span class="history-action-badge action-${item.action.toLowerCase()}">${escapeHtml(item.action)}</span>
                                <div>
                                    <div style="font-weight: 600; font-size: 0.95rem; color: var(--heading-color);">${escapeHtml(item.itemSummary)}</div>
                                    <div style="font-size: 0.8rem; opacity: 0.75; margin-top: 3px;">
                                        ${new Date(item.timestamp).toLocaleString()} • Category: <strong style="text-transform: capitalize;">${escapeHtml(item.category)}</strong>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button class="btn-outline admin-btn-sm" onclick="HistoryService.undoChange('${item.id}')" title="Undo this change and restore previous database state" style="font-weight: 600; padding: 6px 14px;">
                                    ↩️ Undo
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function exportHistoryLog() {
    const history = HistoryService.getHistory();
    downloadJsonFile({
        exportedAt: new Date().toISOString(),
        totalRevisions: history.length,
        revisions: history
    }, `admin_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('admin_working_data', JSON.stringify(workingData));
        alert('Working data successfully saved to browser local storage.');
    } catch (e) {
        alert('Failed to save to local storage: ' + e.message);
    }
}

function closeAllModals() {
    document.querySelectorAll('.admin-modal-overlay').forEach(m => m.classList.remove('active'));
}

function escapeHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

