// ============================================
// PRODUCT MANAGEMENT MODULE (LOCALHOST VERSION)
// ============================================

const PRODUCTS_KEY = 'linkshop_products';

// Helper: Get products from localStorage
function getStoredProducts() {
  const products = localStorage.getItem(PRODUCTS_KEY);
  return products ? JSON.parse(products) : {};
}

// Helper: Save products to localStorage
function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// Helper: Generate product ID
function generateProductId() {
  return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Add a new product
async function addProduct(userId, productData, files) {
  try {
    const products = getStoredProducts();
    const productId = generateProductId();

    let mediaUrls = [];
    let filePaths = [];

    // Mock file upload - in real app this would upload to storage
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `products/${userId}/${timestamp}_${index}_${sanitizedName}`;
        // For localhost, we'll use mock URLs
        const mediaUrl = `mock-url-${filePath}`;
        filePaths.push(filePath);
        mediaUrls.push(mediaUrl);
      });
    }

    // Save product
    const product = {
      id: productId,
      user_id: userId,
      name: productData.name,
      description: productData.description || '',
      price: parseFloat(productData.price),
      cost_price: parseFloat(productData.cost_price) || 0,
      stock: parseInt(productData.stock),
      media_urls: mediaUrls, // Changed from media_url to media_urls (array)
      media_paths: filePaths, // Changed from media_path to media_paths (array)
      created_at: new Date().toISOString()
    };

    products[productId] = product;
    saveProducts(products);

    return { success: true, id: productId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all products for a user
async function getProducts(userId) {
  try {
    const products = getStoredProducts();
    const userProducts = Object.values(products).filter(p => p.user_id === userId);

    // Sort by created_at descending
    userProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { success: true, products: userProducts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get products by store slug (for public storefront)
async function getProductsBySlug(storeSlug) {
  try {
    // Find user by slug
    const users = JSON.parse(localStorage.getItem('linkshop_users') || '{}');
    const user = Object.values(users).find(u => u.store_slug === storeSlug);

    if (!user) {
      return { success: false, error: 'Store not found' };
    }

    const userId = user.uid;
    const storeInfo = {
      store_name: user.store_name,
      whatsapp_number: user.whatsapp_number
    };

    // Get products
    const products = getStoredProducts();
    const storeProducts = Object.values(products).filter(p => p.user_id === userId && p.stock > 0);

    // Sort by created_at descending
    storeProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { success: true, storeInfo, products: storeProducts, userId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete a product
async function deleteProduct(productId, mediaPath) {
  try {
    const products = getStoredProducts();
    delete products[productId];
    saveProducts(products);

    // Mock media deletion
    if (mediaPath) {
      console.log('Mock: Would delete media file:', mediaPath);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update product stock (used in transactions)
async function updateProductStock(productId, quantityChange) {
  try {
    const products = getStoredProducts();
    const product = products[productId];

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const currentStock = product.stock;
    const newStock = currentStock + quantityChange;

    if (newStock < 0) {
      return { success: false, error: 'Insufficient stock' };
    }

    product.stock = newStock;
    saveProducts(products);

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