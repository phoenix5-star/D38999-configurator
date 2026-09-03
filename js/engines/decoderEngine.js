/**
 * DecoderEngine - Multi-Standard Part Number Parser
 * 
 * Pure JavaScript domain logic with zero DOM dependencies.
 * Supports:
 * - MIL-DTL-38999 Series III (full spec and abbreviated shorthand)
 * - Amphenol Tri-Start TVS/CTVP (commercial and composite)
 */

const DecoderEngine = (function () {
    const MIL_SLASH_TO_SHELL_TYPE = {
        '20': 'Wall Mount',
        '22': 'Box Mount',
        '24': 'Jam Nut',
        '26': 'Plug'
    };

    const LETTER_CODE_TO_SHELL_SIZE = {
        'A': '9', 'B': '11', 'C': '13', 'D': '15', 'E': '17',
        'F': '19', 'G': '21', 'H': '23', 'J': '25'
    };

    const SHELL_LETTER_CODES = {
        '9': 'A', '11': 'B', '13': 'C', '15': 'D', '17': 'E',
        '19': 'F', '21': 'G', '23': 'H', '25': 'J'
    };

    const KEYING_POSITIONS = ['N', 'A', 'B', 'C', 'D', 'E'];

    /**
     * Parses a part number string into structured connector attributes.
     * @param {string} input - Raw part number string
     * @returns {Object|null} Decoded parameters and confidence score
     */
    function parse(input) {
        if (!input || typeof input !== 'string') return null;
        let raw = input.trim().toUpperCase().replace(/[\s\t]+/g, '');
        if (!raw) return null;

        const finishes = (typeof DataService !== 'undefined') ? DataService.getFinishes('d38999') : [];
        const masterLayouts = (typeof DataService !== 'undefined') ? DataService.getLayouts('d38999') : [];
        const shellTypes = (typeof DataService !== 'undefined') ? DataService.getShells('d38999') : [];

        let res = {
            standard: null,       // 'mil', 'comm', 'as'
            shellType: null,      // 'Plug', 'Wall Mount', 'Box Mount', 'Jam Nut', etc.
            finish: null,         // 'W', 'F', 'Z', 'T', 'K', 'J', 'M', 'N'
            shellSize: null,      // '9'..'25' or '06'..'12'
            arrangement: null,    // '11-35', '06-05', etc.
            contactType: null,    // 'P' or 'S'
            keying: null,         // 'N', 'A', 'B', 'C', 'D', 'E', 'U'
            raw: raw,
            confidence: 0
        };

        // 0. Check Deutsch AutoSport pattern (ASL, ASM, AS)
        // e.g. ASL606-05PN, ASL006-05SN, ASM607-05PN, AS608-04PN, AS010-13SN, AS710-05PN, AS612-10SN
        const asMatch = raw.match(/^(ASL|ASM|AS)([01267])[-_]?([01]?[0-9])[-_]?([0-9]{2,3})([PSAB])([NABCDEU]?)/);
        if (asMatch) {
            res.standard = 'as';
            const styleCode = asMatch[2];    // '6', '0', '7', '1', '2'
            const sizeCode = asMatch[3].padStart(2, '0'); // '06', '07', '08', '10', '12'
            const layoutCode = asMatch[4];   // '05', '03', '04', '07', '10', '13', '35'
            const contactChar = asMatch[5];  // 'P', 'S', 'A', 'B'
            const keyingChar = asMatch[6] || 'N';

            const AS_STYLE_TO_SHELL_TYPE = {
                '6': 'Plug',
                '0': '2-Hole Flange Receptacle',
                '7': 'Jam Nut Receptacle',
                '1': 'In-Line Receptacle',
                '2': '2-Hole Flange PCB Receptacle'
            };
            res.shellType = AS_STYLE_TO_SHELL_TYPE[styleCode] || 'Plug';
            res.finish = 'N'; // Standard AutoSport finish
            res.shellSize = sizeCode;
            res.arrangement = `${sizeCode}-${layoutCode}`;
            res.contactType = (contactChar === 'P' || contactChar === 'A') ? 'P' : 'S';
            res.keying = keyingChar;

            const asLayouts = (typeof DataService !== 'undefined') ? DataService.getLayouts('deutsch_autosport') : [];
            if (asLayouts.some(l => l.arrangement === res.arrangement)) {
                res.confidence = 6;
                return res;
            } else {
                res.confidence = 5;
                return res;
            }
        }

        // 1. Check Commercial pattern (TVS06, TVPS00, TVPS02, TVS07, CTV06, CTVP00, CTVP02, CTV07)
        const commPrefixMatch = raw.match(/^(TVS06|TVPS00|TVPS02|TVS07|CTV06|CTVP00|CTVP02|CTV07)/);
        if (commPrefixMatch) {
            res.standard = 'comm';
            let prefix = commPrefixMatch[1];
            let foundType = shellTypes.find(st => st.commPrefix === prefix || st.compPrefix === prefix);
            if (foundType) res.shellType = foundType.type;

            let remainder = raw.slice(prefix.length).replace(/^[-_]/, '');
            
            // Find finish code in commercial remainder
            let finishMatched = null;
            for (let f of finishes) {
                if (f.commCode && remainder.startsWith(f.commCode)) {
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

            // Shell size and layout number
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

            // Contact type
            if (remainder.startsWith('P')) {
                res.contactType = 'P';
                remainder = remainder.slice(1);
            } else if (remainder.startsWith('S')) {
                res.contactType = 'S';
                remainder = remainder.slice(1);
            }

            // Keying
            if (remainder.length > 0 && KEYING_POSITIONS.includes(remainder[0])) {
                res.keying = remainder[0];
            }

            let fieldsFound = [res.shellType, res.finish, res.shellSize, res.arrangement, res.contactType, res.keying].filter(Boolean).length;
            if (fieldsFound > 0) {
                res.confidence = fieldsFound;
                return res;
            }
        }

        // 2. Check Military pattern: D38999/26... or 26... or 20... or 22... or 24...
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

        // Slash sheet: 20, 22, 24, 26
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

        // Contact type (P, S, A, B)
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
            if (KEYING_POSITIONS.includes(kChar)) {
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

    return {
        parse,
        LETTER_CODE_TO_SHELL_SIZE,
        SHELL_LETTER_CODES,
        MIL_SLASH_TO_SHELL_TYPE,
        KEYING_POSITIONS
    };
})();

// Attach to window
if (typeof window !== 'undefined') {
    window.DecoderEngine = DecoderEngine;
}

