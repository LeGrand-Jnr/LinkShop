// ============================================
// AUTHENTICATION MODULE (LOCALHOST VERSION)
// ============================================

// Local storage keys
const USERS_KEY = 'linkshop_users';
const CURRENT_USER_KEY = 'linkshop_current_user';

// Helper: Get users from localStorage
function getUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : {};
}

// Helper: Save users to localStorage
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Helper: Generate simple user ID
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Sign up with email and password
async function signup(email, password) {
  try {
    console.log('Attempting signup for:', email);
    const users = getUsers();
    console.log('Existing users:', Object.keys(users));

    // Check if email already exists
    if (users[email]) {
      console.log('Email already exists');
      return { success: false, error: 'This email is already registered.' };
    }

    // Validate password
    if (password.length < 6) {
      console.log('Password too short');
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Create user
    const userId = generateUserId();
    const user = {
      uid: userId,
      email: email,
      password: password, // In real app, this would be hashed
      created_at: new Date().toISOString()
    };

    users[email] = user;
    saveUsers(users);
    console.log('User created and saved');

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    console.log('User set as current user');

    return { success: true, user: user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
}

// Login with email and password
async function login(email, password) {
  try {
    console.log('Attempting login for:', email);
    const users = getUsers();
    console.log('Users in storage:', Object.keys(users));

    const user = users[email];

    if (!user) {
      console.log('No user found with email:', email);
      return { success: false, error: 'No account found with this email.' };
    }

    console.log('User found:', user);
    console.log('Stored password:', user.password);
    console.log('Provided password:', password);

    if (user.password !== password) {
      console.log('Password mismatch');
      return { success: false, error: 'Incorrect password.' };
    }

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    console.log('Login successful, user set in localStorage');

    return { success: true, user: user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Save store info after signup
async function saveStoreInfo(userId, storeName, storeSlug, whatsappNumber) {
  try {
    const users = getUsers();
    const user = Object.values(users).find(u => u.uid === userId);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if slug is unique
    const existingUser = Object.values(users).find(u => u.store_slug === storeSlug && u.uid !== userId);
    if (existingUser) {
      return { success: false, error: 'This store URL is already taken. Please choose another.' };
    }

    // Update user with store info
    user.store_name = storeName;
    user.store_slug = storeSlug;
    user.whatsapp_number = whatsappNumber || '';
    user.created_at = new Date().toISOString();

    saveUsers(users);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get user's store info
async function getUserStoreInfo(userId) {
  try {
    const users = getUsers();
    const user = Object.values(users).find(u => u.uid === userId);

    if (!user || !user.store_name) {
      return { success: false, error: 'Store info not found' };
    }

    return {
      success: true,
      data: {
        store_name: user.store_name,
        store_slug: user.store_slug,
        whatsapp_number: user.whatsapp_number,
        created_at: user.created_at
      },
      id: userId
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update store info
async function updateStoreInfo(userId, updates) {
  try {
    const users = getUsers();
    const user = Object.values(users).find(u => u.uid === userId);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check slug uniqueness if updating
    if (updates.store_slug) {
      const existingUser = Object.values(users).find(u => u.store_slug === updates.store_slug && u.uid !== userId);
      if (existingUser) {
        return { success: false, error: 'This store URL is already taken.' };
      }
    }

    // Update user data
    Object.assign(user, updates);
    saveUsers(users);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Logout
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = 'index.html';
}