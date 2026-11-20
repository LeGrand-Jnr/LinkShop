const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

exports.createOrder = onCall({ enforceAppCheck: true, cors: true }, async (request) => {
  const data = request.data || {};
  const shopId = cleanText(data.shopId, 128);
  const customerName = cleanText(data.customerName, 100);
  const customerPhone = cleanText(data.customerPhone, 30).replace(/[^0-9+]/g, '');
  const address = cleanText(data.address, 500);
  const items = Array.isArray(data.items) ? data.items : [];

  if (!shopId || !customerName || !customerPhone || !address) {
    throw new HttpsError('invalid-argument', 'Shop, customer name, phone and address are required.');
  }
  if (items.length < 1 || items.length > 30) {
    throw new HttpsError('invalid-argument', 'An order must contain between 1 and 30 items.');
  }

  const normalizedItems = [];
  const seen = new Set();
  for (const item of items) {
    const productId = cleanText(item && item.productId, 128);
    const quantity = Number(item && item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new HttpsError('invalid-argument', 'Invalid product or quantity.');
    }
    if (seen.has(productId)) {
      throw new HttpsError('invalid-argument', 'Duplicate products are not allowed.');
    }
    seen.add(productId);
    normalizedItems.push({ productId, quantity });
  }

  try {
    return await db.runTransaction(async (transaction) => {
      const shopRef = db.collection('shops').doc(shopId);
      const shopDoc = await transaction.get(shopRef);
      if (!shopDoc.exists) {
        throw new HttpsError('not-found', 'Shop not found.');
      }

      let total = 0;
      const trustedItems = [];

      for (const item of normalizedItems) {
        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) {
          throw new HttpsError('not-found', 'A selected product no longer exists.');
        }

        const product = productDoc.data();
        if (product.shopId !== shopId) {
          throw new HttpsError('failed-precondition', 'Product does not belong to this shop.');
        }
        if (!Number.isFinite(product.price) || product.price < 0) {
          throw new HttpsError('failed-precondition', 'Product price is unavailable.');
        }
        if (!Number.isInteger(product.stock) || product.stock < item.quantity) {
          throw new HttpsError('failed-precondition', 'Requested quantity exceeds available stock.');
        }

        transaction.update(productRef, { stock: product.stock - item.quantity });
        total += product.price * item.quantity;
        trustedItems.push({
          productId: item.productId,
          name: cleanText(product.name, 100),
          price: product.price,
          quantity: item.quantity
        });
      }

      const orderRef = db.collection('orders').doc();
      transaction.set(orderRef, {
        shopId,
        customerName,
        customerPhone,
        address,
        items: trustedItems,
        total: Math.round(total * 100) / 100,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      return { orderId: orderRef.id, total: Math.round(total * 100) / 100 };
    });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('createOrder failed', error);
    throw new HttpsError('internal', 'Could not create order.');
  }
});
