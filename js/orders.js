// ============================================
// ORDERS MODULE — FIRESTORE
// ============================================

function normalizeCustomerPhone(phone) {
  return String(phone || '').replace(/[^0-9]/g, '');
}

function getOrCreateCustomer(customerData) {
  const phone = normalizeCustomerPhone(customerData.phone);
  if (!phone) return null;
  const customer = {
    phone,
    name: customerData.name || '',
    email: customerData.email || '',
    address: customerData.address || ''
  };
  localStorage.setItem('linkshop_current_customer', phone);
  localStorage.setItem('linkshop_customer_profile', JSON.stringify(customer));
  return customer;
}

function getStoredCustomers() {
  const raw = localStorage.getItem('linkshop_customer_profile');
  const profile = raw ? JSON.parse(raw) : null;
  if (!profile) return {};
  return { [profile.phone]: profile };
}

function getCurrentCustomer() {
  const phone = normalizeCustomerPhone(localStorage.getItem('linkshop_current_customer'));
  if (!phone) return null;
  return getStoredCustomers()[phone] || null;
}

function generateOrderId() {
  return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create a new order
async function createOrder(orderData, cartItems) {
  try {
    if (!firebase.functions) return { success: false, error: 'Firebase Functions are unavailable.' };
    const customerPhone = normalizeCustomerPhone(orderData.phone);
    getOrCreateCustomer({
      name: orderData.customer_name,
      phone: customerPhone,
      email: orderData.email,
      address: orderData.address
    });

    const callable = firebase.functions().httpsCallable('createOrder');
    const result = await callable({
      shopId: orderData.store_slug,
      customerName: orderData.customer_name,
      customerPhone,
      address: orderData.address,
      items: cartItems.map(item => ({ productId: item.product_id, quantity: item.quantity }))
    });

    const orderId = result.data.orderId;
    const order = {
      id: orderId,
      reference: 'LS-' + orderId.slice(-8).toUpperCase(),
      shopId: orderData.store_slug,
      store_slug: orderData.store_slug,
      customerName: orderData.customer_name,
      customer_name: orderData.customer_name,
      customerPhone,
      phone: customerPhone,
      address: orderData.address,
      notes: orderData.notes || '',
      payment_method: orderData.payment_method || 'Pay on delivery',
      payment_status: orderData.payment_status || 'pending',
      payment_reference: orderData.payment_reference || '',
      total: result.data.total,
      status: 'pending',
      delivery_stage: 'order_received',
      created_at: new Date().toISOString(),
      items: cartItems.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    clearCart();
    return { success: true, orderId, order, total: result.data.total };
  } catch (error) {
    return { success: false, error: error.message || 'Could not place order.' };
  }
}

// Get all orders for a phone-number customer account
async function getCustomerOrders(phone, storeSlug) {
  try {
    if (!firebase.functions) return { success: false, error: 'Firebase Functions are unavailable.' };
    const callable = firebase.functions().httpsCallable('getCustomerOrders');
    const result = await callable({
      customerPhone: normalizeCustomerPhone(phone),
      shopId: storeSlug || ''
    });
    return { success: true, orders: result.data.orders || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all orders for a user
async function getOrders(userId) {
  try {
    const shopSnap = await firebase.firestore().collection('shops').where('ownerId', '==', userId).get();
    const shopIds = shopSnap.docs.map(doc => doc.id);
    if (shopIds.length === 0) return { success: true, orders: [] };

    const chunks = [];
    for (let i = 0; i < shopIds.length; i += 10) chunks.push(shopIds.slice(i, i + 10));
    const lists = await Promise.all(chunks.map(ids =>
      firebase.firestore().collection('orders').where('shopId', 'in', ids).get()
    ));

    const orders = lists.flatMap(snap => snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        user_id: userId,
        customer_name: data.customerName || data.customer_name || '',
        phone: data.customerPhone || data.phone || '',
        address: data.address || '',
        created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.created_at || '')
      };
    }));
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { success: true, orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const callable = firebase.functions().httpsCallable('updateOrder');
    await callable({ orderId, status });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateCustomerOrder(orderId, updates) {
  try {
    const callable = firebase.functions().httpsCallable('updateOrder');
    await callable({
      orderId,
      status: updates.status || '',
      deliveryStage: updates.delivery_stage || '',
      paymentStatus: updates.payment_status || ''
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateOrderPayment(orderId, paymentStatus, paymentReference = '') {
  const updates = { payment_status: paymentStatus === 'paid' ? 'paid' : 'pending' };
  if (paymentReference) updates.payment_reference = paymentReference.trim();
  return await updateCustomerOrder(orderId, updates);
}

async function updateOrderDelivery(orderId, deliveryStage) {
  const stageToStatus = {
    order_received: 'pending', confirmed: 'processing',
    out_for_delivery: 'shipped', delivered: 'completed', cancelled: 'cancelled'
  };
  const updates = {
    delivery_stage: deliveryStage,
    status: stageToStatus[deliveryStage] || 'pending'
  };
  if (deliveryStage === 'delivered') updates.payment_status = 'paid';
  return await updateCustomerOrder(orderId, updates);
}

// Get order statistics for analytics
async function getOrderStats(userId) {
  try {
    const orderResult = await getOrders(userId);
    if (!orderResult.success) return orderResult;
    const orders = orderResult.orders;
    const shopId = await getShopIdForOwner(userId);

    const productSnap = shopId
      ? await firebase.firestore().collection('products').where('shopId', '==', shopId).get()
      : { docs: [] };
    const products = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    for (const order of orders) {
      if (order.status === 'pending') pendingOrders++;
      if (order.status === 'completed') {
        completedOrders++;
        totalRevenue += Number(order.total || 0);
      }
      if (order.status === 'cancelled') cancelledOrders++;
    }

    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalProfit = 0;
    const productsMap = {};
    for (const product of products) {
      productsMap[product.id] = product;
      if (product.stock === 0) outOfStockProducts++;
      else if (product.stock < 5) lowStockProducts++;
    }

    for (const order of orders.filter(item => item.status === 'completed')) {
      for (const item of order.items || []) {
        const product = productsMap[item.product_id || item.productId];
        if (product) totalProfit += ((item.price || 0) - (product.cost_price || 0)) * (item.quantity || 0);
      }
    }

    return {
      success: true,
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
      totalProfit
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}