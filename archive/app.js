// Configurator Metadata
const CONFIG_VERSION = "V001.1";

// Shop Tooling Inventory Definition
const SHOP_TOOLING = {
    frames: ["AFM8", "AF8"],
    positioners: ["K40", "K42", "K13-1", "TH163"]
};

// Tooling Mapping Matrix per contact size and pin/socket gender
const TOOLING_MATRIX = {
    "22D": {
        P: { frame: "AFM8", positioner: "K42", setting: "Color SEL: 4 (AWG 22-28)" },
        S: { frame: "AFM8", positioner: "K40", setting: "Color SEL: 4 (AWG 22-28)" }
    },
    "20": {
        P: { frame: "AFM8", positioner: "K13-1", setting: "SEL: 4-6 (AWG 20-24)" },
        S: { frame: "AFM8", positioner: "K13-1", setting: "SEL: 4-6 (AWG 20-24)" }
    },
    "16": {
        P: { frame: "AF8", positioner: "TH163", setting: "Turret Position: BLUE" },
        S: { frame: "AF8", positioner: "TH163", setting: "Turret Position: BLUE" }
    },
    "12": {
        P: { frame: "AF8", positioner: "TH163", setting: "Turret Position: YELLOW" },
        S: { frame: "AF8", positioner: "TH163", setting: "Turret Position: YELLOW" }
    },
    "8": {
        P: { frame: "M22520/23-01", positioner: "Die Set / Heavy-Duty Crimp Tool", setting: "Specialty Power/Coax Crimp Tool" },
        S: { frame: "M22520/23-01", positioner: "Die Set / Heavy-Duty Crimp Tool", setting: "Specialty Power/Coax Crimp Tool" }
    }
};

const contactRatings = [
    { size: "22D", maxAmps: 5.0,  label: "Size 22D (Max 5A)" },
    { size: "20",  maxAmps: 7.5,  label: "Size 20 (Max 7.5A)" },
    { size: "16",  maxAmps: 13.0, label: "Size 16 (Max 13A)" },
    { size: "12",  maxAmps: 23.0, label: "Size 12 (Max 23A)" },
    { size: "8",   maxAmps: 46.0, label: "Size 8 (Max 46A - Coax/Twinax/Power)" }
];

const m39029DB = {
    "STD": {
        "22D": { P: [{ pn: "M39029/58-360", price: 1.85, desc: "Size 22D Pin Contact", size: "22D", isStd: true }],
                 S: [{ pn: "M39029/56-348", price: 2.10, desc: "Size 22D Socket Contact", size: "22D", isStd: true }] },
        "20":  { P: [{ pn: "M39029/58-364", price: 2.15, desc: "Size 20 Pin Contact", size: "20", isStd: true }],
                 S: [{ pn: "M39029/57-358", price: 2.40, desc: "Size 20 Socket Contact", size: "20", isStd: true }] },
        "16":  { P: [{ pn: "M39029/58-365", price: 3.10, desc: "Size 16 Pin Contact", size: "16", isStd: true }],
                 S: [{ pn: "M39029/57-359", price: 3.50, desc: "Size 16 Socket Contact", size: "16", isStd: true }] },
        "12":  { P: [{ pn: "M39029/58-366", price: 4.50, desc: "Size 12 Pin Contact", size: "12", isStd: true }],
                 S: [{ pn: "M39029/57-360", price: 5.20, desc: "Size 12 Socket Contact", size: "12", isStd: true }] },
        "8":   { P: [{ pn: "M39029/60-367", price: 18.50, desc: "Size 8 Pin Power Contact", size: "8", isStd: true }],
                 S: [{ pn: "M39029/59-366", price: 21.00, desc: "Size 8 Socket Power Contact", size: "8", isStd: true }] }
    },
    "TC_K": {
        "22D": {
            P: [
                { pn: "M39029/87-471", price: 7.50, desc: "Size 22D Alumel Pin Contact", size: "22D", isStd: false },
                { pn: "M39029/87-472", price: 7.50, desc: "Size 22D Chromel Pin Contact", size: "22D", isStd: false }
            ],
            S: [
                { pn: "M39029/88-487", price: 8.00, desc: "Size 22D Alumel Socket Contact", size: "22D", isStd: false },
                { pn: "M39029/88-488", price: 8.00, desc: "Size 22D Chromel Socket Contact", size: "22D", isStd: false }
            ]
        },
        "20": {
            P: [
                { pn: "M39029/87-473", price: 8.50, desc: "Size 20 Alumel Pin Contact", size: "20", isStd: false },
                { pn: "M39029/87-474", price: 8.50, desc: "Size 20 Chromel Pin Contact", size: "20", isStd: false }
            ],
            S: [
                { pn: "M39029/88-489", price: 9.00, desc: "Size 20 Alumel Socket Contact", size: "20", isStd: false },
                { pn: "M39029/88-490", price: 9.00, desc: "Size 20 Chromel Socket Contact", size: "20", isStd: false }
            ]
        }
    },
    "TC_E": {
        "22D": {
            P: [
                { pn: "M39029/87-472", price: 7.50, desc: "Size 22D Chromel Pin Contact", size: "22D", isStd: false },
                { pn: "M39029/87-470", price: 7.50, desc: "Size 22D Constantan Pin Contact", size: "22D", isStd: false }
            ],
            S: [
                { pn: "M39029/88-488", price: 8.00, desc: "Size 22D Chromel Socket Contact", size: "22D", isStd: false },
                { pn: "M39029/88-486", price: 8.00, desc: "Size 22D Constantan Socket Contact", size: "22D", isStd: false }
            ]
        },
        "20": {
            P: [
                { pn: "M39029/87-474", price: 8.50, desc: "Size 20 Chromel Pin Contact", size: "20", isStd: false },
                { pn: "M39029/87-470", price: 8.50, desc: "Size 20 Constantan Pin Contact", size: "20", isStd: false }
            ],
            S: [
                { pn: "M39029/88-490", price: 9.00, desc: "Size 20 Chromel Socket Contact", size: "20", isStd: false },
                { pn: "M39029/88-486", price: 8.00, desc: "Size 20 Constantan Socket Contact", size: "20", isStd: false }
            ]
        }
    },
    "TC_J": {
        "22D": {
            P: [
                { pn: "M39029/87-469", price: 7.50, desc: "Size 22D Iron Pin Contact", size: "22D", isStd: false },
                { pn: "M39029/87-470", price: 7.50, desc: "Size 22D Constantan Pin Contact", size: "22D", isStd: false }
            ],
            S: [
                { pn: "M39029/88-485", price: 8.00, desc: "Size 22D Iron Socket Contact", size: "22D", isStd: false },
                { pn: "M39029/88-486", price: 8.00, desc: "Size 22D Constantan Socket Contact", size: "22D", isStd: false }
            ]
        }
    },
    "TC_T": {
        "22D": {
            P: [
                { pn: "M39029/87-468", price: 7.50, desc: "Size 22D Copper Pin Contact", size: "22D", isStd: false },
                { pn: "M39029/87-470", price: 7.50, desc: "Size 22D Constantan Pin Contact", size: "22D", isStd: false }
            ],
            S: [
                { pn: "M39029/88-484", price: 8.00, desc: "Size 22D Copper Socket Contact", size: "22D", isStd: false },
                { pn: "M39029/88-486", price: 8.00, desc: "Size 22D Constantan Socket Contact", size: "22D", isStd: false }
            ]
        }
    },
    "COAX": {
        "16": { P: [{ pn: "M39029/76-424", price: 22.00, desc: "Size 16 Coax Pin Contact", size: "16", isStd: false }],
                S: [{ pn: "M39029/77-429", price: 25.00, desc: "Size 16 Coax Socket Contact", size: "16", isStd: false }] },
        "12": { P: [{ pn: "M39029/28-211", price: 34.00, desc: "Size 12 Coax Pin Contact", size: "12", isStd: false }],
                S: [{ pn: "M39029/75-416", price: 38.00, desc: "Size 12 Coax Socket Contact", size: "12", isStd: false }] },
        "8":  { P: [{ pn: "M39029/90-529", price: 65.00, desc: "Size 8 Twinax Pin Contact", size: "8", isStd: false }],
                S: [{ pn: "M39029/91-530", price: 72.00, desc: "Size 8 Twinax Socket Contact", size: "8", isStd: false }] }
    }
};

function alphaSeq(count) {
    const alpha = "ABCDEFGHJKLMNPRSTUVWXYZabcdefghjkmnpqrstuvwxyz".split("");
    return alpha.slice(0, count);
}
function numSeq(count) {
    return Array.from({length: count}, (_, i) => String(i + 1));
}

const masterLayouts = [
    { shellSize: "9",  letterCode: "A", arrangement: "9-5",   counts: { "22D": 5 },             pins: numSeq(5) },
    { shellSize: "9",  letterCode: "A", arrangement: "9-35",  counts: { "22D": 6 },             pins: numSeq(6) },
    { shellSize: "9",  letterCode: "A", arrangement: "9-98",  counts: { "20": 3 },              pins: ["A","B","C"] },
    { shellSize: "11", letterCode: "B", arrangement: "11-2",   counts: { "16": 2 },              pins: ["A","B"] },
    { shellSize: "11", letterCode: "B", arrangement: "11-4",   counts: { "20": 4 },              pins: ["A","B","C","D"] },
    { shellSize: "11", letterCode: "B", arrangement: "11-5",   counts: { "20": 5 },              pins: ["A","B","C","D","E"] },
    { shellSize: "11", letterCode: "B", arrangement: "11-35",  counts: { "22D": 13 },            pins: numSeq(13) },
    { shellSize: "11", letterCode: "B", arrangement: "11-98",  counts: { "20": 6 },              pins: alphaSeq(6) },
    { shellSize: "11", letterCode: "B", arrangement: "11-99",  counts: { "20": 7 },              pins: alphaSeq(7) },
    { shellSize: "13", letterCode: "C", arrangement: "13-4",   counts: { "16": 4 },              pins: ["A","B","C","D"] },
    { shellSize: "13", letterCode: "C", arrangement: "13-8",   counts: { "20": 8 },              pins: alphaSeq(8) },
    { shellSize: "13", letterCode: "C", arrangement: "13-13",  counts: { "22D": 10, "16": 2, "12": 1 }, pins: alphaSeq(13) },
    { shellSize: "13", letterCode: "C", arrangement: "13-26",  counts: { "22D": 26 },            pins: numSeq(26) },
    { shellSize: "13", letterCode: "C", arrangement: "13-35",  counts: { "22D": 22 },            pins: numSeq(22) },
    { shellSize: "13", letterCode: "C", arrangement: "13-98",  counts: { "20": 10 },             pins: alphaSeq(10) },
    { shellSize: "15", letterCode: "D", arrangement: "15-5",   counts: { "16": 5 },              pins: ["A","B","C","D","E"] },
    { shellSize: "15", letterCode: "D", arrangement: "15-15",  counts: { "20": 14, "16": 1 },    pins: alphaSeq(15) },
    { shellSize: "15", letterCode: "D", arrangement: "15-18",  counts: { "20": 18 },             pins: alphaSeq(18) },
    { shellSize: "15", letterCode: "D", arrangement: "15-19",  counts: { "20": 19 },             pins: alphaSeq(19) },
    { shellSize: "15", letterCode: "D", arrangement: "15-35",  counts: { "22D": 37 },            pins: alphaSeq(37) },
    { shellSize: "15", letterCode: "D", arrangement: "15-97",  counts: { "20": 8, "16": 4 },     pins: alphaSeq(12) },
    { shellSize: "17", letterCode: "E", arrangement: "17-2",   counts: { "22D": 38, "8": 2 },    pins: numSeq(40) },
    { shellSize: "17", letterCode: "E", arrangement: "17-6",   counts: { "12": 6 },              pins: ["A","B","C","D","E","F"] },
    { shellSize: "17", letterCode: "E", arrangement: "17-8",   counts: { "16": 8 },              pins: alphaSeq(8) },
    { shellSize: "17", letterCode: "E", arrangement: "17-22",  counts: { "22D": 22, "12": 2 },   pins: numSeq(24) },
    { shellSize: "17", letterCode: "E", arrangement: "17-26",  counts: { "20": 26 },             pins: numSeq(26) },
    { shellSize: "17", letterCode: "E", arrangement: "17-35",  counts: { "22D": 55 },            pins: numSeq(55) },
    { shellSize: "17", letterCode: "E", arrangement: "17-99",  counts: { "20": 21, "16": 2 },    pins: numSeq(23) },
    { shellSize: "19", letterCode: "F", arrangement: "19-11",  counts: { "16": 11 },             pins: alphaSeq(11) },
    { shellSize: "19", letterCode: "F", arrangement: "19-18",  counts: { "22D": 14, "8": 4 },    pins: numSeq(18) },
    { shellSize: "19", letterCode: "F", arrangement: "19-28",  counts: { "20": 26, "16": 2 },    pins: numSeq(28) },
    { shellSize: "19", letterCode: "F", arrangement: "19-30",  counts: { "20": 29, "16": 1 },    pins: numSeq(30) },
    { shellSize: "19", letterCode: "F", arrangement: "19-32",  counts: { "20": 32 },             pins: numSeq(32) },
    { shellSize: "19", letterCode: "F", arrangement: "19-35",  counts: { "22D": 66 },            pins: numSeq(66) },
    { shellSize: "21", letterCode: "G", arrangement: "21-11",  counts: { "12": 11 },             pins: alphaSeq(11) },
    { shellSize: "21", letterCode: "G", arrangement: "21-16",  counts: { "16": 16 },             pins: alphaSeq(16) },
    { shellSize: "21", letterCode: "G", arrangement: "21-25",  counts: { "16": 25 },             pins: alphaSeq(25) },
    { shellSize: "21", letterCode: "G", arrangement: "21-35",  counts: { "22D": 79 },            pins: numSeq(79) },
    { shellSize: "21", letterCode: "G", arrangement: "21-39",  counts: { "20": 37, "16": 2 },    pins: numSeq(39) },
    { shellSize: "21", letterCode: "G", arrangement: "21-41",  counts: { "20": 41 },             pins: numSeq(41) },
    { shellSize: "21", letterCode: "G", arrangement: "21-75",  counts: { "8": 4 },               pins: ["A","B","C","D"] },
    { shellSize: "23", letterCode: "H", arrangement: "23-21",  counts: { "16": 21 },             pins: numSeq(21) },
    { shellSize: "23", letterCode: "H", arrangement: "23-35",  counts: { "22D": 100 },           pins: numSeq(100) },
    { shellSize: "23", letterCode: "H", arrangement: "23-53",  counts: { "20": 53 },             pins: numSeq(53) },
    { shellSize: "23", letterCode: "H", arrangement: "23-54",  counts: { "22D": 40, "16": 9, "8": 4 }, pins: numSeq(53) },
    { shellSize: "23", letterCode: "H", arrangement: "23-55",  counts: { "20": 55 },             pins: numSeq(55) },
    { shellSize: "25", letterCode: "J", arrangement: "25-4",   counts: { "20": 48, "16": 8 },    pins: numSeq(56) },
    { shellSize: "25", letterCode: "J", arrangement: "25-8",   counts: { "8": 8 },               pins: alphaSeq(8) },
    { shellSize: "25", letterCode: "J", arrangement: "25-19",  counts: { "12": 19 },             pins: alphaSeq(19) },
    { shellSize: "25", letterCode: "J", arrangement: "25-20",  counts: { "20": 10, "16": 13, "12": 4, "8": 3 }, pins: numSeq(30) },
    { shellSize: "25", letterCode: "J", arrangement: "25-24",  counts: { "16": 12, "12": 12 },   pins: alphaSeq(24) },
    { shellSize: "25", letterCode: "J", arrangement: "25-29",  counts: { "16": 29 },             pins: alphaSeq(29) },
    { shellSize: "25", letterCode: "J", arrangement: "25-35",  counts: { "22D": 128 },           pins: numSeq(128) },
    { shellSize: "25", letterCode: "J", arrangement: "25-43",  counts: { "20": 20, "16": 16, "12": 7 }, pins: numSeq(43) },
    { shellSize: "25", letterCode: "J", arrangement: "25-61",  counts: { "20": 61 },             pins: numSeq(61) }
];

const shellTypes = [
    { type: "Plug", milCode: "26", commPrefix: "TVS06" },
    { type: "Jam Nut", milCode: "24", commPrefix: "TVS07" },
    { type: "Wall Mount", milCode: "20", commPrefix: "TVPS00" }
];

const finishes = [
    { code: "W", commCode: "RW", costMult: 1.0 },
    { code: "F", commCode: "RF", costMult: 0.95 },
    { code: "Z", commCode: "RBZ", costMult: 1.15 }
];

const contactTypes = ["P", "S"];
const keyingPositions = ["N", "A", "B", "C"];

const database = [];

masterLayouts.forEach(layout => {
    const numShell = layout.shellSize.padStart(2, '0');
    const szNum = parseInt(layout.shellSize, 10);
    
    let basePrice = 30.00 + (szNum * 3.50);
    let backshellPrice = 14.00 + (szNum * 0.85);
    let flangePrice = 9.00 + (szNum * 0.50);

    let fastenerDesc = "Fillister Phillips Head Screw, 1\" Length (McMaster: 91737A313)";
    let fastenerUrl = "https://www.mcmaster.com/91737A313/";
    let fastenerPrice = 0.35;
    let fastenerQty = 2;

    shellTypes.forEach(st => {
        finishes.forEach(fin => {
            contactTypes.forEach(ct => {
                keyingPositions.forEach(ky => {
                    const milPN = `D38999/${st.milCode}${fin.code}${layout.letterCode}${layout.arrangement.split('-')[1]}${ct}${ky}`;
                    const commPN = `${st.commPrefix}${fin.commCode}-${layout.arrangement}${ct}${ky !== 'N' ? ky : ''}`;

                    database.push({
                        id: `${milPN}_${commPN}`,
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
                        unitPriceConnector: basePrice * fin.costMult,
                        backshell: `M85049/38-${numShell}${fin.code}`,
                        unitPriceBackshell: backshellPrice,
                        flangeAcc: `M85049/95-${numShell}A (3/4 Perimeter Flange)`,
                        unitPriceFlange: flangePrice,
                        fastener: fastenerDesc,
                        fastenerUrl: fastenerUrl,
                        fastenerQty: fastenerQty,
                        unitPriceFastener: fastenerPrice,
                        diagramImg: `https://via.placeholder.com/150/1a365d/ffffff?text=${layout.arrangement}+Insert`,
                        cutoutImg: `https://via.placeholder.com/150/718096/ffffff?text=Shell+${layout.shellSize}+Cutout`,
                        pins: layout.pins,
                        counts: layout.counts
                    });
                });
            });
        });
    });
});

let currentCalculatedSolutions = [];
let projectLists = JSON.parse(localStorage.getItem('connector_projects')) || { "Default Project": [] };

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

function init() {
    initTheme();
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
    let totals = {};

    groupSpecs.forEach(g => {
        let typeMap = m39029DB[g.matType] || m39029DB["STD"];
        let sizeEntry = typeMap[g.size] || (m39029DB["STD"][g.size] || m39029DB["STD"]["22D"]);
        let list = gender === 'P' ? sizeEntry.P : sizeEntry.S;

        if (g.matType.startsWith("TC_")) {
            let channels = Math.ceil(g.qty / 2);
            list.forEach(item => {
                let totalQty = channels * 1;
                if (!totals[item.pn]) {
                    totals[item.pn] = { ...item, qty: totalQty, gender: gender };
                } else {
                    totals[item.pn].qty += totalQty;
                }
            });
        } else {
            list.forEach(item => {
                let totalQty = g.qty;
                if (!totals[item.pn]) {
                    totals[item.pn] = { ...item, qty: totalQty, gender: gender };
                } else {
                    totals[item.pn].qty += totalQty;
                }
            });
        }
    });

    return Object.values(totals);
}

function getToolingStatus(contacts) {
    let results = [];
    let missingTools = [];

    contacts.forEach(c => {
        let toolReq = TOOLING_MATRIX[c.size] ? TOOLING_MATRIX[c.size][c.gender] : null;
        if (!toolReq) return;

        let hasFrame = SHOP_TOOLING.frames.includes(toolReq.frame);
        let hasPositioner = SHOP_TOOLING.positioners.includes(toolReq.positioner);
        let isAvailable = hasFrame && hasPositioner;

        let status = {
            contactSize: c.size,
            gender: c.gender === 'P' ? 'Pin' : 'Socket',
            pn: c.pn,
            frame: toolReq.frame,
            positioner: toolReq.positioner,
            setting: toolReq.setting,
            available: isAvailable
        };

        results.push(status);
        if (!isAvailable) {
            missingTools.push(status);
        }
    });

    return { results, missingTools };
}

function getMatingConnector(primary, pnType) {
    let targetShellType = primary.shellType === 'Plug' ? 'Jam Nut' : 'Plug';
    let targetContactType = primary.contactType === 'P' ? 'S' : 'P';
    
    let match = database.find(d => 
        d.shellSize === primary.shellSize &&
        d.arrangement === primary.arrangement &&
        d.shellType === targetShellType &&
        d.finish === primary.finish &&
        d.contactType === targetContactType &&
        d.keying === primary.keying
    );

    if (match) {
        let activePN = pnType === 'mil' ? match.milPN : match.commPN;
        return { ...match, activePN };
    }
    return null;
}

function calculate() {
    const mode = document.getElementById('mode').value;
    const pnType = document.getElementById('pnType').value;
    
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
            let activePN = pnType === 'mil' ? match.milPN : match.commPN;
            let mating = getMatingConnector(match, pnType);

            let priContacts = resolveGroupContacts(groupSpecs, match.contactType);
            let matContacts = mating ? resolveGroupContacts(groupSpecs, mating.contactType) : [];

            return { 
                primary: { ...match, activePN, summary: summaryText, contacts: priContacts }, 
                mating: mating ? { ...mating, contacts: matContacts } : null 
            };
        });

        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = `<h3 style="color:var(--heading-color); margin-bottom: 15px;">Found ${matches.length} Matching Mating Solution Pair(s)</h3>`;
        resultsContainer.appendChild(headerDiv);

        currentCalculatedSolutions.forEach((pair, index) => {
            const pri = pair.primary;
            const mat = pair.mating;

            const priIsWall = pri.shellType === 'Wall Mount';
            let priFlangeHtml = priIsWall 
                ? `${pri.flangeAcc} (Est. $${pri.unitPriceFlange.toFixed(2)})`
                : `<span class="na-text">N/A (Not Required for Shell Type)</span>`;
            let priFastenerHtml = priIsWall 
                ? `${pri.fastenerQty}x <a href="${pri.fastenerUrl}" target="_blank">${pri.fastener}</a> (Est. $${pri.unitPriceFastener.toFixed(2)}/ea)`
                : `<span class="na-text">N/A (Not Required for Shell Type)</span>`;

            const matIsWall = mat ? mat.shellType === 'Wall Mount' : false;
            let matFlangeHtml = matIsWall 
                ? `${mat.flangeAcc} (Est. $${mat.unitPriceFlange.toFixed(2)})`
                : `<span class="na-text">N/A (Not Required for Shell Type)</span>`;
            let matFastenerHtml = matIsWall 
                ? `${mat.fastenerQty}x <a href="${mat.fastenerUrl}" target="_blank">${mat.fastener}</a> (Est. $${mat.unitPriceFastener.toFixed(2)}/ea)`
                : `<span class="na-text">N/A (Not Required for Shell Type)</span>`;

            let priContactListHtml = pri.contacts.map(c => 
                `<li><strong>${c.qty}x ${c.pn}</strong> - ${c.desc} (Est. $${c.price.toFixed(2)}/ea) ${c.isStd ? '<span class="na-text">(Standard Contact)</span>' : '<span style="color:#d97706; font-weight:bold;">(Specialty TC/Coax Contact)</span>'}</li>`
            ).join('');

            let matContactListHtml = mat ? mat.contacts.map(c => 
                `<li><strong>${c.qty}x ${c.pn}</strong> - ${c.desc} (Est. $${c.price.toFixed(2)}/ea) ${c.isStd ? '<span class="na-text">(Standard Contact)</span>' : '<span style="color:#d97706; font-weight:bold;">(Specialty TC/Coax Contact)</span>'}</li>`
            ).join('') : '<li>N/A</li>';

            const priTooling = getToolingStatus(pri.contacts);
            const matTooling = mat ? getToolingStatus(mat.contacts) : { results: [], missingTools: [] };

            let priToolHtml = priTooling.results.map(t => 
                `<li>Size ${t.contactSize} ${t.gender}: <strong>${t.frame}</strong> w/ <strong>${t.positioner}</strong> (${t.setting}) ${t.available ? '✅' : '⚠️ <span style="color:var(--alert-text);font-weight:bold;">[Tooling Missing]</span>'}</li>`
            ).join('');

            let matToolHtml = matTooling.results.map(t => 
                `<li>Size ${t.contactSize} ${t.gender}: <strong>${t.frame}</strong> w/ <strong>${t.positioner}</strong> (${t.setting}) ${t.available ? '✅' : '⚠️ <span style="color:var(--alert-text);font-weight:bold;">[Tooling Missing]</span>'}</li>`
            ).join('');

            let priToolAlert = priTooling.missingTools.length > 0 
                ? `<div class="tool-alert">⚠️ <strong>Missing Tooling Alert:</strong> Shop inventory lacks required tooling for ${priTooling.missingTools.map(m => `Size ${m.contactSize} ${m.gender} (${m.frame} + ${m.positioner})`).join(', ')}.</div>`
                : '';

            let matToolAlert = matTooling.missingTools.length > 0 
                ? `<div class="tool-alert">⚠️ <strong>Missing Tooling Alert:</strong> Shop inventory lacks required tooling for ${matTooling.missingTools.map(m => `Size ${m.contactSize} ${m.gender} (${m.frame} + ${m.positioner})`).join(', ')}.</div>`
                : '';

            const wrapper = document.createElement('div');
            wrapper.className = 'solution-pair-wrapper';
            wrapper.innerHTML = `
                <h3 style="margin-bottom: 12px; color: var(--heading-color);">Solution Pair #${index + 1}</h3>
                <div class="solution-grid">
                    <div class="solution-card primary-card">
                        <h4 style="margin-top:0; color:var(--accent-blue);">Primary Connector: ${pri.activePN}</h4>
                        <p><strong>Shell Type:</strong> ${pri.shellType} | <strong>Keying:</strong> ${pri.keying}</p>
                        <p><strong>Arrangement:</strong> ${pri.shellLabel}</p>
                        
                        <div class="diagram-section">
                            <div class="diagram-box">
                                <label>Insert Diagram:</label>
                                <a href="${pri.diagramImg}" target="_blank"><img class="preview-img" src="${pri.diagramImg}" alt="Insert Diagram"></a>
                            </div>
                            ${pri.shellType !== 'Plug' ? `
                            <div class="diagram-box">
                                <label>Panel Cutout:</label>
                                <a href="${pri.cutoutImg}" target="_blank"><img class="preview-img" src="${pri.cutoutImg}" alt="Panel Cutout"></a>
                            </div>` : ''}
                        </div>

                        <p><strong>Connector P/N:</strong> ${pri.activePN} (Est. $${pri.unitPriceConnector.toFixed(2)})</p>
                        <p><strong>Backshell P/N:</strong> ${pri.backshell} (Est. $${pri.unitPriceBackshell.toFixed(2)})</p>
                        <p><strong>Flange Accessory:</strong> ${priFlangeHtml}</p>
                        <p><strong>McMaster Fasteners:</strong> ${priFastenerHtml}</p>
                        <p style="margin-bottom: 2px;"><strong>Required Contacts:</strong></p>
                        <ul class="contact-list">${priContactListHtml}</ul>
                        
                        <div class="tooling-block">
                            <p style="margin-top:0; margin-bottom:4px;"><strong>Crimp Tooling Setup:</strong></p>
                            <ul class="tooling-list">${priToolHtml}</ul>
                            ${priToolAlert}
                        </div>

                        <div class="link-group" style="margin-top: 10px;">
                            <label>Distributor Live Stock:</label>
                            <a href="https://www.digikey.com/en/products/result?keywords=${encodeURIComponent(pri.activePN)}" target="_blank">DigiKey ↗</a>
                            <a href="https://www.mouser.com/c/?q=${encodeURIComponent(pri.activePN)}" target="_blank">Mouser ↗</a>
                            <a href="https://www.newark.com/search?st=${encodeURIComponent(pri.activePN)}" target="_blank">Newark ↗</a>
                        </div>
                    </div>

                    <div class="solution-card mating-card">
                        <h4 style="margin-top:0; color:var(--accent-blue);">Mating Connector: ${mat ? mat.activePN : 'N/A'}</h4>
                        <p><strong>Shell Type:</strong> ${mat ? mat.shellType : 'N/A'} | <strong>Keying:</strong> ${mat ? mat.keying : 'N/A'}</p>
                        <p><strong>Arrangement:</strong> ${mat ? mat.shellLabel : 'N/A'}</p>
                        
                        <div class="diagram-section">
                            <div class="diagram-box">
                                <label>Insert Diagram:</label>
                                <a href="${mat ? mat.diagramImg : '#'}" target="_blank"><img class="preview-img" src="${mat ? mat.diagramImg : ''}" alt="Mating Insert Diagram"></a>
                            </div>
                            ${mat && mat.shellType !== 'Plug' ? `
                            <div class="diagram-box">
                                <label>Panel Cutout:</label>
                                <a href="${mat ? mat.cutoutImg : '#'}" target="_blank"><img class="preview-img" src="${mat ? mat.cutoutImg : ''}" alt="Panel Cutout"></a>
                            </div>` : ''}
                        </div>

                        <p><strong>Connector P/N:</strong> ${mat ? mat.activePN : 'N/A'} (Est. $${mat ? mat.unitPriceConnector.toFixed(2) : '0.00'})</p>
                        <p><strong>Backshell P/N:</strong> ${mat ? mat.backshell : 'N/A'} (Est. $${mat ? mat.unitPriceBackshell.toFixed(2) : '0.00'})</p>
                        <p><strong>Flange Accessory:</strong> ${matFlangeHtml}</p>
                        <p><strong>McMaster Fasteners:</strong> ${matFastenerHtml}</p>
                        <p style="margin-bottom: 2px;"><strong>Required Contacts:</strong></p>
                        <ul class="contact-list">${matContactListHtml}</ul>
                        
                        <div class="tooling-block">
                            <p style="margin-top:0; margin-bottom:4px;"><strong>Crimp Tooling Setup:</strong></p>
                            <ul class="tooling-list">${mat ? matToolHtml : '<li>N/A</li>'}</ul>
                            ${matToolAlert}
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
                    <button type="button" class="btn-green" onclick="addSolutionPairToActiveList(${index})">+ Add Complete Mating Pair & Accessories to Active Project List</button>
                </div>
            `;
            resultsContainer.appendChild(wrapper);
        });
    } else {
        alert('No matching configurations found for these filter settings and pin requirements.');
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

    itemsToAdd.push(
        { pn: pri.activePN, qty: 1, desc: `38999 Series III Primary ${pri.shellLabel} ${pri.shellType}`, price: pri.unitPriceConnector },
        { pn: pri.backshell, qty: 1, desc: 'M85049/38 Strain Relief Backshell (Primary)', price: pri.unitPriceBackshell }
    );
    if (pri.shellType === 'Wall Mount') {
        itemsToAdd.push(
            { pn: pri.flangeAcc, qty: 1, desc: 'M85049/95 Flange (Primary)', price: pri.unitPriceFlange },
            { pn: "91737A313", qty: pri.fastenerQty, desc: 'Flange Fastener, Fillister Head 1" (Primary)', price: pri.unitPriceFastener }
        );
    }

    let isPriLC = pri.activePN.endsWith("LC");
    pri.contacts.forEach(c => {
        if (!c.isStd || includeStd || isPriLC) {
            itemsToAdd.push({ pn: c.pn, qty: c.qty, desc: `Primary ${c.desc}`, price: c.price });
        }
    });

    if (mat) {
        itemsToAdd.push(
            { pn: mat.activePN, qty: 1, desc: `38999 Series III Mating ${mat.shellLabel} ${mat.shellType}`, price: mat.unitPriceConnector },
            { pn: mat.backshell, qty: 1, desc: 'M85049/38 Strain Relief Backshell (Mating)', price: mat.unitPriceBackshell }
        );
        if (mat.shellType === 'Wall Mount') {
            itemsToAdd.push(
                { pn: mat.flangeAcc, qty: 1, desc: 'M85049/95 Flange (Mating)', price: mat.unitPriceFlange },
                { pn: "91737A313", qty: mat.fastenerQty, desc: 'Flange Fastener, Fillister Head 1" (Mating)', price: mat.unitPriceFastener }
            );
        }

        let isMatLC = mat.activePN.endsWith("LC");
        mat.contacts.forEach(c => {
            if (!c.isStd || includeStd || isMatLC) {
                itemsToAdd.push({ pn: c.pn, qty: c.qty, desc: `Mating ${c.desc}`, price: c.price });
            }
        });
    }

    projectLists[activeListName].push(...itemsToAdd);
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
    let grandTotal = 0;

    tbody.innerHTML = items.map((item, idx) => {
        let unitPrice = item.price || 0;
        let lineTotal = item.qty * unitPrice;
        grandTotal += lineTotal;

        return `
            <tr>
                <td><strong>${item.pn}</strong></td>
                <td>${item.qty}</td>
                <td>${item.desc}</td>
                <td>$${unitPrice.toFixed(2)}</td>
                <td>$${lineTotal.toFixed(2)}</td>
                <td style="text-align: center;"><button class="btn-red" style="padding: 4px 10px;" onclick="removeItem(${idx})">X</button></td>
            </tr>
        `;
    }).join('');

    document.getElementById('bomGrandTotal').innerHTML = `<strong>$${grandTotal.toFixed(2)}</strong>`;
}

function removeItem(idx) {
    let activeListName = document.getElementById('projectListSelect').value;
    projectLists[activeListName].splice(idx, 1);
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

window.onload = init;