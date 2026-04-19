// ============================================
// FIREBASE CONFIGURATION (LOCALHOST MOCK)
// Replace these values with your Firebase project config
// Go to: Firebase Console > Project Settings > Your apps > Web app
// ============================================

// Mock Firebase objects for localhost development
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Simulate async auth state check
    setTimeout(() => {
      const currentUserData = localStorage.getItem('linkshop_current_user');
      if (currentUserData) {
        auth.currentUser = JSON.parse(currentUserData);
      } else {
        auth.currentUser = null;
      }
      callback(auth.currentUser);
    }, 100);
    // Return unsubscribe function
    return () => {};
  }
};

const db = {
  collection: (name) => ({
    doc: (id) => ({
      get: async () => {
        // Mock get operation - not used in localhost version
        return { exists: false };
      },
      set: async () => {
        // Mock set operation
      },
      update: async () => {
        // Mock update operation
      }
    }),
    where: () => ({
      get: async () => {
        // Mock query operation
        return { empty: true, docs: [] };
      }
    })
  })
};

const storage = {
  ref: () => ({
    put: async () => ({
      ref: {
        getDownloadURL: async () => 'mock-url'
      }
    })
  })
};

const firebase = {
  firestore: {
    FieldValue: {
      serverTimestamp: () => new Date()
    }
  }
};

// Helper: Get current user (Promise)
function getCurrentUser() {
  return new Promise((resolve) => {
    const currentUserData = localStorage.getItem('linkshop_current_user');
    if (currentUserData) {
      resolve(JSON.parse(currentUserData));
    } else {
      resolve(null);
    }
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

// Helper: Get current user (Promise)
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
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