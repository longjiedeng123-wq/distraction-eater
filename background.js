// A simple hardcoded list for your MVP. 
// Later, you can use chrome.storage to let users add their own!
const blockedSites = ["youtube.com", "reddit.com", "instagram.com", "tiktok.com"];

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // We only care about the main frame (the actual website, not hidden iframes)
    if (details.frameId === 0) {
        let url = new URL(details.url);
        
        // Check if the domain matches our blocked list
        let isBlocked = blockedSites.some(site => url.hostname.includes(site));
        
        if (isBlocked) {
            // Redirect to our local "blocked" page
            let blockedUrl = chrome.runtime.getURL("blocked.html");
            chrome.tabs.update(details.tabId, { url: blockedUrl });
        }
    }
});