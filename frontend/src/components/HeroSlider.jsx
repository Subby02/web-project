import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSlider.css';
import './BlackFridayBanner.css';

export default function HeroSlider(){
  const navigate = useNavigate();
  
  const slides = useMemo(()=>[
    {
      type: 'product',
      img:'https://images.unsplash.com/photo-1520975922284-8b456906c813?q=80&w=1600&auto=format&fit=crop', 
      title:'WOOL CRUISER', 
      sub:'이탈리안 펠트 울, 가격은 가볍게.',
      colors: ['#d4a574', '#8b6f47', '#5a4a3a']
    },
    {
      type: 'product',
      img:'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop', 
      title:'Corduroy Slip-On', 
      sub:'시간이 지나도 좋은 코듀로이의 질감',
      colors: ['#c9a96b', '#8b7355', '#6b5d4a']
    },
    {
      type: 'blackfriday'
    }
  ], []);

  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const next = ()=> setIdx(i => (i+1)%slides.length);
  const prev = ()=> setIdx(i => (i-1+slides.length)%slides.length);

  useEffect(()=>{
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [idx, slides.length]);

  const handleMenSale = () => {
    navigate('/store');
  };

  const handleWomenSale = () => {
    navigate('/store');
  };

  return (
    <section className="hero-slider-wrap">
      <div 
        className="hero-slider-track" 
        style={{ '--slider-index': idx }}
      >
        {slides.map((s,i)=> (
          <div key={i} className="hero-slider-slide">
            {s.type === 'blackfriday' ? (
              <div className="black-friday-banner black-friday-slide">
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
              </div>
            ) : (
              <div className="hero-slider-content">
                <div className="hero-slider-info">
                  <h2>{s.title}</h2>
                  <p>{s.sub}</p>
                  <button className="hero-slider-more-btn">MORE</button>
                </div>
                <div className="hero-slider-product">
                  <div className="hero-slider-color-swatches">
                    {s.colors.map((color, ci) => (
                      <div key={ci} className="hero-slider-swatch" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className="hero-slider-image-wrapper">
                    <img src={s.img} alt={s.title} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="hero-slider-arrow left" onClick={prev}>‹</button>
      <button className="hero-slider-arrow right" onClick={next}>›</button>
      <div className="hero-slider-dots">
        {slides.map((_,i)=> (
          <button 
            key={i} 
            className={`hero-slider-dot ${i===idx ? 'active' : ''}`} 
            onClick={()=>setIdx(i)} 
          />
        ))}
      </div>
    </section>
  );
}
