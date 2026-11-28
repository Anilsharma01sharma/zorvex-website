// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}

// Portfolio filters
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.project').forEach((p) => {
      p.classList.toggle('hidden', f !== 'all' && p.dataset.cat !== f);
    });
  });
});

// Footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Floating chat widget
const chatToggle = document.getElementById('chat-toggle');
const chatWidget = document.getElementById('chat-widget');
const chatOptions = document.getElementById('chat-options');
if (chatToggle && chatWidget && chatOptions) {
  chatToggle.addEventListener('click', () => {
    const open = !chatWidget.classList.contains('open');
    chatWidget.classList.toggle('open', open);
    chatOptions.hidden = !open;
    chatToggle.setAttribute('aria-expanded', open);
    chatToggle.setAttribute('aria-label', open ? 'Hide chat options' : 'Open chat options');
  });
}

// Count-up stats: numbers count from 1 to their final value when scrolled into view
(() => {
  const els = document.querySelectorAll('.stats strong, .result-card strong, .metric strong, .result-banner strong');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [];
  els.forEach((el) => {
    const raw = el.textContent.trim();
    const m = raw.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    if (!m) return;
    const [, prefix, num, suffix] = m;
    const target = parseFloat(num.replace(/,/g, ''));
    const decimals = (num.split('.')[1] || '').length;
    const commas = num.includes(',');
    items.push({ el, prefix, suffix, target, decimals, commas, raw });
  });
  if (!items.length || reduce || !('IntersectionObserver' in window)) return;
  const fmt = (v, it) => {
    let s = v.toFixed(it.decimals);
    if (it.commas) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: it.decimals, maximumFractionDigits: it.decimals });
    return it.prefix + s + it.suffix;
  };
  const run = (it) => {
    const start = Math.min(1, it.target), dur = 1800, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      it.el.textContent = p < 1 ? fmt(start + (it.target - start) * eased, it) : it.raw;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  items.forEach((it) => { it.el.textContent = fmt(Math.min(1, it.target), it); });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const it = items.find((i) => i.el === e.target);
      if (it) run(it);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  items.forEach((it) => io.observe(it.el));
})();


// Hero growth chart (switchable by result tiles)
(function(){
  const box=document.querySelector('.growth-chart');if(!box)return;
  const svg=box.querySelector('.gc-svg'),NS='http://www.w3.org/2000/svg';
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D={
    sales:{title:'E-commerce sales',now:'With us',was:'Before',labels:['M1','M2','M3','M4','M5','M6','M7'],
      a:[100,112,138,186,258,368,520],b:[100,98,103,99,104,101,100],fmt:v=>'+'+Math.round(v-100)+'%',
      pins:[[2,'CRO + PMax']]},
    traffic:{title:'Organic traffic',now:'This year',was:'Last year',labels:['J','F','M','A','M','J','J','A','S','O','N','D'],
      a:[100,108,118,132,150,172,196,222,252,288,322,360],b:[92,94,95,96,97,96,98,99,99,100,100,100],fmt:v=>'+'+Math.round(v-100)+'%',
      pins:[[2,'Tech fixes'],[6,'Content hub']]},
    roas:{title:'Meta retargeting ROAS',now:'Rebuilt',was:'Starting point',labels:['W1','W2','W3','W4','W5','W6','W7','W8'],
      a:[1.6,1.9,2.6,3.1,3.8,4.5,5.2,5.8],b:[1.6,1.6,1.6,1.6,1.6,1.6,1.6,1.6],fmt:v=>v.toFixed(1)+'x',
      pins:[[2,'New audiences']]}
  };
  const W=400,H=180,T=26,Bt=150,L=6,R=372;
  const el=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
  function smooth(pts){let d='M'+pts[0][0]+' '+pts[0][1];for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    d+=' C'+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+' '+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+' '+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+' '+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1);}return d;}
  function draw(key){
    const s=D[key];box.querySelector('.gc-title').textContent=s.title;box.querySelector('.gc-now-label').textContent=s.now;box.querySelector('.gc-was-label').textContent=s.was;
    [...svg.childNodes].forEach(n=>{if(n.nodeName!=='defs')svg.removeChild(n);});
    const all=s.a.concat(s.b),max=Math.max(...all)*1.04,min=Math.min(...all)*0.9,n=s.a.length;
    const x=i=>L+(R-L)*i/(n-1),y=v=>Bt-(Bt-T)*(v-min)/(max-min);
    const g=el('g',{'class':'gc-grid'},svg);for(let k=0;k<4;k++){const yy=T+(Bt-T)*k/3;el('line',{x1:0,x2:W,y1:yy,y2:yy},g);}
    s.labels.forEach((t,i)=>{if(n>8&&i%2)return;const tx=el('text',{x:x(i),y:H-8,'text-anchor':'middle'},svg);tx.textContent=t;});
    const pa=s.a.map((v,i)=>[x(i),y(v)]),pb=s.b.map((v,i)=>[x(i),y(v)]);
    el('path',{d:smooth(pb),fill:'none',stroke:'#A9B4C8','stroke-width':2,'stroke-dasharray':'5 5','stroke-linecap':'round'},svg);
    const area=el('path',{d:smooth(pa)+' L'+R+' '+Bt+' L'+L+' '+Bt+'Z',fill:'url(#gcFill)',opacity:0},svg);
    el('path',{d:smooth(pa),fill:'none',stroke:'#1F4FE0','stroke-width':7,opacity:.18,filter:'url(#gcGlow)'},svg);
    const line=el('path',{d:smooth(pa),fill:'none',stroke:'url(#gcStroke)','stroke-width':3.2,'stroke-linecap':'round','class':'gc-line'},svg);
    s.pins.forEach(([i,t])=>{const pg=el('g',{'class':'gc-pin'},svg),px=pa[i][0],py=pa[i][1],w=t.length*5.3+14;
      el('line',{x1:px,x2:px,y1:py-6,y2:Bt},pg);el('circle',{cx:px,cy:py,r:4,fill:'#fff',stroke:'#1F4FE0','stroke-width':2},pg);
      const bx=Math.min(Math.max(px-w/2,0),W-w);el('rect',{x:bx,y:py-30,width:w,height:18,rx:9},pg);const tt=el('text',{x:bx+w/2,y:py-18,'text-anchor':'middle'},pg);tt.textContent=t;});
    const e=pa[n-1],end=el('g',{},svg);
    el('circle',{cx:e[0],cy:e[1],r:5,fill:'#1F4FE0','class':'gc-ring'},end);el('circle',{cx:e[0],cy:e[1],r:5.5,fill:'#1F4FE0',stroke:'#fff','stroke-width':2.5},end);
    const label=s.fmt(s.a[n-1]),tw=label.length*7+16,tip=el('g',{'class':'gc-tip'},svg),tx0=Math.min(e[0]-tw/2,W-tw+20),ty0=Math.max(e[1]-36,-6);
    el('rect',{x:tx0,y:ty0,width:tw,height:22,rx:11},tip);const tl=el('text',{x:tx0+tw/2,y:ty0+15,'text-anchor':'middle'},tip);tl.textContent=label;
    if(reduce){area.setAttribute('opacity',1);return;}
    const len=line.getTotalLength();line.style.strokeDasharray=len;line.style.strokeDashoffset=len;
    [end,tip].concat([...svg.querySelectorAll('.gc-pin')]).forEach(n=>{n.style.opacity=0;n.style.transition='opacity .4s';});
    requestAnimationFrame(()=>{line.style.transition='stroke-dashoffset 1.4s cubic-bezier(.65,0,.35,1)';line.style.strokeDashoffset=0;area.style.transition='opacity .9s .6s';area.setAttribute('opacity',1);});
    setTimeout(()=>{svg.querySelectorAll('.gc-pin').forEach(n=>n.style.opacity=1);},700);
    setTimeout(()=>{end.style.opacity=1;tip.style.opacity=1;},1350);
  }
  const tabs=document.querySelectorAll('.hero-card .metric[data-series]');let cur='sales',timer;
  function pick(k,user){cur=k;tabs.forEach(t=>{const on=t.dataset.series===k;t.classList.toggle('is-active',on);t.setAttribute('aria-selected',on);});draw(k);if(user)clearInterval(timer);}
  tabs.forEach(t=>t.addEventListener('click',()=>pick(t.dataset.series,true)));
  const order=['sales','traffic','roas'];
  const start=()=>{pick('sales');if(!reduce)timer=setInterval(()=>pick(order[(order.indexOf(cur)+1)%3]),6000);};
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){start();io.disconnect();}},{threshold:.3});io.observe(box);}else start();
})();


// Client results: "View more" toggle and sparkline draw-in
(function(){
  const sec=document.getElementById('clients'),grid=document.getElementById('client-results'),btn=document.getElementById('more-results');
  if(!sec||!grid)return;sec.classList.add('rc-js');
  if(btn)btn.addEventListener('click',()=>{const open=grid.classList.toggle('open');btn.setAttribute('aria-expanded',open);btn.textContent=open?'Show fewer results':'View more results';if(open)grid.querySelectorAll('.rc').forEach(c=>c.classList.add('in'));});
  const cards=grid.querySelectorAll('.rc');
  if(!('IntersectionObserver' in window)){cards.forEach(c=>c.classList.add('in'));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.35});
  cards.forEach(c=>io.observe(c));
})();
