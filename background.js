chrome.runtime.onInstalled.addListener(() => {
    console.log('NodeMonke Rank extension installed.');
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.includes('https://magiceden.io/ordinals/marketplace/nodemonkes') && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });
    }
});
