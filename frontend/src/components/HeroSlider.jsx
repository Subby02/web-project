import React, { useEffect, useMemo, useRef, useState } from 'react';
import './HeroSlider.css';

export default function HeroSlider(){
  const slides = useMemo(()=>[
    {
      img:'https://images.unsplash.com/photo-1520975922284-8b456906c813?q=80&w=1600&auto=format&fit=crop', 
      title:'WOOL CRUISER', 
      sub:'이탈리안 펠트 울, 가격은 가볍게.',
      colors: ['#d4a574', '#8b6f47', '#5a4a3a']
    },
    {
      img:'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop', 
      title:'Corduroy Slip-On', 
      sub:'시간이 지나도 좋은 코듀로이의 질감',
      colors: ['#c9a96b', '#8b7355', '#6b5d4a']
    },
    {
      img:'https://images.unsplash.com/photo-1504470695779-75300268aa0e?q=80&w=1600&auto=format&fit=crop', 
      title:'Cruiser Mid Explore', 
      sub:'어떤 곳에서든 흔들림 없는 편안함',
      colors: ['#b89d7a', '#8b6f5f', '#6b5547']
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

  return (
    <section className="hero-slider-wrap">
      <div 
        className="hero-slider-track" 
        style={{ '--slider-index': idx }}
      >
        {slides.map((s,i)=> (
          <div key={i} className="hero-slider-slide">
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
