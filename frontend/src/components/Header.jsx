import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Bar = styled.div`
  background: #111;
  color: #fff;
  font-size: 12px;
  text-align: center;
  padding: 8px 12px;
`;

const Wrap = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 1px solid var(--border);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 32px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;
  font-weight: 400;
  font-size: 28px;
  letter-spacing: 0.5px;
  font-style: italic;
`;

const Nav = styled.nav`
  display: flex;
  gap: 24px;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const NavItem = styled.div`
  padding: 10px 8px 12px;
  position: relative;
  font-size: 14px;
  line-height: 1;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: #d22;
    border-bottom-color: #111;
  }
  ${p => p.active ? 'border-bottom-color:#111; color:#d22;' : ''}
`;

const Mega = styled.div`
  display: ${p => p.open ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  background: #fff;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  z-index: 40;
`;

const SustainabilityMenu = styled.div`
  display: ${p => p.open ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  background: #fff;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  z-index: 40;
  padding: 48px 0;
`;

const SustainabilityInner = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 80px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 64px;
`;

const SustainabilityCol = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -40px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--border);
  }
`;

const SustainabilityTitle = styled.h4`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px;
  color: #111;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  transition: transform 0.3s ease;
  transform: translateX(0);
  &::before {
    content: '';
    display: inline-block;
    width: 0;
    height: 2px;
    background: #111;
    margin-right: 0;
    transition: width 0.3s ease, margin-right 0.3s ease;
    opacity: 0;
  }
  &:hover {
    transform: translateX(8px);
  }
  &:hover::before {
    width: 18px;
    margin-right: 10px;
    opacity: 1;
  }
`;

const SustainabilityLink = styled.a`
  display: block;
  padding: 8px 0;
  font-size: 15px;
  color: #666;
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease;
  width: max-content;
  &:hover {
    color: #111;
    text-decoration: underline;
  }
`;

const MegaInner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 80px;
  padding: 48px 64px;
  margin: 0 auto;
  max-width: 1280px;
`;

const Col = styled.div`
  &.withLine {
    border-left: 1px solid var(--border);
    padding-left: 40px;
  }
`;

const H = styled.h4`
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  white-space: nowrap;
  word-break: keep-all;
`;

const Link = styled.a`
  display: block;
  padding: 10px 0;
  color: #333;
  white-space: nowrap;
  border-bottom: 1px solid transparent;
  width: max-content;
  font-size: 15px;
  text-decoration: none;
  &:hover {
    border-bottom-color: #111;
  }
`;

const IconGroup = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  position: relative;
  color: #111;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    opacity: 0.7;
  }
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
    <Wrap onMouseLeave={close}>
      <Bar>COMFY, LOW-KEY LUXURY | <b>남성</b>, <b>여성</b></Bar>
      <Row>
        <Logo>allbirds</Logo>
        <Nav>
          <NavItem onMouseEnter={close}>가을 컬렉션</NavItem>
          <NavItem 
            active={open === 'men'} 
            onMouseEnter={() => toggle('men')}
          >
            남성
          </NavItem>
          <NavItem 
            active={open === 'women'} 
            onMouseEnter={() => toggle('women')}
          >
            여성
          </NavItem>
          <NavItem onMouseEnter={close}>매장 위치</NavItem>
          <NavItem 
            active={open === 'sustainability'} 
            onMouseEnter={() => toggle('sustainability')}
          >
            지속 가능성
          </NavItem>
          <NavItem onMouseEnter={close}>세일</NavItem>
        </Nav>
        <IconGroup>
          <IconButton aria-label="검색">🔍</IconButton>
          <IconButton aria-label="계정">👤</IconButton>
          <IconButton aria-label="장바구니" onClick={onCartClick}>
            🛒
            {cartCount > 0 && <CartBadge>{cartCount}</CartBadge>}
          </IconButton>
        </IconGroup>
      </Row>
      <Mega open={open === 'men' || open === 'women'} onMouseLeave={close}>
        <MegaInner>
          <Col>
            <H>신제품</H>
            <Link href="#">크루저 미드 익스플로어</Link>
            <Link href="#">코듀로이 슬립온</Link>
            <Link href="#">울 크루저</Link>
            <Link href="#">트리 러너 NZ</Link>
            <Link href="#">울 크루저 슬립온</Link>
            <Link href="#">울 러너 NZ</Link>
          </Col>
          <Col className="withLine">
            <H>남성 신발</H>
            <Link href="#">전체</Link>
            <Link href="#">가을 컬렉션</Link>
            <Link href="#">라이프스타일</Link>
            <Link href="#">액티브</Link>
            <Link href="#">슬립온</Link>
            <Link href="#">세일</Link>
          </Col>
          <Col className="withLine">
            <H>의류 & 악세사리</H>
            <Link href="#">양말</Link>
            <Link href="#">의류</Link>
            <Link href="#">악세사리</Link>
          </Col>
        </MegaInner>
      </Mega>
      <SustainabilityMenu open={open === 'sustainability'} onMouseLeave={close}>
        <SustainabilityInner>
          <SustainabilityCol>
            <SustainabilityTitle>올버즈</SustainabilityTitle>
            <SustainabilityLink href="#">브랜드 스토리</SustainabilityLink>
            <SustainabilityLink href="#">지속 가능성</SustainabilityLink>
            <SustainabilityLink href="#">소재</SustainabilityLink>
            <SustainabilityLink href="#">수선</SustainabilityLink>
          </SustainabilityCol>
          <SustainabilityCol>
            <SustainabilityTitle>스토리</SustainabilityTitle>
            <SustainabilityLink href="#">올멤버스</SustainabilityLink>
            <SustainabilityLink href="#">올버즈 앰배서더</SustainabilityLink>
            <SustainabilityLink href="#">ReRun</SustainabilityLink>
            <SustainabilityLink href="#">신발 관리 방법</SustainabilityLink>
          </SustainabilityCol>
          <SustainabilityCol>
            <SustainabilityTitle>소식</SustainabilityTitle>
            <SustainabilityLink href="#">캠페인</SustainabilityLink>
            <SustainabilityLink href="#">뉴스</SustainabilityLink>
          </SustainabilityCol>
        </SustainabilityInner>
      </SustainabilityMenu>
    </Wrap>
  );
}

