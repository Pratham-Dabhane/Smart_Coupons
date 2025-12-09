# Smart Coupons Backend

Express + TypeScript backend for the Auto-Coupon system.

## Setup

```bash
npm install
npm run dev
```

Server runs on port 3001.

## API Endpoints

### Cart Operations
- **POST /cart/add** - Add item to cart
  ```json
  { "productId": "p1", "qty": 1 }
  ```

- **POST /cart/remove** - Remove item from cart
  ```json
  { "productId": "p1", "qty": 1 }
  ```

- **GET /cart** - Get current cart state
  ```json
  {
    "items": [{"productId": "p1", "name": "...", "price": 1499, "qty": 1}],
    "subtotal": 1499
  }
  ```

- **POST /cart/apply-coupon** - Apply coupon code
  ```json
  { "code": "WELCOME50" }
  ```

### Webhook Endpoints
- **POST /events/cart-updated** - Receives cart snapshot from frontend
- **POST /coupon-result** - Receives coupon suggestions from BoltIc

## Coupon Logic

Coupons are validated based on:
- Minimum cart value
- Allowed categories
- Type (percent or flat discount)
- Maximum discount cap
