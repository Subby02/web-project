import React from 'react';
import styled from 'styled-components';

const FooterWrap = styled.footer`
  background: #2d2d2d;
  color: #fff;
  padding: 64px 24px 32px;
  margin-top: 64px;
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  margin-bottom: 48px;
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LinkTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  padding: 4px 0;
  transition: color 0.3s ease;
  &:hover {
    color: #fff;
  }
`;

const SocialSection = styled.div`
  margin-top: 24px;
`;

const SocialTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
`;

const SocialText = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
  line-height: 1.6;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
`;

const SocialIcon = styled.a`
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #fff;
  }
`;

const BCorpLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  width: fit-content;
`;

const BCircle = styled.div`
  width: 48px;
  height: 48px;
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
`;

const BText = styled.div`
  font-size: 12px;
  line-height: 1.4;
`;

const BottomSection = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const Copyright = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
`;

const CompanyInfo = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
  text-align: right;
  @media (max-width: 968px) {
    text-align: left;
  }
`;

const ScrollTopButton = styled.button`
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2d2d2d;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 100;
  &:hover {
    background: #1a1a1a;
    transform: translateY(-4px);
  }
`;

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <FooterWrap>
        <FooterContent>
          <LeftColumn>
            <LinkGroup>
              <FooterLink href="#">올멤버스 가입하기</FooterLink>
              <FooterLink href="#">오프라인 매장 찾기</FooterLink>
              <FooterLink href="#">카카오 채널 추가하기</FooterLink>
              <FooterLink href="#">올버즈 브랜드 스토리</FooterLink>
            </LinkGroup>
            
            <SocialSection>
              <SocialTitle>ALLBIRDS를 팔로우 하세요!</SocialTitle>
              <SocialText>
                최신 정보나 Allbirds 상품의 스냅샷 등을 보실 수 있습니다. 오! 물론 귀여운 양도 보실 수 있죠. #weareallbirds #올버즈
              </SocialText>
              <SocialIcons>
                <SocialIcon href="#" aria-label="Instagram">📷</SocialIcon>
                <SocialIcon href="#" aria-label="Facebook">f</SocialIcon>
              </SocialIcons>
            </SocialSection>

            <Copyright>
              © 2025 EFG.COAll Rights Reserved.<br />
              이용약관, 개인정보 처리방침,
            </Copyright>
          </LeftColumn>

          <RightColumn>
            <LinkGroup>
              <LinkTitle>올버즈 지원</LinkTitle>
              <FooterLink href="#">교환 및 반품</FooterLink>
              <FooterLink href="#">수선</FooterLink>
              <FooterLink href="#">문의하기</FooterLink>
              <FooterLink href="#">FAQ</FooterLink>
              <FooterLink href="#">채용</FooterLink>
            </LinkGroup>

            <BCorpLogo>
              <BCircle>B</BCircle>
              <BText>
                <div style={{fontWeight: 600}}>Certified</div>
                <div>B Corporation</div>
              </BText>
            </BCorpLogo>

            <CompanyInfo>
              (주)이에프쥐 대표 박제우<br />
              서울특별시 강남구 강남대로 160길 45<br />
              통신판매업신고번호 2023-서울강남-04461<br />
              등록번호 146-81-03205<br />
              전화번호 070-4138-0128(수신자 부담)<br />
              E-mail help@efg.earth
            </CompanyInfo>
          </RightColumn>
        </FooterContent>
      </FooterWrap>
      <ScrollTopButton onClick={scrollToTop} aria-label="맨 위로">
        ↑
      </ScrollTopButton>
    </>
  );
}


