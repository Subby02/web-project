import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { getLocalCartCount } from '../utils/cartStorage';
import './Header.css';

export default function Header({ onCartClick = () => {} }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const toggle = (key) => setOpen(key);
  const close = () => setOpen(null);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
        });
        const data = await response.json();
        // /api/auth/me는 항상 200을 반환하고 authenticated 필드로 로그인 상태 확인
        setIsLoggedIn(data?.authenticated === true);
        setIsAdmin(data?.isAdmin === true);
      } catch (error) {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    checkAuth();

    // 로그인 상태 변경 이벤트 리스너
    const handleAuthChange = () => {
      checkAuth().then(() => {
        // 로그인 상태 변경 후 장바구니 카운트 업데이트
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      });
    };

    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  const handleMyPageClick = (e) => {
    e.preventDefault();
    // 항상 마이페이지로 이동하고, ProtectedRoute가 인증을 체크하여
    // 로그인되지 않았으면 로그인 페이지로 리다이렉트함
    navigate('/mypage');
  };

  useEffect(() => {
    // 장바구니 개수 로드 및 업데이트
    const updateCartCount = async () => {
      if (isLoggedIn) {
        // 로그인된 경우: 서버 장바구니
        try {
          const response = await fetch(`${API_BASE_URL}/api/cart`, {
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
          } else {
            setCartCount(0);
          }
        } catch (err) {
          setCartCount(0);
        }
      } else {
        // 로그인하지 않은 경우: 로컬 스토리지 장바구니
        const localCount = getLocalCartCount();
        setCartCount(localCount);
      }
    };

    updateCartCount();

    // 장바구니 업데이트 이벤트 리스너
    const handleCartUpdate = () => {
      updateCartCount();
    };

    // 장바구니 카운트만 업데이트 (수량 변경 시 전체 로드하지 않음)
    const handleCartCountUpdate = () => {
      updateCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartCountUpdated', handleCartCountUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate);
    };
  }, [isLoggedIn]);

  return (
    <header className="header-wrap" onMouseLeave={close}>
      <div className="header-bar">COMFY, LOW-KEY LUXURY | <b>남성</b>, <b>여성</b></div>
      <div className="header-row">
        <Link to="/" className="header-logo" style={{ textDecoration: 'none', color: 'inherit' }}>allbirds</Link>
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
          {isAdmin && (
            <button 
              className="header-icon-button" 
              aria-label="관리자 페이지" 
              onClick={() => navigate('/admin')}
              title="관리자 페이지"
            >
              ⚙️
            </button>
          )}
          <button 
            className="header-icon-button" 
            aria-label="계정" 
            onClick={handleMyPageClick}
            title={isLoggedIn ? '마이페이지' : '로그인'}
          >
            👤
          </button>
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
            <Link to="/store" className="header-h" onClick={close} style={{ textDecoration: 'none', color: 'inherit' }}>남성 신발</Link>
            <Link to="/store" className="header-link" onClick={close}>전체</Link>
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
