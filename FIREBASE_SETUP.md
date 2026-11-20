# Firebase Setup

## 1. Create a Firebase project

1. Enable **Authentication → Email/Password**.
2. Create a **Firestore Database**.
3. Enable **Firebase Storage**.
4. Register a **Web app** and copy its configuration.
5. For GitHub Pages, add the exact hosted domain to Firebase Authentication's authorized domains.

## 2. Add the browser configuration

Copy `js/firebase-config.example.js` to `js/firebase-config.js`, then replace the placeholders with the web app values.

`js/firebase-config.js` is intentionally ignored by Git because it contains project configuration. Firebase web configuration is not a secret, but keeping project-specific values out of source history is recommended.

## 3. Data model

- `users/{userId}` — `name`, `email`, and `role`
- `shops/{shopId}` — `ownerId`, `shopName`, `slug`, `description`, and `logo`
- `products/{productId}` — `shopId`, `name`, `price`, `image`, and `stock`
- `orders/{orderId}` — server-created `shopId`, `customerName`, `customerPhone`, `address`, trusted `items`, calculated `total`, and `status`

The browser must not write orders or product totals. Checkout calls the `createOrder` callable Cloud Function, which reads current product prices and stock from the server and performs a transaction.

## 4. Enable App Check

1. Register the web app with reCAPTCHA v3 or reCAPTCHA Enterprise in Firebase App Check.
2. Add the reCAPTCHA site key to the frontend.
3. Enable App Check enforcement for Cloud Functions and enable enforcement for Firestore and Storage after testing.
4. Keep Firebase Admin SDK credentials and service-account keys out of the frontend and Git repository.

## 5. Deploy

```powershell
cd functions
npm install
cd ..
firebase login
firebase use --add
firebase deploy --only firestore:rules,storage:rules,functions,hosting
```

## 6. Production security checklist

- Add rate limiting or a per-network abuse guard around public order creation.
- Monitor failed order creations and stock conflicts.
- Restrict owner dashboard operations to authenticated owners.
- Use indexed queries for public shops and products.
- Review Security Rules and App Check enforcement before launch.

Do not deploy Firebase Hosting until the real `firebase-config.js` file is in place.

## 7. Security notes

- Never store passwords or private credentials in browser JavaScript.
- Keep the real app configuration out of public source only if desired; Firebase Security Rules remain the real authorization boundary.
- Add public store and product indexes before production queries if needed.
