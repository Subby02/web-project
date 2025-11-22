import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import { getLocalCart, removeFromLocalCart, updateLocalCartQuantity, clearLocalCart } from '../utils/cartStorage';
import './CartSidebar.css';

export default function CartSidebar({ isOpen, onClose }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        });
        const data = await response.json();
        setIsLoggedIn(data?.authenticated === true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        
        if (isLoggedIn) {
          // 로그인된 경우: 서버 장바구니
          const response = await fetch(`${API_BASE_URL}/api/cart`, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            setCart(data);
          } else {
            setCart([]);
          }
        } else {
          // 로그인하지 않은 경우: 로컬 스토리지 장바구니
          const localCart = getLocalCart();
          setCart(localCart);
        }
      } catch (err) {
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadCart();
    }

    // 장바구니 업데이트 이벤트 리스너
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('authChanged', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('authChanged', handleCartUpdate);
    };
  }, [isOpen, isLoggedIn]);

  const updateQuantity = async (cartItemId, change) => {
    const cartItem = cart.find(item => item.id === cartItemId);
    if (!cartItem) return;

    const newQuantity = cartItem.quantity + change;

    if (newQuantity <= 0) {
      // 수량이 0 이하면 삭제
      await removeItem(cartItemId);
      return;
    }

    if (isLoggedIn) {
      // 로그인된 경우: 서버 업데이트
      const previousCart = [...cart];
      const updatedCart = cart.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);

      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/${cartItemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (!response.ok) {
          setCart(previousCart);
          alert('수량 업데이트에 실패했습니다.');
        } else {
          window.dispatchEvent(new CustomEvent('cartCountUpdated'));
        }
      } catch (err) {
        setCart(previousCart);
        alert('수량을 업데이트하는 중 오류가 발생했습니다.');
      }
    } else {
      // 로그인하지 않은 경우: 로컬 스토리지 업데이트
      const updatedCart = updateLocalCartQuantity(cartItemId, newQuantity);
      setCart(updatedCart);
      window.dispatchEvent(new CustomEvent('cartCountUpdated'));
    }
  };

  const removeItem = async (cartItemId) => {
    if (isLoggedIn) {
      // 로그인된 경우: 서버 삭제
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/${cartItemId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          const updatedCart = cart.filter(item => item.id !== cartItemId);
          setCart(updatedCart);
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        } else {
          alert('장바구니에서 삭제하는데 실패했습니다.');
        }
      } catch (err) {
        alert('장바구니에서 삭제하는 중 오류가 발생했습니다.');
      }
    } else {
      // 로그인하지 않은 경우: 로컬 스토리지 삭제
      const updatedCart = removeFromLocalCart(cartItemId);
      setCart(updatedCart);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!isLoggedIn) {
      alert('로그인이 필요합니다. 로그인 후 주문해주세요.');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}), // 빈 객체면 장바구니 전체 주문
      });

      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`서버 오류: ${response.status}. 백엔드 서버가 실행 중인지 확인해주세요.`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
          return;
        }
        throw new Error(data.message || '주문에 실패했습니다.');
      }

      alert(`주문이 완료되었습니다! 총액: ₩${calculateTotal().toLocaleString()}`);
      
      // 장바구니 비우기
      setCart([]);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // 사이드바 닫기
      onClose();
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        alert(`백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (${API_BASE_URL})`);
      } else {
        alert(err.message || '주문 중 오류가 발생했습니다.');
      }
    }
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
          {loading ? (
            <div className="cart-empty">
              <div>로딩 중...</div>
            </div>
          ) : cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <div>장바구니가 비어있습니다.</div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image || 'https://via.placeholder.com/100'} alt={item.productName} className="cart-item-image" />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.productName}</div>
                  {item.color && <div className="cart-item-size">색상: {item.color}</div>}
                  <div className="cart-item-size">사이즈: {item.size}</div>
                  <div className="cart-item-price">₩{item.price.toLocaleString()}</div>
                  <div className="cart-item-actions">
                    <div className="cart-quantity-control">
                      <button
                        className="cart-quantity-button"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="cart-quantity">{item.quantity}</span>
                      <button className="cart-quantity-button" onClick={() => updateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                    <button className="cart-delete-button" onClick={() => removeItem(item.id)}>
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
