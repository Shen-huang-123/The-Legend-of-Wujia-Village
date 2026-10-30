const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const elements=new Map();
function el(){return {hidden:false,textContent:'',src:'',innerHTML:'',open:true,complete:false,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},addEventListener(){},removeEventListener(){},focus(){},querySelector(s){return this.children[s]??=el()},querySelectorAll(s){return this.all[s]??=[el(),el()]},children:{},all:{}}}
function $(id){if(!elements.has(id))elements.set(id,el());return elements.get(id)}
let save={},begins=0,intervals=new Map(),tid=0;
const ctx=vm.createContext({console,$,chapters:Array.from({length:7},()=>['old','old','old',3,'fight']),people:[],progress:0,level:0,paused:false,ambient:true,textSpeed:60,matchMedia:()=>({matches:false}),localStorage:save,uiStore:{get(k,d){return d},set(){}},applyPrefs(){},document:{title:'',querySelector:()=>el(),querySelectorAll:()=>[]},requestAnimationFrame(fn){fn()},show(){ctx.paused=true},close(){ctx.paused=false},begin(){begins++},finish(){},home(){},choose(){},intro(){},dialogue(){},toast(){},setTimeout(fn){fn();return ++tid},clearTimeout(){},setInterval(fn){intervals.set(++tid,fn);return tid},clearInterval(id){intervals.delete(id)}});
const assets=path.join(__dirname,'assets');
vm.runInContext(fs.readFileSync(path.join(assets,'blood-debt-data.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(assets,'blood-debt.js'),'utf8'),ctx);
const story=vm.runInContext('bloodDebtStory',ctx);
assert.equal(story.before.length,7);assert.equal(story.after.length,7);
assert(story.after[6].some(x=>x.prop==='bound'));
assert(story.before[0].some(x=>x.speaker==='李寒卓'&&x.emotion==='angry'));
assert(story.after[6].some(x=>x.text.includes('仇恨可以')));
const source=fs.readFileSync(path.join(assets,'blood-debt.js'),'utf8');
for(const match of source.matchAll(/['"]([\w/-]+\.png)['"]/g))assert(fs.existsSync(path.join(assets,'art/blood-debt',match[1])),match[1]);
const css=fs.readFileSync(path.join(assets,'blood-debt.css'),'utf8');
assert(css.includes('.blood-character'));assert(css.includes('height:25%'));assert(css.includes('max-height:27%'));assert(css.includes('height:var(--character-height)'));assert(css.includes("left:72%"));assert(!css.includes('.blood-visual'));
assert(css.includes('.chapter-poster'));assert(css.includes('.chapter-intro-modal'));assert(css.includes('grid-template-columns:minmax(0,45%) minmax(0,55%)'));
assert(css.includes('.blood-story-modal[open]'));assert(css.includes('height:100dvh'));assert(css.includes('.blood-backlog'));assert(css.includes('.blood-controls'));
assert(css.includes('.blood-story.ui-hidden'));assert(source.includes('bloodHideUI'));assert(source.includes("section.classList.add('ui-hidden')"));
assert(css.includes('.blood-scenes'));assert(css.includes('.blood-environment'));assert(css.includes('.motion-cinematic'));assert(source.includes('Intl.Segmenter'));assert(source.includes('renderVersion'));assert(source.includes('presentationMode'));assert(source.includes('characterPush:true'));assert(source.includes('backgroundFocus:true'));assert(css.includes('.blood-story.character-push'));assert(css.includes('.blood-story.background-focus'));
assert(source.includes('max-width:680px;min-width:0;overflow:hidden'),'chapter intro WebView width guard missing');
assert(source.includes("setTimeout(()=>controls.classList.add('is-idle'),3000)"),'toolbar idle fade timer missing');assert(css.includes('.blood-controls.is-idle'));assert(css.includes('.blood-more-menu'));assert(source.includes('class="blood-menu-trigger"'),'toolbar must default to a single collapsed trigger');assert(css.includes('right:max(32vw'),'expanded menu must open into the character-safe area');
assert(source.includes('function setProp(entry,version)'));assert(source.includes("data-state=\"hidden\""));assert(!source.includes('<figcaption>'));assert(css.includes('.blood-story.prop-with-character .blood-character'));
assert(source.includes('function showBlood(content,mode)'),'specialized modal class must be applied before opening');assert(source.includes("showBlood(`<section class=\"blood-story is-booting\""),'story must stay hidden until its first background is ready');assert(css.includes('.blood-story.is-booting{opacity:0!important'),'first-frame flash guard missing');
for(const name of ['li-village-ceremony','li-village-disaster','ancestral-seal','ancestral-ruins','ending-dawn'])assert(fs.existsSync(path.join(assets,'art/blood-debt/backgrounds/standalone',name+'.png')));
ctx.intro(1);assert.equal(ctx.level,0,'locked chapter blocked');
ctx.intro(0);$('chapterIntroEnter').onclick();assert.equal($('bloodName').textContent,'旁白');
$('bloodMoreMenu').hidden=true;$('bloodMore').onclick({stopPropagation(){}});assert.equal($('bloodMoreMenu').hidden,false,'more menu opens');$('bloodSettings').onclick();assert.equal($('bloodPrefs').hidden,false,'settings opens from more menu');$('bloodPrefsClose').onclick();assert.equal($('bloodPrefs').hidden,true);
$('bloodNext').onclick();assert($('bloodText').textContent.includes('十年前'));assert.equal($('bloodName').textContent,'旁白');
$('bloodNext').onclick();assert($('bloodPosition').textContent.includes('2 /'));
$('bloodPrev').onclick();assert($('bloodPosition').textContent.includes('1 /'),'previous line is read-only navigation');
$('bloodHistory').onclick();assert.equal($('bloodBacklog').hidden,false);assert($('bloodHistoryList').innerHTML.includes('旁白'));
$('bloodHistoryClose').onclick();assert.equal($('bloodBacklog').hidden,true);
ctx.close();assert.equal(intervals.size,0,'closing cleans typing timer');assert.equal(begins,0);
ctx.progress=7;ctx.intro(6);$('chapterIntroEnter').onclick();for(let i=0;i<3;i++){$('bloodNext').onclick();$('bloodNext').onclick()}const propEl=$('bloodProp'),propImage=propEl.querySelector('img');assert.equal(propEl.hidden,false,'chapter 7 line 4 shows jade');assert(propImage.src.endsWith('blood-jade.png'));$('bloodNext').onclick();$('bloodNext').onclick();assert(propImage.src.endsWith('guixu-awakened.png'),'next explicit prop replaces jade');$('bloodNext').onclick();$('bloodNext').onclick();assert.equal(propEl.hidden,true,'prop clears on the next line without a prop');ctx.close();ctx.progress=0;
ctx.intro(0);$('chapterIntroEnter').onclick();for(let i=0;i<10;i++)$('bloodNext').onclick();assert($('bloodPosition').textContent.includes('/ 13'),'rapid input stays in the current sequence');ctx.close();assert.equal(intervals.size,0,'rapid input cleanup');
for(let i=0;i<7;i++){
 ctx.level=i;ctx.intro(i);$('chapterIntroEnter').onclick();$('bloodSkip').onclick();assert.equal(begins,i+1);
 ctx.paused=false;ctx.finish();assert.equal(ctx.progress,i,'no early completion save');
 const skip=$('bloodSkip').onclick;skip();skip();assert.equal(ctx.progress,i+1);assert.equal(save.wujia,i+1);assert.equal(intervals.size,0);
}
assert.equal(ctx.chapters[6][4],'fight');
// Finish all final dialogue lines using the actual full-text / advance handler.
ctx.level=6;ctx.paused=false;ctx.finish();
for(let i=0;i<story.after[6].length;i++){$('bloodNext').onclick();$('bloodNext').onclick()}
assert.equal(ctx.progress,7);assert.equal(intervals.size,0);
console.log('PASS: 7 chapter pre/post sequences, assets, typewriter, previous/backlog read-only navigation, cleanup, skip guard, save/replay and ending.');
