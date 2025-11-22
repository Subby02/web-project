import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${p => p.open ? 'block' : 'none'};
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 420px;
  max-width: 90vw;
  background: #fff;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transform: translateX(${p => p.open ? '0' : '-100%'});
  transition: transform 0.3s ease;
  @media (max-width: 768px) {
    width: 100vw;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--border);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  color: #111;
  &:hover {
    opacity: 0.7;
  }
`;

const CartIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  font-size: 20px;
`;

const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #111;
  color: #fff;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
`;

const PromoMessage = styled.div`
  padding: 16px 24px;
  background: #f9f9f9;
  font-size: 13px;
  color: #666;
  text-align: center;
  border-bottom: 1px solid var(--border);
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CartItem = styled.div`
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111;
  line-height: 1.4;
`;

const ItemSize = styled.div`
  font-size: 13px;
  color: #666;
`;

const ItemPrice = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111;
  margin-top: 4px;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
`;

const QuantityButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  color: #111;
  &:hover {
    opacity: 0.7;
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const Quantity = styled.span`
  font-size: 14px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  color: #666;
  &:hover {
    color: #d22;
  }
`;

const EmptyCart = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #666;
  font-size: 16px;
`;

const Footer = styled.div`
  padding: 24px;
  border-top: 1px solid var(--border);
  background: #fff;
`;

const TotalSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 18px;
`;

const TotalLabel = styled.div`
  font-weight: 600;
  color: #111;
`;

const TotalAmount = styled.div`
  font-weight: 700;
  font-size: 20px;
  color: #111;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: #333;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

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
      <Overlay open={isOpen} onClick={onClose} />
      <Sidebar open={isOpen}>
        <Header>
          <CloseButton onClick={onClose}>✕</CloseButton>
          <CartIcon>
            🛒
            {totalItems > 0 && <CartBadge>{totalItems}</CartBadge>}
          </CartIcon>
        </Header>

        <PromoMessage>
          회원가입 시 1만원 할인 쿠폰 증정<br />(마케팅 수신 동의 필수)
        </PromoMessage>

        <Content>
          {cart.length === 0 ? (
            <EmptyCart>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <div>장바구니가 비어있습니다.</div>
            </EmptyCart>
          ) : (
            cart.map((item, index) => (
              <CartItem key={`${item.productId}-${item.color}-${item.size}-${index}`}>
                <ItemImage src={item.image} alt={item.productName} />
                <ItemInfo>
                  <ItemName>{item.productName}</ItemName>
                  {item.color && <ItemSize>색상: {item.color}</ItemSize>}
                  <ItemSize>사이즈: {item.size}</ItemSize>
                  <ItemPrice>₩{item.price.toLocaleString()}</ItemPrice>
                  <ItemActions>
                    <QuantityControl>
                      <QuantityButton
                        onClick={() => updateQuantity(index, -1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </QuantityButton>
                      <Quantity>{item.quantity}</Quantity>
                      <QuantityButton onClick={() => updateQuantity(index, 1)}>
                        +
                      </QuantityButton>
                    </QuantityControl>
                    <DeleteButton onClick={() => removeItem(index)}>
                      🗑️
                    </DeleteButton>
                  </ItemActions>
                </ItemInfo>
              </CartItem>
            ))
          )}
        </Content>

        {cart.length > 0 && (
          <Footer>
            <TotalSection>
              <TotalLabel>총액</TotalLabel>
              <TotalAmount>₩{calculateTotal().toLocaleString()}</TotalAmount>
            </TotalSection>
            <CheckoutButton onClick={handleCheckout}>
              결제
            </CheckoutButton>
          </Footer>
        )}
      </Sidebar>
    </>
  );
}

