# Tab Triage

Review, close, and note your open tabs. Tab Triage helps you declare "Tab Bankruptcy" and clear your mental clutter with a focused, gamified review process.

## Features

- **Focused Review**: Review tabs one by one in a distraction-free interface.
- **Quick Actions**:
  - Keep (Open)
  - Close
  - Save for Later
  - Add Note
  - Skip
- **Tab Persistence**: Tab Triage stays open and pinned while you review.
- **Background Sync**: Tabs closed in other windows are automatically removed from your review queue.
- **Keyboard Shortcuts**: Fly through your tabs without touching the mouse.

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Extension | `Cmd+Shift+E` / `Ctrl+Shift+E` |
| Close Tab | `X`, `Delete`, `Backspace` |
| Save for Later | `S` |
| Add Note | `N` |
| Open Tab | `O` |
| Skip Tab | `Right Arrow` |

## Installation

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Open Chrome and navigate to `chrome://extensions`.
5. Enable **Developer mode** (toggle in top right).
6. Click **Load unpacked**.
7. Select the `dist` folder in this project directory.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run dev server (for UI testing):
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Chrome Extensions key API
