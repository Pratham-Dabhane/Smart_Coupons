import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from './pages/ProductList';
import CartPage from './pages/CartPage';
import CartDrawer from './components/CartDrawer';
import SavingsPopup from './components/SavingsPopup';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
        
        {/* Global Components */}
        <CartDrawer />
        <SavingsPopup />
      </div>
    </BrowserRouter>
  );
};

export default App;
