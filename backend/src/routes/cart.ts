import { Router, Request, Response } from 'express';
import * as path from 'path';

const router = Router();

// Inline coupon data to avoid file system issues in deployment
const coupons = [
  {"code":"WELCOME50","type":"percent","value":50,"min_cart_value":100,"max_discount":200,"allowed_categories":[]},
  {"code":"FLAT200","type":"flat","value":200,"min_cart_value":1000,"max_discount":200,"allowed_categories":["electronics"]},
  {"code":"FOOD10","type":"percent","value":10,"min_cart_value":200,"max_discount":100,"allowed_categories":["grocery","food"]},
  {"code":"FASHION15","type":"percent","value":15,"min_cart_value":500,"max_discount":300,"allowed_categories":["fashion"]},
  {"code":"GROCERY20","type":"percent","value":20,"min_cart_value":800,"max_discount":250,"allowed_categories":["grocery"]},
  {"code":"TECH100","type":"flat","value":100,"min_cart_value":2500,"max_discount":100,"allowed_categories":["electronics"]},
  {"code":"MEGA500","type":"flat","value":500,"min_cart_value":5000,"max_discount":500,"allowed_categories":[]}
];

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  discount?: number;
  appliedCoupon?: string;
  total?: number;
}

// In-memory cart storage (in production, use Redis or database)
let cart: Cart = {
  items: [],
  subtotal: 0
};

// Sample products data for reference
const products = [
  {"id":"p1","name":"Wireless Headphones","price":1499,"category":"electronics"},
  {"id":"p2","name":"Fitness Band","price":999,"category":"electronics"},
  {"id":"p3","name":"Coffee Beans (500g)","price":499,"category":"grocery"},
  {"id":"p4","name":"Running Shoes","price":2499,"category":"fashion"},
  {"id":"p5","name":"T-Shirt Pack","price":799,"category":"fashion"},
  {"id":"p6","name":"Protein Bar Box","price":1299,"category":"grocery"},
  {"id":"p7","name":"Bluetooth Speaker","price":1899,"category":"electronics"},
  {"id":"p8","name":"Smartwatch Pro","price":3499,"category":"electronics"},
  {"id":"p9","name":"Organic Honey (1kg)","price":649,"category":"grocery"},
  {"id":"p10","name":"Almond Pack (500g)","price":899,"category":"grocery"},
  {"id":"p11","name":"Denim Jacket","price":1799,"category":"fashion"},
  {"id":"p12","name":"Sneakers White","price":1599,"category":"fashion"},
  {"id":"p13","name":"USB Cable 3-Pack","price":299,"category":"electronics"},
  {"id":"p14","name":"Green Tea (250g)","price":399,"category":"grocery"},
  {"id":"p15","name":"Cotton Socks Pack","price":199,"category":"fashion"}
];

const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
};

// POST /cart/add
router.post('/add', (req: Request, res: Response) => {
  const { productId, qty = 1 } = req.body;
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const existingItem = cart.items.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
      category: product.category
    });
  }
  
  cart.subtotal = calculateSubtotal(cart.items);
  cart.total = cart.subtotal - (cart.discount || 0);
  
  console.log(`✅ Added ${qty}x ${product.name} to cart`);
  res.json(cart);
});

// POST /cart/remove
router.post('/remove', (req: Request, res: Response) => {
  const { productId, qty } = req.body;
  
  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not in cart' });
  }
  
  if (qty && qty > 0) {
    cart.items[itemIndex].qty -= qty;
    if (cart.items[itemIndex].qty <= 0) {
      cart.items.splice(itemIndex, 1);
    }
  } else {
    cart.items.splice(itemIndex, 1);
  }
  
  cart.subtotal = calculateSubtotal(cart.items);
  cart.total = cart.subtotal - (cart.discount || 0);
  
  console.log(`🗑️ Removed item ${productId} from cart`);
  res.json(cart);
});

// GET /cart
router.get('/', (req: Request, res: Response) => {
  res.json(cart);
});

// POST /cart/apply-coupon
router.post('/apply-coupon', (req: Request, res: Response) => {
  const { code } = req.body;
  
  const coupon = coupons.find((c: any) => c.code === code);
  
  if (!coupon) {
    return res.json({ 
      success: false, 
      message: 'Invalid coupon code' 
    });
  }
  
  // Check minimum cart value
  if (cart.subtotal < coupon.min_cart_value) {
    return res.json({ 
      success: false, 
      message: `Minimum cart value of ₹${coupon.min_cart_value} required` 
    });
  }
  
  // Check allowed categories
  if (coupon.allowed_categories.length > 0) {
    const hasAllowedCategory = cart.items.some(item => 
      coupon.allowed_categories.includes(item.category)
    );
    
    if (!hasAllowedCategory) {
      return res.json({ 
        success: false, 
        message: `Coupon only applicable to ${coupon.allowed_categories.join(', ')} items` 
      });
    }
  }
  
  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percent') {
    discount = (cart.subtotal * coupon.value) / 100;
  } else if (coupon.type === 'flat') {
    discount = coupon.value;
  }
  
  // Apply max discount cap
  discount = Math.min(discount, coupon.max_discount);
  
  cart.discount = discount;
  cart.appliedCoupon = code;
  cart.total = cart.subtotal - discount;
  
  console.log(`🎉 Applied coupon ${code}: -₹${discount}`);
  
  res.json({ 
    success: true, 
    newTotal: cart.total,
    discount,
    message: `Coupon applied! You saved ₹${discount}`,
    cart
  });
});

// Clear cart (helper endpoint)
router.post('/clear', (req: Request, res: Response) => {
  cart = { items: [], subtotal: 0 };
  console.log('🧹 Cart cleared');
  res.json(cart);
});

export default router;
