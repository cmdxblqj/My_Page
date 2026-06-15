/* ═══════════════════════════════════ ORBITAL CONFIG ═══════════════════════════════════ */
const CANVAS_W=1920,CANVAS_H=1080,CENTER_X=CANVAS_W*0.15,CENTER_Y=CANVAS_H*0.82,RADIUS=CANVAS_W*0.65,BTN_SIZE=420,FADE_MARGIN=220,ANGLE_SENSITIVITY=0.08,LERP_FACTOR=0.12,INITIAL_ANGLE=60,SNAP_EFFECTIVE_ANGLE=20,SNAP_DURATION=1000,SNAP_COOLDOWN=1500,SCROLL_STOP_DELAY=450;
const BUTTON_DEFS=[{dataId:1,img:'but4.webp',baseAngle:0},{dataId:2,img:'but3.webp',baseAngle:90},{dataId:3,img:'but2.webp',baseAngle:180},{dataId:4,img:'but1.webp',baseAngle:270}];
let targetAngle=INITIAL_ANGLE,currentAngle=INITIAL_ANGLE,btnDataList=[],hasScrolled=false,lastScrollTime=0,lastScrollDir=0,scrollStopTimer=null,lastSnapTime=0,snapActive=false,snapStartAngle=0,snapTargetAngleVal=0,snapStartTime=0;
const appWrapper=document.getElementById('appWrapper'),buttonsLayer=document.getElementById('buttonsLayer'),scrollHint=document.getElementById('scrollHint'),bgMusic=document.getElementById('bgMusic'),angleDisplay=document.getElementById('angleDisplay'),escButton=document.getElementById('escButton'),subpageOverlay=document.getElementById('subpageOverlay'),subpage2Overlay=document.getElementById('subpage2Overlay'),subpage3Overlay=document.getElementById('subpage3Overlay'),subpage4Overlay=document.getElementById('subpage4Overlay'),waterCanvas=document.getElementById('waterCanvas'),popOverlay=document.getElementById('popTransitionOverlay');

/* ═══════════════════════════════════ ORBITAL BUTTONS ═══════════════════════════════════ */
function buildButtons(){const N='http://www.w3.org/2000/svg';BUTTON_DEFS.forEach(d=>{const w=document.createElement('div');w.className='btn-wrapper';const s=document.createElementNS(N,'svg');s.setAttribute('class','btn-orbit');s.setAttribute('data-id',String(d.dataId));s.setAttribute('viewBox','0 0 800 800');const i=document.createElementNS(N,'image');i.setAttribute('href',d.img);i.setAttribute('width','800');i.setAttribute('height','800');i.setAttribute('preserveAspectRatio','xMidYMid meet');i.style.pointerEvents='inherit';s.appendChild(i);w.appendChild(s);buttonsLayer.appendChild(w);
s.addEventListener('click',function(){if(d.dataId===4)triggerWaterTransition('toPersona');if(d.dataId===3)triggerPopTransition('toArchive');if(d.dataId===2)triggerCurtainTransition('toCodex');if(d.dataId===1)triggerDiagTransition('toGallery');s.dispatchEvent(new CustomEvent('orbital-button-click',{bubbles:true,detail:{id:d.dataId,image:d.img}}));});
btnDataList.push({wrapper:w,svg:s,baseAngle:d.baseAngle,dataId:d.dataId,img:d.img});});}

function updateAllButtons(a){for(const b of btnDataList){const e=((b.baseAngle+a)%360+360)%360,r=e*Math.PI/180,cx=CENTER_X+RADIUS*Math.cos(r),cy=CENTER_Y-RADIUS*Math.sin(r);b.wrapper.style.left=(cx-BTN_SIZE/2)+'px';b.wrapper.style.top=(cy-BTN_SIZE/2)+'px';const m=FADE_MARGIN,o=Math.max(0,Math.min(1,Math.min(Math.min(1,Math.max(0,(cx+m)/m)),Math.min(1,Math.max(0,(CANVAS_W+m-cx)/m)),Math.min(1,Math.max(0,(cy+m)/m)),Math.min(1,Math.max(0,(CANVAS_H+m-cy)/m)))));b.svg.style.opacity=o;b.svg.style.pointerEvents=(currentPage!=='orbital'||o<0.05)?'none':'visiblePainted';b.svg.classList.toggle('idle-breathing',o>0.6);}const d=Math.round(((a%360)+360)%360);if(angleDisplay)angleDisplay.textContent=String(d).padStart(3,'0')+'°';}

/* ═══════════════════════════════════ SNAP ═══════════════════════════════════ */
const SNAP_THRESHOLD=5;
function findNearestSnap(ref){let best=null,bestDist=Infinity;
for(const b of btnDataList){const base=SNAP_EFFECTIVE_ANGLE-b.baseAngle;
let t=base;while(t>ref+400)t-=360;while(t<ref-400)t+=360;
[t,t+360,t-360].forEach(c=>{const d=Math.abs(c-ref);if(d<bestDist){bestDist=d;best=c;}});
return best;}}
function findSnapTarget(d){let best=null,bestDist=Infinity;const ref=currentAngle;
for(const b of btnDataList){const base=SNAP_EFFECTIVE_ANGLE-b.baseAngle;
let t=base;while(t>ref+400)t-=360;while(t<ref-400)t+=360;
if(d>0){while(t<=ref)t+=360;}else{while(t>=ref)t-=360;}
const dist=Math.abs(t-ref);if(dist<bestDist){bestDist=dist;best=t;}}
if(best===null){best=findNearestSnap(ref);}
return best;}
const STABLE_ORDER=[0,3,2,1]; // Gallery→Persona→Archive→Codex (clockwise stable order)
function getButtonIndexAtStable(){let best=null,bestDist=Infinity;
for(let i=0;i<btnDataList.length;i++){const pos=((btnDataList[i].baseAngle+currentAngle)%360+360)%360;
const d=Math.abs(pos-SNAP_EFFECTIVE_ANGLE);if(d<bestDist){bestDist=d;best=i;}}
return STABLE_ORDER.indexOf(best);}
function snapToButton(orderIdx,dir){const realIdx=STABLE_ORDER[orderIdx];const b=btnDataList[realIdx];
let t=SNAP_EFFECTIVE_ANGLE-b.baseAngle;
while(t>currentAngle+400)t-=360;while(t<currentAngle-400)t+=360;
if(dir>0){while(t<=currentAngle)t+=360;}else{while(t>=currentAngle)t-=360;}
triggerSnap(t);}
function triggerSnap(t){if(!t&&t!==0)return;snapActive=true;snapStartAngle=currentAngle;snapTargetAngleVal=t;snapStartTime=performance.now();lastSnapTime=performance.now();}
function cancelSnap(){if(!snapActive)return;snapActive=false;targetAngle=currentAngle;}
function scheduleSnapCheck(){clearTimeout(scrollStopTimer);scrollStopTimer=setTimeout(()=>{if(snapActive)return;
const nearest=findNearestSnap(currentAngle);const distToNearest=nearest!==null?Math.abs(nearest-currentAngle):Infinity;
if(distToNearest<=SNAP_THRESHOLD&&nearest!==null){triggerSnap(nearest);}
else{if(performance.now()-lastSnapTime<SNAP_COOLDOWN)return;
const t=findSnapTarget(lastScrollDir);if(t!==null)triggerSnap(t);}
},SCROLL_STOP_DELAY);}

/* ═══════════════════════════════════ SCROLL HINT ═══════════════════════════════════ */
function revealScrollHint(){if(scrollHint)scrollHint.classList.add('reveal');}
function dismissScrollHint(){if(!scrollHint||hasScrolled)return;hasScrolled=true;scrollHint.classList.remove('reveal');scrollHint.classList.add('dismiss');setTimeout(()=>{if(scrollHint.parentNode)scrollHint.parentNode.removeChild(scrollHint);},1100);}

/* ═══════════════════════════════════ ORBITAL ANIM LOOP ═══════════════════════════════════ */
function orbitalAnimate(ts){if(snapActive){const e=ts-snapStartTime,p=Math.min(1,e/SNAP_DURATION),v=1-Math.pow(1-p,5);currentAngle=snapStartAngle+(snapTargetAngleVal-snapStartAngle)*v;if(p>=1){currentAngle=snapTargetAngleVal;targetAngle=snapTargetAngleVal;snapActive=false;}}else{currentAngle+=(targetAngle-currentAngle)*LERP_FACTOR;if(Math.abs(targetAngle-currentAngle)<0.001)currentAngle=targetAngle;}updateAllButtons(currentAngle);requestAnimationFrame(orbitalAnimate);}

/* ═══════════════════════════════════ INPUT HANDLERS ═══════════════════════════════════ */
function initScrollHandler(){window.addEventListener('wheel',function(e){if(currentPage!=='orbital')return;e.preventDefault();if(!hasScrolled)dismissScrollHint();cancelSnap();const newDir=e.deltaY>0?1:-1;lastScrollDir=newDir;lastScrollTime=performance.now();targetAngle+=e.deltaY*ANGLE_SENSITIVITY;scheduleSnapCheck();},{passive:false});}
function initKeyboardHandler(){window.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();if(currentPage==='persona')triggerWaterTransition('toOrbital');else if(currentPage==='archive')triggerPopTransition('toOrbital');else if(currentPage==='codex')triggerCurtainTransition('toOrbital');else if(currentPage==='gallery')triggerDiagTransition('toOrbital');return;}if(currentPage!=='orbital')return;if(e.key==='ArrowDown'){e.preventDefault();if(!hasScrolled)dismissScrollHint();cancelSnap();const idx=getButtonIndexAtStable();snapToButton((idx+1)%STABLE_ORDER.length,1);}else if(e.key==='ArrowUp'){e.preventDefault();if(!hasScrolled)dismissScrollHint();cancelSnap();const idx=getButtonIndexAtStable();snapToButton((idx-1+STABLE_ORDER.length)%STABLE_ORDER.length,-1);}});}
function initTouchHandler(){let tY=0;window.addEventListener('touchstart',function(e){tY=e.touches[0].clientY;},{passive:true});window.addEventListener('touchmove',function(e){if(currentPage!=='orbital')return;const dy=tY-e.touches[0].clientY;tY=e.touches[0].clientY;if(!hasScrolled&&Math.abs(dy)>2)dismissScrollHint();cancelSnap();const newDir=dy>0?1:-1;lastScrollDir=newDir;targetAngle+=dy*ANGLE_SENSITIVITY*0.6;scheduleSnapCheck();},{passive:true});window.addEventListener('touchend',function(){if(currentPage!=='orbital')return;scheduleSnapCheck();},{passive:true});}
function applyScale(){if(!appWrapper)return;const s=Math.min(window.innerWidth/CANVAS_W,window.innerHeight/CANVAS_H);appWrapper.style.transform=`translate(-50%,-50%) scale(${s})`;}
function initResizeHandler(){let t;window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(applyScale,80);});window.addEventListener('orientationchange',()=>{setTimeout(applyScale,300);});}

/* ═══════════════════════════════════ MP3 PLAYER ═══════════════════════════════════ */
// Use auto-generated playlist from data.js if available, otherwise fallback
if(typeof AUDIO_PLAYLIST==='undefined'){var AUDIO_PLAYLIST=[
  {title:'Fabulous',artist:'BLU-SWING',src:'audio/BLU-SWING - Fabulous.mp3'},
  {title:"I Don't Want To Set The World On Fire",artist:'The Ink Spot',src:'audio/I Don\'t Want To Set The World On Fire-The Ink Spot.mp3'}
];}
let musicPlaying=false,currentTrackIdx=0;
const mp3Player=document.getElementById('mp3Player'),mp3PlayBtn=document.getElementById('mp3Play'),
  mp3PrevBtn=document.getElementById('mp3Prev'),mp3NextBtn=document.getElementById('mp3Next'),
  mp3TrackTitle=document.getElementById('mp3TrackTitle'),mp3TrackArtist=document.getElementById('mp3TrackArtist'),
  mp3TrackPos=document.getElementById('mp3TrackPos');
function updateMp3Info(){const t=AUDIO_PLAYLIST[currentTrackIdx];if(!t)return;
mp3TrackTitle.textContent=t.title;mp3TrackArtist.textContent=t.artist;
mp3TrackPos.textContent='TRACK '+(currentTrackIdx+1)+'/'+AUDIO_PLAYLIST.length;}
function loadTrack(idx){currentTrackIdx=((idx%AUDIO_PLAYLIST.length)+AUDIO_PLAYLIST.length)%AUDIO_PLAYLIST.length;
const t=AUDIO_PLAYLIST[currentTrackIdx];bgMusic.querySelector('source').src=t.src;bgMusic.load();updateMp3Info();
if(musicPlaying){bgMusic.play().catch(()=>{setMp3Playing(false);});}}
function setMp3Playing(p){musicPlaying=p;
if(p){mp3Player.classList.add('playing');}else{mp3Player.classList.remove('playing');}}
function togglePlay(){if(musicPlaying){bgMusic.pause();setMp3Playing(false);}else{
bgMusic.play().then(()=>setMp3Playing(true)).catch(()=>{setMp3Playing(true);
setTimeout(()=>setMp3Playing(false),1500);});}}
function playPrev(){loadTrack(currentTrackIdx-1);}
function playNext(){loadTrack(currentTrackIdx+1);}
function initMusicControl(){
if(!mp3PlayBtn||!bgMusic)return;
mp3PlayBtn.addEventListener('click',e=>{e.stopPropagation();togglePlay();});
mp3PrevBtn.addEventListener('click',e=>{e.stopPropagation();playPrev();});
mp3NextBtn.addEventListener('click',e=>{e.stopPropagation();playNext();});
bgMusic.addEventListener('ended',()=>{playNext();});
bgMusic.addEventListener('play',()=>setMp3Playing(true));
bgMusic.addEventListener('pause',()=>{if(!bgMusic.ended)setMp3Playing(false);});
window.addEventListener('keydown',function(e){
if((e.key==='m'||e.key==='M')&&document.activeElement===document.body)togglePlay();
if(e.key==='ArrowLeft'&&e.ctrlKey&&document.activeElement===document.body){e.preventDefault();playPrev();}
if(e.key==='ArrowRight'&&e.ctrlKey&&document.activeElement===document.body){e.preventDefault();playNext();}
});
updateMp3Info();setMp3Playing(false);
}

/* ═══════════════════════════════════ ESC BUTTON ═══════════════════════════════════ */
function initEscButton(){if(!escButton)return;escButton.addEventListener('click',function(e){e.stopPropagation();if(currentPage==='persona')triggerWaterTransition('toOrbital');else if(currentPage==='archive')triggerPopTransition('toOrbital');else if(currentPage==='codex')triggerCurtainTransition('toOrbital');else if(currentPage==='gallery')triggerDiagTransition('toOrbital');});}

/* ═══════════════════════════════════ UNIFIED PAGE-READY CHECK ═══════════════════════════════════ */
const pageReadyFlags={orbital:true,persona:false,archive:false,codex:false,gallery:false};
function setPageReady(name){pageReadyFlags[name]=true;}
function waitForPageReady(name,maxWait=5000){
if(pageReadyFlags[name])return Promise.resolve(true);
const start=performance.now();
return new Promise(resolve=>{
function check(){if(pageReadyFlags[name]){resolve(true);return;}if(performance.now()-start>maxWait){resolve(false);return;}requestAnimationFrame(check);}
check();
});}

/* ═══════════════════════════════════ PAGE STATE ═══════════════════════════════════ */
let currentPage='orbital';
function hideAllSubpages(){subpageOverlay.style.transition='none';subpageOverlay.classList.remove('active');subpageOverlay.style.opacity='0';subpage2Overlay.style.transition='none';subpage2Overlay.classList.remove('active');subpage2Overlay.style.opacity='0';subpage3Overlay.style.transition='none';subpage3Overlay.classList.remove('active');subpage3Overlay.style.opacity='0';subpage4Overlay.style.transition='none';subpage4Overlay.classList.remove('active');subpage4Overlay.style.opacity='0';}
function resetSubpageState(){
if(currentPage==='archive'){if(archiveState.isReaderOpen)closeArchiveReader();
if(searchInput){searchInput.value='';searchQuery='';updateSearchClear();}
archiveState.articles=sortByDate(STATIC_ARTICLES);renderArticleButtons(archiveState.articles);
archiveState.activeArticleId=null;}
else if(currentPage==='codex'){if(codexState.isReaderOpen)closeCodexReader();
if(searchInput){searchInput.value='';searchQuery='';updateSearchClear();}
codexState.articles=sortByDate(STATIC_CODEX);renderCodexButtons();
codexState.activeId=null;}
else if(currentPage==='gallery'){if(galleryState.isOpen)closeLightbox4();
if(searchInput){searchInput.value='';searchQuery='';updateSearchClear();}}
else if(currentPage==='persona'){subpageOverlay.scrollTop=0;}}
function showOrbital(){resetSubpageState();currentPage='orbital';hideAllSubpages();hideSearchBar();appWrapper.classList.remove('hidden');appWrapper.classList.add('visible');waterCanvas.style.display='';if(escButton)escButton.querySelector('.esc-btn').classList.add('disabled');applyScale();window._cmShow();if(window._cmSetZ)window._cmSetZ('255');document.body.appendChild(document.getElementById('cloudMistCanvas'));requestAnimationFrame(()=>{subpageOverlay.style.transition='';subpage2Overlay.style.transition='';subpage3Overlay.style.transition='';subpage4Overlay.style.transition='';});}
function showPersona(){currentPage='persona';appWrapper.classList.add('hidden');hideAllSubpages();hideSearchBar();subpageOverlay.style.transition='none';subpageOverlay.classList.add('active');subpageOverlay.style.opacity='1';waterCanvas.style.display='';if(escButton)escButton.querySelector('.esc-btn').classList.remove('disabled');window._cmHide();updatePersonaSections();requestAnimationFrame(()=>{subpageOverlay.style.transition='';});}
function showArchive(){currentPage='archive';appWrapper.classList.add('hidden');hideAllSubpages();showSearchBar();subpage2Overlay.style.transition='none';subpage2Overlay.classList.add('active');subpage2Overlay.style.opacity='1';waterCanvas.style.display='none';if(escButton)escButton.querySelector('.esc-btn').classList.remove('disabled');window._cmShow();const cm=document.getElementById('cloudMistCanvas');if(cm){cm.style.zIndex='0';subpage2Overlay.appendChild(cm);}requestAnimationFrame(()=>{subpage2Overlay.style.transition='';});}
function showCodex(){currentPage='codex';appWrapper.classList.add('hidden');hideAllSubpages();showSearchBar();subpage3Overlay.style.transition='none';subpage3Overlay.classList.add('active');subpage3Overlay.style.opacity='1';waterCanvas.style.display='none';if(escButton)escButton.querySelector('.esc-btn').classList.remove('disabled');window._cmHide();requestAnimationFrame(()=>{subpage3Overlay.style.transition='';});}
function showGallery(){currentPage='gallery';appWrapper.classList.add('hidden');hideAllSubpages();showSearchBar();subpage4Overlay.style.transition='none';subpage4Overlay.classList.add('active');subpage4Overlay.style.opacity='1';waterCanvas.style.display='none';if(escButton)escButton.querySelector('.esc-btn').classList.remove('disabled');window._cmHide();requestAnimationFrame(()=>{subpage4Overlay.style.transition='';});}

/* ═══════════════════════════════════ PERSONA SCROLL ═══════════════════════════════════ */
let personaTicking=false;
function updatePersonaSections(){const secs=subpageOverlay.querySelectorAll('.anim-section');if(!secs.length)return;const vh=window.innerHeight;secs.forEach(s=>{const r=s.getBoundingClientRect(),c=(r.top+r.bottom)/2/vh;let o;if(c<0.25)o=0;else if(c<0.40)o=(c-0.25)/0.15;else if(c<0.60)o=1;else if(c<0.75)o=1-(c-0.60)/0.15;else o=0;o=Math.max(0,Math.min(1,o));s.style.opacity=o;s.style.transform=`translateY(${(1-o)*50}px) scale(${0.94+o*0.06})`;});personaTicking=false;}
function onPersonaScroll(){if(!personaTicking){requestAnimationFrame(()=>{updatePersonaSections();personaTicking=false;});personaTicking=true;}}
function initPersonaScroll(){subpageOverlay.addEventListener('scroll',onPersonaScroll,{passive:true});window.addEventListener('resize',()=>{updatePersonaSections();},{passive:true});setTimeout(()=>setPageReady('persona'),500);}

/* ═══════════════════════════════════ SPARKLE ═══════════════════════════════════ */
function initSparkle(){document.addEventListener('click',function(e){const s=document.createElement('div'),z=Math.random()*8+4;let c;if(currentPage==='persona')c='230,0,18';else if(currentPage==='archive')c=Math.random()>0.5?'0,71,224':'91,158,255';else if(currentPage==='codex')c=Math.random()>0.5?'0,200,48':'128,255,64';else if(currentPage==='gallery')c=Math.random()>0.5?'230,190,0':'255,215,0';else c='255,255,255';s.style.cssText=`position:fixed;left:${e.clientX-z/2}px;top:${e.clientY-z/2}px;width:${z}px;height:${z}px;background:radial-gradient(circle,rgb(${c}),rgba(${c},0.4));border-radius:50%;pointer-events:none;z-index:999;animation:sparkFade 0.6s ease-out forwards;`;document.body.appendChild(s);setTimeout(()=>s.remove(),600);});}

/* ═══════════════════════════════════ WATER TRANSITION (RED TIDE) ═══════════════════════════════════ */
const ctx=waterCanvas.getContext('2d');let W,H;
function resizeWaterCanvas(){W=waterCanvas.width=window.innerWidth;H=waterCanvas.height=window.innerHeight;buildBlocks();}
const RED_PALETTE=['#1F0004','#2E0005','#3D0007','#4A0009','#56000C','#66000D','#7A0010','#8C0012','#990015','#A6001A','#B8000F','#CC0011','#D40018','#BF0020','#E61926','#E60000','#FF0A0A','#FF1A1A','#FF2D0A','#FF2200','#B81440','#C82D50','#D43A5C','#CC2255','#A81E44','#E6456A','#FF3366','#FF4470','#FF2266','#D44058','#FF0033','#FF0F28','#FF0040','#FF1A3D','#E82850'];
const STRIPE_REDS=['#FF3366','#FF4470','#FF1A1A','#E60000','#FF0040','#FF2266','#D43A5C','#C82D50'];
const RISE_DURATION=1400,FALL_DURATION=1400,MIN_HOLD=600,WATER_IDLE=0.035;
let waterAnimTime=0,waterTransition=null,waterDirection=null;
function easeInOutCubic(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function easeOutExpo(t){return t>=1?1:1-Math.pow(2,-10*t);}
function triWave(x){const p=Math.abs(2*((x/Math.PI)-Math.floor(x/Math.PI+0.5)));return 2*p-1;}
function sawWave(x,a){const P=2*Math.PI,ph=((x%P)+P)%P;if(ph<a*P)return 1-2*(ph/(a*P));return-1+2*((ph-a*P)/((1-a)*P));}
function computeAngularSurface(x,t){let y=0;y+=42*triWave(0.0040*x+t*0.00032);y+=30*sawWave(0.0075*x+t*0.00048,0.62);y+=20*triWave(0.0120*x+t*0.00060);y+=14*sawWave(0.0190*x+t*0.00075,0.40);y+=9*triWave(0.0300*x+t*0.00095);y+=6*sawWave(0.0480*x+t*0.00110,0.55);return y;}
let blocks=[],benDayPatterns=[];
function createBenDayPattern(dc,bg,sp,dr){const c=document.createElement('canvas');c.width=c.height=sp;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,sp,sp);x.fillStyle=dc;x.beginPath();x.arc(sp/2,sp/2,dr,0,Math.PI*2);x.fill();return c;}
function buildBlocks(){benDayPatterns=[createBenDayPattern('#000000','#E60000',8,1.5),createBenDayPattern('#CC0011','#FF1A1A',6,1.2),createBenDayPattern('#66000D','#CC0011',10,2.0),createBenDayPattern('#990015','#FF0033',7,1.0),createBenDayPattern('#4A0009','#D43A5C',9,1.3),createBenDayPattern('#1A0004','#FF3366',11,2.2)];blocks=[];const rC=22,bRH=H/rC;for(let r=0;r<rC;r++){const rT=r*bRH,rB=(r+1)*bRH,rJ=bRH*0.72,tY=rT+(Math.random()-0.5)*rJ,bY=rB+(Math.random()-0.5)*rJ,cC=5+Math.floor(Math.random()*8),cW=W/cC;for(let c=0;c<cC;c++){const lX=c*cW,rX=(c+1)*cW,jX=cW*0.55+Math.random()*cW*0.35;const tl={x:lX+(Math.random()-0.5)*jX,y:tY+(Math.random()-0.5)*rJ*0.7},tr={x:rX+(Math.random()-0.5)*jX,y:tY+(Math.random()-0.5)*rJ*0.7},br={x:rX+(Math.random()-0.5)*jX,y:bY+(Math.random()-0.5)*rJ*0.7},bl={x:lX+(Math.random()-0.5)*jX,y:bY+(Math.random()-0.5)*rJ*0.7};const dR=r/rC;let pI;if(dR<0.18)pI=Math.floor(Math.random()*10);else if(dR<0.40)pI=5+Math.floor(Math.random()*10);else if(dR<0.60)pI=10+Math.floor(Math.random()*15);else if(dR<0.78)pI=15+Math.floor(Math.random()*15);else pI=14+Math.floor(Math.random()*21);const col=RED_PALETTE[Math.min(pI,RED_PALETTE.length-1)],uP=Math.random()<(dR>0.45?0.38:0.18),pId=Math.floor(Math.random()*benDayPatterns.length),mkT=Math.random()<0.22,tV=Math.floor(Math.random()*4);let vs;if(mkT){const q=[tl,tr,br,bl],v1=q[(tV+1)%4],v2=q[(tV+2)%4],v3=q[(tV+3)%4];if(Math.random()<0.5)vs=[{x:(v1.x+v2.x)/2,y:(v1.y+v2.y)/2},v2,v3];else vs=[v1,v2,{x:(v2.x+v3.x)/2,y:(v2.y+v3.y)/2}];}else{vs=[tl,tr,br,bl];if(Math.random()<0.15){const cx=(tl.x+tr.x+br.x+bl.x)/4+(Math.random()-0.5)*cW*0.5,cy=(tl.y+tr.y+br.y+bl.y)/4+(Math.random()-0.5)*rJ;vs.splice(2,0,{x:cx,y:cy});}}const seed=Math.random()*Math.PI*2;blocks.push({vertices:vs,color:col,usePattern:uP,patternIdx:pId,seed,driftAmpX:0.6+Math.random()*2.0,driftAmpY:0.4+Math.random()*1.4,driftSpd:0.0002+Math.random()*0.0005});}}const sC=Math.floor((W*H)/42000);for(let i=0;i<sC;i++){const sx=Math.random()*W,sy=Math.random()*H,sw=60+Math.random()*200,sh=8+Math.random()*25,ang=(Math.random()-0.5)*0.8,cs=Math.cos(ang),sn=Math.sin(ang);blocks.push({vertices:[{x:sx,y:sy},{x:sx+sw*cs,y:sy+sw*sn},{x:sx+sw*cs-sh*sn,y:sy+sw*sn+sh*cs},{x:sx-sh*sn,y:sy+sh*cs}],color:STRIPE_REDS[Math.floor(Math.random()*STRIPE_REDS.length)],usePattern:false,patternIdx:0,seed:Math.random()*Math.PI*2,driftAmpX:0.3,driftAmpY:0.2,driftSpd:0.0003,isSlash:true});}}
function getSurfaceYArray(t,wl){const bY=H*(1-wl),fS=0.88;let fF=wl>fS?Math.max(0,1-(wl-fS)/(1.0-fS)):1;const iF=wl<0.06?wl/0.06:1,aS=fF*iF,a=new Float32Array(W+1);for(let x=0;x<=W;x++)a[x]=bY+computeAngularSurface(x,t)*aS;return a;}
function clipToWater(sY){ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W,H);for(let x=W;x>=0;x--)ctx.lineTo(x,sY[x]);ctx.closePath();ctx.clip();}
function drawBlocks(time){for(const b of blocks){const dx=Math.sin(time*0.001*b.driftSpd*1000+b.seed)*b.driftAmpX,dy=Math.cos(time*0.001*b.driftSpd*800+b.seed+1.3)*b.driftAmpY;ctx.beginPath();ctx.moveTo(b.vertices[0].x+dx,b.vertices[0].y+dy);for(let i=1;i<b.vertices.length;i++)ctx.lineTo(b.vertices[i].x+dx,b.vertices[i].y+dy);ctx.closePath();if(b.usePattern&&benDayPatterns[b.patternIdx])ctx.fillStyle=ctx.createPattern(benDayPatterns[b.patternIdx],'repeat');else ctx.fillStyle=b.color;ctx.fill();ctx.strokeStyle='#0D0D0D';ctx.lineWidth=b.isSlash?1.6:2.2;ctx.lineJoin='miter';ctx.miterLimit=4;ctx.stroke();}}
function drawSurfaceLine(sY){ctx.beginPath();ctx.moveTo(0,sY[0]);for(let x=1;x<=W;x++)ctx.lineTo(x,sY[x]);ctx.strokeStyle='#0D0D0D';ctx.lineWidth=4.5;ctx.lineJoin='miter';ctx.miterLimit=5;ctx.stroke();ctx.beginPath();ctx.moveTo(0,sY[0]-5);for(let x=1;x<=W;x++)ctx.lineTo(x,sY[x]-5);ctx.strokeStyle='#FFFFFF';ctx.lineWidth=1.8;ctx.stroke();}
function drawSurfaceDots(sY){if(!benDayPatterns.length)return;let minY=Infinity,maxY=-Infinity;for(let i=0;i<sY.length;i++){if(sY[i]<minY)minY=sY[i];if(sY[i]>maxY)maxY=sY[i];}const bT=Math.max(0,minY-10),bH=Math.min(H-bT,maxY-minY+40);if(bH<=0)return;ctx.save();ctx.globalAlpha=0.18;ctx.beginPath();ctx.rect(0,bT,W,bH);ctx.clip();ctx.fillStyle=ctx.createPattern(benDayPatterns[0],'repeat');ctx.fillRect(0,bT,W,bH);ctx.restore();}
function waterRender(t,wl){ctx.clearRect(0,0,W,H);if(wl<=0.003)return;const sY=getSurfaceYArray(t,wl);ctx.save();clipToWater(sY);ctx.fillStyle='#140003';ctx.fillRect(0,0,W,H);drawBlocks(t);ctx.restore();const fS=0.88,fF=wl>fS?Math.max(0,1-(wl-fS)/(1.0-fS)):1;if(fF>0.02){drawSurfaceLine(sY);drawSurfaceDots(sY);}if(wl>0.06&&wl<0.96){const step=25;for(let x=0;x<=W;x+=step){const y=sY[x],pY=x>=step?sY[x-step]:y,nY=x+step<=W?sY[x+step]:y;if(y<pY-8&&y<nY-8&&Math.random()<0.25){ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();const s=3+Math.random()*5;ctx.moveTo(x,y);ctx.lineTo(x-s*0.4,y-s);ctx.lineTo(x+s*0.4,y-s*0.6);ctx.closePath();ctx.fill();}}}}
function triggerWaterTransition(dir){if(waterTransition)return;waterDirection=dir;waterTransition={phase:'rising',startTime:performance.now(),holdStart:0,waterLevel:WATER_IDLE};waterCanvas.classList.add('blocking');if(window._cmSetZ)window._cmSetZ('180');if(dir==='toPersona'){/* clouds stay visible during rising, hide at hold — handled in updateWaterTransition */}else{window._cmHide();}}
function updateWaterTransition(now){if(!waterTransition)return;const e=now-waterTransition.startTime;if(waterTransition.phase==='rising'){const t=Math.min(e/RISE_DURATION,1);waterTransition.waterLevel=WATER_IDLE+(1-WATER_IDLE)*easeInOutCubic(t);if(t>=1){waterTransition.phase='holding';waterTransition.holdStart=now;const targetP=waterDirection==='toPersona'?'persona':'orbital';if(targetP==='persona'){showPersona();window._cmHide();}else{showOrbital();window._cmHide();}waterTransition._targetPage=targetP;}}if(waterTransition.phase==='holding'){waterTransition.waterLevel=1;const minHeld=now-waterTransition.holdStart>=MIN_HOLD;const pgReady=pageReadyFlags[waterTransition._targetPage];if(minHeld&&pgReady){waterTransition.phase='falling';waterTransition.startTime=now;if(waterDirection==='toOrbital'){window._cmShow();if(window._cmSetZ)window._cmSetZ('255');document.body.appendChild(document.getElementById('cloudMistCanvas'));}}}if(waterTransition.phase==='falling'){const t=Math.min((now-waterTransition.startTime)/FALL_DURATION,1);waterTransition.waterLevel=1-(1-WATER_IDLE)*easeOutExpo(t);if(t>=1){waterTransition.waterLevel=WATER_IDLE;waterTransition=null;waterDirection=null;waterCanvas.classList.remove('blocking');}}}
let waterLastTime=performance.now();
function waterAnimate(ts){const dt=Math.min(ts-waterLastTime,50);waterLastTime=ts;waterAnimTime+=dt;updateWaterTransition(ts);const wl=waterTransition?waterTransition.waterLevel:WATER_IDLE;waterRender(waterAnimTime,wl);requestAnimationFrame(waterAnimate);}

/* ═══════════════════════════════════ POP TRANSITION (BLUE COLUMNS) ═══════════════════════════════════ */
const PopTransition={_colCount:0,_colWidth:0,_colHeight:0,_halfCap:0,_columns:[],_active:false,_reverse:false,
_calcGeometry(){const vw=window.innerWidth,vh=window.innerHeight;this._colCount=Math.max(8,Math.ceil(vw/85));this._colWidth=vw/this._colCount;this._colHeight=vh+this._colWidth;this._halfCap=this._colWidth/2;},
_createColumns(){this._calcGeometry();const P=['#0000FF','#0044FF','#0088FF','#0022CC','#3366FF','#0055DD','#0033AA','#1155FF','#0018CC','#2244EE','#0066FF','#0044DD'];popOverlay.innerHTML='';this._columns=[];for(let i=0;i<this._colCount;i++){const c=document.createElement('div');c.className='pop-column';c.style.left=Math.floor(i*this._colWidth)+'px';c.style.width=Math.ceil(this._colWidth+1)+'px';c.style.height=this._colHeight+'px';c.style.setProperty('--col-color',P[Math.floor(Math.random()*P.length)]);popOverlay.appendChild(c);this._columns.push(c);}},
play(isRev){if(this._active)return Promise.resolve();this._active=true;this._reverse=isRev;this._createColumns();popOverlay.classList.add('active');const vh=window.innerHeight,buf=this._colWidth+2,sY=isRev?(vh+buf):-(vh+buf),hY=-this._halfCap;if(typeof gsap!=='undefined'){gsap.set(this._columns,{y:sY});return new Promise(r=>{gsap.to(this._columns,{y:hY,duration:0.6,stagger:{amount:0.4,from:isRev?'end':'start'},ease:'power2.inOut',onComplete:r});});}else{for(const c of this._columns)c.style.transform='translateY('+sY+'px)';return new Promise(r=>{let done=0;const total=this._columns.length;if(!total){r();return;}for(let i=0;i<total;i++){const c=this._columns[i],d=isRev?((total-1-i)/total)*0.4:(i/total)*0.4;c.offsetHeight;c.style.transition='transform 0.6s cubic-bezier(0.5,0,0.5,1) '+d+'s';c.style.transform='translateY('+hY+'px)';const onEnd=()=>{done++;if(done>=total){for(const cc of this._columns)cc.style.transition='';r();}};c.addEventListener('transitionend',onEnd,{once:true});setTimeout(()=>{c.removeEventListener('transitionend',onEnd);onEnd();},800+d*1000);}});}},
finish(){if(!this._active)return Promise.resolve();const vh=window.innerHeight,buf=this._colWidth+2,eY=this._reverse?-(vh+buf):(vh+buf);return new Promise(r=>{const done=()=>{popOverlay.classList.remove('active');this._active=false;r();};if(typeof gsap!=='undefined'){gsap.to(this._columns,{y:eY,duration:0.4,stagger:{amount:0.2,from:this._reverse?'end':'start'},ease:'power2.in',onComplete:done});}else{let cnt=0;const total=this._columns.length;if(!total){done();return;}for(let i=0;i<total;i++){const c=this._columns[i],d=this._reverse?((total-1-i)/total)*0.2:(i/total)*0.2;c.style.transition='transform 0.4s ease-in '+d+'s';c.style.transform='translateY('+eY+'px)';const onEnd=()=>{cnt++;if(cnt>=total){for(const cc of this._columns)cc.style.transition='';done();}};c.addEventListener('transitionend',onEnd,{once:true});setTimeout(()=>{c.removeEventListener('transitionend',onEnd);onEnd();},600+d*1000);}}});}};

async function triggerPopTransition(dir){if(PopTransition._active)return;const isRev=dir==='toOrbital';window._cmSlideUp();await PopTransition.play(isRev);if(dir==='toArchive')showArchive();else showOrbital();const targetP=dir==='toArchive'?'archive':'orbital';await waitForPageReady(targetP);await PopTransition.finish();window._cmSlideDown();}

/* ═══════════════════════ CLOUD MIST — Comic-book mist bands (independent from water animation) ═══════
 *  Design: 5 overlapping horizontal mist bands stacked at the screen top.
 *  Each band has its own undulating bottom edge & scrolls sideways at a different speed.
 *  NOT a clone of the bottom water — mist is continuous horizontal layers, not debris blocks.
 *
 *  Pop-art treatment: flat blue fills → Ben-Day dots → bold comic outlines on each band edge
 *                    → offset white highlights → mist droplets below lowest band.
 *
 *  Visible: orbital + subpage2 (Archive). Z-index: 255 (>PopTransition 250, <fixed-controls 300).
 *  Loop NEVER stops — reads `currentPage` for fade. Zero polling overhead.
 *  ═══════════════════════════════════════════════════════════════════════════════════════════════════════ */
(()=>{
const STRIP_H=105;                   // compact cloud ceiling height
// ── 5 mist bands, top→bottom: lighter→richer, slower→faster ──
const BANDS=[
  {yBase:-10, color:'#002FA7', speed:0.12, amp:7,  freq:0.004, phase:0.0},
  {yBase:5,   color:'#003BC4', speed:0.19, amp:9,  freq:0.006, phase:1.2},
  {yBase:20,  color:'#0047E0', speed:0.27, amp:11, freq:0.008, phase:2.5},
  {yBase:36,  color:'#1A5CFF', speed:0.36, amp:13, freq:0.010, phase:4.0},
  {yBase:50,  color:'#2962FF', speed:0.48, amp:15, freq:0.013, phase:5.7},
];
const OUTLINE='#000D2E';
const HIGHLIGHT='rgba(255,255,255,0.75)';
const CM_DROPLETS=28;                // mist droplets below the lowest band

const cmCanvas=document.createElement('canvas');
const cmCtx=cmCanvas.getContext('2d');
cmCanvas.id='cloudMistCanvas';cmCanvas.setAttribute('aria-hidden','true');
let cmW,cmH,cmBenDay,cmOpacity=0,cmTarget=0,cmTime=0,cmLastTime=0,cmRaf=null,cmDroplets=[];

// ── Ben-Day dot pattern (single pattern — subtle, pop-art halftone) ──
function cmMakeBenDay(){
  const c=document.createElement('canvas');c.width=c.height=8;
  const x=c.getContext('2d');
  x.fillStyle='rgba(0,16,64,0.10)';x.fillRect(0,0,8,8);
  x.fillStyle='rgba(0,16,64,0.14)';x.beginPath();x.arc(4,4,1.3,0,Math.PI*2);x.fill();
  return c;
}

// ── Band bottom edge: smooth sine-based wave (no triWave/sawWave — not a water clone) ──
function cmBandY(x,t,band){
  const a=band.amp, f=band.freq, s=band.speed, p=band.phase;
  let y=band.yBase+a*0.7;
  y+=Math.sin(x*f+t*s*0.001+p)*a;
  y+=Math.sin(x*f*1.7+t*s*0.0007+p*1.8)*a*0.45;
  y+=Math.sin(x*f*3.1+t*s*0.0004+p*3.3)*a*0.22;
  return Math.max(0,Math.min(STRIP_H+10,y));
}

// ── Build mist droplets (small dots hanging below bottom band) ──
function cmBuildDroplets(){
  cmDroplets=[];
  for(let i=0;i<CM_DROPLETS;i++){
    cmDroplets.push({
      x:Math.random()*cmW,
      y:STRIP_H*0.78+Math.random()*STRIP_H*0.35,
      r:1.2+Math.random()*2.8,
      sp:0.15+Math.random()*0.5,
      phase:Math.random()*Math.PI*2,
      oscAmp:3+Math.random()*8,
      oscSpd:0.008+Math.random()*0.02,
    });
  }
}

function cmResize(){
  cmW=cmCanvas.width=window.innerWidth;cmH=cmCanvas.height=window.innerHeight;
  cmCanvas.style.width=cmW+'px';cmCanvas.style.height=cmH+'px';
  cmBenDay=cmMakeBenDay();
  cmBuildDroplets();
}

// ── Render one band: filled rectangle from top to undulating bottom edge ──
function cmDrawBand(band,t){
  // Build bottom-edge path
  const step=4; // sample every 4px for performance
  cmCtx.beginPath();
  cmCtx.moveTo(0,0);
  cmCtx.lineTo(cmW,0);
  // Right-to-left along undulating bottom edge
  for(let x=cmW;x>=0;x-=step){
    cmCtx.lineTo(x,cmBandY(x,t,band));
  }
  cmCtx.closePath();

  // ① Flat fill
  cmCtx.fillStyle=band.color;
  cmCtx.fill();

  // ② Ben-Day overlay
  if(cmBenDay){
    cmCtx.globalAlpha=0.35;
    cmCtx.fillStyle=cmCtx.createPattern(cmBenDay,'repeat');
    cmCtx.fill();
    cmCtx.globalAlpha=1;
  }

  // ③ Bold comic outline along bottom edge
  cmCtx.beginPath();
  cmCtx.moveTo(0,cmBandY(0,t,band));
  for(let x=step;x<=cmW;x+=step){
    cmCtx.lineTo(x,cmBandY(x,t,band));
  }
  cmCtx.strokeStyle=OUTLINE;
  cmCtx.lineWidth=2.2;
  cmCtx.lineJoin='round';
  cmCtx.stroke();

  // ④ Offset white highlight (comic-book shine)
  cmCtx.beginPath();
  cmCtx.moveTo(0,cmBandY(0,t,band)-3.5);
  for(let x=step;x<=cmW;x+=step){
    cmCtx.lineTo(x,cmBandY(x,t,band)-3.5);
  }
  cmCtx.strokeStyle=HIGHLIGHT;
  cmCtx.lineWidth=1.3;
  cmCtx.stroke();
}

// ── Render mist droplets ──
function cmDrawDroplets(t){
  cmCtx.fillStyle='rgba(255,255,255,0.35)';
  for(const d of cmDroplets){
    d.x+=d.sp;
    if(d.x>cmW+10)d.x=-10;
    const dy=Math.sin(t*0.001*d.oscSpd+d.phase)*d.oscAmp;
    cmCtx.beginPath();
    cmCtx.arc(d.x,d.y+dy,d.r,0,Math.PI*2);
    cmCtx.fill();
  }
}

// ── Main render: ALWAYS clears, only draws when cmLevel>0 (same pattern as waterRender) ──
function cmRender(t){
  cmCtx.clearRect(0,0,cmW,cmH);
  if(cmLevel<=0)return;             // "hidden" = clear only, nothing drawn (like water idle)
  cmCtx.globalAlpha=1;

  // Subtle dark gradient base (no clip — gradient naturally ends at STRIP_H)
  const cmGrad=cmCtx.createLinearGradient(0,0,0,STRIP_H);
  cmGrad.addColorStop(0,'rgba(6,12,34,0.45)');
  cmGrad.addColorStop(0.5,'rgba(6,12,34,0.15)');
  cmGrad.addColorStop(1,'rgba(6,12,34,0)');
  cmCtx.fillStyle=cmGrad;
  cmCtx.fillRect(0,0,cmW,STRIP_H);

  // Draw bands bottom-to-top (lower bands overlap upper ones)
  // No clip — wave peaks extend naturally beyond STRIP_H
  for(let i=BANDS.length-1;i>=0;i--){
    cmDrawBand(BANDS[i],t);
  }

  // Mist droplets below the bands
  cmDrawDroplets(t);

  cmCtx.globalAlpha=1;
}

// ── Animation loop: same pattern as waterAnimate — always runs, always clears ──
//    "Hidden" = clearRect + nothing drawn (like water at idle level).
//    cmLevel is a LOCAL variable, controlled only by _cmShow() / _cmHide().
let cmLevel=1;  // 1=draw, 0=clear-only (local — no window.xxx needed)

function cmLoop(ts){
  cmRaf=requestAnimationFrame(cmLoop);
  const dt=Math.min(ts-cmLastTime,50);cmLastTime=ts;
  cmTime+=dt;
  cmRender(cmTime);                // always render (always clears)
}

function cmInit(){
  cmResize();
  cmCanvas.style.cssText='position:fixed;top:0;left:0;z-index:255;pointer-events:none;';
  document.body.appendChild(cmCanvas);
  window.addEventListener('resize',cmResize);
  cmLastTime=performance.now();
  cmLevel=1;
  if(!cmRaf)cmRaf=requestAnimationFrame(cmLoop);
}

// Public API — the ONLY way to show/hide clouds
window._cmShow=function(){cmLevel=1;};
window._cmHide=function(){cmLevel=0;};
window._cmSetZ=function(v){cmCanvas.style.zIndex=v;};
// Slide for pop transition: clouds move up off-screen, then back down
window._cmSlideUp=function(){if(typeof gsap!=='undefined')gsap.to(cmCanvas,{y:-STRIP_H-10,duration:0.6,ease:'power2.in',overwrite:true});else cmCanvas.style.transform='translateY(-'+(STRIP_H+10)+'px)';};
window._cmSlideDown=function(){if(typeof gsap!=='undefined')gsap.to(cmCanvas,{y:0,duration:0.45,ease:'power2.out',overwrite:true});else cmCanvas.style.transform='translateY(0)';};

window._cmInit=cmInit;
})();

/* ═══════════════════════════════════ ARCHIVE (SON2) INIT ═══════════════════════════════════ */

let archiveState={articles:[],activeArticleId:null,isReaderOpen:false,entranceComplete:false};
function renderArticleButtons(articles){const list=document.getElementById('articleList2'),count=document.getElementById('articleCount2');list.innerHTML=articles.map((a,i)=>`<button class="article-btn" data-id="${a.id}" style="animation-delay:${0.5+i*0.1}s"><div class="art-meta"><span class="art-date">${a.date}</span><span class="art-time">${a.time}</span>${a.tags.map(t=>`<span class="art-tag">#${t}</span>`).join('')}</div><div class="art-cover-row"><div class="art-cover-icon">${a.cover}</div><div class="art-info"><div class="art-title">${a.title}</div><div class="art-excerpt">${a.excerpt}</div></div></div><span class="art-arrow">▶</span></button>`).join('');count.textContent=articles.length+' MISSIONS AVAILABLE';list.querySelectorAll('.article-btn').forEach(b=>{b.addEventListener('click',()=>openArchiveArticle(b.getAttribute('data-id')));});}
function openArchiveArticle(id){const a=STATIC_ARTICLES.find(x=>x.id===id);if(!a)return;archiveState.activeArticleId=id;const layout=document.getElementById('appLayout2');if(!archiveState.isReaderOpen){archiveState.isReaderOpen=true;layout.classList.add('reader-open');document.querySelectorAll('#articleList2 .article-btn').forEach(b=>{b.style.opacity='1';b.style.transform='none';});setTimeout(()=>renderArchiveContent(a),350);}else{renderArchiveContent(a);}document.querySelectorAll('#articleList2 .article-btn').forEach(b=>{b.classList.toggle('active',b.getAttribute('data-id')===id);});const rp=document.getElementById('readerPanel2');if(rp)rp.scrollTop=0;}
function closeArchiveReader(){const layout=document.getElementById('appLayout2');archiveState.isReaderOpen=false;archiveState.activeArticleId=null;document.querySelectorAll('#articleList2 .article-btn').forEach(b=>{b.classList.remove('active');b.style.opacity='1';b.style.transform='none';});layout.classList.remove('reader-open');setTimeout(()=>{document.getElementById('mdContent2').innerHTML='<div class="reader-empty"><div class="empty-diamond"></div><p class="empty-text">Select a mission<br>to begin reading</p></div>';document.getElementById('readerHeader2').style.display='none';},600);}
function renderArchiveContent(a){const h=document.getElementById('readerHeader2');document.getElementById('rhDate2').textContent=a.date+' · '+a.time;document.getElementById('rhTag2').textContent=a.tags.map(t=>'#'+t).join(' ');document.getElementById('rhTitle2').textContent=a.title;h.style.display='block';let html;if(typeof marked!=='undefined'){marked.setOptions({breaks:true,gfm:true});html=marked.parse(a.content);}else{html='<p>'+a.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')+'</p>';}const mc=document.getElementById('mdContent2');mc.innerHTML=html;mc.classList.remove('reader-open-anim');void mc.offsetWidth;mc.classList.add('reader-open-anim');mc.style.opacity='1';}
function sortByDate(articles){return[...articles].sort((a,b)=>b.date.localeCompare(a.date));}
function initArchive(){archiveState.articles=sortByDate(STATIC_ARTICLES);renderArticleButtons(archiveState.articles);document.getElementById('readerBack2').addEventListener('click',closeArchiveReader);setTimeout(()=>{archiveState.entranceComplete=true;setPageReady('archive');document.querySelectorAll('#articleList2 .article-btn').forEach(b=>{b.style.animation='none';b.style.opacity='1';b.style.transform='none';});},2000);}

/* ═══════════════════════════════════ DIAGONAL TRANSITION (branch4 — Yellow Water Circle) ═══════════════════════════════════ */
const diagOverlay=document.getElementById('diagOverlay'),diagSvg=document.getElementById('diagSvg'),diagCircle=document.getElementById('diagWaterCircle'),diagCircleRev=document.getElementById('diagWaterCircleRev'),diagRevealCircle=document.getElementById('diagRevealCircle'),diagTurbulence=document.getElementById('diagTurbulence');
let diagActive=false,diagDir=null,diagMainTL=null,diagWaterBreathTL=null;
function diagMaxRadius(vw,vh){return Math.sqrt(vw*vw+vh*vh);}
function diagStartWaterBreath(){if(diagWaterBreathTL)diagWaterBreathTL.kill();diagWaterBreathTL=gsap.timeline({repeat:-1,yoyo:true});diagWaterBreathTL.to(diagTurbulence,{attr:{baseFrequency:'0.014 0.018'},duration:1.8,ease:'sine.inOut'}).to(diagTurbulence,{attr:{baseFrequency:'0.022 0.026'},duration:2.2,ease:'sine.inOut'});}
function diagStopWaterBreath(){if(diagWaterBreathTL){diagWaterBreathTL.kill();diagWaterBreathTL=null;}gsap.set(diagTurbulence,{attr:{baseFrequency:'0.018 0.022'}});}
function triggerDiagTransition(dir){
if(diagActive)return;diagActive=true;diagDir=dir;
const vw=window.innerWidth,vh=window.innerHeight,R=diagMaxRadius(vw,vh);
diagSvg.setAttribute('viewBox','0 0 '+vw+' '+vh);
if(diagMainTL){diagMainTL.kill();diagMainTL=null;}
diagStopWaterBreath();
diagOverlay.style.display='';diagOverlay.classList.add('active');
gsap.set(diagCircle,{attr:{r:0},opacity:1});gsap.set(diagCircleRev,{attr:{r:R},opacity:0});
gsap.set(diagRevealCircle,{attr:{r:0}});
gsap.set(diagTurbulence,{attr:{baseFrequency:'0.018 0.022'}});
const targetP=dir==='toGallery'?'gallery':'orbital';
const tl=gsap.timeline({paused:true,onComplete:()=>{
diagStartWaterBreath();
if(dir==='toGallery')showGallery();else showOrbital();
waitForPageReady(targetP).then(()=>{
diagStopWaterBreath();
gsap.set(diagTurbulence,{attr:{baseFrequency:'0.018 0.022'}});
const tl2=gsap.timeline({onComplete:()=>{
diagStopWaterBreath();
diagOverlay.style.display='none';diagOverlay.classList.remove('active');
diagActive=false;diagMainTL=null;
gsap.set(diagCircle,{attr:{r:0},opacity:1});gsap.set(diagCircleRev,{opacity:0});
gsap.set(diagRevealCircle,{attr:{r:0}});
}});
tl2.call(()=>{gsap.set(diagCircle,{opacity:0});gsap.set(diagCircleRev,{opacity:1,attr:{r:R}});},null,0);
tl2.to(diagRevealCircle,{attr:{r:R},duration:1.0,ease:'power2.out'},0);
diagMainTL=tl2;
tl2.play();
});
}});
tl.to(diagCircle,{attr:{r:R},duration:1.0,ease:'none'},0);
diagMainTL=tl;
tl.play();}

/* ═══════════════════════════════════ CURTAIN TRANSITION (branch3 — Green Velvet) ═══════════════════════════════════ */
const curtainCanvas=document.getElementById('curtainCanvas'),curtainCtx=curtainCanvas.getContext('2d'),curtainLoading=document.getElementById('curtainLoading');
let curtainState='open',curtainProgress=0,curtainStartTime=0,curtainDir=null,curtainRaf=null,curtainActive=false;
let cW,cH,cDpr,cHalfW,curtainTex=null;
const CURT_CLOSE=1000,CURT_OPEN=1000,CURT_HOLD=1200,CURT_LAG=0.22,CURT_OVERLAP=16;
function curtLerpC(c1,c2,t){return[c1[0]+(c2[0]-c1[0])*t,c1[1]+(c2[1]-c1[1])*t,c1[2]+(c2[2]-c1[2])*t];}
function curtRgb(c){return `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;}
function curtEaseClose(t){if(t>=1)return 1;const e=1-Math.pow(2,-10*t);if(t<0.85)return e;const b=(t-0.85)/0.15,bk=1+2.2*Math.pow(t-1,3)+1.2*Math.pow(t-1,2);return e*(1-b)+bk*b;}
function curtEaseOpen(t){if(t>=1)return 1;const e=1-Math.pow(2,-8*t);if(t<0.9)return e;const b=(t-0.9)/0.1,bk=1+2.2*Math.pow(t-1,3)+1.2*Math.pow(t-1,2);return e*(1-b)+bk*b;}
function buildCurtainTex(){
if(cHalfW<1||cH<1)return;const tc=document.createElement('canvas');tc.width=cHalfW;tc.height=cH;const tx=tc.getContext('2d');
const blocks=[{w:22,c:'#050508'},{w:74,c:'#004d15'},{w:38,c:'#00cc33',dots:!0,dc:'#050508',ds:4,dsp:10},{w:18,c:'#050508'},{w:56,c:'#008822'},{w:44,c:'#00330d'},{w:26,c:'#00ff44',dots:!0,dc:'#00330d',ds:3,dsp:8},{w:20,c:'#050508'},{w:68,c:'#006622'},{w:32,c:'#00dd33'},{w:16,c:'#050508'},{w:50,c:'#00551a',dots:!0,dc:'#00ff44',ds:3.5,dsp:11},{w:42,c:'#00aa22'}];
let bx=0;for(const b of blocks){const w=Math.min(b.w,cHalfW-bx);if(w<=0)break;tx.fillStyle=b.c;tx.fillRect(bx,0,w,cH);
if(b.dots){for(let dy=b.ds;dy<cH;dy+=b.dsp){const ro=(Math.floor(dy/b.dsp)%2)*(b.dsp/2);for(let dx=ro;dx<w;dx+=b.dsp){tx.fillStyle=b.dc;tx.beginPath();tx.arc(bx+dx,dy,b.ds,0,Math.PI*2);tx.fill();}}}bx+=w;}
if(bx<cHalfW){let bi=0;while(bx<cHalfW){const b=blocks[bi%blocks.length],w=Math.min(b.w,cHalfW-bx);tx.fillStyle=b.c;tx.fillRect(bx,0,w,cH);if(b.dots){for(let dy=b.ds;dy<cH;dy+=b.dsp){const ro=(Math.floor(dy/b.dsp)%2)*(b.dsp/2);for(let dx=ro;dx<w;dx+=b.dsp){tx.fillStyle=b.dc;tx.beginPath();tx.arc(bx+dx,dy,b.ds,0,Math.PI*2);tx.fill();}}}bx+=w;bi++;}}
const eh=30;tx.fillStyle='#050508';tx.beginPath();tx.moveTo(0,cH);for(let ex=0;ex<cHalfW;ex+=35){tx.lineTo(ex,cH-eh);tx.lineTo(ex+17,cH-eh+15);tx.lineTo(ex+35,cH);}tx.lineTo(cHalfW,cH);tx.closePath();tx.fill();
tx.strokeStyle='#00ff44';tx.lineWidth=2;tx.beginPath();tx.moveTo(0,cH-eh);for(let ex=0;ex<cHalfW;ex+=35){tx.lineTo(ex,cH-eh);tx.lineTo(ex+17,cH-eh+15);tx.lineTo(ex+35,cH-eh);}tx.lineTo(cHalfW,cH-eh);tx.stroke();
tx.strokeStyle='rgba(0,255,68,0.2)';tx.lineWidth=1;bx=0;for(const b of blocks){bx+=b.w;if(bx<cHalfW){tx.beginPath();tx.moveTo(bx,0);tx.lineTo(bx,cH);tx.stroke();}}
curtainTex=tc;}
function curtResize(){cDpr=Math.min(window.devicePixelRatio||1,2);cW=window.innerWidth;cH=window.innerHeight;curtainCanvas.width=cW*cDpr;curtainCanvas.height=cH*cDpr;curtainCanvas.style.width=cW+'px';curtainCanvas.style.height=cH+'px';curtainCtx.setTransform(1,0,0,1,0,0);curtainCtx.scale(cDpr,cDpr);cHalfW=Math.ceil(cW/2)+CURT_OVERLAP;buildCurtainTex();}
function curtGetOffset(y,gp,ph){const yn=y/cH,lag=yn*CURT_LAG,lp=Math.max(0,Math.min(1,gp-lag)),e=ph==='closing'?curtEaseClose(lp):curtEaseOpen(lp);return cHalfW*e;}
function curtGetHoldWave(y,t){const ts=t*0.001;return Math.sin(y*0.014+ts*1.8)*3.5+Math.sin(y*0.022+ts*1.2)*2.2+Math.sin(y*0.007+ts*0.7)*1.8+Math.cos(y*0.031+ts*2.3)*1.0;}
function curtDraw(now){
curtainCtx.clearRect(0,0,cW,cH);
if(curtainState==='open'){return;}
if(!curtainTex){return;}
const sh=3;
if(curtainState==='closed'){const el=now-curtainStartTime;
for(let y=0;y<cH;y+=sh){const wv=curtGetHoldWave(y,el),dh=Math.min(sh,cH-y),dx=-cHalfW+cHalfW+wv;curtainCtx.drawImage(curtainTex,0,y,cHalfW,dh,dx,y,cHalfW,dh);}
curtainCtx.save();curtainCtx.translate(cW,0);curtainCtx.scale(-1,1);
for(let y=0;y<cH;y+=sh){const wv=curtGetHoldWave(y,el),dh=Math.min(sh,cH-y),dx=-cHalfW+cHalfW+wv;curtainCtx.drawImage(curtainTex,0,y,cHalfW,dh,dx,y,cHalfW,dh);}
curtainCtx.restore();}else{const isC=curtainState==='closing';
for(let y=0;y<cH;y+=sh){const dh=Math.min(sh,cH-y);let o=curtGetOffset(y,curtainProgress,curtainState);if(!isC)o=cHalfW-o;curtainCtx.drawImage(curtainTex,0,y,cHalfW,dh,-cHalfW+o,y,cHalfW,dh);}
curtainCtx.save();curtainCtx.translate(cW,0);curtainCtx.scale(-1,1);
for(let y=0;y<cH;y+=sh){const dh=Math.min(sh,cH-y);let o=curtGetOffset(y,curtainProgress,curtainState);if(!isC)o=cHalfW-o;curtainCtx.drawImage(curtainTex,0,y,cHalfW,dh,-cHalfW+o,y,cHalfW,dh);}
curtainCtx.restore();}
if(curtainState==='closing'||curtainState==='opening'){const p=curtainState==='closing'?curtainProgress:(1-curtainProgress);
if(p>0.4){const sa=(p-0.4)/0.6;curtainCtx.strokeStyle=`rgba(0,255,68,${sa*0.9})`;curtainCtx.lineWidth=2.5;curtainCtx.beginPath();curtainCtx.moveTo(cW/2,30);curtainCtx.lineTo(cW/2,cH);curtainCtx.stroke();}}}
function triggerCurtainTransition(dir){if(curtainActive)return;curtainActive=true;curtainDir=dir;curtainState='closing';curtainProgress=0;curtainStartTime=performance.now();curtainCanvas.classList.add('blocking');if(dir==='toOrbital'){window._cmHide();}if(!curtainRaf){curtainRaf=requestAnimationFrame(curtainLoop);}}
function curtainLoop(now){
if(curtainState==='closing'){const e=(now-curtainStartTime)/CURT_CLOSE;curtainProgress=Math.min(1,e);if(curtainProgress>=1){curtainProgress=1;curtainState='closed';curtainStartTime=now;curtainLoading.classList.add('visible');if(curtainDir==='toCodex')window._cmHide();}}
else if(curtainState==='closed'){const minHeld=now-curtainStartTime>=CURT_HOLD;const targetP=curtainDir==='toCodex'?'codex':'orbital';const pgReady=pageReadyFlags[targetP];if(minHeld&&pgReady){curtainLoading.classList.remove('visible');if(curtainDir==='toCodex')showCodex();else{showOrbital();window._cmShow();}curtainState='opening';curtainProgress=0;curtainStartTime=now;}}
else if(curtainState==='opening'){const e=(now-curtainStartTime)/CURT_OPEN;curtainProgress=Math.min(1,e);if(curtainProgress>=1){curtainProgress=1;curtainState='open';curtainActive=false;curtainDir=null;curtainCanvas.classList.remove('blocking');}}
curtDraw(now);
if(curtainState!=='open'){curtainRaf=requestAnimationFrame(curtainLoop);}else{curtDraw(now);curtainRaf=null;}
}
try{curtResize();curtDraw(performance.now());}catch(e){}
window.addEventListener('resize',()=>{try{curtResize();if(!curtainRaf)curtDraw(performance.now());}catch(e){}});

/* ═══════════════════════════════════ GREEN ARCHIVE INIT (son3) ═══════════════════════════════════ */
let codexState={articles:[],activeId:null,isReaderOpen:false,entranceComplete:false};
function renderCodexButtons(){const list=document.getElementById('articleList3'),count=document.getElementById('articleCount3');list.innerHTML=codexState.articles.map((a,i)=>`<button class="article-btn" data-id="${a.id}" style="animation-delay:${0.5+i*0.1}s"><div class="art-meta"><span class="art-date">${a.date}</span><span class="art-time">${a.time}</span>${a.tags.map(t=>`<span class="art-tag">#${t}</span>`).join('')}</div><div class="art-cover-row"><div class="art-cover-icon">${a.cover}</div><div class="art-info"><div class="art-title">${a.title}</div><div class="art-excerpt">${a.excerpt}</div></div></div><span class="art-arrow">▶</span></button>`).join('');count.textContent=codexState.articles.length+' ENTRIES AVAILABLE';list.querySelectorAll('.article-btn').forEach(b=>{b.addEventListener('click',()=>openCodexArticle(b.getAttribute('data-id')));});}
function openCodexArticle(id){const a=STATIC_CODEX.find(x=>x.id===id);if(!a)return;codexState.activeId=id;const layout=document.getElementById('appLayout3');if(!codexState.isReaderOpen){codexState.isReaderOpen=true;layout.classList.add('reader-open');document.querySelectorAll('#articleList3 .article-btn').forEach(b=>{b.style.opacity='1';b.style.transform='none';});setTimeout(()=>renderCodexContent(a),350);}else{renderCodexContent(a);}document.querySelectorAll('#articleList3 .article-btn').forEach(b=>{b.classList.toggle('active',b.getAttribute('data-id')===id);});const rp=document.getElementById('readerPanel3');if(rp)rp.scrollTop=0;}
function closeCodexReader(){const layout=document.getElementById('appLayout3');codexState.isReaderOpen=false;codexState.activeId=null;document.querySelectorAll('#articleList3 .article-btn').forEach(b=>{b.classList.remove('active');b.style.opacity='1';b.style.transform='none';});layout.classList.remove('reader-open');setTimeout(()=>{document.getElementById('mdContent3').innerHTML='<div class="reader-empty"><div class="empty-diamond"></div><p class="empty-text">Select a codex entry<br>to begin reading</p></div>';document.getElementById('readerHeader3').style.display='none';},600);}
function renderCodexContent(a){const h=document.getElementById('readerHeader3');document.getElementById('rhDate3').textContent=a.date+' · '+a.time;document.getElementById('rhTag3').textContent=a.tags.map(t=>'#'+t).join(' ');document.getElementById('rhTitle3').textContent=a.title;h.style.display='block';let html;if(typeof marked!=='undefined'){marked.setOptions({breaks:true,gfm:true});html=marked.parse(a.content);}else{html='<p>'+a.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br>')+'</p>';}const mc=document.getElementById('mdContent3');mc.innerHTML=html;mc.classList.remove('reader-open-anim');void mc.offsetWidth;mc.classList.add('reader-open-anim');mc.style.opacity='1';}
function initCodex(){codexState.articles=sortByDate(STATIC_CODEX);renderCodexButtons();document.getElementById('readerBack3').addEventListener('click',closeCodexReader);setTimeout(()=>{codexState.entranceComplete=true;setPageReady('codex');document.querySelectorAll('#articleList3 .article-btn').forEach(b=>{b.style.animation='none';b.style.opacity='1';b.style.transform='none';});},2000);}

/* ═══════════════════════════════════ YELLOW GALLERY INIT (son4) ═══════════════════════════════════ */
let galleryState={images:GALLERY_IMAGES,activeId:null,isOpen:false,mx:0.5,my:0.5,onCard:false,raf:null,entranceComplete:false,scrollTick:false};
function renderGallery(){const grid=document.getElementById('galleryGrid4');grid.innerHTML=galleryState.images.map((img,i)=>`<div class="film-card" data-id="${img.id}" style="animation-delay:${0.45+i*0.07}s"><div class="film-strip"><div class="film-edge"><div class="sprocket-holes"></div></div><div class="film-image-area"><img src="${img.src}" alt="${img.title}" loading="${i<4?'eager':'lazy'}"><span class="film-frame-num">${String(i+1).padStart(2,'0')}</span></div><div class="film-edge"><div class="sprocket-holes"></div></div></div><div class="film-caption"><div class="fc-title">${img.title}</div><div class="fc-sub">${img.sub}</div></div><div class="film-card-corner"></div></div>`).join('');document.getElementById('frameCount4').textContent=galleryState.images.length+' FRAMES AVAILABLE';grid.querySelectorAll('.film-card').forEach(card=>{card.addEventListener('click',()=>openLightbox4(card.getAttribute('data-id')));});}
function openLightbox4(id){const img=galleryState.images.find(i=>i.id===id);if(!img)return;galleryState.activeId=id;galleryState.isOpen=true;document.getElementById('lightboxImg4').src=img.src;document.getElementById('lcTitle4').textContent=img.title;document.getElementById('lcSub4').textContent=img.caption;document.getElementById('lightboxOverlay4').classList.add('active');document.getElementById('lightboxClose4').classList.add('active');document.getElementById('lightboxCaption4').classList.add('active');document.getElementById('filmGlare4').classList.add('active');if(!galleryState.raf)galleryState.raf=requestAnimationFrame(updateTilt4);}
function closeLightbox4(){if(!galleryState.isOpen)return;galleryState.isOpen=false;galleryState.activeId=null;document.getElementById('lightboxOverlay4').classList.remove('active');document.getElementById('lightboxClose4').classList.remove('active');document.getElementById('lightboxCaption4').classList.remove('active');document.getElementById('filmGlare4').classList.remove('active');galleryState.onCard=false;if(galleryState.raf){cancelAnimationFrame(galleryState.raf);galleryState.raf=null;}}
function updateTilt4(){galleryState.raf=requestAnimationFrame(updateTilt4);if(!galleryState.isOpen)return;const card=document.getElementById('lightboxFilmCard4'),stage=document.getElementById('lightboxStage4'),sr=stage.getBoundingClientRect();const cx=galleryState.onCard?Math.max(0,Math.min(1,(galleryState.mx-sr.left)/sr.width)):0.5,cy=galleryState.onCard?Math.max(0,Math.min(1,(galleryState.my-sr.top)/sr.height)):0.5;const ry=(cx-0.5)*22,rx=((cy-0.5)*-1)*16;card.style.transform=`perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;const glare=document.getElementById('filmGlare4');if(glare&&galleryState.onCard){glare.style.background=`radial-gradient(ellipse at ${cx*100}% ${cy*100}%,rgba(255,255,255,0.18) 0%,rgba(255,240,200,0.08) 25%,transparent 55%)`;}}
function initGallery(){renderGallery();document.getElementById('lightboxClose4').addEventListener('click',closeLightbox4);document.getElementById('lightboxOverlay4').addEventListener('click',function(e){if(e.target===this||e.target===document.getElementById('lightboxStage4'))closeLightbox4();});document.addEventListener('keydown',function(e){if(!galleryState.isOpen)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeLightbox4();return;}if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();const ci=galleryState.images.findIndex(i=>i.id===galleryState.activeId);if(ci>=0){const ni=(ci+1)%galleryState.images.length;openLightbox4(galleryState.images[ni].id);}}else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();const ci=galleryState.images.findIndex(i=>i.id===galleryState.activeId);if(ci>=0){const ni=(ci-1+galleryState.images.length)%galleryState.images.length;openLightbox4(galleryState.images[ni].id);}}});window.addEventListener('mousemove',function(e){galleryState.mx=e.clientX;galleryState.my=e.clientY;if(galleryState.isOpen){const sr=document.getElementById('lightboxStage4').getBoundingClientRect();galleryState.onCard=e.clientX>=sr.left&&e.clientX<=sr.right&&e.clientY>=sr.top&&e.clientY<=sr.bottom;}},{passive:true});setTimeout(()=>{galleryState.entranceComplete=true;setPageReady('gallery');},2200);}

/* ═══════════════════════════════════ SEARCH BAR ═══════════════════════════════════ */
const searchWrap=document.getElementById('searchWrap'),searchInput=document.getElementById('searchInput'),
  searchClear=document.getElementById('searchClear'),searchEnterBtn=document.getElementById('searchEnterBtn');
let searchQuery='';
function pinControls(){if(fixedControls)fixedControls.classList.add('search-pinned');}
function unpinControls(){if(fixedControls)fixedControls.classList.remove('search-pinned');}
function showSearchBar(){if(searchWrap)searchWrap.classList.add('visible');}
function hideSearchBar(){if(searchWrap){searchWrap.classList.remove('visible');searchInput.value='';searchQuery='';updateSearchClear();unpinControls();}}
function updateSearchClear(){if(!searchClear)return;
if(searchQuery.length>0){searchClear.classList.add('visible');searchWrap.classList.add('searching');}else{searchClear.classList.remove('visible');searchWrap.classList.remove('searching');}}
function applySearch(){
if(!searchQuery){/* restore full list */
if(currentPage==='archive')renderArticleButtons(archiveState.articles);
else if(currentPage==='codex')renderCodexButtonsRender();
else if(currentPage==='gallery')renderGalleryFull();
unpinControls();return;}
const q=searchQuery.toLowerCase();
if(currentPage==='archive'){
const filtered=archiveState.articles.filter(a=>a.title.toLowerCase().includes(q));
renderArticleButtons(filtered);
}else if(currentPage==='codex'){
const filtered=codexState.articles.filter(a=>a.title.toLowerCase().includes(q));
renderCodexButtonsFiltered(filtered);
}else if(currentPage==='gallery'){
const filtered=galleryState.images.filter(g=>g.title.toLowerCase().includes(q));
renderGalleryFiltered(filtered);
}
/* keep controls pinned while results are showing */
setTimeout(unpinControls,2500);
}
function renderCodexButtonsRender(){renderCodexButtons();}
function renderCodexButtonsFiltered(articles){const list=document.getElementById('articleList3'),count=document.getElementById('articleCount3');list.innerHTML=articles.map((a,i)=>`<button class="article-btn" data-id="${a.id}" style="animation-delay:${0.5+i*0.1}s"><div class="art-meta"><span class="art-date">${a.date}</span><span class="art-time">${a.time}</span>${a.tags.map(t=>`<span class="art-tag">#${t}</span>`).join('')}</div><div class="art-cover-row"><div class="art-cover-icon">${a.cover}</div><div class="art-info"><div class="art-title">${a.title}</div><div class="art-excerpt">${a.excerpt}</div></div></div><span class="art-arrow">▶</span></button>`).join('');count.textContent=articles.length+' ENTRIES AVAILABLE';list.querySelectorAll('.article-btn').forEach(b=>{b.addEventListener('click',()=>openCodexArticle(b.getAttribute('data-id')));});}
function renderGalleryFull(){renderGallery();}
function renderGalleryFiltered(images){const grid=document.getElementById('galleryGrid4');grid.innerHTML=images.map((img,i)=>`<div class="film-card" data-id="${img.id}" style="animation-delay:${0.45+i*0.07}s"><div class="film-strip"><div class="film-edge"><div class="sprocket-holes"></div></div><div class="film-image-area"><img src="${img.src}" alt="${img.title}" loading="${i<4?'eager':'lazy'}"><span class="film-frame-num">${String(i+1).padStart(2,'0')}</span></div><div class="film-edge"><div class="sprocket-holes"></div></div></div><div class="film-caption"><div class="fc-title">${img.title}</div><div class="fc-sub">${img.sub}</div></div><div class="film-card-corner"></div></div>`).join('');document.getElementById('frameCount4').textContent=images.length+' FRAMES AVAILABLE';grid.querySelectorAll('.film-card').forEach(card=>{card.addEventListener('click',()=>openLightbox4(card.getAttribute('data-id')));});}
function initSearchBar(){
if(!searchInput||!searchClear)return;
searchInput.addEventListener('focus',()=>{pinControls();});
searchInput.addEventListener('blur',()=>{if(!searchQuery)unpinControls();});
searchInput.addEventListener('input',function(){searchQuery=this.value.trim();updateSearchClear();applySearch();if(searchQuery)pinControls();});
searchClear.addEventListener('click',function(){searchInput.value='';searchQuery='';updateSearchClear();applySearch();searchInput.focus();});
if(searchEnterBtn){searchEnterBtn.addEventListener('click',function(){applySearch();unpinControls();});}
searchInput.addEventListener('keydown',function(e){
if(e.key==='Enter'){e.preventDefault();applySearch();unpinControls();}
if(e.key==='Escape'){e.stopPropagation();searchInput.value='';searchQuery='';updateSearchClear();applySearch();unpinControls();searchInput.blur();}
});
}

/* ═══════════════════════════════════ INIT ═══════════════════════════════════ */
const fixedControls=document.querySelector('.fixed-controls');
/* ═══════════════════════════════════ SPLASH SCREEN ═══════════════════════════════════ */
function initSplashScreen(){const splash=document.getElementById('splashScreen');if(!splash)return;
let done=false;
function hideSplash(){if(done)return;done=true;
setTimeout(()=>{splash.classList.add('fade-out');
setTimeout(()=>{if(splash.parentNode)splash.parentNode.removeChild(splash);},700);
initFadeIn();},400);}
function poll(){if(document.readyState==='complete'){hideSplash();}else{requestAnimationFrame(poll);}}
poll();setTimeout(hideSplash,3000);}
function initFadeIn(){appWrapper.classList.add('visible');if(angleDisplay)angleDisplay.classList.add('revealed');setTimeout(revealScrollHint,300);if(fixedControls){fixedControls.classList.add('revealed');setTimeout(()=>fixedControls.classList.remove('revealed'),2200);}}
function init(){buildButtons();applyScale();initScrollHandler();initKeyboardHandler();initTouchHandler();initResizeHandler();initMusicControl();initEscButton();initPersonaScroll();initSparkle();initArchive();initCodex();initGallery();initSearchBar();curtResize();initSplashScreen();window._cmInit();updateAllButtons(currentAngle);requestAnimationFrame(orbitalAnimate);resizeWaterCanvas();window.addEventListener('resize',resizeWaterCanvas);requestAnimationFrame(waterAnimate);updatePersonaSections();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

window.OrbitalExperience={getButtons:()=>btnDataList,getWrapper:()=>appWrapper,getAngle:()=>currentAngle,setTargetAngle:a=>{targetAngle=a;},toggleMusic:()=>{togglePlay();},isMusicPlaying:()=>musicPlaying,getCurrentTrack:()=>currentTrackIdx,getPlaylist:()=>AUDIO_PLAYLIST,nextTrack:()=>playNext(),prevTrack:()=>playPrev(),refreshScale:applyScale,isSnapActive:()=>snapActive,hasScrolled:()=>hasScrolled,getCurrentPage:()=>currentPage,goToPersona:()=>{if(currentPage!=='persona')triggerWaterTransition('toPersona');},goToArchive:()=>{if(currentPage!=='archive')triggerPopTransition('toArchive');},goToCodex:()=>{if(currentPage!=='codex')triggerCurtainTransition('toCodex');},goToGallery:()=>{if(currentPage!=='gallery')triggerDiagTransition('toGallery');},goToOrbital:()=>{if(currentPage==='persona')triggerWaterTransition('toOrbital');else if(currentPage==='archive')triggerPopTransition('toOrbital');else if(currentPage==='codex')triggerCurtainTransition('toOrbital');else if(currentPage==='gallery')triggerDiagTransition('toOrbital');}};
