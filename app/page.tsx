"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDown, Menu, X } from "lucide-react";
import BathroomCutaway from "./BathroomCutaway";
import KitchenReveal from "./KitchenReveal";
import OfficialFooter from "./OfficialFooter";
import ProjectShowcase from "./ProjectShowcase";
import {drawSpatialCopy, type CameraProjection} from "./SpatialCopy";

const media = "/media/";
const asset=(path:string):string => typeof window!=="undefined" ? (window as Window & {__MEDIA__?:Record<string,string>}).__MEDIA__?.[path] || path : path;
const clamp = (v:number, a=0, b=1) => Math.max(a,Math.min(b,v));
const smooth = (v:number) => { const x=clamp(v); return x*x*(3-2*x); };
const cinematicEase = (v:number) => { const x=clamp(v); return x*x*x*(x*(x*6-15)+10); };
const segment = (v:number,a:number,b:number) => clamp((v-a)/(b-a));
const stages = ["A sua casa", "A transformação da ilha", "Precisão em cada corte", "A nova ilha", "Uma nova cozinha", "De uma divisão à outra", "Uma nova possibilidade", "A preparação", "Preparar a parede", "Assentar e alinhar", "O último acabamento", "Continuar a descobrir"];
const sequenceNames=["kitchen","passage","bathroom","ceramic-cut","ceramic-lay"];
const phoneLayout=()=>window.matchMedia("(max-width:700px), (max-width:1000px) and (max-height:500px) and (orientation:landscape)").matches;
const phoneCaptions=[[[0,.065]],[[.065,.12],[.285,.395]],[[.395,.445]],[[.445,.66]],[[.66,.70]],[[.70,.765]],[[.14,.27]],[[.795,.835]],[[.85,.914]],[[.94,.98]],[[.985,1]]];
const desktopCaptions=[[[0,.05]],[[.065,.11],[.31,.38]],[[.405,.435]],[[.46,.64]],[[.67,.695]],[[.71,.755]],[[.15,.26]],[[.797,.833]],[[.855,.91]],[[.944,.978]],[[.988,1]]];
// Both craft inserts scrub frame by frame; the wall sequence holds the completed fit before returning to the room.
const journeyShots=[
 {end:.14,room:0,from:.022,to:.12,first:1,last:60},
 {end:.285,room:3,from:.14,to:.27,first:1,last:192},
 {end:.445,room:0,from:.285,to:.395,first:72,last:192},
 {end:.66,room:1,from:.445,to:.66,first:1,last:192},
 {end:.795,room:2,from:.70,to:.765,first:1,last:52},
 {end:.83,room:4,from:.795,to:.83,first:16,last:72},
 {end:.855,room:4,from:.83,to:.855,first:72,last:96},
 {end:.94,room:4,from:.855,to:.90,first:120,last:192},
 {end:1.01,room:2,from:.94,to:.985,first:77,last:192}
];
type BlendLayer={room:number,frame:number,zoom:number,focal:number};
function wallTransition(p:number,mobile:boolean):{name:string,amount:number,reveal?:boolean,layers:[BlendLayer,BlendLayer]}|undefined {
 if(p>=.765&&p<.795){
  const u=segment(p,.765,.795),t=cinematicEase(u);
  return {name:"bathroom-to-mortar",amount:t,layers:[
   {room:2,frame:52+Math.round(u*12),zoom:1+.12*t,focal:mobile?.55:.5},
   {room:4,frame:1+Math.round(u*15),zoom:1+.04*(1-t),focal:.5}
  ]};
 }
 if(p>=.83&&p<.855){
  const u=segment(p,.83,.855),t=cinematicEase(u);
  return {name:"mortar-to-tile",amount:t,layers:[
   {room:4,frame:72+Math.round(u*24),zoom:1+.025*t,focal:.5},
   {room:4,frame:97+Math.round(u*23),zoom:1+.025*(1-t),focal:.5}
  ]};
 }
 if(p>=.91&&p<.94){
  const u=segment(p,.91,.94),t=cinematicEase(u);
  return {name:"fitted-tile-to-bathroom",amount:t,layers:[
   {room:4,frame:192,zoom:1+.025*t,focal:.5},
   {room:2,frame:65+Math.round(u*12),zoom:1+.12*(1-t),focal:mobile?.55:.5}
  ]};
 }
}
function roomTransition(p:number,mobile:boolean):ReturnType<typeof wallTransition> {
 if(p>=.42&&p<.445){
  const t=cinematicEase(segment(p,.42,.445));
  return {name:"kitchen-to-journey",amount:t,reveal:true,layers:[
   {room:0,frame:192,zoom:1.07+.045*t,focal:mobile?.53:.5},
   {room:1,frame:1,zoom:1+.07*(1-t),focal:mobile?.53:.5}
  ]};
 }
 if(p>=.64&&p<.68){
  const u=segment(p,.64,.68),t=cinematicEase(u);
  return {name:"journey-to-bathroom",amount:t,reveal:true,layers:[
   {room:1,frame:174+Math.round(u*18),zoom:1+.06*t,focal:mobile?.55:.5},
   {room:2,frame:1,zoom:1+.06*(1-t),focal:mobile?.55:.5}
  ]};
 }
}

function SceneTitle({lead,accent,opening=false}:{lead:string,accent:string,opening?:boolean}) {
 const Tag=opening?"h1":"h2";
 return <Tag className="scene-title" aria-label={`${lead} ${accent}`}><span className="copy-line" aria-hidden="true"><span>{lead}</span></span><span className="copy-line accent" aria-hidden="true"><em>{accent}</em></span></Tag>;
}

function Mark() {
 return <a className="brand official-brand" href="#inicio" aria-label="Freitas Renovações — início"><img src={asset("/media/freitas-logo-official.svg")} width="2433" height="562" alt="Freitas Renovações" decoding="async"/></a>;
}

function Hero({reduced}:{reduced:boolean}) {
 const root=useRef<HTMLElement>(null), canvas=useRef<HTMLCanvasElement>(null), progress=useRef<HTMLSpanElement>(null), captionWrap=useRef<HTMLDivElement>(null), spatial=useRef<HTMLCanvasElement>(null);
 const [stage,setStage]=useState(0), [ready,setReady]=useState(false);
 useEffect(()=>{
  if(reduced)return;
  const section=root.current,cn=canvas.current;
  if(!section||!cn)return;
  const ctx=cn.getContext("2d");if(!ctx)return;
  const revealCanvas=document.createElement("canvas"),revealContext=revealCanvas.getContext("2d");
  const depthCanvas=spatial.current,depthContext=depthCanvas?.getContext("2d");
  let camera:CameraProjection|null=null,depthW=0,depthH=0,depthDpr=1,fontReady=false;
  const fontFamily=getComputedStyle(section).getPropertyValue("--hero-serif").trim()||"Georgia,serif";
  setReady(false);
  let dead=false,raf=0,target=0,position=0,w=0,h=0,lastKey="",oldStage=-1,canvasReady=false,lastTime=0,sectionTop=0,travel=1,inView=true,mobile=phoneLayout();
  const captions=Array.from(captionWrap.current?.querySelectorAll<HTMLElement>(".scene-copy")||[]);
  const captionOpacity=captions.map(()=>-1),captionPhase=captions.map(()=>-1);
  const caches=sequenceNames.map(()=>new Map<number,HTMLImageElement>());
  // Preserve the original 720p footage on every screen; memory is bounded separately.
  const folders=sequenceNames.map(name=>name+"-hd");
  const counts=[192,192,192,192,192];
  const pending=new Set<string>(),failed=new Set<string>(),anchors=new Set<string>();
  const anchorsAt=(p:number)=>p<.14?["0:60","3:1"]:p<.285?["3:192","0:72"]:p<.445?["0:192","1:1"]:p<.68?["1:192","2:1"]:p<.795?["2:64","4:1","4:16"]:p<.855?["4:96","4:97","4:120"]:p<.94?["4:192","2:65"]:["2:192"];
  let wantedViews:[number,number][]=[[0,1]],wantedKey="",active=0,queue:[number,number][]=[];
  const retain=(room:number,num:number)=>anchors.has(`${room}:${num}`)||wantedViews.some(([r,n])=>room===r&&Math.abs(num-n)<=4);
  const pump=()=>{
   while(active<3&&queue.length&&!dead&&inView&&!document.hidden){
    const [room,num]=queue.shift()!,key=`${room}:${num}`;
    if(caches[room].has(num)||pending.has(key)||failed.has(key))continue;
    active++;pending.add(key);
    void load(room,num).then(()=>{active--;pending.delete(key);pump();});
   }
  };
  const around=(views:[number,number][])=>{
   wantedViews=views;
   caches.forEach((cache,r)=>cache.forEach((_,n)=>{if(!retain(r,n))cache.delete(n);}));
   queue=[...views];
   for(const key of anchors){const [r,n]=key.split(":").map(Number);queue.push([r,n]);}
   for(let d=1;d<=4;d++)for(const [room,index] of views){if(index+d<=counts[room])queue.push([room,index+d]);if(index-d>=1)queue.push([room,index-d]);}
   pump();
  };
  const load=(room:number,num:number)=>new Promise<void>(resolve=>{
   const im=new Image();im.decoding="async";
   im.onload=async()=>{try{await im.decode();}catch{}if(!dead&&retain(room,num)){caches[room].set(num,im);lastKey="";request();}resolve();};
   im.onerror=()=>{failed.add(`${room}:${num}`);resolve();};
   im.src=asset(`${media}${folders[room]}/${String(num).padStart(3,"0")}.webp`);
  });
  const paint=(room:number,index:number,zoom=1,focalX?:number,focalY=.5,alpha=1,surface=ctx)=>{
   const cache=caches[room];if(!cache.size)return;
   const actual=cache.has(index)?index:[...cache.keys()].reduce((a,b)=>Math.abs(a-index)<Math.abs(b-index)?a:b);
   const im=cache.get(actual)!;
   if(surface===ctx){cn.dataset.sourceSize=`${im.naturalWidth}x${im.naturalHeight}`;cn.dataset.profile="hd";}
   const ratio=Math.max(w/im.naturalWidth,h/im.naturalHeight)*zoom;
   const focal=focalX??(mobile?(room===0?.53:room===1?.53+.02*(index-1)/191:room===3?.6:room===4?.5:.55):.5);
   const scaledWidth=im.naturalWidth*ratio,scaledHeight=im.naturalHeight*ratio;
   surface.globalAlpha=alpha;
   const dx=clamp(w/2-scaledWidth*focal,w-scaledWidth,0),dy=clamp(h/2-scaledHeight*focalY,h-scaledHeight,0);
   surface.drawImage(im,dx,dy,scaledWidth,scaledHeight);
   if(surface===ctx&&alpha===1)camera={room,frame:actual,x:dx*depthW/w,y:dy*depthH/h,scale:scaledWidth/1280*depthW/w};
   surface.globalAlpha=1;
   return actual;
  };
  const draw=(room:number,index:number,p:number,blend:ReturnType<typeof wallTransition>)=>{
   const intoCut=p>=.12&&p<.14,fromCut=p>=.27&&p<.285;
   let actual:number|undefined;
   cn.dataset.transition="";cn.dataset.blend="0";cn.dataset.transitionStyle="";
   if(intoCut&&caches[0].has(60)&&caches[3].has(1)){
    const t=cinematicEase(segment(p,.12,.14));
    actual=paint(0,60,1+.5*t,(mobile?.53:.5)+.07*t,.5+.13*t);
    paint(3,1,1+.12*(1-t),mobile?.6:.5,.5,t);
    cn.dataset.transition="island-to-cut";cn.dataset.blend=t.toFixed(3);
   }else if(fromCut&&caches[3].has(192)&&caches[0].has(72)){
    const t=cinematicEase(segment(p,.27,.285));
    actual=paint(3,192,1+.12*t,mobile?.6:.5);
    paint(0,72,1+.45*(1-t),(mobile?.53:.5)+.07*(1-t),.5+.13*(1-t),t);
    cn.dataset.transition="cut-to-new-island";cn.dataset.blend=t.toFixed(3);
   }else if(blend){
    const [outgoing,incoming]=blend.layers;
    actual=paint(outgoing.room,outgoing.frame,outgoing.zoom,outgoing.focal);
    let next:number|undefined;
    if(blend.reveal&&revealContext&&actual!==undefined){
     if(revealCanvas.width!==w||revealCanvas.height!==h){revealCanvas.width=w;revealCanvas.height=h;revealContext.imageSmoothingEnabled=true;revealContext.imageSmoothingQuality="high";}
     revealContext.clearRect(0,0,w,h);
     next=paint(incoming.room,incoming.frame,incoming.zoom,incoming.focal,.5,1,revealContext);
     const feather=w*.07,edge=w+feather-(w+2*feather)*blend.amount;
     const mask=revealContext.createLinearGradient(edge-feather,0,edge+feather,0);
     mask.addColorStop(0,"rgba(0,0,0,0)");mask.addColorStop(1,"rgba(0,0,0,1)");
     revealContext.globalCompositeOperation="destination-in";revealContext.fillStyle=mask;revealContext.fillRect(0,0,w,h);revealContext.globalCompositeOperation="source-over";
     ctx.drawImage(revealCanvas,0,0);
    }else next=paint(incoming.room,incoming.frame,incoming.zoom,incoming.focal,.5,actual===undefined?1:blend.amount);
    actual??=next;
    cn.dataset.transition=blend.name;cn.dataset.blend=blend.amount.toFixed(3);
    cn.dataset.transitionStyle=blend.reveal?"directional-reveal":"dissolve";
   }else{
    const shot=journeyShots.find(shot=>p<shot.end)!;
    const phase=segment(p,shot.from,room===1?.64:shot.to);
    const depth=room===4?.012:room===3?.025:.018;
    const zoom=p>=.395&&p<.42?1+.07*cinematicEase(segment(p,.395,.42)):1+depth*Math.sin(Math.PI*phase);
    actual=paint(room,index,zoom);
   }
   if(actual===undefined)return;
   cn.dataset.frame=String(actual);cn.dataset.room=sequenceNames[blend?.layers[0].room??room];
   cn.dataset.nextRoom=blend?sequenceNames[blend.layers[1].room]:"";
   cn.dataset.cached=String(caches.reduce((total,cache)=>total+cache.size,0));
   if(!canvasReady){canvasReady=true;setReady(true);}
  };
  const update=(now:number)=>{
   raf=0;
   const elapsed=lastTime?Math.min(now-lastTime,40):1000/60;lastTime=now;
   position+=(target-position)*(1-Math.exp(-elapsed/125));
   if(Math.abs(target-position)<.00008)position=target;
   const p=position;section.dataset.progress=p.toFixed(4);
   const shot=journeyShots.find(shot=>p<shot.end)!;
   const room=shot.room;
   const index=shot.first+Math.round(segment(p,shot.from,shot.to)*(shot.last-shot.first));
   const blend=wallTransition(p,mobile)||roomTransition(p,mobile);
   const views:[number,number][]=blend?blend.layers.map(layer=>[layer.room,layer.frame]):[[room,index]];
   const nextAnchors=anchorsAt(p);
   const viewKey=views.map(([r,n])=>`${r}:${n}`).join("|")+";"+nextAnchors.join("|");
   if(viewKey!==wantedKey){wantedKey=viewKey;anchors.clear();nextAnchors.forEach(key=>anchors.add(key));around(views);}
   const key=`${room}:${index}:${p.toFixed(4)}`;
   if(key!==lastKey){draw(room,index,p,blend);lastKey=key;}
   if(depthContext&&depthCanvas&&fontReady){
    const subject=drawSpatialCopy(depthContext,depthW,depthH,depthDpr,p,camera,mobile,fontFamily);
    depthCanvas.dataset.subject=subject;depthCanvas.dataset.frame=String(camera?.frame||0);
   }
   if(progress.current)progress.current.style.transform=`scaleX(${p})`;
   const times=mobile?phoneCaptions:desktopCaptions;
   captions.forEach((el,i)=>{
    const interval=times[i].find(([start,end])=>p>=start&&p<=end)||times[i][0];
    const phase=Math.round(segment(p,interval[0],interval[1])*1000);
    const opacity=Math.max(...times[i].map(([start,end])=>{
     const fade=Math.min(.008,(end-start)*.2);
     const fadeIn=i===0?1:cinematicEase(segment(p,start+.001,start+fade));
     const fadeOut=i===times.length-1?1:1-cinematicEase(segment(p,end-fade,end-.001));
     return fadeIn*fadeOut;
    }));
    if(opacity>.005&&captionPhase[i]!==phase){
     captionPhase[i]=phase;el.style.setProperty("--copy-progress",String(phase/1000));
     el.style.setProperty("--copy-drift",`${((phase/1000-.5)*(mobile?3:12)).toFixed(2)}px`);
    }
    const rounded=Math.round(opacity*1000);if(captionOpacity[i]===rounded)return;captionOpacity[i]=rounded;
    el.style.opacity=String(opacity);el.style.setProperty("--copy-reveal",String(opacity));
    el.style.visibility=opacity>.005?"visible":"hidden";el.style.pointerEvents=opacity>.9?"auto":"none";el.inert=opacity<.9;
    if(opacity>.5)section.dataset.copy=el.dataset.composition||"opening";
   });
   const current=[.022,.14,.285,.395,.445,.66,.70,.765,.845,.94,.985,1.01].findIndex(end=>p<end);
   if(current!==oldStage){setStage(current);oldStage=current;}
   if(position!==target)request();else lastTime=0;
  };
  const request=()=>{if(!raf&&!dead&&inView&&!document.hidden)raf=requestAnimationFrame(update);};
  const onScroll=()=>{target=clamp((window.scrollY-sectionTop)/travel);request();};
  const resize=()=>{
   mobile=phoneLayout();
   sectionTop=section.getBoundingClientRect().top+window.scrollY;
   travel=Math.max(1,section.offsetHeight-(section.querySelector<HTMLElement>(".stage")?.offsetHeight||window.innerHeight));
   // Never render below the CSS display size; retain detail on high-density screens.
   const ratio=Math.max(1,Math.min(window.devicePixelRatio||1,2,1920/Math.max(cn.clientWidth,1),1080/Math.max(cn.clientHeight,1)));
   const nextW=Math.round(cn.clientWidth*ratio),nextH=Math.round(cn.clientHeight*ratio);
   if(nextW!==w||nextH!==h){w=nextW;h=nextH;cn.width=w;cn.height=h;lastKey="";}
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
   if(depthCanvas){
    depthW=depthCanvas.clientWidth;depthH=depthCanvas.clientHeight;depthDpr=Math.min(window.devicePixelRatio||1,2);
    const dw=Math.round(depthW*depthDpr),dh=Math.round(depthH*depthDpr);
    if(depthCanvas.width!==dw||depthCanvas.height!==dh){depthCanvas.width=dw;depthCanvas.height=dh;lastKey="";}
   }
   onScroll();
  };
  const pause=()=>{cancelAnimationFrame(raf);raf=0;lastTime=0;};
  const visibility=()=>{if(document.hidden)pause();else{onScroll();pump();}};
  // Canvas text must use the same loaded roman and italic faces as the HTML captions.
  const enableDepth=()=>{if(!dead&&depthContext){fontReady=true;section.dataset.depth="ready";lastKey="";request();}};
  void Promise.all([document.fonts.load('400 64px "DM Serif Display"'),document.fonts.load('italic 400 64px "DM Serif Display"')]).then(()=>document.fonts.ready).then(enableDepth,enableDepth);
  resize();
  const intersection=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView){onScroll();pump();}else pause();},{rootMargin:"120px 0px"});intersection.observe(section);
  const sizing=new ResizeObserver(resize);sizing.observe(cn);
  window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",resize);
  document.addEventListener("visibilitychange",visibility);
  return()=>{dead=true;delete section.dataset.depth;pause();intersection.disconnect();sizing.disconnect();window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",resize);document.removeEventListener("visibilitychange",visibility);caches.forEach(cache=>cache.clear());};
 },[reduced]);
 const jump=(p:number)=>{if(root.current)window.scrollTo({top:root.current.offsetTop+(root.current.offsetHeight-(root.current.querySelector<HTMLElement>(".stage")?.offsetHeight||window.innerHeight))*p,behavior:reduced?"auto":"smooth"});};
 if(reduced)return <section className="still-hero scroll-still" id="inicio" data-header="light"><span id="experiencia" className="journey-anchor"/><img src={asset(`${media}kitchen-after.webp`)} alt="Visualização conceptual da cozinha renovada com ilha de travertino"/><div className="shade"/><div className="opening-copy"><p className="eyebrow"><span/> OBRAS E REMODELAÇÕES EM AVEIRO</p><SceneTitle opening lead="Uma nova vida" accent="para a sua casa."/><p className="opening-description">Chave na mão, com orçamento fechado,<br className="desktop"/> prazo em contrato e garantia escrita.</p><a href="#contacto" className="pill cream">Pedir orçamento <ArrowUpRight size={16}/></a><a className="opening-secondary" href="#remodelacao">Descobrir a remodelação <ArrowDown size={13}/></a></div></section>;
 return <section ref={root} className="journey scroll-hero" id="inicio" data-header="light" aria-label="Uma viagem pela renovação da sua casa">
  <span id="experiencia" className="journey-anchor"/>
  <div className="stage">
   <div className="room room-kitchen"><img className="poster" src={asset(`${media}kitchen-before.webp`)} alt="" fetchPriority="high"/><canvas ref={canvas} aria-label="Percurso pela mesma casa: cozinha, passagem, remodelação da casa de banho e destaques do corte e assentamento da cerâmica, controlados pelo scroll" style={{opacity:ready?1:0}}/></div>
   <div className="shade"/>
   <canvas ref={spatial} className="spatial-copy-layer" aria-hidden="true"/>
   <div className="scene-captions" ref={captionWrap}>
    <div className="scene-copy first opening-copy" data-composition="opening"><p className="eyebrow">OBRAS E REMODELAÇÕES EM AVEIRO</p><SceneTitle opening lead="Uma nova vida" accent="para a sua casa."/><p className="opening-description">Chave na mão. Orçamento fechado. <br/>Prazo em contrato e garantia escrita.</p><a href="#contacto" className="pill cream">Pedir orçamento <ArrowUpRight size={16}/></a><button className="opening-secondary" onClick={()=>jump(.10)}>Entre. A transformação começa aqui. <ArrowDown size={13}/></button></div>
    <div className="scene-copy" data-composition="build"><p className="eyebrow">01 / COZINHA — A TRANSFORMAÇÃO</p><SceneTitle lead="A sua ideia." accent="Ganha forma."/><p>Da primeira medida ao último acabamento.</p></div>
    <div className="scene-copy" data-composition="reveal"><p className="eyebrow">01 / COZINHA — UMA NOVA VIDA</p><SceneTitle lead="Outra luz." accent="Mais vida."/><p>O mesmo lugar. Uma nova forma de o viver.</p></div>
    <div className="scene-copy passage-copy" data-composition="passage"><p className="eyebrow">A CASA CONTINUA</p><SceneTitle lead="De espaço" accent="em espaço."/><p>O cuidado acompanha-nos.</p></div>
    <div className="scene-copy" data-composition="before"><p className="eyebrow">02 / CASA DE BANHO — O COMEÇO</p><SceneTitle lead="Aqui começa" accent="a mudança."/><p>Veja o que este espaço pode ser.</p></div>
    <div className="scene-copy" data-composition="build"><p className="eyebrow">02 / CASA DE BANHO — A TRANSFORMAÇÃO</p><SceneTitle lead="Por dentro." accent="Ao pormenor."/><p>Preparar bem. Para durar.</p></div>
    <div className="scene-copy detail-copy" data-composition="cut"><p className="eyebrow">O GESTO / 01 — CORTAR</p><SceneTitle lead="Precisão." accent="À sua medida."/><p>O corte certo dá forma ao seu espaço.</p></div>
    <div className="scene-copy detail-copy" data-composition="mortar"><p className="eyebrow">O GESTO / 02 — PREPARAR</p><SceneTitle lead="Uma boa base." accent="Em cada gesto."/><p>A massa. Os sulcos. O cuidado antes da peça.</p></div>
    <div className="scene-copy detail-copy" data-composition="tile"><p className="eyebrow">O GESTO / 03 — ASSENTAR</p><SceneTitle lead="Cada peça." accent="No seu lugar."/><p>Encaixar. Alinhar. Completar.</p></div>
    <div className="scene-copy" data-composition="finish"><p className="eyebrow">02 / CASA DE BANHO — ACABAR</p><SceneTitle lead="O detalhe" accent="faz a diferença."/><p>Até estar tudo no seu lugar.</p></div>
    <div className="scene-copy" data-composition="closing"><p className="eyebrow">02 / CASA DE BANHO — DEPOIS</p><SceneTitle lead="O seu refúgio." accent="Todos os dias."/><p>Conforto que se sente. Cuidado que se vê.</p><a className="pill cream" href="#contacto">Vamos transformar a sua casa <ArrowUpRight size={16}/></a></div>
   </div>
   <div className="journey-bottom"><button className="scroll-cue" onClick={()=>stage===stages.length-1?document.getElementById('remodelacao')?.scrollIntoView({behavior:'smooth'}):jump([.09,.20,.34,.42,.55,.68,.735,.815,.905,.965,.995][stage])}><span className="scroll-icon"><ArrowDown size={14}/></span><span>{stage===0?"FAÇA SCROLL. VEJA A MUDANÇA.":stages[stage].toUpperCase()}</span></button><div className="room-nav"><button onClick={()=>jump(0)} aria-current={stage<5?"step":undefined}>01 <span>Cozinha</span></button><i/><button onClick={()=>jump(.68)} aria-current={stage>=6?"step":undefined}>02 <span>Casa de banho</span></button></div><a href="#remodelacao" className="skip">Saltar experiência <ArrowDown size={13}/></a></div>
   <span className="journey-concept">VISUALIZAÇÃO CONCEPTUAL</span>
   <div className="journey-progress"><span ref={progress}/></div>
  </div>
 </section>;
}


export default function Home(){
 const [menu,setMenu]=useState(false),[darkHeader,setDarkHeader]=useState(false),[reduced,setReduced]=useState(false);
 const menuButton=useRef<HTMLButtonElement>(null),menuPanel=useRef<HTMLDivElement>(null);
 useEffect(()=>{const q=window.matchMedia("(prefers-reduced-motion: reduce)");setReduced(q.matches);const fn=()=>setReduced(q.matches);q.addEventListener("change",fn);const scroll=()=>{const sections=Array.from(document.querySelectorAll<HTMLElement>("[data-header]"));const headerHeight=document.querySelector<HTMLElement>("header")?.offsetHeight||90;const overlayHeader=window.matchMedia("(max-width:700px), (max-width:1000px) and (max-height:500px) and (orientation:landscape)").matches;const edge=overlayHeader?headerHeight/2:headerHeight+4;const current=sections.find(el=>{const r=el.getBoundingClientRect();return r.top<=edge&&r.bottom>edge;});setDarkHeader(current?.dataset.header==="dark");};scroll();window.addEventListener("scroll",scroll,{passive:true});window.addEventListener("resize",scroll);return()=>{q.removeEventListener("change",fn);window.removeEventListener("scroll",scroll);window.removeEventListener("resize",scroll);};},[]);
 useEffect(()=>{document.documentElement.dataset.motion=reduced?"reduced":"full";},[reduced]);
 useEffect(()=>{if(!menu)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";menuPanel.current?.querySelector<HTMLAnchorElement>("a")?.focus();const key=(e:KeyboardEvent)=>{if(e.key==="Escape"){setMenu(false);menuButton.current?.focus();}if(e.key==="Tab"){const els=[menuButton.current,...Array.from(menuPanel.current?.querySelectorAll<HTMLElement>("a,button")||[])].filter(Boolean) as HTMLElement[];const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};window.addEventListener("keydown",key);return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",key);};},[menu]);
 return <>
  <a href="#remodelacao" className="skip-link">Saltar experiência animada</a>
  <header className={`header ${darkHeader?"ink":""} ${menu?"menu-open":""}`}><Mark/><nav className="desktop-nav" aria-label="Navegação principal"><a href="#remodelacao">Remodelação</a><a href="#projetos">Projetos</a><a href="#cozinha">Cozinhas</a></nav><div className="header-actions"><a className="header-contact" href="#contacto"><span><span className="desktop-word">Pedir </span>orçamento</span> <ArrowUpRight size={14}/></a><button ref={menuButton} className="menu-toggle" aria-label={menu?"Fechar menu":"Abrir menu"} aria-expanded={menu} aria-controls="main-menu" onClick={()=>setMenu(!menu)}>{menu?<X size={20}/>:<Menu size={20}/>}</button></div></header>
  {menu&&<div className="menu-panel" id="main-menu" ref={menuPanel} role="dialog" aria-modal="true" aria-label="Navegação principal"><span className="eyebrow">A SUA CASA, DO PRINCÍPIO AO FIM.</span><nav>{[["Início","inicio"],["Remodelação","remodelacao"],["Cozinhas","cozinha"],["Projetos realizados","projetos"],["Contactos","contacto"]].map(([label,id],i)=><a key={id} href={`#${id}`} onClick={()=>setMenu(false)}><small>0{i+1}</small>{label}<ArrowUpRight size={25}/></a>)}</nav><a className="menu-phone" href="tel:+351961455997">+351 961 455 997</a><span>Aveiro e concelhos vizinhos</span></div>}
  <main>
   <Hero reduced={reduced}/>
   <BathroomCutaway asset={asset} reduced={reduced}/>
   <KitchenReveal asset={asset} reduced={reduced}/>
   <ProjectShowcase asset={asset} reduced={reduced}/>
  </main>
  <OfficialFooter asset={asset} reduced={reduced} onToggleMotion={()=>setReduced(!reduced)}/>
 </>;
}
