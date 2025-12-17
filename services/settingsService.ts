export const getApiKey = async (): Promise<string | null> => {
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  return result.geminiApiKey || null;
};

export const setApiKey = async (apiKey: string): Promise<void> => {
  await chrome.storage.sync.set({ geminiApiKey: apiKey });
};

export const hasApiKey = async (): Promise<boolean> => {
  const key = await getApiKey();
  return !!key;
};
