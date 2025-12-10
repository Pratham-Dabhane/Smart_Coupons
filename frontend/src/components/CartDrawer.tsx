import React from 'react';
import { useCartStore } from '../store/cartStore';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, closeCart, removeFromCart, addToCart } = useCartStore();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-primary text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Cart</h2>
            <p className="text-blue-100 text-sm">{cart.items.length} items</p>
          </div>
          <button
            onClick={closeCart}
            className="text-white hover:bg-blue-600 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">₹{item.price} × {item.qty}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-primary">
                      ₹{item.price * item.qty}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.productId, 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => addToCart({ 
                          id: item.productId, 
                          name: item.name, 
                          price: item.price, 
                          category: item.category,
                          img: '' 
                        })}
                        className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t bg-gray-50 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{cart.subtotal}</span>
              </div>
              
              {cart.discount && cart.discount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({cart.appliedCoupon})</span>
                    <span className="font-semibold">−₹{cart.discount}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{cart.total}</span>
                  </div>
                </>
              )}
            </div>
            
            <button className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors">
              Proceed to Checkout
            </button>
            
            <p className="text-xs text-center text-gray-500">
              (Checkout is a placeholder for demo)
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
