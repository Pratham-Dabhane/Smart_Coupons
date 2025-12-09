import React from 'react';
import { useCartStore } from '../store/cartStore';

const CartPage: React.FC = () => {
  const { cart } = useCartStore();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        {cart.items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600">Start adding items to see them here!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 p-4 border-b">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">₹{item.price} × {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{item.price * item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between text-xl font-bold">
                <span>Subtotal</span>
                <span>₹{cart.subtotal}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
