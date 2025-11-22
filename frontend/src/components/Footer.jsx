import React from 'react';
import './Footer.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="footer-wrap">
        <div className="footer-content">
          <div className="footer-left-column">
            <div className="footer-link-group">
              <a href="#" className="footer-link">올멤버스 가입하기</a>
              <a href="#" className="footer-link">오프라인 매장 찾기</a>
              <a href="#" className="footer-link">카카오 채널 추가하기</a>
              <a href="#" className="footer-link">올버즈 브랜드 스토리</a>
            </div>
          </div>

          <div className="footer-right-column">
            <div className="footer-link-group">
              <h4 className="footer-link-title">올버즈 지원</h4>
              <a href="#" className="footer-link">교환 및 반품</a>
              <a href="#" className="footer-link">수선</a>
              <a href="#" className="footer-link">문의하기</a>
              <a href="#" className="footer-link">FAQ</a>
              <a href="#" className="footer-link">채용</a>
            </div>
          </div>
        </div>

        <div className="footer-middle-section">
          <div className="footer-middle-left">
            <div className="footer-social-section">
              <h4 className="footer-social-title">ALLBIRDS를 팔로우하세요!</h4>
              <p className="footer-social-text">
                최신 정보나 Allbirds 상품의 스냅샷 등을 보실 수 있습니다. 오! 물론 귀여운 양도 보실 수 있죠. #weareallbirds #올버즈
              </p>
              <div className="footer-social-icons">
                <a href="#" className="footer-social-icon" aria-label="Instagram">📷</a>
                <a href="#" className="footer-social-icon" aria-label="Facebook">f</a>
              </div>
            </div>
          </div>

          <div className="footer-middle-right">
            <div className="footer-bcorp-logo">
              <div className="footer-bcircle">B</div>
              <div className="footer-btext">
                <div className="footer-bcertified-text">Certified</div>
                <div>B Corporation</div>
              </div>
            </div>

            <div className="footer-company-info">
              (주)에프쥐대표 박세우<br />
              서울특별시 강남구 강남대로160길 45<br />
              통신판매업신고번호 2013-서울강남-04481<br />
              등록번호 148-81-03205<br />
              전화번호 070-4138-0128(수신자부담)<br />
              E-mail help@elg.earth
            </div>
          </div>
        </div>

        <div className="footer-bottom-section">
          <div className="footer-copyright">
            © 2025 EFG.COAll Rights Reserved. 이용약관 개인정보처리방침
          </div>
        </div>
      </footer>
      <button className="footer-scroll-top-button" onClick={scrollToTop} aria-label="맨 위로">
        ↑
      </button>
    </>
  );
}
