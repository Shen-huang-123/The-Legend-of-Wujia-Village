(()=>{
 const root=document.getElementById('home'),cfg=window.WUJIA_ART;
 root.classList.add('art-menu');
 const background=document.createElement('div');background.className='art-background';
 const character=document.createElement('div');character.className='art-character';character.setAttribute('aria-hidden','true');
 const missing=document.createElement('small');missing.className='art-status';missing.textContent='美术占位 · 等待场景背景与背影立绘';
 root.prepend(background,character);root.append(missing);
 if(cfg.characterInBackground){character.hidden=true;character.style.setProperty('display','none','important')}
 if(cfg.background)missing.hidden=true;
 function picture(path,el,variable){if(!path)return;const img=new Image();img.onload=()=>{el.style.setProperty(variable,`url("${path}")`);el.classList.add('art-loaded')};img.onerror=()=>{console.warn('美术素材未找到：'+path)};img.src=path}
 picture(cfg.background,background,'--art-image');picture(cfg.character,character,'--art-image');
 for(const [key,value] of Object.entries(cfg.layout))root.style.setProperty('--'+key,value);
 for(const [state,path] of Object.entries(cfg.buttons))picture(path,root,'--button-'+state);
 picture(cfg.panels.save,root,'--save-image');
 for(const [id,path] of Object.entries(cfg.icons)){const button=document.getElementById(id);if(!button)continue;const icon=button.querySelector('b');if(icon)picture(path,icon,'--icon-image')}
 picture(cfg.effects.mist,root,'--mist-image');picture(cfg.effects.leaf,root,'--leaf-image');
 const buttons=[...root.querySelectorAll('.home-nav button')];
 function select(button){buttons.forEach(b=>{b.classList.toggle('is-selected',b===button)})}
 buttons.forEach(button=>{button.addEventListener('focus',()=>select(button));button.addEventListener('pointerenter',()=>select(button))});select(buttons[0]);
})();
