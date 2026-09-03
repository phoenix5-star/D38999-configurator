// Configurator Metadata
const CONFIG_VERSION = "V001.2";

// Shop Tooling Inventory & Contact Ratings loaded via DataService
const SHOP_TOOLING = (typeof DataService !== 'undefined') ? DataService.getShopInventory() : { frames: ["AFM8", "AF8"], positioners: ["K40", "K42", "K13-1", "TH163"] };
const TOOLING_MATRIX = (typeof DataService !== 'undefined') ? DataService.getToolingMatrix() : {};
const M81969_TOOLS = (typeof DataService !== 'undefined') ? DataService.getInsertionExtractionTools() : {};
const contactRatings = (typeof DataService !== 'undefined') ? DataService.getContactRatings() : [];

// Map numerical shell sizes to MIL-DTL-38999 Series III letter codes
const SHELL_LETTER_CODES = {
    '9': 'A',
    '11': 'B',
    '13': 'C',
    '15': 'D',
    '17': 'E',
    '19': 'F',
    '21': 'G',
    '23': 'H',
    '25': 'J'
  };
  
  // Converts arrangement codes like "25-35" into "J35"
  function getInsertImageFilename(arrangement, shellSize) {
    if (!arrangement) return '';
    
    // Extract the layout suffix after the hyphen (e.g., "35" from "25-35")
    const layoutNumber = arrangement.includes('-') 
      ? arrangement.split('-')[1] 
      : arrangement;
  
    // Find letter code for shell size (fallback to shellSize if not mapped)
    const letterCode = SHELL_LETTER_CODES[shellSize] || '';
  
    return `${letterCode}${layoutNumber}.png`;
  }

// Master Parts Data loaded via DataService
const m39029DB = (typeof DataService !== 'undefined') ? DataService.getM39029DB() : {};
const masterLayouts = (typeof DataService !== 'undefined') ? DataService.getLayouts() : [];
const d38999ShellTypes = (typeof DataService !== 'undefined') ? DataService.getShells('d38999') : [];
const finishes = (typeof DataService !== 'undefined') ? DataService.getFinishes() : [];
const d38999Finishes = finishes.filter(f => f.code !== 'N');

const contactTypes = ["P", "S"];
const keyingPositions = ["N", "A", "B", "C", "D", "E"];

// Mapping of MIL-DTL-38999 connector finish codes to AS85049 / M85049 backshell finish codes
// (AS85049 specifies 'N' for Electroless Nickel, 'S' for Passivated Stainless Steel)
const CONNECTOR_TO_BACKSHELL_FINISH = {
    "W": "W", // Cadmium Olive Drab
    "F": "N", // Electroless Nickel (AS85049 uses 'N' instead of 'F')
    "Z": "Z", // Black Zinc Nickel
    "T": "T", // Nickel PTFE / Durmalon
    "K": "S", // Passivated Stainless Steel (AS85049 uses 'S' instead of 'K')
    "J": "W", // Composite OD Cad -> Aluminum AS85049 finish 'W'
    "M": "N"  // Composite Electroless Nickel -> Aluminum AS85049 finish 'N'
};

function getBackshellOptions(shellSize, finishCode) {
    const isAutoSport = ['06', '07', '08', '10', '12'].includes(String(shellSize));
    if (isAutoSport) {
        const sz = String(shellSize).padStart(2, '0');
        let straightPn = '202K121-25-0';
        let straightPrice = 12.50;
        let rightPn = '222K121-25-0';
        let rightPrice = 14.50;

        if (sz === '06') {
            straightPn = '204W221-25-0';
            straightPrice = 12.50;
            rightPn = '224W221-25-0';
            rightPrice = 14.50;
        } else if (['10', '12'].includes(sz)) {
            straightPn = '202K132-25-0';
            straightPrice = 14.50;
            rightPn = '222K132-25-0';
            rightPrice = 16.50;
        }
        return {
            "BOOT_STRAIGHT": {
                key: "BOOT_STRAIGHT",
                pn: straightPn,
                desc: `Raychem Straight Heat Shrink Boot (${straightPn})`,
                price: straightPrice
            },
            "BOOT_RA": {
                key: "BOOT_RA",
                pn: rightPn,
                desc: `Raychem 90° Right-Angle Heat Shrink Boot (${rightPn})`,
                price: rightPrice
            },
            "NONE": {
                key: "NONE",
                pn: "N/A",
                desc: "No Heat Shrink Boot / Direct Wire Exit",
                price: 0.00
            }
        };
    }
    const numShell = String(shellSize).padStart(2, '0');
    const szNum = parseInt(shellSize, 10);
    const bsFinish = CONNECTOR_TO_BACKSHELL_FINISH[finishCode] || finishCode;
    return {
        "M85049/38": {
            key: "M85049/38",
            pn: `M85049/38-${numShell}${bsFinish}`,
            desc: `M85049/38 Strain Relief Clamp (Size ${shellSize})`,
            price: 14.00 + (szNum * 0.85)
        },
        "M85049/88": {
            key: "M85049/88",
            pn: `M85049/88-${numShell}${bsFinish}02`,
            desc: `M85049/88 EMI/RFI Banding Backshell w/ Band (Size ${shellSize})`,
            price: 28.00 + (szNum * 1.10)
        },
        "M85049/49": {
            key: "M85049/49",
            pn: `M85049/49-2-${numShell}${bsFinish}`,
            desc: `M85049/49 Shrink Boot Adapter (Size ${shellSize})`,
            price: 18.00 + (szNum * 0.95)
        },
        "NONE": {
            key: "NONE",
            pn: "N/A",
            desc: "No Backshell / Box Mount Pass-through",
            price: 0.00
        }
    };
}

function getDustCapOptions(shellSize, finishCode, letterCode) {
    const isAutoSport = ['06', '07', '08', '10', '12'].includes(String(shellSize));
    if (isAutoSport) {
        const sz = String(shellSize).padStart(2, '0');
        return {
            plugCap: {
                pn: `AS-CAP-${sz}-PLUG`,
                desc: `AutoSport Protective Cap for Plug (Size ${sz})`,
                price: 9.50
            },
            receptacleCap: {
                pn: `AS-CAP-${sz}-REC`,
                desc: `AutoSport Protective Cap for Receptacle (Size ${sz})`,
                price: 9.50
            }
        };
    }
    const szNum = parseInt(shellSize, 10);
    const price = 15.00 + (szNum * 0.50);
    return {
        plugCap: {
            pn: `D38999/32${finishCode}${letterCode}N`,
            desc: `D38999/32 Protective Dust Cap for Plug (Size ${letterCode})`,
            price: price
        },
        receptacleCap: {
            pn: `D38999/33${finishCode}${letterCode}N`,
            desc: `D38999/33 Protective Dust Cap for Receptacle (Size ${letterCode})`,
            price: price
        }
    };
}

function renderM81969Html(contacts) {
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) return '';
    const sizes = [...new Set(contacts.map(c => c.size))];
    let items = sizes.map(sz => {
        let tool = M81969_TOOLS[sz];
        if (tool) {
            return `<li>Size ${sz}: <strong>${tool.toolPN}</strong> <span class="m81969-badge ${tool.badgeClass}">[${tool.colors}]</span> <span class="na-text">(${tool.desc})</span></li>`;
        }
        return `<li>Size ${sz}: Standard M81969 Tool</li>`;
    }).join('');

    return `
        <div class="tooling-ref-header">📌 M81969 Insertion / Removal Tool Reference:</div>
        <ul class="m81969-list">${items}</ul>
    `;
}

const database = [];

masterLayouts.forEach(layout => {
    if (layout.seriesId === 'deutsch_autosport') {
        let prefixFamily = 'AS';
        if (layout.shellSize === '06') prefixFamily = 'ASL';
        else if (layout.shellSize === '07') prefixFamily = 'ASM';

        const asStyles = [
            { type: 'Plug', asCode: '6', name: 'Free Plug' },
            { type: '2-Hole Flange Receptacle', asCode: '0', name: '2-Hole Flange Receptacle' },
            { type: 'Jam Nut Receptacle', asCode: '7', name: 'Jam Nut Receptacle' },
            { type: 'In-Line Receptacle', asCode: '1', name: 'In-Line Receptacle' },
            { type: '2-Hole Flange PCB Receptacle', asCode: '2', name: '2-Hole Flange PCB Receptacle' }
        ];

        const priceMap = { '06': 48.00, '07': 52.00, '08': 58.00, '10': 66.00, '12': 74.00 };
        const basePrice = priceMap[layout.shellSize] || 50.00;

        asStyles.forEach(st => {
            contactTypes.forEach(ct => {
                keyingPositions.forEach(ky => {
                    const asPN = `${prefixFamily}${st.asCode}${layout.arrangement}${ct}${ky}`;

                    database.push({
                        id: asPN,
                        seriesId: 'deutsch_autosport',
                        shellSize: layout.shellSize,
                        letterCode: '',
                        arrangement: layout.arrangement,
                        shellType: st.type,
                        finish: 'N',
                        contactType: ct,
                        keying: ky,
                        shellLabel: `Deutsch AutoSport Shell ${layout.shellSize} (${layout.arrangement})`,
                        milPN: asPN,
                        commPN: asPN,
                        asPN: asPN,
                        unitPriceConnector: basePrice,
                        flangeAcc: 'N/A (Integral Flange)',
                        unitPriceFlange: 0,
                        fastener: 'M3 Motorsport Stainless Fasteners',
                        fastenerUrl: 'https://www.mcmaster.com/',
                        fastenerQty: 2,
                        unitPriceFastener: 4.50,
                        diagramImg: '',
                        cutoutImg: '',
                        pins: layout.pins,
                        counts: layout.counts
                    });
                });
            });
        });
    } else {
        const numShell = layout.shellSize.padStart(2, '0');
        const szNum = parseInt(layout.shellSize, 10);
        
        let basePrice = 30.00 + (szNum * 3.50);
        let flangePrice = 9.00 + (szNum * 0.50);

        let fastenerDesc = "Flange Fasteners, Fillister Head 1\" (McMaster: 91737A313, Box of 100)";
        let fastenerUrl = "https://www.mcmaster.com/91737A313/";
        let fastenerPrice = 10.04;
        let fastenerQty = 4;

        d38999ShellTypes.forEach(st => {
            d38999Finishes.forEach(fin => {
                contactTypes.forEach(ct => {
                    keyingPositions.forEach(ky => {
                        const milPN = `D38999/${st.milCode}${fin.code}${layout.letterCode}${layout.arrangement.split('-')[1]}${ct}${ky}`;
                        const prefix = fin.isComp ? st.compPrefix : st.commPrefix;
                        const commPN = `${prefix}${fin.commCode}-${layout.arrangement}${ct}${ky !== 'N' ? ky : ''}`;

                        database.push({
                            id: `${milPN}_${commPN}`,
                            seriesId: 'd38999',
                            shellSize: layout.shellSize,
                            letterCode: layout.letterCode,
                            arrangement: layout.arrangement,
                            shellType: st.type,
                            finish: fin.code,
                            contactType: ct,
                            keying: ky,
                            shellLabel: `Shell ${layout.shellSize} (${layout.arrangement})`,
                            milPN: milPN,
                            commPN: commPN,
                            asPN: milPN,
                            unitPriceConnector: basePrice * fin.costMult,
                            flangeAcc: `M85049/95-${numShell}A (3/4 Perimeter Flange)`,
                            unitPriceFlange: flangePrice,
                            fastener: fastenerDesc,
                            fastenerUrl: fastenerUrl,
                            fastenerQty: fastenerQty,
                            unitPriceFastener: fastenerPrice,
                            diagramImg: `assets/inserts/${getInsertImageFilename(layout.arrangement, layout.shellSize)}`,
                            cutoutImg: `assets/cutouts/Shell${layout.shellSize}.png`,
                            pins: layout.pins,
                            counts: layout.counts
                        });
                    });
                });
            });
        });
    }
});

let currentCalculatedSolutions = [];
let projectLists = JSON.parse(localStorage.getItem('connector_projects')) || { "Default Project": [] };

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

let currentStandard = 'mil'; // 'mil', 'comm', or 'as'

document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

function switchStandardTab(standard) {
    currentStandard = standard;
    
    // Update Tab Buttons
    const milBtn = document.getElementById('tabMilBtn');
    const commBtn = document.getElementById('tabCommBtn');
    const asBtn = document.getElementById('tabAsBtn');
    if (milBtn) milBtn.classList.toggle('active', standard === 'mil');
    if (commBtn) commBtn.classList.toggle('active', standard === 'comm');
    if (asBtn) asBtn.classList.toggle('active', standard === 'as');

    updatePnStandardFilters();
    populateArrangementDropdown();

    if (currentCalculatedSolutions && currentCalculatedSolutions.length > 0) {
        calculate();
    }
}

function updatePnStandardFilters() {
    const shellTypeSelect = document.getElementById('filterShellType');
    const shellSizeSelect = document.getElementById('filterShellSize');
    const finishSelect = document.getElementById('filterFinish');
    if (!shellTypeSelect || !shellSizeSelect || !finishSelect) return;

    if (currentStandard === 'as') {
        shellTypeSelect.innerHTML = `
            <option value="ALL">All Shell Types (Plug, Flange, Jam Nut, In-Line)</option>
            <option value="Plug">Free Plug (ASL6 / ASM6 / AS6)</option>
            <option value="2-Hole Flange Receptacle">2-Hole Flange Receptacle (ASL0 / ASM0 / AS0)</option>
            <option value="Jam Nut Receptacle">Jam Nut Receptacle (ASL7 / ASM7 / AS7)</option>
            <option value="In-Line Receptacle">In-Line Receptacle (ASL1 / ASM1 / AS1)</option>
            <option value="2-Hole Flange PCB Receptacle">2-Hole Flange PCB Receptacle (ASL2 / ASM2 / AS2)</option>
        `;
        shellSizeSelect.innerHTML = `
            <option value="ALL">All Shell Sizes (06, 07, 08, 10, 12)</option>
            <option value="06">Size 06 (ASL Micro Lite)</option>
            <option value="07">Size 07 (ASM Mini)</option>
            <option value="08">Size 08 (AS Standard)</option>
            <option value="10">Size 10 (AS Standard)</option>
            <option value="12">Size 12 (AS Standard)</option>
        `;
        finishSelect.innerHTML = `
            <option value="ALL">All Finishes</option>
            <option value="N">Black Conductive / Electroless Nickel (N)</option>
        `;
    } else if (currentStandard === 'mil') {
        shellTypeSelect.innerHTML = `
            <option value="ALL">All Shell Types (D38999/20, /24, /26)</option>
            <option value="Plug">Straight Plug (D38999/26)</option>
            <option value="Wall Mount">Wall Mount Receptacle (D38999/20)</option>
            <option value="Jam Nut">Jam Nut Receptacle (D38999/24)</option>
        `;
        shellSizeSelect.innerHTML = `
            <option value="ALL">All Shell Sizes</option>
            <option value="9">Size 9 (A)</option>
            <option value="11">Size 11 (B)</option>
            <option value="13">Size 13 (C)</option>
            <option value="15">Size 15 (D)</option>
            <option value="17">Size 17 (E)</option>
            <option value="19">Size 19 (F)</option>
            <option value="21">Size 21 (G)</option>
            <option value="23">Size 23 (H)</option>
            <option value="25">Size 25 (J)</option>
        `;
        finishSelect.innerHTML = `
            <option value="ALL">All Finishes</option>
            <option value="W">Olive Drab Cadmium (W)</option>
            <option value="F">Electroless Nickel (F)</option>
            <option value="Z">Black Zinc Nickel (Z)</option>
            <option value="T">Nickel PTFE (Durmalon) (T)</option>
            <option value="K">Passivated Stainless Steel (K)</option>
            <option value="J">Olive Drab Cadmium Composite (J)</option>
            <option value="M">Electroless Nickel Composite (M)</option>
        `;
    } else {
        shellTypeSelect.innerHTML = `
            <option value="ALL">All Shell Types (TVS06, TVPS00, TVPS02, TVS07)</option>
            <option value="Plug">Straight Plug (TVS06 / CTV06)</option>
            <option value="Wall Mount">Wall Mount Receptacle (TVPS00 / CTVP00)</option>
            <option value="Box Mount">Box Mount Receptacle (TVPS02 / CTVP02)</option>
            <option value="Jam Nut">Jam Nut Receptacle (TVS07 / CTV07)</option>
        `;
        shellSizeSelect.innerHTML = `
            <option value="ALL">All Shell Sizes</option>
            <option value="9">Size 9 (A)</option>
            <option value="11">Size 11 (B)</option>
            <option value="13">Size 13 (C)</option>
            <option value="15">Size 15 (D)</option>
            <option value="17">Size 17 (E)</option>
            <option value="19">Size 19 (F)</option>
            <option value="21">Size 21 (G)</option>
            <option value="23">Size 23 (H)</option>
            <option value="25">Size 25 (J)</option>
        `;
        finishSelect.innerHTML = `
            <option value="ALL">All Finishes</option>
            <option value="W">Olive Drab Cadmium (W / RW)</option>
            <option value="F">Electroless Nickel (F / RF)</option>
            <option value="Z">Black Zinc Nickel (Z / RNF)</option>
            <option value="T">Nickel PTFE (Durmalon) (T)</option>
            <option value="K">Passivated Stainless Steel (K / RK)</option>
            <option value="J">Olive Drab Cadmium Composite (J)</option>
            <option value="M">Electroless Nickel Composite (M)</option>
        `;
    }
}

function resetConfiguration() {
    // 1. Reset decoder
    const decodeInput = document.getElementById('pnDecodeInput');
    if (decodeInput) decodeInput.value = '';
    const decodeResult = document.getElementById('pnDecodeResult');
    if (decodeResult) {
        decodeResult.style.display = 'none';
        decodeResult.innerHTML = '';
    }
    const applyBtn = document.getElementById('pnDecodeApplyBtn');
    if (applyBtn) applyBtn.disabled = true;

    // 2. Reset Mode
    document.getElementById('mode').value = 'size';

    // 3. Reset Filters
    document.getElementById('filterShellType').value = 'ALL';
    document.getElementById('filterFinish').value = 'ALL';
    document.getElementById('filterShellSize').value = 'ALL';
    populateArrangementDropdown();
    document.getElementById('filterArrangement').value = 'ALL';
    document.getElementById('filterContactType').value = 'ALL';
    document.getElementById('filterKeying').value = 'ALL';

    // 4. Reset Contact Requirements to default single group
    const groupsContainer = document.getElementById('groups');
    if (groupsContainer) {
        const defaultSize = currentStandard === 'as' ? '24' : '22D';
        let options = contactRatings.map(c => `<option value="${c.size}" ${c.size === defaultSize ? 'selected' : ''}>${c.label}</option>`).join('');
        groupsContainer.innerHTML = `
            <div class="row">
                <div class="val-container">
                    <label>Contact Size</label>
                    <select class="val">${options}</select>
                </div>
                <div style="flex: 1.2;">
                    <label>Contact Material / Type</label>
                    <select class="contact-material">
                        <option value="STD" selected>Standard Crimp (Copper Alloy - Gold Plated)</option>
                        <option value="TC_K">Thermocouple Type K (Alumel / Chromel)</option>
                        <option value="TC_J">Thermocouple Type J (Iron / Constantan)</option>
                        <option value="TC_E">Thermocouple Type E (Chromel / Constantan)</option>
                        <option value="TC_T">Thermocouple Type T (Copper / Constantan)</option>
                        <option value="COAX">Coax / Shielded Contact (Size 8/12/16)</option>
                    </select>
                </div>
                <div style="flex: 0.4;">
                    <label>Qty</label>
                    <input type="number" class="qty" value="4" placeholder="Qty">
                </div>
            </div>
        `;
    }

    // 5. Reset Std Contacts checkbox
    const stdCheckbox = document.getElementById('includeStdContacts');
    if (stdCheckbox) stdCheckbox.checked = false;

    // 6. Clear calculated results container
    currentCalculatedSolutions = [];
    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) resultsContainer.innerHTML = '';
}

function init() {
    initTheme();
    updatePnStandardFilters();
    populateArrangementDropdown();
    updateListDropdown();
    loadActiveList();
    
    document.getElementById('mode').addEventListener('change', toggleInputMode);
    toggleInputMode();
}

function populateArrangementDropdown() {
    const select = document.getElementById('filterArrangement');
    const selectedShellSize = document.getElementById('filterShellSize').value;
    
    select.innerHTML = '<option value="ALL">All Arrangements</option>';

    masterLayouts.forEach(layout => {
        const isAutoSport = layout.seriesId === 'deutsch_autosport';
        if (currentStandard === 'as' && !isAutoSport) return;
        if ((currentStandard === 'mil' || currentStandard === 'comm') && isAutoSport) return;

        if (selectedShellSize === "ALL" || layout.shellSize === selectedShellSize) {
            let descParts = Object.entries(layout.counts).map(([sz, qty]) => `${qty}x Size ${sz}`).join(', ');
            let opt = document.createElement('option');
            opt.value = layout.arrangement;
            opt.textContent = `${layout.arrangement} (${descParts})`;
            select.appendChild(opt);
        }
    });
}

function filterArrangementDropdown() {
    populateArrangementDropdown();
}

// Map letter codes to shell sizes
const LETTER_CODE_TO_SHELL_SIZE = {
    'A': '9', 'B': '11', 'C': '13', 'D': '15', 'E': '17', 'F': '19', 'G': '21', 'H': '23', 'J': '25'
};

// Map Mil slash codes to shell types
const MIL_SLASH_TO_SHELL_TYPE = {
    '20': 'Wall Mount',
    '22': 'Box Mount',
    '24': 'Jam Nut',
    '26': 'Plug'
};

/**
 * Delegates part number parsing to DecoderEngine.
 */
function parsePartNumber(input) {
    if (typeof DecoderEngine !== 'undefined') {
        return DecoderEngine.parse(input);
    }
    return null;
}

function liveDecodePN(val) {
    const resultDiv = document.getElementById('pnDecodeResult');
    const applyBtn = document.getElementById('pnDecodeApplyBtn');
    
    if (!val || !val.trim()) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
        applyBtn.disabled = true;
        return;
    }

    const decoded = parsePartNumber(val);
    if (!decoded || decoded.confidence === 0) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<span style="color: #e53e3e;">Could not parse part number. Try format like <code>26WE35PN</code>, <code>TVS06RF-11-35P</code>, or <code>ASL606-05PN</code>.</span>`;
        applyBtn.disabled = true;
        return;
    }

    applyBtn.disabled = false;
    resultDiv.style.display = 'block';

    let chipsHtml = [];
    if (decoded.standard) {
        let stdLabel = decoded.standard === 'as' ? 'Deutsch AutoSport' : (decoded.standard === 'mil' ? 'Military' : 'Commercial');
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Standard:</strong> ${stdLabel}</span>`);
    }
    if (decoded.shellType) {
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Shell Type:</strong> ${decoded.shellType}</span>`);
    }
    if (decoded.finish) {
        let fObj = finishes.find(f => f.code === decoded.finish);
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Finish:</strong> ${decoded.finish}${fObj ? ` (${fObj.name})` : ''}</span>`);
    }
    if (decoded.shellSize) {
        let letter = SHELL_LETTER_CODES[decoded.shellSize];
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Shell Size:</strong> ${decoded.shellSize}${letter ? ` (${letter})` : ''}</span>`);
    }
    if (decoded.arrangement) {
        let lObj = masterLayouts.find(l => l.arrangement === decoded.arrangement);
        let countDesc = lObj ? Object.entries(lObj.counts).map(([sz, q]) => `${q}x Size ${sz}`).join(', ') : '';
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Layout:</strong> ${decoded.arrangement}${countDesc ? ` [${countDesc}]` : ''}</span>`);
    }
    if (decoded.contactType) {
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Contact:</strong> ${decoded.contactType === 'P' ? 'Pin (P)' : 'Socket (S)'}</span>`);
    }
    if (decoded.keying) {
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Keying:</strong> ${decoded.keying}</span>`);
    }

    resultDiv.innerHTML = `
        <div class="pn-decode-row">
            <span style="font-weight: 600; white-space: nowrap; color: var(--heading-color); margin-right: 4px;">Decoded:</span>
            <div class="pn-decode-chips">${chipsHtml.join('')}</div>
        </div>
    `;
}

function applyDecodedPN() {
    const input = document.getElementById('pnDecodeInput');
    if (!input || !input.value.trim()) return;

    const decoded = parsePartNumber(input.value);
    if (!decoded || decoded.confidence === 0) return;

    // Apply Standard
    if (decoded.standard) {
        switchStandardTab(decoded.standard);
    }

    // Apply Shell Type
    if (decoded.shellType) {
        document.getElementById('filterShellType').value = decoded.shellType;
    }

    // Apply Finish
    if (decoded.finish) {
        document.getElementById('filterFinish').value = decoded.finish;
    }

    // Apply Shell Size
    if (decoded.shellSize) {
        document.getElementById('filterShellSize').value = decoded.shellSize;
        populateArrangementDropdown();
    }

    // Apply Arrangement
    if (decoded.arrangement) {
        document.getElementById('filterArrangement').value = decoded.arrangement;

        // Automatically configure contact groups to match the decoded layout
        let lObj = masterLayouts.find(l => l.arrangement === decoded.arrangement);
        if (lObj) {
            document.getElementById('mode').value = 'size';
            const groupsContainer = document.getElementById('groups');
            groupsContainer.innerHTML = '';
            
            Object.entries(lObj.counts).forEach(([size, count]) => {
                const row = document.createElement('div');
                row.className = 'row';
                let options = contactRatings.map(c => `<option value="${c.size}" ${c.size === size ? 'selected' : ''}>${c.label}</option>`).join('');
                row.innerHTML = `
                    <div class="val-container">
                        <label>Contact Size</label>
                        <select class="val">${options}</select>
                    </div>
                    <div style="flex: 1.2;">
                        <label>Contact Material / Type</label>
                        <select class="contact-material">
                            <option value="STD" selected>Standard Crimp (Copper Alloy - Gold Plated)</option>
                            <option value="TC_K">Thermocouple Type K (Alumel / Chromel)</option>
                            <option value="TC_J">Thermocouple Type J (Iron / Constantan)</option>
                            <option value="TC_E">Thermocouple Type E (Chromel / Constantan)</option>
                            <option value="TC_T">Thermocouple Type T (Copper / Constantan)</option>
                            <option value="COAX">Coax / Shielded Contact (Size 8/12/16)</option>
                        </select>
                    </div>
                    <div style="flex: 0.4;">
                        <label>Qty</label>
                        <input type="number" class="qty" value="${count}" placeholder="Qty">
                    </div>
                    <div style="flex: 0.2;">
                        <label>&nbsp;</label>
                        <button type="button" class="btn-red" onclick="this.parentElement.parentElement.remove()">X</button>
                    </div>
                `;
                groupsContainer.appendChild(row);
            });
        }
    }

    // Apply Contact Type
    if (decoded.contactType) {
        document.getElementById('filterContactType').value = decoded.contactType;
    }

    // Apply Keying
    if (decoded.keying) {
        document.getElementById('filterKeying').value = decoded.keying;
    }

    // Execute calculate
    calculate();
}

function toggleInputMode() {
    const mode = document.getElementById('mode').value;
    const rows = document.querySelectorAll('#groups .row');

    rows.forEach(row => {
        const valContainer = row.querySelector('.val-container');
        if (mode === 'amps') {
            valContainer.innerHTML = `<label>Current Load</label><input type="number" class="val" value="10" placeholder="Amps (e.g. 10)">`;
        } else {
            let options = contactRatings.map(c => `<option value="${c.size}">${c.label}</option>`).join('');
            valContainer.innerHTML = `<label>Contact Size</label><select class="val">${options}</select>`;
        }
    });
}

function addGroup() {
    const mode = document.getElementById('mode').value;
    const container = document.getElementById('groups');
    const row = document.createElement('div');
    row.className = 'row';

    let inputHtml = mode === 'amps' 
        ? `<label>Current Load</label><input type="number" class="val" value="5" placeholder="Amps">`
        : `<label>Contact Size</label><select class="val">${contactRatings.map(c => `<option value="${c.size}">${c.label}</option>`).join('')}</select>`;

    row.innerHTML = `
        <div class="val-container">${inputHtml}</div>
        <div style="flex:1.2;">
            <label>Contact Material / Type</label>
            <select class="contact-material">
                <option value="STD">Standard Crimp (Copper Alloy - Gold Plated)</option>
                <option value="TC_K">Thermocouple Type K (Alumel / Chromel)</option>
                <option value="TC_J">Thermocouple Type J (Iron / Constantan)</option>
                <option value="TC_E">Thermocouple Type E (Chromel / Constantan)</option>
                <option value="TC_T">Thermocouple Type T (Copper / Constantan)</option>
                <option value="COAX">Coax / Shielded Contact (Size 8/12/16)</option>
            </select>
        </div>
        <div style="flex:0.4;"><label>Qty</label><input type="number" class="qty" value="2" placeholder="Qty"></div>
        <div style="flex:0.2;"><label>&nbsp;</label><button type="button" class="btn-red" onclick="this.parentElement.parentElement.remove()">X</button></div>
    `;
    container.appendChild(row);
}

function resolveGroupContacts(groupSpecs, gender) {
    if (typeof ConfiguratorEngine !== 'undefined') {
        return ConfiguratorEngine.resolveGroupContacts(groupSpecs, gender, m39029DB);
    }
    return [];
}

function getToolingStatus(contacts) {
    if (typeof ToolingEngine !== 'undefined') {
        return ToolingEngine.getToolingStatus(contacts, SHOP_TOOLING, TOOLING_MATRIX);
    }
    return { results: [], missingTools: [] };
}

function getMatingConnector(primary, pnType, targetShellType) {
    if (typeof ConfiguratorEngine !== 'undefined') {
        return ConfiguratorEngine.getMatingConnector(primary, pnType, targetShellType, database);
    }
    return null;
}

function calculate() {
    const mode = document.getElementById('mode').value;
    const pnType = currentStandard;
    
    const filterShellType = document.getElementById('filterShellType').value;
    const filterFinish = document.getElementById('filterFinish').value;
    const filterShellSize = document.getElementById('filterShellSize').value;
    const filterArrangement = document.getElementById('filterArrangement').value;
    const filterContactType = document.getElementById('filterContactType').value;
    const filterKeying = document.getElementById('filterKeying').value;

    const valInputs = document.querySelectorAll('#groups .val');
    const matInputs = document.querySelectorAll('#groups .contact-material');
    const qtyInputs = document.querySelectorAll('#groups .qty');

    let reqPins = {};
    let groupSpecs = [];
    let invalid = false;

    valInputs.forEach((inp, idx) => {
        let qty = parseInt(qtyInputs[idx].value, 10);
        if (isNaN(qty) || qty <= 0) return;

        let matType = matInputs[idx].value;
        let sz = String(inp.value).trim();

        if (mode === 'amps') {
            let amps = parseFloat(inp.value);
            let match = contactRatings.find(c => amps <= c.maxAmps);
            if (match) {
                sz = String(match.size);
            } else {
                invalid = true;
                return;
            }
        }
        reqPins[sz] = (reqPins[sz] || 0) + qty;
        groupSpecs.push({ size: sz, matType: matType, qty: qty });
    });

    if (invalid) {
        alert('One or more inputs exceed maximum contact ampacity (46A).');
        return;
    }

    let matches = database.filter(entry => {
        if (pnType === 'as') {
            if (entry.seriesId !== 'deutsch_autosport') return false;
        } else {
            if (entry.seriesId === 'deutsch_autosport') return false;
            if (pnType === 'mil' && entry.shellType === 'Box Mount') return false;
        }
        if (filterShellType !== "ALL" && entry.shellType !== filterShellType) return false;
        if (filterFinish !== "ALL" && entry.finish !== filterFinish) return false;
        if (filterShellSize !== "ALL" && entry.shellSize !== filterShellSize) return false;
        if (filterArrangement !== "ALL" && entry.arrangement !== filterArrangement) return false;
        if (filterContactType !== "ALL" && entry.contactType !== filterContactType) return false;
        if (filterKeying !== "ALL" && entry.keying !== filterKeying) return false;

        for (let sz in reqPins) {
            if (!entry.counts[sz] || entry.counts[sz] < reqPins[sz]) return false;
        }
        return true;
    });

    let summaryText = Object.entries(reqPins).map(([sz, qty]) => {
        let r = contactRatings.find(c => c.size === sz);
        return `${qty}x ${r ? r.label : 'Size ' + sz}`;
    }).join(', ');

    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    if (matches.length > 0) {
        currentCalculatedSolutions = matches.map(match => {
            let activePN = pnType === 'mil' ? match.milPN : (pnType === 'comm' ? match.commPN : (match.asPN || match.milPN));
            let isAutoSport = pnType === 'as' || match.seriesId === 'deutsch_autosport';
            let defaultMatingShell = match.shellType === 'Plug' ? (isAutoSport ? '2-Hole Flange Receptacle' : 'Wall Mount') : 'Plug';
            let mating = getMatingConnector(match, pnType, defaultMatingShell);

            let priContacts = resolveGroupContacts(groupSpecs, match.contactType);
            let matContacts = mating ? resolveGroupContacts(groupSpecs, mating.contactType) : [];

            let defaultBackshell = isAutoSport ? 'BOOT_STRAIGHT' : (match.shellType === 'Box Mount' ? 'NONE' : 'M85049/38');
            let defaultMatBackshell = mating ? (isAutoSport ? 'BOOT_STRAIGHT' : (mating.shellType === 'Box Mount' ? 'NONE' : 'M85049/38')) : 'NONE';

            return { 
                primary: { 
                    ...match, 
                    activePN, 
                    summary: summaryText, 
                    contacts: priContacts,
                    selectedBackshell: defaultBackshell,
                    includeDustCap: false
                }, 
                mating: mating ? { 
                    ...mating, 
                    contacts: matContacts,
                    selectedBackshell: defaultMatBackshell,
                    includeDustCap: false
                } : null,
                groupSpecs: groupSpecs,
                pnType: pnType
            };
        });

        renderSolutionCards();
    } else {
        alert('No matching configurations found for these filter settings and pin requirements.');
    }
}

function renderSolutionCards() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = `<h3 style="color:var(--heading-color); margin-bottom: 15px;">Found ${currentCalculatedSolutions.length} Matching Mating Solution Pair(s)</h3>`;
    resultsContainer.appendChild(headerDiv);

    currentCalculatedSolutions.forEach((pair, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'solution-pair-wrapper';
        wrapper.id = `solution-pair-${index}`;
        wrapper.innerHTML = renderSolutionPairHTML(pair, index);
        resultsContainer.appendChild(wrapper);
    });
}

function renderSolutionPairHTML(pair, index) {
    const pri = pair.primary;
    const mat = pair.mating;
    const pnType = pair.pnType;

    // Primary accessories
    const priBackshellOpts = getBackshellOptions(pri.shellSize, pri.finish);
    const priSelectedBs = priBackshellOpts[pri.selectedBackshell] || priBackshellOpts["NONE"];
    const priDustCaps = getDustCapOptions(pri.shellSize, pri.finish, pri.letterCode);
    const priCap = pri.shellType === 'Plug' ? priDustCaps.plugCap : priDustCaps.receptacleCap;

    const isAutoSport = pnType === 'as' || ['06','07','08','10','12'].includes(pri.shellSize);

    const priIsFlange = pri.shellType === '2-Hole Flange Receptacle' || pri.shellType === '2-Hole Flange PCB Receptacle' || pri.shellType === 'Wall Mount';
    const priIsWall = pri.shellType === 'Wall Mount';
    const priIsBox = pri.shellType === 'Box Mount';

    let priFlangeHtml = isAutoSport 
        ? (priIsFlange ? `<span class="na-text">Integral 2-Hole Flange on Shell</span>` : `<span class="na-text">N/A (Not Required for Shell Type)</span>`)
        : (priIsWall ? `${pri.flangeAcc} (Est. $${pri.unitPriceFlange.toFixed(2)})` : `<span class="na-text">N/A (Not Required for Shell Type)</span>`);
    let priFastenerHtml = isAutoSport
        ? (priIsFlange ? `2x M3 / 4-40 Stainless Socket Head Screws (@ $4.50/pair)` : `<span class="na-text">N/A (Not Required for Shell Type)</span>`)
        : ((priIsWall || priIsBox) ? `4x <a href="https://www.mcmaster.com/91737A313/" target="_blank">91737A313</a> - Fillister Head 1" (Sold in Box of 100 @ $10.04 - covers up to 25 connectors)` : `<span class="na-text">N/A (Not Required for Shell Type)</span>`);

    let priContactListHtml = pri.contacts.map(c => 
        `<li><strong>${c.qty}x ${c.pn}</strong> - ${c.desc} (Est. $${c.price.toFixed(2)}/ea) ${c.isStd ? '<span class="na-text">(Standard Contact)</span>' : '<span style="color:#d97706; font-weight:bold;">(Specialty TC/Coax Contact)</span>'}</li>`
    ).join('');

    const priTooling = getToolingStatus(pri.contacts);
    let priToolHtml = priTooling.results.map(t => 
        `<li>Size ${t.contactSize} ${t.gender}: <strong>${t.frame}</strong> w/ <strong>${t.positioner}</strong> (${t.setting}) ${t.available ? '✅' : '⚠️ <span style="color:var(--alert-text);font-weight:bold;">[Tooling Missing]</span>'}</li>`
    ).join('');
    let priToolAlert = priTooling.missingTools.length > 0 
        ? `<div class="tool-alert">⚠️ <strong>Missing Tooling Alert:</strong> Shop inventory lacks required tooling for ${priTooling.missingTools.map(m => `Size ${m.contactSize} ${m.gender} (${m.frame} + ${m.positioner})`).join(', ')}.</div>`
        : '';
    let priM81969Html = renderM81969Html(pri.contacts);

    // Mating accessories
    let matBackshellOpts = mat ? getBackshellOptions(mat.shellSize, mat.finish) : {};
    let matSelectedBs = mat ? (matBackshellOpts[mat.selectedBackshell] || matBackshellOpts["NONE"]) : { pn: "N/A", price: 0 };
    let matDustCaps = mat ? getDustCapOptions(mat.shellSize, mat.finish, mat.letterCode) : null;
    let matCap = (mat && matDustCaps) ? (mat.shellType === 'Plug' ? matDustCaps.plugCap : matDustCaps.receptacleCap) : { pn: "N/A", price: 0 };

    const matIsFlange = mat ? (mat.shellType === '2-Hole Flange Receptacle' || mat.shellType === '2-Hole Flange PCB Receptacle' || mat.shellType === 'Wall Mount') : false;
    const matIsWall = mat ? mat.shellType === 'Wall Mount' : false;
    const matIsBox = mat ? mat.shellType === 'Box Mount' : false;

    let matFlangeHtml = isAutoSport 
        ? (matIsFlange ? `<span class="na-text">Integral 2-Hole Flange on Shell</span>` : `<span class="na-text">N/A (Not Required for Shell Type)</span>`)
        : (matIsWall ? `${mat.flangeAcc} (Est. $${mat.unitPriceFlange.toFixed(2)})` : `<span class="na-text">N/A (Not Required for Shell Type)</span>`);
    let matFastenerHtml = isAutoSport
        ? (matIsFlange ? `2x M3 / 4-40 Stainless Socket Head Screws (@ $4.50/pair)` : `<span class="na-text">N/A (Not Required for Shell Type)</span>`)
        : ((matIsWall || matIsBox) ? `4x <a href="https://www.mcmaster.com/91737A313/" target="_blank">91737A313</a> - Fillister Head 1" (Sold in Box of 100 @ $10.04 - covers up to 25 connectors)` : `<span class="na-text">N/A (Not Required for Shell Type)</span>`);

    let matContactListHtml = mat ? mat.contacts.map(c => 
        `<li><strong>${c.qty}x ${c.pn}</strong> - ${c.desc} (Est. $${c.price.toFixed(2)}/ea) ${c.isStd ? '<span class="na-text">(Standard Contact)</span>' : '<span style="color:#d97706; font-weight:bold;">(Specialty TC/Coax Contact)</span>'}</li>`
    ).join('') : '<li>N/A</li>';

    const matTooling = mat ? getToolingStatus(mat.contacts) : { results: [], missingTools: [] };
    let matToolHtml = matTooling.results.map(t => 
        `<li>Size ${t.contactSize} ${t.gender}: <strong>${t.frame}</strong> w/ <strong>${t.positioner}</strong> (${t.setting}) ${t.available ? '✅' : '⚠️ <span style="color:var(--alert-text);font-weight:bold;">[Tooling Missing]</span>'}</li>`
    ).join('');
    let matToolAlert = matTooling.missingTools.length > 0 
        ? `<div class="tool-alert">⚠️ <strong>Missing Tooling Alert:</strong> Shop inventory lacks required tooling for ${matTooling.missingTools.map(m => `Size ${m.contactSize} ${m.gender} (${m.frame} + ${m.positioner})`).join(', ')}.</div>`
        : '';
    let matM81969Html = mat ? renderM81969Html(mat.contacts) : '';

    // Mating shell style selector HTML
    let matingShellSelectorHtml = '';
    const matContactTypeStr = mat ? (mat.contactType === 'P' ? 'Pins' : 'Sockets') : 'N/A';
    if (pri.shellType === 'Plug') {
        if (pnType === 'as') {
            matingShellSelectorHtml = `
                <div style="margin-bottom: 8px;">
                    <label for="matingShellSelect_${index}"><strong>Mating Shell Style:</strong></label>
                    <select id="matingShellSelect_${index}" class="mating-shell-select" onchange="changeMatingShellType(${index}, this.value)">
                        <option value="2-Hole Flange Receptacle" ${mat && mat.shellType === '2-Hole Flange Receptacle' ? 'selected' : ''}>2-Hole Flange Receptacle (ASL0 / ASM0 / AS0)</option>
                        <option value="Jam Nut Receptacle" ${mat && mat.shellType === 'Jam Nut Receptacle' ? 'selected' : ''}>Jam Nut Receptacle (ASL7 / ASM7 / AS7)</option>
                        <option value="In-Line Receptacle" ${mat && mat.shellType === 'In-Line Receptacle' ? 'selected' : ''}>In-Line Receptacle (ASL1 / ASM1 / AS1)</option>
                    </select>
                </div>
                <p><strong>Contact Type:</strong> ${matContactTypeStr} | <strong>Keying:</strong> ${mat ? mat.keying : 'N/A'}</p>
            `;
        } else if (pnType === 'mil') {
            matingShellSelectorHtml = `
                <div style="margin-bottom: 8px;">
                    <label for="matingShellSelect_${index}"><strong>Mating Shell Style:</strong></label>
                    <select id="matingShellSelect_${index}" class="mating-shell-select" onchange="changeMatingShellType(${index}, this.value)">
                        <option value="Wall Mount" ${mat && mat.shellType === 'Wall Mount' ? 'selected' : ''}>Wall Mount Receptacle (D38999/20)</option>
                        <option value="Jam Nut" ${mat && mat.shellType === 'Jam Nut' ? 'selected' : ''}>Jam Nut Receptacle (D38999/24)</option>
                    </select>
                </div>
                <p><strong>Contact Type:</strong> ${matContactTypeStr} | <strong>Keying:</strong> ${mat ? mat.keying : 'N/A'}</p>
            `;
        } else {
            matingShellSelectorHtml = `
                <div style="margin-bottom: 8px;">
                    <label for="matingShellSelect_${index}"><strong>Mating Shell Style:</strong></label>
                    <select id="matingShellSelect_${index}" class="mating-shell-select" onchange="changeMatingShellType(${index}, this.value)">
                        <option value="Wall Mount" ${mat && mat.shellType === 'Wall Mount' ? 'selected' : ''}>Wall Mount Receptacle (TVPS00 / CTVP00)</option>
                        <option value="Box Mount" ${mat && mat.shellType === 'Box Mount' ? 'selected' : ''}>Box Mount Receptacle (TVPS02 / CTVP02)</option>
                        <option value="Jam Nut" ${mat && mat.shellType === 'Jam Nut' ? 'selected' : ''}>Jam Nut Receptacle (TVS07 / CTV07)</option>
                    </select>
                </div>
                <p><strong>Contact Type:</strong> ${matContactTypeStr} | <strong>Keying:</strong> ${mat ? mat.keying : 'N/A'}</p>
            `;
        }
    } else {
        matingShellSelectorHtml = `<p><strong>Shell Type:</strong> ${mat ? mat.shellType : 'N/A'} (Mates with Receptacle) | <strong>Contact Type:</strong> ${matContactTypeStr} | <strong>Keying:</strong> ${mat ? mat.keying : 'N/A'}</p>`;
    }

    return `
        <h3 style="margin-bottom: 12px; color: var(--heading-color);">Solution Pair #${index + 1}</h3>
        <div class="solution-grid">
            <div class="solution-card primary-card">
                <h4 style="margin-top:0; color:var(--accent);">Primary Connector: ${pri.activePN}</h4>
                <p><strong>Shell Type:</strong> ${pri.shellType} | <strong>Contact Type:</strong> ${pri.contactType === 'P' ? 'Pins' : 'Sockets'} | <strong>Keying:</strong> ${pri.keying}</p>
                <p><strong>Arrangement:</strong> ${pri.shellLabel}</p>
                
                <div class="diagram-section">
                    <div class="diagram-box">
                        <label>Insert Diagram:</label>
                        <a href="javascript:void(0)" onclick="openImageModal('${pri.diagramImg}', 'Insert Diagram - ${pri.shellLabel}')"><img class="preview-img" src="${pri.diagramImg}" alt="Insert Diagram" onerror="this.parentElement.style.display='none'"></a>
                    </div>
                    ${pri.shellType !== 'Plug' ? `
                    <div class="diagram-box">
                        <label>Panel Cutout:</label>
                        <a href="javascript:void(0)" onclick="openImageModal('${pri.cutoutImg}', 'Panel Cutout - Shell ${pri.shellSize}')"><img class="preview-img" src="${pri.cutoutImg}" alt="Panel Cutout" onerror="this.parentElement.style.display='none'"></a>
                    </div>` : ''}
                </div>

                <p><strong>Connector P/N:</strong> ${pri.activePN} (Est. $${pri.unitPriceConnector.toFixed(2)})</p>

                <div class="accessory-section">
                    <div class="accessory-row">
                        <label><strong>${isAutoSport ? 'Heat Shrink Boot:' : 'Backshell Style:'}</strong></label>
                        ${priIsBox ? `<span class="box-mount-notice">Box Mount (No rear accessory threads)</span>` : (isAutoSport ? `
                        <select onchange="updateCardBackshell(${index}, true, this.value)">
                            <option value="BOOT_STRAIGHT" ${pri.selectedBackshell === 'BOOT_STRAIGHT' ? 'selected' : ''}>Straight Boot (${priBackshellOpts['BOOT_STRAIGHT'] ? priBackshellOpts['BOOT_STRAIGHT'].pn : '202K121'}) - $${priBackshellOpts['BOOT_STRAIGHT'] ? priBackshellOpts['BOOT_STRAIGHT'].price.toFixed(2) : '12.50'}</option>
                            <option value="BOOT_RA" ${pri.selectedBackshell === 'BOOT_RA' ? 'selected' : ''}>90° Right-Angle Boot (${priBackshellOpts['BOOT_RA'] ? priBackshellOpts['BOOT_RA'].pn : '222K121'}) - $${priBackshellOpts['BOOT_RA'] ? priBackshellOpts['BOOT_RA'].price.toFixed(2) : '14.50'}</option>
                            <option value="NONE" ${pri.selectedBackshell === 'NONE' ? 'selected' : ''}>None (No Boot) - $0.00</option>
                        </select>` : `
                        <select onchange="updateCardBackshell(${index}, true, this.value)">
                            <option value="M85049/38" ${pri.selectedBackshell === 'M85049/38' ? 'selected' : ''}>Strain Relief (M85049/38) - $${priBackshellOpts['M85049/38'].price.toFixed(2)}</option>
                            <option value="M85049/88" ${pri.selectedBackshell === 'M85049/88' ? 'selected' : ''}>EMI Banding (M85049/88) - $${priBackshellOpts['M85049/88'].price.toFixed(2)}</option>
                            <option value="M85049/49" ${pri.selectedBackshell === 'M85049/49' ? 'selected' : ''}>Shrink Boot (M85049/49) - $${priBackshellOpts['M85049/49'].price.toFixed(2)}</option>
                            <option value="NONE" ${pri.selectedBackshell === 'NONE' ? 'selected' : ''}>None (No Backshell) - $0.00</option>
                        </select>`)}
                    </div>
                    ${(!priIsBox && pri.selectedBackshell !== 'NONE') ? `<p style="margin: 4px 0 8px 0; font-size: 12px;"><strong>Active ${isAutoSport ? 'Boot' : 'Backshell'}:</strong> ${priSelectedBs.pn} (Est. $${priSelectedBs.price.toFixed(2)})</p>` : ''}
                    
                    <div class="checkbox-row" style="margin-top: 6px;">
                        <input type="checkbox" id="priCap_${index}" ${pri.includeDustCap ? 'checked' : ''} onchange="updateCardDustCap(${index}, true, this.checked)">
                        <label for="priCap_${index}" style="font-weight: normal; font-size: 12px; margin-bottom: 0;">
                            Include Protective Dust Cap (${priCap.pn} - Est. $${priCap.price.toFixed(2)})
                        </label>
                    </div>
                </div>

                <p><strong>Flange Accessory:</strong> ${priFlangeHtml}</p>
                <p><strong>Flange Fasteners:</strong> ${priFastenerHtml}</p>
                
                <p style="margin-bottom: 2px;"><strong>Required Contacts:</strong></p>
                <ul class="contact-list">${priContactListHtml}</ul>
                
                <div class="tooling-block">
                    <p style="margin-top:0; margin-bottom:4px;"><strong>Crimp Tooling Setup:</strong></p>
                    <ul class="tooling-list">${priToolHtml}</ul>
                    ${priToolAlert}
                    ${priM81969Html}
                </div>

                <div class="link-group" style="margin-top: 10px;">
                    <label>Distributor Live Stock:</label>
                    <a href="https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(pri.activePN)}" target="_blank">DigiKey ↗</a>
                    <a href="https://www.mouser.com/c/?q=${encodeURIComponent(pri.activePN)}" target="_blank">Mouser ↗</a>
                    <a href="https://www.newark.com/search?st=${encodeURIComponent(pri.activePN)}" target="_blank">Newark ↗</a>
                </div>
            </div>

            <div class="solution-card mating-card">
                <h4 style="margin-top:0; color:var(--accent);">Mating Connector: ${mat ? mat.activePN : 'N/A'}</h4>
                ${matingShellSelectorHtml}
                <p><strong>Arrangement:</strong> ${mat ? mat.shellLabel : 'N/A'}</p>
                
                <div class="diagram-section">
                    <div class="diagram-box">
                        <label>Insert Diagram:</label>
                        <a href="javascript:void(0)" onclick="openImageModal('${mat ? mat.diagramImg : ''}', 'Insert Diagram - ${mat ? mat.shellLabel : ''}')"><img class="preview-img" src="${mat ? mat.diagramImg : ''}" alt="Mating Insert Diagram" onerror="this.parentElement.style.display='none'"></a>
                    </div>
                    ${mat && mat.shellType !== 'Plug' ? `
                    <div class="diagram-box">
                        <label>Panel Cutout:</label>
                        <a href="javascript:void(0)" onclick="openImageModal('${mat ? mat.cutoutImg : ''}', 'Panel Cutout - Shell ${mat ? mat.shellSize : ''}')"><img class="preview-img" src="${mat ? mat.cutoutImg : ''}" alt="Panel Cutout" onerror="this.parentElement.style.display='none'"></a>
                    </div>` : ''}
                </div>

                <p><strong>Connector P/N:</strong> ${mat ? mat.activePN : 'N/A'} (Est. $${mat ? mat.unitPriceConnector.toFixed(2) : '0.00'})</p>

                ${mat ? `
                <div class="accessory-section">
                    <div class="accessory-row">
                        <label><strong>${isAutoSport ? 'Heat Shrink Boot:' : 'Backshell Style:'}</strong></label>
                        ${matIsBox ? `<span class="box-mount-notice">Box Mount (No rear accessory threads)</span>` : (isAutoSport ? `
                        <select onchange="updateCardBackshell(${index}, false, this.value)">
                            <option value="BOOT_STRAIGHT" ${mat.selectedBackshell === 'BOOT_STRAIGHT' ? 'selected' : ''}>Straight Boot (${matBackshellOpts['BOOT_STRAIGHT'] ? matBackshellOpts['BOOT_STRAIGHT'].pn : '202K121'}) - $${matBackshellOpts['BOOT_STRAIGHT'] ? matBackshellOpts['BOOT_STRAIGHT'].price.toFixed(2) : '12.50'}</option>
                            <option value="BOOT_RA" ${mat.selectedBackshell === 'BOOT_RA' ? 'selected' : ''}>90° Right-Angle Boot (${matBackshellOpts['BOOT_RA'] ? matBackshellOpts['BOOT_RA'].pn : '222K121'}) - $${matBackshellOpts['BOOT_RA'] ? matBackshellOpts['BOOT_RA'].price.toFixed(2) : '14.50'}</option>
                            <option value="NONE" ${mat.selectedBackshell === 'NONE' ? 'selected' : ''}>None (No Boot) - $0.00</option>
                        </select>` : `
                        <select onchange="updateCardBackshell(${index}, false, this.value)">
                            <option value="M85049/38" ${mat.selectedBackshell === 'M85049/38' ? 'selected' : ''}>Strain Relief (M85049/38) - $${matBackshellOpts['M85049/38'].price.toFixed(2)}</option>
                            <option value="M85049/88" ${mat.selectedBackshell === 'M85049/88' ? 'selected' : ''}>EMI Banding (M85049/88) - $${matBackshellOpts['M85049/88'].price.toFixed(2)}</option>
                            <option value="M85049/49" ${mat.selectedBackshell === 'M85049/49' ? 'selected' : ''}>Shrink Boot (M85049/49) - $${matBackshellOpts['M85049/49'].price.toFixed(2)}</option>
                            <option value="NONE" ${mat.selectedBackshell === 'NONE' ? 'selected' : ''}>None (No Backshell) - $0.00</option>
                        </select>`)}
                    </div>
                    ${(!matIsBox && mat.selectedBackshell !== 'NONE') ? `<p style="margin: 4px 0 8px 0; font-size: 12px;"><strong>Active ${isAutoSport ? 'Boot' : 'Backshell'}:</strong> ${matSelectedBs.pn} (Est. $${matSelectedBs.price.toFixed(2)})</p>` : ''}
                    
                    <div class="checkbox-row" style="margin-top: 6px;">
                        <input type="checkbox" id="matCap_${index}" ${mat.includeDustCap ? 'checked' : ''} onchange="updateCardDustCap(${index}, false, this.checked)">
                        <label for="matCap_${index}" style="font-weight: normal; font-size: 12px; margin-bottom: 0;">
                            Include Protective Dust Cap (${matCap.pn} - Est. $${matCap.price.toFixed(2)})
                        </label>
                    </div>
                </div>` : ''}

                <p><strong>Flange Accessory:</strong> ${matFlangeHtml}</p>
                <p><strong>Flange Fasteners:</strong> ${matFastenerHtml}</p>
                
                <p style="margin-bottom: 2px;"><strong>Required Contacts:</strong></p>
                <ul class="contact-list">${matContactListHtml}</ul>
                
                <div class="tooling-block">
                    <p style="margin-top:0; margin-bottom:4px;"><strong>Crimp Tooling Setup:</strong></p>
                    <ul class="tooling-list">${mat ? matToolHtml : '<li>N/A</li>'}</ul>
                    ${matToolAlert}
                    ${matM81969Html}
                </div>

                <div class="link-group" style="margin-top: 10px;">
                    <label>Distributor Live Stock:</label>
                    ${mat ? `<a href="https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(mat.activePN)}" target="_blank">DigiKey ↗</a>
                    <a href="https://www.mouser.com/c/?q=${encodeURIComponent(mat.activePN)}" target="_blank">Mouser ↗</a>
                    <a href="https://www.newark.com/search?st=${encodeURIComponent(mat.activePN)}" target="_blank">Newark ↗</a>` : ''}
                </div>
            </div>
        </div>

        <div style="margin-top: 15px;">
            <button type="button" class="btn-green" onclick="addSolutionPairToActiveList(${index})">+ Add Complete Mating Pair & Configured Accessories to Active Project List</button>
        </div>
    `;
}

function changeMatingShellType(solutionIndex, newShellType) {
    const pair = currentCalculatedSolutions[solutionIndex];
    if (!pair) return;

    const pri = pair.primary;
    const pnType = pair.pnType;
    let newMating = getMatingConnector(pri, pnType, newShellType);

    if (newMating) {
        let matContacts = resolveGroupContacts(pair.groupSpecs, newMating.contactType);
        let prevSelectedBs = pair.mating ? pair.mating.selectedBackshell : 'M85049/38';
        if (newShellType === 'Box Mount') prevSelectedBs = 'NONE';
        let prevDustCap = pair.mating ? pair.mating.includeDustCap : false;

        pair.mating = {
            ...newMating,
            contacts: matContacts,
            selectedBackshell: prevSelectedBs,
            includeDustCap: prevDustCap
        };
    } else {
        pair.mating = null;
    }

    const wrapper = document.getElementById(`solution-pair-${solutionIndex}`);
    if (wrapper) {
        wrapper.innerHTML = renderSolutionPairHTML(pair, solutionIndex);
    }
}

function updateCardBackshell(solutionIndex, isPrimary, backshellKey) {
    const pair = currentCalculatedSolutions[solutionIndex];
    if (!pair) return;

    if (isPrimary) {
        pair.primary.selectedBackshell = backshellKey;
    } else if (pair.mating) {
        pair.mating.selectedBackshell = backshellKey;
    }

    const wrapper = document.getElementById(`solution-pair-${solutionIndex}`);
    if (wrapper) {
        wrapper.innerHTML = renderSolutionPairHTML(pair, solutionIndex);
    }
}

function updateCardDustCap(solutionIndex, isPrimary, checked) {
    const pair = currentCalculatedSolutions[solutionIndex];
    if (!pair) return;

    if (isPrimary) {
        pair.primary.includeDustCap = checked;
    } else if (pair.mating) {
        pair.mating.includeDustCap = checked;
    }
}

function addSolutionPairToActiveList(solutionIndex) {
    const pair = currentCalculatedSolutions[solutionIndex];
    if (!pair) return;

    let activeListName = document.getElementById('projectListSelect').value;
    const includeStd = document.getElementById('includeStdContacts').checked;
    const pri = pair.primary;
    const mat = pair.mating;

    let itemsToAdd = [];

    const isAutoSport = pair.pnType === 'as' || pri.seriesId === 'deutsch_autosport';
    const seriesTitle = isAutoSport ? 'Deutsch AutoSport' : (pair.pnType === 'comm' ? 'Commercial Tri-Start' : '38999 Series III');

    // Primary connector
    itemsToAdd.push({ 
        pn: pri.activePN, 
        qty: 1, 
        desc: `${seriesTitle} Primary ${pri.shellLabel} ${pri.shellType}`, 
        price: pri.unitPriceConnector 
    });

    // Primary Backshell
    if (pri.shellType !== 'Box Mount' && pri.selectedBackshell && pri.selectedBackshell !== 'NONE') {
        const bsOpts = getBackshellOptions(pri.shellSize, pri.finish);
        const bs = bsOpts[pri.selectedBackshell];
        if (bs) {
            itemsToAdd.push({ pn: bs.pn, qty: 1, desc: `${bs.desc} (Primary)`, price: bs.price });
        }
    }

    // Primary Dust Cap
    if (pri.includeDustCap) {
        const capOpts = getDustCapOptions(pri.shellSize, pri.finish, pri.letterCode);
        const cap = pri.shellType === 'Plug' ? capOpts.plugCap : capOpts.receptacleCap;
        itemsToAdd.push({ pn: cap.pn, qty: 1, desc: `${cap.desc} (Primary)`, price: cap.price });
    }

    // Primary Flange Accessory
    if (!isAutoSport && pri.shellType === 'Wall Mount') {
        itemsToAdd.push({ pn: pri.flangeAcc, qty: 1, desc: 'M85049/95 Flange (Primary)', price: pri.unitPriceFlange });
    }

    // Primary Contacts
    let isPriLC = pri.activePN.endsWith("LC");
    pri.contacts.forEach(c => {
        if (!c.isStd || includeStd || isPriLC) {
            itemsToAdd.push({ pn: c.pn, qty: c.qty, desc: `Primary ${c.desc}`, price: c.price });
        }
    });

    // Mating connector
    if (mat) {
        itemsToAdd.push({ 
            pn: mat.activePN, 
            qty: 1, 
            desc: `${seriesTitle} Mating ${mat.shellLabel} ${mat.shellType}`, 
            price: mat.unitPriceConnector 
        });

        // Mating Backshell
        if (mat.shellType !== 'Box Mount' && mat.selectedBackshell && mat.selectedBackshell !== 'NONE') {
            const bsOpts = getBackshellOptions(mat.shellSize, mat.finish);
            const bs = bsOpts[mat.selectedBackshell];
            if (bs) {
                itemsToAdd.push({ pn: bs.pn, qty: 1, desc: `${bs.desc} (Mating)`, price: bs.price });
            }
        }

        // Mating Dust Cap
        if (mat.includeDustCap) {
            const capOpts = getDustCapOptions(mat.shellSize, mat.finish, mat.letterCode);
            const cap = mat.shellType === 'Plug' ? capOpts.plugCap : capOpts.receptacleCap;
            itemsToAdd.push({ pn: cap.pn, qty: 1, desc: `${cap.desc} (Mating)`, price: cap.price });
        }

        // Mating Flange Accessory
        if (!isAutoSport && mat.shellType === 'Wall Mount') {
            itemsToAdd.push({ pn: mat.flangeAcc, qty: 1, desc: 'M85049/95 Flange (Mating)', price: mat.unitPriceFlange });
        }

        // Mating Contacts
        let isMatLC = mat.activePN.endsWith("LC");
        mat.contacts.forEach(c => {
            if (!c.isStd || includeStd || isMatLC) {
                itemsToAdd.push({ pn: c.pn, qty: c.qty, desc: `Mating ${c.desc}`, price: c.price });
            }
        });
    }

    // Merge into active list: if pn already exists, increment qty; otherwise append
    itemsToAdd.forEach(newItem => {
        let existing = projectLists[activeListName].find(i => i.pn === newItem.pn && i.pn !== "91737A313");
        if (existing) {
            existing.qty += newItem.qty;
        } else {
            projectLists[activeListName].push({ ...newItem });
        }
    });

    // Flange Fasteners calculation (sold in boxes of 100 @ $10.04, covers up to 25 flange connectors)
    const priNeedsFasteners = pri.shellType === 'Wall Mount' || pri.shellType === 'Box Mount';
    const matNeedsFasteners = mat && (mat.shellType === 'Wall Mount' || mat.shellType === 'Box Mount');
    
    if (priNeedsFasteners || matNeedsFasteners) {
        let totalFlangeCount = projectLists[activeListName].filter(i => 
            i.desc && (i.desc.includes("Wall Mount") || i.desc.includes("Box Mount"))
        ).length;
        let requiredBoxes = Math.max(1, Math.ceil((totalFlangeCount * 4) / 100));

        let fastenerItem = projectLists[activeListName].find(i => i.pn === "91737A313");
        if (fastenerItem) {
            fastenerItem.qty = requiredBoxes;
            fastenerItem.desc = `Flange Fasteners, Fillister Head 1" (Box of 100 - covers up to ${requiredBoxes * 25} connectors)`;
        } else {
            projectLists[activeListName].push({ 
                pn: "91737A313", 
                qty: requiredBoxes, 
                desc: `Flange Fasteners, Fillister Head 1" (Box of 100 - covers up to ${requiredBoxes * 25} connectors)`, 
                price: 10.04 
            });
        }
    }

    saveAndRefresh();
}

function createNewList() {
    let name = prompt("Enter new project list name:");
    if (name && !projectLists[name]) {
        projectLists[name] = [];
        updateListDropdown();
        document.getElementById('projectListSelect').value = name;
        saveAndRefresh();
    }
}

function clearActiveList() {
    let activeListName = document.getElementById('projectListSelect').value;
    if (confirm(`Are you sure you want to clear all items from "${activeListName}"?`)) {
        projectLists[activeListName] = [];
        saveAndRefresh();
    }
}

function updateListDropdown() {
    let sel = document.getElementById('projectListSelect');
    sel.innerHTML = Object.keys(projectLists).map(k => `<option value="${k}">${k}</option>`).join('');
}

function loadActiveList() {
    let activeListName = document.getElementById('projectListSelect').value;
    let items = projectLists[activeListName] || [];
    let tbody = document.getElementById('listTableBody');

    tbody.innerHTML = items.map((item, idx) => {
        let unitPrice = item.price || 0;
        let lineTotal = item.qty * unitPrice;

        return `
            <tr>
                <td><strong>${item.pn}</strong></td>
                <td>
                    <input type="number" class="bom-input" min="1" value="${item.qty}"
                        onchange="updateItemQty(${idx}, this.value)"
                        title="Edit quantity">
                </td>
                <td>${item.desc}</td>
                <td>
                    <input type="number" class="bom-input" min="0" step="0.01" value="${unitPrice.toFixed(2)}"
                        onchange="updateItemPrice(${idx}, this.value)"
                        title="Edit unit price">
                </td>
                <td id="lineTotal_${idx}">$${lineTotal.toFixed(2)}</td>
                <td style="text-align: center;"><button class="btn-red" style="padding: 4px 10px;" onclick="removeItem(${idx})">X</button></td>
            </tr>
        `;
    }).join('');

    recalcGrandTotal();
}

function recalcGrandTotal() {
    let activeListName = document.getElementById('projectListSelect').value;
    let items = projectLists[activeListName] || [];
    let grandTotal = items.reduce((sum, item) => sum + (item.qty * (item.price || 0)), 0);
    document.getElementById('bomGrandTotal').innerHTML = `<strong>$${grandTotal.toFixed(2)}</strong>`;
}

function updateItemQty(idx, val) {
    let activeListName = document.getElementById('projectListSelect').value;
    let qty = Math.max(1, parseInt(val, 10) || 1);
    projectLists[activeListName][idx].qty = qty;
    let price = projectLists[activeListName][idx].price || 0;
    let lineTd = document.getElementById(`lineTotal_${idx}`);
    if (lineTd) lineTd.textContent = `$${(qty * price).toFixed(2)}`;
    recalcGrandTotal();
    localStorage.setItem('connector_projects', JSON.stringify(projectLists));
}

function updateItemPrice(idx, val) {
    let activeListName = document.getElementById('projectListSelect').value;
    let price = Math.max(0, parseFloat(val) || 0);
    projectLists[activeListName][idx].price = price;
    let qty = projectLists[activeListName][idx].qty || 1;
    let lineTd = document.getElementById(`lineTotal_${idx}`);
    if (lineTd) lineTd.textContent = `$${(qty * price).toFixed(2)}`;
    recalcGrandTotal();
    localStorage.setItem('connector_projects', JSON.stringify(projectLists));
}

function removeItem(idx) {
    let activeListName = document.getElementById('projectListSelect').value;
    projectLists[activeListName].splice(idx, 1);

    // Recalculate fastener boxes needed after removal
    let fastenerItem = projectLists[activeListName].find(i => i.pn === "91737A313");
    if (fastenerItem) {
        let flangeCount = projectLists[activeListName].filter(i => 
            i.desc && (i.desc.includes("Wall Mount") || i.desc.includes("Box Mount"))
        ).length;
        if (flangeCount === 0) {
            let fIdx = projectLists[activeListName].indexOf(fastenerItem);
            projectLists[activeListName].splice(fIdx, 1);
        } else {
            let requiredBoxes = Math.max(1, Math.ceil((flangeCount * 4) / 100));
            fastenerItem.qty = requiredBoxes;
            fastenerItem.desc = `Flange Fasteners, Fillister Head 1" (Box of 100 - covers up to ${requiredBoxes * 25} connectors)`;
        }
    }
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('connector_projects', JSON.stringify(projectLists));
    loadActiveList();
}

function exportToCSV() {
    let activeListName = document.getElementById('projectListSelect').value;
    let items = projectLists[activeListName] || [];
    if (items.length === 0) return alert('List is empty!');

    let grandTotal = 0;
    let csvRows = ["Part Number,Quantity,Description,Unit Price,Total Price"];

    items.forEach(i => {
        let unitPrice = i.price || 0;
        let lineTotal = i.qty * unitPrice;
        grandTotal += lineTotal;
        csvRows.push(`"${i.pn}",${i.qty},"${i.desc}",${unitPrice.toFixed(2)},${lineTotal.toFixed(2)}`);
    });

    csvRows.push(`"Grand Total",,,,"${grandTotal.toFixed(2)}"`);

    let csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeListName}_BOM_${CONFIG_VERSION}.csv`);
    document.body.appendChild(link);
    link.click();
}

function exportToSkyCAD() {
    let activeListName = document.getElementById('projectListSelect').value;
    let items = projectLists[activeListName] || [];
    if (items.length === 0) return alert('List is empty!');

    let csvContent = "data:text/csv;charset=utf-8,Class,PartNumber,Description,Manufacturer,PinList\n";
    items.forEach(i => {
        let match = database.find(d => d.milPN === i.pn || d.commPN === i.pn);
        if (match) {
            csvContent += `"Connector","${i.pn}","${i.desc}","Amphenol/Mil-Spec","${match.pins.join(';')}"\n`;
        } else {
            csvContent += `"Accessory","${i.pn}","${i.desc}","Generic",""\n`;
        }
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeListName}_SkyCAD_Import_${CONFIG_VERSION}.csv`);
    document.body.appendChild(link);
    link.click();
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBOM() {
    const bomSection = document.getElementById('bomCard');
    if (bomSection) {
        bomSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Lightbox Modal Helpers
function openImageModal(imgSrc, title) {
    if (!imgSrc) return;
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImageSrc');
    const modalTitle = document.getElementById('modalImageTitle');
    
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        if (modalTitle) modalTitle.textContent = title || 'Diagram Preview';
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        const modalImg = document.getElementById('modalImageSrc');
        if (modalImg) modalImg.src = '';
    }
}

// Close modal on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

window.onload = init;