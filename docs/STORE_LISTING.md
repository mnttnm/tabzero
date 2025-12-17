# Chrome Web Store Listing Details

## Extension Name
Tab Triage - Clean Up Your Browser

## Short Description (Max 132 chars)
Declutter your browser. Review and organize open tabs to boost focus and reclaim memory.

## Long Description
Tab Triage helps you regain control of your browser window. If you struggle with "tab hoarding" or simply lose track of important pages amidst the clutter, Tab Triage is your solution.

**Key Features:**

*   **Intelligent Review Flow:** Review your open tabs one by one. Decide to Keep, Close, or Snooze them.
*   **Tab Organization:**
    *   **Dashboard view:** See all your kept tabs in one clean list.
    *   **Notes:** Add quick notes to tabs you keep so you remember *why* you saved them.
    *   **Favorites:** Mark critical tabs for easy access.
*   **Privacy-First:** Your data stays on your device.

**How it works:**
1.  Click the Tab Triage icon to enter triage mode.
2.  See your tabs presented clearly.
3.  Clear the clutter and focus on what matters.

## Category
Productivity / Workflow

## Permissions Justification

When submitting to the Chrome Web Store, you will be asked to justify the following permissions:

*   **`tabs`**: Required to list all open tabs in the browser, allowing the user to review, close, and switch to them directly from the extension interface.
*   **`storage`**: Used to save the user's settings, tab notes, and "favorites" status locally on the device.
*   **`activeTab`**: Used to access the currently active tab's properties when the user instigates the "Review" action.
*   **`scripting`**: Required to inject scripts that allow for proper tab management and interactions within the review flow.
*   **`Host Permissions (<all_urls>)`**: Tab Triage needs to access metadata (Title, URL) from tabs on any domain to provide its core "Triage" features. Without this, the extension cannot read the details of the tabs the user wants to organize.

## Single Purpose Description
The single purpose of Tab Triage is to help users manage and reduce browser tab clutter through a structured review and organization interface.
