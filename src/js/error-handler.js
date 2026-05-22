/**
 * Aither - QR Code Manager for Video Content
 *
 * Copyright (c) 2025 Daniel Oceno. All rights reserved.
 * Licensed under MIT - see LICENSE file
 *
 * Error Handler Module
 * Global error boundary, error display, and retry mechanisms
 */

// Error types
export const ErrorType = {
  NETWORK: 'network',
  DATABASE: 'database',
  VALIDATION: 'validation',
  AUTHENTICATION: 'auth',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Error class with additional context
 */
export class AppError extends Error {
  constructor(message, type = ErrorType.UNKNOWN, severity = ErrorSeverity.ERROR, context = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Initialize global error handlers
 */
export function initializeErrorHandlers() {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    handleError(new AppError(
      event.error?.message || 'An unexpected error occurred',
      ErrorType.UNKNOWN,
      ErrorSeverity.ERROR,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    ));
    event.preventDefault();
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleError(new AppError(
      event.reason?.message || 'An asynchronous operation failed',
      ErrorType.UNKNOWN,
      ErrorSeverity.ERROR,
      { reason: event.reason }
    ));
    event.preventDefault();
  });

  // Create toast container if it doesn't exist
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

/**
 * Handle an error - log and display to user
 * @param {Error|AppError} error - The error to handle
 * @param {Object} options - Display options
 */
export function handleError(error, options = {}) {
  const {
    showToast = true,
    logToConsole = true,
    userMessage = null,
    duration = 5000
  } = options;

  // Log to console
  if (logToConsole) {
    if (error instanceof AppError) {
      console.error(`[${error.severity.toUpperCase()}] ${error.type}:`, error.message, error.context);
    } else {
      console.error('Error:', error);
    }
  }

  // Show toast notification
  if (showToast) {
    const message = userMessage || getUserFriendlyMessage(error);
    const severity = error instanceof AppError ? error.severity : ErrorSeverity.ERROR;
    showToast(message, severity, duration);
  }

  // Log to analytics/monitoring (if implemented)
  logError(error);
}

/**
 * Get user-friendly error message
 * @param {Error|AppError} error - The error
 * @returns {string} User-friendly message
 */
function getUserFriendlyMessage(error) {
  if (error instanceof AppError) {
    // Return the error message as-is (assumed to be user-friendly)
    return error.message;
  }

  // Map common errors to friendly messages
  const message = error.message?.toLowerCase() || '';

  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (message.includes('quota') || message.includes('storage')) {
    return 'Storage is full. Please delete some QR codes and try again.';
  }

  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'You don\'t have permission to perform this action.';
  }

  if (message.includes('not found')) {
    return 'The requested resource was not found.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} severity - Error severity (info, warning, error, critical)
 * @param {number} duration - How long to show the toast (ms)
 */
export function showToast(message, severity = ErrorSeverity.INFO, duration = 5000) {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.warn('Toast container not found. Call initializeErrorHandlers() first.');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${severity}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const icon = getIconForSeverity(severity);
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  // Add close handler
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  // Add to container
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('toast-show'), 10);

  // Auto-remove after duration
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

/**
 * Remove a toast notification
 * @param {HTMLElement} toast - The toast element
 */
function removeToast(toast) {
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');
  setTimeout(() => {
    toast.remove();
  }, 300);
}

/**
 * Get icon for severity level
 * @param {string} severity - Error severity
 * @returns {string} Icon HTML
 */
function getIconForSeverity(severity) {
  switch (severity) {
    case ErrorSeverity.INFO:
      return 'ℹ️';
    case ErrorSeverity.WARNING:
      return '⚠️';
    case ErrorSeverity.ERROR:
      return '❌';
    case ErrorSeverity.CRITICAL:
      return '🚨';
    default:
      return 'ℹ️';
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Log error for analytics/monitoring
 * @param {Error|AppError} error - The error to log
 */
function logError(error) {
  // In a production app, this would send to an analytics service
  // For now, we just store in sessionStorage for debugging
  try {
    const errors = JSON.parse(sessionStorage.getItem('error_log') || '[]');
    errors.push({
      message: error.message,
      type: error instanceof AppError ? error.type : 'unknown',
      severity: error instanceof AppError ? error.severity : 'error',
      context: error instanceof AppError ? error.context : {},
      timestamp: new Date().toISOString(),
      stack: error.stack
    });

    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }

    sessionStorage.setItem('error_log', JSON.stringify(errors));
  } catch (e) {
    // Silently fail if sessionStorage is full
    console.warn('Failed to log error:', e);
  }
}

/**
 * Get error log for debugging
 * @returns {Array} Array of logged errors
 */
export function getErrorLog() {
  try {
    return JSON.parse(sessionStorage.getItem('error_log') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear error log
 */
export function clearErrorLog() {
  sessionStorage.removeItem('error_log');
}

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the function
 */
export async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry = null,
    shouldRetry = () => true
  } = options;

  let lastError;
  let delay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (!shouldRetry(error) || attempt === maxAttempts) {
        throw error;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, maxAttempts, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next attempt
      delay *= backoffMultiplier;
    }
  }

  throw lastError;
}

/**
 * Wrap an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {Object} errorOptions - Options for handleError
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, errorOptions = {}) {
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      handleError(error, errorOptions);
      throw error;
    }
  };
}

/**
 * Validate user input and throw AppError if invalid
 * @param {*} value - Value to validate
 * @param {Object} rules - Validation rules
 * @throws {AppError} If validation fails
 */
export function validate(value, rules) {
  const { required, minLength, maxLength, pattern, custom } = rules;

  if (required && !value) {
    throw new AppError(
      rules.message || 'This field is required',
      ErrorType.VALIDATION,
      ErrorSeverity.WARNING
    );
  }

  if (minLength && value.length < minLength) {
    throw new AppError(
      rules.message || `Minimum length is ${minLength} characters`,
      ErrorType.VALIDATION,
      ErrorSeverity.WARNING
    );
  }

  if (maxLength && value.length > maxLength) {
    throw new AppError(
      rules.message || `Maximum length is ${maxLength} characters`,
      ErrorType.VALIDATION,
      ErrorSeverity.WARNING
    );
  }

  if (pattern && !pattern.test(value)) {
    throw new AppError(
      rules.message || 'Invalid format',
      ErrorType.VALIDATION,
      ErrorSeverity.WARNING
    );
  }

  if (custom && !custom(value)) {
    throw new AppError(
      rules.message || 'Validation failed',
      ErrorType.VALIDATION,
      ErrorSeverity.WARNING
    );
  }

  return true;
}

/**
 * Show a loading spinner
 * @param {string} message - Loading message
 * @returns {Object} Loading controller
 */
export function showLoading(message = 'Loading...') {
  // Remove existing loading overlay if any
  const existing = document.getElementById('loading-overlay');
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-message">${escapeHtml(message)}</div>
  `;

  document.body.appendChild(overlay);

  return {
    updateMessage: (newMessage) => {
      const msgEl = overlay.querySelector('.loading-message');
      if (msgEl) {
        msgEl.textContent = newMessage;
      }
    },
    hide: () => {
      overlay.classList.add('loading-hide');
      setTimeout(() => overlay.remove(), 300);
    }
  };
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('loading-hide');
    setTimeout(() => overlay.remove(), 300);
  }
}

/**
 * Confirm action with user
 * @param {string} message - Confirmation message
 * @param {Object} options - Dialog options
 * @returns {Promise<boolean>} True if confirmed
 */
export async function confirm(message, options = {}) {
  const {
    title = 'Confirm',
    confirmText = 'OK',
    cancelText = 'Cancel',
    severity = 'warning'
  } = options;

  return new Promise((resolve) => {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content modal-${severity}">
        <h3 class="modal-title">${escapeHtml(title)}</h3>
        <p class="modal-message">${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" data-action="cancel">${escapeHtml(cancelText)}</button>
          <button class="btn btn-primary" data-action="confirm">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle button clicks
    const handleClick = (confirmed) => {
      modal.classList.add('modal-hide');
      setTimeout(() => modal.remove(), 300);
      resolve(confirmed);
    };

    modal.querySelector('[data-action="confirm"]').addEventListener('click', () => handleClick(true));
    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => handleClick(false));

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        handleClick(false);
      }
    });

    // Show modal
    setTimeout(() => modal.classList.add('modal-show'), 10);
  });
}
