(()=>{
 const root='art/blood-debt/';
 const backgrounds={ceremony:'li-village-ceremony',disaster:'li-village-disaster',seal:'ancestral-seal',ruins:'ancestral-ruins',dawn:'ending-dawn'};
 const characterAssets={
  '李寒卓':{
   calm:{file:'characters/li-hanzhuo-calm.png',scale:'138%',top:'-14%'},
   angry:{file:'characters/li-hanzhuo-angry.png',scale:'138%',top:'-1.5%'},
   shocked:{file:'characters/li-hanzhuo-calm.png',scale:'138%',top:'-14%'},
   sad:{file:'characters/li-hanzhuo-calm.png',scale:'138%',top:'-14%'}
  },
  '吴家聪':{
   calm:{file:'wu-jiacong.png',scale:'136%',top:'-3%'},
   solemn:{file:'wu-jiacong.png',scale:'136%',top:'-3%'},
   wounded:{file:'wu-jiacong.png',scale:'136%',top:'-3%'}
  }
 };
 let presentationMode=uiStore.get('presentationMode','standard');if(!['off','standard','cinematic'].includes(presentationMode))presentationMode='standard';
 const presentationCues={
  'before-0':{1:{camera:true,effect:'shock'},7:{entrance:'soft'},11:{camera:true,effect:'anger',characterPush:true}},
  'before-4':{2:{camera:true,effect:'shock'}},
  'before-6':{0:{camera:true,effect:'anger',characterPush:true},1:{focusShift:true},4:{camera:true,effect:'awakening',backgroundFocus:true},6:{effect:'shock'},8:{camera:true,effect:'anger',characterPush:true},11:{backgroundFocus:true},12:{camera:true,effect:'anger',characterPush:true},13:{camera:true,backgroundFocus:true}},
  'after-6':{0:{camera:true,backgroundFocus:true},1:{camera:true,effect:'awakening',backgroundFocus:true},5:{effect:'awakening',backgroundFocus:true},6:{camera:true,effect:'awakening'},8:{camera:true,backgroundFocus:true},9:{camera:true,effect:'sad'},11:{camera:true,backgroundFocus:true}}
 };
 const propAssets={jade:['blood-jade.png','沾血玉佩'],sealed:['guixu-sealed.png','归墟神剑 · 封印'],awakened:['guixu-awakened.png','归墟神剑 · 觉醒'],bound:['guixu-bound.png','归墟神剑 · 认主']};
 const chapterIntroVisuals=[
  {scene:'ceremony',emotion:'angry'},
  {scene:'ceremony',emotion:'calm'},
  {scene:'seal',emotion:'calm'},
  {scene:'ceremony',emotion:'angry'},
  {scene:'seal',emotion:'calm'},
  {scene:'seal',emotion:'calm'},
  {scene:'ruins',emotion:'angry'}
 ];
 chapters.forEach((ch,i)=>{ch[0]=bloodDebtStory.titles[i];ch[1]=bloodDebtStory.summaries[i]});
 const objectives=['靠近拳王幻影按 J，一指击退 3 位挑战者。','按 K 闪现越过裂隙，收集 5 枚道印。','走入中央金色光圈，完成 3 次不灭试炼，查看井中记忆。','一指击退 5 个虚空投影。','腾空、闪现，收集 7 枚时空道印。','一指击退 7 个祖祠守护投影。'];
 objectives.forEach((text,i)=>chapters[i][2]=text);
 // Reuse the existing combat mechanic for the final boss, rather than the old food-collection finale.
 chapters[6][2]='击败吴家聪的最终投影。靠近后按 J 一指攻击。';chapters[6][3]=1;chapters[6][4]='fight';
 let dispose=()=>{},generation=0;
 function stop(){dispose();dispose=()=>{};generation++}
 const baseShow=show;show=function(content){stop();$('modal').classList.remove('blood-story-modal','chapter-intro-modal');baseShow(content)};
 const baseClose=close;close=function(){stop();$('modal').classList.remove('blood-story-modal','chapter-intro-modal');baseClose()};
 function showBlood(content,mode){
  stop();
  const modal=$('modal');
  modal.classList.remove('blood-story-modal','chapter-intro-modal');
  modal.classList.add(mode);
  baseShow(content);
 }
 $('modal').addEventListener('close',()=>{if(!$('modal').open)stop()});
 function play(lines,after,cueKey=''){
  showBlood(`<section class="blood-story is-booting"><div class="blood-scenes"><img class="blood-scene" alt="剧情场景"><img class="blood-scene" alt="剧情场景"></div><div class="blood-shade"></div><div class="blood-environment" aria-hidden="true">${'<i></i>'.repeat(7)}</div><div class="blood-fx" aria-hidden="true"></div><div class="blood-character" hidden><img class="character-layer" alt=""><img class="character-layer" alt=""></div><figure class="blood-prop" id="bloodProp" data-state="hidden" hidden><img alt=""></figure><div class="blood-caption">血债神兵 · <span id="bloodPosition"></span></div>
   <nav class="blood-controls" aria-label="剧情控制"><button id="bloodMore" class="blood-menu-trigger" aria-expanded="false" aria-controls="bloodMoreMenu" title="剧情菜单"><span aria-hidden="true">☰</span><em>菜单</em></button><div class="blood-more-menu" id="bloodMoreMenu" hidden><button id="bloodHistory">历史</button><button id="bloodAuto" aria-pressed="false">自动</button><button id="bloodSkip">跳过</button><button id="bloodSettings">设置</button><button id="bloodHideUI">隐藏 UI</button><button id="bloodExit">关闭剧情</button></div></nav>
   <aside class="blood-backlog" id="bloodBacklog" hidden><header><div><small>BACKLOG</small><h2>对话历史</h2></div><button id="bloodHistoryClose">返回剧情</button></header><div class="blood-backlog-list" id="bloodHistoryList"></div></aside>
   <aside class="blood-prefs" id="bloodPrefs" hidden><header><div><small>DISPLAY</small><h2>阅读设置</h2></div><button id="bloodPrefsClose">关闭</button></header><label>文字速度 <input id="bloodSpeed" type="range" min="20" max="100" value="${textSpeed}"></label><button id="bloodPresentation"></button><button id="bloodMotion">场景动效：${ambient?'开启':'关闭'}</button></aside>
   <article class="blood-box"><h3 id="bloodName"></h3><div class="blood-copy"><p id="bloodText" aria-live="polite"></p></div><footer><button id="bloodPrev" disabled>〈 上一句</button><button id="bloodNext">显示全文</button></footer><i class="blood-next-pulse" aria-hidden="true"></i></article></section>`,'blood-story-modal');
  const modal=$('modal'),section=modal.querySelector('.blood-story'),out=$('bloodText'),name=$('bloodName'),next=$('bloodNext'),prev=$('bloodPrev'),scenes=[...section.querySelectorAll('.blood-scene')],character=section.querySelector('.blood-character'),prop=$('bloodProp'),backlog=$('bloodBacklog'),prefs=$('bloodPrefs'),controls=section.querySelector('.blood-controls'),moreMenu=$('bloodMoreMenu'),moreButton=$('bloodMore');
  let index=0,furthest=0,n=0,glyphs=[],timer=null,textDelay=null,autoTimer=null,effectTimer=null,hideTimer=null,propTimer=null,toolbarTimer=null,autoPlaying=false,ended=false,activeScene=-1,activeCharacter=-1,lastScene='',lastCharacter='',lastSpeaker='',lastProp='',propState='hidden',renderVersion=0;const token=generation,preloaded=new Map();
  const systemReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionMode=()=>!ambient||systemReduced()?'off':presentationMode;
  const segment=text=>typeof Intl!=='undefined'&&Intl.Segmenter?[...new Intl.Segmenter('zh',{granularity:'grapheme'}).segment(text)].map(x=>x.segment):Array.from(text);
  const preload=src=>{if(!src||preloaded.has(src)||typeof Image==='undefined')return;const image=new Image;image.decoding='async';image.src=src;preloaded.set(src,image)};
  function preloadAll(){for(const entry of lines){preload(root+'backgrounds/standalone/'+backgrounds[entry.scene]+'.png');const info=characterAssets[entry.speaker]?.[entry.emotion||'calm'];if(info)preload(root+info.file);const p=propAssets[entry.prop];if(p)preload(root+p[0])}}
  function clearText(){clearInterval(timer);clearTimeout(textDelay);timer=textDelay=null}
  function clearAuto(){clearTimeout(autoTimer);autoTimer=null}
  function setMore(open){moreMenu.hidden=!open;moreButton.setAttribute?.('aria-expanded',String(open));controls.classList.toggle('menu-open',open);wakeToolbar(open)}
  function wakeToolbar(hold=false){clearTimeout(toolbarTimer);controls.classList.remove('is-idle');if(hold||!backlog.hidden||!prefs.hidden||section.classList.contains?.('ui-hidden'))return;toolbarTimer=setTimeout(()=>controls.classList.add('is-idle'),3000)}
  function clearEffects(){clearTimeout(effectTimer);clearTimeout(hideTimer);effectTimer=hideTimer=null;section.classList.remove('fx-anger','fx-shock','fx-sad','fx-awakening','camera-push','character-push','background-focus','focus-shift')}
  function applyMode(){const mode=motionMode();section.classList.toggle('motion-off',mode==='off');section.classList.toggle('motion-cinematic',mode==='cinematic');$('bloodPresentation').textContent='动态演出：'+({off:'关闭',standard:'标准',cinematic:'电影'}[presentationMode])}
  function scheduleAuto(){clearAuto();if(autoPlaying&&backlog.hidden&&prefs.hidden)autoTimer=setTimeout(()=>advance('auto'),Math.max(1100,2600-textSpeed*12))}
  function full(){clearText();glyphs=segment(lines[index].text);n=glyphs.length;name.textContent=lines[index].speaker;out.textContent=lines[index].text;out.classList.add('is-visible');name.classList.add('is-visible');next.textContent=index===lines.length-1?'继续 →':'下一句 →';section.classList.add('line-complete');scheduleAuto()}
  function refreshHistory(){const list=$('bloodHistoryList');list.innerHTML=lines.slice(0,furthest+1).map((entry,i)=>`<article class="${i===index?'current':''}"><b>${entry.speaker}</b><p>${entry.text}</p></article>`).join('');requestAnimationFrame(()=>{list.scrollTop=list.scrollHeight})}
  function setAuto(value){autoPlaying=value;$('bloodAuto').classList.toggle('active',value);$('bloodAuto').setAttribute?.('aria-pressed',String(value));$('bloodAuto').textContent=value?'自动中':'自动';if(value&&n>=glyphs.length)scheduleAuto();else if(!value)clearAuto()}
  function setScene(entry,version){const src=root+'backgrounds/standalone/'+backgrounds[entry.scene]+'.png';preload(src);if(src===lastScene)return;const nextLayer=(activeScene+1)%scenes.length,old=activeScene>=0?scenes[activeScene]:null,image=scenes[nextLayer];image.classList.remove('is-active');image.src=src;const reveal=()=>requestAnimationFrame(()=>{if(version!==renderVersion||token!==generation)return;old?.classList.remove('is-active');image.classList.add('is-active');section.classList.remove('is-booting');activeScene=nextLayer;lastScene=src});image.complete?reveal():image.onload=reveal}
  function setCharacter(entry,version){const info=characterAssets[entry.speaker]?.[entry.emotion||'calm'],key=info?entry.speaker+':'+(entry.emotion||'calm'):'';if(!info){character.querySelectorAll('.character-layer').forEach(image=>image.classList.remove('is-active'));lastCharacter=lastSpeaker='';hideTimer=setTimeout(()=>{if(version===renderVersion)character.hidden=true},motionMode()==='off'?0:260);return}if(key===lastCharacter)return;const layers=[...character.querySelectorAll('.character-layer')],nextLayer=(activeCharacter+1)%layers.length,old=activeCharacter>=0?layers[activeCharacter]:null,image=layers[nextLayer],sameSpeaker=lastSpeaker===entry.speaker;preload(root+info.file);character.hidden=false;character.classList.toggle('is-intense',entry.emotion==='angry'||entry.emotion==='shocked'||entry.emotion==='wounded');character.style.setProperty('--character-height',info.scale);character.style.setProperty('--character-top',info.top);image.classList.remove('is-active','is-entering','is-expression');image.src=root+info.file;image.alt=entry.speaker+(entry.emotion?' · '+entry.emotion:'');const reveal=()=>requestAnimationFrame(()=>{if(version!==renderVersion||token!==generation)return;old?.classList.remove('is-active','is-entering','is-expression');image.classList.add('is-active',sameSpeaker?'is-expression':'is-entering');activeCharacter=nextLayer;lastCharacter=key;lastSpeaker=entry.speaker});image.complete?reveal():image.onload=reveal}
  function setProp(entry,version){clearTimeout(propTimer);propTimer=null;const info=propAssets[entry.prop],image=prop.querySelector('img'),hasCharacter=!!characterAssets[entry.speaker]?.[entry.emotion||'calm'];section.classList.toggle('prop-with-character',!!info&&hasCharacter);section.classList.toggle('prop-solo',!!info&&!hasCharacter);if(!info){lastProp='';if(prop.hidden){propState='hidden';prop.dataset.state='hidden';return}propState='exiting';prop.dataset.state='exiting';prop.classList.remove('is-entering','is-active');prop.classList.add('is-exiting');propTimer=setTimeout(()=>{if(version!==renderVersion||token!==generation)return;prop.hidden=true;prop.classList.remove('is-exiting');propState='hidden';prop.dataset.state='hidden'},motionMode()==='off'?0:240);return}const key=entry.prop,src=root+info[0];if(key===lastProp&&!prop.hidden){propState='visible';prop.dataset.state='visible';return}preload(src);lastProp=key;propState='entering';prop.dataset.state='entering';prop.hidden=false;prop.classList.remove('is-active','is-exiting');prop.classList.add('is-entering');image.src=src;image.alt=info[1];const reveal=()=>requestAnimationFrame(()=>{if(version!==renderVersion||token!==generation)return;prop.classList.remove('is-entering');prop.classList.add('is-active');propState='visible';prop.dataset.state='visible'});image.complete?reveal():image.onload=reveal}
  function applyPresentation(entry,lineIndex){clearEffects();const mode=motionMode();section.classList.remove('env-leaves','env-ashes','env-wisps','env-motes');if(mode==='cinematic'){section.classList.add({ceremony:'env-leaves',disaster:'env-ashes',seal:'env-wisps',ruins:'env-ashes',dawn:'env-motes'}[entry.scene]||'');const cue=presentationCues[cueKey]?.[lineIndex];if(cue?.camera)section.classList.add('camera-push');if(cue?.characterPush)section.classList.add('character-push');if(cue?.backgroundFocus)section.classList.add('background-focus');if(cue?.focusShift)section.classList.add('focus-shift');if(cue?.effect)section.classList.add('fx-'+cue.effect);if(cue)effectTimer=setTimeout(()=>section.classList.remove('fx-anger','fx-shock','fx-sad','fx-awakening','character-push','focus-shift'),720)}}
  function startText(entry,version){clearText();glyphs=segment(entry.text);n=0;out.classList.remove('is-visible');name.classList.remove('is-visible');const begin=()=>{if(version!==renderVersion||token!==generation)return;name.textContent=entry.speaker;out.textContent='';out.classList.add('is-visible');name.classList.add('is-visible');if(motionMode()==='off'){full();return}timer=setInterval(()=>{if(version!==renderVersion||token!==generation)return;out.textContent=glyphs.slice(0,++n).join('');if(n>=glyphs.length)full()},Math.max(22,Math.min(34,110-textSpeed)))};textDelay=setTimeout(begin,motionMode()==='off'?0:90)}
  function render(){const version=++renderVersion,entry=lines[index];clearText();clearAuto();setScene(entry,version);setCharacter(entry,version);setProp(entry,version);applyPresentation(entry,index);$('bloodPosition').textContent=`第 ${level+1} 章 · ${index+1} / ${lines.length}`;furthest=Math.max(furthest,index);prev.disabled=index===0;next.textContent='显示全文';section.classList.remove('line-complete');startText(entry,version);if(lines[index+1]){const nextEntry=lines[index+1];preload(root+'backgrounds/standalone/'+backgrounds[nextEntry.scene]+'.png');const nextInfo=characterAssets[nextEntry.speaker]?.[nextEntry.emotion||'calm'];if(nextInfo)preload(root+nextInfo.file);const nextProp=propAssets[nextEntry.prop];if(nextProp)preload(root+nextProp[0])}}
  function end(){if(ended||token!==generation)return;ended=true;close();after()}
  function advance(source='manual'){if(ended||token!==generation)return;if(source==='manual')clearAuto();if(n<glyphs.length){full();return}if(++index>=lines.length){index=lines.length-1;end()}else render()}
  function previous(){if(ended||index<=0)return;clearAuto();index--;render()}
  function openBacklog(){setMore(false);setAuto(false);refreshHistory();backlog.hidden=false;prefs.hidden=true;wakeToolbar(true);$('bloodHistoryClose').focus()}
  function closeOverlays(){backlog.hidden=true;prefs.hidden=true;setMore(false);wakeToolbar();next.focus()}
  next.onclick=()=>advance('manual');prev.onclick=previous;$('bloodSkip').onclick=()=>{setMore(false);end()};$('bloodExit').onclick=()=>{setMore(false);close()};$('bloodHideUI').onclick=e=>{e.stopPropagation();setMore(false);setAuto(false);closeOverlays();section.classList.add('ui-hidden')};$('bloodHistory').onclick=openBacklog;$('bloodHistoryClose').onclick=closeOverlays;$('bloodAuto').onclick=()=>{setAuto(!autoPlaying);setMore(false);wakeToolbar()};moreButton.onclick=e=>{e.stopPropagation();setMore(moreMenu.hidden)};$('bloodSettings').onclick=()=>{setMore(false);setAuto(false);prefs.hidden=false;backlog.hidden=true;wakeToolbar(true);$('bloodPrefsClose').focus()};$('bloodPrefsClose').onclick=closeOverlays;
  $('bloodSpeed').oninput=e=>{textSpeed=+e.target.value;try{uiStore.set('textSpeed',textSpeed)}catch{}};$('bloodMotion').onclick=()=>{ambient=!ambient;$('bloodMotion').textContent='场景动效：'+(ambient?'开启':'关闭');try{uiStore.set('motion',ambient);applyPrefs()}catch{}applyMode()};$('bloodPresentation').onclick=()=>{const modes=['off','standard','cinematic'];presentationMode=modes[(modes.indexOf(presentationMode)+1)%modes.length];uiStore.set('presentationMode',presentationMode);applyMode();applyPresentation(lines[index],index)};
  section.querySelector('.blood-box').onclick=e=>{if(!e.target.closest('button'))advance('manual')};
  const key=e=>{wakeToolbar();if(e.key==='Escape'&&!moreMenu.hidden){e.preventDefault();setMore(false);return}if(e.key==='Escape'&&(!backlog.hidden||!prefs.hidden)){e.preventDefault();e.stopImmediatePropagation();closeOverlays();return}if((e.key==='Enter'||e.key===' ')&&!e.repeat&&backlog.hidden&&prefs.hidden&&!section.classList.contains('ui-hidden')){e.preventDefault();e.stopImmediatePropagation();advance('manual')}};
  const wheel=e=>{wakeToolbar();if(e.deltaY<0&&backlog.hidden&&prefs.hidden&&!section.classList.contains('ui-hidden')){e.preventDefault();previous()}};const revealUI=e=>{if(!section.classList.contains('ui-hidden')){wakeToolbar();if(!e.target.closest('.blood-controls')&&!moreMenu.hidden)setMore(false);return}e.preventDefault();e.stopPropagation();section.classList.remove('ui-hidden');wakeToolbar();next.focus()};const wake=e=>{if(e.type==='focusin'||e.target.closest('.blood-controls'))wakeToolbar(!moreMenu.hidden)},leave=()=>wakeToolbar();modal.addEventListener('keydown',key,true);section.addEventListener('wheel',wheel,{passive:false});section.addEventListener('click',revealUI);controls.addEventListener('pointerdown',wake);controls.addEventListener('pointerenter',wake);controls.addEventListener('focusin',wake);controls.addEventListener('pointerleave',leave);
  dispose=()=>{renderVersion++;clearText();clearAuto();clearEffects();clearTimeout(propTimer);clearTimeout(toolbarTimer);prop.querySelector('img').onload=null;prop.hidden=true;propState='hidden';modal.removeEventListener('keydown',key,true);section.removeEventListener('wheel',wheel);section.removeEventListener('click',revealUI);controls.removeEventListener('pointerdown',wake);controls.removeEventListener('pointerenter',wake);controls.removeEventListener('focusin',wake);controls.removeEventListener('pointerleave',leave);scenes.forEach(image=>image.onload=null);character.querySelectorAll('.character-layer').forEach(image=>image.onload=null);preloaded.clear()};preloadAll();applyMode();render();wakeToolbar();next.focus();
 }
 dialogue=function(i,after){play(bloodDebtStory.before[i],after,`before-${i}`)};
 intro=function(i){
  if(!Number.isInteger(i)||i<0||i>=chapters.length||i>progress)return;
  level=i;const visual=chapterIntroVisuals[i]||{};const characterInfo=characterAssets['李寒卓']?.[visual.emotion];
  const background=visual.scene&&backgrounds[visual.scene]?`${root}backgrounds/standalone/${backgrounds[visual.scene]}.png`:'';
  const character=characterInfo?`<img class="chapter-poster-character" src="${root+characterInfo.file}" alt="李寒卓 · ${visual.emotion==='angry'?'愤怒':'冷静'}" style="--intro-character-top:${characterInfo.top};">`:'';
  showBlood(`<section class="chapter-poster" style="--chapter-background:url('${background}')">
   <div class="chapter-poster-scene" aria-hidden="true"></div><div class="chapter-poster-atmosphere" aria-hidden="true"></div>${character}
   <div class="chapter-poster-shade" aria-hidden="true"></div>
   <article class="chapter-poster-copy" style="width:100%;max-width:680px;min-width:0;overflow:hidden">
    <p class="chapter-kicker">血债神兵 <span>/ CHAPTER ${String(i+1).padStart(2,'0')}</span></p>
    <h2 style="display:block;width:100%;min-width:0;white-space:normal;word-break:keep-all;overflow-wrap:normal">${chapters[i][0]}</h2><i class="chapter-title-rule" aria-hidden="true"></i>
    <p class="chapter-summary" style="width:100%;flex:0 0 auto">${chapters[i][1]}</p>
    <div class="chapter-objective"><span>本章目标</span><p>${chapters[i][2]}</p></div>
    <div class="chapter-intro-actions" style="width:100%;flex:0 0 auto"><button class="chapter-back" id="chapterIntroBack">返回</button><button class="chapter-enter" id="chapterIntroEnter">${i===0?'踏入吴家村':'进入本章'} <b>→</b></button></div>
   </article>
  </section>`,'chapter-intro-modal');
  const modal=$('modal'),poster=modal.querySelector('.chapter-poster'),enter=$('chapterIntroEnter');enter.disabled=false;
  $('chapterIntroBack').onclick=()=>choose();let pending=null;
  enter.onclick=()=>{if(pending||enter.disabled)return;enter.disabled=true;poster.classList.add('is-leaving');pending=setTimeout(()=>{pending=null;dialogue(i,begin)},matchMedia('(prefers-reduced-motion: reduce)').matches?0:170)};
  dispose=()=>{if(pending)clearTimeout(pending)};
 };
 const baseBegin=begin;begin=function(){close();baseBegin();toast('李寒卓：我要亲自查清真相。')};
 finish=function(){if(paused)return;const completedLevel=level;play(bloodDebtStory.after[level],()=>{progress=Math.max(progress,completedLevel+1);try{localStorage.wujia=progress}catch{}show(`<div class="eyebrow">血债神兵 · ${completedLevel===6?'全剧终':'本章完成'}</div><h2>${completedLevel===6?'复仇之后':'线索已记录'}</h2><p>${completedLevel===6?'李寒卓获得归墟神剑，独自踏上归途。':'章节通关进度已保存。继续追查十年前的真相。'}</p><button class="primary" id="bloodContinue">${completedLevel===6?'返回主菜单':'继续下一章'} →</button><button class="textbtn" id="bloodChapters">章节选择</button>`);$('bloodContinue').onclick=()=>completedLevel===6?home():intro(completedLevel+1);$('bloodChapters').onclick=()=>choose()},`after-${completedLevel}`)};
 // Keep the original numeric save and all unlocked/replay rules.
 $('start').onclick=()=>intro(Math.min(progress,6));
 people.splice(0,people.length,['李寒卓','李家村幸存者','带着沾血玉佩来到吴家村，追查十年前的惨案。',0],['守门员','村口防线','听见李寒卓的名字后，召唤拳王幻影阻拦。',1],['空间守护者','裂隙证人','他的证言指向十年前被封闭的空间裂隙。',2],['不灭守井人','记忆守护者','守护着古井中残缺的记忆。',3],['虚空掌控者','借刀之谜','他称李寒卓是被人送进村庄的一把刀。',4],['时空守护者','玉佩共鸣','揭示了玉佩与空间封印之间的联系。',5],['吴家聪','吴家村老祖','守护神兵封印，也背负着十年前的抉择。',6]);
 document.title='吴家村传说 · 血债神兵';
 document.querySelector('.edition').textContent='血债神兵 · 七章剧情';
 document.querySelectorAll('.sub,.intro,.vertical').forEach(el=>el.hidden=true);
 $('notice').onclick=()=>show('<h2>血债神兵</h2><p>李寒卓追索十年前的血债。七章包含开场与通关剧情，点击对话先显示全文，再继续；可跳过本段。</p><p>沿用本机七章通关存档，已解锁章节可重游查看新版剧情。人物素材为现有候选稿。</p>');
})();
if(document.head){const codexScript=document.createElement('script');codexScript.src='codex-gallery.js';document.head.appendChild(codexScript)}
