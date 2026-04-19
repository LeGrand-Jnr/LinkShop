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

// Generate QR code URL
function getQrCodeUrl(url) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
}

// Generate WhatsApp message link
function getWhatsAppLink(phone, message) {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
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