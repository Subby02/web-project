import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import StoreFront from './pages/StoreFront';
import MyPage from './pages/MyPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header onCartClick={() => setCartOpen(true)} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/store" element={<StoreFront />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App
