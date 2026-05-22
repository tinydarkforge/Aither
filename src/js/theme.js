/**
 * Aither - QR Code Manager for Video Content
 *
 * Copyright (c) 2025 Daniel Oceno. All rights reserved.
 * Licensed under MIT - see LICENSE file
 *
 * Theme Management Module
 * Handles light/dark theme switching and persistence
 */

const THEME_KEY = 'aither_theme';

/**
 * Get the current theme from localStorage or default to 'light'
 * @returns {string} 'light' or 'dark'
 */
export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

/**
 * Set the theme and persist to localStorage
 * @param {string} theme - 'light' or 'dark'
 */
export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

/**
 * Apply the theme to the document
 * @param {string} theme - 'light' or 'dark'
 */
export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme() {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on page load
 */
export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
}

/**
 * Create and return a theme toggle button element
 * @returns {HTMLElement} The theme toggle button
 */
export function createThemeToggle() {
  const toggle = document.createElement('button');
  toggle.className = 'theme-toggle';
  toggle.setAttribute('aria-label', 'Toggle theme');
  toggle.title = 'Toggle light/dark theme';

  const slider = document.createElement('div');
  slider.className = 'theme-toggle-slider';
  slider.textContent = getTheme() === 'dark' ? '🌙' : '☀️';

  toggle.appendChild(slider);

  toggle.addEventListener('click', () => {
    const newTheme = toggleTheme();
    slider.textContent = newTheme === 'dark' ? '🌙' : '☀️';
  });

  return toggle;
}

// Initialize theme when module loads
initTheme();
