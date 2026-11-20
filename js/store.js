// ============================================
// STORE MODULE
// ============================================

// Get store by slug
async function getStoreBySlug(slug) {
  return await getProductsBySlug(slug);
}

// Generate store URL
function getStoreUrl(slug) {
  return `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}store.html?shop=${slug}`;
}

// Generate a QR code locally with the bundled QRCode library
function getQrCodeUrl(url) {
  return url;
}

// Generate WhatsApp message text for local clipboard use
function getWhatsAppLink(phone, message) {
  return message;
}

// Generate order summary message for WhatsApp
function generateOrderMessage(order, storeName) {
  let message = `🛒 *New Order from ${storeName}*\n\n`;
  message += `📋 Order ID: ${order.id}\n`;
  message += `👤 Customer: ${order.customer_name}\n`;
  message += `📞 Phone: ${order.phone}\n`;
  message += `🚚 Delivery: ${order.delivery_type}\n`;
  if (order.address) message += `📍 Address: ${order.address}\n`;
  message += `\n📦 *Items:*\n`;
  order.items.forEach(item => {
    message += `  • ${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}\n`;
  });
  message += `\n💰 *Total: ${formatCurrency(order.total)}*`;
  return message;
}