
declare const chrome: any;

const extractionScript = () => {
  const getMeta = (prop: string) => {
    return document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') ||
           document.querySelector(`meta[name="${prop}"]`)?.getAttribute('content');
  };

  const getLink = (rel: string) => {
    return document.querySelector(`link[rel="${rel}"]`)?.getAttribute('href');
  };

  return {
    image: getMeta('og:image') || getMeta('twitter:image') || getLink('apple-touch-icon'),
    description: getMeta('og:description') || getMeta('description'),
    title: getMeta('og:title') || document.title
  };
};

export const getTabMetadata = async (tabId: number): Promise<{ image?: string, description?: string, title?: string }> => {
  if (typeof chrome === 'undefined' || !chrome.scripting) {
    return {};
    }

  try {
    // Race between script execution and a 2000ms timeout
    const scriptPromise = chrome.scripting.executeScript({
      target: { tabId },
      func: extractionScript,
    });
    
    const timeoutPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error("Metadata extraction timed out")), 2000)
    );

    const results = await Promise.race([scriptPromise, timeoutPromise]);

    if (results && results[0] && results[0].result) {
      return results[0].result;
    }
  } catch (error) {
    // console.warn(`Failed to extract metadata for tab ${tabId}`, error);
    // Silent fail is okay, we have fallbacks
  }
  return {};
};
