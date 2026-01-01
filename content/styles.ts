// Styles for the floating navbar - injected into Shadow DOM
// Uses system theme detection via prefers-color-scheme

export const getNavbarStyles = (): string => `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .navbar-container {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    cursor: grab;
    user-select: none;
  }

  .navbar-container.dragging {
    cursor: grabbing;
  }

  .navbar-container.custom-position {
    transform: none;
  }

  .navbar-container.visible {
    animation: slideUp 0.2s ease-out forwards;
  }

  .navbar-container.hidden {
    animation: slideDown 0.15s ease-in forwards;
    pointer-events: none;
  }

  .navbar-container.custom-position.visible {
    animation: fadeUp 0.2s ease-out forwards;
  }

  .navbar-container.custom-position.hidden {
    animation: fadeDown 0.15s ease-in forwards;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeDown {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  /* Light mode (default) */
  .navbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 5px 8px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  }

  .navbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #52525b;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
  }

  .navbar-btn:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #18181b;
  }

  .navbar-btn:active {
    transform: scale(0.95);
  }

  .navbar-btn.favorite:hover {
    color: #eab308;
  }

  .navbar-btn.save:hover {
    color: #3b82f6;
  }

  .navbar-btn.note:hover {
    color: #f97316;
  }

  .navbar-btn svg {
    width: 15px;
    height: 15px;
  }

  .divider {
    width: 1px;
    height: 16px;
    background: rgba(0, 0, 0, 0.08);
    margin: 0 2px;
  }

  /* Note popover */
  .note-popover {
    position: absolute;
    bottom: calc(100% + 12px);
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .note-popover textarea {
    width: 100%;
    height: 80px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    color: #18181b;
    font-size: 14px;
    font-family: inherit;
    resize: none;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .note-popover textarea::placeholder {
    color: #a1a1aa;
  }

  .note-popover textarea:focus {
    border-color: #3b82f6;
  }

  .note-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }

  .note-actions button {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .note-actions .cancel-btn {
    background: transparent;
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #52525b;
  }

  .note-actions .cancel-btn:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .note-actions .save-btn {
    background: #18181b;
    border: none;
    color: white;
  }

  .note-actions .save-btn:hover {
    background: #27272a;
  }

  .note-hint {
    font-size: 11px;
    color: #a1a1aa;
    margin-top: 8px;
  }

  /* Feedback toast */
  .feedback-toast {
    position: absolute;
    bottom: calc(100% + 12px);
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    background: #18181b;
    color: white;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    animation: toastIn 0.2s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .navbar {
      background: rgba(24, 24, 27, 0.85);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .navbar-btn {
      color: #a1a1aa;
    }

    .navbar-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fafafa;
    }

    .divider {
      background: rgba(255, 255, 255, 0.1);
    }

    .note-popover {
      background: rgba(24, 24, 27, 0.95);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .note-popover textarea {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.1);
      color: #fafafa;
    }

    .note-popover textarea::placeholder {
      color: #71717a;
    }

    .note-actions .cancel-btn {
      border-color: rgba(255, 255, 255, 0.1);
      color: #a1a1aa;
    }

    .note-actions .cancel-btn:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .note-actions .save-btn {
      background: #fafafa;
      color: #18181b;
    }

    .note-actions .save-btn:hover {
      background: #e4e4e7;
    }

    .note-hint {
      color: #71717a;
    }

    .feedback-toast {
      background: #fafafa;
      color: #18181b;
    }
  }
`;
