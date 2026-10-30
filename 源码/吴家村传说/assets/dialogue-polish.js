(()=>{
 const base=dialogue,modal=$('modal');let dispose=()=>{};
 dialogue=function(i,after){dispose();base(i,after);modal.classList.add('story-modal');const screen=modal.querySelector('.dialogue-screen'),text=$('storyText'),button=$('continueStory'),box=modal.querySelector('.storybox');const original=button.onclick;let ended=false;
 button.setAttribute('aria-label','显示全文或继续对话');button.textContent='全文';
 // Read the original typewriter's output; do not duplicate its timer or dialogue data.
 let readyTimer;const mark=()=>{clearTimeout(readyTimer);readyTimer=setTimeout(()=>button.classList.add('is-ready'),Math.max(140,130-textSpeed))};const observer=new MutationObserver(mark);observer.observe(text,{childList:true,characterData:true,subtree:true});mark();
 button.onclick=e=>{if(ended||!screen.isConnected)return;const wasReady=button.classList.contains('is-ready');original.call(button,e);if(!modal.open||!screen.isConnected)ended=true;else if(!wasReady){button.classList.add('is-ready')}};
 box.addEventListener('click',e=>{if(!e.target.closest('button'))button.click()});
 const key=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();button.click()}};screen.addEventListener('keydown',key);
 dispose=()=>{clearTimeout(readyTimer);observer.disconnect();screen.removeEventListener('keydown',key);modal.classList.remove('story-modal');dispose=()=>{}};
 };modal.addEventListener('close',()=>dispose());new MutationObserver(()=>{if(modal.classList.contains('story-modal')&&!modal.querySelector('.dialogue-screen'))dispose()}).observe($('modalContent'),{childList:true});
})();
