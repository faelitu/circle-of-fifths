const KEYS = [
  { major:'C',      minor:'Am',  sig:'∅',    hue:198 },
  { major:'G',      minor:'Em',  sig:'1♯',   hue:158 },
  { major:'D',      minor:'Bm',  sig:'2♯',   hue:112 },
  { major:'A',      minor:'F♯m', sig:'3♯',   hue:74  },
  { major:'E',      minor:'C♯m', sig:'4♯',   hue:40  },
  { major:'B',      minor:'G♯m', sig:'5♯',   hue:18  },
  { major:'F♯/G♭', minor:'E♭m', sig:'6♯/♭', hue:345 },
  { major:'D♭',     minor:'B♭m', sig:'5♭',   hue:302 },
  { major:'A♭',     minor:'Fm',  sig:'4♭',   hue:264 },
  { major:'E♭',     minor:'Cm',  sig:'3♭',   hue:233 },
  { major:'B♭',     minor:'Gm',  sig:'2♭',   hue:216 },
  { major:'F',      minor:'Dm',  sig:'1♭',   hue:207 },
];
const SCALES = [
  ['C','D','E','F','G','A','B'],
  ['G','A','B','C','D','E','F♯'],
  ['D','E','F♯','G','A','B','C♯'],
  ['A','B','C♯','D','E','F♯','G♯'],
  ['E','F♯','G♯','A','B','C♯','D♯'],
  ['B','C♯','D♯','E','F♯','G♯','A♯'],
  ['F♯','G♯','A♯','B','C♯','D♯','E♯'],
  ['D♭','E♭','F','G♭','A♭','B♭','C'],
  ['A♭','B♭','C','D♭','E♭','F','G'],
  ['E♭','F','G','A♭','B♭','C','D'],
  ['B♭','C','D','E♭','F','G','A'],
  ['F','G','A','B♭','C','D','E'],
];
const MODES = ['Iônico','Dórico','Frígio','Lídio','Mixolídio','Eólico','Lócrio'];
const SFXS  = ['','m','m','','','m','°'];
const QUALS = ['Maior','menor','menor','Maior','Maior','menor','dim'];
const ROMAN = ['I','II','III','IV','V','VI','VII'];
const ONE45 = [0,3,4];
const FUNCS = ['Tônica','Subdominante','Dominante'];

/* ── Canvas ────────────────────────────── */
const cvs = document.getElementById('c');
const ctx = cvs.getContext('2d');
const infoEl = document.getElementById('info');

const SIZE = Math.min(460, window.innerWidth - 40, window.innerHeight - 100);
cvs.width = SIZE; cvs.height = SIZE;
const CX = SIZE/2, CY = SIZE/2, SC = SIZE/460;

const ro=212*SC, rsi=178*SC, rmo=178*SC, rmi=123*SC;
const rno=123*SC, rni=78*SC,  rc=78*SC;
const N=12, SEG=(2*Math.PI)/N;

let rot=0, dragging=false, lastAng=0, vel=0, lastT=0;
let raf=null, topKey=0, lastTopKey=-1;

function sector(r1,r2,a1,a2){
  ctx.beginPath();
  ctx.arc(CX,CY,r2,a1,a2);
  ctx.arc(CX,CY,r1,a2,a1,true);
  ctx.closePath();
}

function tdir(mid){
  const n=((mid%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
  return (n>Math.PI/2&&n<3*Math.PI/2)?mid-Math.PI/2:mid+Math.PI/2;
}

function txt(t,r,mid,font,color){
  ctx.save();
  ctx.translate(CX+r*Math.cos(mid),CY+r*Math.sin(mid));
  ctx.rotate(tdir(mid));
  ctx.font=font; ctx.fillStyle=color;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(t,0,0); ctx.restore();
}

function draw(){
  ctx.clearRect(0,0,SIZE,SIZE);
  for(let i=0;i<N;i++){
    const k=KEYS[i],h=k.hue;
    const a1=rot+i*SEG-SEG/2-Math.PI/2, a2=a1+SEG, mid=a1+SEG/2;
    const act=(i===topKey);
    const sp=act?`hsla(${h},55%,42%,0.7)`:`hsla(${h},35%,22%,0.34)`;

    sector(rsi,ro,a1,a2);
    ctx.fillStyle=act?`hsla(${h},40%,12%,1)`:`hsla(${h},22%,7%,1)`;
    ctx.fill(); ctx.strokeStyle=sp; ctx.lineWidth=0.65; ctx.stroke();
    txt(k.sig,(rsi+ro)/2,mid,`${10*SC}px 'Cormorant Garamond',serif`,
      act?`hsla(${h},65%,75%,0.9)`:`hsla(${h},28%,50%,0.46)`);

    sector(rmi,rmo,a1,a2);
    const mg=ctx.createRadialGradient(CX,CY,rmi,CX,CY,rmo);
    act?(mg.addColorStop(0,`hsla(${h},52%,16%,1)`),mg.addColorStop(1,`hsla(${h},62%,22%,1)`))
       :(mg.addColorStop(0,`hsla(${h},28%,10%,1)`),mg.addColorStop(1,`hsla(${h},38%,14%,1)`));
    ctx.fillStyle=mg; ctx.fill(); ctx.strokeStyle=sp; ctx.lineWidth=0.65; ctx.stroke();

    const majR=(rmi+rmo)/2;
    const majC=act?`hsla(${h},85%,94%,1)`:`hsla(${h},55%,82%,0.9)`;
    if(k.major.includes('/')){
      const [p0,p1]=k.major.split('/');
      ctx.save();
      ctx.translate(CX+majR*Math.cos(mid),CY+majR*Math.sin(mid));
      ctx.rotate(tdir(mid)); ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.font=`600 ${15*SC}px 'Cinzel',serif`; ctx.fillStyle=majC;
      ctx.fillText(p0,0,-7*SC);
      ctx.font=`${11*SC}px 'Cinzel',serif`;
      ctx.fillStyle=act?`hsla(${h},60%,80%,0.8)`:`hsla(${h},38%,68%,0.7)`;
      ctx.fillText(p1,0,7*SC); ctx.restore();
    } else {
      txt(k.major,majR,mid,`600 ${19*SC}px 'Cinzel',serif`,majC);
    }

    sector(rni,rno,a1,a2);
    const ng=ctx.createRadialGradient(CX,CY,rni,CX,CY,rno);
    act?(ng.addColorStop(0,`hsla(${h},32%,13%,1)`),ng.addColorStop(1,`hsla(${h},42%,17%,1)`))
       :(ng.addColorStop(0,`hsla(${h},14%,7%,1)`), ng.addColorStop(1,`hsla(${h},22%,10%,1)`));
    ctx.fillStyle=ng; ctx.fill(); ctx.strokeStyle=sp; ctx.lineWidth=0.65; ctx.stroke();
    txt(k.minor,(rni+rno)/2,mid,`${11*SC}px 'Cormorant Garamond',serif`,
      act?`hsla(${h},60%,84%,0.95)`:`hsla(${h},30%,60%,0.63)`);
  }

  const cg=ctx.createRadialGradient(CX,CY,0,CX,CY,rc);
  cg.addColorStop(0,'#0f1020'); cg.addColorStop(1,'#08090f');
  ctx.beginPath(); ctx.arc(CX,CY,rc,0,2*Math.PI);
  ctx.fillStyle=cg; ctx.fill();
  ctx.strokeStyle='rgba(175,158,240,0.13)'; ctx.lineWidth=1; ctx.stroke();
  ctx.beginPath(); ctx.arc(CX,CY,rc-10*SC,0,2*Math.PI);
  ctx.strokeStyle='rgba(175,158,240,0.05)'; ctx.lineWidth=0.5; ctx.stroke();
  ctx.font=`italic ${8*SC}px 'Cormorant Garamond',serif`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(190,178,248,0.22)';
  ctx.fillText('↑  quintas',CX,CY-9*SC);
  ctx.fillText('quartas  ↓',CX,CY+9*SC);

  ctx.beginPath(); ctx.arc(CX,CY,ro+3*SC,0,2*Math.PI);
  ctx.strokeStyle='rgba(175,158,240,0.06)'; ctx.lineWidth=1; ctx.stroke();
  const ty=CY-ro-5*SC;
  ctx.beginPath();
  ctx.moveTo(CX,ty+11*SC); ctx.lineTo(CX-4*SC,ty+3*SC); ctx.lineTo(CX+4*SC,ty+3*SC);
  ctx.closePath(); ctx.fillStyle='rgba(205,190,255,0.5)'; ctx.fill();
}

/* ── Panel update ──────────────────────── */
function updatePanel(idx, anim){
  const panel=document.getElementById('panel');
  const k=KEYS[idx], sc=SCALES[idx], h=k.hue;

  function render(){
    document.getElementById('pk-name').textContent=k.major;
    document.getElementById('pk-name').style.color=`hsla(${h},78%,88%,1)`;
    document.getElementById('pk-minor').textContent=`relativa menor: ${k.minor}`;
    document.getElementById('pk-sig').textContent=`Armadura: ${k.sig}`;

    document.getElementById('scale-strip').innerHTML=sc.map((n,i)=>
      `<div class="nc ${ONE45.includes(i)?'hi':''}">
        <span class="deg">${ROMAN[i]}</span>
        <span class="nt">${n}</span>
      </div>`).join('');

    document.getElementById('chord-table').innerHTML=sc.map((n,i)=>
      `<tr class="${ONE45.includes(i)?'hi':''}">
        <td class="t-r">${ROMAN[i]}</td>
        <td class="t-c">${n}${SFXS[i]}</td>
        <td class="t-q">${QUALS[i]}</td>
        <td class="t-m">${MODES[i]}</td>
      </tr>`).join('');

    document.getElementById('prog-row').innerHTML=ONE45.map((di,fi)=>
      `<div class="pc">
        <span class="pc-r">${ROMAN[di]}</span>
        <span class="pc-c">${sc[di]}${SFXS[di]}</span>
        <span class="pc-f">${FUNCS[fi]}</span>
      </div>`).join('');
  }

  if(anim){
    panel.style.transition='none';
    panel.style.opacity='0';
    panel.style.transform='translateY(5px)';
    setTimeout(()=>{
      render();
      panel.style.transition='opacity 0.22s ease, transform 0.22s ease';
      panel.style.opacity='1'; panel.style.transform='translateY(0)';
      setTimeout(()=>{ panel.style.transition=''; },300);
    },90);
  } else { render(); }
}

/* ── State ─────────────────────────────── */
function updateTop(){
  let raw=((-rot/SEG)%N+N)%N;
  topKey=Math.round(raw)%N;
  const k=KEYS[topKey];
  infoEl.textContent=`${k.major} maior  ·  ${k.minor}  ·  ${k.sig}`;
  if(topKey!==lastTopKey){ lastTopKey=topKey; return true; }
  return false;
}

function startInertia(){
  function step(){
    if(Math.abs(vel)<0.00018){ snapNearest(); return; }
    rot+=vel; vel*=0.965; updateTop(); draw();
    raf=requestAnimationFrame(step);
  }
  raf=requestAnimationFrame(step);
}

function snapNearest(){
  const target=Math.round(rot/SEG)*SEG;
  function step(){
    const diff=target-rot;
    if(Math.abs(diff)<0.0008){
      rot=target; const changed=updateTop(); draw(); updatePanel(topKey,changed); return;
    }
    rot+=diff*0.16; updateTop(); draw();
    raf=requestAnimationFrame(step);
  }
  raf=requestAnimationFrame(step);
}

/* ── Interaction ───────────────────────── */
const getA=(x,y)=>Math.atan2(y-CY,x-CX);

function onDown(x,y){
  if(raf){ cancelAnimationFrame(raf); raf=null; }
  dragging=true; lastAng=getA(x,y); lastT=performance.now(); vel=0;
  cvs.classList.add('dragging');
}
function onMove(x,y){
  if(!dragging) return;
  const a=getA(x,y); let d=a-lastAng;
  if(d>Math.PI) d-=2*Math.PI; if(d<-Math.PI) d+=2*Math.PI;
  const now=performance.now(), dt=Math.max(now-lastT,1);
  vel=d/dt*16; rot+=d; lastAng=a; lastT=now;
  updateTop(); draw();
}
function onUp(){
  if(!dragging) return;
  dragging=false; cvs.classList.remove('dragging'); startInertia();
}

cvs.addEventListener('mousedown',e=>onDown(e.offsetX,e.offsetY));
window.addEventListener('mousemove',e=>{
  if(!dragging) return;
  const r=cvs.getBoundingClientRect();
  onMove(e.clientX-r.left,e.clientY-r.top);
});
window.addEventListener('mouseup',onUp);

cvs.addEventListener('touchstart',e=>{
  e.preventDefault();
  const r=cvs.getBoundingClientRect(),t=e.touches[0];
  onDown(t.clientX-r.left,t.clientY-r.top);
},{passive:false});
cvs.addEventListener('touchmove',e=>{
  e.preventDefault();
  const r=cvs.getBoundingClientRect(),t=e.touches[0];
  onMove(t.clientX-r.left,t.clientY-r.top);
},{passive:false});
cvs.addEventListener('touchend',onUp);

document.addEventListener('keydown',e=>{
  const dir=e.key==='ArrowRight'||e.key==='ArrowDown'?-1
           :e.key==='ArrowLeft' ||e.key==='ArrowUp'  ? 1:0;
  if(!dir) return;
  if(raf) cancelAnimationFrame(raf);
  rot+=dir*SEG; updateTop(); draw(); snapNearest();
});

/* ── Init ──────────────────────────────── */
updateTop(); draw(); updatePanel(topKey,false);
