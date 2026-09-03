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
            standard: null,       // 'mil', 'comm', 'asl'
            shellType: null,      // 'Plug', 'Wall Mount', 'Box Mount', 'Jam Nut', etc.
            finish: null,         // 'W', 'F', 'Z', 'T', 'K', 'J', 'M'
            shellSize: null,      // '9'..'25'
            arrangement: null,    // '11-35', '17-35', etc.
            contactType: null,    // 'P' or 'S'
            keying: null,         // 'N', 'A', 'B', 'C', 'D', 'E'
            raw: raw,
            confidence: 0
        };

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
