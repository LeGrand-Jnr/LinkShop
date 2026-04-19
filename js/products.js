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

// Helper: Convert file to data URL
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Migration: Update existing products with mock URLs to use proper data URLs
function migrateProductImages() {
  const products = getStoredProducts();
  let migrated = false;

  Object.keys(products).forEach(productId => {
    const product = products[productId];

    // Check if product has old mock URLs
    if (product.media_urls && product.media_urls.length > 0) {
      const hasMockUrls = product.media_urls.some(url => url.includes('mock-image') || url.includes('placeholder'));
      if (hasMockUrls) {
        // For now, we'll clear the mock URLs since we can't convert them back to actual files
        // In a real app, you'd need to re-upload the images
        console.warn(`Product ${product.name} has mock URLs that need to be re-uploaded`);
        product.media_urls = [];
        migrated = true;
      }
    }

    // Check legacy media_url field
    if (product.media_url && (product.media_url.includes('mock-image') || product.media_url.includes('placeholder'))) {
      console.warn(`Product ${product.name} has legacy mock URL that needs to be re-uploaded`);
      product.media_url = null;
      migrated = true;
    }
  });

  if (migrated) {
    saveProducts(products);
    console.log('Product migration completed. Products with mock URLs have been cleared and need re-uploading.');
  }
}

// Initialize migration on module load
migrateProductImages();

// Helper: Generate unique product ID
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

    // Process uploaded files to data URLs for localhost display
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await readFileAsDataURL(file);
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `products/${userId}/${timestamp}_${i}_${sanitizedName}`;

        filePaths.push(filePath);
        mediaUrls.push(dataUrl); // Store actual data URL instead of mock URL
      }
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
      media_urls: mediaUrls, // Array of data URLs
      media_paths: filePaths, // Array of file paths
      created_at: new Date().toISOString()
    };

    products[productId] = product;
    saveProducts(products);

    return { success: true, id: productId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update an existing product
async function updateProduct(userId, productId, productData, files) {
  try {
    const products = getStoredProducts();
    const product = products[productId];

    if (!product || product.user_id !== userId) {
      return { success: false, error: 'Product not found or access denied' };
    }

    // Update fields
    product.name = productData.name;
    product.description = productData.description || '';
    product.price = parseFloat(productData.price);
    product.cost_price = parseFloat(productData.cost_price) || 0;
    product.stock = parseInt(productData.stock);

    if (files && files.length > 0) {
      let mediaUrls = [];
      let filePaths = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await readFileAsDataURL(file);
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `products/${userId}/${timestamp}_${i}_${sanitizedName}`;

        filePaths.push(filePath);
        mediaUrls.push(dataUrl); // Store actual data URL
      }

      product.media_urls = mediaUrls;
      product.media_paths = filePaths;
    }

    saveProducts(products);
    return { success: true };
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