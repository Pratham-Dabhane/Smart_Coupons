import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';

const SavingsPopup: React.FC = () => {
  const { couponSuggestion, showSavingsPopup, closeSavingsPopup, applyCoupon } = useCartStore();
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState('');

  if (!showSavingsPopup || !couponSuggestion) return null;

  const { recommendedCoupon } = couponSuggestion;

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
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={closeSavingsPopup}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={closeSavingsPopup}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Icon */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <span className="text-4xl">🎉</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Save Big!
            </h2>

            {/* Savings Amount */}
            <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl p-6 mb-6">
              <p className="text-sm font-medium mb-1">You can save</p>
              <p className="text-5xl font-bold">₹{Math.round(recommendedCoupon.discount)}</p>
              <p className="text-sm mt-2 opacity-90">{recommendedCoupon.reason}</p>
            </div>

            {/* Coupon Code */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Coupon Code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-2xl font-bold text-primary tracking-wider">
                  {recommendedCoupon.code}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy code"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Apply Button */}
            <button
              onClick={handleApplyCoupon}
              disabled={isApplying}
              className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? 'Applying...' : 'Apply Coupon Now'}
            </button>

            {/* BoltIc Badge */}
            <p className="text-xs text-gray-400 mt-4">
              ✨ Powered by BoltIc AI
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavingsPopup;
