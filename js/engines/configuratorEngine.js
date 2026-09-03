/**
 * ConfiguratorEngine - Connector Solution Matching & Mating Engine
 * 
 * Handles:
 * - Contact group resolution (standard crimp, thermocouple pairs, coax)
 * - Mating connector generation (opposite gender, complementary shell style)
 * - Filter criteria matching and pricing evaluation
 */

const ConfiguratorEngine = (function () {
    /**
     * Resolves user contact specifications into catalog contact part numbers.
     * @param {Array} groupSpecs - [{ size, matType, qty }]
     * @param {string} gender - 'P' or 'S'
     * @param {Object} m39029DB - Contact database
     * @returns {Array} Array of resolved contact items with qty and pricing
     */
    function resolveGroupContacts(groupSpecs, gender, m39029DB) {
        if (!groupSpecs || !Array.isArray(groupSpecs)) return [];
        const db = m39029DB || (typeof DataService !== 'undefined' ? DataService.getM39029DB() : {});

        let totals = {};

        groupSpecs.forEach(g => {
            let typeMap = db[g.matType] || db["STD"] || {};
            let sizeEntry = typeMap[g.size] || (db["STD"] && db["STD"][g.size]) || (db["STD"] && db["STD"]["22D"]);
            if (!sizeEntry) return;

            let list = gender === 'P' ? sizeEntry.P : sizeEntry.S;
            if (!list) return;

            if (g.matType && g.matType.startsWith("TC_")) {
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

    /**
     * Finds the complementary mating connector in the database.
     * @param {Object} primary - Selected connector object
     * @param {string} pnType - 'mil' or 'comm'
     * @param {string} targetShellType - Desired mating shell type (optional)
     * @param {Array} database - Full connector database
     * @returns {Object|null} Mating connector object with activePN
     */
    function getMatingConnector(primary, pnType, targetShellType, database) {
        if (!primary) return null;
        const db = database || [];

        const isAutoSport = primary.seriesId === 'deutsch_autosport' || pnType === 'as' || ['06','07','08','10','12'].includes(primary.shellSize);

        if (!targetShellType) {
            if (isAutoSport) {
                targetShellType = primary.shellType === 'Plug' ? '2-Hole Flange Receptacle' : 'Plug';
            } else {
                targetShellType = primary.shellType === 'Plug' ? 'Wall Mount' : 'Plug';
            }
        }
        let targetContactType = primary.contactType === 'P' ? 'S' : 'P';
        
        let match = db.find(d => 
            d.shellSize === primary.shellSize &&
            d.arrangement === primary.arrangement &&
            d.shellType === targetShellType &&
            d.contactType === targetContactType &&
            d.keying === primary.keying
        );

        if (match) {
            let activePN = pnType === 'mil' ? match.milPN : (pnType === 'comm' ? match.commPN : (match.asPN || match.milPN));
            return { ...match, activePN };
        }
        return null;
    }

    /**
     * Filters the connector database by user selections and contact capacity.
     */
    function matchConnectors(params) {
        const {
            standard = 'mil',
            filterShellType = 'ALL',
            filterFinish = 'ALL',
            filterShellSize = 'ALL',
            filterArrangement = 'ALL',
            filterContactType = 'ALL',
            filterKeying = 'ALL',
            reqPins = {},
            database = []
        } = params;

        return database.filter(entry => {
            if (standard === 'as') {
                if (entry.seriesId !== 'deutsch_autosport') return false;
            } else {
                if (entry.seriesId === 'deutsch_autosport') return false;
                if (standard === 'mil' && entry.shellType === 'Box Mount') return false;
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
    }

    /**
     * Calculates structured solution objects for matching connectors.
     */
    function calculateSolutions(params) {
        const matches = matchConnectors(params);
        const { standard = 'mil', groupSpecs = [], database = [], m39029DB = null } = params;

        return matches.map(match => {
            let activePN = standard === 'mil' ? match.milPN : (standard === 'comm' ? match.commPN : (match.asPN || match.milPN));
            let defaultMatingShell = match.shellType === 'Plug' ? (standard === 'as' ? '2-Hole Flange Receptacle' : 'Wall Mount') : 'Plug';
            let mating = getMatingConnector(match, standard, defaultMatingShell, database);

            let priContacts = resolveGroupContacts(groupSpecs, match.contactType, m39029DB);
            let matContacts = mating ? resolveGroupContacts(groupSpecs, mating.contactType, m39029DB) : [];

            return {
                primary: {
                    ...match,
                    activePN,
                    resolvedContacts: priContacts
                },
                mating: mating ? {
                    ...mating,
                    resolvedContacts: matContacts
                } : null
            };
        });
    }

    return {
        resolveGroupContacts,
        getMatingConnector,
        matchConnectors,
        calculateSolutions
    };
})();

// Attach to window
if (typeof window !== 'undefined') {
    window.ConfiguratorEngine = ConfiguratorEngine;
}

