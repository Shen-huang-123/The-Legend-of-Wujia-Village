const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..','assets');
const js=fs.readFileSync(path.join(root,'codex-gallery.js'),'utf8');
const css=fs.readFileSync(path.join(root,'codex-gallery.css'),'utf8');
const required=[
 'art/blood-debt/characters/li-hanzhuo-calm.png',
 'art/blood-debt/wu-jiacong.png',
 'art/blood-debt/blood-jade.png',
 'art/blood-debt/guixu-bound.png',
 'art/blood-debt/backgrounds/standalone/ancestral-seal.png'
];
for(const file of required){
 if(!fs.existsSync(path.join(root,...file.split('/'))))throw new Error(`Missing gallery asset: ${file}`);
 const suffix=file.replace('art/blood-debt/','');
 if(!js.includes(file) && !js.includes(suffix) && !css.includes(file))throw new Error(`Unmapped gallery asset: ${file}`);
}
for(const category of ['人物','物品','场景','事件'])if(!js.includes(category))throw new Error(`Missing category: ${category}`);
for(const rule of ['overflow-y:auto','grid-template-columns:minmax(310px,45%)','height:100dvh','prefers-reduced-motion'])if(!css.includes(rule))throw new Error(`Missing responsive rule: ${rule}`);
if(!js.includes("open?item.name:'未知档案'")||!js.includes("open?item.role:'尚未解锁'"))throw new Error('Locked entries reveal protected metadata');
console.log('PASS: collection gallery assets, categories, locked-state masking, scrolling and responsive styles.');
