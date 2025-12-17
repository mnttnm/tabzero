// Background service worker for Tab Triage
// Opens the app in a new tab when the extension icon is clicked.

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL("index.html");
  const tabs = await chrome.tabs.query({ url });

  if (tabs.length > 0) {
    const tab = tabs[0];
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tab.id, { active: true });
  } else {
    chrome.tabs.create({ url: "index.html" });
  }
});
