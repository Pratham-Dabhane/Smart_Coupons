import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import cartRoutes from './routes/cart';

const app = express();
const PORT = 3001;

// BoltIc Configuration
const BOLTIC_API_URL = "https://asia-south1.api.boltic.io/service/webhook/temporal/v1.0/97613e6f-451c-4183-8aad-7ace0748086a/workflows/execute/c71f5b89-eee8-47c1-bcf7-68f7b54c51c2";
const WEBHOOK_SECRET = "my_super_secret_123";

// Analytics Data Store
let analyticsData = {
  totalCartsOptimized: 0,
  totalSavings: 0,
  recentOptimizations: [] as Array<{
    timestamp: string;
    cartValue: number;
    couponApplied: string;
    savingsAmount: number;
  }>
};

// Track optimization (call this when coupon is applied)
function trackOptimization(cartValue: number, couponCode: string, savingsAmount: number) {
  analyticsData.totalCartsOptimized++;
  analyticsData.totalSavings += savingsAmount;
  analyticsData.recentOptimizations.unshift({
    timestamp: new Date().toISOString(),
    cartValue,
    couponApplied: couponCode,
    savingsAmount
  });
  // Keep only last 10
  if (analyticsData.recentOptimizations.length > 10) {
    analyticsData.recentOptimizations = analyticsData.recentOptimizations.slice(0, 10);
  }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/cart', cartRoutes);

// Helper function to call BoltIc API
async function callBolticWorkflow(cartData: any) {
  try {
    // Detect user segment
    const isVIP = cartData.subtotal > 5000; // VIP if cart > ₹5000
    const isNewUser = !cartData.userId || cartData.userId?.includes('new');
    
    console.log('\n🚀 Sending cart data to BoltIc AI...');
    console.log('User Segment:', isVIP ? '👑 VIP' : isNewUser ? '🆕 New User' : '👤 Regular');
    console.log('Payload:', JSON.stringify(cartData, null, 2));
    
    const response = await fetch(BOLTIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET
      },
      body: JSON.stringify({
        cart: cartData,
        userSegment: isVIP ? 'vip' : isNewUser ? 'new' : 'regular',
        timestamp: new Date().toISOString(),
        source: 'smart-coupons-app'
      })
    });

    if (!response.ok) {
      throw new Error(`BoltIc API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ BoltIc Response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Error calling BoltIc:', error);
    throw error;
  }
}

// Webhook endpoints for BoltIc integration
app.post('/events/cart-updated', async (req: Request, res: Response) => {
  console.log('\n🔔 [WEBHOOK] Cart Updated Event Received');
  console.log('Cart Snapshot:', JSON.stringify(req.body, null, 2));
  
  try {
    // Forward cart data to BoltIc for AI analysis
    const bolticResult = await callBolticWorkflow(req.body);
    
    // Store the result for frontend to fetch
    (global as any).latestCouponSuggestion = {
      ...bolticResult,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Cart analysis complete and stored');
    console.log('---');
    
    res.status(200).json({ 
      success: true, 
      message: 'Cart update processed by BoltIc',
      bolticResponse: bolticResult,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error processing cart update:', error.message);
    console.log('---');
    
    // Return success even if BoltIc fails (graceful degradation)
    res.status(200).json({ 
      success: true, 
      message: 'Cart update received (BoltIc unavailable)',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/coupon-result', (req: Request, res: Response) => {
  console.log('\n💡 [WEBHOOK] Coupon Suggestion Received from BoltIc');
  console.log('Recommendation:', JSON.stringify(req.body, null, 2));
  
  const { recommendedCoupon, cartSnapshot } = req.body;
  
  // Track this optimization
  if (recommendedCoupon && cartSnapshot) {
    trackOptimization(
      cartSnapshot.subtotal || 0,
      recommendedCoupon.code,
      recommendedCoupon.discount || 0
    );
    console.log('📊 Analytics updated: Total carts:', analyticsData.totalCartsOptimized, 'Total savings: ₹', analyticsData.totalSavings);
  }
  
  console.log('---');
  
  // Store the latest recommendation in memory for frontend to fetch
  (global as any).latestCouponSuggestion = {
    ...req.body,
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json({ 
    success: true, 
    message: 'Coupon suggestion stored'
  });
});

// Get latest coupon suggestion (for frontend polling)
app.get('/coupon-suggestion', (req: Request, res: Response) => {
  const suggestion = (global as any).latestCouponSuggestion || null;
  res.json(suggestion);
});

// Simulate BoltIc sending a coupon suggestion (now calls real BoltIc API)
app.post('/simulate-boltic', async (req: Request, res: Response) => {
  const { cart } = req.body;
  
  console.log('\n🤖 [SIMULATE] Triggering BoltIc Analysis...');
  console.log('Cart data:', JSON.stringify(cart, null, 2));
  
  // Always use fallback for demo - BoltIc webhook is async and takes time
  console.log('⚡ Calculating instant recommendation with upsell...');
  
  const subtotal = cart?.subtotal || 0;
  const items = cart?.items || [];
  
  // Get categories from items
  const categories = [...new Set(items.map((item: any) => item.category))].filter(Boolean);
  
  // All available coupons
  const allCoupons = [
    {code: 'WELCOME50', min: 100, maxDiscount: 200, type: 'percent', value: 50, categories: []},
    {code: 'FOOD10', min: 200, maxDiscount: 100, type: 'percent', value: 10, categories: ['grocery', 'food']},
    {code: 'FASHION15', min: 500, maxDiscount: 300, type: 'percent', value: 15, categories: ['fashion']},
    {code: 'GROCERY20', min: 800, maxDiscount: 250, type: 'percent', value: 20, categories: ['grocery']},
    {code: 'FLAT200', min: 1000, maxDiscount: 200, type: 'flat', value: 200, categories: ['electronics']},
    {code: 'TECH100', min: 2500, maxDiscount: 100, type: 'flat', value: 100, categories: ['electronics']},
    {code: 'MEGA500', min: 5000, maxDiscount: 500, type: 'flat', value: 500, categories: []}
  ];
  
  // Find best eligible coupon
  let bestCoupon = null;
  let bestDiscount = 0;
  
  for (const c of allCoupons) {
    // Check if eligible
    if (subtotal < c.min) continue;
    
    // Check category match
    if (c.categories.length > 0) {
      const hasMatch = c.categories.some(cat => categories.includes(cat));
      if (!hasMatch) continue;
    }
    
    // Calculate discount
    let discount = 0;
    if (c.type === 'percent') {
      discount = Math.min(Math.floor(subtotal * c.value / 100), c.maxDiscount);
    } else {
      discount = Math.min(c.value, c.maxDiscount);
    }
    
    if (discount > bestDiscount) {
      bestDiscount = discount;
      bestCoupon = {
        code: c.code,
        discount: discount,
        type: c.type,
        value: c.value,
        savingsPercent: Math.round((discount / subtotal) * 100),
        newTotal: subtotal - discount
      };
    }
  }
  
  // Calculate upsell suggestion
  let upsellSuggestion = null;
  
  for (const c of allCoupons) {
    // Skip if already have this coupon or better
    if (bestCoupon && bestCoupon.discount >= c.maxDiscount) continue;
    
    // Check if close to unlocking
    if (subtotal < c.min) {
      const needed = c.min - subtotal;
      if (needed <= 1000) { // Show if within ₹1000
        // Calculate potential discount
        let potentialDiscount = 0;
        if (c.type === 'percent') {
          potentialDiscount = Math.min(Math.floor(c.min * c.value / 100), c.maxDiscount);
        } else {
          potentialDiscount = c.maxDiscount;
        }
        
        const extraSavings = potentialDiscount - (bestCoupon ? bestCoupon.discount : 0);
        
        if (extraSavings > 0) {
          upsellSuggestion = {
            message: 'Add ₹' + needed + ' more to unlock ' + c.code + '!',
            code: c.code,
            amountNeeded: needed,
            newDiscount: potentialDiscount,
            extraSavings: extraSavings
          };
          break; // Take first/best upsell
        }
      }
    }
  }
  
  // Generate reason
  let reason = '';
  if (!bestCoupon) {
    reason = 'Add items worth ₹' + (100 - subtotal) + ' to unlock coupons!';
  } else if (categories.includes('electronics')) {
    reason = '🎧 Save ₹' + bestCoupon.discount + ' on electronics worth ₹' + subtotal + '!';
  } else if (categories.includes('grocery') || categories.includes('food')) {
    reason = '🛒 Get ₹' + bestCoupon.discount + ' off your grocery order!';
  } else if (categories.includes('fashion')) {
    reason = '👕 Fashion deal: Save ₹' + bestCoupon.discount + ' now!';
  } else {
    reason = '💰 You\'re saving ₹' + bestCoupon.discount + ' with ' + bestCoupon.code + '!';
  }
  
  if (bestCoupon && bestCoupon.savingsPercent >= 20) {
    reason += ' Limited time offer!';
  }
  
  const recommendation = {
    recommendedCoupon: bestCoupon ? {
      ...bestCoupon,
      reason: reason
    } : null,
    upsellSuggestion: upsellSuggestion,
    cartSnapshot: cart
  };
  
  if (recommendation.recommendedCoupon) {
    console.log('✅ Recommendation ready:', JSON.stringify(recommendation.recommendedCoupon, null, 2));
    if (upsellSuggestion) {
      console.log('💡 Upsell suggestion:', upsellSuggestion.message);
    }
    
    (global as any).latestCouponSuggestion = {
      ...recommendation,
      timestamp: new Date().toISOString(),
      source: 'instant-demo'
    };
    
    res.json({ 
      success: true, 
      ...recommendation,
      timestamp: new Date().toISOString(),
      source: 'instant-demo' 
    });
  } else {
    res.json({ success: false, message: 'Cart value too low (minimum ₹100)' });
  }
  
  // Also trigger BoltIc in background (async, will update via webhook later)
  callBolticWorkflow(cart).catch(err => {
    console.log('⚠️  Background BoltIc call failed (not critical):', err.message);
  });
});

// Analytics Dashboard Endpoint
app.get('/analytics/dashboard', (req: Request, res: Response) => {
  const avgSavings = analyticsData.totalCartsOptimized > 0 
    ? analyticsData.totalSavings / analyticsData.totalCartsOptimized 
    : 0;

  // Find most used coupon
  const couponCounts: Record<string, number> = {};
  analyticsData.recentOptimizations.forEach(opt => {
    couponCounts[opt.couponApplied] = (couponCounts[opt.couponApplied] || 0) + 1;
  });
  const topCoupon = Object.keys(couponCounts).reduce((a, b) => 
    couponCounts[a] > couponCounts[b] ? a : b, 'WELCOME50');

  // Simulated conversion rate (15-25% uplift)
  const conversionRate = Math.round(15 + Math.random() * 10);

  console.log('📊 Analytics dashboard requested');
  
  res.json({
    totalCartsOptimized: analyticsData.totalCartsOptimized,
    totalSavings: Math.round(analyticsData.totalSavings),
    avgSavingsPerCart: Math.round(avgSavings),
    topCoupon: topCoupon,
    conversionRate: conversionRate,
    recentOptimizations: analyticsData.recentOptimizations
  });
});

// Get available coupons (NEW ENDPOINT)
app.get('/coupons', (req: Request, res: Response) => {
  const coupons = [
    {
      code: "WELCOME50",
      type: "percent",
      value: 50,
      min_cart_value: 100,
      max_discount: 200,
      allowed_categories: [],
      description: "50% off on orders above ₹100"
    },
    {
      code: "FLAT200",
      type: "flat",
      value: 200,
      min_cart_value: 1000,
      max_discount: 200,
      allowed_categories: ["electronics"],
      description: "Flat ₹200 off on electronics"
    },
    {
      code: "FOOD10",
      type: "percent",
      value: 10,
      min_cart_value: 200,
      max_discount: 100,
      allowed_categories: ["grocery", "food"],
      description: "10% off on grocery items"
    },
    {
      code: "FASHION15",
      type: "percent",
      value: 15,
      min_cart_value: 500,
      max_discount: 300,
      allowed_categories: ["fashion"],
      description: "15% off on fashion items"
    },
    {
      code: "GROCERY20",
      type: "percent",
      value: 20,
      min_cart_value: 800,
      max_discount: 250,
      allowed_categories: ["grocery"],
      description: "20% off on grocery above ₹800"
    },
    {
      code: "TECH100",
      type: "flat",
      value: 100,
      min_cart_value: 2500,
      max_discount: 100,
      allowed_categories: ["electronics"],
      description: "Flat ₹100 off on electronics above ₹2500"
    },
    {
      code: "MEGA500",
      type: "flat",
      value: 500,
      min_cart_value: 5000,
      max_discount: 500,
      allowed_categories: [],
      description: "Mega ₹500 off on orders above ₹5000"
    }
  ];
  
  console.log('📋 Coupons list requested');
  res.json(coupons);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    bolticConfigured: !!BOLTIC_API_URL
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoints ready for BoltIc integration`);
  console.log(`🤖 BoltIc Workflow URL configured`);
  console.log(`🔐 Webhook secret: ${WEBHOOK_SECRET.substring(0, 10)}...\n`);
});
