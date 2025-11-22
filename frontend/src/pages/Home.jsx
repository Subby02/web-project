import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeWrapper = styled.div`
  background: #f9f9f9;
`;

const Section = styled.section`
  max-width:1280px; margin:0 auto; padding:0 24px;
  ${p => p.fullWidth ? 'max-width:100%; padding:0;' : ''}
  overflow: visible;
  ${p => p.noBg ? '' : 'background: #f9f9f9;'}
`;

const HeroBanner = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #fff;
  text-align: center;
  padding: 80px 24px;
  margin-bottom: 0;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 20px;
  margin: 0 0 32px;
  opacity: 0.9;
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled.a`
  display: inline-block;
  padding: 14px 32px;
  background: ${p => p.primary ? '#fff' : 'transparent'};
  color: ${p => p.primary ? '#111' : '#fff'};
  border: 2px solid #fff;
  border-radius: 4px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  &:hover {
    background: ${p => p.primary ? '#f5f5f5' : '#fff'};
    color: ${p => p.primary ? '#111' : '#111'};
  }
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin: 64px 0 32px;
  text-align: ${p => p.left ? 'left' : 'center'};
  @media (max-width: 768px) {
    font-size: 24px;
    margin: 48px 0 24px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 64px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const ProductCard = styled(Link)`
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  color: #111;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    background: #f5f5f5;
  }
  > div {
    padding: 16px;
  }
`;

const ProductName = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const ProductTitle = styled.strong`
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-top: 8px;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-right: 8px;
  font-weight: 400;
`;

const SalePrice = styled.span`
  color: #d22;
`;

const MaterialsSection = styled.div`
  background: #f9f9f9;
  padding: 80px 24px;
  margin: 64px 0;
`;

const MaterialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const MaterialCard = styled.div`
  text-align: center;
  img {
    width: 100%;
    max-width: 300px;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 24px;
    background: #fff;
  }
  h3 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px;
  }
  p {
    font-size: 16px;
    color: #666;
    margin: 0 0 16px;
    line-height: 1.6;
  }
  a {
    color: #111;
    font-weight: 600;
    text-decoration: underline;
    &:hover {
      color: #d22;
    }
  }
`;

const NewsletterSection = styled.div`
  background: #f9f9f9;
  color: #111;
  padding: 80px 24px;
  text-align: center;
  margin: 64px 0;
`;

const NewsletterTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #111;
`;

const NewsletterSubtitle = styled.p`
  font-size: 18px;
  margin: 0 0 32px;
  color: #666;
`;

const NewsletterForm = styled.form`
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  gap: 12px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: 1px solid #ddd;
  background: #fff;
  color: #111;
  border-radius: 4px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #111;
  }
  &::placeholder {
    color: #999;
  }
`;

const SubmitButton = styled.button`
  padding: 14px 32px;
  background: #2d2d2d;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: #1a1a1a;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BrandSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  margin: 64px 0;
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const BrandCard = styled.div`
  padding: 64px 32px;
  background: ${p => p.bg || '#f9f9f9'};
  color: ${p => p.dark ? '#fff' : '#111'};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  @media (max-width: 768px) {
    padding: 48px 24px;
  }
  img {
    width: 100%;
    max-width: 400px;
    height: 300px;
    object-fit: cover;
    margin-bottom: 24px;
    border-radius: 8px;
  }
  h3 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 16px;
  }
  p {
    font-size: 16px;
    line-height: 1.8;
    margin: 0;
    opacity: ${p => p.dark ? 0.9 : 0.8};
    max-width: 400px;
  }
`;

const SliderContainer = styled.div`
  position: relative;
  margin: 32px 0;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 40px;
  overflow: visible;
  @media (max-width: 768px) {
    padding: 0 32px;
  }
`;

const SliderWrapper = styled.div`
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const SliderTrack = styled.div`
  display: flex;
  gap: 24px;
  transition: transform 0.5s ease;
  transform: translateX(calc(-${p => p.offset} * (20% + 4.8px)));
  @media (max-width: 768px) {
    gap: 16px;
    transform: translateX(calc(-${p => p.offset} * (20% + 3.2px)));
  }
`;

const SliderButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #111;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  ${p => p.left ? 'left: 12px;' : 'right: 12px;'}
  &:hover:not(:disabled) {
    background: rgba(17, 17, 17, 0.9);
    color: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    transform: translateY(-50%) scale(1.1);
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    font-size: 20px;
    ${p => p.left ? 'left: 8px;' : 'right: 8px;'}
  }
`;


const HorizontalCard = styled(Link)`
  width: calc((100% - 96px) / 5);
  flex-shrink: 0;
  position: relative;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  color: #111;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    background: #f5f5f5;
  }
  > div {
    padding: 16px;
  }
  @media (max-width: 768px) {
    width: calc((100% - 64px) / 5);
  }
`;

const ProductBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  z-index: 10;
`;

const ProductSizes = styled.div`
  margin-top: 12px;
  font-size: 13px;
  color: #666;
`;

const SizeLabel = styled.div`
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  &::before {
    content: "✓";
    color: #22c55e;
    font-weight: 700;
  }
`;

const SizeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SizeTag = styled.span`
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
`;

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

  return (
    <>
      <Section fullWidth>
        <HeroBanner>
          <HeroTitle>슈퍼 블랙 프라이데이 세일</HeroTitle>
          <HeroSubtitle>세상에서 가장 편한 신발, 올버즈 | ~50% OFF</HeroSubtitle>
          <ButtonGroup>
            <Button primary href="#">남성 세일</Button>
            <Button href="#">여성 세일</Button>
          </ButtonGroup>
        </HeroBanner>
      </Section>

      <Section>
        <SectionTitle left>실시간 인기</SectionTitle>
        <SliderContainer>
          <SliderButton left onClick={handlePrev} disabled={sliderOffset === 0}>
            ‹
          </SliderButton>
          <SliderButton onClick={handleNext} disabled={sliderOffset >= maxOffset}>
            ›
          </SliderButton>
          <SliderWrapper>
            <SliderTrack offset={sliderOffset}>
              {popularProducts.map((product, idx) => (
                <HorizontalCard key={product.id} to={`/products/${product.id}`}>
                  <ProductBadge>{idx + 1}</ProductBadge>
                  <img alt={product.name} src={product.image} />
                  <div>
                    <ProductName>{product.color}</ProductName>
                    <ProductTitle>{product.name}</ProductTitle>
                    <ProductPrice>
                      {product.originalPrice && (
                        <OriginalPrice>₩{product.originalPrice.toLocaleString()}</OriginalPrice>
                      )}
                      <SalePrice>₩{product.price.toLocaleString()}</SalePrice>
                    </ProductPrice>
                    <ProductSizes>
                      <SizeLabel>주문 가능 사이즈</SizeLabel>
                      <SizeList>
                        {product.sizes.map((size) => (
                          <SizeTag key={size}>{size}</SizeTag>
                        ))}
                      </SizeList>
                    </ProductSizes>
                  </div>
                </HorizontalCard>
              ))}
            </SliderTrack>
          </SliderWrapper>
        </SliderContainer>
      </Section>

      <Section fullWidth>
        <MaterialsSection>
          <SectionTitle style={{marginTop: 0, color: '#111'}}>우리가 사용하는 소재</SectionTitle>
          <MaterialsGrid>
            {materials.map((material, idx) => (
              <MaterialCard key={idx}>
                <img src={material.image} alt={material.name} />
                <h3>{material.name}</h3>
                <p>{material.description}</p>
                <a href="#">더 알아보기 →</a>
              </MaterialCard>
            ))}
          </MaterialsGrid>
        </MaterialsSection>
      </Section>

      <Section fullWidth>
        <NewsletterSection>
          <NewsletterTitle>올버즈 뉴스레터 구독</NewsletterTitle>
          <NewsletterSubtitle>
            최신 신제품 소식과 혜택을 가장 먼저 받아보세요.
          </NewsletterSubtitle>
          <NewsletterForm onSubmit={handleNewsletterSubmit}>
            <Input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <SubmitButton type="submit">구독</SubmitButton>
          </NewsletterForm>
          <p style={{fontSize: 12, marginTop: 16, color: '#666'}}>
            구독 시 마케팅 이메일 수신에 동의하게 됩니다. 자세한 내용은 개인정보 처리방침 및 이용약관을 확인해 주세요.
          </p>
        </NewsletterSection>
      </Section>

      <Section fullWidth>
        <BrandSection>
          <BrandCard bg="#f0f8f0">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop" alt="편안함" />
            <h3>매일 경험하는 편안함</h3>
            <p>
              올버는 마치 구름 위를 걷는 듯한 가벼움과, 바람처럼 자유로운 탄력을 선사합니다. 
              놀라운 편안함은 긴 여정도 짧은 산책처럼 느껴집니다.
            </p>
          </BrandCard>
          <BrandCard dark bg="#1a1a1a">
            <img src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=400&fit=crop" alt="지속가능성" />
            <h3>지속 가능한 발걸음</h3>
            <p>
              소재를 고르는 순간부터 신발이 당신에게 닿는 그 순간까지 지구에 남기는 흔적을 헤아립니다. 
              탄소 발자국을 제로에 가깝게 줄이려는 노력에 동참해주세요.
            </p>
          </BrandCard>
          <BrandCard bg="#f9f9f9">
            <img src="https://images.unsplash.com/photo-1585121508800-1015a9e0d0e5?w=600&h=400&fit=crop" alt="소재" />
            <h3>지구에서 온 소재</h3>
            <p>
              올버즈는 가능한 모든 곳에서 석유 기반 합성소재를 천연 대안으로 대체합니다. 
              울, 나무, 사탕수수 같은 자연 소재는 부드럽고 통기성이 좋습니다.
            </p>
          </BrandCard>
        </BrandSection>
      </Section>
    </>
  );
}



