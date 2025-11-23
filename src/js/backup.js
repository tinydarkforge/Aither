/**
 * Aither - QR Code Manager for ASL Videos
 *
 * Copyright (c) 2025 Cirrus. All rights reserved.
 * Licensed under Proprietary License - see LICENSE file
 *
 * Backup and Export Module
 * Handles data backup, export, and import functionality
 */

import db from './db.js';
import { showToast, AppError, ErrorType, ErrorSeverity, showLoading, hideLoading } from './error-handler.js';

/**
 * Export all data for current organization
 * @param {number} organizationId - Organization ID to export
 * @returns {Promise<Object>} Exported data
 */
export async function exportOrganizationData(organizationId) {
  try {
    const loading = showLoading('Preparing export...');

    // Get organization
    const organization = await db.organizations.get(organizationId);
    if (!organization) {
      throw new AppError(
        'Organization not found',
        ErrorType.DATABASE,
        ErrorSeverity.ERROR
      );
    }

    // Get all QR codes for this organization
    const qrCodes = await db.qrCodes
      .where('organizationId')
      .equals(organizationId)
      .toArray();

    // Build export object
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      organization: {
        id: organization.id,
        name: organization.name,
        createdAt: organization.createdAt
      },
      qrCodes: qrCodes.map(qr => ({
        id: qr.id,
        url: qr.url,
        playerUrl: qr.playerUrl,
        dataURL: qr.dataURL,
        collection: qr.collection,
        createdAt: qr.createdAt
      })),
      statistics: {
        totalQRCodes: qrCodes.length,
        collections: [...new Set(qrCodes.map(qr => qr.collection).filter(Boolean))].length
      }
    };

    loading.hide();
    return exportData;
  } catch (error) {
    hideLoading();
    throw new AppError(
      `Failed to export data: ${error.message}`,
      ErrorType.DATABASE,
      ErrorSeverity.ERROR,
      { originalError: error }
    );
  }
}

/**
 * Export all organizations (superadmin only)
 * @returns {Promise<Object>} Exported data
 */
export async function exportAllOrganizations() {
  try {
    const loading = showLoading('Exporting all organizations...');

    // Get all organizations
    const organizations = await db.organizations.toArray();

    // Get all QR codes
    const allQRCodes = await db.qrCodes.toArray();

    // Build export object
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        createdAt: org.createdAt,
        qrCodes: allQRCodes
          .filter(qr => qr.organizationId === org.id)
          .map(qr => ({
            id: qr.id,
            url: qr.url,
            playerUrl: qr.playerUrl,
            dataURL: qr.dataURL,
            collection: qr.collection,
            createdAt: qr.createdAt
          }))
      })),
      statistics: {
        totalOrganizations: organizations.length,
        totalQRCodes: allQRCodes.length
      }
    };

    loading.hide();
    return exportData;
  } catch (error) {
    hideLoading();
    throw new AppError(
      `Failed to export organizations: ${error.message}`,
      ErrorType.DATABASE,
      ErrorSeverity.ERROR,
      { originalError: error }
    );
  }
}

/**
 * Download export data as JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
export function downloadExportFile(data, filename) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(`Export saved as ${link.download}`, ErrorSeverity.INFO);
  } catch (error) {
    throw new AppError(
      'Failed to download export file',
      ErrorType.UNKNOWN,
      ErrorSeverity.ERROR,
      { originalError: error }
    );
  }
}

/**
 * Validate import data structure
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
export function validateImportData(data) {
  const errors = [];
  const warnings = [];

  // Check version
  if (!data.version) {
    errors.push('Missing version field');
  } else if (data.version !== '1.0.0') {
    warnings.push(`Version mismatch: ${data.version} (current: 1.0.0)`);
  }

  // Check export date
  if (!data.exportDate) {
    warnings.push('Missing export date');
  }

  // Check organizations
  if (data.organizations) {
    // Multi-organization export
    if (!Array.isArray(data.organizations)) {
      errors.push('Organizations must be an array');
    } else if (data.organizations.length === 0) {
      errors.push('No organizations to import');
    } else {
      // Validate each organization
      data.organizations.forEach((org, index) => {
        if (!org.name) {
          errors.push(`Organization ${index}: Missing name`);
        }
        if (!Array.isArray(org.qrCodes)) {
          errors.push(`Organization ${index}: QR codes must be an array`);
        }
      });
    }
  } else if (data.organization) {
    // Single organization export
    if (!data.organization.name) {
      errors.push('Organization missing name');
    }
    if (!Array.isArray(data.qrCodes)) {
      errors.push('QR codes must be an array');
    }
  } else {
    errors.push('No organization data found');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Import organization data
 * @param {Object} data - Data to import
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Import result
 */
export async function importOrganizationData(data, options = {}) {
  const {
    organizationId = null,
    mode = 'merge', // 'merge' or 'replace'
    skipExisting = true
  } = options;

  try {
    const loading = showLoading('Importing data...');

    // Validate data
    const validation = validateImportData(data);
    if (!validation.valid) {
      throw new AppError(
        `Invalid import data: ${validation.errors.join(', ')}`,
        ErrorType.VALIDATION,
        ErrorSeverity.ERROR,
        { validation }
      );
    }

    // Show warnings
    if (validation.warnings.length > 0) {
      showToast(
        `Import warnings: ${validation.warnings.join(', ')}`,
        ErrorSeverity.WARNING,
        8000
      );
    }

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    // Handle single organization import
    if (data.organization && organizationId) {
      // Replace mode: delete existing QR codes
      if (mode === 'replace') {
        const existingQRs = await db.qrCodes
          .where('organizationId')
          .equals(organizationId)
          .toArray();

        for (const qr of existingQRs) {
          await db.qrCodes.delete(qr.id);
        }
      }

      // Import QR codes
      for (const qrData of data.qrCodes) {
        try {
          // Check if QR code already exists (by URL)
          const existing = await db.qrCodes
            .where('url')
            .equals(qrData.url)
            .and(qr => qr.organizationId === organizationId)
            .first();

          if (existing && skipExisting) {
            skipped++;
            continue;
          }

          // Import QR code
          await db.qrCodes.add({
            organizationId,
            url: qrData.url,
            playerUrl: qrData.playerUrl,
            dataURL: qrData.dataURL,
            collection: qrData.collection || null,
            createdAt: qrData.createdAt || new Date().toISOString()
          });

          imported++;
        } catch (error) {
          console.error('Failed to import QR code:', error);
          failed++;
        }
      }
    }

    loading.hide();

    const result = {
      success: true,
      imported,
      skipped,
      failed,
      message: `Import complete: ${imported} imported, ${skipped} skipped, ${failed} failed`
    };

    showToast(result.message, ErrorSeverity.INFO, 5000);

    return result;
  } catch (error) {
    hideLoading();
    throw new AppError(
      `Failed to import data: ${error.message}`,
      ErrorType.DATABASE,
      ErrorSeverity.ERROR,
      { originalError: error }
    );
  }
}

/**
 * Import all organizations (superadmin only)
 * @param {Object} data - Data to import
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Import result
 */
export async function importAllOrganizations(data, options = {}) {
  const {
    skipExisting = true,
    updatePasswords = false
  } = options;

  try {
    const loading = showLoading('Importing organizations...');

    // Validate data
    const validation = validateImportData(data);
    if (!validation.valid) {
      throw new AppError(
        `Invalid import data: ${validation.errors.join(', ')}`,
        ErrorType.VALIDATION,
        ErrorSeverity.ERROR,
        { validation }
      );
    }

    let orgsImported = 0;
    let qrsImported = 0;
    let skipped = 0;
    let failed = 0;

    // Import each organization
    for (const orgData of data.organizations) {
      try {
        // Check if organization exists
        const existing = await db.organizations
          .where('name')
          .equals(orgData.name)
          .first();

        let targetOrgId;

        if (existing) {
          if (skipExisting) {
            skipped++;
            continue;
          }
          targetOrgId = existing.id;
        } else {
          // Create new organization (without password - must be set manually)
          targetOrgId = await db.organizations.add({
            name: orgData.name,
            passwordHash: null, // Password must be set by superadmin
            createdAt: orgData.createdAt || new Date().toISOString()
          });
          orgsImported++;
        }

        // Import QR codes for this organization
        for (const qrData of orgData.qrCodes) {
          try {
            await db.qrCodes.add({
              organizationId: targetOrgId,
              url: qrData.url,
              playerUrl: qrData.playerUrl,
              dataURL: qrData.dataURL,
              collection: qrData.collection || null,
              createdAt: qrData.createdAt || new Date().toISOString()
            });
            qrsImported++;
          } catch (error) {
            console.error('Failed to import QR code:', error);
            failed++;
          }
        }
      } catch (error) {
        console.error('Failed to import organization:', error);
        failed++;
      }
    }

    loading.hide();

    const result = {
      success: true,
      orgsImported,
      qrsImported,
      skipped,
      failed,
      message: `Import complete: ${orgsImported} organizations, ${qrsImported} QR codes imported. ${skipped} skipped, ${failed} failed.`
    };

    if (orgsImported > 0) {
      showToast(
        'Important: Set passwords for imported organizations from the admin panel',
        ErrorSeverity.WARNING,
        10000
      );
    }

    showToast(result.message, ErrorSeverity.INFO, 5000);

    return result;
  } catch (error) {
    hideLoading();
    throw new AppError(
      `Failed to import organizations: ${error.message}`,
      ErrorType.DATABASE,
      ErrorSeverity.ERROR,
      { originalError: error }
    );
  }
}

/**
 * Read JSON file from file input
 * @param {File} file - File to read
 * @returns {Promise<Object>} Parsed JSON data
 */
export async function readImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new AppError(
          'Invalid JSON file',
          ErrorType.VALIDATION,
          ErrorSeverity.ERROR,
          { originalError: error }
        ));
      }
    };

    reader.onerror = () => {
      reject(new AppError(
        'Failed to read file',
        ErrorType.UNKNOWN,
        ErrorSeverity.ERROR
      ));
    };

    reader.readAsText(file);
  });
}
