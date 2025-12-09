import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';

const SavingsPopup: React.FC = () => {
  const { couponSuggestion, showSavingsPopup, closeSavingsPopup, applyCoupon } = useCartStore();
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState('');

  if (!showSavingsPopup || !couponSuggestion || !couponSuggestion.recommendedCoupon) return null;

  const { recommendedCoupon, upsellSuggestion } = couponSuggestion;

  const handleApplyCoupon = async () => {
    setIsApplying(true);
    const result = await applyCoupon(recommendedCoupon.code);
    
    if (result.success) {
      setMessage('✓ Coupon applied successfully!');
      setTimeout(() => {
        closeSavingsPopup();
      }, 1500);
    } else {
      setMessage(result.message || 'Failed to apply coupon');
    }
    
    setIsApplying(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(recommendedCoupon.code);
    setMessage('✓ Code copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
        onClick={closeSavingsPopup}
      >
        {/* Modal */}
        <div 
          className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in border-4 border-green-400"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={closeSavingsPopup}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Animated Icon */}
            <div className="mb-4 relative">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg animate-bounce-slow">
                <span className="text-5xl animate-spin-slow">🎉</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-green-300 rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2">
              Huge Savings!
            </h2>
            <p className="text-sm text-gray-500 mb-4">✨ Powered by BoltIc AI</p>

            {/* Savings Amount - Hero Section */}
            <div className="bg-gradient-to-r from-green-500 via-green-600 to-blue-600 text-white rounded-2xl p-8 mb-6 shadow-xl transform hover:scale-105 transition-transform">
              <p className="text-sm font-medium mb-2 opacity-90">You're Saving</p>
              <p className="text-6xl font-black tracking-tight">₹{Math.round(recommendedCoupon.discount)}</p>
              <p className="text-sm mt-3 opacity-95 font-medium">{recommendedCoupon.reason}</p>
              {recommendedCoupon.savingsPercent && (
                <div className="mt-3 inline-block bg-white bg-opacity-20 px-4 py-1 rounded-full">
                  <span className="text-xs font-bold">{recommendedCoupon.savingsPercent}% OFF</span>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="bg-gradient-to-r from-gray-50 to-white border-2 border-dashed border-green-400 rounded-xl p-5 mb-5 shadow-inner">
              <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">Your Coupon Code</p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-3xl font-black text-green-600 tracking-widest bg-green-50 px-4 py-2 rounded-lg">
                  {recommendedCoupon.code}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-3 hover:bg-green-100 rounded-xl transition-all transform hover:scale-110"
                  title="Copy code"
                >
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Upsell Suggestion (if available) */}
            {upsellSuggestion && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-5 animate-pulse-slow">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">💡</span>
                  <span className="text-xs font-bold text-yellow-800 uppercase tracking-wide">Pro Tip</span>
                </div>
                <p className="text-sm text-yellow-900 font-semibold">{upsellSuggestion.message}</p>
                {upsellSuggestion.extraSavings && (
                  <p className="text-xs text-yellow-700 mt-1">
                    Save an extra ₹{upsellSuggestion.extraSavings}!
                  </p>
                )}
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`mb-4 p-4 rounded-xl text-sm font-semibold animate-slide-down ${
                message.includes('✓') ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-red-100 text-red-800 border-2 border-red-300'
              }`}>
                {message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeSavingsPopup}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Maybe Later
              </button>
              <button
                onClick={handleApplyCoupon}
                disabled={isApplying}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? '⏳ Applying...' : '🎁 Apply Now'}
              </button>
            </div>

            {/* Trust Badge */}
            <div className="mt-5 text-xs text-gray-500">
              <span>🔒 Automatically verified & applied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s infinite; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default SavingsPopup;
