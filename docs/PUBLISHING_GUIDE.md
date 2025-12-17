# How to Publish Tab Triage to the Chrome Web Store

## 1. Prerequisites
*   A Google Account.
*   A [Chrome Web Store Developer Account](https://chrome.google.com/webstore/developer/dashboard) (requires a one-time $5 fee).
*   Your visuals (Icon, Screenshots, Marquee).

## 2. Prepare the Build
Run the following command in your terminal to build the production version of the extension:

```bash
npm run unzip
```
*(Wait, we need to add this script first, or run the manual steps below)*

**Manual Steps:**
1.  Open your terminal.
2.  Navigate to the project directory.
3.  Run: `npm run build`
4.  This creates a `dist` folder.
5.  **Create the ZIP:**
    *   **Mac/Linux:** `cd dist && zip -r ../extension.zip .`
    *   **Windows:** Right-click the `dist` folder contents (not the folder itself), select "Send to" -> "Compressed (zipped) folder" and rename to `extension.zip`.

## 3. Upload to Chrome Web Store
1.  Go to the [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
2.  Click **"New Item"**.
3.  Upload the `extension.zip` file you created.

## 4. Fill in the Listing
Use the content from `docs/STORE_LISTING.md` to fill in the fields:
*   **Description:** Copy the short and long descriptions.
*   **Category:** Select "Productivity".
*   **Language:** English.

## 5. Upload Assets
You will need to upload specific images:
*   **Store Icon:** 128x128px PNG (use `public/icon-128.png` or `dist/icon-128.png`).
*   **Screenshots:** Upload at least one screenshot (1280x800px recommended).
*   **Marquee:** 440x280px (Small) and 920x680px (Large). You can use `docs/promo_marquee.png` for the Large Marquee.

## 6. Privacy
*   **Privacy Policy:** Paste the content from `docs/PRIVACY_POLICY.md` into a Google Doc, publish it to the web ("File" -> "Share" -> "Publish to web"), and paste that link into the Privacy Policy URL field.
*   **Justification:** Copy the justifications from `docs/STORE_LISTING.md`.

## 7. Submit
Click **"Submit for Review"**. Reviews usually take 24-48 hours.
