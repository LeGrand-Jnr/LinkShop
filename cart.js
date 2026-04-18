// ============================================
// CART MODULE (localStorage)
// ============================================

const CART_KEY = 'linkshop_cart';
const STORE_KEY = 'linkshop_cart_store';

function getCart() {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartStore() {
  return localStorage.getItem(STORE_KEY) || '';
}

function saveCartStore(storeSlug) {
  localStorage.setItem(STORE_KEY, storeSlug);
}

function addToCart(product, storeSlug, userId) {
  const currentStore = getCartStore();

  // If cart has items from a different store, clear it
  if (currentStore && currentStore !== storeSlug) {
    if (!confirm('Your cart has items from another store. Clear cart and add this item?')) {
      return { success: false, error: 'Cancelled by user' };
    }
    clearCart();
  }

  saveCartStore(storeSlug);

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.product_id === product.id);

  if (existingIndex >= 0) {
    if (cart[existingIndex].quantity >= product.stock) {
      return { success: false, error: 'Cannot add more than available stock' };
    }
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      media_urls: product.media_urls || (product.media_url ? [product.media_url] : []), // Changed to media_urls
      stock: product.stock,
      quantity: 1,
      store_slug: storeSlug,
      user_id: userId
    });
  }

  saveCart(cart);
  return { success: true, cart };
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.product_id !== productId);
  saveCart(cart);
  if (cart.length === 0) {
    localStorage.removeItem(STORE_KEY);
  }
  return { success: true, cart };
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.product_id === productId);

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    if (quantity > item.stock) {
      return { success: false, error: 'Cannot exceed available stock' };
    }
    item.quantity = quantity;
  }

  saveCart(cart);
  return { success: true, cart };
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(STORE_KEY);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

function isCartEmpty() {
  return getCart().length === 0;
}