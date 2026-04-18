# LinkShop Application - Complete Testing Guide

## ✅ Issues Fixed
1. **Duplicate code in dashboard.html** - Removed duplicate button reset code
2. **Incomplete cart.html** - Added complete renderCart(), updateQuantity(), removeFromCart() functions
3. **Cart item display** - Removed item description to prevent layout issues

---

## 🧪 How to Test the Application

### Step 1: Open the Application
1. Open `index.html` in your web browser
2. You should see the LinkShop login/signup page
3. Check console (F12) for any errors

### Step 2: Test Sign Up
1. Click the "Sign Up" tab
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Create Account"
5. ✅ You should see store setup modal
6. Fill in:
   - Store Name: "My Test Store"
   - Store URL: "my-test-store"
   - WhatsApp (optional)
7. Click "Create Store"
8. ✅ Should redirect to dashboard.html

### Step 3: Test Dashboard Menu Navigation
1. On dashboard, you should see 4 menu items in sidebar:
   - Store Settings ✅ (active by default)
   - Products
   - Orders
   - Analytics

2. **Click each menu item** and verify:
   - "Store Settings" - Shows store info form and share options
   - "Products" - Shows product grid and add product button
   - "Orders" - Shows order filters and list
   - "Analytics" - Shows stats cards and inventory status

### Step 4: Test Add Product
1. Go to Products section
2. Click "Add Product" button
3. Fill in:
   - Product Name: "Test Product"
   - Description: "This is a test"
   - Price: 29.99
   - Cost Price: 15.00
   - Stock: 10
4. **Select up to 5 images** (drag & drop or click)
5. ✅ Images should show in preview grid
6. Click "Add Product"
7. ✅ Should see success toast and product in list

### Step 5: Test Product Display
1. Go to Products section
2. ✅ Added product should appear with:
   - First image displayed
   - Product name
   - Price
   - Stock level
   - Delete button

### Step 6: Test Store View
1. Go to Store Settings section
2. ✅ Should show:
   - Store Name, Slug, WhatsApp fields
   - Store link (can copy to clipboard)
   - QR code
   - Inventory alerts

### Step 7: Test Public Store Viewing
1. Copy the store link from Store Settings
2. Open in new incognito/private window
3. ✅ Should see:
   - Store name in header
   - Products grid with first image
   - Search bar
   - Add to Cart buttons
   - Cart badge in header

### Step 8: Test Shopping Cart
1. Click "Add to Cart" on any product
2. ✅ Should see:
   - Success toast message
   - Cart badge appears with count
   - Floating cart button (mobile)
3. Click shopping cart icon
4. ✅ Should navigate to cart.html showing:
   - Product image
   - Product name, price
   - Quantity controls
   - Remove button
   - Subtotal
   - Clear Cart and Checkout buttons

### Step 9: Test Cart Quantity
1. In cart, click + or - buttons
2. ✅ Quantity should update
3. ✅ Subtotal should recalculate
4. Click remove button
5. ✅ Item should disappear
6. Add another item and test quantity again

### Step 10: Test Login with Existing Account
1. Go back to index.html (clear tab or new window)
2. Click "Login" tab
3. Enter: `test@example.com` / `password123`
4. ✅ Should redirect to dashboard
5. Store info should load automatically

---

## 🔍 Common Issues & Solutions

### "Menu items don't work"
- Check: Inline scripts section in dashboard.html (initDashboard function)
- Check: Section IDs match: section-store, section-products, section-orders, section-analytics
- Check: Browser console for JavaScript errors (F12)

### "Images not showing"
- For local testing, images are stored as mock URLs in localStorage
- Images show as placeholder if no image selected
- Check: File preview appears when files selected

### "Cart not updating"
- Check: Browser localStorage is enabled
- Check: CART_KEY in cart.js is 'linkshop_cart'
- Try: Refresh page and test again

### "Login not working"
- Check: Email and password are correctly entered
- Check: Account was created in sign up
- Check: Console for auth.js errors

---

## 📝 Expected Behavior Summary

| Feature | Expected | Status |
|---------|----------|--------|
| Sign Up | Creates account & store | ✅ Ready |
| Login | Redirects to dashboard | ✅ Ready |
| Menu Navigation | Switches sections | ✅ Ready |
| Add Product | Multiple images up to 5 | ✅ Ready |
| Product Display | Shows first image | ✅ Ready |
| Store View | Public product display | ✅ Ready |
| Add to Cart | Updates cart count | ✅ Ready |
| Cart Page | Shows items with images | ✅ Ready |
| Quantity Control | Update & recalculate | ✅ Ready |
| Orders | Display and filter | ✅ Ready |
| Analytics | Show stats | ✅ Ready |

---

## 🛠️ Technical Notes

### Browser Storage (localStorage)
- `linkshop_users` - User accounts
- `linkshop_products` - Products
- `linkshop_orders` - Orders
- `linkshop_cart` - Shopping cart
- `linkshop_cart_store` - Current store slug
- `linkshop_current_user` - Logged in user

### File Structure
```
LinkShop/
├── index.html (login/signup)
├── dashboard.html (admin panel)
├── store.html (public storefront)
├── cart.html (shopping cart)
├── auth.js (authentication)
├── products.js (product management)
├── orders.js (order management)
├── cart.js (cart functions)
├── store.js (store utilities)
├── firebase.js (mock firebase + helpers)
└── styles.css (custom styles)
```

### Script Load Order (Important)
1. Tailwind CSS
2. Lucide icons
3. firebase.js (helpers & mock)
4. auth.js
5. products.js
6. orders.js
7. cart.js
8. store.js
9. Inline scripts

---

## 📞 Support Notes

If something breaks:
1. Clear browser cache (Ctrl+Shift+Del)
2. Check console for errors (F12 → Console tab)
3. Verify localStorage isn't corrupted (F12 → Application tab)
4. Try incognito/private window
5. Check file paths match (no 404 errors)
