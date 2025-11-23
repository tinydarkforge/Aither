/**
 * Authentication Module
 * Handles client-side password authentication using SHA-256 hashing
 *
 * Security Note: This is NOT production-grade security.
 * See README.md for security considerations.
 */

const SESSION_KEY = 'aither_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Hash a password using SHA-256
 * @param {string} password - The password to hash
 * @returns {Promise<string>} The hex-encoded hash
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Attempt to log in with a password
 * @param {string} password - The password to check
 * @returns {Promise<boolean>} True if login successful
 */
export async function login(password) {
  const hash = await hashPassword(password);
  const expectedHash = import.meta.env.VITE_ADMIN_PASS_HASH;

  if (!expectedHash) {
    console.error('VITE_ADMIN_PASS_HASH not set in environment');
    return false;
  }

  if (hash === expectedHash) {
    // Create session token
    const session = {
      token: generateToken(),
      expiresAt: Date.now() + SESSION_DURATION
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  }

  return false;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if valid session exists
 */
export function checkAuth() {
  const sessionData = localStorage.getItem(SESSION_KEY);

  if (!sessionData) {
    return false;
  }

  try {
    const session = JSON.parse(sessionData);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking auth:', error);
    logout();
    return false;
  }
}

/**
 * Log out the current user
 */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function requireAuth() {
  if (!checkAuth()) {
    window.location.href = '/login.html';
  }
}

/**
 * Generate a random session token
 * @returns {string} Random token
 */
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get remaining session time in milliseconds
 * @returns {number|null} Milliseconds until expiration, or null if not logged in
 */
export function getSessionTimeRemaining() {
  const sessionData = localStorage.getItem(SESSION_KEY);

  if (!sessionData) {
    return null;
  }

  try {
    const session = JSON.parse(sessionData);
    const remaining = session.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return null;
  }
}
