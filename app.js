// Configurator Metadata
const CONFIG_VERSION = "V001.2";

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

// M81969 Standard Insertion / Extraction Tool Reference Matrix
const M81969_TOOLS = {
    "22D": { toolPN: "M81969/14-01", colors: "Green / White", badgeClass: "badge-green", desc: "Plastic Insertion/Extraction (Size 22D)" },
    "20":  { toolPN: "M81969/14-10", colors: "Red / Orange", badgeClass: "badge-orange", desc: "Plastic Insertion/Extraction (Size 20)" },
    "16":  { toolPN: "M81969/14-03", colors: "Blue / White", badgeClass: "badge-blue", desc: "Plastic Insertion/Extraction (Size 16)" },
    "12":  { toolPN: "M81969/14-04", colors: "Yellow / White", badgeClass: "badge-yellow", desc: "Plastic Insertion/Extraction (Size 12)" },
    "8":   { toolPN: "M81969/14-06", colors: "Red / Blue (Size 8)", badgeClass: "badge-red", desc: "Plastic Insertion/Extraction (Size 8)" }
};

const contactRatings = [
    { size: "22D", maxAmps: 5.0,  label: "Size 22D (Max 5A)" },
    { size: "20",  maxAmps: 7.5,  label: "Size 20 (Max 7.5A)" },
    { size: "16",  maxAmps: 13.0, label: "Size 16 (Max 13A)" },
    { size: "12",  maxAmps: 23.0, label: "Size 12 (Max 23A)" },
    { size: "8",   maxAmps: 46.0, label: "Size 8 (Max 46A - Coax/Twinax/Power)" }
];

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
    { type: "Plug", milCode: "26", commPrefix: "TVS06", compPrefix: "CTV06" },
    { type: "Wall Mount", milCode: "20", commPrefix: "TVPS00", compPrefix: "CTVP00" },
    { type: "Box Mount", milCode: "22", commPrefix: "TVPS02", compPrefix: "CTVP02" },
    { type: "Jam Nut", milCode: "24", commPrefix: "TVS07", compPrefix: "CTV07" }
];

const finishes = [
    { code: "W", name: "Olive Drab Cadmium", commCode: "RW", isComp: false, costMult: 1.0 },
    { code: "F", name: "Electroless Nickel", commCode: "RF", isComp: false, costMult: 0.95 },
    { code: "Z", name: "Black Zinc Nickel", commCode: "RBZ", isComp: false, costMult: 1.15 },
    { code: "T", name: "Nickel PTFE / Durmalon", commCode: "RNF", isComp: false, costMult: 1.30 },
    { code: "K", name: "Passivated Stainless Steel", commCode: "RK", isComp: false, costMult: 1.85 },
    { code: "J", name: "Composite Olive Drab Cadmium", commCode: "RW", isComp: true, costMult: 1.25 },
    { code: "M", name: "Composite Electroless Nickel", commCode: "RF", isComp: true, costMult: 1.20 }
];

const contactTypes = ["P", "S"];
const keyingPositions = ["N", "A", "B", "C", "D", "E"];

function getBackshellOptions(shellSize, finishCode) {
    const numShell = String(shellSize).padStart(2, '0');
    const szNum = parseInt(shellSize, 10);
    return {
        "M85049/38": {
            key: "M85049/38",
            pn: `M85049/38-${numShell}${finishCode}`,
            desc: `M85049/38 Strain Relief Clamp (Size ${shellSize})`,
            price: 14.00 + (szNum * 0.85)
        },
        "M85049/88": {
            key: "M85049/88",
            pn: `M85049/88-${numShell}${finishCode}02`,
            desc: `M85049/88 EMI/RFI Banding Backshell w/ Band (Size ${shellSize})`,
            price: 28.00 + (szNum * 1.10)
        },
        "M85049/49": {
            key: "M85049/49",
            pn: `M85049/49-2-${numShell}${finishCode}`,
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
    const numShell = layout.shellSize.padStart(2, '0');
    const szNum = parseInt(layout.shellSize, 10);
    
    let basePrice = 30.00 + (szNum * 3.50);
    let flangePrice = 9.00 + (szNum * 0.50);

    let fastenerDesc = "Flange Fasteners, Fillister Head 1\" (McMaster: 91737A313, Box of 100)";
    let fastenerUrl = "https://www.mcmaster.com/91737A313/";
    let fastenerPrice = 10.04;
    let fastenerQty = 4;

    shellTypes.forEach(st => {
        finishes.forEach(fin => {
            contactTypes.forEach(ct => {
                keyingPositions.forEach(ky => {
                    const milPN = `D38999/${st.milCode}${fin.code}${layout.letterCode}${layout.arrangement.split('-')[1]}${ct}${ky}`;
                    const prefix = fin.isComp ? st.compPrefix : st.commPrefix;
                    const commPN = `${prefix}${fin.commCode}-${layout.arrangement}${ct}${ky !== 'N' ? ky : ''}`;

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
});

let currentCalculatedSolutions = [];
let projectLists = JSON.parse(localStorage.getItem('connector_projects')) || { "Default Project": [] };

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

let currentStandard = 'mil'; // 'mil' or 'comm'

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
    if (milBtn && commBtn) {
        if (standard === 'mil') {
            milBtn.classList.add('active');
            commBtn.classList.remove('active');
        } else {
            commBtn.classList.add('active');
            milBtn.classList.remove('active');
        }
    }

    updatePnStandardFilters();

    if (currentCalculatedSolutions && currentCalculatedSolutions.length > 0) {
        calculate();
    }
}

function updatePnStandardFilters() {
    const shellTypeSelect = document.getElementById('filterShellType');
    if (!shellTypeSelect) return;

    if (currentStandard === 'mil') {
        shellTypeSelect.innerHTML = `
            <option value="ALL">All Shell Types (D38999/20, /24, /26)</option>
            <option value="Plug">Straight Plug (D38999/26)</option>
            <option value="Wall Mount">Wall Mount Receptacle (D38999/20)</option>
            <option value="Jam Nut">Jam Nut Receptacle (D38999/24)</option>
        `;
    } else {
        shellTypeSelect.innerHTML = `
            <option value="ALL">All Shell Types (TVS06, TVPS00, TVPS02, TVS07)</option>
            <option value="Plug">Straight Plug (TVS06 / CTV06)</option>
            <option value="Wall Mount">Wall Mount Receptacle (TVPS00 / CTVP00)</option>
            <option value="Box Mount">Box Mount Receptacle (TVPS02 / CTVP02)</option>
            <option value="Jam Nut">Jam Nut Receptacle (TVS07 / CTV07)</option>
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
        let options = contactRatings.map(c => `<option value="${c.size}" ${c.size === '22D' ? 'selected' : ''}>${c.label}</option>`).join('');
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
    populateArrangementDropdown();
    updateListDropdown();
    loadActiveList();
    
    document.getElementById('mode').addEventListener('change', toggleInputMode);
    toggleInputMode();
    updatePnStandardFilters();
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
 * Parses a MIL-DTL-38999 Series III or Amphenol Commercial part number string (full or partial).
 * Supports:
 *   - Full Mil: D38999/26WE35PN, D38999/20FJ35SN
 *   - Short Mil: 26WE35PN, 20FJ35SN, 26W-E-35, 26WE35
 *   - Commercial: TVS06RF-11-35P, TVPS00RF-17-35S, TVPS02RW-15-19P, TVS07RBZ-21-35SN, CTV06RW-17-35P, CTVP00RF-13-35S
 */
function parsePartNumber(input) {
    if (!input || typeof input !== 'string') return null;
    let raw = input.trim().toUpperCase().replace(/[\s\t]+/g, '');
    if (!raw) return null;

    let res = {
        standard: null, // 'mil' or 'comm'
        shellType: null, // 'Plug', 'Wall Mount', 'Box Mount', 'Jam Nut'
        finish: null,    // 'W', 'F', 'Z', 'T', 'K', 'J', 'M'
        shellSize: null, // '9', '11', '13', '15', '17', '19', '21', '23', '25'
        arrangement: null, // '11-35', '17-35', etc.
        contactType: null, // 'P' or 'S'
        keying: null,     // 'N', 'A', 'B', 'C', 'D', 'E'
        raw: raw,
        confidence: 0
    };

    // Check Commercial pattern: starts with TVS06, TVPS00, TVPS02, TVS07, CTV06, CTVP00, CTVP02, CTV07
    const commPrefixMatch = raw.match(/^(TVS06|TVPS00|TVPS02|TVS07|CTV06|CTVP00|CTVP02|CTV07)/);
    if (commPrefixMatch) {
        res.standard = 'comm';
        let prefix = commPrefixMatch[1];
        let foundType = shellTypes.find(st => st.commPrefix === prefix || st.compPrefix === prefix);
        if (foundType) res.shellType = foundType.type;

        let remainder = raw.slice(prefix.length).replace(/^[-_]/, '');
        
        // Find finish in commercial remainder (RW, RF, RBZ, RNF, RK, W, F, Z, T, K, J, M)
        let finishMatched = null;
        for (let f of finishes) {
            if (remainder.startsWith(f.commCode)) {
                finishMatched = f.code;
                remainder = remainder.slice(f.commCode.length).replace(/^[-_]/, '');
                break;
            }
        }
        if (!finishMatched) {
            for (let f of finishes) {
                if (remainder.startsWith(f.code)) {
                    finishMatched = f.code;
                    remainder = remainder.slice(f.code.length).replace(/^[-_]/, '');
                    break;
                }
            }
        }
        if (finishMatched) res.finish = finishMatched;

        // Next part is shell size + layout or letter code + layout, e.g. 17-35, 1735, E35, 11-35, 25-35
        let matchLayout = remainder.match(/^(\d{1,2}|[A-J])[-_]?([0-9]{1,3})/);
        if (matchLayout) {
            let sizeOrLetter = matchLayout[1];
            let layoutNum = matchLayout[2];
            let sz = null;
            if (LETTER_CODE_TO_SHELL_SIZE[sizeOrLetter]) {
                sz = LETTER_CODE_TO_SHELL_SIZE[sizeOrLetter];
            } else if (parseInt(sizeOrLetter, 10) >= 9 && parseInt(sizeOrLetter, 10) <= 25) {
                sz = sizeOrLetter;
            }
            if (sz) {
                res.shellSize = sz;
                let fullArr = `${sz}-${layoutNum}`;
                if (masterLayouts.some(ml => ml.arrangement === fullArr)) {
                    res.arrangement = fullArr;
                }
            }
            remainder = remainder.slice(matchLayout[0].length).replace(/^[-_]/, '');
        }

        // Check contact type
        if (remainder.startsWith('P')) {
            res.contactType = 'P';
            remainder = remainder.slice(1);
        } else if (remainder.startsWith('S')) {
            res.contactType = 'S';
            remainder = remainder.slice(1);
        }

        // Check keying
        if (remainder.length > 0 && keyingPositions.includes(remainder[0])) {
            res.keying = remainder[0];
        }

        let fieldsFound = [res.shellType, res.finish, res.shellSize, res.arrangement, res.contactType, res.keying].filter(Boolean).length;
        if (fieldsFound > 0) {
            res.confidence = fieldsFound;
            return res;
        }
    }

    // Check Military pattern: D38999/26... or 26... or 20... or 22... or 24...
    let milClean = raw;
    if (milClean.startsWith('D38999/')) {
        milClean = milClean.slice(7);
        res.standard = 'mil';
    } else if (milClean.startsWith('D38999')) {
        milClean = milClean.slice(6).replace(/^\//, '');
        res.standard = 'mil';
    } else if (milClean.startsWith('38999/')) {
        milClean = milClean.slice(6);
        res.standard = 'mil';
    }

    // Now milClean starts with slash sheet: 20, 22, 24, 26
    let slashMatch = milClean.match(/^(20|22|24|26)/);
    if (slashMatch) {
        if (!res.standard) res.standard = 'mil';
        let slash = slashMatch[1];
        res.shellType = MIL_SLASH_TO_SHELL_TYPE[slash];
        milClean = milClean.slice(slash.length).replace(/^[-_]/, '');
    }

    // Finish code: W, F, Z, T, K, J, M
    if (milClean.length > 0) {
        let fChar = milClean[0];
        let foundFinish = finishes.find(f => f.code === fChar);
        if (foundFinish) {
            res.finish = fChar;
            milClean = milClean.slice(1).replace(/^[-_]/, '');
        }
    }

    // Shell size letter code (A-J) and layout number
    if (milClean.length > 0) {
        let letter = milClean[0];
        if (LETTER_CODE_TO_SHELL_SIZE[letter]) {
            res.shellSize = LETTER_CODE_TO_SHELL_SIZE[letter];
            milClean = milClean.slice(1).replace(/^[-_]/, '');

            // Layout number
            let layoutMatch = milClean.match(/^([0-9]{1,3})/);
            if (layoutMatch) {
                let layoutNum = layoutMatch[1];
                let fullArr = `${res.shellSize}-${layoutNum}`;
                if (masterLayouts.some(ml => ml.arrangement === fullArr)) {
                    res.arrangement = fullArr;
                }
                milClean = milClean.slice(layoutNum.length).replace(/^[-_]/, '');
            }
        }
    }

    // Contact type (P, S, A, B, C, D)
    if (milClean.length > 0) {
        let cChar = milClean[0];
        if (cChar === 'P' || cChar === 'S') {
            res.contactType = cChar;
            milClean = milClean.slice(1);
        } else if (cChar === 'A') { // Less Contacts - Pin
            res.contactType = 'P';
            milClean = milClean.slice(1);
        } else if (cChar === 'B') { // Less Contacts - Socket
            res.contactType = 'S';
            milClean = milClean.slice(1);
        }
    }

    // Keying position (N, A, B, C, D, E)
    if (milClean.length > 0) {
        let kChar = milClean[0];
        if (keyingPositions.includes(kChar)) {
            res.keying = kChar;
            milClean = milClean.slice(1);
        }
    }

    let fieldsCount = [res.shellType, res.finish, res.shellSize, res.arrangement, res.contactType, res.keying].filter(Boolean).length;
    if (fieldsCount > 0) {
        res.confidence = fieldsCount;
        return res;
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
        resultDiv.innerHTML = `<span style="color: #e53e3e;">Could not parse part number. Try format like <code>26WE35PN</code>, <code>D38999/20FJ35SN</code>, or <code>TVS06RF-11-35P</code>.</span>`;
        applyBtn.disabled = true;
        return;
    }

    applyBtn.disabled = false;
    resultDiv.style.display = 'block';

    let chipsHtml = [];
    if (decoded.standard) {
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Standard:</strong> ${decoded.standard === 'mil' ? 'Military' : 'Commercial'}</span>`);
    }
    if (decoded.shellType) {
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Shell Type:</strong> ${decoded.shellType}</span>`);
    }
    if (decoded.finish) {
        let fObj = finishes.find(f => f.code === decoded.finish);
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Finish:</strong> ${decoded.finish} (${fObj ? fObj.name : ''})</span>`);
    }
    if (decoded.shellSize) {
        chipsHtml.push(`<span class="pn-decode-chip"><strong>Shell Size:</strong> ${decoded.shellSize} (${SHELL_LETTER_CODES[decoded.shellSize] || ''})</span>`);
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
        let tool = TOOLING_MATRIX[c.size] ? TOOLING_MATRIX[c.size][c.gender] : null;
        if (!tool) return;

        let frameAvailable = SHOP_TOOLING.frames.includes(tool.frame);
        let posAvailable = SHOP_TOOLING.positioners.includes(tool.positioner);
        let isAvailable = frameAvailable && posAvailable;

        let status = {
            contactSize: c.size,
            gender: c.gender === 'P' ? 'Pin' : 'Socket',
            frame: tool.frame,
            positioner: tool.positioner,
            setting: tool.setting,
            available: isAvailable
        };

        results.push(status);
        if (!isAvailable) {
            missingTools.push(status);
        }
    });

    return { results, missingTools };
}

function getMatingConnector(primary, pnType, targetShellType) {
    if (!targetShellType) {
        targetShellType = primary.shellType === 'Plug' ? 'Wall Mount' : 'Plug';
    }
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
        if (pnType === 'mil' && entry.shellType === 'Box Mount') return false;
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
            let defaultMatingShell = match.shellType === 'Plug' ? 'Wall Mount' : 'Plug';
            let mating = getMatingConnector(match, pnType, defaultMatingShell);

            let priContacts = resolveGroupContacts(groupSpecs, match.contactType);
            let matContacts = mating ? resolveGroupContacts(groupSpecs, mating.contactType) : [];

            return { 
                primary: { 
                    ...match, 
                    activePN, 
                    summary: summaryText, 
                    contacts: priContacts,
                    selectedBackshell: match.shellType === 'Box Mount' ? 'NONE' : 'M85049/38',
                    includeDustCap: false
                }, 
                mating: mating ? { 
                    ...mating, 
                    contacts: matContacts,
                    selectedBackshell: mating.shellType === 'Box Mount' ? 'NONE' : 'M85049/38',
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

    const priIsWall = pri.shellType === 'Wall Mount';
    const priIsBox = pri.shellType === 'Box Mount';

    let priFlangeHtml = priIsWall 
        ? `${pri.flangeAcc} (Est. $${pri.unitPriceFlange.toFixed(2)})`
        : `<span class="na-text">N/A (Not Required for Shell Type)</span>`;
    let priFastenerHtml = (priIsWall || priIsBox)
        ? `4x <a href="https://www.mcmaster.com/91737A313/" target="_blank">91737A313</a> - Fillister Head 1" (Sold in Box of 100 @ $10.04 - covers up to 25 connectors)`
        : `<span class="na-text">N/A (Not Required for Shell Type)</span>`;

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

    const matIsWall = mat ? mat.shellType === 'Wall Mount' : false;
    const matIsBox = mat ? mat.shellType === 'Box Mount' : false;

    let matFlangeHtml = matIsWall 
        ? `${mat.flangeAcc} (Est. $${mat.unitPriceFlange.toFixed(2)})`
        : `<span class="na-text">N/A (Not Required for Shell Type)</span>`;
    let matFastenerHtml = (matIsWall || matIsBox)
        ? `4x <a href="https://www.mcmaster.com/91737A313/" target="_blank">91737A313</a> - Fillister Head 1" (Sold in Box of 100 @ $10.04 - covers up to 25 connectors)`
        : `<span class="na-text">N/A (Not Required for Shell Type)</span>`;

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
    if (pri.shellType === 'Plug') {
        const isMil = pnType === 'mil';
        if (isMil) {
            matingShellSelectorHtml = `
                <div style="margin-bottom: 8px;">
                    <label for="matingShellSelect_${index}"><strong>Mating Shell Style:</strong></label>
                    <select id="matingShellSelect_${index}" class="mating-shell-select" onchange="changeMatingShellType(${index}, this.value)">
                        <option value="Wall Mount" ${mat && mat.shellType === 'Wall Mount' ? 'selected' : ''}>Wall Mount Receptacle (D38999/20)</option>
                        <option value="Jam Nut" ${mat && mat.shellType === 'Jam Nut' ? 'selected' : ''}>Jam Nut Receptacle (D38999/24)</option>
                    </select>
                </div>
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
            `;
        }
    } else {
        matingShellSelectorHtml = `<p><strong>Shell Type:</strong> ${mat ? mat.shellType : 'N/A'} (Mates with Receptacle) | <strong>Keying:</strong> ${mat ? mat.keying : 'N/A'}</p>`;
    }

    return `
        <h3 style="margin-bottom: 12px; color: var(--heading-color);">Solution Pair #${index + 1}</h3>
        <div class="solution-grid">
            <div class="solution-card primary-card">
                <h4 style="margin-top:0; color:var(--accent);">Primary Connector: ${pri.activePN}</h4>
                <p><strong>Shell Type:</strong> ${pri.shellType} | <strong>Keying:</strong> ${pri.keying}</p>
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
                        <label><strong>Backshell Style:</strong></label>
                        ${priIsBox ? `<span class="box-mount-notice">Box Mount (No rear accessory threads)</span>` : `
                        <select onchange="updateCardBackshell(${index}, true, this.value)">
                            <option value="M85049/38" ${pri.selectedBackshell === 'M85049/38' ? 'selected' : ''}>Strain Relief (M85049/38) - $${priBackshellOpts['M85049/38'].price.toFixed(2)}</option>
                            <option value="M85049/88" ${pri.selectedBackshell === 'M85049/88' ? 'selected' : ''}>EMI Banding (M85049/88) - $${priBackshellOpts['M85049/88'].price.toFixed(2)}</option>
                            <option value="M85049/49" ${pri.selectedBackshell === 'M85049/49' ? 'selected' : ''}>Shrink Boot (M85049/49) - $${priBackshellOpts['M85049/49'].price.toFixed(2)}</option>
                            <option value="NONE" ${pri.selectedBackshell === 'NONE' ? 'selected' : ''}>None (No Backshell) - $0.00</option>
                        </select>`}
                    </div>
                    ${(!priIsBox && pri.selectedBackshell !== 'NONE') ? `<p style="margin: 4px 0 8px 0; font-size: 12px;"><strong>Active Backshell:</strong> ${priSelectedBs.pn} (Est. $${priSelectedBs.price.toFixed(2)})</p>` : ''}
                    
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
                        <label><strong>Backshell Style:</strong></label>
                        ${matIsBox ? `<span class="box-mount-notice">Box Mount (No rear accessory threads)</span>` : `
                        <select onchange="updateCardBackshell(${index}, false, this.value)">
                            <option value="M85049/38" ${mat.selectedBackshell === 'M85049/38' ? 'selected' : ''}>Strain Relief (M85049/38) - $${matBackshellOpts['M85049/38'].price.toFixed(2)}</option>
                            <option value="M85049/88" ${mat.selectedBackshell === 'M85049/88' ? 'selected' : ''}>EMI Banding (M85049/88) - $${matBackshellOpts['M85049/88'].price.toFixed(2)}</option>
                            <option value="M85049/49" ${mat.selectedBackshell === 'M85049/49' ? 'selected' : ''}>Shrink Boot (M85049/49) - $${matBackshellOpts['M85049/49'].price.toFixed(2)}</option>
                            <option value="NONE" ${mat.selectedBackshell === 'NONE' ? 'selected' : ''}>None (No Backshell) - $0.00</option>
                        </select>`}
                    </div>
                    ${(!matIsBox && mat.selectedBackshell !== 'NONE') ? `<p style="margin: 4px 0 8px 0; font-size: 12px;"><strong>Active Backshell:</strong> ${matSelectedBs.pn} (Est. $${matSelectedBs.price.toFixed(2)})</p>` : ''}
                    
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

    // Primary connector
    itemsToAdd.push({ 
        pn: pri.activePN, 
        qty: 1, 
        desc: `38999 Series III Primary ${pri.shellLabel} ${pri.shellType}`, 
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
    if (pri.shellType === 'Wall Mount') {
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
            desc: `38999 Series III Mating ${mat.shellLabel} ${mat.shellType}`, 
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
        if (mat.shellType === 'Wall Mount') {
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
        modal.classList.add('active');
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
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