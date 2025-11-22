import React, { useState, useEffect } from 'react';
import './Header.css';

export default function Header({ onCartClick = () => {} }) {
  const [open, setOpen] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const toggle = (key) => setOpen(key);
  const close = () => setOpen(null);

  useEffect(() => {
    // 장바구니 개수 로드 및 업데이트
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (err) {
        setCartCount(0);
      }
    };

    updateCartCount();

    // 장바구니 업데이트 이벤트 리스너
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  return (
    <header className="header-wrap" onMouseLeave={close}>
      <div className="header-bar">COMFY, LOW-KEY LUXURY | <b>남성</b>, <b>여성</b></div>
      <div className="header-row">
        <div className="header-logo">allbirds</div>
        <nav className="header-nav">
          <div className="header-nav-item" onMouseEnter={close}>가을 컬렉션</div>
          <div 
            className={`header-nav-item ${open === 'men' ? 'active' : ''}`}
            onMouseEnter={() => toggle('men')}
          >
            남성
          </div>
          <div 
            className={`header-nav-item ${open === 'women' ? 'active' : ''}`}
            onMouseEnter={() => toggle('women')}
          >
            여성
          </div>
          <div className="header-nav-item" onMouseEnter={close}>매장 위치</div>
          <div 
            className={`header-nav-item ${open === 'sustainability' ? 'active' : ''}`}
            onMouseEnter={() => toggle('sustainability')}
          >
            지속 가능성
          </div>
          <div className="header-nav-item" onMouseEnter={close}>세일</div>
        </nav>
        <div className="header-icon-group">
          <button className="header-icon-button" aria-label="검색">🔍</button>
          <button className="header-icon-button" aria-label="계정">👤</button>
          <button className="header-icon-button" aria-label="장바구니" onClick={onCartClick}>
            🛒
            {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
      <div className={`header-mega ${open === 'men' || open === 'women' ? 'open' : ''}`} onMouseLeave={close}>
        <div className="header-mega-inner">
          <div className="header-col">
            <h4 className="header-h">신제품</h4>
            <a href="#" className="header-link">크루저 미드 익스플로어</a>
            <a href="#" className="header-link">코듀로이 슬립온</a>
            <a href="#" className="header-link">울 크루저</a>
            <a href="#" className="header-link">트리 러너 NZ</a>
            <a href="#" className="header-link">울 크루저 슬립온</a>
            <a href="#" className="header-link">울 러너 NZ</a>
          </div>
          <div className="header-col with-line">
            <h4 className="header-h">남성 신발</h4>
            <a href="#" className="header-link">전체</a>
            <a href="#" className="header-link">가을 컬렉션</a>
            <a href="#" className="header-link">라이프스타일</a>
            <a href="#" className="header-link">액티브</a>
            <a href="#" className="header-link">슬립온</a>
            <a href="#" className="header-link">세일</a>
          </div>
          <div className="header-col with-line">
            <h4 className="header-h">의류 & 악세사리</h4>
            <a href="#" className="header-link">양말</a>
            <a href="#" className="header-link">의류</a>
            <a href="#" className="header-link">악세사리</a>
          </div>
        </div>
      </div>
      <div className={`header-sustainability-menu ${open === 'sustainability' ? 'open' : ''}`} onMouseLeave={close}>
        <div className="header-sustainability-inner">
          <div className="header-sustainability-col">
            <h4 className="header-sustainability-title">올버즈</h4>
            <a href="#" className="header-sustainability-link">브랜드 스토리</a>
            <a href="#" className="header-sustainability-link">지속 가능성</a>
            <a href="#" className="header-sustainability-link">소재</a>
            <a href="#" className="header-sustainability-link">수선</a>
          </div>
          <div className="header-sustainability-col">
            <h4 className="header-sustainability-title">스토리</h4>
            <a href="#" className="header-sustainability-link">올멤버스</a>
            <a href="#" className="header-sustainability-link">올버즈 앰배서더</a>
            <a href="#" className="header-sustainability-link">ReRun</a>
            <a href="#" className="header-sustainability-link">신발 관리 방법</a>
          </div>
          <div className="header-sustainability-col">
            <h4 className="header-sustainability-title">소식</h4>
            <a href="#" className="header-sustainability-link">캠페인</a>
            <a href="#" className="header-sustainability-link">뉴스</a>
          </div>
        </div>
      </div>
    </header>
  );
}
