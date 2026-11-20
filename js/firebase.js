// ============================================
// FIREBASE CONFIGURATION AND SHARED HELPERS
// ============================================

const LINKSHOP_CONFIG = window.LINKSHOP_FIREBASE_CONFIG || {};

if (!LINKSHOP_CONFIG.projectId || String(LINKSHOP_CONFIG.projectId).startsWith('YOUR_')) {
  console.error('Firebase is not configured. Copy firebase-config.example.js to firebase-config.js and add your project values.');
} else if (!firebase.apps.length) {
  firebase.initializeApp(LINKSHOP_CONFIG);
}

if (LINKSHOP_CONFIG.appCheckSiteKey && !String(LINKSHOP_CONFIG.appCheckSiteKey).startsWith('YOUR_') && firebase.appCheck) {
  firebase.appCheck().activate(LINKSHOP_CONFIG.appCheckSiteKey, true);
}

const auth = firebase.auth ? firebase.auth() : null;
const db = firebase.firestore ? firebase.firestore() : null;
const storage = firebase.storage ? firebase.storage() : null;

// Helper: Get current user (Promise)
function getCurrentUser() {
  return new Promise((resolve) => {
    if (!firebase.auth) {
      resolve(null);
      return;
    }
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Helper: Redirect if not authenticated
async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

// Helper: Redirect if authenticated
async function redirectIfAuth() {
  const user = await getCurrentUser();
  if (user) {
    window.location.href = 'dashboard.html';
  }
  return user;
}

// Helper: Show toast notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// Helper: Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS'
  }).format(amount);
}

// Helper: Format date
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper: Generate slug from name
function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 40);
}

// Helper: Normalize slug for store
function normalizeStoreSlug(slug) {
  return generateSlug(String(slug || ''));
}

// Helper: Check if video file
function isVideoUrl(url) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

// Helper: Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard!', 'success');
  }
}