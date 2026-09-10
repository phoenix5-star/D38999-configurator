/**
 * GitHubService - Client-side GitHub REST & Git Data API integration
 * Facilitates multi-file batch commits, image blob uploads, and branch updates
 * without intermediate commit spam or third-party server requirements.
 */
const GitHubService = (function() {
    'use strict';

    const STORAGE_KEY = 'connector_admin_github_settings';
    const DEFAULT_REPO = 'phoenix5-star/D38999-configurator';
    const DEFAULT_BRANCH = 'main';

    /**
     * Retrieve stored GitHub configuration.
     * Checks sessionStorage first, then localStorage if remembered.
     */
    function getSettings() {
        let raw = null;
        try {
            raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) {
                raw = localStorage.getItem(STORAGE_KEY);
            }
        } catch (e) {
            console.warn('[GitHubService] Storage access error:', e);
        }

        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                return {
                    repo: (parsed.repo || DEFAULT_REPO).trim(),
                    branch: (parsed.branch || DEFAULT_BRANCH).trim(),
                    token: (parsed.token || '').trim(),
                    remember: Boolean(parsed.remember),
                    isConnected: Boolean(parsed.token && parsed.token.length > 10)
                };
            } catch (err) {
                console.error('[GitHubService] Failed to parse stored settings:', err);
            }
        }

        return {
            repo: DEFAULT_REPO,
            branch: DEFAULT_BRANCH,
            token: '',
            remember: false,
            isConnected: false
        };
    }

    /**
     * Save GitHub settings to session or local storage.
     */
    function saveSettings(settings) {
        const payload = {
            repo: (settings.repo || DEFAULT_REPO).trim(),
            branch: (settings.branch || DEFAULT_BRANCH).trim(),
            token: (settings.token || '').trim(),
            remember: Boolean(settings.remember)
        };

        const jsonStr = JSON.stringify(payload);
        try {
            if (payload.remember) {
                localStorage.setItem(STORAGE_KEY, jsonStr);
                sessionStorage.removeItem(STORAGE_KEY);
            } else {
                sessionStorage.setItem(STORAGE_KEY, jsonStr);
                localStorage.removeItem(STORAGE_KEY);
            }
            return true;
        } catch (e) {
            console.error('[GitHubService] Failed to save settings:', e);
            throw new Error('Unable to access browser storage: ' + e.message);
        }
    }

    /**
     * Clear stored GitHub credentials
     */
    function clearSettings() {
        try {
            sessionStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('[GitHubService] Error clearing storage:', e);
        }
    }

    /**
     * Helper to make authenticated GitHub REST API requests
     */
    async function apiRequest(endpoint, options = {}, token) {
        const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        let data = null;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            let errorMsg = `GitHub API Error (${response.status} ${response.statusText})`;
            if (data && data.message) {
                errorMsg = data.message;
            }
            if (response.status === 401) {
                errorMsg = 'Bad credentials or expired token. Please verify your Personal Access Token.';
            } else if (response.status === 404) {
                errorMsg = 'Repository or branch not found. Ensure the token has access to this repository.';
            } else if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
                errorMsg = 'GitHub API rate limit exceeded. Please wait a few minutes or provide an authenticated token.';
            }
            const err = new Error(errorMsg);
            err.status = response.status;
            err.details = data;
            throw err;
        }

        return data;
    }

    /**
     * Test connection and verify read/write access to repository.
     */
    async function testConnection(customSettings) {
        const settings = customSettings || getSettings();
        if (!settings.token) {
            throw new Error('Please enter a GitHub Personal Access Token.');
        }

        const parts = settings.repo.split('/');
        if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
            throw new Error('Repository format must be "owner/repo" (e.g. phoenix5-star/D38999-configurator).');
        }

        const owner = parts[0].trim();
        const repo = parts[1].trim();

        // 1. Verify Repository access
        const repoData = await apiRequest(`/repos/${owner}/${repo}`, {}, settings.token);

        // 2. Verify target branch exists
        const branchData = await apiRequest(`/repos/${owner}/${repo}/branches/${settings.branch}`, {}, settings.token);

        return {
            success: true,
            repoName: repoData.full_name,
            defaultBranch: repoData.default_branch,
            targetBranch: settings.branch,
            permissions: repoData.permissions || {},
            canPush: Boolean(repoData.permissions && repoData.permissions.push)
        };
    }

    /**
     * Atomic Multi-File Batch Commit via Git Data API
     * 
     * @param {Object} settings - { repo, branch, token }
     * @param {Object} batch - {
     *   dirtyDomains: Set<string> | Array<string>,
     *   workingData: Object,
     *   pendingImages: Map<string, Object> | Object,
     *   commitMessage: string,
     *   progressCallback: function(stepNumber, stepTitle, stepDetail)
     * }
     */
    async function publishBatch(settings, batch) {
        if (!settings || !settings.token) {
            throw new Error('GitHub token is required to publish changes.');
        }

        const repoParts = settings.repo.split('/');
        if (repoParts.length !== 2) {
            throw new Error('Invalid repository specified: ' + settings.repo);
        }
        const owner = repoParts[0].trim();
        const repo = repoParts[1].trim();
        const branch = (settings.branch || DEFAULT_BRANCH).trim();
        const token = settings.token;

        const progress = (num, title, detail) => {
            if (typeof batch.progressCallback === 'function') {
                batch.progressCallback(num, title, detail);
            }
        };

        // 1. Fetch head commit of target branch
        progress(1, 'Verifying branch state', `Retrieving head of branch '${branch}'...`);
        const refData = await apiRequest(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, {}, token);
        const latestCommitSha = refData.object.sha;

        // 2. Fetch commit to find base tree
        progress(2, 'Loading base tree', `Reading base tree from commit ${latestCommitSha.slice(0, 7)}...`);
        const commitData = await apiRequest(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, {}, token);
        const baseTreeSha = commitData.tree.sha;

        const treeItems = [];

        // 3. Upload binary images as Git blobs
        const pendingImages = batch.pendingImages instanceof Map 
            ? Array.from(batch.pendingImages.entries())
            : Object.entries(batch.pendingImages || {});

        if (pendingImages.length > 0) {
            progress(3, 'Uploading diagram images', `Uploading ${pendingImages.length} image blob(s)...`);
            for (let i = 0; i < pendingImages.length; i++) {
                const [imgPath, imgObj] = pendingImages[i];
                progress(3, 'Uploading diagram images', `Uploading ${imgObj.filename || imgPath} (${i + 1}/${pendingImages.length})...`);
                
                // Extract clean base64 data (strip data:image/png;base64, prefix if present)
                let b64 = imgObj.base64Data || '';
                if (b64.includes('base64,')) {
                    b64 = b64.split('base64,')[1];
                }

                if (!b64) {
                    console.warn('[GitHubService] Skipping empty image blob:', imgPath);
                    continue;
                }

                const blobRes = await apiRequest(`/repos/${owner}/${repo}/git/blobs`, {
                    method: 'POST',
                    body: JSON.stringify({
                        content: b64,
                        encoding: 'base64'
                    })
                }, token);

                treeItems.push({
                    path: imgPath.startsWith('/') ? imgPath.slice(1) : imgPath,
                    mode: '100644',
                    type: 'blob',
                    sha: blobRes.sha
                });
            }
        }

        // 4. Construct tree items for modified JSON domains
        const dirtyDomains = Array.from(batch.dirtyDomains || []);
        if (dirtyDomains.length > 0) {
            progress(4, 'Packaging catalog data', `Formatting ${dirtyDomains.length} domain JSON file(s)...`);
            for (const domain of dirtyDomains) {
                const domainData = batch.workingData[domain];
                if (domainData === undefined) continue;

                const jsonContent = JSON.stringify(domainData, null, 2) + '\n';
                treeItems.push({
                    path: `data/${domain}.json`,
                    mode: '100644',
                    type: 'blob',
                    content: jsonContent
                });
            }
        }

        if (treeItems.length === 0) {
            throw new Error('No changes to publish (tree items list is empty).');
        }

        // 5. Create new Git tree
        progress(5, 'Constructing Git tree', `Creating composite tree with ${treeItems.length} updated path(s)...`);
        const newTreeData = await apiRequest(`/repos/${owner}/${repo}/git/trees`, {
            method: 'POST',
            body: JSON.stringify({
                base_tree: baseTreeSha,
                tree: treeItems
            })
        }, token);
        const newTreeSha = newTreeData.sha;

        // 6. Create atomic commit
        progress(6, 'Creating atomic commit', 'Generating commit object...');
        const commitMsg = (batch.commitMessage || '').trim() || `feat(catalog): batch update from admin console (${new Date().toISOString().slice(0, 10)})`;
        const newCommitData = await apiRequest(`/repos/${owner}/${repo}/git/commits`, {
            method: 'POST',
            body: JSON.stringify({
                message: commitMsg,
                tree: newTreeSha,
                parents: [latestCommitSha]
            })
        }, token);
        const newCommitSha = newCommitData.sha;

        // 7. Update branch reference to point to new commit
        progress(7, 'Updating branch reference', `Pointing '${branch}' to commit ${newCommitSha.slice(0, 7)}...`);
        await apiRequest(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
            method: 'PATCH',
            body: JSON.stringify({
                sha: newCommitSha,
                force: false
            })
        }, token);

        progress(8, 'Published successfully!', `Commit ${newCommitSha.slice(0, 7)} created.`);

        return {
            success: true,
            commitSha: newCommitSha,
            commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
            branch,
            repo: `${owner}/${repo}`,
            filesChanged: treeItems.map(t => t.path),
            timestamp: new Date().toISOString()
        };
    }

    return {
        getSettings,
        saveSettings,
        clearSettings,
        testConnection,
        publishBatch
    };
})();

if (typeof window !== 'undefined') {
    window.GitHubService = GitHubService;
}
if (typeof module !== 'undefined') {
    module.exports = GitHubService;
}

