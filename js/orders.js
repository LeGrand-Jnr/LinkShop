// ============================================
// ORDERS MODULE (LOCALHOST VERSION)
// ============================================

const ORDERS_KEY = 'linkshop_orders';
const CUSTOMERS_KEY = 'linkshop_customers';

function normalizeCustomerPhone(phone) {
  return String(phone || '').replace(/[^0-9]/g, '');
}

function getStoredCustomers() {
  const customers = localStorage.getItem(CUSTOMERS_KEY);
  return customers ? JSON.parse(customers) : {};
}

function saveStoredCustomers(customers) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function getOrCreateCustomer(customerData) {
  const phone = normalizeCustomerPhone(customerData.phone);
  if (!phone) return null;

  const customers = getStoredCustomers();
  const existing = customers[phone] || {};
  const customer = {
    phone,
    name: customerData.name || existing.name || '',
    email: customerData.email || existing.email || '',
    address: customerData.address || existing.address || '',
    created_at: existing.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  customers[phone] = customer;
  saveStoredCustomers(customers);
  localStorage.setItem('linkshop_current_customer', phone);
  return customer;
}

function getCurrentCustomer() {
  const phone = normalizeCustomerPhone(localStorage.getItem('linkshop_current_customer'));
  if (!phone) return null;
  const customer = getStoredCustomers()[phone];
  return customer || null;
}

// Helper: Get orders from localStorage
function getStoredOrders() {
  const orders = localStorage.getItem(ORDERS_KEY);
  return orders ? JSON.parse(orders) : {};
}

// Helper: Save orders to localStorage
function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Helper: Generate order ID
function generateOrderId() {
  return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create a new order
async function createOrder(orderData, cartItems) {
  try {
    const orders = getStoredOrders();
    const orderId = generateOrderId();
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const customerPhone = normalizeCustomerPhone(orderData.phone);

    getOrCreateCustomer({
      name: orderData.customer_name,
      phone: customerPhone,
      email: orderData.email,
      address: orderData.address
    });

    // Create order
    const order = {
      id: orderId,
      reference: 'LS-' + orderId.slice(-8).toUpperCase(),
      store_slug: orderData.store_slug || getCartStore() || '',
      user_id: orderData.user_id,
      customer_id: customerPhone,
      customer_name: orderData.customer_name,
      phone: orderData.phone,
      email: orderData.email || '',
      delivery_type: orderData.delivery_type,
      address: orderData.address || '',
      notes: orderData.notes || '',
      payment_method: orderData.payment_method || 'Pay on delivery',
      payment_status: orderData.payment_status || 'pending',
      payment_reference: orderData.payment_reference || '',
      total: total,
      status: 'pending',
      delivery_stage: 'order_received',
      created_at: new Date().toISOString(),
      items: cartItems.map(item => ({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    orders[orderId] = order;
    saveOrders(orders);

    // Update product stock (reduce for each item)
    for (const item of cartItems) {
      const result = await updateProductStock(item.product_id, -item.quantity);
      if (!result.success) {
        console.warn(`Failed to update stock for product ${item.product_id}: ${result.error}`);
      }
    }

    // Clear cart
    clearCart();

    return { success: true, orderId, order, total };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all orders for a phone-number customer account
async function getCustomerOrders(phone, storeSlug) {
  try {
    const customerPhone = normalizeCustomerPhone(phone);
    const orders = getStoredOrders();
    const customerOrders = Object.values(orders).filter(order => {
      if (normalizeCustomerPhone(order.phone) !== customerPhone) return false;
      if (storeSlug) return order.store_slug === storeSlug;
      return true;
    });
    customerOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { success: true, orders: customerOrders };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all orders for a user
async function getOrders(userId) {
  try {
    const orders = getStoredOrders();
    const userOrders = Object.values(orders).filter(o => o.user_id === userId);

    // Sort by created_at descending
    userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { success: true, orders: userOrders };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const orders = getStoredOrders();
    if (orders[orderId]) {
      orders[orderId].status = status;
      if (status === 'processing') orders[orderId].delivery_stage = 'confirmed';
      if (status === 'shipped') orders[orderId].delivery_stage = 'out_for_delivery';
      if (status === 'completed') {
        orders[orderId].delivery_stage = 'delivered';
        if (orders[orderId].payment_method !== 'Mobile Money') orders[orderId].payment_status = 'paid';
      }
      if (status === 'cancelled') orders[orderId].delivery_stage = 'cancelled';
      saveOrders(orders);
      return { success: true };
    }
    return { success: false, error: 'Order not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateCustomerOrder(orderId, updates) {
  const orders = getStoredOrders();
  if (!orders[orderId]) return { success: false, error: 'Order not found' };
  Object.assign(orders[orderId], updates);
  saveOrders(orders);
  return { success: true };
}

// Get order statistics for analytics
async function getOrderStats(userId) {
  try {
    const orders = getStoredOrders();
    const userOrders = Object.values(orders).filter(o => o.user_id === userId);

    let totalRevenue = 0;
    let totalOrders = userOrders.length;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    userOrders.forEach(order => {
      if (order.status === 'pending') pendingOrders++;
      if (order.status === 'completed') {
        completedOrders++;
        totalRevenue += order.total || 0;
      }
      if (order.status === 'cancelled') cancelledOrders++;
    });

    // Get product count and inventory info
    const products = JSON.parse(localStorage.getItem('linkshop_products') || '{}');
    const userProducts = Object.values(products).filter(p => p.user_id === userId);

    let totalProducts = userProducts.length;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalProfit = 0;

    // Count inventory status
    userProducts.forEach(product => {
      if (product.stock === 0) outOfStockProducts++;
      else if (product.stock < 5) lowStockProducts++;
    });

    // Calculate profit from completed orders
    const completedUserOrders = userOrders.filter(o => o.status === 'completed');
    const productsMap = {};
    userProducts.forEach(p => productsMap[p.id] = p);

    completedUserOrders.forEach(order => {
      order.items.forEach(item => {
        const product = productsMap[item.product_id];
        if (product) {
          totalProfit += (item.price - (product.cost_price || 0)) * item.quantity;
        }
      });
    });

    return {
      success: true,
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalProfit
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}