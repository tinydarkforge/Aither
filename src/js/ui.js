/**
 * UI Module
 * Handles all user interface interactions and app initialization
 */

import { requireAuth, logout } from './auth.js';
import { saveQRCode, getAllQRCodes, deleteQRCode, searchQRCodes } from './db.js';
import {
  generateQR,
  getQRDataURL,
  downloadQR,
  readImageFile,
  isValidURL,
  generateFilename,
  createQRCode
} from './qr.js';

// State
let currentQRCode = null;
let currentQRInstance = null;
let logoDataURL = null;
let selectedQRId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  requireAuth();

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

  // Logo upload
  document.getElementById('logoInput').addEventListener('change', handleLogoUpload);

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
      updatePreview();
    } catch (error) {
      console.error('Error reading logo:', error);
      showMessage('Error loading logo', 'error');
    }
  } else {
    logoDataURL = null;
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
      options
    });

    // Show success message
    showMessage('QR code generated and saved successfully!', 'success');

    // Reset form after a delay
    setTimeout(() => {
      document.getElementById('qrForm').reset();
      document.getElementById('qrPreview').style.display = 'none';
      logoDataURL = null;
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
    const codes = await getAllQRCodes();
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
    const results = await searchQRCodes(searchTerm);
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
    const codes = await getAllQRCodes();
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
    const codes = await getAllQRCodes();
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
    const codes = await getAllQRCodes();
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
    const codes = await getAllQRCodes();
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

// Expose functions to window for inline event handlers
window.viewQR = viewQR;
window.downloadQRById = downloadQRById;
window.deleteQR = deleteQR;
