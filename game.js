(()=>{const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg',D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),H=(x,y)=>(Math.atan2(x,-y)*180/Math.PI+360)%360;function renderTerrain(){
 const base=$('#terrainBase'),grid=$('#geometricGrid'),feat=$('#terrainFeatures');
 if(!base)return;
 while(base.firstChild)base.removeChild(base.firstChild);
 if(grid)while(grid.firstChild)grid.removeChild(grid.firstChild);
 if(feat)while(feat.firstChild)feat.removeChild(feat.firstChild);
 const im=document.createElementNS(NS,'image');
 im.setAttribute('href','assets/maps/oa-kestrel-basemap.png');
 im.setAttribute('x','0');im.setAttribute('y','0');im.setAttribute('width','900');im.setAttribute('height','600');
 im.setAttribute('preserveAspectRatio','xMidYMid slice');im.style.pointerEvents='none';base.appendChild(im);
 if(grid){
   const r=52, dx=1.5*r, dy=Math.sqrt(3)*r;
   const points=(cx,cy)=>Array.from({length:6},(_,i)=>{
     const a=Math.PI/180*(60*i);
     return (cx+r*Math.cos(a)).toFixed(2)+','+(cy+r*Math.sin(a)).toFixed(2);
   }).join(' ');
   let col=0;
   for(let cx=0;cx<=900+r;cx+=dx,col++){
     const offset=(col%2)*dy/2;
     for(let cy=-dy;cy<=600+dy;cy+=dy){
       const poly=document.createElementNS(NS,'polygon');
       poly.setAttribute('points',points(cx,cy+offset));
       poly.setAttribute('class','geoHex');
       grid.appendChild(poly);
     }
   }
 }
}renderTerrain();const A={x:145,y:510,r:118,speed:82,mode:'IDLE',dest:null,heading:0,lastMove:performance.now()};let B=[],T=[],sel=null,col=null,pct=0,score=0,integrity=100,resolved=0,ints=0,next=1,campaignMission=null,campaignIds=0,campaignCorrect=0,campaignThreatResolved=0,campaignNonThreatResolved=0,campaignStationaryAssessed=0,campaignStationarySpawned=0,campaignProximityAssessed=0,campaignCollectionInterrupted=0,campaignCompromise=0,campaignFinished=false,arcadeStreak=0,arcadeBestStreak=0,arcadeCorrect=0,arcadeWrong=0,arcadeStart=0,arcadeThreatLevel=1,arcadeNextLevel=0,intelDropOffered=false,intelDropActive=false,intelDropAt=0,intelDropExpires=0,intelFusionUntil=0,running=false,start=0,lastSpawn=0,last=performance.now(),phase=1,ct=null,ci=null,lastUi=0,stallLogged=false;const C={raf:0,isr:0,map:0,track:0,orders:0,errors:0,lastRaf:performance.now(),maxGap:0,fps:0,fpsFrames:0,fpsAt:performance.now()};let dbg=[],lastDiag=0;function rec(kind,msg){let ts=((performance.now()-(start||performance.now()))/1000).toFixed(3);dbg.push(`${ts}s | ${kind} | ${msg}`);if(dbg.length>500)dbg.shift()}window.addEventListener('error',e=>{C.errors++;rec('ERROR',`${e.message} @ ${e.filename}:${e.lineno}:${e.colno}`)});window.addEventListener('unhandledrejection',e=>{C.errors++;rec('REJECTION',String(e.reason))});function log(s){let d=document.createElement('div');d.textContent='> '+s;$('#log').prepend(d);while($('#log').children.length>7)$('#log').lastChild.remove()}function banner(s,d=1000){$('#bannerText').textContent=s;$('#banner').classList.add('show');setTimeout(()=>$('#banner').classList.remove('show'),d)}
// v0.6.2.1 AUDIO IDENTITY // retained tactile/menu SFX + recorded background
let audioCtx=null,audioReady=false,audioEnabled=true,lastContactTone=0,lastWarningTone=0;
// v0.6.2 TACTICAL SCORE // beat-first score + tactile UI transients
let musicMode='off',musicNoiseBuffer=null,lastHoverTone=0;
const backgroundMusic=new Audio('assets/audio/mission-background.m4a');backgroundMusic.loop=true;backgroundMusic.preload='auto';backgroundMusic.volume=.34;
function makeNoiseBuffer(){if(!audioCtx)return null;const len=Math.max(1,Math.floor(audioCtx.sampleRate*2)),b=audioCtx.createBuffer(1,len,audioCtx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1);return b}
function audioUnlock(){if(!audioEnabled)return;try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();audioReady=true;if(!musicNoiseBuffer)musicNoiseBuffer=makeNoiseBuffer();musicSetMode((running&&!window.CP_MENU)?'mission':'menu')}catch(e){rec('AUDIO_FAIL',String(e));audioEnabled=false}}
function routeGain(vol,t,dur,dest=null,attack=.003){const g=audioCtx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);g.connect(dest||audioCtx.destination);return g}
function tone(freq=220,dur=.06,vol=.018,type='sine',delay=0,endFreq=null,dest=null){if(!audioEnabled||!audioReady||!audioCtx)return;const t=audioCtx.currentTime+delay,o=audioCtx.createOscillator(),g=routeGain(vol,t,dur,dest);o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+dur);o.connect(g);o.start(t);o.stop(t+dur+.03)}
function noiseBurst(dur=.045,vol=.009,cutoff=1100,delay=0,filterType='bandpass',q=1.2,dest=null){if(!audioReady||!audioCtx||!musicNoiseBuffer)return;const t=audioCtx.currentTime+delay,n=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=routeGain(vol,t,dur,dest);n.buffer=musicNoiseBuffer;f.type=filterType;f.frequency.value=cutoff;f.Q.value=q;n.connect(f);f.connect(g);n.start(t);n.stop(t+dur+.02)}
function uiTick(){noiseBurst(.018,.022,2350,0,'highpass',.7);noiseBurst(.010,.010,4200,.004,'bandpass',2.2)}
function uiClack(){noiseBurst(.038,.034,1450,0,'bandpass',1.4);noiseBurst(.025,.020,420,0,'lowpass',.8);tone(72,.038,.012,'triangle',.004,55)}
function sound(kind){if(!audioReady)return;switch(kind){
 case'hover':uiTick();break;
 case'click':uiClack();break;
 case'acquire':noiseBurst(.026,.016,1500);tone(132,.04,.010,'square',.008,118);break;
 case'order':noiseBurst(.022,.013,1050);tone(105,.035,.009,'triangle',.006,92);break;
 case'contact':{let n=performance.now();if(n-lastContactTone<650)return;lastContactTone=n;noiseBurst(.020,.009,1900);tone(220,.025,.006,'square',.005,205);break;}
 case'classify':noiseBurst(.040,.015,1150);noiseBurst(.025,.008,1850,.032);break;
 case'correct':noiseBurst(.025,.012,900);tone(96,.045,.008,'triangle',.006,88);break;
 case'wrong':tone(92,.13,.026,'sawtooth',0,64);noiseBurst(.07,.014,360);break;
 case'warning':{let n=performance.now();if(n-lastWarningTone<1800)return;lastWarningTone=n;tone(92,.09,.022,'square');tone(92,.09,.022,'square',.15);break;}
 case'intel':noiseBurst(.050,.016,1650);noiseBurst(.035,.011,1100,.065);tone(118,.035,.007,'square',.105,108);break;
 case'fusion':tone(68,.18,.018,'sawtooth',0,96);noiseBurst(.08,.010,620,.10);break;
 case'level':tone(72,.14,.026,'square');noiseBurst(.07,.012,430,.06);tone(72,.12,.020,'square',.20);break;
 case'degraded':tone(64,.30,.034,'sawtooth',0,46);noiseBurst(.16,.016,290);break;
 case'fail':tone(58,.48,.036,'sawtooth',0,36);tone(43,.62,.028,'sine',.18,32);noiseBurst(.24,.014,240,.06);break;
 }}
function musicSetMode(mode){
 musicMode=mode;
 if(mode==='off'){backgroundMusic.pause();return}
 backgroundMusic.volume=window.CP_PAUSED?.16:.34;
 const play=backgroundMusic.play();if(play&&play.catch)play.catch(()=>{});
}
function installMenuButtonAudio(){document.querySelectorAll('button').forEach(btn=>{if(btn.dataset.audioUi)return;btn.dataset.audioUi='1';btn.addEventListener('mouseenter',()=>{if(btn.disabled||!audioReady)return;const n=performance.now();if(n-lastHoverTone<45)return;lastHoverTone=n;sound('hover')});btn.addEventListener('pointerdown',()=>{audioUnlock();if(!btn.disabled){setTimeout(()=>sound('click'),0)}},{capture:true})})}
installMenuButtonAudio();
document.addEventListener('pointerdown',audioUnlock,{capture:true});function point(e){let p=$('#map').createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform($('#map').getScreenCTM().inverse())}function valid(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)}function stopCollect(){if(ct)clearTimeout(ct);if(ci)clearInterval(ci);ct=ci=null;if(col)col.collecting=false;col=null;pct=0}function acquire(){C.isr++;rec('ISR_CLICK',`mode=${A.mode} pos=${A.x.toFixed(1)},${A.y.toFixed(1)}`);stopCollect();sel=null;A.mode='ISR_SELECTED';A.dest=null;stallLogged=false;log('ISR CONTROL // ACQUIRED');sound('acquire');ui(true)}function order(p){C.orders++;rec('ORDER',valid(p)?`to=${p.x.toFixed(1)},${p.y.toFixed(1)}`:'INVALID');if(!valid(p)){A.dest=null;A.mode='ON_STATION';return}A.dest={x:Math.max(125,Math.min(775,p.x)),y:Math.max(125,Math.min(525,p.y))};A.heading=H(A.dest.x-A.x,A.dest.y-A.y);A.mode='ENROUTE';A.lastMove=performance.now();stallLogged=false;log('ISR ORDER // DESTINATION SET');sound('order')}function makeBlue(id,x,y){let b={id,x,y,exposure:0,degraded:false},g=document.createElementNS(NS,'g');g.setAttribute('transform',`translate(${x} ${y})`);g.innerHTML=`<circle r="24" fill="#0d1418" stroke="#4da3ff" stroke-width="2"/><path d="M-10 -10H10V10H-10ZM-5 -5H5V5H-5Z" fill="none" stroke="#4da3ff" stroke-width="2"/><text x="31" y="4" font-size="11" fill="#4da3ff">${id}</text>`;$('#blueSites').append(g);b.el=g;b.circle=g.querySelector('circle');b.icon=g.querySelector('path');b.label=g.querySelector('text');B.push(b)}function initBlue(){$('#blueSites').textContent='';B=[];
makeBlue('BLU-FOB',705,485);makeBlue('BLU-C2',600,170);makeBlue('BLU-LOG',300,310);
makeBlue('BLU-AIR',775,285);makeBlue('BLU-AOB',425,205);
B.forEach(b=>{b.exposure=0;b.degraded=false;cpRenderBlueSite(b)})}
function cpNotice(title,detail,kind='intel'){
 const stack=$('#notificationStack');if(!stack)return;
 const n=document.createElement('div');n.className='op-notice '+kind;
 n.innerHTML='<b>'+title+'</b><span>'+detail+'</span>';stack.appendChild(n);
 while(stack.children.length>4)stack.firstElementChild.remove();
 setTimeout(()=>{n.classList.add('leaving');setTimeout(()=>n.remove(),350)},2600);
}function truth(){let r=Math.random();if(campaignMission==='ARCADE'){let threat=Math.min(.72,.42+(arcadeThreatLevel-1)*.045);return r<threat/2?'HOSTILE':r<threat?'IRREGULAR':r<threat+(1-threat)/2?'NEUTRAL':'FRIENDLY'}if(campaignMission==='01-05')return r<.30?'HOSTILE':r<.60?'IRREGULAR':r<.80?'NEUTRAL':'FRIENDLY';if(campaignMission==='01-01'||campaignMission==='01-02'||campaignMission==='01-03'||campaignMission==='01-04')return r<.25?'HOSTILE':r<.50?'IRREGULAR':r<.75?'NEUTRAL':'FRIENDLY';if(phase===1)return r<.25?'HOSTILE':r<.38?'IRREGULAR':r<.68?'NEUTRAL':'FRIENDLY';if(phase===2)return r<.30?'HOSTILE':r<.48?'IRREGULAR':r<.75?'NEUTRAL':'FRIENDLY';return r<.34?'HOSTILE':r<.58?'IRREGULAR':r<.80?'NEUTRAL':'FRIENDLY'}function parms(){
 if(campaignMission==='ARCADE'){let l=Math.max(1,arcadeThreatLevel);return {gap:Math.max(2.4,8.5-(l-1)*.7),cap:Math.min(10,5+Math.floor((l-1)/2))}}
 if(campaignMission==='01-05')return phase===1?{gap:8.0,cap:6}:phase===2?{gap:5.5,cap:7}:{gap:3.8,cap:8};
 return phase===1?{gap:9.5,cap:5}:phase===2?{gap:6.5,cap:6}:{gap:4.5,cap:7}
}const PREFIX={UNKNOWN:'UNK',NEUTRAL:'NTL',HOSTILE:'HST',IRREGULAR:'IRG',FRIENDLY:'FRI'};function designation(t){let n=String(t.id).split('-').pop();return (t.type==='UNKNOWN'?'UNK':PREFIX[t.type])+'-'+n}function color(t){return t.type==='HOSTILE'?'#ff5b55':t.type==='IRREGULAR'?'#d8a83e':t.type==='NEUTRAL'?'#55d66b':t.type==='FRIENDLY'?'#4da3ff':'#dce5e8'}function spawn(stationary=null){let p=parms();
if(stationary===null){
  if(campaignMission==='01-02'){
    stationary=campaignStationarySpawned<4 ? true : Math.random()<.45;
  }else stationary=Math.random()<.3;
}if(!running||T.filter(t=>!t.done).length>=p.cap)return;let x,y,vx=0,vy=0;if(stationary){x=130+Math.random()*640;y=90+Math.random()*460}else{let side=Math.floor(Math.random()*4),s=1.5+Math.random()*1.9;if(side===0){x=40;y=60+Math.random()*520;vx=s;vy=(Math.random()-.5)*1.3}else if(side===1){x=860;y=60+Math.random()*520;vx=-s;vy=(Math.random()-.5)*1.3}else if(side===2){x=60+Math.random()*780;y=40;vx=(Math.random()-.5)*1.3;vy=s}else{x=60+Math.random()*780;y=610;vx=(Math.random()-.5)*1.3;vy=-s}}let tr=truth(),t={id:'UNK-'+String(next++).padStart(3,'0'),x,y,vx,vy,stationary,truth:tr,type:'UNKNOWN',done:false,collecting:false,enemyRange:stationary?145:105,ring:null,bornAt:performance.now(),proxSite:null,proxSince:0,proxAssessed:false,hostileCollect:false,collectStarted:0,compromiseAdded:0,stallX:null,stallY:null,stallAt:performance.now(),stallLogged:false};
if(campaignMission==='01-03'||campaignMission==='01-04'||campaignMission==='01-05'||campaignMission==='ARCADE'){
  const siteList=B.map(b=>({name:b.id,x:b.x,y:b.y}));
  if(siteList.length&&Math.random()<(campaignMission==='ARCADE'?.72:(campaignMission==='01-05'?.70:.58))){let ps=siteList[Math.floor(Math.random()*siteList.length)];t.proxSite=ps.name;t.x=ps.x+(Math.random()-.5)*105;t.y=ps.y+(Math.random()-.5)*105;t.proxSince=performance.now();t.stationary=Math.random()<.62}
}if(campaignMission==='01-02'&&stationary)campaignStationarySpawned++;if(tr==='IRREGULAR'&&!stationary&&Math.random()<.72){let target=B[Math.floor(Math.random()*B.length)],dx=target.x-x,dy=target.y-y,d=Math.hypot(dx,dy),s=2.2+Math.random();t.vx=dx/d*s;t.vy=dy/d*s}let g=document.createElementNS(NS,'g'),hit=document.createElementNS(NS,'circle'),v=document.createElementNS(NS,'line'),c=document.createElementNS(NS,'circle'),d=document.createElementNS(NS,'path'),tx=document.createElementNS(NS,'text');g.style.cursor='pointer';g.style.pointerEvents='all';hit.setAttribute('r','29');hit.setAttribute('fill','transparent');v.setAttribute('stroke-opacity','.55');v.setAttribute('stroke-width','1.5');v.style.pointerEvents='none';c.setAttribute('r','17');c.setAttribute('fill','#0d1418');c.setAttribute('stroke-width','2');c.style.pointerEvents='none';d.setAttribute('d',stationary?'M-9 -9H9V9H-9Z':'M0 -8L8 0L0 8L-8 0Z');d.setAttribute('fill','none');d.setAttribute('stroke-width','2');d.style.pointerEvents='none';tx.setAttribute('x','25');tx.setAttribute('y','4');tx.setAttribute('font-size','11');tx.style.pointerEvents='none';g.append(hit,v,c,d,tx);Object.assign(t,{el:g,v,c,d,tx});g.addEventListener('pointerdown',e=>{e.preventDefault();C.track++;rec('TRACK_POINTER',`${t.id} mode=${A.mode}`);e.stopPropagation();if(!running)return;if(A.mode==='ISR_SELECTED'){order({x:t.x,y:t.y});ui(true);return}sel=t;ui(true)});$('#tracks').append(g);T.push(t);log('NEW '+(stationary?'STATIC ':'')+'TRACK // '+t.id);sound('contact')}function ensureRing(t){let threat=t.type==='HOSTILE'||t.type==='IRREGULAR';if(threat&&!t.ring){let c=document.createElementNS(NS,'circle');c.setAttribute('r',t.enemyRange);c.setAttribute('fill-opacity','.025');c.setAttribute('stroke-opacity','.36');c.setAttribute('stroke-dasharray','5 7');$('#enemyRings').append(c);t.ring=c}if(t.ring){t.ring.setAttribute('visibility',threat&&!t.done?'visible':'hidden');if(threat){let c=color(t);t.ring.setAttribute('cx',t.x);t.ring.setAttribute('cy',t.y);t.ring.setAttribute('fill',c);t.ring.setAttribute('stroke',c)}}}function draw(t){if(t.done){t.el.setAttribute('visibility','hidden');ensureRing(t);return}t.el.setAttribute('visibility','visible');t.el.setAttribute('transform',`translate(${t.x} ${t.y})`);let inside=D(A,t)<=cpEffectiveISRRadius(),c=color(t);t.c.setAttribute('r',sel===t?'22':'17');t.c.setAttribute('stroke',c);t.d.setAttribute('stroke',c);t.tx.setAttribute('fill',c);t.v.setAttribute('stroke',c);t.v.setAttribute('x2',t.vx*13);t.v.setAttribute('y2',t.vy*13);t.tx.textContent=designation(t)+' // '+(t.collecting?'COLLECTING '+pct+'%':t.type==='UNKNOWN'?(inside?'IN RANGE':'UNKNOWN'):t.type);ensureRing(t)}function pulse(k){let c=k==='HOSTILE'?'#ff5b55':k==='IRREGULAR'?'#d8a83e':k==='NEUTRAL'?'#55d66b':'#4da3ff';$('#sr').setAttribute('stroke',c);$('#sf').setAttribute('fill',c);$('#sr').setAttribute('stroke-width','5');$('#sf').setAttribute('fill-opacity','.13');setTimeout(()=>{$('#sr').setAttribute('stroke','currentColor');$('#sf').setAttribute('fill','currentColor');$('#sr').setAttribute('stroke-width','2.4');$('#sf').setAttribute('fill-opacity','.025')},850)}function collect(){if(!running||!sel||sel.done||sel.type!=='UNKNOWN'||D(A,sel)>A.r||col)return;col=sel;col.collecting=true;pct=0;let st=Date.now();ci=setInterval(()=>{pct=Math.min(99,Math.floor((Date.now()-st)/10));ui(true)},80);ct=setTimeout(()=>{clearInterval(ci);ci=ct=null;col.collecting=false;col.type=col.truth;score+=25;if(campaignMission==='01-01'||campaignMission==='01-02')campaignIds++;
if(campaignMission==='01-02'&&col.stationary)campaignStationaryAssessed++;
if(campaignMission==='01-03'&&col.proxSite&&!col.proxAssessed){col.proxAssessed=true;campaignProximityAssessed++;}
pct=100;pulse(col.type);ensureRing(col);log('CLASSIFIED // '+designation(col)+' // '+col.type);sound('classify');col=null;if(campaignMission==='01-02')cpCheck0102();if(campaignMission==='01-03')cpCheck0103();ui(true)},1000)}function cpDecisionFloat(t,ok){
 const layer=$('#decisionFeedback');if(!layer||!t)return;
 const n=document.createElementNS(NS,'text');
 let cls='bad';
 if(ok)cls=t.truth==='HOSTILE'?'good-hostile':t.truth==='IRREGULAR'?'good-irregular':t.truth==='FRIENDLY'?'good-friendly':'good-neutral';
 n.setAttribute('class','decision-float '+cls);
 n.setAttribute('x',t.x);n.setAttribute('y',t.y-24);
 n.textContent=ok?'+1':'-1';layer.appendChild(n);
 setTimeout(()=>n.remove(),1150);
}
function decide(a){
 if(!running||!sel||sel.done||sel.type==='UNKNOWN')return;
 const target=sel;
 const threat=target.type==='HOSTILE'||target.type==='IRREGULAR';
 const ok=(threat&&a==='INTERCEPT')||(!threat&&a==='CLEAR');
 if(ok){
   if(campaignMission==='ARCADE'){arcadeCorrect++;arcadeStreak++;arcadeBestStreak=Math.max(arcadeBestStreak,arcadeStreak);score+=Math.min(250,arcadeStreak*10);}
   score+=100;
   if(campaignMission==='01-01'||campaignMission==='01-02'||campaignMission==='01-03'||campaignMission==='01-04'||campaignMission==='01-05'||campaignMission==='ARCADE'){
     campaignCorrect++;
     if(threat)campaignThreatResolved++;else campaignNonThreatResolved++;
   }
   if(cpThreatMission()&&threat&&target.hostileCollect){
     campaignCollectionInterrupted++;
     const before=campaignCompromise;
     campaignCompromise=Math.max(cpCompromiseFloor(),campaignCompromise-2);
     const reduced=before-campaignCompromise;
     log('HOSTILE COLLECTION DISRUPTED // AO COMPROMISE -'+reduced.toFixed(1)+'%');
     cpRecoveryFlash('HOSTILE COLLECTION DISRUPTED','AO COMPROMISE -'+reduced.toFixed(1)+'%','HOSTILE');
   }
   if(cpThreatMission()&&!threat){
     if(target.truth==='FRIENDLY'){
       const before=campaignCompromise;campaignCompromise=Math.max(cpCompromiseFloor(),campaignCompromise-5);
       const reduced=before-campaignCompromise;
       log('FRIENDLY PRESENCE CONFIRMED // AO COMPROMISE -'+reduced.toFixed(1)+'%');
       cpRecoveryFlash('FRIENDLY PRESENCE CONFIRMED','AO COMPROMISE -'+reduced.toFixed(1)+'%','FRIENDLY');
     }else if(target.truth==='NEUTRAL'){
       const before=campaignCompromise;campaignCompromise=Math.max(cpCompromiseFloor(),campaignCompromise-3);
       const reduced=before-campaignCompromise;
       log('NEUTRAL REPORTING CORROBORATED // AO COMPROMISE -'+reduced.toFixed(1)+'%');
       cpRecoveryFlash('NEUTRAL REPORTING CORROBORATED','AO COMPROMISE -'+reduced.toFixed(1)+'%','NEUTRAL');
     }
   }
   if(threat)ints++;
   log(a+' // '+designation(target)+' // CORRECT');
 }else{
   if(campaignMission==='ARCADE'){arcadeWrong++;arcadeStreak=0;}
   score-=50;integrity=Math.max(0,integrity-20);
   log(a+' // '+designation(target)+' // ERROR');
 }
 sound(ok?'correct':'wrong');
 cpDecisionFloat(target,ok);
 target.done=true;ensureRing(target);resolved++;
 if(ok){
   if(campaignMission==='01-01')cpCheck0101();
   else if(campaignMission==='01-02')cpCheck0102();
   else if(campaignMission==='01-03')cpCheck0103();
   else if(campaignMission==='01-04')cpCheck0104();
   else if(campaignMission==='01-05')cpCheck0105();
 }
 if(campaignMission==='ARCADE'&&integrity<=0&&!campaignFinished)arcadeFinish('INTELLIGENCE FAILURE');
 sel=null;ui(true);
}
function compromise(){return B.reduce((a,b)=>a+b.exposure,0)/B.length}let cpRecoveryTimer=0;
function cpThreatMission(){return campaignMission==='01-04'||campaignMission==='01-05'||campaignMission==='ARCADE'}
function cpRecoveryFlash(title,detail,kind){
 cpNotice(title,detail,kind==='FRIENDLY'?'friendly':kind==='NEUTRAL'?'neutral':'hostile');
}
function cpIntelDropReset(){
 intelDropOffered=false;intelDropActive=false;intelDropAt=performance.now()+65000;intelDropExpires=0;intelFusionUntil=0;
 const d=$('#intelDrop'),b=$('#intelFusionBadge');if(d)d.classList.add('hidden');if(b)b.classList.add('hidden');
}
function cpIntelDropOffer(){
 if(!cpThreatMission()||intelDropOffered||campaignFinished)return;
 intelDropOffered=true;intelDropActive=true;intelDropExpires=performance.now()+10000;
 const d=$('#intelDrop');if(d)d.classList.remove('hidden');
 log('INTEL DROP // NEW REPORTING AVAILABLE');sound('intel');cpNotice('INTEL DROP','NEW REPORTING AVAILABLE','intel');
}
function cpIntelDropChoose(kind){
 if(!intelDropActive)return;
 intelDropActive=false;const d=$('#intelDrop');if(d)d.classList.add('hidden');
 if(kind==='MITIGATE'){
   campaignCompromise=Math.max(cpCompromiseFloor(),campaignCompromise-10);
   log('INTEL DROP // MITIGATION APPLIED // AO COMPROMISE -10%');cpNotice('INTEL DROP // MITIGATE','AO COMPROMISE -10%','intel');
 }else{
   intelFusionUntil=performance.now()+20000;
   const b=$('#intelFusionBadge');if(b)b.classList.remove('hidden');
   log('INTEL DROP // ISR FUSION ACTIVE // 20 SEC');sound('fusion');cpNotice('INTEL DROP // EXPLOIT','ISR FUSION ACTIVE // 20 SEC','intel');
 }
 if(campaignMission==='ARCADE'){intelDropOffered=false;intelDropAt=performance.now()+70000+Math.random()*25000;}
}
function cpIntelDropTick(){
 if(!cpThreatMission()||campaignFinished)return;
 const now=performance.now();
 if(!intelDropOffered&&intelDropAt&&now>=intelDropAt)cpIntelDropOffer();
 if(intelDropActive){
   const left=Math.max(0,Math.ceil((intelDropExpires-now)/1000));
   const t=$('#intelDropTimer');if(t)t.textContent='REPORT EXPIRES // '+left;
   if(now>=intelDropExpires){intelDropActive=false;const d=$('#intelDrop');if(d)d.classList.add('hidden');log('INTEL DROP EXPIRED');cpNotice('INTEL DROP','REPORT EXPIRED','intel');if(campaignMission==='ARCADE'){intelDropOffered=false;intelDropAt=now+70000+Math.random()*25000;}}
 }
 if(intelFusionUntil){
   const left=Math.max(0,Math.ceil((intelFusionUntil-now)/1000));
   const b=$('#intelFusionBadge');
   if(now<intelFusionUntil){if(b){b.classList.remove('hidden');b.textContent='INTEL FUSION // '+left+' SEC';}}
   else{intelFusionUntil=0;if(b)b.classList.add('hidden');log('INTEL FUSION // ENDED');cpNotice('INTEL FUSION','EFFECT ENDED','intel');}
 }
}
function cpFusionActive(){return cpThreatMission()&&intelFusionUntil&&performance.now()<intelFusionUntil}
function cpEffectiveISRRadius(){return A.r*(cpFusionActive()?1.30:1)}
function cpDegradedCount(){return B.filter(b=>b.degraded).length}
function cpRenderBlueSite(b){if(!b||!b.el)return;const c=b.degraded?'#ff5b55':'#4da3ff';if(b.circle)b.circle.setAttribute('stroke',c);if(b.icon)b.icon.setAttribute('stroke',c);if(b.label){b.label.setAttribute('fill',c);b.label.textContent=b.id+(b.degraded?' // DEGRADED':'')}}
function cpCompromiseFloor(){const exposure=B.reduce((sum,b)=>sum+(b.exposure||0),0);if(campaignMission==='ARCADE')return Math.min(100,exposure/20+cpDegradedCount()*8);return Math.min(50,exposure/10)}
function cpApplyCompromiseFloor(){const floor=cpCompromiseFloor();if(cpThreatMission()&&campaignCompromise<floor)campaignCompromise=floor;return floor}
function cpMobilizeFromDegradedSite(siteName){
 T.forEach(t=>{
   if(t.done||t.dead||t.proxSite!==siteName)return;
   t.stationary=false;t.hostileCollect=false;t.collectStarted=0;t.proxSince=0;
   const a=Math.random()*Math.PI*2,s=2.0+Math.random()*1.8;
   t.vx=Math.cos(a)*s;t.vy=Math.sin(a)*s;
   t.proxSite=null;
   t.stallX=t.x;t.stallY=t.y;t.stallAt=performance.now();t.stallLogged=false;
 });
}
function cpContestedTick(dt){
 if(!cpThreatMission()||campaignFinished)return;
 let active=0,pendingAdds=[],requestedTotal=0;
 T.forEach(t=>{
   const threat=(t.truth==='HOSTILE'||t.truth==='IRREGULAR');
   if(threat&&t.proxSite&&!t.dead&&!t.done){
     const site=B.find(b=>b.id===t.proxSite);
     if(site&&site.degraded){
       t.stationary=false;t.hostileCollect=false;t.collectStarted=0;t.proxSite=null;
       const a=Math.random()*Math.PI*2,s=2.0+Math.random()*1.8;t.vx=Math.cos(a)*s;t.vy=Math.sin(a)*s;
       return;
     }
     if(!t.collectStarted)t.collectStarted=performance.now();
     const setupMs=campaignMission==='ARCADE'?Math.max(6000,12000-(arcadeThreatLevel-1)*750):5000;
     if(performance.now()-t.collectStarted>setupMs&&!t.hostileCollect){t.hostileCollect=true;sound('warning');}
     if(t.hostileCollect){
       active++;
       const room=Math.max(0,10-(t.compromiseAdded||0));
       const requested=Math.min(room,dt*.12);
       if(requested>0)pendingAdds.push([t,site,requested]),requestedTotal+=requested;
     }
   }
 });
 if(requestedTotal>0){
   const aoAllowed=Math.min(requestedTotal,dt*.25),scale=aoAllowed/requestedTotal;
   pendingAdds.forEach(([t,site,requested])=>{
     const add=requested*scale;
     t.compromiseAdded=(t.compromiseAdded||0)+add;
     campaignCompromise=Math.min(100,campaignCompromise+add);
     if(site&&!site.degraded){
       site.exposure=Math.min(100,(site.exposure||0)+add*4);
       if(site.exposure>=100){
         site.exposure=100;site.degraded=true;cpRenderBlueSite(site);
         const floor=cpApplyCompromiseFloor();
         log(site.id+' // FULLY EXPOSED // BASE DEGRADED // OE FLOOR '+floor+'%');
         sound('degraded');cpNotice(site.id+' // DEGRADED','OE FLOOR '+floor+'% // TRACKS MOBILIZING','hostile');
         cpMobilizeFromDegradedSite(site.id);
       }
     }
   });
 }
 cpApplyCompromiseFloor();
 const w=$('#hostileCollectionWarning');if(w)w.classList.toggle('hidden',active===0);
 if(campaignMission==='01-05')cpCheck0105();
 if(campaignCompromise>=60&&!campaignFinished){if(campaignMission==='ARCADE')arcadeFinish('OE COMPROMISED');else cpFinish0104('COMPROMISE');}
}
function cpTrackStallGuard(){
if(!running||window.CP_PAUSED)return;
const now=performance.now();
T.forEach(t=>{if(t.dead||t.stationary)return;if(t.stallX===null){t.stallX=t.x;t.stallY=t.y;t.stallAt=now;return}
let moved=Math.hypot(t.x-t.stallX,t.y-t.stallY);
if(moved>3){t.stallX=t.x;t.stallY=t.y;t.stallAt=now;t.stallLogged=false}
else if(now-t.stallAt>8000&&!t.stallLogged){t.stallLogged=true;log('TRACK STALL // '+String(t.type||'UNKNOWN')+'-'+String(t.id).padStart(3,'0'));}
});
}
function enemy(dt){
 if(campaignMission==='01-02'||campaignMission==='01-03')return;
 T.forEach(t=>{
  if(t.done||(t.truth!=='HOSTILE'&&t.truth!=='IRREGULAR'))return;
  B.forEach(b=>{
   if(D(t,b)<=t.enemyRange&&!b.degraded){
    let mult=t.truth==='IRREGULAR'?2.15:1,burn=(t.stationary?1.8:1.05)*mult*dt;
    b.exposure=Math.min(100,b.exposure+burn);score-=burn*.12;
    if(b.exposure>=100){
     b.exposure=100;b.degraded=true;cpRenderBlueSite(b);
     const floor=cpApplyCompromiseFloor();
     log(b.id+' // FULLY EXPOSED // BASE DEGRADED // OE FLOOR '+floor.toFixed(1)+'%');
     sound('degraded');cpNotice(b.id+' // DEGRADED','OE FLOOR '+floor.toFixed(1)+'% // TRACKS MOBILIZING','hostile');
     cpMobilizeFromDegradedSite(b.id);
    }
   }
  });
 });
}
function detail(){if(!sel||sel.done){$('#none').hidden=false;$('#detail').hidden=true;return}$('#none').hidden=true;$('#detail').hidden=false;let d=D(A,sel),inside=d<=cpEffectiveISRRadius(),u=sel.type==='UNKNOWN';$('#tid').textContent=designation(sel);$('#type').textContent=sel.type;$('#motion').textContent=sel.stationary?'STATIONARY':'MOBILE';
let obsRow=$('#observedRow');if(obsRow){let show=sel.type!=='UNKNOWN';obsRow.hidden=!show;if(show){let sec=Math.max(0,Math.floor((performance.now()-sel.bornAt)/1000));$('#observed').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}}
$('#dist').textContent=Math.round(d)+' GRID';$('#sense').textContent=inside?'IN RANGE':'OUT OF RANGE';$('#collect').hidden=!u;$('#collect').disabled=!inside||!!col;$('#prog').hidden=col!==sel;$('#pct').textContent=pct+'%';$('#bar').style.width=pct+'%';$('#dec').hidden=u}function cpStatusClass(el,state){if(!el)return;el.classList.remove('status-good','status-warn','status-bad');el.classList.add(state)}
function cpRefreshStatusColors(){
 let integrityState=integrity>=80?'status-good':integrity>=60?'status-warn':'status-bad';
 let oeState=campaignCompromise<30?'status-good':campaignCompromise<50?'status-warn':'status-bad';
 cpStatusClass($('#integrity'),integrityState);cpStatusClass($('#objIntegrity'),integrityState);
 cpStatusClass($('#comp'),oeState);cpStatusClass($('#objCompromise'),oeState);
}
function displayMode(mode){return String(mode||'STANDBY').replaceAll('_',' ')}function ui(force=false){let now=performance.now();if(!force&&now-lastUi<200)return;lastUi=now;let p=parms(),c=(cpThreatMission()?campaignCompromise:compromise()),n=T.filter(t=>!t.done&&t.type==='UNKNOWN'&&D(A,t)<=cpEffectiveISRRadius()).length;$('#stateLine').textContent=A.mode==='ISR_SELECTED'?'ISR CONTROL // SELECT DESTINATION':'ISR // '+displayMode(A.mode);$('#rangeLine').textContent='SENSOR // '+n+' UNKNOWN IN RANGE';$('#score').textContent=String(Math.max(0,Math.round(score))).padStart(4,'0');$('#integrity').textContent=Math.round(integrity)+'%';$('#comp').textContent=Math.round(c)+'%';$('#compTop').textContent=Math.round(c)+'%';$('#resolved').textContent=resolved;$('#ints').textContent=ints;
let or=$('#objResolved'),oi=$('#objInterrupted'),og=$('#objIntegrity'),oc=$('#objCompromise'),ot=$('#objectiveTracker'),
    ott=$('#objectiveTitle'),osl=$('#objectiveSecondaryLabel'),osc=$('#objectiveSecondaryChip'),oec=$('#objectiveOEChip');
if(ot)ot.style.display=(campaignMission&&['01-01','01-02','01-03','01-04','01-05','ARCADE'].includes(campaignMission))?'flex':'none';
if(campaignMission&&or){
 let title='ESTABLISH',resolveTarget=10,secondaryLabel='',secondaryValue='',secondaryComplete=false,showOE=false;
 if(campaignMission==='ARCADE'){title='ARCADE // THREAT '+arcadeThreatLevel;resolveTarget=Math.max(1,arcadeCorrect);secondaryLabel='STREAK';secondaryValue=arcadeStreak+' / '+arcadeBestStreak;secondaryComplete=arcadeStreak>=5;showOE=true}
 if(campaignMission==='01-02'){title='PATTERN';resolveTarget=12;secondaryLabel='STATIONARY';secondaryValue=campaignStationaryAssessed+'/4';secondaryComplete=campaignStationaryAssessed>=4}
 if(campaignMission==='01-03'){title='INDICATORS';resolveTarget=14;secondaryLabel='PROXIMITY';secondaryValue=campaignProximityAssessed+'/5';secondaryComplete=campaignProximityAssessed>=5}
 if(campaignMission==='01-04'){title='CONTESTED';resolveTarget=14;secondaryLabel='INTERRUPT';secondaryValue=campaignCollectionInterrupted+'/4';secondaryComplete=campaignCollectionInterrupted>=4;showOE=true}
 if(campaignMission==='01-05'){title='CONDITIONS SET';resolveTarget=16;secondaryLabel='INTERRUPT';secondaryValue=campaignCollectionInterrupted+'/5';secondaryComplete=campaignCollectionInterrupted>=5;showOE=true}
 if(ott)ott.textContent='OBJECTIVES // '+title;
 or.textContent=campaignMission==='ARCADE'?String(arcadeCorrect):campaignCorrect+'/'+resolveTarget;
 if(osc)osc.style.display=secondaryLabel?'inline-flex':'none';
 if(osl)osl.textContent=secondaryLabel;
 if(oi)oi.textContent=secondaryValue;
 og.textContent=campaignMission==='ARCADE'?Math.round(integrity)+'/0':Math.round(integrity)+'/80';
 if(oec)oec.style.display=showOE?'inline-flex':'none';
 if(oc)oc.textContent=Math.round(campaignCompromise)+'/'+(campaignMission==='01-05'?'50':'60');
 or.parentElement.classList.toggle('complete',campaignMission==='ARCADE'?arcadeStreak>=5:campaignCorrect>=resolveTarget);
 if(oi&&oi.parentElement){oi.parentElement.classList.toggle('complete',secondaryComplete);oi.parentElement.classList.remove('danger')}
 og.parentElement.classList.toggle('complete',integrity>=80);og.parentElement.classList.toggle('danger',integrity<80);
 if(oc&&oc.parentElement){oc.parentElement.classList.toggle('complete',showOE&&campaignCompromise<60);oc.parentElement.classList.toggle('danger',showOE&&campaignCompromise>=50)}
 let od=$('#objDegraded');if(od)od.textContent=cpDegradedCount()+' / 5 // FLOOR '+cpCompromiseFloor()+'%';
 cpRefreshStatusColors();
}
$('#active').textContent=T.filter(t=>!t.done).length;$('#cap').textContent=p.cap;$('#isrTop').textContent=displayMode(A.mode);let mb=$('#isrModeBadge');mb.textContent=A.mode==='ISR_SELECTED'?'ISR ● CONTROL ACTIVE — SELECT DESTINATION':A.mode==='ENROUTE'?'ISR ● ENROUTE':A.mode==='ON_STATION'?'ISR ● ON STATION':'ISR ● STANDBY';mb.classList.toggle('active',A.mode==='ISR_SELECTED');$('#sites').innerHTML=B.map(b=>`<div class="site ${b.degraded?'degraded':''}"><div class="row"><span>${b.id}${b.degraded?' // DEGRADED':''}</span><b>${Math.round(b.exposure)}%</b></div><div class="meter"><i style="width:${b.exposure}%"></i></div></div>`).join('');detail()}function geometry(){let now=performance.now();if(running&&A.mode==='ENROUTE'&&valid(A.dest)&&now-A.lastMove>700&&!stallLogged){stallLogged=true;log('ISR MONITOR // STALL DETECTED')}$('#sensor').setAttribute('transform',`translate(${A.x} ${A.y})`);$('#asset').setAttribute('transform',`translate(${A.x} ${A.y})`);$('#plane').setAttribute('transform',`rotate(${A.heading})`);$('#halo').setAttribute('stroke-opacity',A.mode==='ISR_SELECTED'?'.8':'0');$('#alabel').setAttribute('x',A.x+31);$('#alabel').setAttribute('y',A.y+5);if(valid(A.dest)){ $('#wp').setAttribute('visibility','visible');$('#route').setAttribute('x1',A.x);$('#route').setAttribute('y1',A.y);$('#route').setAttribute('x2',A.dest.x);$('#route').setAttribute('y2',A.dest.y);$('#dest').setAttribute('cx',A.dest.x);$('#dest').setAttribute('cy',A.dest.y)}else $('#wp').setAttribute('visibility','hidden');if(col){$('#beam').setAttribute('visibility','visible');$('#beamLine').setAttribute('x1',A.x);$('#beamLine').setAttribute('y1',A.y);$('#beamLine').setAttribute('x2',col.x);$('#beamLine').setAttribute('y2',col.y)}else $('#beam').setAttribute('visibility','hidden');T.forEach(draw)}function diagnostic(now){if(now-lastDiag<100)return;lastDiag=now;let age=Math.round(now-A.lastMove),stall=running&&A.mode==='ENROUTE'&&valid(A.dest)&&age>700;$('#diagStatus').textContent=stall?'ISR STALL DETECTED':'NOMINAL';$('#diagStatus').classList.toggle('stall',stall);$('#diag1').textContent=`FPS ${C.fps} | RAF ${C.raf} | GAP ${Math.round(C.maxGap)}ms | ERR ${C.errors}`;$('#diag2').textContent=`ISR POINTER ${C.isr} | MAP POINTER ${C.map} | TRACK POINTER ${C.track} | ORDERS ${C.orders}`;$('#diag3').textContent=`MODE ${A.mode} | POS ${A.x.toFixed(1)},${A.y.toFixed(1)} | DEST ${valid(A.dest)?A.dest.x.toFixed(1)+','+A.dest.y.toFixed(1):'--'} | MOVE AGE ${age}ms`;let vv=window.visualViewport,vw=Math.round(window.innerWidth),vh=Math.round(window.innerHeight),vww=vv?Math.round(vv.width):vw,vvh=vv?Math.round(vv.height):vh,vs=vv?vv.scale:1;$('#viewportDiag').textContent=`VIEWPORT // ${vw}x${vh} -> ${vww}x${vvh} | SCALE ${vs.toFixed(2)}`;if(stall&&!stallLogged){stallLogged=true;rec('STALL',`mode=${A.mode} pos=${A.x.toFixed(2)},${A.y.toFixed(2)} dest=${A.dest.x.toFixed(2)},${A.dest.y.toFixed(2)} age=${age} gap=${C.maxGap.toFixed(1)}`)}}function diagText(){return [`CONTACT IMMINENT v0.6.2 OA KESTREL BASEMAP DIAGNOSTICS`,new Date().toISOString(),`running=${running} phase=${phase} score=${Math.round(score)} integrity=${integrity} compromise=${compromise().toFixed(2)}`,`fps=${C.fps} raf=${C.raf} maxGapMs=${C.maxGap.toFixed(1)} errors=${C.errors}`,`isrClicks=${C.isr} mapClicks=${C.map} trackClicks=${C.track} orders=${C.orders}`,`mode=${A.mode} pos=${A.x.toFixed(2)},${A.y.toFixed(2)} dest=${valid(A.dest)?A.dest.x.toFixed(2)+','+A.dest.y.toFixed(2):'--'} moveAgeMs=${Math.round(performance.now()-A.lastMove)}`,'','ROLLING DEBUG LOG',...dbg].join('\n')}async function copyDiag(){let t=diagText();try{await navigator.clipboard.writeText(t);log('DIAGNOSTICS // COPIED')}catch(e){rec('COPY_FAIL',String(e));let ta=document.createElement('textarea');ta.value=t;document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();log('DIAGNOSTICS // COPIED')}}function saveDiag(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([diagText()],{type:'text/plain'}));a.download='contact-imminent-v0.4.3.1-debug.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),(cpFusionActive()?600:1000));log('DIAGNOSTICS // SAVED')}function finish(){if(!running)return;if(campaignMission==='01-04'){cpFinish0104('TIMEOUT');return;}if(campaignMission==='01-05'){cpFinish0105('TIMEOUT');return;}running=false;stopCollect();A.dest=null;A.mode='IDLE';let c=compromise();$('#endTitle').textContent=c<60?'CONDITIONS HAVE BEEN SET':'CONDITIONS NOT SET';$('#fs').textContent=Math.max(0,Math.round(score));$('#fr').textContent=resolved;$('#fi').textContent=ints;$('#fc').textContent=Math.round(c)+'%';$('#end').classList.add('show');ui(true)}function loop(now){if(window.CP_PAUSED||window.CP_MENU){last=now;requestAnimationFrame(loop);return;}C.raf++;let gap=now-C.lastRaf;C.lastRaf=now;if(gap>C.maxGap)C.maxGap=gap;C.fpsFrames++;if(now-C.fpsAt>=1000){C.fps=Math.round(C.fpsFrames*1000/(now-C.fpsAt));C.fpsFrames=0;C.fpsAt=now}let dt=Math.min(.05,(now-last)/1000);last=now;if(running){let elapsed=(now-start)/1000,left=Math.max(0,180-elapsed),np=elapsed<60?1:elapsed<120?2:3;if(campaignMission==='ARCADE'){arcadeThreatLevel=1+Math.floor(elapsed/75);if(arcadeThreatLevel!==phase){phase=arcadeThreatLevel;let nm='THREAT LEVEL '+arcadeThreatLevel;$('#phase').textContent='ARCADE // '+nm;banner(nm,1300);sound('level');log(nm)}let s=Math.floor(elapsed);$('#clock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}else{if(np!==phase){phase=np;let nm=phase===2?'PHASE II // CONTEST':'PHASE III // DOMINATE';$('#phase').textContent=nm;banner(nm,1300);log(nm)}let s=Math.ceil(left);$('#clock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}if(campaignMission!=='ARCADE'&&left<=0)finish();else{let p=parms();if((now-lastSpawn)/1000>=p.gap&&T.filter(t=>!t.done).length<p.cap){spawn();lastSpawn=now}T.forEach(t=>{if(t.done||t.stationary)return;t.x+=t.vx*dt;t.y+=t.vy*dt;if(t.x<35||t.x>865)t.vx*=-1;if(t.y<35||t.y>615)t.vy*=-1});enemy(dt);cpContestedTick(dt);cpIntelDropTick();cpTrackStallGuard();if(A.mode==='ENROUTE'&&valid(A.dest)){let dx=A.dest.x-A.x,dy=A.dest.y-A.y,d=Math.hypot(dx,dy);if(d>2){A.heading=H(dx,dy);let q=Math.min(A.speed*dt,d),ox=A.x,oy=A.y;A.x+=dx/d*q;A.y+=dy/d*q;if(A.x!==ox||A.y!==oy){A.lastMove=now;stallLogged=false}}else{A.x=A.dest.x;A.y=A.dest.y;A.dest=null;A.mode='ON_STATION';A.lastMove=now;stallLogged=false}}}}geometry();ui();diagnostic(now);requestAnimationFrame(loop)}$('#asset').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(running)acquire()});$('#map').addEventListener('pointerdown',e=>{e.preventDefault();C.map++;rec('MAP_POINTER',`mode=${A.mode}`);if(!running||A.mode!=='ISR_SELECTED')return;order(point(e));ui(true)});function actionPointer(el,fn){el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn();requestAnimationFrame(()=>el.blur())});el.addEventListener('click',e=>e.preventDefault())}actionPointer($('#collect'),collect);actionPointer($('#clear'),()=>decide('CLEAR'));actionPointer($('#intercept'),()=>decide('INTERCEPT'));function deploy(){stopCollect();Object.assign(C,{raf:0,isr:0,map:0,track:0,orders:0,errors:0,lastRaf:performance.now(),maxGap:0,fps:0,fpsFrames:0,fpsAt:performance.now()});dbg=[];rec('DEPLOY','diagnostic session started');T.forEach(t=>{t.el?.remove();t.ring?.remove()});T=[];sel=null;next=1;score=0;integrity=100;resolved=0;ints=0;phase=1;campaignStationarySpawned=0;stallLogged=false;Object.assign(A,{x:145,y:510,dest:null,mode:'IDLE',heading:0,lastMove:performance.now()});$('#phase').textContent=campaignMission==='ARCADE'?'ARCADE // THREAT LEVEL 1':'PHASE I // ESTABLISH';$('#log').textContent='';$('#enemyRings').textContent='';let df=$('#decisionFeedback');if(df)df.textContent='';$('#end').classList.remove('show');initBlue();running=false;$('#clock').textContent=campaignMission==='ARCADE'?'00:00':'03:00';let n=5;banner(String(n),700);let timer=setInterval(()=>{n--;if(n>0)banner(String(n),700);else{clearInterval(timer);banner('PREPARE THE OPERATIONAL ENVIRONMENT',1600);setTimeout(()=>{running=true;A.mode='ON_STATION';start=performance.now();lastSpawn=start;A.lastMove=start;if(campaignMission==='01-02'){spawn(false);spawn(true);spawn(true)}
else if(campaignMission==='01-03'||campaignMission==='01-04'||campaignMission==='01-05'||campaignMission==='ARCADE'){spawn();spawn();spawn()}
else{spawn(false);spawn(false);spawn(true)}
log('MISSION START // CONTACT IMMINENT 0.6.2 OA KESTREL BASEMAP')},900)}},850);ui(true)}$('#copyDiag').addEventListener('click',copyDiag);$('#saveDiag').addEventListener('click',saveDiag);$('#reset').addEventListener('click',()=>campaignMission==='ARCADE'?arcadeBegin():deploy());$('#again').addEventListener('click',deploy);document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault()},{passive:false});window.visualViewport?.addEventListener('resize',()=>rec('VIEWPORT',`${Math.round(innerWidth)}x${Math.round(innerHeight)} scale=${visualViewport.scale}`));initBlue();running=false;$('#clock').textContent=campaignMission==='ARCADE'?'00:00':'03:00';$('#phase').textContent='MISSION STANDBY';ui(true);$('#startMission').addEventListener('click',()=>{$('#startScreen').style.display='none';deploy()});
window.CP_PAUSED=false;window.CP_MENU=true;window.CP_PAUSE_AT=0;
function cpHideCampaignOverlays(){['campaignMenu','briefing0101','briefing0102','briefing0103','briefing0104','briefing0105','campaignResult'].forEach(id=>$('#'+id).classList.add('hidden'))}
function cpCampaignMenu(){musicSetMode('menu');cpRefreshCampaign();window.CP_MENU=true;window.CP_PAUSED=false;running=false;stopCollect();$('#mainMenu').classList.add('hidden');$('#pauseMenu').classList.add('hidden');$('#briefing0101').classList.add('hidden');$('#briefing0102').classList.add('hidden');$('#briefing0103').classList.add('hidden');$('#briefing0104').classList.add('hidden');$('#briefing0105').classList.add('hidden');$('#campaignResult').classList.add('hidden');$('#campaignMenu').classList.remove('hidden')}
function cpBrief0101(){$('#campaignMenu').classList.add('hidden');$('#briefing0101').classList.remove('hidden')}
function cpUnlocked0102(){
  const key='ci-c01-0102-unlocked';
  if(sessionStorage.getItem(key)==='1'){localStorage.setItem(key,'1');return true}
  return localStorage.getItem(key)==='1';
}
function cpRefreshCampaign(){
  const b=$('#mission0102'),st=$('#mission0102Status');if(!b||!st)return;
  const unlocked=cpUnlocked0102();b.disabled=!unlocked;b.classList.toggle('available',unlocked);st.textContent=unlocked?'AVAILABLE':'LOCKED';
  const b3=$('#mission0103'),st3=$('#mission0103Status');if(b3&&st3){const u3=cpUnlocked0103();b3.disabled=!u3;b3.classList.toggle('available',u3);st3.textContent=u3?'AVAILABLE':'LOCKED';}const b4=$('#mission0104'),st4=$('#mission0104Status');if(b4&&st4){const u4=cpUnlocked0104();b4.disabled=!u4;b4.classList.toggle('available',u4);st4.textContent=u4?'AVAILABLE':'LOCKED';}const b5=$('#mission0105'),st5=$('#mission0105Status');if(b5&&st5){const u5=cpUnlocked0105();b5.disabled=!u5;b5.classList.toggle('available',u5);st5.textContent=localStorage.getItem('ci-c01-complete')==='1'?'COMPLETE':(u5?'AVAILABLE':'LOCKED');}
}
function cpBrief0102(){if(!cpUnlocked0102())return;$('#campaignMenu').classList.add('hidden');$('#briefing0102').classList.remove('hidden')}
function cpUnlocked0103(){return localStorage.getItem('ci-c01-0103-unlocked')==='1'}
function cpBrief0103(){if(!cpUnlocked0103())return;$('#campaignMenu').classList.add('hidden');$('#briefing0103').classList.remove('hidden')}
function cpUnlocked0104(){return localStorage.getItem('ci-c01-0104-unlocked')==='1'}
function cpBrief0104(){if(!cpUnlocked0104())return;$('#campaignMenu').classList.add('hidden');$('#briefing0104').classList.remove('hidden')}
function cpUnlocked0105(){return localStorage.getItem('ci-c01-0105-unlocked')==='1'}
function cpBrief0105(){if(!cpUnlocked0105())return;$('#campaignMenu').classList.add('hidden');$('#briefing0105').classList.remove('hidden')}
function cpBegin0105(){musicSetMode('mission');campaignMission='01-05';campaignIds=0;campaignCorrect=0;campaignThreatResolved=0;campaignNonThreatResolved=0;campaignStationaryAssessed=0;campaignStationarySpawned=0;campaignProximityAssessed=0;campaignCollectionInterrupted=0;campaignCompromise=0;campaignFinished=false;cpIntelDropReset();cpHideCampaignOverlays();let w=$('#hostileCollectionWarning');if(w)w.classList.add('hidden');window.CP_MENU=false;window.CP_PAUSED=false;$('#startScreen').style.display='none';deploy();last=performance.now()}
function cpBegin0104(){musicSetMode('mission');campaignMission='01-04';campaignIds=0;campaignCorrect=0;campaignThreatResolved=0;campaignNonThreatResolved=0;campaignStationaryAssessed=0;campaignStationarySpawned=0;campaignProximityAssessed=0;campaignCollectionInterrupted=0;campaignCompromise=0;campaignFinished=false;cpIntelDropReset();cpHideCampaignOverlays();let w=$('#hostileCollectionWarning');if(w)w.classList.add('hidden');window.CP_MENU=false;window.CP_PAUSED=false;$('#startScreen').style.display='none';deploy();last=performance.now()}

function cpBegin0103(){musicSetMode('mission');campaignMission='01-03';campaignIds=0;campaignCorrect=0;campaignThreatResolved=0;campaignNonThreatResolved=0;campaignStationaryAssessed=0;campaignStationarySpawned=0;campaignProximityAssessed=0;campaignFinished=false;cpHideCampaignOverlays();window.CP_MENU=false;window.CP_PAUSED=false;$('#startScreen').style.display='none';deploy();last=performance.now()}

function cpBegin0102(){musicSetMode('mission');campaignMission='01-02';campaignIds=0;campaignCorrect=0;campaignThreatResolved=0;campaignNonThreatResolved=0;campaignStationaryAssessed=0;campaignStationarySpawned=0;campaignFinished=false;cpHideCampaignOverlays();window.CP_MENU=false;window.CP_PAUSED=false;$('#startScreen').style.display='none';deploy();last=performance.now()}

function cpBegin0101(){musicSetMode('mission');campaignMission='01-01';campaignIds=0;campaignCorrect=0;campaignThreatResolved=0;campaignNonThreatResolved=0;campaignFinished=false;cpHideCampaignOverlays();window.CP_MENU=false;window.CP_PAUSED=false;$('#startScreen').style.display='none';deploy();last=performance.now()}
function cpCheck0101(){if(campaignMission!=='01-01'||campaignFinished)return;if(campaignCorrect>=10){campaignFinished=true;running=false;stopCollect();window.CP_MENU=true;const pass=integrity>=80;if(pass){localStorage.setItem('ci-c01-0102-unlocked','1');sessionStorage.setItem('ci-c01-0102-unlocked','1');cpRefreshCampaign()}$('#resultTitle').textContent=pass?'CONDITIONS HAVE BEEN SET':'CONDITIONS NOT SET';$('#resultBody').innerHTML='OA KESTREL<br>INITIAL OPERATIONAL PICTURE '+(pass?'ESTABLISHED':'INCOMPLETE')+'<br><br>CONTACTS IDENTIFIED&nbsp;&nbsp;&nbsp;&nbsp;'+campaignIds+'<br>CORRECT DISPOSITIONS&nbsp;&nbsp;'+campaignCorrect+'<br>HOSTILE / IRREGULAR&nbsp;&nbsp;&nbsp;'+campaignThreatResolved+'<br>FRIENDLY / NEUTRAL&nbsp;&nbsp;&nbsp;'+campaignNonThreatResolved+'<br>INTELLIGENCE INTEGRITY&nbsp;'+Math.round(integrity)+'%<br>SCORE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.max(0,Math.round(score));$('#resultContinue').classList.toggle('hidden',!pass);$('#resultRetry').classList.toggle('hidden',pass);$('#campaignResult').classList.remove('hidden')}}
function cpCheck0102(){
if(campaignMission!=='01-02'||campaignFinished)return;
if(campaignCorrect>=12&&campaignStationaryAssessed>=4){
  campaignFinished=true;running=false;stopCollect();window.CP_MENU=true;
  const pass=integrity>=80;if(pass){localStorage.setItem('ci-c01-0103-unlocked','1');cpRefreshCampaign()}
  $('#resultTitle').textContent=pass?'CONDITIONS HAVE BEEN SET':'CONDITIONS NOT SET';
  $('#resultBody').innerHTML='OA KESTREL<br>PATTERN OF ACTIVITY '+(pass?'DEVELOPED':'INCOMPLETE')+
  '<br><br>CONTACTS RESOLVED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignCorrect+
  '<br>MOBILE CONTACTS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.max(0,campaignCorrect-campaignStationaryAssessed)+
  '<br>STATIONARY ASSESSED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignStationaryAssessed+
  '<br>HOSTILE / IRREGULAR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignThreatResolved+
  '<br>FRIENDLY / NEUTRAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignNonThreatResolved+
  '<br>INTELLIGENCE INTEGRITY&nbsp;&nbsp;'+Math.round(integrity)+'%'+
  '<br>SCORE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.max(0,Math.round(score));
  $('#resultContinue').classList.toggle('hidden',!pass);$('#resultRetry').classList.toggle('hidden',pass);$('#campaignResult').classList.remove('hidden');
}}
function cpCheck0103(){
if(campaignMission!=='01-03'||campaignFinished)return;
if(campaignCorrect>=14&&campaignProximityAssessed>=5){
  campaignFinished=true;running=false;stopCollect();window.CP_MENU=true;
  const pass=integrity>=80;if(pass){localStorage.setItem('ci-c01-0104-unlocked','1');cpRefreshCampaign()}
  $('#resultTitle').textContent=pass?'CONDITIONS HAVE BEEN SET':'CONDITIONS NOT SET';
  $('#resultBody').innerHTML='OA KESTREL<br>INDICATORS ASSESSED'+
  '<br><br>CONTACTS RESOLVED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignCorrect+
  '<br>SITE-PROXIMITY EVENTS&nbsp;&nbsp;&nbsp;'+campaignProximityAssessed+
  '<br>HOSTILE / IRREGULAR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignThreatResolved+
  '<br>FRIENDLY / NEUTRAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignNonThreatResolved+
  '<br>INTELLIGENCE INTEGRITY&nbsp;&nbsp;'+Math.round(integrity)+'%'+
  '<br>SCORE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.max(0,Math.round(score));
  $('#resultContinue').classList.toggle('hidden',!pass);$('#resultRetry').classList.toggle('hidden',pass);$('#campaignResult').classList.remove('hidden');
}}
function cpFinish0104(reason){
 if(campaignFinished)return;
 campaignFinished=true;running=false;stopCollect();window.CP_MENU=true;
 const w=$('#hostileCollectionWarning');if(w)w.classList.add('hidden');
 const pass=(reason==='SUCCESS'&&campaignCorrect>=14&&campaignCollectionInterrupted>=4&&integrity>=80&&campaignCompromise<60);
 let title,lead;
 if(campaignCompromise>=60||reason==='COMPROMISE'){
   title='OE COMPROMISED';lead='THRESHOLD EXCEEDED';
 }else if(pass){
   localStorage.setItem('ci-c01-0105-unlocked','1');cpRefreshCampaign();
   title='CONDITIONS HAVE BEEN SET';lead='CONTESTED ENVIRONMENT ASSESSED';
 }else{
   title='CONDITIONS NOT SET';lead='MISSION OBJECTIVES INCOMPLETE';
 }
 $('#resultTitle').textContent=title;
 $('#resultBody').innerHTML='OA KESTREL<br>'+lead+
 '<br><br>CONTACTS RESOLVED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignCorrect+
 '<br>COLLECTION INTERRUPTED&nbsp;&nbsp;'+campaignCollectionInterrupted+
 '<br>AO COMPROMISE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.round(campaignCompromise)+'%'+
 '<br>HOSTILE / IRREGULAR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignThreatResolved+
 '<br>FRIENDLY / NEUTRAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignNonThreatResolved+
 '<br>INTELLIGENCE INTEGRITY&nbsp;&nbsp;'+Math.round(integrity)+'%'+
 '<br>SCORE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.max(0,Math.round(score));
 $('#resultContinue').classList.toggle('hidden',!pass);
 $('#resultRetry').classList.toggle('hidden',pass);
 $('#campaignResult').classList.remove('hidden');
}
function cpCheck0104(){
if(!cpThreatMission()||campaignFinished)return;
if(campaignCorrect>=14&&campaignCollectionInterrupted>=4){
 cpFinish0104('SUCCESS');
}}
function cpFinish0105(reason){
 if(campaignFinished)return;
 campaignFinished=true;running=false;stopCollect();window.CP_MENU=true;
 const w=$('#hostileCollectionWarning');if(w)w.classList.add('hidden');
 const pass=(reason==='SUCCESS'&&campaignCorrect>=16&&campaignCollectionInterrupted>=5&&integrity>=80&&campaignCompromise<50);
 let title,lead;
 if(campaignCompromise>=60||reason==='COMPROMISE'){title='OE COMPROMISED';lead='THRESHOLD EXCEEDED';}
 else if(pass){title='CONDITIONS HAVE BEEN SET';lead='CAMPAIGN 01 // OA KESTREL COMPLETE';localStorage.setItem('ci-c01-complete','1');cpRefreshCampaign();}
 else{title='CONDITIONS NOT SET';lead='FINAL OPERATION OBJECTIVES INCOMPLETE';}
 $('#resultTitle').textContent=title;
 $('#resultBody').innerHTML='OA KESTREL<br>'+lead+
 '<br><br>CONTACTS RESOLVED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignCorrect+
 '<br>COLLECTION INTERRUPTED&nbsp;&nbsp;'+campaignCollectionInterrupted+
 '<br>OE COMPROMISE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.round(campaignCompromise)+'%'+
 '<br>SITES DEGRADED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+cpDegradedCount()+' / 5'+
 '<br>HOSTILE / IRREGULAR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignThreatResolved+
 '<br>FRIENDLY / NEUTRAL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+campaignNonThreatResolved+
 '<br>INTELLIGENCE INTEGRITY&nbsp;&nbsp;'+Math.round(integrity)+'%'+
 '<br>SCORE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.max(0,Math.round(score));
 $('#resultContinue').classList.toggle('hidden',!pass);$('#resultRetry').classList.toggle('hidden',pass);$('#campaignResult').classList.remove('hidden');
}
function cpCheck0105(){if(campaignMission!=='01-05'||campaignFinished)return;if(campaignCorrect>=16&&campaignCollectionInterrupted>=5&&integrity>=80&&campaignCompromise<50)cpFinish0105('SUCCESS')}
function arcadeHide(){const a=$('#arcadeBriefing'),r=$('#arcadeResult');if(a)a.classList.add('hidden');if(r)r.classList.add('hidden')}
function arcadeBegin(){musicSetMode('mission');campaignMission='ARCADE';campaignIds=0;campaignCorrect=0;campaignThreatResolved=0;campaignNonThreatResolved=0;campaignCollectionInterrupted=0;campaignCompromise=0;campaignFinished=false;arcadeStreak=0;arcadeBestStreak=0;arcadeCorrect=0;arcadeWrong=0;arcadeThreatLevel=1;cpIntelDropReset();arcadeHide();cpHideCampaignOverlays();window.CP_MENU=false;window.CP_PAUSED=false;$('#startScreen').style.display='none';deploy();arcadeStart=performance.now();last=performance.now()}
function arcadeFinish(reason){if(campaignMission!=='ARCADE'||campaignFinished)return;campaignFinished=true;sound('fail');running=false;stopCollect();window.CP_MENU=true;const w=$('#hostileCollectionWarning');if(w)w.classList.add('hidden');const elapsed=Math.max(0,Math.floor((performance.now()-(arcadeStart||start))/1000)),acc=(arcadeCorrect+arcadeWrong)?Math.round(arcadeCorrect*100/(arcadeCorrect+arcadeWrong)):100;$('#arcadeResultTitle').textContent=reason;$('#arcadeResultBody').innerHTML='OA KESTREL // ARCADE AAR<br><br>SCORE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+Math.max(0,Math.round(score))+'<br>SURVIVAL TIME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+String(Math.floor(elapsed/60)).padStart(2,'0')+':'+String(elapsed%60).padStart(2,'0')+'<br>THREAT LEVEL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+arcadeThreatLevel+'<br>CONTACTS RESOLVED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+resolved+'<br>THREATS INTERCEPTED&nbsp;&nbsp;&nbsp;&nbsp;'+ints+'<br>COLLECTION INTERRUPTED&nbsp;&nbsp;'+campaignCollectionInterrupted+'<br>DECISION ACCURACY&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+acc+'%<br>LONGEST STREAK&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+arcadeBestStreak+'<br>SITES DEGRADED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+cpDegradedCount()+' / 5<br>FINAL OE COMPROMISE&nbsp;&nbsp;&nbsp;&nbsp;'+Math.round(campaignCompromise)+'%';$('#arcadeResult').classList.remove('hidden')}
function arcadeMenu(){musicSetMode('menu');cpHideCampaignOverlays();$('#mainMenu').classList.add('hidden');$('#arcadeResult').classList.add('hidden');$('#arcadeBriefing').classList.remove('hidden');window.CP_MENU=true}
function cpShowMenu(){
  musicSetMode('menu');
  window.CP_PAUSED=false;window.CP_MENU=true;running=false;stopCollect();A.dest=null;
  $('#pauseMenu').classList.add('hidden');$('#mainMenu').classList.remove('hidden');
}
function cpCampaign(){
  window.CP_MENU=false;window.CP_PAUSED=false;
  $('#mainMenu').classList.add('hidden');$('#pauseMenu').classList.add('hidden');
  $('#startScreen').style.display='none';deploy();last=performance.now();
}
function cpSetPause(v){
  if(window.CP_MENU||!running)return;
  if(v){
    window.CP_PAUSED=true;window.CP_PAUSE_AT=performance.now();backgroundMusic.volume=.16;
    $('#pauseMenu').classList.remove('hidden');
  }else{
    const now=performance.now(),d=now-window.CP_PAUSE_AT;
    start+=d;lastSpawn+=d;A.lastMove+=d;T.forEach(t=>{if(t.bornAt)t.bornAt+=d;if(t.proxSince)t.proxSince+=d;if(t.collectStarted)t.collectStarted+=d;if(t.stallAt)t.stallAt+=d});if(intelDropAt)intelDropAt+=d;if(intelDropExpires)intelDropExpires+=d;if(intelFusionUntil)intelFusionUntil+=d;
    window.CP_PAUSED=false;last=now;backgroundMusic.volume=.34;
    $('#pauseMenu').classList.add('hidden');
  }
}
$('#campaignBtn').addEventListener('click',cpCampaignMenu);$('#arcadeBtn').addEventListener('click',arcadeMenu);$('#arcadeBegin').addEventListener('click',arcadeBegin);$('#arcadeBack').addEventListener('click',()=>{$('#arcadeBriefing').classList.add('hidden');$('#mainMenu').classList.remove('hidden')});$('#arcadeRedeploy').addEventListener('click',arcadeBegin);$('#arcadeMenuBtn').addEventListener('click',()=>{arcadeHide();cpShowMenu()});$('#mission0101').addEventListener('click',cpBrief0101);$('#mission0102').addEventListener('click',cpBrief0102);$('#mission0103').addEventListener('click',cpBrief0103);$('#mission0104').addEventListener('click',cpBrief0104);$('#mission0105').addEventListener('click',cpBrief0105);$('#campaignBack').addEventListener('click',()=>{$('#campaignMenu').classList.add('hidden');$('#mainMenu').classList.remove('hidden')});$('#briefBack').addEventListener('click',()=>{$('#briefing0101').classList.add('hidden');$('#campaignMenu').classList.remove('hidden')});$('#briefBack0102').addEventListener('click',()=>{$('#briefing0102').classList.add('hidden');$('#campaignMenu').classList.remove('hidden')});$('#briefBack0103').addEventListener('click',()=>{$('#briefing0103').classList.add('hidden');$('#campaignMenu').classList.remove('hidden')});$('#briefBack0104').addEventListener('click',()=>{$('#briefing0104').classList.add('hidden');$('#campaignMenu').classList.remove('hidden')});$('#briefBack0105').addEventListener('click',()=>{$('#briefing0105').classList.add('hidden');$('#campaignMenu').classList.remove('hidden')});$('#begin0101').addEventListener('click',cpBegin0101);$('#begin0102').addEventListener('click',cpBegin0102);$('#begin0103').addEventListener('click',cpBegin0103);$('#begin0104').addEventListener('click',cpBegin0104);$('#begin0105').addEventListener('click',cpBegin0105);$('#intelMitigate').addEventListener('click',()=>cpIntelDropChoose('MITIGATE'));$('#intelExploit').addEventListener('click',()=>cpIntelDropChoose('EXPLOIT'));$('#resultRetry').addEventListener('click',()=>campaignMission==='01-05'?cpBegin0105():(campaignMission==='01-04'?cpBegin0104():(campaignMission==='01-03'?cpBegin0103():(campaignMission==='01-02'?cpBegin0102():cpBegin0101()))));$('#resultContinue').addEventListener('click',cpCampaignMenu);
$('#pauseBtn').addEventListener('click',()=>cpSetPause(!window.CP_PAUSED));
$('#resumeBtn').addEventListener('click',()=>cpSetPause(false));
$('#restartBtn').addEventListener('click',()=>{window.CP_PAUSED=false;$('#pauseMenu').classList.add('hidden');if(campaignMission==='ARCADE')arcadeBegin();else{deploy();last=performance.now()}});
$('#abortBtn').addEventListener('click',()=>{campaignMission==='ARCADE'?cpShowMenu():(campaignMission?cpCampaignMenu():cpShowMenu())});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!window.CP_MENU&&running){e.preventDefault();cpSetPause(!window.CP_PAUSED)}});
cpRefreshCampaign();cpShowMenu();
requestAnimationFrame(loop)})();