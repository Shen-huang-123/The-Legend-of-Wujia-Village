(()=>{
 const modal=$('modal');
 const art='art/blood-debt/';
 const sceneFiles=['li-village-ceremony','li-village-disaster','ancestral-seal','li-village-ceremony','ancestral-seal','ancestral-seal','ending-dawn'];
 const peopleData=[
  {name:'李寒卓',role:'李家村幸存者',desc:'带着沾血玉佩来到吴家村，追查十年前的惨案。',unlock:0,image:art+'characters/li-hanzhuo-calm.png'},
  {name:'守门员',role:'村口防线',desc:'听见李寒卓的名字后，召唤拳王幻影阻拦。',unlock:1},
  {name:'空间守护者',role:'裂隙证人',desc:'他的证言指向十年前被封闭的空间裂隙。',unlock:2},
  {name:'不灭守井人',role:'记忆守护者',desc:'守护着古井中残缺的记忆。',unlock:3},
  {name:'虚空掌控者',role:'借刀之谜',desc:'他称李寒卓是被人送进村庄的一把刀。',unlock:4},
  {name:'时空守护者',role:'玉佩共鸣',desc:'揭示了玉佩与空间封印之间的联系。',unlock:5},
  {name:'吴家聪',role:'吴家村老祖',desc:'守护神兵封印，也背负着十年前的抉择。',unlock:6,image:art+'wu-jiacong.png'}
 ];
 const itemData=[
  {name:'沾血玉佩',role:'父亲遗物',desc:'父亲留下的沾血玉佩，背面刻着四个字：吴家神兵。',unlock:0,image:art+'blood-jade.png'},
  {name:'吴家神兵',role:'归墟神剑',desc:'拥有自身意志的传世神兵。李寒卓以自身意志将其压制后，神剑最终认主。',unlock:7,image:art+'guixu-bound.png'}
 ];
 const sceneData=chapters.map((chapter,index)=>({name:names[index],role:chapter[0],desc:chapter[1],unlock:index+1,image:art+'backgrounds/standalone/'+sceneFiles[index]+'.png'}));
 const eventData=chapters.map((chapter,index)=>({name:chapter[0],role:'第 '+(index+1)+' 章',desc:chapter[2],unlock:index+1,image:art+'backgrounds/standalone/'+sceneFiles[index]+'.png'}));
 const groups={人物:peopleData,物品:itemData,场景:sceneData,事件:eventData};
 const previousShow=show,previousClose=close;
 show=function(content){modal.classList.remove('codex-modal');return previousShow(content)};
 close=function(){modal.classList.remove('codex-modal');return previousClose()};
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
   <div class="codex-detail-copy"><small>${open?item.role:'SEALED ARCHIVE'}</small><h3>${open?item.name:'未知档案'}</h3><i></i><p>${open?item.desc:'卷宗仍被封印。完成对应经历后，相关记录才会显现。'}</p>${open&&tab==='场景'?'<button id="codexZoom" class="codex-zoom">放大查看</button>':''}</div>`;
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
  function bindZoom(){const zoom=$('codexZoom'),visual=$('codexDetailVisual');if(!zoom||!visual)return;zoom.onclick=()=>{visual.classList.toggle('is-zoomed');zoom.textContent=visual.classList.contains('is-zoomed')?'缩小预览':'放大查看'}}
  modal.querySelectorAll('[data-codex-tab]').forEach(button=>button.onclick=()=>codexView(button.dataset.codexTab,0));
  modal.querySelectorAll('[data-codex-entry]').forEach(button=>button.onclick=()=>select(+button.dataset.codexEntry));
  bindZoom();requestAnimationFrame(()=>list.querySelector('.is-selected')?.scrollIntoView({block:'nearest'}));
 }
 codex=codexView;
 $('codex').onclick=()=>codexView();
 const style=document.createElement('link');style.rel='stylesheet';style.href='codex-gallery.css';document.head.appendChild(style);
})();
