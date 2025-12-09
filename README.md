# Hacktimus — Auto-Coupon System

A minimal, polished mini-site with shopping cart, backend API endpoints, and coupon management system ready for BoltIc webhook integration.

## 🚀 Tech Stack

- **Frontend**: React (Vite), TypeScript, TailwindCSS, React Router, Zustand
- **Backend**: Node.js, Express, TypeScript
- **Data**: Local JSON files for products and coupons

## 📦 Features

- Product listing with add-to-cart functionality
- Real-time cart management with drawer UI
- Coupon application and validation
- Webhook endpoints for BoltIc integration
- Savings popup for coupon suggestions
- Modern, responsive UI with Tailwind

## 🛠️ Setup Instructions

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📡 API Endpoints

### Cart Management
- `POST /cart/add` - Add item to cart
- `POST /cart/remove` - Remove item from cart
- `GET /cart` - Get current cart
- `POST /cart/apply-coupon` - Apply coupon code

### Webhook Endpoints (BoltIc Integration)
- `POST /events/cart-updated` - Receives cart updates
- `POST /coupon-result` - Receives coupon suggestions

## 🎯 Testing the Flow

1. Start both backend and frontend servers
2. Add products to cart in the UI
3. Use the "Simulate BoltIc" button to trigger a coupon suggestion
4. View the savings popup with recommended coupon
5. Click "Apply" to apply the coupon

## 📝 Sample Data

### Coupons
- `WELCOME50` - 50% off on orders above ₹100
- `FLAT200` - ₹200 flat discount on electronics (min ₹1000)
- `FOOD10` - 10% off on grocery/food items (min ₹200)

### Products
- 6 sample products across electronics, grocery, and fashion categories

## 🔍 Development Notes

- Cart state is maintained in-memory on the backend
- Frontend automatically notifies backend of cart changes via `/events/cart-updated`
- Console logs are added for debugging webhook flow
- UI uses modern color palette with accessibility in mind
