/**
 * DataService - Unified Data Abstraction Layer
 * 
 * Supports dual loading:
 * 1. Asynchronous fetch() from data/*.json when hosted via HTTP/HTTPS (REST ready for future Axios)
 * 2. Instant fallback to window.CONNECTOR_DATA_FALLBACK when loaded via local file:// protocol
 */
const DataService = (function () {
    let _data = {
        series: [],
        shells: [],
        finishes: [],
        layouts: [],
        contacts: { ratings: [], m39029DB: {} },
        tooling: { shopInventory: { frames: [], positioners: [] }, toolingMatrix: {}, insertionExtractionTools: {} },
        accessories: { backshells: [], dustCaps: {}, flanges: {}, fasteners: {} }
    };
    let _isLoaded = false;
    let _loadPromise = null;

    async function load() {
        if (_isLoaded) return _data;
        if (_loadPromise) return _loadPromise;

        _loadPromise = (async () => {
            // Check if served over HTTP/HTTPS and fetch is supported
            const isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';

            if (isHttp) {
                try {
                    const [series, shells, finishes, layouts, contacts, tooling, accessories] = await Promise.all([
                        fetch('data/series.json').then(r => r.json()),
                        fetch('data/shells.json').then(r => r.json()),
                        fetch('data/finishes.json').then(r => r.json()),
                        fetch('data/layouts.json').then(r => r.json()),
                        fetch('data/contacts.json').then(r => r.json()),
                        fetch('data/tooling.json').then(r => r.json()),
                        fetch('data/accessories.json').then(r => r.json())
                    ]);

                    _data = { series, shells, finishes, layouts, contacts, tooling, accessories };
                    _isLoaded = true;
                    return _data;
                } catch (err) {
                    console.warn('DataService: HTTP fetch failed, falling back to embedded dataset.', err);
                }
            }

            // Fallback to window.CONNECTOR_DATA_FALLBACK
            if (window.CONNECTOR_DATA_FALLBACK) {
                _data = window.CONNECTOR_DATA_FALLBACK;
                _isLoaded = true;
                return _data;
            }

            console.error('DataService: Unable to load data from JSON endpoints or fallback bundle.');
            return _data;
        })();

        return _loadPromise;
    }

    // Synchronous fallback initializer if script executed synchronously
    function loadSyncFromFallback() {
        if (!_isLoaded && window.CONNECTOR_DATA_FALLBACK) {
            _data = window.CONNECTOR_DATA_FALLBACK;
            _isLoaded = true;
        }
        return _data;
    }

    // Initial attempt to bind fallback immediately so synchronous callers don't block
    loadSyncFromFallback();

    return {
        load,
        loadSyncFromFallback,
        get isLoaded() { return _isLoaded; },
        get rawData() { return _data; },

        // Series
        getSeries: () => _data.series || [],
        getSeriesById: (id) => (_data.series || []).find(s => s.id === id || s.standard === id),

        // Shells
        getShells: (seriesId) => {
            const shells = _data.shells || [];
            if (!seriesId) return shells;
            return shells.filter(s => s.seriesId === seriesId || (seriesId === 'mil' && s.seriesId === 'd38999') || (seriesId === 'comm' && s.seriesId === 'd38999'));
        },

        // Finishes
        getFinishes: (seriesId) => _data.finishes || [],
        getFinishByCode: (code) => (_data.finishes || []).find(f => f.code === code),

        // Layouts
        getLayouts: (seriesId, shellSize) => {
            let list = _data.layouts || [];
            if (seriesId) {
                list = list.filter(l => l.seriesId === seriesId || (seriesId === 'd38999' && (l.seriesId === 'd38999' || !l.seriesId)));
            }
            if (shellSize && shellSize !== 'ALL') {
                list = list.filter(l => l.shellSize === String(shellSize));
            }
            return list;
        },
        getLayoutByArrangement: (arrangement) => (_data.layouts || []).find(l => l.arrangement === arrangement),

        // Contacts
        getContactRatings: () => (_data.contacts && _data.contacts.ratings) ? _data.contacts.ratings : [],
        getM39029DB: () => (_data.contacts && _data.contacts.m39029DB) ? _data.contacts.m39029DB : {},

        // Tooling
        getShopInventory: () => (_data.tooling && _data.tooling.shopInventory) ? _data.tooling.shopInventory : { frames: [], positioners: [] },
        getToolingMatrix: () => (_data.tooling && _data.tooling.toolingMatrix) ? _data.tooling.toolingMatrix : {},
        getInsertionExtractionTools: () => (_data.tooling && _data.tooling.insertionExtractionTools) ? _data.tooling.insertionExtractionTools : {},

        // Accessories & Backshells
        getBackshells: () => (_data.accessories && _data.accessories.backshells) ? _data.accessories.backshells : [],
        getDustCapSpecs: () => (_data.accessories && _data.accessories.dustCaps) ? _data.accessories.dustCaps : {},
        getFlangeSpecs: () => (_data.accessories && _data.accessories.flanges) ? _data.accessories.flanges : {},
        getFastenerSpecs: () => (_data.accessories && _data.accessories.fasteners) ? _data.accessories.fasteners : {},

        // Dynamic Calculations
        getBackshellOptions: function (shellSize, finishCode) {
            const numShell = String(shellSize).padStart(2, '0');
            const szNum = parseInt(shellSize, 10);
            const finishObj = this.getFinishByCode(finishCode);
            const bsFinish = (finishObj && finishObj.backshellFinish) ? finishObj.backshellFinish : finishCode;

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
        },

        getDustCapOptions: function (shellSize, finishCode, letterCode) {
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
    };
})();

// Attach to window for global browser availability
if (typeof window !== 'undefined') {
    window.DataService = DataService;
    if (window.CONNECTOR_DATA_FALLBACK) {
        DataService.loadSyncFromFallback();
    }
}

