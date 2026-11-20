// ============================================
// STORE MODULE
// ============================================

// Get store by slug
async function getStoreBySlug(slug) {
  return await getProductsBySlug(slug);
}

// Generate store URL
function getStoreUrl(slug) {
  const normalizedSlug = generateSlug(slug);
  const url = new URL('store.html', window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('shop', normalizedSlug);
  return url.href;
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
  if (order.email) message += `✉️ Email: ${order.email}\n`;
  message += `🚚 Delivery: ${order.delivery_type}\n`;
  if (order.address) message += `📍 Address: ${order.address}\n`;
  if (order.notes) message += `📝 Notes: ${order.notes}\n`;
  message += `\n📦 *Items:*\n`;
  order.items.forEach(item => {
    message += `  • ${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}\n`;
  });
  message += `\n💰 *Total: ${formatCurrency(order.total)}*`;
  return message;
}

// Build WhatsApp link for a complete customer order
function getWhatsAppOrderUrl(phone, order, storeName) {
  if (!phone) return '';

  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (!cleanPhone) return '';

  const message = generateOrderMessage(order, storeName);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}