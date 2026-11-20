# LinkShop - E-commerce Platform

A modern, responsive e-commerce platform built with vanilla JavaScript, HTML, and CSS. Create your online store, manage products, and accept orders with ease.

## 🌟 Features

- **User Authentication** - Secure signup/login system
- **Store Management** - Create and customize your online store
- **Product Management** - Add, edit, and manage products with multiple images
- **Shopping Cart** - Full-featured cart with quantity controls
- **Order Management** - Track and manage customer orders
- **Customer Portal** - Phone-number account with order history and delivery progress
- **Analytics Dashboard** - Revenue and inventory insights
- **Responsive Design** - Works perfectly on all devices
- **Firebase Ready** - Authentication, Firestore, Storage, Rules and Hosting templates prepared

## 📁 Project Structure

```
LinkShop/
├── index.html          # Login/Signup page
├── dashboard.html      # Admin dashboard
├── store.html          # Public storefront
├── cart.html           # Shopping cart
├── checkout.html       # Customer checkout
├── customer.html       # Customer order portal
├── css/
│   └── styles.css
├── js/
│   ├── auth.js
│   ├── cart.js
│   ├── firebase.js
│   ├── firebase-config.js
│   ├── firebase-config.example.js
│   ├── orders.js
│   ├── products.js
│   └── store.js
├── firebase.json
├── firestore.rules
├── storage.rules
├── FIREBASE_SETUP.md
└── README.md
```

## 🚀 Quick Start

1. Clone the repository.
2. Open `index.html` through a local web server.
3. Complete the Firebase setup in `FIREBASE_SETUP.md` before deploying.

The current local app still uses browser localStorage until the Firebase migration is completed.

### Multi-shop database model

- `users/{userId}` — owner profile and role
- `shops/{shopId}` — `ownerId` and public shop configuration
- `products/{productId}` — product data with its `shopId`
- `orders/{orderId}` — server-created orders associated with a `shopId`

Each shop is isolated by ownership rules. Checkout totals must be calculated by the `createOrder` callable function; the browser must never write its own order total.

## 💡 Usage

### For Store Owners

1. **Sign Up** - Create your account
2. **Set Up Store** - Choose store name and URL
3. **Add Products** - Upload images and set prices
4. **Share Store Link** - Send to customers
5. **Manage Orders** - View and fulfill orders

### For Customers

1. **Browse Store** - View products and prices
2. **Add to Cart** - Select items and quantities
3. **Checkout** - Complete purchase
4. **Contact Store** - WhatsApp integration

## 🛠️ Technical Details

### Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Icons**: Lucide Icons
- **Storage**: Firebase Firestore and Storage (configuration prepared)
- **Currency**: Ghana Cedis (GHS)

### Key Features

- **Multiple Image Upload** - Up to 5 images per product
- **Image Fullscreen Viewer** - Click images to view full size
- **Product Editing** - Edit existing products
- **Responsive Design** - Mobile-first approach
- **Offline Support** - Works without internet
- **WhatsApp Integration** - Direct customer communication

## 📱 Screenshots

### Dashboard

- Product management with image previews
- Order tracking and analytics
- Store settings and sharing options

### Storefront

- Clean product grid layout
- Shopping cart with quantity controls
- Responsive mobile design

## 🔧 Development

### File Organization

- **HTML files** in root directory
- **JavaScript files** in `js/` folder
- **CSS files** in `css/` folder
- **Documentation** in `docs/` folder

### Code Style

- Modern JavaScript with async/await
- Modular architecture
- Consistent naming conventions
- Comprehensive error handling

## 📊 Features Overview

| Feature              | Status | Description                                         |
| -------------------- | ------ | --------------------------------------------------- |
| User Auth            | ✅     | Signup/Login with validation                        |
| Store Setup          | ✅     | Custom store names and URLs                         |
| Product CRUD         | ✅     | Create, Read, Update, Delete products               |
| Multiple Images      | ✅     | Up to 5 images per product                          |
| Image Viewer         | ✅     | Fullscreen image viewing                            |
| Shopping Cart        | ✅     | Add, remove, quantity controls                      |
| Order Management     | ✅     | Track orders and status                             |
| Analytics            | ✅     | Revenue and inventory reports                       |
| WhatsApp Integration | ✅     | Direct customer messaging                           |
| Responsive Design    | ✅     | Mobile and desktop optimized                        |
| Firebase Setup       | ✅     | Configuration, rules and hosting templates prepared |

## 🌍 Currency Support

The application uses **Ghana Cedis (GHS)** as the default currency with proper locale formatting.

## 📞 Support

For questions or issues:

- Check the `docs/` folder for detailed guides
- Review browser console for errors
- Ensure all files are in correct directories

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for Ghanaian entrepreneurs**
