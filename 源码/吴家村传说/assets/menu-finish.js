(()=>{
 const root=document.getElementById('home'),modal=document.getElementById('modal');let timer=null,locked=false;
 const buttons=[...root.querySelectorAll('.home-nav button')];buttons.forEach((b,i)=>b.style.setProperty('--entry-index',i));
 for(let i=0;i<3;i++){const dot=document.createElement('i');dot.className='menu-ember';dot.style.cssText=`--ember-x:${48+i*18}%;--ember-delay:-${i*4}s`;dot.setAttribute('aria-hidden','true');root.append(dot)}
 function reset(){clearTimeout(timer);timer=null;locked=false;root.querySelectorAll('.confirming').forEach(b=>b.classList.remove('confirming'))}
 function enter(){reset();root.classList.remove('menu-enter');requestAnimationFrame(()=>{if(!root.hidden)root.classList.add('menu-enter')})}enter();
 new MutationObserver(()=>{if(root.hidden)reset();else enter()}).observe(root,{attributes:true,attributeFilter:['hidden']});
 // Preserve each existing handler; delay only the visual confirmation, never game actions.
 root.querySelectorAll('button').forEach(button=>{const original=button.onclick;if(typeof original!=='function')return;button.onclick=function(event){if(locked)return;locked=true;button.classList.add('confirming');const reduced=document.body.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;timer=setTimeout(()=>{reset();original.call(button,event)},reduced?0:120)}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
 modal.addEventListener('close',reset);
})();
