/**
 * Aither - QR Code Manager for ASL Videos
 *
 * Copyright (c) 2025 Cirrus. All rights reserved.
 * Licensed under Proprietary License - see LICENSE file
 *
 * UI Module
 * Handles all user interface interactions and app initialization
 */

import { requireAuth, requireOrganization, logout, getCurrentOrganizationId, getCurrentOrganizationName, isSuperadmin } from './auth.js';
import {
  saveQRCode,
  getAllQRCodes,
  deleteQRCode,
  searchQRCodes,
  getCollections,
  createCollection,
  deleteCollection,
  getQRCodesByCollection,
  getCollectionById,
  updateCollectionScanTime
} from './db.js';
import {
  generateQR,
  getQRDataURL,
  downloadQR,
  readImageFile,
  isValidURL,
  generateFilename,
  createQRCode
} from './qr.js';
import { parseDirectoryForMP4s, getFilenameFromURL } from './parser.js';
import { initializeErrorHandlers } from './error-handler.js';

// State
let currentQRCode = null;
let currentQRInstance = null;
let logoDataURL = null;
let selectedQRId = null;
let organizationId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Initialize error handlers
  initializeErrorHandlers();

  // Check authentication
  requireAuth();

  // Redirect superadmin to admin panel
  if (isSuperadmin()) {
    window.location.href = '/admin.html';
    return;
  }

  // Require organization access
  requireOrganization();

  // Get organization ID from session
  organizationId = getCurrentOrganizationId();
  if (!organizationId) {
    logout();
    window.location.href = '/login.html';
    return;
  }

  // Display organization name in header
  const orgName = getCurrentOrganizationName();
  if (orgName) {
    document.getElementById('orgNameDisplay').textContent = orgName;
  }

  // Initialize UI
  initializeUI();
  initializeEventListeners();
  loadQRList();
});

/**
 * Initialize UI elements
 */
function initializeUI() {
  // Set initial tab
  showTab('generate');

  // Initialize color value displays
  updateColorDisplay('fgColorInput', 'fgColorValue');
  updateColorDisplay('bgColorInput', 'bgColorValue');
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      showTab(tab);
    });
  });

  // QR form submission
  document.getElementById('qrForm').addEventListener('submit', handleQRFormSubmit);

  // Color input updates
  document.getElementById('fgColorInput').addEventListener('input', (e) => {
    updateColorDisplay('fgColorInput', 'fgColorValue');
    updatePreview();
  });

  document.getElementById('bgColorInput').addEventListener('input', (e) => {
    updateColorDisplay('bgColorInput', 'bgColorValue');
    updatePreview();
  });

  // Other form inputs for live preview
  ['urlInput', 'sizeInput', 'marginInput'].forEach(id => {
    document.getElementById(id).addEventListener('input', updatePreview);
  });

  // Logo upload - clicking text input triggers hidden file input
  document.getElementById('logoInput').addEventListener('click', () => {
    document.getElementById('logoFileInput').click();
  });

  document.getElementById('logoFileInput').addEventListener('change', handleLogoUpload);

  // Search
  document.getElementById('searchInput').addEventListener('input', handleSearch);

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('qrModal').addEventListener('click', (e) => {
    if (e.target.id === 'qrModal') {
      closeModal();
    }
  });

  // Modal actions
  document.getElementById('downloadPngBtn').addEventListener('click', () => downloadFromModal('png'));
  document.getElementById('downloadSvgBtn').addEventListener('click', () => downloadFromModal('svg'));
  document.getElementById('copyUrlBtn').addEventListener('click', copyUrlFromModal);

  // Collection form submission
  document.getElementById('collectionForm').addEventListener('submit', handleCollectionFormSubmit);
}

/**
 * Handle logout
 */
function handleLogout() {
  logout();
  window.location.href = '/login.html';
}

/**
 * Show a specific tab
 */
function showTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}Tab`);
  });

  // Refresh list if switching to list tab
  if (tabName === 'list') {
    loadQRList();
  }

  // Load collections if switching to collection tab
  if (tabName === 'collection') {
    loadCollections();
  }
}

/**
 * Update color value display
 */
function updateColorDisplay(inputId, displayId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  display.textContent = input.value;
}

/**
 * Handle logo upload
 */
async function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    try {
      logoDataURL = await readImageFile(file);
      document.getElementById('logoInput').value = file.name;
      updatePreview();
    } catch (error) {
      console.error('Error reading logo:', error);
      showMessage('Error loading logo', 'error');
    }
  } else {
    logoDataURL = null;
    document.getElementById('logoInput').value = '';
    updatePreview();
  }
}

/**
 * Check if URL is an MP4 video
 */
function isMP4URL(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();
    return path.endsWith('.mp4');
  } catch {
    return url.toLowerCase().endsWith('.mp4');
  }
}

/**
 * Wrap video URL with player page
 */
function getPlayerURL(videoUrl) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/player.html?video=${encodeURIComponent(videoUrl)}`;
}

/**
 * Get the QR-ready URL (wraps MP4s with player page)
 */
function getQRReadyURL(url) {
  if (isMP4URL(url)) {
    return getPlayerURL(url);
  }
  return url;
}

/**
 * Update QR preview
 */
function updatePreview() {
  const url = document.getElementById('urlInput').value;

  if (!url || !isValidURL(url)) {
    document.getElementById('qrPreview').style.display = 'none';
    return;
  }

  const options = getFormOptions();
  const container = document.getElementById('qrCanvas');

  // Use player-wrapped URL for MP4s
  const qrUrl = getQRReadyURL(url);
  currentQRInstance = generateQR(container, qrUrl, options);
  document.getElementById('qrPreview').style.display = 'block';
}

/**
 * Get form options for QR generation
 */
function getFormOptions() {
  return {
    size: parseInt(document.getElementById('sizeInput').value) || 300,
    margin: parseInt(document.getElementById('marginInput').value) || 10,
    fgColor: document.getElementById('fgColorInput').value,
    bgColor: document.getElementById('bgColorInput').value,
    logo: logoDataURL
  };
}

/**
 * Handle QR form submission
 */
async function handleQRFormSubmit(e) {
  e.preventDefault();

  const url = document.getElementById('urlInput').value;

  if (!isValidURL(url)) {
    showMessage('Please enter a valid URL', 'error');
    return;
  }

  try {
    const options = getFormOptions();

    // Use player-wrapped URL for MP4s
    const qrUrl = getQRReadyURL(url);

    // Generate QR code with the player URL (if MP4)
    const qrCode = createQRCode(qrUrl, options);

    // Get image data
    const imageData = await getQRDataURL(qrCode, 'png');

    // Save to database (store original URL for display)
    await saveQRCode({
      url,
      imageData,
      options,
      organizationId
    });

    // Show success message
    showMessage('QR code generated and saved successfully!', 'success');

    // Reset form after a delay
    setTimeout(() => {
      document.getElementById('qrForm').reset();
      document.getElementById('qrPreview').style.display = 'none';
      logoDataURL = null;
      document.getElementById('logoInput').value = '';
      updateColorDisplay('fgColorInput', 'fgColorValue');
      updateColorDisplay('bgColorInput', 'bgColorValue');
    }, 2000);

  } catch (error) {
    console.error('Error generating QR code:', error);
    showMessage('Error generating QR code', 'error');
  }
}

/**
 * Load QR code list
 */
async function loadQRList() {
  try {
    const codes = await getAllQRCodes(organizationId);
    renderQRList(codes);
  } catch (error) {
    console.error('Error loading QR codes:', error);
    showMessage('Error loading QR codes', 'error');
  }
}

/**
 * Render QR code list
 */
function renderQRList(codes) {
  const listContainer = document.getElementById('qrList');
  const emptyState = document.getElementById('emptyState');

  if (codes.length === 0) {
    listContainer.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  listContainer.innerHTML = codes.map(code => `
    <div class="qr-item" data-id="${code.id}">
      <div class="qr-thumbnail">
        <img src="${code.imageData}" alt="QR Code">
      </div>
      <div class="qr-info">
        <div class="qr-url">${escapeHtml(code.url)}</div>
        <div class="qr-meta">
          ${formatDate(code.generatedAt)}
        </div>
      </div>
      <div class="qr-actions">
        <button class="btn btn-sm btn-secondary" onclick="window.viewQR(${code.id})">View</button>
        <button class="btn btn-sm btn-secondary" onclick="window.downloadQRById(${code.id}, 'png')">Download</button>
        <button class="btn btn-sm btn-danger" onclick="window.deleteQR(${code.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

/**
 * Handle search
 */
async function handleSearch(e) {
  const searchTerm = e.target.value;

  try {
    const results = await searchQRCodes(organizationId, searchTerm);
    renderQRList(results);
  } catch (error) {
    console.error('Error searching:', error);
  }
}

/**
 * View QR code in modal
 */
async function viewQR(id) {
  try {
    const codes = await getAllQRCodes(organizationId);
    const code = codes.find(c => c.id === id);

    if (!code) {
      showMessage('QR code not found', 'error');
      return;
    }

    selectedQRId = id;

    // Update modal content
    document.getElementById('modalUrl').textContent = code.url;
    document.getElementById('modalDate').textContent = formatDate(code.generatedAt);

    // Render QR code (use player-wrapped URL for MP4s)
    const qrUrl = getQRReadyURL(code.url);
    const modalCanvas = document.getElementById('modalQrCanvas');
    currentQRCode = generateQR(modalCanvas, qrUrl, code.options);

    // Show modal
    document.getElementById('qrModal').classList.add('active');
  } catch (error) {
    console.error('Error viewing QR code:', error);
    showMessage('Error loading QR code', 'error');
  }
}

/**
 * Download QR by ID
 */
async function downloadQRById(id, format = 'png') {
  try {
    const codes = await getAllQRCodes(organizationId);
    const code = codes.find(c => c.id === id);

    if (!code) {
      showMessage('QR code not found', 'error');
      return;
    }

    // Use player-wrapped URL for MP4s
    const qrUrl = getQRReadyURL(code.url);
    const qrCode = createQRCode(qrUrl, code.options);
    const filename = generateFilename(code.url);
    await downloadQR(qrCode, filename, format);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    showMessage('Error downloading QR code', 'error');
  }
}

/**
 * Download from modal
 */
async function downloadFromModal(format) {
  if (!currentQRCode) return;

  try {
    const codes = await getAllQRCodes(organizationId);
    const code = codes.find(c => c.id === selectedQRId);

    if (code) {
      const filename = generateFilename(code.url);
      await downloadQR(currentQRCode, filename, format);
    }
  } catch (error) {
    console.error('Error downloading:', error);
    showMessage('Error downloading QR code', 'error');
  }
}

/**
 * Copy URL from modal
 */
async function copyUrlFromModal() {
  try {
    const codes = await getAllQRCodes(organizationId);
    const code = codes.find(c => c.id === selectedQRId);

    if (code) {
      await navigator.clipboard.writeText(code.url);
      showMessage('URL copied to clipboard!', 'success');
    }
  } catch (error) {
    console.error('Error copying URL:', error);
    showMessage('Error copying URL', 'error');
  }
}

/**
 * Delete QR code
 */
async function deleteQR(id) {
  if (!confirm('Are you sure you want to delete this QR code?')) {
    return;
  }

  try {
    await deleteQRCode(id);
    showMessage('QR code deleted', 'success');
    loadQRList();
  } catch (error) {
    console.error('Error deleting QR code:', error);
    showMessage('Error deleting QR code', 'error');
  }
}

/**
 * Close modal
 */
function closeModal() {
  document.getElementById('qrModal').classList.remove('active');
  currentQRCode = null;
  selectedQRId = null;
}

/**
 * Show message (success or error)
 */
function showMessage(message, type = 'success') {
  const messageEl = document.getElementById('successMessage');
  messageEl.textContent = message;
  messageEl.className = type === 'error' ? 'error-message' : 'success-message';
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

/**
 * Format date
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// COLLECTION MANAGEMENT FUNCTIONS
// ============================================

/**
 * Handle collection form submission
 */
async function handleCollectionFormSubmit(e) {
  e.preventDefault();

  const directoryUrl = document.getElementById('directoryUrlInput').value.trim();
  const collectionName = document.getElementById('collectionNameInput').value.trim();

  if (!isValidURL(directoryUrl)) {
    showCollectionError('Please enter a valid URL');
    return;
  }

  if (!collectionName) {
    showCollectionError('Please enter a collection name');
    return;
  }

  try {
    // Show progress
    document.getElementById('collectionProgress').style.display = 'block';
    document.getElementById('collectionResults').style.display = 'none';
    document.getElementById('collectionMessage').style.display = 'none';
    document.getElementById('collectionError').style.display = 'none';
    document.getElementById('scanDirectoryBtn').disabled = true;

    updateProgress(10, 'Scanning directory...');

    // Parse directory for MP4 files
    const result = await parseDirectoryForMP4s(directoryUrl);

    if (!result.success) {
      showCollectionError(result.error);
      document.getElementById('collectionProgress').style.display = 'none';
      document.getElementById('scanDirectoryBtn').disabled = false;
      return;
    }

    updateProgress(30, `Found ${result.mp4Urls.length} MP4 files. Creating collection...`);

    // Create collection in database
    const collectionId = await createCollection({
      organizationId,
      name: collectionName,
      sourceUrl: directoryUrl
    });

    updateProgress(40, 'Generating QR codes...');

    // Generate QR codes for each MP4
    const options = {
      size: 300,
      margin: 10,
      fgColor: '#000000',
      bgColor: '#ffffff',
      logo: null
    };

    let successCount = 0;
    const total = result.mp4Urls.length;

    for (let i = 0; i < total; i++) {
      const mp4Url = result.mp4Urls[i];

      try {
        // Use player-wrapped URL for QR code
        const qrUrl = getPlayerURL(mp4Url);
        const qrCode = createQRCode(qrUrl, options);
        const imageData = await getQRDataURL(qrCode, 'png');

        // Save to database
        await saveQRCode({
          url: mp4Url,
          imageData,
          options,
          organizationId,
          collectionId
        });

        successCount++;

        // Update progress
        const progress = 40 + ((i + 1) / total) * 60;
        updateProgress(progress, `Generated ${successCount} of ${total} QR codes...`);
      } catch (error) {
        console.error(`Error generating QR for ${mp4Url}:`, error);
      }
    }

    // Complete
    updateProgress(100, 'Complete!');
    document.getElementById('collectionProgress').style.display = 'none';
    showCollectionMessage(`Successfully generated ${successCount} QR codes in collection "${collectionName}"!`);

    // Reset form
    document.getElementById('collectionForm').reset();

    // Reload collections list
    loadCollections();

  } catch (error) {
    console.error('Error creating collection:', error);
    showCollectionError('An error occurred while creating the collection');
    document.getElementById('collectionProgress').style.display = 'none';
  } finally {
    document.getElementById('scanDirectoryBtn').disabled = false;
  }
}

/**
 * Update progress bar
 */
function updateProgress(percentage, text) {
  document.getElementById('progressFill').style.width = `${percentage}%`;
  document.getElementById('progressText').textContent = text;
}

/**
 * Show collection success message
 */
function showCollectionMessage(message) {
  const messageEl = document.getElementById('collectionMessage');
  messageEl.textContent = message;
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

/**
 * Show collection error message
 */
function showCollectionError(message) {
  const errorEl = document.getElementById('collectionError');
  errorEl.textContent = message;
  errorEl.style.display = 'block';

  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

/**
 * Load and render collections
 */
async function loadCollections() {
  try {
    const collections = await getCollections(organizationId);
    renderCollections(collections);
  } catch (error) {
    console.error('Error loading collections:', error);
    showCollectionError('Error loading collections');
  }
}

/**
 * Render collections list
 */
async function renderCollections(collections) {
  const listContainer = document.getElementById('collectionsList');
  const emptyState = document.getElementById('collectionsEmptyState');

  if (collections.length === 0) {
    listContainer.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  const collectionsHTML = [];

  for (const collection of collections) {
    const codes = await getQRCodesByCollection(collection.id);
    const qrCount = codes.length;

    collectionsHTML.push(`
      <div class="collection-item" data-id="${collection.id}">
        <div class="collection-info">
          <h4>${escapeHtml(collection.name)}</h4>
          <p class="collection-meta">
            ${qrCount} QR code${qrCount !== 1 ? 's' : ''} • Created ${formatDate(collection.createdAt)}
          </p>
          <p class="collection-url">${escapeHtml(collection.sourceUrl)}</p>
        </div>
        <div class="collection-actions">
          <button class="btn btn-sm btn-secondary" onclick="window.viewCollection(${collection.id})">View QRs</button>
          <button class="btn btn-sm btn-secondary" onclick="window.rescanCollection(${collection.id})">Re-scan</button>
          <button class="btn btn-sm btn-danger" onclick="window.deleteCollectionById(${collection.id})">Delete</button>
        </div>
      </div>
    `);
  }

  listContainer.innerHTML = collectionsHTML.join('');
}

/**
 * View collection (show all QR codes in it)
 */
async function viewCollection(collectionId) {
  try {
    // Switch to library tab and filter by collection
    showTab('list');

    const codes = await getQRCodesByCollection(collectionId);
    renderQRList(codes);

    // Update search input to show we're filtering
    const collection = await getCollectionById(collectionId);
    if (collection) {
      showMessage(`Showing ${codes.length} QR codes from "${collection.name}"`, 'success');
    }
  } catch (error) {
    console.error('Error viewing collection:', error);
    showCollectionError('Error loading collection QR codes');
  }
}

/**
 * Re-scan a collection for new MP4s
 */
async function rescanCollection(collectionId) {
  if (!confirm('This will scan the directory again and add any new MP4 files found. Continue?')) {
    return;
  }

  try {
    const collection = await getCollectionById(collectionId);
    if (!collection) {
      showCollectionError('Collection not found');
      return;
    }

    showCollectionMessage('Rescanning directory...');

    // Parse directory for MP4 files
    const result = await parseDirectoryForMP4s(collection.sourceUrl);

    if (!result.success) {
      showCollectionError(`Re-scan failed: ${result.error}`);
      return;
    }

    // Get existing QR codes in this collection
    const existingCodes = await getQRCodesByCollection(collectionId);
    const existingUrls = new Set(existingCodes.map(code => code.url));

    // Filter out MP4s that already have QR codes
    const newMp4Urls = result.mp4Urls.filter(url => !existingUrls.has(url));

    if (newMp4Urls.length === 0) {
      showCollectionMessage('No new MP4 files found in the directory');
      await updateCollectionScanTime(collectionId);
      return;
    }

    // Generate QR codes for new MP4s
    const options = {
      size: 300,
      margin: 10,
      fgColor: '#000000',
      bgColor: '#ffffff',
      logo: null
    };

    let successCount = 0;

    for (const mp4Url of newMp4Urls) {
      try {
        const qrUrl = getPlayerURL(mp4Url);
        const qrCode = createQRCode(qrUrl, options);
        const imageData = await getQRDataURL(qrCode, 'png');

        await saveQRCode({
          url: mp4Url,
          imageData,
          options,
          organizationId,
          collectionId
        });

        successCount++;
      } catch (error) {
        console.error(`Error generating QR for ${mp4Url}:`, error);
      }
    }

    // Update last scanned time
    await updateCollectionScanTime(collectionId);

    showCollectionMessage(`Added ${successCount} new QR codes to collection "${collection.name}"!`);
    loadCollections();

  } catch (error) {
    console.error('Error rescanning collection:', error);
    showCollectionError('An error occurred while rescanning');
  }
}

/**
 * Delete a collection and all its QR codes
 */
async function deleteCollectionById(collectionId) {
  const collection = await getCollectionById(collectionId);
  if (!collection) {
    showCollectionError('Collection not found');
    return;
  }

  if (!confirm(`Are you sure you want to delete the collection "${collection.name}" and all its QR codes? This cannot be undone.`)) {
    return;
  }

  try {
    await deleteCollection(collectionId);
    showCollectionMessage('Collection deleted successfully');
    loadCollections();
  } catch (error) {
    console.error('Error deleting collection:', error);
    showCollectionError('Error deleting collection');
  }
}

// Expose functions to window for inline event handlers
window.viewQR = viewQR;
window.downloadQRById = downloadQRById;
window.deleteQR = deleteQR;
window.viewCollection = viewCollection;
window.rescanCollection = rescanCollection;
window.deleteCollectionById = deleteCollectionById;
