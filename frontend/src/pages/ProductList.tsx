import React, { useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useCartStore } from '../store/cartStore';
import productsData from '../data/products.json';

const ProductList: React.FC = () => {
  const { addToCart, fetchCart, simulateBoltIc, cart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleSimulateBoltIc = () => {
    simulateBoltIc();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🛍️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Coupons</h1>
                <p className="text-sm text-gray-500">Hacktimus Auto-Coupon Demo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Simulate BoltIc Button */}
              <button
                onClick={handleSimulateBoltIc}
                disabled={cart.items.length === 0}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title={cart.items.length === 0 ? "Add items to cart first" : "Simulate AI coupon suggestion"}
              >
                <span className="text-lg">🤖</span>
                <span className="hidden sm:inline">Simulate BoltIc</span>
              </button>
              
              {/* Cart Badge */}
              <button
                onClick={() => useCartStore.getState().toggleCart()}
                className="relative bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="hidden sm:inline">Cart</span>
                </div>
                {cart.items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Shop Smart, Save More! 🎯</h2>
          <p className="text-blue-100 mb-4">
            Add items to your cart and let our AI find the best coupons for you
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Real-time cart tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>AI-powered savings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Instant coupon application</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsData.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Add to Cart</h4>
                <p className="text-sm text-gray-600">Browse products and add items you like to your cart</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Get AI Suggestion</h4>
                <p className="text-sm text-gray-600">Click "Simulate BoltIc" to get coupon recommendations</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Save Money</h4>
                <p className="text-sm text-gray-600">Apply the suggested coupon and enjoy your savings!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm opacity-75">
            Built for Hacktimus 2025 | Smart Coupons Auto-Application System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProductList;
