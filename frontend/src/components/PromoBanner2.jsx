import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PromoBanner2.css';

export default function PromoBanner2() {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate('/store');
  };

  return (
    <section className="promo-banner-2">
      <div className="promo-banner-2-content">
        <div className="promo-banner-2-visual">
          <div className="promo-banner-2-pattern"></div>
        </div>
        <div className="promo-banner-2-text">
          <h2 className="promo-banner-2-title">SPECIAL OFFER</h2>
          <p className="promo-banner-2-subtitle">지금 바로 특별 할인을 확인하세요</p>
          <p className="promo-banner-2-discount">최대 30% 할인</p>
          <button className="promo-banner-2-btn" onClick={handleExplore}>
            둘러보기
          </button>
        </div>
      </div>
    </section>
  );
}

