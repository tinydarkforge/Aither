/**
 * Aither - QR Code Manager for Video Content
 *
 * Copyright (c) 2025 TinyDarkForge. All rights reserved.
 * Licensed under MIT - see LICENSE file
 *
 * QR Code Generation Module
 * Handles QR code creation using qr-code-styling library
 */

import QRCodeStyling from 'qr-code-styling';

/**
 * Default QR code options
 */
const DEFAULT_OPTIONS = {
  width: 300,
  height: 300,
  type: 'canvas',
  data: '',
  margin: 10,
  qrOptions: {
    typeNumber: 0,
    mode: 'Byte',
    errorCorrectionLevel: 'Q'
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    margin: 5
  },
  dotsOptions: {
    color: '#000000',
    type: 'rounded'
  },
  backgroundOptions: {
    color: '#ffffff'
  },
  cornersSquareOptions: {
    color: '#000000',
    type: 'extra-rounded'
  },
  cornersDotOptions: {
    color: '#000000',
    type: 'dot'
  }
};

/**
 * Create a QR code instance
 * @param {string} url - The URL to encode
 * @param {Object} options - Custom options
 * @returns {QRCodeStyling} QR code instance
 */
export function createQRCode(url, options = {}) {
  const qrOptions = {
    ...DEFAULT_OPTIONS,
    data: url,
    width: options.size || DEFAULT_OPTIONS.width,
    height: options.size || DEFAULT_OPTIONS.height,
    margin: options.margin !== undefined ? options.margin : DEFAULT_OPTIONS.margin,
    dotsOptions: {
      ...DEFAULT_OPTIONS.dotsOptions,
      color: options.fgColor || DEFAULT_OPTIONS.dotsOptions.color
    },
    backgroundOptions: {
      ...DEFAULT_OPTIONS.backgroundOptions,
      color: options.bgColor || DEFAULT_OPTIONS.backgroundOptions.color
    },
    cornersSquareOptions: {
      ...DEFAULT_OPTIONS.cornersSquareOptions,
      color: options.fgColor || DEFAULT_OPTIONS.cornersSquareOptions.color
    },
    cornersDotOptions: {
      ...DEFAULT_OPTIONS.cornersDotOptions,
      color: options.fgColor || DEFAULT_OPTIONS.cornersDotOptions.color
    }
  };

  // Add logo if provided
  if (options.logo) {
    qrOptions.image = options.logo;
    qrOptions.imageOptions = {
      ...DEFAULT_OPTIONS.imageOptions,
      crossOrigin: 'anonymous'
    };
  }

  return new QRCodeStyling(qrOptions);
}

/**
 * Generate QR code and render to a container
 * @param {HTMLElement} container - The container element
 * @param {string} url - The URL to encode
 * @param {Object} options - Custom options
 * @returns {QRCodeStyling} QR code instance
 */
export function generateQR(container, url, options = {}) {
  // Clear container
  container.innerHTML = '';

  const qrCode = createQRCode(url, options);
  qrCode.append(container);

  return qrCode;
}

/**
 * Get QR code as data URL (base64)
 * @param {QRCodeStyling} qrCode - QR code instance
 * @param {string} format - 'png' or 'svg'
 * @returns {Promise<string>} Data URL
 */
export async function getQRDataURL(qrCode, format = 'png') {
  try {
    const blob = await qrCode.getRawData(format);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error getting QR data URL:', error);
    throw error;
  }
}

/**
 * Download QR code as file
 * @param {QRCodeStyling} qrCode - QR code instance
 * @param {string} filename - File name (without extension)
 * @param {string} format - 'png' or 'svg'
 * @returns {Promise<void>}
 */
export async function downloadQR(qrCode, filename = 'qr-code', format = 'png') {
  try {
    await qrCode.download({
      name: filename,
      extension: format
    });
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
}

/**
 * Read uploaded image file as data URL
 * @param {File} file - Image file
 * @returns {Promise<string>} Data URL of the image
 */
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a sanitized filename from URL
 * @param {string} url - The URL
 * @returns {string} Sanitized filename
 */
export function generateFilename(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/\./g, '-');
    const timestamp = new Date().toISOString().split('T')[0];
    return `qr-${hostname}-${timestamp}`;
  } catch {
    const timestamp = new Date().toISOString().split('T')[0];
    return `qr-code-${timestamp}`;
  }
}
