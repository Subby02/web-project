import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PromoBanner1.css';

export default function PromoBanner1() {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/store');
  };

  return (
    <section className="promo-banner-1">
      <div className="promo-banner-1-content">
        <div className="promo-banner-1-text">
          <h2 className="promo-banner-1-title">NEW COLLECTION</h2>
          <p className="promo-banner-1-subtitle">2024 신상품 컬렉션을 만나보세요</p>
          <button className="promo-banner-1-btn" onClick={handleShopNow}>
            쇼핑하기
          </button>
        </div>
        <div className="promo-banner-1-image">
          <div className="promo-banner-1-circle"></div>
        </div>
      </div>
    </section>
  );
}

