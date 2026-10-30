(()=>{
 const modal=$('modal');
 const art='art/blood-debt/';
 const sceneFiles=['li-village-ceremony','li-village-disaster','ancestral-seal','li-village-ceremony','ancestral-seal','ancestral-seal','ending-dawn'];
 const peopleData=[
  {name:'李寒卓',role:'李家村幸存者',desc:'带着沾血玉佩来到吴家村，追查十年前的惨案。',unlock:0,image:art+'characters/li-hanzhuo-calm.png',scene:art+'backgrounds/standalone/li-village-ceremony.png',expressions:[['平静',art+'characters/li-hanzhuo-calm.png',0],['愤怒',art+'characters/li-hanzhuo-angry.png',1]]},
  {name:'守门员',role:'村口防线',desc:'听见李寒卓的名字后，召唤拳王幻影阻拦。',unlock:1},
  {name:'空间守护者',role:'裂隙证人',desc:'他的证言指向十年前被封闭的空间裂隙。',unlock:2},
  {name:'不灭守井人',role:'记忆守护者',desc:'守护着古井中残缺的记忆。',unlock:3},
  {name:'虚空掌控者',role:'借刀之谜',desc:'他称李寒卓是被人送进村庄的一把刀。',unlock:4},
  {name:'时空守护者',role:'玉佩共鸣',desc:'揭示了玉佩与空间封印之间的联系。',unlock:5},
  {name:'吴家聪',role:'吴家村老祖',desc:'守护神兵封印，也背负着十年前的抉择。',unlock:6,image:art+'wu-jiacong.png',scene:art+'backgrounds/standalone/ancestral-seal.png',expressions:[['平静',art+'wu-jiacong.png',6]]}
 ];
 const itemData=[
  {name:'沾血玉佩',role:'父亲遗物',desc:'父亲留下的沾血玉佩，背面刻着四个字：吴家神兵。',unlock:0,image:art+'blood-jade.png'},
  {name:'吴家神兵',role:'归墟神剑',desc:'拥有自身意志的传世神兵。李寒卓以自身意志将其压制后，神剑最终认主。',unlock:7,image:art+'guixu-bound.png'}
 ];
 const sceneData=chapters.map((chapter,index)=>({name:names[index],role:chapter[0],desc:chapter[1],unlock:index+1,image:art+'backgrounds/standalone/'+sceneFiles[index]+'.png'}));
 const eventData=chapters.map((chapter,index)=>({name:chapter[0],role:'第 '+(index+1)+' 章',desc:chapter[2],unlock:index+1,image:art+'backgrounds/standalone/'+sceneFiles[index]+'.png'}));
 const groups={人物:peopleData,物品:itemData,场景:sceneData,事件:eventData};
 const previousShow=show,previousClose=close;
 show=function(content){modal.classList.remove('codex-modal','codex-viewing');return previousShow(content)};
 close=function(){modal.classList.remove('codex-modal','codex-viewing');return previousClose()};
 const unlocked=item=>progress>=item.unlock;
 const typeClass=tab=>tab==='人物'?'people':tab==='物品'?'items':'scenes';
 function card(item,index,tab,selected){
  const open=unlocked(item),visual=open&&item.image?`<img src="${item.image}" alt="">`:'<span class="codex-silhouette" aria-hidden="true"></span>';
  return `<button class="codex-card ${open?'is-unlocked':'is-locked'} ${selected===index?'is-selected':''}" data-codex-entry="${index}" aria-label="${open?item.name:'未解锁档案'}">
   <span class="codex-card-visual ${typeClass(tab)}">${visual}<i>${open?'':'?'}</i></span>
   <span class="codex-card-copy"><b>${open?item.name:'未知档案'}</b><small>${open?item.role:'尚未解锁'}</small></span><em>${open?'已收录':'封印中'}</em>
  </button>`;
 }
 function detail(item,tab){
  const open=unlocked(item),hasImage=open&&item.image;
  const visual=hasImage?`<img src="${item.image}" alt="${item.name}" draggable="false">`:'<span class="codex-detail-silhouette" aria-hidden="true"></span>';
  return `<div class="codex-detail-visual ${typeClass(tab)} ${hasImage?'has-image':'no-image'}" id="codexDetailVisual">${visual}<div class="codex-detail-glow"></div></div>
   <div class="codex-detail-copy"><small>${open?item.role:'SEALED ARCHIVE'}</small><h3>${open?item.name:'未知档案'}</h3><i></i><p>${open?item.desc:'卷宗仍被封印。完成对应经历后，相关记录才会显现。'}</p>${open&&tab==='场景'?'<button id="codexZoom" class="codex-zoom">放大查看</button>':''}${open&&tab==='人物'&&item.expressions?'<button id="codexAppreciate" class="codex-appreciate">鉴赏立绘</button>':''}</div>`;
 }
 function artViewer(item){
  if(!unlocked(item)||!item.expressions)return;
  const expressions=item.expressions.filter(expression=>progress>=expression[2]);if(!expressions.length)return;
  const root=modal.querySelector('#modalContent'),viewer=document.createElement('section');
  viewer.className='codex-art-viewer';viewer.dataset.background='dark';
  viewer.innerHTML=`<div class="art-viewer-bg scene" style="background-image:url('${item.scene||''}')"></div><div class="art-viewer-bg tone"></div><div class="art-viewer-stage" id="artViewerStage" aria-label="${item.name}立绘鉴赏"><figure id="artViewerFigure"><img id="artViewerA" class="active" src="${expressions[0][1]}" alt="${item.name}"><img id="artViewerB" alt="" aria-hidden="true"></figure></div><div class="art-viewer-ui"><button id="artViewerBack">← 返回图鉴</button><div class="art-viewer-panel expressions"><small>表情</small>${expressions.map((expression,index)=>`<button data-art-expression="${index}" class="${index?'':'active'}">${expression[0]}</button>`).join('')}</div><div class="art-viewer-panel backgrounds"><small>背景</small><button data-art-bg="dark" class="active">暗黑</button><button data-art-bg="scene">场景</button><button data-art-bg="solid">纯色</button><button data-art-bg="none">隐藏</button></div><button id="artViewerReset">重置视角</button><button id="artViewerHide">隐藏 UI</button></div><p class="art-viewer-hint">拖动移动 · 滚轮或双指缩放 · 双击重置</p>`;
  root.appendChild(viewer);modal.classList.add('codex-viewing');
  const stage=$('artViewerStage'),figure=$('artViewerFigure'),images=[$('artViewerA'),$('artViewerB')];
  let view={x:0,y:0,scale:1},active=0,switchToken=0,idleTimer,tapTime=0;const pointers=new Map();
  const reduced=()=>document.body.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=()=>{view.scale=Math.max(.5,Math.min(3,view.scale));view.x=Math.max(-stage.clientWidth*.42,Math.min(stage.clientWidth*.42,view.x));view.y=Math.max(-stage.clientHeight*.38,Math.min(stage.clientHeight*.38,view.y))};
  const render=()=>{clamp();figure.style.transform=`translate3d(${view.x}px,${view.y}px,0) scale(${view.scale})`};
  const reset=()=>{view={x:0,y:0,scale:1};render()};
  const activity=()=>{viewer.classList.remove('is-idle');clearTimeout(idleTimer);idleTimer=setTimeout(()=>viewer.classList.add('is-idle'),3000)};
  const rebase=()=>{const points=[...pointers.values()];if(points.length===1)points[0].origin={x:points[0].x,y:points[0].y,vx:view.x,vy:view.y};if(points.length===2){const [a,b]=points;viewer._pinch={distance:Math.hypot(a.x-b.x,a.y-b.y)||1,midX:(a.x+b.x)/2,midY:(a.y+b.y)/2,x:view.x,y:view.y,scale:view.scale}}};
  stage.onpointerdown=event=>{activity();try{stage.setPointerCapture(event.pointerId)}catch{}pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size>1)viewer._multiTouch=true;rebase()};
  stage.onpointermove=event=>{if(!pointers.has(event.pointerId))return;const point=pointers.get(event.pointerId);point.x=event.clientX;point.y=event.clientY;const points=[...pointers.values()];if(points.length>1){const [a,b]=points,pinch=viewer._pinch;if(!pinch)return;const distance=Math.hypot(a.x-b.x,a.y-b.y)||1,midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;view.scale=pinch.scale*distance/pinch.distance;view.x=pinch.x+midX-pinch.midX;view.y=pinch.y+midY-pinch.midY}else if(point.origin){view.x=point.origin.vx+point.x-point.origin.x;view.y=point.origin.vy+point.y-point.origin.y}render()};
  const pointerEnd=event=>{const multi=viewer._multiTouch;if(event.pointerType==='touch'&&!multi&&Date.now()-tapTime<300){reset();tapTime=0}else if(event.pointerType==='touch'&&!multi)tapTime=Date.now();pointers.delete(event.pointerId);if(!pointers.size)viewer._multiTouch=false;rebase()};
  stage.onpointerup=stage.onpointercancel=pointerEnd;stage.ondblclick=reset;
  stage.addEventListener('wheel',event=>{event.preventDefault();activity();const rect=stage.getBoundingClientRect(),old=view.scale,next=Math.max(.5,Math.min(3,old*Math.exp(-event.deltaY*.001)));view.x+=(event.clientX-rect.left-rect.width/2-view.x)*(1-next/old);view.y+=(event.clientY-rect.top-rect.height/2-view.y)*(1-next/old);view.scale=next;render()},{passive:false});
  async function switchExpression(index){const expression=expressions[index],token=++switchToken,next=1-active;images[next].src=expression[1];try{await images[next].decode()}catch{}if(token!==switchToken)return;images[next].classList.add('active');images[active].classList.remove('active');active=next;viewer.querySelectorAll('[data-art-expression]').forEach((button,i)=>button.classList.toggle('active',i===index));activity()}
  viewer.querySelectorAll('[data-art-expression]').forEach(button=>button.onclick=()=>switchExpression(+button.dataset.artExpression));
  viewer.querySelectorAll('[data-art-bg]').forEach(button=>button.onclick=()=>{viewer.dataset.background=button.dataset.artBg;viewer.querySelectorAll('[data-art-bg]').forEach(other=>other.classList.toggle('active',other===button));activity()});
  $('artViewerReset').onclick=()=>{reset();activity()};$('artViewerHide').onclick=()=>viewer.classList.add('ui-hidden');
  stage.onclick=()=>{if(viewer.classList.contains('ui-hidden')){viewer.classList.remove('ui-hidden');activity()}};
  $('artViewerBack').onclick=()=>{clearTimeout(idleTimer);switchToken++;modal.classList.remove('codex-viewing');viewer.classList.add('is-leaving');setTimeout(()=>viewer.remove(),reduced()?0:180)};
  expressions.slice(1).forEach(expression=>{const preload=new Image;preload.src=expression[1]});render();activity();
 }
 function codexView(tab='人物',selected=0){
  const items=groups[tab]||groups.人物,index=Math.max(0,Math.min(selected,items.length-1));
  previousShow(`<section class="codex-gallery" data-category="${tab}">
   <div class="codex-mist" aria-hidden="true"></div>
   <header class="codex-header"><div><small>ARCHIVE · 已完成 ${progress} / 7 章</small><h2>收集图鉴</h2></div><nav aria-label="图鉴分类">${Object.keys(groups).map(name=>`<button data-codex-tab="${name}" class="${name===tab?'active':''}">${name}</button>`).join('')}</nav></header>
   <div class="codex-body"><div class="codex-list" tabindex="0">${items.map((item,i)=>card(item,i,tab,index)).join('')}</div><aside class="codex-showcase" id="codexShowcase">${detail(items[index],tab)}</aside></div>
  </section>`);
  modal.classList.add('codex-modal');
  const list=modal.querySelector('.codex-list'),showcase=$('codexShowcase');
  function select(next){
   const item=items[next];if(!item)return;
   modal.querySelectorAll('[data-codex-entry]').forEach((button,i)=>button.classList.toggle('is-selected',i===next));
   showcase.classList.add('is-changing');
   const swap=()=>{showcase.innerHTML=detail(item,tab);showcase.classList.remove('is-changing');bindZoom()};
   document.body.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches?swap():setTimeout(swap,150);
  }
  function bindZoom(){const zoom=$('codexZoom'),visual=$('codexDetailVisual'),appreciate=$('codexAppreciate');if(zoom&&visual)zoom.onclick=()=>{visual.classList.toggle('is-zoomed');zoom.textContent=visual.classList.contains('is-zoomed')?'缩小预览':'放大查看'};if(appreciate)appreciate.onclick=()=>artViewer(items[+modal.querySelector('.codex-card.is-selected')?.dataset.codexEntry||0])}
  modal.querySelectorAll('[data-codex-tab]').forEach(button=>button.onclick=()=>codexView(button.dataset.codexTab,0));
  modal.querySelectorAll('[data-codex-entry]').forEach(button=>button.onclick=()=>select(+button.dataset.codexEntry));
  bindZoom();requestAnimationFrame(()=>list.querySelector('.is-selected')?.scrollIntoView({block:'nearest'}));
 }
 codex=codexView;
 $('codex').onclick=()=>codexView();
 ['codex-gallery.css','codex-art-viewer.css'].forEach(href=>{const style=document.createElement('link');style.rel='stylesheet';style.href=href;document.head.appendChild(style)});
})();
