// Visual enhancements reuse existing handlers and the real chapter-save counter.
(()=>{
 const homeEl=document.getElementById('home');
 const mist=document.createElement('div');mist.className='home-mist';mist.setAttribute('aria-hidden','true');homeEl.appendChild(mist);
 const leaves=document.createElement('div');leaves.className='home-leaves';leaves.setAttribute('aria-hidden','true');
 for(let i=0;i<8;i++){const leaf=document.createElement('i');leaf.textContent='❧';leaf.style.cssText=`--x:${12+i*12}%;--duration:${16+i*2}s;--delay:-${i*4}s`;leaves.appendChild(leaf)}homeEl.appendChild(leaves);
 const save=document.createElement('button');save.className='save-panel';homeEl.appendChild(save);
 function refresh(){const valid=Number.isInteger(progress)&&progress>0&&progress<=7;const current=valid?Math.min(progress,6):0;save.replaceChildren();const title=document.createElement('span');title.textContent=valid?`第 ${current+1} 章 · ${chapters[current][0].split(' · ')[0]}`:'初入吴家村';const detail=document.createElement('small');detail.textContent=valid?(progress===7?'七章已完成 · 重游归途':'本机章节存档 · 继续游戏'):'暂无章节通关存档 · 开始游戏';save.append(title,detail);save.setAttribute('aria-label',valid?'继续游戏：'+title.textContent:'开始新游戏')}
 save.onclick=()=>document.getElementById('start').click();refresh();
 new MutationObserver(refresh).observe(homeEl,{attributes:true,attributeFilter:['hidden']});
 const prefs=applyPrefs;applyPrefs=function(){prefs();uiStore.set('motion',ambient);uiStore.set('alpha',uiAlpha)};
 const menu=[...document.querySelectorAll('.home-nav button')];homeEl.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp'].includes(e.key)||document.getElementById('modal').open)return;e.preventDefault();const index=menu.indexOf(document.activeElement);menu[(index+(e.key==='ArrowDown'?1:-1)+menu.length)%menu.length].focus()});
})();
