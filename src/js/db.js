/**
 * Aither - QR Code Manager for ASL Videos
 *
 * Copyright (c) 2025 Daniel Oceno. All rights reserved.
 * Licensed under MIT - see LICENSE file
 *
 * Database Module
 * IndexedDB wrapper using Dexie.js for storing QR codes
 */

import Dexie from 'dexie';

// Initialize database
const db = new Dexie('AitherDB');

// Define schema versions
// Version 1: Original schema
db.version(1).stores({
  qrCodes: '++id, url, generatedAt, size, format'
});

// Version 2: Multi-tenant with organizations and collections
db.version(2).stores({
  organizations: '++id, name, createdAt',
  collections: '++id, organizationId, name, sourceUrl, createdAt, lastScannedAt',
  qrCodes: '++id, organizationId, collectionId, url, generatedAt, size, format'
}).upgrade(async tx => {
  // Migration: Add default organization for existing data
  const existingCodes = await tx.table('qrCodes').toArray();

  if (existingCodes.length > 0) {
    // Create a default organization for legacy data
    const defaultOrgId = await tx.table('organizations').add({
      name: 'Default Organization',
      passwordHash: null, // Will need to set password on first login
      createdAt: Date.now()
    });

    // Update all existing QR codes to belong to default organization
    await Promise.all(
      existingCodes.map(code =>
        tx.table('qrCodes').update(code.id, {
          organizationId: defaultOrgId,
          collectionId: null
        })
      )
    );
  }
});

// Version 3: Add settings table for superadmin configuration
db.version(3).stores({
  organizations: '++id, name, createdAt',
  collections: '++id, organizationId, name, sourceUrl, createdAt, lastScannedAt',
  qrCodes: '++id, organizationId, collectionId, url, generatedAt, size, format',
  settings: 'key, value'
});

// Version 4: Add title and description fields to QR codes
db.version(4).stores({
  organizations: '++id, name, createdAt',
  collections: '++id, organizationId, name, sourceUrl, createdAt, lastScannedAt',
  qrCodes: '++id, organizationId, collectionId, url, title, description, generatedAt, size, format',
  settings: 'key, value'
});

/**
 * Save a QR code to the database
 * @param {Object} qrData - QR code data
 * @param {string} qrData.url - The URL encoded in the QR
 * @param {string} qrData.imageData - Base64 encoded image data
 * @param {Object} qrData.options - QR generation options
 * @param {number} qrData.organizationId - Organization ID
 * @param {number} [qrData.collectionId] - Optional collection ID
 * @param {string} [qrData.title] - Optional title for the video
 * @param {string} [qrData.description] - Optional description for the video
 * @returns {Promise<number>} The ID of the saved record
 */
export async function saveQRCode(qrData) {
  try {
    const record = {
      url: qrData.url,
      imageData: qrData.imageData,
      options: qrData.options,
      organizationId: qrData.organizationId,
      collectionId: qrData.collectionId || null,
      title: qrData.title || null,
      description: qrData.description || null,
      generatedAt: Date.now(),
      size: qrData.options.width,
      format: 'png' // default format
    };

    const id = await db.qrCodes.add(record);
    return id;
  } catch (error) {
    console.error('Error saving QR code:', error);
    throw error;
  }
}

/**
 * Get all QR codes from the database for a specific organization
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Array>} Array of QR code records
 */
export async function getAllQRCodes(organizationId) {
  try {
    const codes = await db.qrCodes
      .where('organizationId').equals(organizationId)
      .reverse()
      .sortBy('generatedAt');
    return codes;
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    throw error;
  }
}

/**
 * Get a single QR code by ID
 * @param {number} id - The QR code ID
 * @returns {Promise<Object|null>} The QR code record or null if not found
 */
export async function getQRCodeById(id) {
  try {
    const code = await db.qrCodes.get(id);
    return code || null;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    throw error;
  }
}

/**
 * Delete a QR code by ID
 * @param {number} id - The QR code ID
 * @returns {Promise<void>}
 */
export async function deleteQRCode(id) {
  try {
    await db.qrCodes.delete(id);
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
}

/**
 * Update QR code title and description
 * @param {number} id - QR code ID
 * @param {Object} updates - Updates to apply
 * @param {string} [updates.title] - New title
 * @param {string} [updates.description] - New description
 * @param {string} [updates.imageData] - New QR code image data
 * @returns {Promise<void>}
 */
export async function updateQRCode(id, updates) {
  try {
    await db.qrCodes.update(id, updates);
  } catch (error) {
    console.error('Error updating QR code:', error);
    throw error;
  }
}

/**
 * Search QR codes by URL within an organization
 * @param {number} organizationId - Organization ID
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching QR code records
 */
export async function searchQRCodes(organizationId, searchTerm) {
  try {
    if (!searchTerm) {
      return getAllQRCodes(organizationId);
    }

    const codes = await db.qrCodes
      .where('organizationId').equals(organizationId)
      .filter(code => code.url.toLowerCase().includes(searchTerm.toLowerCase()))
      .toArray();

    return codes;
  } catch (error) {
    console.error('Error searching QR codes:', error);
    throw error;
  }
}

/**
 * Clear all QR codes (use with caution)
 * @returns {Promise<void>}
 */
export async function clearAllQRCodes() {
  try {
    await db.qrCodes.clear();
  } catch (error) {
    console.error('Error clearing QR codes:', error);
    throw error;
  }
}

/**
 * Get database statistics for an organization
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getStats(organizationId) {
  try {
    const codes = await db.qrCodes
      .where('organizationId').equals(organizationId)
      .toArray();

    const totalSize = codes.reduce((sum, code) => {
      // Rough estimate of data size
      return sum + (code.imageData ? code.imageData.length : 0);
    }, 0);

    return {
      totalCodes: codes.length,
      estimatedSizeBytes: totalSize,
      estimatedSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

// ============================================
// ORGANIZATION MANAGEMENT FUNCTIONS
// ============================================

/**
 * Create a new organization
 * @param {Object} orgData - Organization data
 * @param {string} orgData.name - Organization name
 * @param {string} orgData.passwordHash - SHA-256 password hash
 * @returns {Promise<number>} The ID of the created organization
 */
export async function createOrganization(orgData) {
  try {
    const record = {
      name: orgData.name,
      passwordHash: orgData.passwordHash,
      createdAt: Date.now()
    };

    const id = await db.organizations.add(record);
    return id;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

/**
 * Get organization by name
 * @param {string} name - Organization name
 * @returns {Promise<Object|null>} Organization record or null
 */
export async function getOrganizationByName(name) {
  try {
    const org = await db.organizations
      .where('name').equalsIgnoreCase(name)
      .first();
    return org || null;
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
}

/**
 * Get organization by ID
 * @param {number} id - Organization ID
 * @returns {Promise<Object|null>} Organization record or null
 */
export async function getOrganizationById(id) {
  try {
    const org = await db.organizations.get(id);
    return org || null;
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
}

/**
 * Update organization password
 * @param {number} id - Organization ID
 * @param {string} passwordHash - New password hash
 * @returns {Promise<void>}
 */
export async function updateOrganizationPassword(id, passwordHash) {
  try {
    await db.organizations.update(id, { passwordHash });
  } catch (error) {
    console.error('Error updating organization password:', error);
    throw error;
  }
}

/**
 * Update organization name
 * @param {number} id - Organization ID
 * @param {string} name - New organization name
 * @returns {Promise<void>}
 */
export async function updateOrganizationName(id, name) {
  try {
    await db.organizations.update(id, { name });
  } catch (error) {
    console.error('Error updating organization name:', error);
    throw error;
  }
}

/**
 * Delete an organization and all its data (QR codes and collections)
 * @param {number} id - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteOrganization(id) {
  try {
    // Delete all QR codes for this organization
    await db.qrCodes.where('organizationId').equals(id).delete();

    // Delete all collections for this organization
    await db.collections.where('organizationId').equals(id).delete();

    // Delete the organization itself
    await db.organizations.delete(id);
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
}

// ============================================
// COLLECTION MANAGEMENT FUNCTIONS
// ============================================

/**
 * Create a new collection
 * @param {Object} collectionData - Collection data
 * @param {number} collectionData.organizationId - Organization ID
 * @param {string} collectionData.name - Collection name
 * @param {string} collectionData.sourceUrl - Source directory URL
 * @returns {Promise<number>} The ID of the created collection
 */
export async function createCollection(collectionData) {
  try {
    const record = {
      organizationId: collectionData.organizationId,
      name: collectionData.name,
      sourceUrl: collectionData.sourceUrl,
      createdAt: Date.now(),
      lastScannedAt: Date.now()
    };

    const id = await db.collections.add(record);
    return id;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
}

/**
 * Get all collections for an organization
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Array>} Array of collection records
 */
export async function getCollections(organizationId) {
  try {
    const collections = await db.collections
      .where('organizationId').equals(organizationId)
      .reverse()
      .sortBy('createdAt');
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
}

/**
 * Get collection by ID
 * @param {number} id - Collection ID
 * @returns {Promise<Object|null>} Collection record or null
 */
export async function getCollectionById(id) {
  try {
    const collection = await db.collections.get(id);
    return collection || null;
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }
}

/**
 * Update collection's last scanned timestamp
 * @param {number} id - Collection ID
 * @returns {Promise<void>}
 */
export async function updateCollectionScanTime(id) {
  try {
    await db.collections.update(id, { lastScannedAt: Date.now() });
  } catch (error) {
    console.error('Error updating collection scan time:', error);
    throw error;
  }
}

/**
 * Delete a collection and all its QR codes
 * @param {number} id - Collection ID
 * @returns {Promise<void>}
 */
export async function deleteCollection(id) {
  try {
    // Delete all QR codes in this collection
    await db.qrCodes.where('collectionId').equals(id).delete();
    // Delete the collection itself
    await db.collections.delete(id);
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
}

/**
 * Get QR codes for a specific collection
 * @param {number} collectionId - Collection ID
 * @returns {Promise<Array>} Array of QR code records
 */
export async function getQRCodesByCollection(collectionId) {
  try {
    const codes = await db.qrCodes
      .where('collectionId').equals(collectionId)
      .reverse()
      .sortBy('generatedAt');
    return codes;
  } catch (error) {
    console.error('Error fetching QR codes for collection:', error);
    throw error;
  }
}

/**
 * Get collection statistics
 * @param {number} collectionId - Collection ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getCollectionStats(collectionId) {
  try {
    const codes = await getQRCodesByCollection(collectionId);

    return {
      totalCodes: codes.length,
      lastGenerated: codes.length > 0 ? codes[0].generatedAt : null
    };
  } catch (error) {
    console.error('Error getting collection stats:', error);
    throw error;
  }
}

// ============================================
// SETTINGS MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get a setting value by key
 * @param {string} key - Setting key
 * @returns {Promise<any|null>} Setting value or null if not found
 */
export async function getSetting(key) {
  try {
    const setting = await db.settings.get(key);
    return setting ? setting.value : null;
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
}

/**
 * Set a setting value
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {Promise<void>}
 */
export async function setSetting(key, value) {
  try {
    await db.settings.put({ key, value });
  } catch (error) {
    console.error('Error setting value:', error);
    throw error;
  }
}

/**
 * Delete a setting
 * @param {string} key - Setting key
 * @returns {Promise<void>}
 */
export async function deleteSetting(key) {
  try {
    await db.settings.delete(key);
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw error;
  }
}

export default db;
