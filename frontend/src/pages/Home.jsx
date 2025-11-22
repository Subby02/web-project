import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home(){
  const [email, setEmail] = useState('');
  const [sliderOffset, setSliderOffset] = useState(0);

  const popularProducts = [
    {id: 'p1', name: '남성 울 러너 NZ', color: '내추럴 블랙 (내추럴 블랙)', price: 119000, originalPrice: 170000, sizes: [260, 265, 270, 275, 280], image: 'https://picsum.photos/seed/product1a/600/600'},
    {id: 'p2', name: '남성 울 크루저 슬립온', color: '내추럴 화이트 (내추럴 화이트)', price: 170000, originalPrice: null, sizes: [260, 265, 270, 275], image: 'https://picsum.photos/seed/product2a/600/600'},
    {id: 'p3', name: '남성 트리 러너 NZ', color: '내추럴 그레이 (라이트 그레이)', price: 119000, originalPrice: 170000, sizes: [270, 275, 280, 285], image: 'https://picsum.photos/seed/product3a/600/600'},
    {id: 'p4', name: '남성 울 대셔 미즐', color: '스토니 크림 (내추럴 화이트)', price: 170000, originalPrice: null, sizes: [270, 275, 280, 285], image: 'https://picsum.photos/seed/product4a/600/600'},
    {id: 'p5', name: '남성 트리 러너', color: '제트 블랙 (블랙)', price: 119000, originalPrice: 170000, sizes: [260, 270, 280], image: 'https://picsum.photos/seed/product5a/600/600'},
    {id: 'p6', name: '여성 울 러너 NZ', color: '내추럴 블랙 (내추럴 블랙)', price: 119000, originalPrice: 170000, sizes: [230, 235, 240, 245], image: 'https://picsum.photos/seed/product6a/600/600'},
    {id: 'p7', name: '여성 울 러너', color: '내추럴 화이트 (크림)', price: 170000, originalPrice: null, sizes: [230, 240, 250], image: 'https://picsum.photos/seed/product7a/600/600'},
    {id: 'p8', name: '여성 트리 러너', color: '제트 블랙 (블랙)', price: 119000, originalPrice: 170000, sizes: [230, 240, 250], image: 'https://picsum.photos/seed/product8a/600/600'},
    {id: 'p9', name: '남성 울 크루저', color: '내추럴 블랙 (내추럴 블랙)', price: 170000, originalPrice: null, sizes: [260, 265, 270, 275, 280], image: 'https://picsum.photos/seed/product9a/600/600'},
    {id: 'p10', name: '여성 울 러너 고 플러프', color: '내추럴 화이트(내추럴 화이트)', price: 119000, originalPrice: 170000, sizes: [235, 240, 245, 250], image: 'https://picsum.photos/seed/product10a/600/600'},
  ];

  const maxOffset = Math.max(0, popularProducts.length - 5);
  const visibleProducts = 5;

  const handlePrev = () => {
    if (sliderOffset > 0) {
      setSliderOffset(sliderOffset - 1);
    }
  };

  const handleNext = () => {
    if (sliderOffset < maxOffset) {
      setSliderOffset(sliderOffset + 1);
    }
  };


  const materials = [
    {
      name: 'ZQ 메리노 울',
      description: '최상급 울 소재',
      image: 'https://images.unsplash.com/photo-1585121508800-1015a9e0d0e5?w=600&h=600&fit=crop'
    },
    {
      name: '유칼립투스 나무',
      description: '실크처럼 매끄러운 촉감',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=600&fit=crop'
    },
    {
      name: '사탕수수',
      description: '부드러운 SweetFoam®의 주 소재',
      image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=600&h=600&fit=crop'
    }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('뉴스레터 구독이 완료되었습니다!');
    setEmail('');
  };

  const calculateSliderTransform = () => {
    // 각 카드의 너비 (20%) + gap을 고려한 계산
    const cardWidthPercent = 100 / 5;
    const gapPercent = window.innerWidth <= 768 ? 3.2 : 4.8;
    const offset = sliderOffset * (cardWidthPercent + gapPercent);
    return offset;
  };

  return (
    <div className="home-wrapper">
      <section className="home-section full-width">
        <div className="hero-banner">
          <h1 className="hero-title">슈퍼 블랙 프라이데이 세일</h1>
          <p className="hero-subtitle">세상에서 가장 편한 신발, 올버즈 | ~50% OFF</p>
          <div className="home-button-group">
            <a href="#" className="home-button primary">남성 세일</a>
            <a href="#" className="home-button">여성 세일</a>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-title left">실시간 인기</h2>
        <div className="slider-container">
          <button className="slider-button left" onClick={handlePrev} disabled={sliderOffset === 0}>
            ‹
          </button>
          <button className="slider-button right" onClick={handleNext} disabled={sliderOffset >= maxOffset}>
            ›
          </button>
          <div className="slider-wrapper">
            <div 
              className="slider-track" 
              style={{ 
                '--slider-offset': `${calculateSliderTransform()}%`
              } as React.CSSProperties}
            >
              {popularProducts.map((product, idx) => (
                <Link key={product.id} to={`/products/${product.id}`} className="horizontal-card">
                  <div className="product-badge">{idx + 1}</div>
                  <img alt={product.name} src={product.image} />
                  <div>
                    <div className="product-name">{product.color}</div>
                    <strong className="product-title">{product.name}</strong>
                    <div className="product-price">
                      {product.originalPrice && (
                        <span className="original-price">₩{product.originalPrice.toLocaleString()}</span>
                      )}
                      <span className="sale-price">₩{product.price.toLocaleString()}</span>
                    </div>
                    <div className="product-sizes">
                      <div className="size-label">주문 가능 사이즈</div>
                      <div className="size-list">
                        {product.sizes.map((size) => (
                          <span key={size} className="size-tag">{size}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section full-width">
        <div className="materials-section">
          <h2 className="section-title no-margin">우리가 사용하는 소재</h2>
          <div className="materials-grid">
            {materials.map((material, idx) => (
              <div key={idx} className="material-card">
                <img src={material.image} alt={material.name} />
                <h3>{material.name}</h3>
                <p>{material.description}</p>
                <a href="#">더 알아보기 →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section full-width">
        <div className="newsletter-section">
          <h2 className="newsletter-title">올버즈 뉴스레터 구독</h2>
          <p className="newsletter-subtitle">
            최신 신제품 소식과 혜택을 가장 먼저 받아보세요.
          </p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              className="home-input"
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="submit-button">구독</button>
          </form>
          <p>
            구독 시 마케팅 이메일 수신에 동의하게 됩니다. 자세한 내용은 개인정보 처리방침 및 이용약관을 확인해 주세요.
          </p>
        </div>
      </section>

      <section className="home-section full-width">
        <div className="brand-section">
          <div className="brand-card bg-light-green">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop" alt="편안함" />
            <h3>매일 경험하는 편안함</h3>
            <p>
              올버는 마치 구름 위를 걷는 듯한 가벼움과, 바람처럼 자유로운 탄력을 선사합니다. 
              놀라운 편안함은 긴 여정도 짧은 산책처럼 느껴집니다.
            </p>
          </div>
          <div className="brand-card dark bg-dark">
            <img src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=400&fit=crop" alt="지속가능성" />
            <h3>지속 가능한 발걸음</h3>
            <p>
              소재를 고르는 순간부터 신발이 당신에게 닿는 그 순간까지 지구에 남기는 흔적을 헤아립니다. 
              탄소 발자국을 제로에 가깝게 줄이려는 노력에 동참해주세요.
            </p>
          </div>
          <div className="brand-card bg-light-gray">
            <img src="https://images.unsplash.com/photo-1585121508800-1015a9e0d0e5?w=600&h=400&fit=crop" alt="소재" />
            <h3>지구에서 온 소재</h3>
            <p>
              올버즈는 가능한 모든 곳에서 석유 기반 합성소재를 천연 대안으로 대체합니다. 
              울, 나무, 사탕수수 같은 자연 소재는 부드럽고 통기성이 좋습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
