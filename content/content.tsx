import React from 'react';
import { createRoot } from 'react-dom/client';
import { FloatingNavbar } from './FloatingNavbar';
import { getNavbarStyles } from './styles';

// Content script entry point
// Creates a Shadow DOM container and renders the floating navbar

const HOST_ID = 'tab-triage-navbar-host';

function initNavbar() {
  // Prevent duplicate injection
  if (document.getElementById(HOST_ID)) {
    return;
  }

  // Create host element
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = 'all: initial;'; // Reset inherited styles
  document.body.appendChild(host);

  // Create Shadow DOM for style isolation
  const shadow = host.attachShadow({ mode: 'closed' });

  // Inject styles
  const style = document.createElement('style');
  style.textContent = getNavbarStyles();
  shadow.appendChild(style);

  // Create React mount point
  const container = document.createElement('div');
  shadow.appendChild(container);

  // Render React app
  const root = createRoot(container);
  root.render(<FloatingNavbar />);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbar);
} else {
  initNavbar();
}
