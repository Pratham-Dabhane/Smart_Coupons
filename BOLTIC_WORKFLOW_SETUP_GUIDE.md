# BoltIc Workflow Setup Guide - Smart Coupons
## Complete Step-by-Step Configuration (Manual Setup)

---

## 📋 **Prerequisites**

Before starting, ensure you have:
- ✅ BoltIc account with access to workflow creation
- ✅ Backend deployed at: `https://smart-coupons.onrender.com`
- ✅ Workflow ID: `c71f5b89-eee8-47c1-bcf7-68f7b54c51c2`
- ✅ Webhook Secret: `my_super_secret_123`

---

## 🎯 **Workflow Overview**

**Name:** Smart Coupons - Cart Optimizer  
**Purpose:** Receive cart updates → Fetch available coupons → Calculate best discount → Return recommendation

**Flow Diagram:**
```
Webhook (Cart Update)
    ↓
Normalize Cart Data
    ↓
Fetch Coupons (API) ──[FAIL]──→ Fallback Coupons (Hardcoded)
    ↓                                      ↓
    └──────────[SUCCESS]───────────────────┘
                    ↓
            Compute Best Coupon
                    ↓
            Return Result
```

---

## 🚀 **Step-by-Step Setup**

### **STEP 1: Create New Workflow**

1. **Login to BoltIc Dashboard**
   - Navigate to: https://app.boltic.io (or your BoltIc URL)
   - Enter credentials and login

2. **Create Workflow**
   - Click **"+ New Workflow"** button (top-right)
   - Or go to: Workflows → Create New

3. **Basic Settings**
   - **Workflow Name:** `Smart Coupons - Cart Optimizer`
   - **Description:** `Receives cart updates, analyzes items, and returns best coupon recommendation`
   - **Status:** Keep as `Draft` (we'll publish later)
   - Click **"Create"** or **"Save"**

---

### **STEP 2: Configure Global Variables**

**Location:** Workflow Settings → Environment Variables / Global Variables

Add these two variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `BACKEND_URL` | `https://smart-coupons.onrender.com` | Your deployed backend URL |
| `WEBHOOK_SECRET` | `my_super_secret_123` | Secret for webhook authentication |

**How to Add:**
1. Click **"Settings"** or **"Environment"** tab in workflow editor
2. Find **"Global Variables"** section
3. Click **"+ Add Variable"**
4. Enter name: `BACKEND_URL`, value: `https://smart-coupons.onrender.com`
5. Click **"+ Add Variable"** again
6. Enter name: `WEBHOOK_SECRET`, value: `my_super_secret_123`
7. **Save** variables

---

### **STEP 3: Configure Retry Settings (Optional)**

**Location:** Workflow Settings → Retry Configuration

```
Initial Interval: 1000 ms
Maximum Attempts: 2
Maximum Interval: 5000 ms
Backoff Coefficient: 2
```

---

## 🔧 **Node Configuration (6 Nodes Total)**

---

### **NODE 1: Webhook Trigger** 🎣

**Purpose:** Receive incoming cart update events from your backend

#### **Configuration:**

1. **Add Node:**
   - Drag **"Webhook"** node from left panel
   - Or click **"+ Add Trigger"** → Select **"Webhook"**

2. **Node Settings:**
   - **Node Name:** `Webhook - Receive Cart Update`
   - **Node ID:** `webhook1` (auto-generated or set manually)
   - **Integration:** `Webhook` (blt-int.webhook)

3. **Authentication:**
   - **Auth Type:** `None` (we handle secret in backend)
   - Leave other auth fields empty

4. **Test Payload (Optional but Recommended):**
   
   Click **"Add Test Payload"** and paste:
   ```json
   {
     "cart": {
       "items": [
         {
           "productId": "p1",
           "name": "Wireless Headphones",
           "price": 1499,
           "qty": 2,
           "category": "electronics"
         }
       ],
       "subtotal": 2998
     },
     "timestamp": "2025-12-09T16:00:00.000Z",
     "source": "smart-coupons-app"
   }
   ```

5. **Save Node**

6. **Copy Webhook URL:**
   - After saving, BoltIc will generate a webhook URL
   - It should look like: `https://asia-south1.api.boltic.io/hooks/v1/c71f5b89-eee8-47c1-bcf7-68f7b54c51c2`
   - **Copy this URL** - you'll need it in your backend configuration

---

### **NODE 2: Normalize Cart Data** 🔄

**Purpose:** Parse and standardize incoming cart data structure

#### **Configuration:**

1. **Add Node:**
   - Drag **"Function"** node from left panel (or "Code" node)
   - Or click **"+"** after webhook1 → Select **"Function Activity"**

2. **Node Settings:**
   - **Node Name:** `Normalize Cart Data`
   - **Node ID:** `normalizeCart`
   - **Integration:** `Function` (blt-int.function)

3. **Connect Input:**
   - Connect from: `webhook1` output
   - To: `normalizeCart` input

4. **Input Configuration:**
   - **Input Variable Name:** `payload`
   - **Input Source:** `{{payload}}` or `{{webhook1.body}}`

5. **Function Code (Language: JavaScript):**

   Paste this **exact code** in the function editor:

   ```javascript
   const IN = (typeof payload !== 'undefined' && payload) || (typeof input !== 'undefined' && input) || {};
   const body = IN.body || IN.payload || IN || {};
   const rawCart = body.cart || body || { items: [], subtotal: 0 };

   const items = (rawCart.items || []).map(item => ({
     id: item.productId || item.id,
     name: item.name || 'Unknown',
     price: Math.round(Number(item.price || 0)),
     qty: Math.max(1, Math.round(Number(item.qty || item.quantity || 1))),
     category: item.category || 'uncategorized'
   }));

   const subtotal = Math.round(rawCart.subtotal || items.reduce((s, i) => s + i.price * i.qty, 0));

   const categories = [...new Set(items.map(i => i.category))].filter(Boolean);

   return {
     cart: {
       items: items,
       subtotal: subtotal,
       itemCount: items.length
     },
     categories: categories,
     metadata: {
       timestamp: body.timestamp || new Date().toISOString(),
       source: body.source || 'unknown'
     }
   };
   ```

6. **Expected Output Structure:**
   ```json
   {
     "cart": {
       "items": [...],
       "subtotal": 2998,
       "itemCount": 1
     },
     "categories": ["electronics"],
     "metadata": {
       "timestamp": "2025-12-09T16:00:00.000Z",
       "source": "smart-coupons-app"
     }
   }
   ```

7. **Save Node**

---

### **NODE 3: Fetch Available Coupons (API Call)** 🌐

**Purpose:** Call backend API to get current available coupons

#### **Configuration:**

1. **Add Node:**
   - Drag **"HTTP Request"** or **"API"** node from left panel
   - Or click **"+"** after normalizeCart → Select **"API Activity"**

2. **Node Settings:**
   - **Node Name:** `Fetch Available Coupons`
   - **Node ID:** `getCoupons`
   - **Integration:** `API` (blt-int.api)
   - **Node Type:** `Condition` (has success/failure branches)

3. **Connect Input:**
   - Connect from: `normalizeCart` output
   - To: `getCoupons` input

4. **API Request Configuration:**

   | Field | Value |
   |-------|-------|
   | **Method** | `GET` |
   | **URL/Endpoint** | `{{env.BACKEND_URL}}/coupons` |
   | **Body Type** | `None` (GET request) |
   | **Timeout** | `5000` ms |

5. **Headers:**
   
   Click **"+ Add Header"**:
   
   | Key | Value |
   |-----|-------|
   | `Content-Type` | `application/json` |

6. **Retry Configuration:**
   ```
   Initial Interval: 1000 ms
   Maximum Attempts: 2
   Maximum Interval: 3000 ms
   Backoff Coefficient: 2
   ```

7. **Branch Configuration:**
   
   Enable **"Conditional Branching"**:
   - **Success Branch:** Continue to `computeBest` (we'll connect later)
   - **Failure Branch:** Continue to `fallbackCoupons`

8. **Expected Success Response:**
   ```json
   [
     {
       "code": "WELCOME50",
       "type": "percent",
       "value": 50,
       "min_cart_value": 100,
       "max_discount": 200,
       "allowed_categories": [],
       "description": "50% off on orders above ₹100"
     },
     ...
   ]
   ```

9. **Save Node**

---

### **NODE 4: Fallback Coupons (Hardcoded)** 🛡️

**Purpose:** Provide hardcoded coupons if API fails

#### **Configuration:**

1. **Add Node:**
   - Drag **"Function"** node from left panel
   - Or click **"+"** → Select **"Function Activity"**

2. **Node Settings:**
   - **Node Name:** `Fallback - Hardcoded Coupons`
   - **Node ID:** `fallbackCoupons`
   - **Integration:** `Function` (blt-int.function)

3. **Connect Input:**
   - Connect from: `getCoupons` **FAILURE** output
   - To: `fallbackCoupons` input

4. **Input Configuration:**
   - No input data needed (self-contained)

5. **Function Code (Language: JavaScript):**

   Paste this **exact code**:

   ```javascript
   return {
     coupons: [
       {
         code: 'WELCOME50',
         type: 'percent',
         value: 50,
         min_cart_value: 100,
         max_discount: 200,
         allowed_categories: []
       },
       {
         code: 'FLAT200',
         type: 'flat',
         value: 200,
         min_cart_value: 1000,
         max_discount: 200,
         allowed_categories: ['electronics']
       },
       {
         code: 'FOOD10',
         type: 'percent',
         value: 10,
         min_cart_value: 200,
         max_discount: 100,
         allowed_categories: ['grocery', 'food']
       },
       {
         code: 'FASHION15',
         type: 'percent',
         value: 15,
         min_cart_value: 500,
         max_discount: 300,
         allowed_categories: ['fashion']
       }
     ]
   };
   ```

6. **Output Structure:**
   ```json
   {
     "coupons": [
       { "code": "WELCOME50", ... },
       { "code": "FLAT200", ... },
       { "code": "FOOD10", ... },
       { "code": "FASHION15", ... }
     ]
   }
   ```

7. **Save Node**

---

### **NODE 5: Compute Best Coupon** 🧮

**Purpose:** Calculate which coupon gives maximum discount

#### **Configuration:**

1. **Add Node:**
   - Drag **"Function"** node from left panel
   - Or click **"+"** → Select **"Function Activity"**

2. **Node Settings:**
   - **Node Name:** `Compute Best Coupon`
   - **Node ID:** `computeBest`
   - **Integration:** `Function` (blt-int.function)

3. **Connect Inputs (TWO INPUTS):**
   - Connect from: `getCoupons` **SUCCESS** output → `computeBest` input
   - Connect from: `fallbackCoupons` output → `computeBest` input
   - *(This node receives data from either getCoupons OR fallbackCoupons)*

4. **Input Configuration:**

   Add these three input variables:

   | Variable Name | Source |
   |---------------|--------|
   | `payload` | `{{normalizeCart.result}}` |
   | `getCoupons` | `{{getCoupons.result}}` |
   | `fallbackCoupons` | `{{fallbackCoupons.result}}` |

   **How to Add:**
   - Click **"+ Add Input"**
   - Enter variable name (e.g., `payload`)
   - Enter source expression (e.g., `{{normalizeCart.result}}`)
   - Repeat for all three variables

5. **Function Code (Language: JavaScript):**

   Paste this **exact code**:

   ```javascript
   const IN = (typeof payload !== 'undefined' && payload) || (typeof input !== 'undefined' && input) || {};
   const cart = IN.cart || (IN.normalizeCart && IN.normalizeCart.cart) || {};
   const subtotal = Math.round(cart.subtotal || 0);
   const items = cart.items || [];
   const categories = IN.categories || (IN.normalizeCart && IN.normalizeCart.categories) || [];

   const coupons = IN.coupons || (IN.getCoupons && IN.getCoupons.body) || (IN.fallbackCoupons && IN.fallbackCoupons.coupons) || [];

   function eligibleSubtotal(coupon) {
     if (!coupon.allowed_categories || coupon.allowed_categories.length === 0) return subtotal;
     return items.filter(it => coupon.allowed_categories.includes(it.category)).reduce((s, it) => s + it.price * it.qty, 0);
   }

   let best = null;

   for (const c of coupons) {
     const eligible = eligibleSubtotal(c);
     if (eligible < (c.min_cart_value || 0)) continue;

     let rawDiscount = 0;
     if (c.type === 'percent') {
       rawDiscount = Math.floor((eligible * c.value) / 100);
     } else if (c.type === 'flat') {
       rawDiscount = Math.round(c.value);
     }

     const discount = Math.min(rawDiscount, c.max_discount || 999999);
     const finalPrice = Math.max(0, subtotal - discount);

     const candidate = {
       code: c.code,
       type: c.type,
       value: c.value,
       discount: discount,
       newTotal: finalPrice,
       savingsPercent: Math.round((discount / subtotal) * 100),
       eligible: eligible
     };

     if (!best || candidate.discount > best.discount) {
       best = candidate;
     }
   }

   if (!best) {
     return {
       success: false,
       recommendedCoupon: null,
       message: 'No eligible coupons available',
       cartSnapshot: cart
     };
   }

   let reason = '';
   if (categories.includes('electronics')) {
     reason = `🎧 Save ₹${best.discount} on electronics worth ₹${subtotal}!`;
   } else if (categories.includes('grocery') || categories.includes('food')) {
     reason = `🛒 Get ₹${best.discount} off your grocery order!`;
   } else if (categories.includes('fashion')) {
     reason = `👕 Fashion deal: Save ₹${best.discount} now!`;
   } else {
     reason = `💰 You're saving ₹${best.discount} with ${best.code}!`;
   }

   if (best.savingsPercent >= 20) {
     reason += ' Limited time offer!';
   }

   return {
     success: true,
     recommendedCoupon: {
       code: best.code,
       discount: best.discount,
       reason: reason,
       type: best.type,
       savingsPercent: best.savingsPercent,
       newTotal: best.newTotal
     },
     cartSnapshot: cart,
     analysis: {
       appliedLogic: `Best match for ${categories.join(', ')} categories`,
       confidence: 0.95
     },
     metadata: {
       processedAt: new Date().toISOString(),
       source: 'boltic-ai',
       version: '1.0.0'
     }
   };
   ```

6. **Expected Output Structure:**
   ```json
   {
     "success": true,
     "recommendedCoupon": {
       "code": "WELCOME50",
       "discount": 1499,
       "reason": "🎧 Save ₹1499 on electronics worth ₹2998!",
       "type": "percent",
       "savingsPercent": 50,
       "newTotal": 1499
     },
     "cartSnapshot": { ... },
     "analysis": { ... },
     "metadata": { ... }
   }
   ```

7. **Save Node**

---

### **NODE 6: Return Result** 📤

**Purpose:** Final output node that returns the response

#### **Configuration:**

1. **Add Node:**
   - Drag **"Function"** node from left panel
   - Or click **"+"** after computeBest → Select **"Function Activity"**

2. **Node Settings:**
   - **Node Name:** `Return Response`
   - **Node ID:** `returnResult`
   - **Integration:** `Function` (blt-int.function)

3. **Connect Input:**
   - Connect from: `computeBest` output
   - To: `returnResult` input

4. **Input Configuration:**

   | Variable Name | Source |
   |---------------|--------|
   | `payload` | `{{computeBest.result}}` |

5. **Function Code (Language: JavaScript):**

   Paste this **exact code**:

   ```javascript
   const IN = (typeof payload !== 'undefined' && payload) || (typeof input !== 'undefined' && input) || {};
   return IN;
   ```

   *(This just passes through the result from computeBest)*

6. **Save Node**

---

## 🔗 **Connecting All Nodes (Edge Configuration)**

Make sure your workflow has these connections:

```
1. webhook1 → normalizeCart
2. normalizeCart → getCoupons
3. getCoupons [SUCCESS] → computeBest
4. getCoupons [FAILURE] → fallbackCoupons
5. fallbackCoupons → computeBest
6. computeBest → returnResult
```

**Visual Check:**
- `webhook1` should have 1 outgoing arrow
- `normalizeCart` should have 1 incoming, 1 outgoing
- `getCoupons` should have 1 incoming, 2 outgoing (success/failure)
- `fallbackCoupons` should have 1 incoming, 1 outgoing
- `computeBest` should have 2 incoming (from getCoupons and fallbackCoupons), 1 outgoing
- `returnResult` should have 1 incoming, 0 outgoing (end node)

---

## ✅ **Testing the Workflow**

### **Test 1: Manual Test in BoltIc**

1. **Select Webhook Node**
2. Click **"Test"** or **"Run Test"** button
3. BoltIc should use the test payload you configured
4. Check execution logs for each node
5. Verify final output in `returnResult` node

**Expected Final Output:**
```json
{
  "success": true,
  "recommendedCoupon": {
    "code": "WELCOME50",
    "discount": 1499,
    "reason": "🎧 Save ₹1499 on electronics worth ₹2998! Limited time offer!",
    "type": "percent",
    "savingsPercent": 50,
    "newTotal": 1499
  },
  "cartSnapshot": {
    "items": [
      {
        "id": "p1",
        "name": "Wireless Headphones",
        "price": 1499,
        "qty": 2,
        "category": "electronics"
      }
    ],
    "subtotal": 2998,
    "itemCount": 1
  },
  "analysis": {
    "appliedLogic": "Best match for electronics categories",
    "confidence": 0.95
  },
  "metadata": {
    "processedAt": "2025-12-09T...",
    "source": "boltic-ai",
    "version": "1.0.0"
  }
}
```

---

### **Test 2: Test from Backend**

1. **Ensure Workflow is Published:**
   - Click **"Publish"** button in BoltIc dashboard
   - Status should change from `Draft` to `Published`

2. **Test Endpoint:**
   
   Open browser/Postman and go to:
   ```
   https://smart-coupons.onrender.com/simulate-boltic
   ```

3. **Check Render Logs:**
   ```
   https://dashboard.render.com → Your Service → Logs
   ```

   Look for:
   ```
   ✅ BoltIc workflow triggered: execution_xxx
   📥 Coupon result received: WELCOME50 saves ₹1499
   ```

---

### **Test 3: End-to-End Test from Frontend**

1. **Open Frontend Application**
2. **Add items to cart** (e.g., 2x Wireless Headphones)
3. **Click "Simulate BoltIc"** button in cart drawer
4. **Wait 2-3 seconds**
5. **Savings Popup should appear** with:
   - Coupon code: `WELCOME50`
   - Discount amount: `₹1499`
   - Reason: "🎧 Save ₹1499 on electronics worth ₹2998!"

---

## 🐛 **Troubleshooting**

### **Issue 1: Webhook URL Not Working**

**Symptoms:** Backend can't trigger workflow, 404 error

**Solutions:**
- ✅ Verify workflow is **Published** (not Draft)
- ✅ Copy webhook URL again from BoltIc dashboard
- ✅ Check workflow ID matches: `c71f5b89-eee8-47c1-bcf7-68f7b54c51c2`
- ✅ Test webhook URL with Postman:
  ```
  POST https://asia-south1.api.boltic.io/hooks/v1/c71f5b89-eee8-47c1-bcf7-68f7b54c51c2
  Content-Type: application/json
  
  {
    "cart": {
      "items": [{"productId":"p1","name":"Test","price":100,"qty":1,"category":"test"}],
      "subtotal": 100
    }
  }
  ```

---

### **Issue 2: getCoupons Node Failing**

**Symptoms:** Always going to fallbackCoupons branch

**Solutions:**
- ✅ Check `BACKEND_URL` global variable is correct
- ✅ Test API endpoint manually: `https://smart-coupons.onrender.com/coupons`
- ✅ Increase timeout to 10000 ms
- ✅ Check API returns valid JSON array

---

### **Issue 3: No Coupon Returned**

**Symptoms:** `success: false`, "No eligible coupons available"

**Solutions:**
- ✅ Check cart subtotal meets minimum requirements:
  - WELCOME50: ₹100+
  - FLAT200: ₹1000+
  - FOOD10: ₹200+
  - FASHION15: ₹500+
- ✅ Verify category matching logic
- ✅ Check coupon eligibility in `computeBest` node logs

---

### **Issue 4: Function Code Errors**

**Symptoms:** Node execution fails, JavaScript errors

**Solutions:**
- ✅ Copy-paste code **exactly** as provided (preserve formatting)
- ✅ Check for smart quotes (`""` vs `""`) - use straight quotes
- ✅ Verify all input variables are configured
- ✅ Check BoltIc supports ES6 syntax (const, arrow functions, spread operator)

---

### **Issue 5: Workflow Execution Timeout**

**Symptoms:** Workflow doesn't complete, hangs indefinitely

**Solutions:**
- ✅ Check backend API response time (should be <5s)
- ✅ Increase node timeouts to 10000 ms
- ✅ Verify no infinite loops in function code
- ✅ Check Render service isn't sleeping (free tier cold starts)

---

## 📊 **Monitoring & Logs**

### **BoltIc Logs:**
1. Go to workflow dashboard
2. Click **"Executions"** or **"Logs"** tab
3. View each execution with:
   - Timestamp
   - Input payload
   - Node-by-node output
   - Success/failure status

### **Backend Logs (Render):**
1. Go to: https://dashboard.render.com
2. Select your service
3. Click **"Logs"** tab
4. Filter by:
   - `✅ BoltIc workflow triggered`
   - `📥 Coupon result received`
   - `❌` for errors

---

## 🎉 **Success Criteria**

Your workflow is working correctly when:

✅ **Manual Test:** Test button in BoltIc returns valid coupon recommendation  
✅ **Backend Test:** `/simulate-boltic` endpoint returns execution ID  
✅ **Frontend Test:** Savings popup appears with correct coupon after simulation  
✅ **Logs:** Both BoltIc and Render logs show successful execution  
✅ **Response Time:** Complete workflow executes in <5 seconds  

---

## 📝 **Common Pitfalls to Avoid**

❌ **Don't** use quotes in variable names (use `BACKEND_URL` not `"BACKEND_URL"`)  
❌ **Don't** forget to publish workflow after changes  
❌ **Don't** use `console.log()` in functions (use `return` for debugging)  
❌ **Don't** modify coupon structure in fallbackCoupons (keep exact format)  
❌ **Don't** use single quotes in JSON (use double quotes: `"key": "value"`)  
❌ **Don't** forget to connect both branches from getCoupons node  

---

## 🔄 **Making Changes**

If you need to modify the workflow:

1. **Go to BoltIc Dashboard** → Find your workflow
2. **Click "Edit"** button (changes to Draft mode)
3. **Make modifications** to nodes/connections
4. **Test** with test payload button
5. **Publish** again when satisfied
6. **Test from backend** to verify changes

---

## 📞 **Support**

If you encounter issues not covered here:

1. **Check BoltIc Documentation:** https://docs.boltic.io
2. **Review Execution Logs:** Both BoltIc and Render logs
3. **Test Each Node Individually:** Isolate the failing node
4. **Verify Backend API:** Test endpoints with Postman/curl
5. **Check Network:** Ensure backend can reach BoltIc API

---

## 🎯 **Next Steps After Setup**

Once workflow is working:

1. ✅ Update frontend `VITE_API_URL` to production URL
2. ✅ Test with different cart scenarios (categories, amounts)
3. ✅ Monitor execution times and optimize if needed
4. ✅ Add more coupons to backend `/coupons` endpoint
5. ✅ Implement webhook authentication (use `WEBHOOK_SECRET`)
6. ✅ Add error notifications for failed executions
7. ✅ Set up monitoring/alerting for workflow failures

---

**🎊 Congratulations!** Your Smart Coupons workflow is now live and ready to recommend the best deals to your users!
