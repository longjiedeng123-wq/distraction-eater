// background.js

function updateBlockingRules() {
  chrome.storage.local.get(['blockedSites', 'mode'], (result) => {
    const sites = result.blockedSites || [];
    const mode = result.mode || 'blacklist'; // Default to blacklist
    let newRules = [];

    // --- RULE GENERATION ---
    if (mode === 'blacklist') {
      // BLACKLIST: Block only specific sites
      newRules = sites.map((site, index) => ({
        id: index + 1,
        priority: 1,
        action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
        condition: { urlFilter: site, resourceTypes: ["main_frame"] }
      }));
    } else if (mode === 'whitelist') {
      // WHITELIST: Block everything...
      newRules.push({
        id: 1,
        priority: 1, // Base priority
        action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
        condition: { resourceTypes: ["main_frame"] } // No urlFilter means "match all URLs"
      });

      // ...But allow specific sites (requires higher priority!)
      sites.forEach((site, index) => {
        newRules.push({
          id: index + 2, 
          priority: 2, // Overrides the block rule
          action: { type: "allow" },
          condition: { urlFilter: site, resourceTypes: ["main_frame"] }
        });
      });
    }

    // Apply the rules
    chrome.declarativeNetRequest.getDynamicRules((oldRules) => {
      const oldRuleIds = oldRules.map(rule => rule.id);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: newRules
      }, () => console.log(`Active rules updated! Mode: ${mode}`));
    });

    // --- TAB SCRUBBER (The Loophole Fix) ---
    chrome.tabs.query({}, (tabs) => {
      const blockedUrl = chrome.runtime.getURL("blocked.html");
      
      tabs.forEach(tab => {
        // Ignore internal Chrome/Edge pages and our own blocked page
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.includes(blockedUrl)) {
          return;
        }

        const isSiteOnList = sites.some(site => tab.url.includes(site));
        let shouldBlock = false;

        if (mode === 'blacklist' && isSiteOnList) {
          shouldBlock = true; // Site is on the naughty list
        } else if (mode === 'whitelist' && !isSiteOnList) {
          shouldBlock = true; // Site is NOT on the allowed list
        }

        if (shouldBlock) {
          chrome.tabs.update(tab.id, { url: blockedUrl });
        }
      });
    });

  });
}

// Run when extension loads
chrome.runtime.onInstalled.addListener(updateBlockingRules);

// Listen for BOTH site changes and mode toggle changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.blockedSites || changes.mode)) {
    updateBlockingRules();
  }
});