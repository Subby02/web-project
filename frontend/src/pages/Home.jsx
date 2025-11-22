import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import HeroSlider from '../components/HeroSlider';
import './Home.css';

export default function Home(){
  const [email, setEmail] = useState('');
  const [sliderOffset, setSliderOffset] = useState(0);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/products/popular`);
        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }
        const data = await response.json();
        setPopularProducts(data);
      } catch (err) {
        console.error('Error fetching popular products:', err);
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
          setError(`백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (${API_BASE_URL})`);
        } else {
          setError(err.message || '인기 상품을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  const maxOffset = Math.max(0, popularProducts.length - 5);

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
      image: 'https://sfycdn.speedsize.com/4aadaad8-50d5-458f-88dd-2f364bf4d82e/allbirds.co.kr/cdn/shop/files/e38945873be459407bd1e541c9ad5041.jpg?v=1740387850&width=1110'
    },
    {
      name: '유칼립투스 나무',
      description: '실크처럼 매끄러운 촉감',
      image: 'https://sfycdn.speedsize.com/4aadaad8-50d5-458f-88dd-2f364bf4d82e/allbirds.co.kr/cdn/shop/files/d7fcf584905e3a719874b448d68aa0c8.jpg?v=1740387915&width=1110'
    },
    {
      name: '사탕수수',
      description: '부드러운 SweetFoam®의 주 소재',
      image: 'https://sfycdn.speedsize.com/4aadaad8-50d5-458f-88dd-2f364bf4d82e/allbirds.co.kr/cdn/shop/files/b4729b825b4d6790fb2e91d761ffaa28.jpg?v=1740387919&width=1110'
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
        <HeroSlider />
      </section>

      <section className="home-section">
        {loading && <div className="loading-state">로딩 중...</div>}
        {error && <div className="error-state">{error}</div>}
        {!loading && !error && popularProducts.length > 0 && (
          <div className="slider-container">
            <h2 className="section-title left slider-title">실시간 인기</h2>
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
                }}
              >
                {popularProducts.map((product, idx) => {
                  // 이미지 URL 처리 (상대 경로인 경우 API_BASE_URL 추가)
                  const imageUrl = product.image 
                    ? (product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`)
                    : 'https://via.placeholder.com/600';
                  
                  return (
                    <Link key={product.id} to={`/products/${product.id}`} className="horizontal-card">
                      <div className="product-badge">{idx + 1}</div>
                      <img alt={product.name} src={imageUrl} />
                      <div>
                        <strong className="product-title">{product.name}</strong>
                        {product.color && (
                          <div className="product-name">{product.color}</div>
                        )}
                        <div className="product-price">
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                              <span className="original-price">₩{product.originalPrice.toLocaleString()}</span>
                              <span className="sale-price">₩{product.price.toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="sale-price">₩{product.price.toLocaleString()}</span>
                          )}
                        </div>
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="product-sizes">
                            <div className="size-label">주문 가능 사이즈</div>
                            <div className="size-list">
                              {product.sizes.map((size) => (
                                <span key={size} className="size-tag">{size}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {!loading && !error && popularProducts.length === 0 && (
          <div className="empty-state">인기 상품이 없습니다.</div>
        )}
      </section>

      <section className="home-section">
        <div className="materials-section">
          <div className="materials-grid">
            <h2 className="section-title no-margin left materials-title">우리가 사용하는 소재</h2>
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

      <section className="home-section">
        <div className="materials-section">
          <div className="materials-grid">
            <div className="material-card">
              <img src="https://allbirds.co.kr/cdn/shop/files/25Q2_BAU_Site_OurStoryLandingPage_Story-Carousel-08_Studio_Desktop_1x1_eaa761e1-229c-45c0-b96b-49c0fff1345c.webp?v=1753408340&width=900" alt="편안함" />
              <h3>매일 경험하는 편안함</h3>
              <p>
                올버는 마치 구름 위를 걷는 듯한 가벼움과, 바람처럼 자유로운 탄력을 선사합니다. 
                놀라운 편안함은 긴 여정도 짧은 산책처럼 느껴집니다.
              </p>
              <a href="#">더 알아보기 →</a>
            </div>
            <div className="material-card">
              <img src="https://allbirds.co.kr/cdn/shop/files/25Q1_Moonshot_Site_LandingPage_600x501_P2.png?v=1742523878&width=900" alt="지속가능성" />
              <h3>지속 가능한 발걸음</h3>
              <p>
                소재를 고르는 순간부터 신발이 당신에게 닿는 그 순간까지 지구에 남기는 흔적을 헤아립니다. 
                탄소 발자국을 제로에 가깝게 줄이려는 노력에 동참해주세요.
              </p>
              <a href="#">더 알아보기 →</a>
            </div>
            <div className="material-card">
              <img src="https://allbirds.co.kr/cdn/shop/files/25Q2_BAU_Site_OurStoryLandingPage_Story-Carousel-04_Studio_Desktop_2x3_e8297425-4182-45c0-bf21-cbf7a4f5293d.webp?v=1753408471&width=900" alt="소재" />
              <h3>지구에서 온 소재</h3>
              <p>
                올버즈는 가능한 모든 곳에서 석유 기반 합성소재를 천연 대안으로 대체합니다. 
                울, 나무, 사탕수수 같은 자연 소재는 부드럽고 통기성이 좋습니다.
              </p>
              <a href="#">더 알아보기 →</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
