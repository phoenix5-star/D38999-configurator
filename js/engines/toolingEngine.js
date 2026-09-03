/**
 * ToolingEngine - Contact-to-Tooling Resolution Engine
 * 
 * Maps contact gauge sizes and pin/socket genders to DMC crimp frames,
 * positioner turret heads, selector settings, and M81969 insertion/removal tools.
 */

const ToolingEngine = (function () {
    /**
     * Resolves crimping tooling availability against active shop inventory.
     * @param {Array} contacts - Array of contact objects with { size, gender }
     * @param {Object} shopInventory - { frames: [...], positioners: [...] }
     * @param {Object} toolingMatrix - Mapping of size -> gender -> { frame, positioner, setting }
     * @returns {Object} { results, missingTools }
     */
    function getToolingStatus(contacts, shopInventory, toolingMatrix) {
        if (!contacts || !Array.isArray(contacts)) {
            return { results: [], missingTools: [] };
        }

        const shop = shopInventory || (typeof DataService !== 'undefined' ? DataService.getShopInventory() : { frames: [], positioners: [] });
        const matrix = toolingMatrix || (typeof DataService !== 'undefined' ? DataService.getToolingMatrix() : {});

        const shopFrames = (shop.frames || []).map(f => typeof f === 'string' ? f : f.id);
        const shopPositioners = (shop.positioners || []).map(p => typeof p === 'string' ? p : p.id);

        let results = [];
        let missingTools = [];

        contacts.forEach(c => {
            let tool = matrix[c.size] ? matrix[c.size][c.gender] : null;
            if (!tool) return;

            let frameAvailable = shopFrames.includes(tool.frame);
            let posAvailable = shopPositioners.includes(tool.positioner);
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

    /**
     * Renders standard M81969 insertion / removal tool reference HTML snippet.
     * @param {Array} contacts - Array of contacts
     * @param {Object} removalTools - Mapping of size -> { toolPN, colors, badgeClass, desc }
     * @returns {string} HTML snippet
     */
    function renderM81969Html(contacts, removalTools) {
        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) return '';
        const tools = removalTools || (typeof DataService !== 'undefined' ? DataService.getInsertionExtractionTools() : {});
        const sizes = [...new Set(contacts.map(c => c.size))];

        let items = sizes.map(sz => {
            let tool = tools[sz];
            if (tool) {
                return `<li>Size ${sz}: <strong>${tool.toolPN}</strong> <span class="m81969-badge ${tool.badgeClass}">[${tool.colors}]</span> <span class="na-text">(${tool.desc})</span></li>`;
            }
            return `<li>Size ${sz}: Standard Tool</li>`;
        }).join('');

        return `
            <div class="tooling-ref-header">📌 M81969 Insertion / Removal Tool Reference:</div>
            <ul class="m81969-list">${items}</ul>
        `;
    }

    return {
        getToolingStatus,
        renderM81969Html
    };
})();

// Attach to window
if (typeof window !== 'undefined') {
    window.ToolingEngine = ToolingEngine;
}
