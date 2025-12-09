import React, { useState } from 'react';
import { Product } from '../store/cartStore';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await onAddToCart(product);
    
    // Show "Added!" feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electronics: 'bg-blue-100 text-blue-800',
      grocery: 'bg-green-100 text-green-800',
      fashion: 'bg-purple-100 text-purple-800',
      food: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Product Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-6xl opacity-30">📦</div>
      </div>
      
      {/* Product Info */}
      <div className="p-5">
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-primary">
            ₹{product.price}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 min-w-[120px] ${
              isAdding
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isAdding ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
