import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const Wrap = styled.section`
  position:relative; overflow:hidden; max-width:1280px; margin:0 auto; border-radius:8px;
`;

const Track = styled.div`
  display:flex; transition:transform .6s ease; transform:translateX(${p=>`-${p.idx*100}%`});
`;

const Slide = styled.div`
  min-width:100%; height:520px; background:#eee; position:relative;
  > img { width:100%; height:100%; object-fit:cover; }
  > div { position:absolute; left:64px; bottom:64px; color:#fff; }
  h2 { font-size:32px; margin:0 0 8px; }
`;

const Arrow = styled.button`
  position:absolute; top:50%; transform:translateY(-50%); border:none; background:rgba(0,0,0,.4); color:#fff; width:36px; height:36px; border-radius:18px;
  ${p=>p.left? 'left:16px;' : 'right:16px;'}
`;

const Dots = styled.div`
  position:absolute; left:0; right:0; bottom:16px; display:flex; justify-content:center; gap:8px;
`;
const Dot = styled.button`
  width:8px; height:8px; border-radius:4px; border:none; background:${p=>p.active?'#111':'#bbb'};
`;

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
    <Wrap>
      <Track idx={idx}>
        {slides.map((s,i)=> (
          <Slide key={i}>
            <img src={s.img} alt={s.title} />
            <div>
              <h2>{s.title}</h2>
              <p>{s.sub}</p>
            </div>
          </Slide>
        ))}
      </Track>
      <Arrow left onClick={prev}>‹</Arrow>
      <Arrow onClick={next}>›</Arrow>
      <Dots>
        {slides.map((_,i)=> (
          <Dot key={i} active={i===idx} onClick={()=>setIdx(i)} />
        ))}
      </Dots>
    </Wrap>
  );
}




