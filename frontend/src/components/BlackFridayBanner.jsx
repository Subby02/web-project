import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BlackFridayBanner.css';

export default function BlackFridayBanner() {
  const navigate = useNavigate();

  const handleMenSale = () => {
    navigate('/store');
  };

  const handleWomenSale = () => {
    navigate('/store');
  };

  return (
    <section className="black-friday-banner">
      <div className="black-friday-content">
        <div className="black-friday-text-section">
          <h2 className="black-friday-title">슈퍼 블랙 프라이데이</h2>
          <p className="black-friday-subtitle">연중 최대 혜택. UP TO 50% OFF.</p>
          <div className="black-friday-buttons">
            <button className="black-friday-btn" onClick={handleMenSale}>
              남성 세일
            </button>
            <button className="black-friday-btn" onClick={handleWomenSale}>
              여성 세일
            </button>
          </div>
        </div>
        <div className="black-friday-visual-section">
          <div className="black-friday-letters">
            <span className="bf-letter bf-letter-1">B</span>
            <span className="bf-letter bf-letter-2">L</span>
            <span className="bf-letter bf-letter-3">A</span>
            <span className="bf-letter bf-letter-4">C</span>
            <span className="bf-letter bf-letter-5">K</span>
            <span className="bf-letter bf-letter-6">F</span>
            <span className="bf-letter bf-letter-7">R</span>
            <span className="bf-letter bf-letter-8">I</span>
            <span className="bf-letter bf-letter-9">D</span>
            <span className="bf-letter bf-letter-10">A</span>
            <span className="bf-letter bf-letter-11">Y</span>
          </div>
        </div>
      </div>
    </section>
  );
}

