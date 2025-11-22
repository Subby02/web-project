import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 24px;
  @media (max-width: 968px) {
    padding: 24px 16px;
  }
`;

const Breadcrumb = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  a {
    color: #666;
    &:hover {
      color: #111;
    }
  }
`;

const ProductWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-bottom: 64px;
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const ImageSection = styled.div`
  position: relative;
`;

const MainImage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageThumbnails = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
  }
`;

const Thumbnail = styled.button`
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid ${p => p.active ? '#111' : 'transparent'};
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;
  padding: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InfoSection = styled.div``;

const ProductName = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px;
  line-height: 1.3;
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Price = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const OriginalPrice = styled.span`
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
  margin-right: 12px;
  font-weight: 400;
`;

const SalePrice = styled.span`
  color: #d22;
`;

const OptionGroup = styled.div`
  margin-bottom: 24px;
`;

const OptionLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #111;
`;

const ColorOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  max-width: 700px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 8px;
    max-width: 100%;
  }
`;

const ColorOption = styled.button`
  position: relative;
  padding: 0;
  border: 2px solid ${p => p.selected ? '#111' : '#ddd'};
  background: ${p => p.selected ? '#111' : '#fff'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  &:hover {
    border-color: #111;
    transform: scale(1.05);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ColorLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  ${p => p.selected ? 'background: rgba(17, 17, 17, 0.9);' : ''}
`;

const GenderOptions = styled.div`
  display: flex;
  gap: 12px;
`;

const GenderOption = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: 1px solid ${p => p.selected ? '#111' : '#ddd'};
  background: ${p => p.selected ? '#111' : '#fff'};
  color: ${p => p.selected ? '#fff' : '#111'};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    border-color: #111;
  }
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
`;

const SizeOption = styled.button`
  padding: 12px 8px;
  border: 1px solid ${p => p.selected ? '#111' : '#ddd'};
  background: ${p => p.selected ? '#111' : '#fff'};
  color: ${p => p.selected ? '#fff' : '#111'};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    border-color: #111;
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const FitGuide = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const FitGuideTabs = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ddd;
`;

const FitGuideTab = styled.button`
  padding: 8px 0;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: ${p => p.active ? '600' : '400'};
  color: ${p => p.active ? '#111' : '#666'};
  border-bottom: 2px solid ${p => p.active ? '#111' : 'transparent'};
  cursor: pointer;
  margin-bottom: -1px;
`;

const FitGuideContent = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
`;

const FitGuideLink = styled.a`
  color: #111;
  text-decoration: underline;
  font-size: 13px;
  margin-top: 8px;
  display: inline-block;
`;

const StoreStockSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 32px;
  &:hover {
    background: #333;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  background: #d22;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
  &:hover {
    background: #b00;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 32px;
`;

const AccordionSection = styled.div`
  margin-top: 48px;
  border-top: 1px solid var(--border);
  padding-top: 32px;
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid var(--border);
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  color: #111;
  &:hover {
    color: #666;
  }
`;

const AccordionIcon = styled.span`
  font-size: 20px;
  transition: transform 0.3s ease;
  transform: rotate(${p => p.open ? '45deg' : '0deg'});
`;

const AccordionContent = styled.div`
  max-height: ${p => p.open ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding-bottom: ${p => p.open ? '24px' : '0'};
  color: #666;
  line-height: 1.8;
  ul {
    margin: 12px 0;
    padding-left: 24px;
  }
  li {
    margin-bottom: 8px;
  }
`;

const ReviewsSection = styled.div`
  margin-top: 64px;
  padding-top: 48px;
  border-top: 1px solid var(--border);
`;

const ReviewsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const ReviewsRating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RatingNumber = styled.div`
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
`;

const Stars = styled.div`
  display: flex;
  gap: 4px;
  font-size: 24px;
  color: #ffd700;
`;

const ReviewCount = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 8px;
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ReviewItem = styled.div`
  padding: 24px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ReviewAuthor = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 2px;
  font-size: 14px;
  color: #ffd700;
  margin-bottom: 8px;
`;

const ReviewTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #111;
`;

const ReviewText = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ReviewDate = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 12px;
`;

const Loading = styled.div`
  text-align: center;
  padding: 64px;
  font-size: 18px;
  color: #666;
`;

const Error = styled.div`
  text-align: center;
  padding: 64px;
  font-size: 18px;
  color: #d22;
`;

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
        const res = await fetch(`http://localhost:4000/api/products/${id}`);
        if (!res.ok) throw new Error('제품을 찾을 수 없습니다.');
        const data = await res.json();
        setProduct(data);
        setSelectedColor(data.colors?.[0] || null);
        
        // 후기 가져오기
        const reviewsRes = await fetch(`http://localhost:4000/api/reviews/${id}`);
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
      if (selectedVariant && selectedVariant.images) {
        return selectedVariant.images;
      }
    }
    return product?.images || (product?.image ? [product.image] : []);
  }, [product, selectedColor]);

  // 색상이 변경되면 이미지 인덱스 리셋 - early return 전에 호출해야 함
  useEffect(() => {
    if (selectedColor) {
      setSelectedImageIndex(0);
    }
  }, [selectedColor]);

  // early return은 모든 hooks 호출 후에
  if (loading) return <Loading>로딩 중...</Loading>;
  if (error) return <Error>{error}</Error>;
  if (!product) return <Error>제품을 찾을 수 없습니다.</Error>;

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
    
    const cartItem = {
      productId: product.id,
      productName: product.name,
      color: selectedColor,
      gender: selectedGender,
      size: selectedSize,
      price: product.price,
      image: images[0] || product.images?.[0],
      quantity: 1
    };

    try {
      // 로컬 스토리지에 장바구니 저장 (또는 API 호출)
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex(
        item => item.productId === cartItem.productId && 
                item.color === cartItem.color && 
                item.size === cartItem.size
      );

      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // 장바구니 업데이트 이벤트 발생 (헤더에서 카운트 업데이트용)
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // 장바구니 사이드바 자동 열기
      window.dispatchEvent(new CustomEvent('openCart'));
    } catch (err) {
      console.error('장바구니 추가 오류:', err);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  // 결제하기 함수
  const handleCheckout = () => {
    if (!selectedSize) {
      alert('사이즈를 선택해주세요.');
      return;
    }
    
    alert('결제가 완료되었습니다.');
    
    // 장바구니 전체 삭제
    localStorage.removeItem('cart');
    
    // 장바구니 업데이트 이벤트 발생 (헤더에서 카운트 업데이트용)
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  return (
    <Container>
      <Breadcrumb>
        <Link to="/">Home</Link> {' > '} {product.name}
      </Breadcrumb>

      <ProductWrapper>
        <ImageSection>
          <MainImage>
            <img src={images[selectedImageIndex] || images[0]} alt={product.name} />
          </MainImage>
          {images.length > 1 && (
            <ImageThumbnails>
              {images.map((img, idx) => (
                <Thumbnail
                  key={idx}
                  active={selectedImageIndex === idx}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </Thumbnail>
              ))}
            </ImageThumbnails>
          )}
        </ImageSection>

        <InfoSection>
          <ProductName>{product.name}</ProductName>
          <Price>
            {product.originalPrice && product.originalPrice > product.price && (
              <OriginalPrice>₩{product.originalPrice.toLocaleString()}</OriginalPrice>
            )}
            <SalePrice>₩{product.price.toLocaleString()}</SalePrice>
          </Price>

          {colors.length > 0 && (
            <OptionGroup>
              <OptionLabel>색상</OptionLabel>
              <ColorOptions>
                {colors.map((color, idx) => {
                  const variant = colorVariants.find(v => v.name === color);
                  const thumbnail = variant?.thumbnail || images[0] || '';
                  return (
                    <ColorOption
                      key={idx}
                      selected={selectedColor === color}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    >
                      <img src={thumbnail} alt={color} />
                      <ColorLabel selected={selectedColor === color}>{color}</ColorLabel>
                    </ColorOption>
                  );
                })}
              </ColorOptions>
            </OptionGroup>
          )}

          <OptionGroup>
            <OptionLabel>성별</OptionLabel>
            <GenderOptions>
              <GenderOption
                selected={selectedGender === '남성'}
                onClick={() => setSelectedGender('남성')}
              >
                남성
              </GenderOption>
              <GenderOption
                selected={selectedGender === '여성'}
                onClick={() => setSelectedGender('여성')}
              >
                여성
              </GenderOption>
            </GenderOptions>
          </OptionGroup>

          {sizes.length > 0 && (
            <OptionGroup>
              <OptionLabel>사이즈</OptionLabel>
              <SizeGrid>
                {sizes.map((size) => (
                  <SizeOption
                    key={size}
                    selected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </SizeOption>
                ))}
              </SizeGrid>
            </OptionGroup>
          )}

          <FitGuide>
            <FitGuideTabs>
              <FitGuideTab active>두께감</FitGuideTab>
              <FitGuideTab>정사이즈</FitGuideTab>
              <FitGuideTab>프리사이즈</FitGuideTab>
            </FitGuideTabs>
            <FitGuideContent>
              부드러운 메리노 울 소재로 포근하고 편안한 착화감을 제공합니다.
            </FitGuideContent>
            <FitGuideLink href="#">자세한 가이드</FitGuideLink>
          </FitGuide>

          <StoreStockSection>
            <strong>오프라인 매장 재고 확인</strong>
            <div style={{ marginTop: '8px', fontSize: '13px' }}>
              사이즈를 선택하시면 재고가 있는 매장을 확인할 수 있습니다.
            </div>
          </StoreStockSection>

          <ButtonGroup>
            <AddToCartButton 
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              장바구니에 추가
            </AddToCartButton>
            <CheckoutButton 
              onClick={handleCheckout}
              disabled={!selectedSize}
            >
              결제하기
            </CheckoutButton>
          </ButtonGroup>
        </InfoSection>
      </ProductWrapper>

      <AccordionSection>
        <AccordionItem>
          <AccordionHeader onClick={() => toggleAccordion(0)}>
            <span>상세 정보</span>
            <AccordionIcon open={openAccordion === 0}>+</AccordionIcon>
          </AccordionHeader>
          <AccordionContent open={openAccordion === 0}>
            {product.description || (
              <div>
                <p>포근한 ZQ 메리노 울과 SweetFoam® 쿠션으로 하루 종일 가볍고 편안한 착화감.</p>
                <p>기계 세탁 가능—인솔만 분리해 세탁하면 첫날처럼 산뜻합니다.</p>
                <p>제조국: 베트남</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem>
          <AccordionHeader onClick={() => toggleAccordion(1)}>
            <span>지속 가능성</span>
            <AccordionIcon open={openAccordion === 1}>+</AccordionIcon>
          </AccordionHeader>
          <AccordionContent open={openAccordion === 1}>
            <ul>
              <li>동물 복지, 환경 보호, 사회적 지속 가능성의 최고 기준을 충족하는 ZQ 인증 메리노 울 어퍼</li>
              <li>사탕수수 기반 그린 EVA를 사용한 SweetFoam® 미드솔</li>
              <li>Climate Neutral 탄소 중립 기업 인증 획득</li>
              <li>탄소 저감 프로젝트 펀딩을 비롯한 활동을 통해 탄소 중립 실현</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem>
          <AccordionHeader onClick={() => toggleAccordion(2)}>
            <span>케어 방법</span>
            <AccordionIcon open={openAccordion === 2}>+</AccordionIcon>
          </AccordionHeader>
          <AccordionContent open={openAccordion === 2}>
            <ul>
              <li>신발 끈, 깔창 분리</li>
              <li>세탁망(베개 커버도 가능)에 신발 넣기</li>
              <li>찬물/울 코스로 중성세제를 적당량 첨가하여 세탁</li>
              <li>세탁 후에 남은 물기는 털어 자연 건조</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              *자세한 가이드는 여기에서 확인하세요.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem>
          <AccordionHeader onClick={() => toggleAccordion(3)}>
            <span>배송 & 반품</span>
            <AccordionIcon open={openAccordion === 3}>+</AccordionIcon>
          </AccordionHeader>
          <AccordionContent open={openAccordion === 3}>
            <ul>
              <li>전제품 5만원 이상 구입 시 무료 배송</li>
              <li>올멤버스: 조건 없는 무료 배송 & 30일 내 무료 교환/환불 (단, 세일 제품은 7일 내 미착용 시 교환/환불)</li>
              <li>비회원: 7일 내 미착용 시 교환/환불</li>
              <li>반품: 물류센터에 반송품이 도착한 뒤 5 영업일 내 검수 후 환불</li>
              <li>교환: 동일 가격의 상품으로만 교환 가능, 맞교환 불가, 물류센터에 반송품이 도착한 뒤 새로운 교환 상품 발송 (교환 일정 7~10 영업일 소요)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </AccordionSection>

      <ReviewsSection>
        {reviews.length > 0 ? (
          <>
            <ReviewsHeader>
              <ReviewsRating>
                <RatingNumber>{calculateAverageRating()}</RatingNumber>
                <Stars>{renderStars(parseFloat(calculateAverageRating()))}</Stars>
              </ReviewsRating>
              <ReviewCount>{reviews.length}건의 리뷰 분석 결과입니다.</ReviewCount>
            </ReviewsHeader>
            <ReviewList>
              {reviews.map((review) => (
                <ReviewItem key={review.id}>
                  <ReviewHeader>
                    <div>
                      <ReviewAuthor>{review.author || '고객'}</ReviewAuthor>
                      <ReviewRating>{renderStars(review.rating)}</ReviewRating>
                      {review.title && <ReviewTitle>{review.title}</ReviewTitle>}
                    </div>
                  </ReviewHeader>
                  <ReviewText>{review.text}</ReviewText>
                  <ReviewDate>
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString('ko-KR')
                      : '날짜 정보 없음'}
                  </ReviewDate>
                </ReviewItem>
              ))}
            </ReviewList>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>아직 작성된 후기가 없습니다.</div>
            <div style={{ fontSize: '14px' }}>첫 번째 후기를 작성해보세요!</div>
          </div>
        )}
      </ReviewsSection>
    </Container>
  );
}

