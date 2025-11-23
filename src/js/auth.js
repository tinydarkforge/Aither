/**
 * Aither - QR Code Manager for ASL Videos
 *
 * Copyright (c) 2025 Cirrus. All rights reserved.
 * Licensed under Proprietary License - see LICENSE file
 *
 * Authentication Module
 * Handles organization-based authentication using SHA-256 hashing
 *
 * Security Note: This is NOT production-grade security.
 * See README.md for security considerations.
 */

import {
  createOrganization,
  getOrganizationByName,
  getOrganizationById,
  updateOrganizationName,
  updateOrganizationPassword,
  deleteOrganization,
  getSetting,
  setSetting
} from './db.js';

const SESSION_KEY = 'aither_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Hash a password using SHA-256
 * @param {string} password - The password to hash
 * @returns {Promise<string>} The hex-encoded hash
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Login as superadmin
 * @param {string} password - Superadmin password
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function loginAsSuperadmin(password) {
  try {
    const hash = await hashPassword(password);

    // Check for password override in settings first
    const overrideHash = await getSetting('superadmin_password_hash');
    let expectedHash;

    if (overrideHash) {
      // Use the override hash if it exists
      expectedHash = overrideHash;
    } else {
      // Fall back to the environment variable
      expectedHash = import.meta.env.VITE_ADMIN_PASS_HASH;
    }

    if (!expectedHash) {
      return { success: false, message: 'System configuration error' };
    }

    if (hash !== expectedHash) {
      return { success: false, message: 'Invalid superadmin password' };
    }

    // Create superadmin session
    const session = {
      token: generateToken(),
      role: 'superadmin',
      expiresAt: Date.now() + SESSION_DURATION
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, message: 'Superadmin login successful' };
  } catch (error) {
    console.error('Superadmin login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}

/**
 * Register a new organization (superadmin only)
 * @param {string} orgName - Organization name
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, message: string, organizationId?: number}>}
 */
export async function registerOrganization(orgName, password) {
  try {
    // Verify superadmin session
    const session = getSession();
    if (!session || session.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized: Superadmin access required' };
    }

    // Validate inputs
    if (!orgName || !password) {
      return { success: false, message: 'Organization name and password are required' };
    }

    if (orgName.length < 3) {
      return { success: false, message: 'Organization name must be at least 3 characters' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Check if organization already exists
    const existing = await getOrganizationByName(orgName);
    if (existing) {
      return { success: false, message: 'An organization with this name already exists' };
    }

    // Create organization
    const passwordHash = await hashPassword(password);
    const organizationId = await createOrganization({
      name: orgName,
      passwordHash: passwordHash
    });

    return {
      success: true,
      message: 'Organization created successfully',
      organizationId: organizationId
    };
  } catch (error) {
    console.error('Organization registration error:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
}

/**
 * Attempt to log in with organization credentials
 * @param {string} orgName - Organization name
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, message: string}>} Login result
 */
export async function login(orgName, password) {
  try {
    // Validate inputs
    if (!orgName || !password) {
      return { success: false, message: 'Organization name and password are required' };
    }

    // Get organization
    const org = await getOrganizationByName(orgName);
    if (!org) {
      return { success: false, message: 'Invalid organization name or password' };
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== org.passwordHash) {
      return { success: false, message: 'Invalid organization name or password' };
    }

    // Create session
    const session = {
      token: generateToken(),
      role: 'organization',
      organizationId: org.id,
      organizationName: org.name,
      expiresAt: Date.now() + SESSION_DURATION
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
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

    // Check if session has required fields based on role
    if (session.role === 'superadmin') {
      return true;
    }

    if (session.role === 'organization' && session.organizationId) {
      return true;
    }

    logout();
    return false;
  } catch (error) {
    console.error('Error checking auth:', error);
    logout();
    return false;
  }
}

/**
 * Check if current user is superadmin
 * @returns {boolean} True if superadmin
 */
export function isSuperadmin() {
  const session = getSession();
  return session && session.role === 'superadmin';
}

/**
 * Require superadmin access - redirect if not superadmin
 */
export function requireSuperadmin() {
  if (!isSuperadmin()) {
    window.location.href = '/login.html';
  }
}

/**
 * Require organization access - redirect if not organization
 */
export function requireOrganization() {
  const session = getSession();
  if (!session || session.role !== 'organization') {
    window.location.href = '/login.html';
  }
}

/**
 * Get the current session data
 * @returns {Object|null} Session data or null if not authenticated
 */
export function getSession() {
  const sessionData = localStorage.getItem(SESSION_KEY);

  if (!sessionData) {
    return null;
  }

  try {
    const session = JSON.parse(sessionData);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      logout();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    logout();
    return null;
  }
}

/**
 * Get the current organization ID
 * @returns {number|null} Organization ID or null if not authenticated
 */
export function getCurrentOrganizationId() {
  const session = getSession();
  return session ? session.organizationId : null;
}

/**
 * Get the current organization name
 * @returns {string|null} Organization name or null if not authenticated
 */
export function getCurrentOrganizationName() {
  const session = getSession();
  return session ? session.organizationName : null;
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

// ============================================
// ORGANIZATION MANAGEMENT (SUPERADMIN ONLY)
// ============================================

/**
 * Rename an organization (superadmin only)
 * @param {number} orgId - Organization ID
 * @param {string} newName - New organization name
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function renameOrganization(orgId, newName) {
  try {
    // Verify superadmin session
    const session = getSession();
    if (!session || session.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized: Superadmin access required' };
    }

    // Validate new name
    if (!newName || newName.length < 3) {
      return { success: false, message: 'Organization name must be at least 3 characters' };
    }

    // Check if name is already taken by another organization
    const existing = await getOrganizationByName(newName);
    if (existing && existing.id !== orgId) {
      return { success: false, message: 'An organization with this name already exists' };
    }

    // Update organization name
    await updateOrganizationName(orgId, newName);

    return {
      success: true,
      message: 'Organization renamed successfully'
    };
  } catch (error) {
    console.error('Error renaming organization:', error);
    return { success: false, message: 'An error occurred while renaming the organization' };
  }
}

/**
 * Reset organization password (superadmin only)
 * @param {number} orgId - Organization ID
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function resetOrganizationPassword(orgId, newPassword) {
  try {
    // Verify superadmin session
    const session = getSession();
    if (!session || session.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized: Superadmin access required' };
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Hash and update password
    const passwordHash = await hashPassword(newPassword);
    await updateOrganizationPassword(orgId, passwordHash);

    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error) {
    console.error('Error resetting organization password:', error);
    return { success: false, message: 'An error occurred while resetting the password' };
  }
}

/**
 * Delete an organization and all its data (superadmin only)
 * @param {number} orgId - Organization ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function removeOrganization(orgId) {
  try {
    // Verify superadmin session
    const session = getSession();
    if (!session || session.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized: Superadmin access required' };
    }

    // Delete organization and all its data
    await deleteOrganization(orgId);

    return {
      success: true,
      message: 'Organization and all its data deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting organization:', error);
    return { success: false, message: 'An error occurred while deleting the organization' };
  }
}

/**
 * Change superadmin password (superadmin only)
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function changeSuperadminPassword(currentPassword, newPassword) {
  try {
    // Verify superadmin session
    const session = getSession();
    if (!session || session.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized: Superadmin access required' };
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters' };
    }

    // Verify current password
    const currentHash = await hashPassword(currentPassword);
    const overrideHash = await getSetting('superadmin_password_hash');
    const expectedHash = overrideHash || import.meta.env.VITE_ADMIN_PASS_HASH;

    if (!expectedHash) {
      return { success: false, message: 'System configuration error' };
    }

    if (currentHash !== expectedHash) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword);
    await setSetting('superadmin_password_hash', newHash);

    return {
      success: true,
      message: 'Superadmin password changed successfully'
    };
  } catch (error) {
    console.error('Error changing superadmin password:', error);
    return { success: false, message: 'An error occurred while changing the password' };
  }
}
