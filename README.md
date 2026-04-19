# LinkShop - E-commerce Platform

A modern, responsive e-commerce platform built with vanilla JavaScript, HTML, and CSS. Create your online store, manage products, and accept orders with ease.

## 🌟 Features

- **User Authentication** - Secure signup/login system
- **Store Management** - Create and customize your online store
- **Product Management** - Add, edit, and manage products with multiple images
- **Shopping Cart** - Full-featured cart with quantity controls
- **Order Management** - Track and manage customer orders
- **Analytics Dashboard** - Revenue and inventory insights
- **Responsive Design** - Works perfectly on all devices
- **Local Storage** - No server required for development

## 📁 Project Structure

```
LinkShop/
├── index.html          # Login/Signup page
├── dashboard.html      # Admin dashboard
├── store.html          # Public storefront
├── cart.html           # Shopping cart
├── css/
│   └── styles.css      # Custom styles
├── js/
│   ├── auth.js         # Authentication logic
│   ├── cart.js         # Shopping cart functionality
│   ├── firebase.js     # Helper functions & localStorage mock
│   ├── orders.js       # Order management
│   ├── products.js     # Product CRUD operations
│   └── store.js        # Store utilities
├── docs/               # Documentation
└── README.md          # This file
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/LeGrand-Jnr/LinkShop.git
   cd LinkShop
   ```

2. **Open in browser**
   - Open `index.html` in your web browser
   - No server required - works with localStorage

3. **Create your store**
   - Sign up with email and password
   - Set up your store name and URL
   - Start adding products

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
- **Storage**: localStorage (development) / Firebase (production)
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

| Feature | Status | Description |
|---------|--------|-------------|
| User Auth | ✅ | Signup/Login with validation |
| Store Setup | ✅ | Custom store names and URLs |
| Product CRUD | ✅ | Create, Read, Update, Delete products |
| Multiple Images | ✅ | Up to 5 images per product |
| Image Viewer | ✅ | Fullscreen image viewing |
| Shopping Cart | ✅ | Add, remove, quantity controls |
| Order Management | ✅ | Track orders and status |
| Analytics | ✅ | Revenue and inventory reports |
| WhatsApp Integration | ✅ | Direct customer messaging |
| Responsive Design | ✅ | Mobile and desktop optimized |
| Local Storage | ✅ | No server required |

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