import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { addToLocalCart } from '../utils/cartStorage';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedGender, setSelectedGender] = useState('남성');
  const [selectedSize, setSelectedSize] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        if (!res.ok) throw new Error('제품을 찾을 수 없습니다.');
        const data = await res.json();
        setProduct(data);
        setSelectedColor(data.colors?.[0] || null);
        
        // 후기 가져오기
        const reviewsRes = await fetch(`${API_BASE_URL}/api/reviews/${id}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          // 최대 3개만 표시
          setReviews(reviewsData.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        if (err.message === 'Failed to fetch') {
          setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (http://localhost:4000)');
        } else {
          setError(err.message || '제품 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating || 0)) + '☆'.repeat(5 - Math.floor(rating || 0));
  };

  // 선택된 색상에 맞는 이미지 가져오기 (useMemo로 최적화) - early return 전에 호출해야 함
  const images = useMemo(() => {
    if (product?.colorVariants && selectedColor) {
      const selectedVariant = product.colorVariants.find(v => v.name === selectedColor);
      if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
        return selectedVariant.images;
      }
    }
    // colorVariant가 없거나 이미지가 없으면 기본 이미지 사용
    return product?.images || (product?.image ? [product.image] : []);
  }, [product, selectedColor]);

  // 색상이 변경되면 이미지 인덱스 리셋 - early return 전에 호출해야 함
  useEffect(() => {
    if (selectedColor) {
      setSelectedImageIndex(0);
    }
  }, [selectedColor]);

  // early return은 모든 hooks 호출 후에
  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">제품을 찾을 수 없습니다.</div>;

  const colors = product?.colors || ['내추럴 블랙'];
  const colorVariants = product?.colorVariants || [];
  const sizes = product?.sizes || [];

  // 색상 선택 시 이미지 변경
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedImageIndex(0); // 첫 번째 이미지로 리셋
  };

  // 장바구니 추가 함수
  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    // 로그인 상태 확인
    let isLoggedIn = false;
    try {
      const authResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });
      const authData = await authResponse.json();
      isLoggedIn = authData?.authenticated === true;
    } catch (error) {
      isLoggedIn = false;
    }

    if (isLoggedIn) {
      // 로그인된 경우: 서버에 저장
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: product.id,
            size: selectedSize,
            quantity: 1,
          }),
        });

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
          throw new Error(data.message || '장바구니 추가에 실패했습니다.');
        }

        alert('장바구니에 추가되었습니다.');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        window.dispatchEvent(new CustomEvent('openCart'));
      } catch (err) {
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
          alert(`백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (${API_BASE_URL})`);
        } else {
          alert(err.message || '장바구니 추가 중 오류가 발생했습니다.');
        }
      }
    } else {
      // 로그인하지 않은 경우: 로컬 스토리지에 저장
      addToLocalCart(product, selectedSize, 1, selectedColor);
      alert('장바구니에 추가되었습니다.');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      window.dispatchEvent(new CustomEvent('openCart'));
    }
  };

  // 결제하기 함수
  const handleCheckout = async () => {
    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 세션 쿠키 전송
        body: JSON.stringify({
          items: [
            {
              productId: product.id,
              quantity: 1,
              size: selectedSize,
            },
          ],
        }),
      });

      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('서버 응답 (HTML):', text.substring(0, 200));
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

      alert('주문이 완료되었습니다!');
      
      // 장바구니 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('주문 오류:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        alert(`백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (${API_BASE_URL})`);
      } else {
        alert(err.message || '주문 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> {' > '} {product.name}
      </div>

      <div className="product-wrapper">
        <div className="image-section">
          <div className="main-image">
            <img src={images[selectedImageIndex] || images[0]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail ${selectedImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="info-section">
          <h1 className="product-name">{product.name}</h1>
          <div className="price">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">₩{product.originalPrice.toLocaleString()}</span>
            )}
            <span className="sale-price">₩{product.price.toLocaleString()}</span>
          </div>

          {colors.length > 0 && (
            <div className="option-group">
              <label className="option-label">색상</label>
              <div className="color-options">
                {colors.map((color, idx) => {
                  const variant = colorVariants.find(v => v.name === color);
                  // 각 색상의 썸네일을 찾되, 없으면 해당 색상의 첫 번째 이미지 또는 기본 이미지 사용
                  const thumbnail = variant?.thumbnail || variant?.images?.[0] || images[0] || '';
                  return (
                    <button
                      key={idx}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    >
                      <img src={thumbnail} alt={color} />
                      <div className={`color-label ${selectedColor === color ? 'selected' : ''}`}>{color}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="option-group">
            <label className="option-label">성별</label>
            <div className="gender-options">
              <button
                className={`gender-option ${selectedGender === '남성' ? 'selected' : ''}`}
                onClick={() => setSelectedGender('남성')}
              >
                남성
              </button>
              <button
                className={`gender-option ${selectedGender === '여성' ? 'selected' : ''}`}
                onClick={() => setSelectedGender('여성')}
              >
                여성
              </button>
            </div>
          </div>

          {sizes.length > 0 && (
            <div className="option-group">
              <label className="option-label">사이즈</label>
              <div className="size-grid">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="fit-guide">
            <div className="fit-guide-tabs">
              <button className="fit-guide-tab active">두께감</button>
              <button className="fit-guide-tab">정사이즈</button>
              <button className="fit-guide-tab">프리사이즈</button>
            </div>
            <div className="fit-guide-content">
              부드러운 메리노 울 소재로 포근하고 편안한 착화감을 제공합니다.
            </div>
            <a href="#" className="fit-guide-link">자세한 가이드</a>
          </div>

          <div className="store-stock-section">
            <strong>오프라인 매장 재고 확인</strong>
            <div>
              사이즈를 선택하시면 재고가 있는 매장을 확인할 수 있습니다.
            </div>
          </div>

          <div className="button-group">
            <button 
              className="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              장바구니에 추가
            </button>
            <button 
              className="checkout-button"
              onClick={handleCheckout}
              disabled={!selectedSize}
            >
              결제하기
            </button>
          </div>
        </div>
      </div>

      <div className="accordion-section">
        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleAccordion(0)}>
            <span>상세 정보</span>
            <span className={`accordion-icon ${openAccordion === 0 ? 'open' : ''}`}>+</span>
          </button>
          <div className={`accordion-content ${openAccordion === 0 ? 'open' : ''}`}>
            {product.description || (
              <div>
                <p>포근한 ZQ 메리노 울과 SweetFoam® 쿠션으로 하루 종일 가볍고 편안한 착화감.</p>
                <p>기계 세탁 가능—인솔만 분리해 세탁하면 첫날처럼 산뜻합니다.</p>
                <p>제조국: 베트남</p>
              </div>
            )}
          </div>
        </div>

        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleAccordion(1)}>
            <span>지속 가능성</span>
            <span className={`accordion-icon ${openAccordion === 1 ? 'open' : ''}`}>+</span>
          </button>
          <div className={`accordion-content ${openAccordion === 1 ? 'open' : ''}`}>
            <ul>
              <li>동물 복지, 환경 보호, 사회적 지속 가능성의 최고 기준을 충족하는 ZQ 인증 메리노 울 어퍼</li>
              <li>사탕수수 기반 그린 EVA를 사용한 SweetFoam® 미드솔</li>
              <li>Climate Neutral 탄소 중립 기업 인증 획득</li>
              <li>탄소 저감 프로젝트 펀딩을 비롯한 활동을 통해 탄소 중립 실현</li>
            </ul>
          </div>
        </div>

        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleAccordion(2)}>
            <span>케어 방법</span>
            <span className={`accordion-icon ${openAccordion === 2 ? 'open' : ''}`}>+</span>
          </button>
          <div className={`accordion-content ${openAccordion === 2 ? 'open' : ''}`}>
            <ul>
              <li>신발 끈, 깔창 분리</li>
              <li>세탁망(베개 커버도 가능)에 신발 넣기</li>
              <li>찬물/울 코스로 중성세제를 적당량 첨가하여 세탁</li>
              <li>세탁 후에 남은 물기는 털어 자연 건조</li>
            </ul>
            <p>
              *자세한 가이드는 여기에서 확인하세요.
            </p>
          </div>
        </div>

        <div className="accordion-item">
          <button className="accordion-header" onClick={() => toggleAccordion(3)}>
            <span>배송 & 반품</span>
            <span className={`accordion-icon ${openAccordion === 3 ? 'open' : ''}`}>+</span>
          </button>
          <div className={`accordion-content ${openAccordion === 3 ? 'open' : ''}`}>
            <ul>
              <li>전제품 5만원 이상 구입 시 무료 배송</li>
              <li>올멤버스: 조건 없는 무료 배송 & 30일 내 무료 교환/환불 (단, 세일 제품은 7일 내 미착용 시 교환/환불)</li>
              <li>비회원: 7일 내 미착용 시 교환/환불</li>
              <li>반품: 물류센터에 반송품이 도착한 뒤 5 영업일 내 검수 후 환불</li>
              <li>교환: 동일 가격의 상품으로만 교환 가능, 맞교환 불가, 물류센터에 반송품이 도착한 뒤 새로운 교환 상품 발송 (교환 일정 7~10 영업일 소요)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        {reviews.length > 0 ? (
          <>
            <div className="reviews-header">
              <div className="reviews-rating">
                <div className="rating-number">{calculateAverageRating()}</div>
                <div className="stars">{renderStars(parseFloat(calculateAverageRating()))}</div>
              </div>
              <div className="review-count">{reviews.length}건의 리뷰 분석 결과입니다.</div>
            </div>
            <div className="review-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header-item">
                    <div>
                      <div className="review-author">{review.author || '고객'}</div>
                      <div className="review-rating">{renderStars(review.rating)}</div>
                      {review.title && <div className="review-title">{review.title}</div>}
                    </div>
                  </div>
                  <div className="review-text">{review.text}</div>
                  <div className="review-date">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString('ko-KR')
                      : '날짜 정보 없음'}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="reviews-empty">
            <div className="reviews-empty-title">아직 작성된 후기가 없습니다.</div>
            <div className="reviews-empty-subtitle">첫 번째 후기를 작성해보세요!</div>
          </div>
        )}
      </div>
    </div>
  );
}
