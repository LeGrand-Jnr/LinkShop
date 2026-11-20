// ============================================
// PRODUCT MANAGEMENT MODULE — FIRESTORE + STORAGE
// ============================================

const PRODUCTS_KEY = 'linkshop_products';

async function compressImage(file, maxWidth = 900, quality = 0.68) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    throw new Error('Only PNG, JPG, GIF or WebP images are supported.');
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to process image'));
      img.src = objectUrl;
    });
    const scale = Math.min(1, maxWidth / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Failed to compress image')), 'image/webp', quality);
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function uploadProductImages(shopId, files) {
  const urls = [];
  const paths = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const blob = await compressImage(file);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `products/${shopId}/${Date.now()}_${i}_${safeName}.webp`;
    const ref = firebase.storage().ref(path);
    await ref.put(blob, { contentType: 'image/webp' });
    urls.push(await ref.getDownloadURL());
    paths.push(path);
  }
  return { urls, paths };
}

async function deleteProductImages(paths) {
  if (!Array.isArray(paths)) return;
  await Promise.all(paths.map(path => firebase.storage().ref(path).delete().catch(() => null)));
}

function getStoredProducts() {
  return {};
}

function saveProducts() {
  localStorage.removeItem(PRODUCTS_KEY);
}

// Helper: Generate unique product ID
function generateProductId() {
  return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Add a new product
async function addProduct(userId, productData, files) {
  try {
    const shopSnap = await firebase.firestore().collection('shops').where('ownerId', '==', userId).limit(1).get();
    if (shopSnap.empty) return { success: false, error: 'Create your shop before adding products.' };
    const shopId = shopSnap.docs[0].id;

    let mediaUrls = [];
    let mediaPaths = [];
    if (files && files.length > 0) {
      const upload = await uploadProductImages(shopId, Array.from(files));
      mediaUrls = upload.urls;
      mediaPaths = upload.paths;
    }

    const productId = generateProductId();
    await firebase.firestore().collection('products').doc(productId).set({
      shopId,
      name: String(productData.name).trim(),
      description: productData.description || '',
      price: parseFloat(productData.price),
      cost_price: parseFloat(productData.cost_price) || 0,
      stock: parseInt(productData.stock),
      image: mediaUrls[0] || '',
      media_urls: mediaUrls,
      media_paths: mediaPaths,
      user_id: userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { success: true, id: productId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update an existing product
async function updateProduct(userId, productId, productData, files) {
  try {
    const ref = firebase.firestore().collection('products').doc(productId);
    const snap = await ref.get();
    if (!snap.exists) return { success: false, error: 'Product not found' };
    const product = snap.data();
    if (product.user_id !== userId && product.shopId !== await getShopIdForOwner(userId)) {
      return { success: false, error: 'Product not found or access denied' };
    }

    const updates = {
      name: String(productData.name).trim(),
      description: productData.description || '',
      price: parseFloat(productData.price),
      cost_price: parseFloat(productData.cost_price) || 0,
      stock: parseInt(productData.stock),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (files && files.length > 0) {
      const shopId = product.shopId;
      const upload = await uploadProductImages(shopId, Array.from(files));
      await deleteProductImages(product.media_paths);
      updates.image = upload.urls[0] || '';
      updates.media_urls = upload.urls;
      updates.media_paths = upload.paths;
    }
    await ref.update(updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getShopIdForOwner(userId) {
  const snap = await firebase.firestore().collection('shops').where('ownerId', '==', userId).limit(1).get();
  return snap.empty ? '' : snap.docs[0].id;
}

// Get all products for a user
async function getProducts(userId) {
  try {
    const shopId = await getShopIdForOwner(userId);
    if (!shopId) return { success: true, products: [] };
    const snap = await firebase.firestore().collection('products').where('shopId', '==', shopId).get();
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    products.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    return { success: true, products };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get products by store slug (for public storefront)
async function getProductsBySlug(storeSlug) {
  try {
    const slug = generateSlug(storeSlug);
    const shopSnap = await firebase.firestore().collection('shops').where('slug', '==', slug).limit(1).get();
    if (shopSnap.empty) return { success: false, error: 'Store not found' };

    const shopDoc = shopSnap.docs[0];
    const shop = shopDoc.data();
    const productSnap = await firebase.firestore().collection('products').where('shopId', '==', shopDoc.id).get();
    const products = productSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product => product.stock > 0);
    products.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    return {
      success: true,
      storeInfo: { store_name: shop.shopName, whatsapp_number: shop.whatsappNumber || '' },
      products,
      userId: shop.ownerId
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete a product
async function deleteProduct(productId, mediaPath) {
  try {
    const ref = firebase.firestore().collection('products').doc(productId);
    const snap = await ref.get();
    if (!snap.exists) return { success: false, error: 'Product not found' };
    await deleteProductImages(snap.data().media_paths || (mediaPath ? [mediaPath] : []));
    await ref.delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update product stock (used in transactions)
async function updateProductStock(productId, quantityChange) {
  try {
    const ref = firebase.firestore().collection('products').doc(productId);
    await firebase.firestore().runTransaction(async transaction => {
      const snap = await transaction.get(ref);
      if (!snap.exists) throw new Error('Product not found');
      const stock = snap.data().stock;
      const newStock = stock + quantityChange;
      if (newStock < 0) throw new Error('Insufficient stock');
      transaction.update(ref, { stock: newStock });
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Search/filter products
function filterProducts(products, searchTerm) {
  if (!searchTerm) return products;
  const term = searchTerm.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (p.description && p.description.toLowerCase().includes(term))
  );
}