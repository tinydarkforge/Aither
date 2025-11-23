/**
 * Database Module
 * IndexedDB wrapper using Dexie.js for storing QR codes
 */

import Dexie from 'dexie';

// Initialize database
const db = new Dexie('AitherDB');

// Define schema
db.version(1).stores({
  qrCodes: '++id, url, generatedAt, size, format'
});

/**
 * Save a QR code to the database
 * @param {Object} qrData - QR code data
 * @param {string} qrData.url - The URL encoded in the QR
 * @param {string} qrData.imageData - Base64 encoded image data
 * @param {Object} qrData.options - QR generation options
 * @returns {Promise<number>} The ID of the saved record
 */
export async function saveQRCode(qrData) {
  try {
    const record = {
      url: qrData.url,
      imageData: qrData.imageData,
      options: qrData.options,
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
 * Get all QR codes from the database
 * @returns {Promise<Array>} Array of QR code records
 */
export async function getAllQRCodes() {
  try {
    const codes = await db.qrCodes.orderBy('generatedAt').reverse().toArray();
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
 * Search QR codes by URL
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching QR code records
 */
export async function searchQRCodes(searchTerm) {
  try {
    if (!searchTerm) {
      return getAllQRCodes();
    }

    const codes = await db.qrCodes
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
 * Get database statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getStats() {
  try {
    const count = await db.qrCodes.count();
    const codes = await db.qrCodes.toArray();

    const totalSize = codes.reduce((sum, code) => {
      // Rough estimate of data size
      return sum + (code.imageData ? code.imageData.length : 0);
    }, 0);

    return {
      totalCodes: count,
      estimatedSizeBytes: totalSize,
      estimatedSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

export default db;
