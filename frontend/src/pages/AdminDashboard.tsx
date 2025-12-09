import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AnalyticsData {
  totalCartsOptimized: number;
  totalSavings: number;
  avgSavingsPerCart: number;
  topCoupon: string;
  conversionRate: number;
  recentOptimizations: Array<{
    timestamp: string;
    cartValue: number;
    couponApplied: string;
    savingsAmount: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 10 seconds
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics/dashboard`);
      setAnalytics(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load analytics</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">
              📊 Smart Coupons Analytics
            </h1>
            <p className="text-gray-600">Real-time insights powered by BoltIc AI</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🏠 Home
            </Link>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Carts Optimized */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🛒</span>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-xs font-bold">TOTAL</span>
            </div>
          </div>
          <p className="text-5xl font-black mb-2">{analytics.totalCartsOptimized}</p>
          <p className="text-sm font-medium opacity-90">Carts Optimized</p>
        </div>

        {/* Total Savings */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">💰</span>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-xs font-bold">SAVINGS</span>
            </div>
          </div>
          <p className="text-5xl font-black mb-2">₹{analytics.totalSavings.toLocaleString()}</p>
          <p className="text-sm font-medium opacity-90">Total Customer Savings</p>
        </div>

        {/* Avg Savings */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">📈</span>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-xs font-bold">AVG</span>
            </div>
          </div>
          <p className="text-5xl font-black mb-2">₹{Math.round(analytics.avgSavingsPerCart)}</p>
          <p className="text-sm font-medium opacity-90">Avg Per Cart</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl">🎯</span>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-xs font-bold">RATE</span>
            </div>
          </div>
          <p className="text-5xl font-black mb-2">{analytics.conversionRate}%</p>
          <p className="text-sm font-medium opacity-90">Conversion Uplift</p>
        </div>
      </div>

      {/* Top Coupon & Recent Activity */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Coupon */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🏆</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Top Coupon</h3>
              <p className="text-sm text-gray-500">Most used this week</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-center">
            <code className="text-3xl font-black text-white tracking-wider">{analytics.topCoupon}</code>
            <p className="text-sm text-white mt-2 opacity-90">Best Performer</p>
          </div>
        </div>

        {/* Recent Optimizations */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>⚡</span> Recent Optimizations
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analytics.recentOptimizations && analytics.recentOptimizations.length > 0 ? (
              analytics.recentOptimizations.map((opt, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <span className="text-2xl">🎫</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{opt.couponApplied}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(opt.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">-₹{opt.savingsAmount}</p>
                    <p className="text-xs text-gray-500">on ₹{opt.cartValue}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>No optimizations yet</p>
                <p className="text-sm">Start testing to see data here!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BoltIc Badge */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg">
          <span className="text-2xl">🤖</span>
          <span className="text-sm font-semibold text-gray-700">Powered by BoltIc AI Workflows</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
