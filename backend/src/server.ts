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
    console.log('\n🚀 Sending cart data to BoltIc AI...');
    console.log('Payload:', JSON.stringify(cartData, null, 2));
    
    const response = await fetch(BOLTIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET
      },
      body: JSON.stringify({
        cart: cartData,
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
  
  try {
    // Call actual BoltIc workflow
    const bolticResult = await callBolticWorkflow(cart);
    
    // Store the result
    (global as any).latestCouponSuggestion = {
      ...bolticResult,
      timestamp: new Date().toISOString()
    };
    
    res.json({ 
      success: true, 
      recommendation: bolticResult,
      source: 'boltic-ai'
    });
  } catch (error: any) {
    console.error('❌ BoltIc API call failed, falling back to local simulation');
    
    // Fallback to local simulation if BoltIc fails
    let recommendation = null;
    const subtotal = cart?.subtotal || 0;
    
    if (subtotal >= 1000) {
      recommendation = {
        recommendedCoupon: {
          code: 'FLAT200',
          discount: 200,
          reason: 'Save ₹200 on your electronics purchase!'
        },
        cartSnapshot: cart
      };
    } else if (subtotal >= 100) {
      recommendation = {
        recommendedCoupon: {
          code: 'WELCOME50',
          discount: Math.min(subtotal * 0.5, 200),
          reason: 'Get 50% off your order!'
        },
        cartSnapshot: cart
      };
    }
    
    if (recommendation) {
      (global as any).latestCouponSuggestion = {
        ...recommendation,
        timestamp: new Date().toISOString(),
        source: 'local-fallback'
      };
      
      res.json({ success: true, recommendation, source: 'fallback' });
    } else {
      res.json({ success: false, message: 'No suitable coupon found' });
    }
  }
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
