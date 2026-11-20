// ============================================
// AUTHENTICATION MODULE — FIREBASE
// ============================================

const USERS_KEY = 'linkshop_users';
const LEGACY_USER_KEY = 'linkshop_current_user';

function firebaseAuthError(error) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Email or password is incorrect.'
  };
  return messages[error.code] || error.message || 'Authentication failed.';
}

async function signup(email, password) {
  try {
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
    const credential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = credential.user;

    await firebase.firestore().collection('users').doc(user.uid).set({
      name: '',
      email: user.email,
      role: 'owner',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    localStorage.removeItem(LEGACY_USER_KEY);
    localStorage.removeItem(USERS_KEY);
    return { success: true, user: { uid: user.uid, email: user.email } };
  } catch (error) {
    return { success: false, error: firebaseAuthError(error) };
  }
}

async function login(email, password) {
  try {
    const credential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = credential.user;
    localStorage.removeItem(LEGACY_USER_KEY);
    localStorage.removeItem(USERS_KEY);
    return { success: true, user: { uid: user.uid, email: user.email } };
  } catch (error) {
    return { success: false, error: firebaseAuthError(error) };
  }
}

function normalizeStoreSlug(slug) {
  return String(slug || '')
    .trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function saveStoreInfo(userId, storeName, storeSlug, whatsappNumber) {
  try {
    storeName = String(storeName || '').trim();
    storeSlug = normalizeStoreSlug(storeSlug);
    if (!storeName || !storeSlug) return { success: false, error: 'Store name and URL are required.' };

    const shops = firebase.firestore().collection('shops');
    const existing = await shops.where('slug', '==', storeSlug).get();
    if (!existing.empty) {
      const conflict = existing.docs.find(doc => doc.id !== userId && doc.data().ownerId !== userId);
      if (conflict) return { success: false, error: 'This store URL is already taken. Please choose another.' };
    }

    const shopId = storeSlug;
    await shops.doc(shopId).set({
      ownerId: userId,
      shopName: storeName,
      slug: storeSlug,
      description: '',
      logo: '',
      whatsappNumber: whatsappNumber || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await firebase.firestore().collection('users').doc(userId).set({
      name: storeName,
      email: firebase.auth().currentUser?.email || '',
      role: 'owner',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, shopId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getUserStoreInfo(userId) {
  try {
    const snap = await firebase.firestore().collection('shops').where('ownerId', '==', userId).limit(1).get();
    if (snap.empty) return { success: false, error: 'Store info not found' };
    const doc = snap.docs[0];
    const data = doc.data();
    return {
      success: true,
      id: doc.id,
      data: {
        store_name: data.shopName,
        store_slug: data.slug,
        whatsapp_number: data.whatsappNumber || '',
        description: data.description || '',
        logo: data.logo || '',
        created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : ''
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateStoreInfo(userId, updates) {
  try {
    const shopInfo = await getUserStoreInfo(userId);
    if (!shopInfo.success) return shopInfo;

    const storeSlug = updates.store_slug ? normalizeStoreSlug(updates.store_slug) : shopInfo.data.store_slug;
    if (storeSlug !== shopInfo.id) {
      return { success: false, error: 'Store URL changes require support.' };
    }

    await firebase.firestore().collection('shops').doc(shopInfo.id).update({
      shopName: updates.store_name || shopInfo.data.store_name,
      slug: storeSlug,
      description: updates.description || shopInfo.data.description || '',
      logo: updates.logo || shopInfo.data.logo || '',
      whatsappNumber: updates.whatsapp_number || shopInfo.data.whatsapp_number || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function logout() {
  await firebase.auth().signOut();
  localStorage.removeItem(LEGACY_USER_KEY);
  window.location.href = 'index.html';
}