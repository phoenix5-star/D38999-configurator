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

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupEventListeners();
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
        // Deep clone to isolate edits from raw service cache
        workingData = JSON.parse(JSON.stringify(DataService.rawData));
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
                <div style="display: flex; gap: 8px;">
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

function getStatusPillClass(status) {
    switch (status) {
        case 'In Shop': return 'status-in-shop';
        case 'Calibrated': return 'status-calibrated';
        case 'Out for Calibration': return 'status-calibration-due';
        case 'Missing / On Order': return 'status-missing';
        default: return 'status-in-shop';
    }
}

function cycleToolStatus(category, index) {
    const statuses = ['In Shop', 'Calibrated', 'Out for Calibration', 'Missing / On Order'];
    const tool = workingData.tooling.shopInventory[category][index];
    if (!tool) return;
    const currentIdx = statuses.indexOf(tool.status || 'In Shop');
    const nextIdx = (currentIdx + 1) % statuses.length;
    tool.status = statuses[nextIdx];
    renderActiveTab();
}

function deleteTool(category, index) {
    const tool = workingData.tooling.shopInventory[category][index];
    if (!tool) return;
    if (confirm(`Are you sure you want to remove "${tool.id} (${tool.name})" from shop inventory?`)) {
        workingData.tooling.shopInventory[category].splice(index, 1);
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
    document.getElementById('toolFormStatus').value = 'In Shop';
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
    document.getElementById('toolFormStatus').value = tool.status || 'In Shop';
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
        workingData.tooling.shopInventory[category][editIndex] = newObj;
    } else {
        workingData.tooling.shopInventory[category].push(newObj);
    }

    closeAllModals();
    renderActiveTab();
}

function cycleRemovalToolStatus(sz) {
    const statuses = ['In Shop', 'Calibrated', 'Out for Calibration', 'Missing / On Order'];
    const tool = workingData.tooling.insertionExtractionTools[sz];
    if (!tool) return;
    const currentIdx = statuses.indexOf(tool.status || 'In Shop');
    const nextIdx = (currentIdx + 1) % statuses.length;
    tool.status = statuses[nextIdx];
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
    document.getElementById('removalToolFormStatus').value = tool.status || 'In Shop';
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
                        <option value="deutsch_asl" ${layoutFilterSeries === 'deutsch_asl' ? 'selected' : ''}>Deutsch AutoSport ASL</option>
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
        workingData.layouts.splice(index, 1);
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
        workingData.layouts[editIndex] = newLayout;
    } else {
        workingData.layouts.push(newLayout);
    }

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

