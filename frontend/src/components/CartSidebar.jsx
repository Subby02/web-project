import React, { useState, useEffect } from 'react';
import './CartSidebar.css';

export default function CartSidebar({ isOpen, onClose }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // 로컬 스토리지에서 장바구니 로드
    const loadCart = () => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          setCart(JSON.parse(cartData));
        }
      } catch (err) {
        console.error('장바구니 로드 오류:', err);
        setCart([]);
      }
    };

    loadCart();

    // 장바구니 업데이트 이벤트 리스너
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateQuantity = (index, change) => {
    const newCart = [...cart];
    newCart[index].quantity += change;
    
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    alert(`결제 페이지로 이동합니다. 총액: ₩${calculateTotal().toLocaleString()}`);
    // 실제로는 결제 페이지로 이동
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div 
        className={`cart-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        style={{ '--sidebar-open': isOpen ? 1 : 0 }}
      />
      <div 
        className="cart-sidebar"
        style={{ '--sidebar-open': isOpen ? 1 : 0 }}
      >
        <div className="cart-sidebar-header">
          <button className="cart-close-button" onClick={onClose}>✕</button>
          <div className="cart-icon">
            🛒
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </div>
        </div>

        <div className="cart-promo-message">
          회원가입 시 1만원 할인 쿠폰 증정<br />(마케팅 수신 동의 필수)
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <div>장바구니가 비어있습니다.</div>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.productId}-${item.color}-${item.size}-${index}`} className="cart-item">
                <img src={item.image} alt={item.productName} className="cart-item-image" />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.productName}</div>
                  {item.color && <div className="cart-item-size">색상: {item.color}</div>}
                  <div className="cart-item-size">사이즈: {item.size}</div>
                  <div className="cart-item-price">₩{item.price.toLocaleString()}</div>
                  <div className="cart-item-actions">
                    <div className="cart-quantity-control">
                      <button
                        className="cart-quantity-button"
                        onClick={() => updateQuantity(index, -1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="cart-quantity">{item.quantity}</span>
                      <button className="cart-quantity-button" onClick={() => updateQuantity(index, 1)}>
                        +
                      </button>
                    </div>
                    <button className="cart-delete-button" onClick={() => removeItem(index)}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-section">
              <div className="cart-total-label">총액</div>
              <div className="cart-total-amount">₩{calculateTotal().toLocaleString()}</div>
            </div>
            <button className="cart-checkout-button" onClick={handleCheckout}>
              결제
            </button>
          </div>
        )}
      </div>
    </>
  );
}
