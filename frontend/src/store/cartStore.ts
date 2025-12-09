import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  img: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount?: number;
  appliedCoupon?: string;
  total?: number;
}

interface CouponSuggestion {
  recommendedCoupon: {
    code: string;
    discount: number;
    reason: string;
    type?: string;
    savingsPercent?: number;
    newTotal?: number;
  };
  upsellSuggestion?: {
    message: string;
    code: string;
    amountNeeded: number;
    newDiscount: number;
    extraSavings: number;
  };
  cartSnapshot: Cart;
  timestamp: string;
}

interface CartStore {
  cart: Cart;
  isCartOpen: boolean;
  couponSuggestion: CouponSuggestion | null;
  showSavingsPopup: boolean;
  isLoading: boolean;
  
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string, qty?: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  fetchCart: () => Promise<void>;
  toggleCart: () => void;
  closeCart: () => void;
  
  simulateBoltIc: () => Promise<void>;
  fetchCouponSuggestion: () => Promise<void>;
  closeSavingsPopup: () => void;
}

const notifyCartUpdate = async (cart: Cart) => {
  try {
    console.log('🔔 Notifying backend of cart update...');
    await axios.post(`${API_URL}/events/cart-updated`, {
      cart,
      sessionId: 'session-' + Date.now(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to notify cart update:', error);
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  cart: { items: [], subtotal: 0 },
  isCartOpen: false,
  couponSuggestion: null,
  showSavingsPopup: false,
  isLoading: false,

  addToCart: async (product: Product) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/cart/add`, {
        productId: product.id,
        qty: 1
      });
      set({ cart: response.data, isCartOpen: true });
      
      // Notify backend of cart update
      await notifyCartUpdate(response.data);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (productId: string, qty?: number) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/cart/remove`, {
        productId,
        qty
      });
      set({ cart: response.data });
      
      // Notify backend of cart update
      await notifyCartUpdate(response.data);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  applyCoupon: async (code: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API_URL}/cart/apply-coupon`, { code });
      
      if (response.data.success) {
        set({ cart: response.data.cart });
        await notifyCartUpdate(response.data.cart);
      }
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      return { success: false, message: 'Failed to apply coupon' };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCart: async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      set({ cart: response.data });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  },

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  closeCart: () => set({ isCartOpen: false }),

  simulateBoltIc: async () => {
    try {
      console.log('🤖 Simulating BoltIc AI suggestion...');
      const { cart } = get();
      const response = await axios.post(`${API_URL}/simulate-boltic`, { cart });
      
      if (response.data.success) {
        console.log('✅ BoltIc workflow triggered, polling for result...');
        // BoltIc workflows are async, poll multiple times
        let attempts = 0;
        const maxAttempts = 10;
        
        const pollForResult = () => {
          attempts++;
          console.log(`🔍 Polling attempt ${attempts}/${maxAttempts}...`);
          
          get().fetchCouponSuggestion();
          
          // Keep polling if no result yet
          if (attempts < maxAttempts && !get().couponSuggestion) {
            setTimeout(pollForResult, 1000); // Poll every 1 second
          } else if (attempts >= maxAttempts && !get().couponSuggestion) {
            console.error('❌ Timeout waiting for BoltIc result');
            alert('BoltIc is taking longer than expected. Please try again.');
          }
        };
        
        // Start polling after 2 seconds (give BoltIc time to process)
        setTimeout(pollForResult, 2000);
      }
    } catch (error) {
      console.error('Failed to simulate BoltIc:', error);
    }
  },

  fetchCouponSuggestion: async () => {
    try {
      const response = await axios.get(`${API_URL}/coupon-suggestion`);
      if (response.data) {
        console.log('💡 Raw response from backend:', response.data);
        
        // Check if this is a workflow execution response (not the actual result yet)
        if (response.data.message && response.data.message.includes('Workflow execution')) {
          console.log('⏳ Workflow still executing, waiting for result...');
          return; // Don't show popup yet, keep polling
        }
        
        // Validate the data structure
        if (!response.data.recommendedCoupon) {
          console.error('❌ Invalid coupon suggestion structure:', response.data);
          return;
        }
        
        console.log('✅ Valid coupon received:', response.data.recommendedCoupon);
        
        set({ 
          couponSuggestion: response.data,
          showSavingsPopup: true 
        });
      }
    } catch (error) {
      console.error('Failed to fetch coupon suggestion:', error);
    }
  },

  closeSavingsPopup: () => set({ showSavingsPopup: false })
}));
