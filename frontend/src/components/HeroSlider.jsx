import React, { useEffect, useMemo, useRef, useState } from 'react';
import './HeroSlider.css';

export default function HeroSlider(){
  const slides = useMemo(()=>[
    {img:'https://images.unsplash.com/photo-1520975922284-8b456906c813?q=80&w=1600&auto=format&fit=crop', title:'Wool Cruiser', sub:'이탈리안 펠트 울, 가격은 가볍게.'},
    {img:'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop', title:'Corduroy Slip-On', sub:'시간이 지나도 좋은 코듀로이의 질감'},
    {img:'https://images.unsplash.com/photo-1504470695779-75300268aa0e?q=80&w=1600&auto=format&fit=crop', title:'Cruiser Mid Explore', sub:'어떤 곳에서든 흔들림 없는 편안함'}
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
            <img src={s.img} alt={s.title} />
            <div>
              <h2>{s.title}</h2>
              <p>{s.sub}</p>
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
