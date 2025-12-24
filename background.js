// Background service worker for Tab Triage
// Opens the app in a new tab when the extension icon is clicked.

const STORAGE_KEY = 'tab_triage_saved_items';
const NAVBAR_SETTINGS_KEY = 'navbar_settings';

// Open Tab Triage when extension icon is clicked
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL("index.html?view=review");
  const tabs = await chrome.tabs.query({ url });

  if (tabs.length > 0) {
    const tab = tabs[0];
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tab.id, { active: true });
  } else {
    chrome.tabs.create({ url: "index.html?view=review" });
  }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle_navbar') {
    // Get the active tab and send toggle message
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_NAVBAR' });
      } catch (error) {
        // Content script might not be loaded on this page (chrome://, etc.)
        console.log('Could not toggle navbar on this page');
      }
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NAVBAR_ACTION') {
    handleNavbarAction(message.action, message.data, sender.tab)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_NAVBAR_SETTINGS') {
    chrome.storage.local.get([NAVBAR_SETTINGS_KEY], (result) => {
      sendResponse({
        type: 'NAVBAR_SETTINGS_RESPONSE',
        settings: result[NAVBAR_SETTINGS_KEY] || { visibilityMode: 'persistent' },
      });
    });
    return true; // Keep channel open for async response
  }
});

// Save item from navbar action
async function handleNavbarAction(action, data, tab) {
  const newItem = {
    id: crypto.randomUUID(),
    originalTabId: tab?.id || 0,
    title: data.title || 'Untitled',
    url: data.url,
    timestamp: Date.now(),
    type: action === 'note' ? 'note' : 'saved',
    favorite: action === 'favorite',
    note: data.note || undefined,
  };

  // Get existing items
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  let items = result[STORAGE_KEY] || [];

  // Remove duplicate by URL (keep the new one)
  items = items.filter((i) => i.url !== data.url);

  // Add new item at the beginning
  items.unshift(newItem);

  // Save back to storage
  await chrome.storage.local.set({ [STORAGE_KEY]: items });

  // Close the tab after saving (matches main app behavior)
  if (tab?.id) {
    try {
      await chrome.tabs.remove(tab.id);
    } catch (error) {
      // Tab might already be closed or protected
      console.log('Could not close tab:', error.message);
    }
  }

  return { success: true };
}
