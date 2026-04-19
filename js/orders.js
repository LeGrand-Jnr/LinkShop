// ============================================
// ORDERS MODULE (LOCALHOST VERSION)
// ============================================

const ORDERS_KEY = 'linkshop_orders';

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

    // Create order
    const order = {
      id: orderId,
      user_id: orderData.user_id,
      customer_name: orderData.customer_name,
      phone: orderData.phone,
      email: orderData.email || '',
      delivery_type: orderData.delivery_type,
      address: orderData.address || '',
      notes: orderData.notes || '',
      total: total,
      status: 'pending',
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

    return { success: true, orderId, total };
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
      saveOrders(orders);
      return { success: true };
    }
    return { success: false, error: 'Order not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
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