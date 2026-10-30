const endpoint=process.argv[2];
if(!endpoint)throw new Error('Missing DevTools websocket endpoint');
const ws=new WebSocket(endpoint);let sequence=0;const pending=new Map();
ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);msg.error?reject(new Error(msg.error.message)):resolve(msg.result)}};
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>JSON.parse((await send('Runtime.evaluate',{expression:`JSON.stringify(${expression})`,returnByValue:true})).result.value);
await send('Page.navigate',{url:'http://127.0.0.1:4174/'});await new Promise(resolve=>setTimeout(resolve,1300));
await send('Runtime.evaluate',{expression:"localStorage.wujia='0';location.reload()"});await new Promise(resolve=>setTimeout(resolve,1300));
await send('Runtime.evaluate',{expression:"codex('人物',0)"});await new Promise(resolve=>setTimeout(resolve,250));
const locked=await evaluate("({cards:document.querySelectorAll('.codex-card').length,locked:document.querySelectorAll('.codex-card.is-locked').length,leaks:[...document.querySelectorAll('.codex-card.is-locked')].some(node=>/吴家聪|守门员|守护者/.test(node.textContent)),scroll:getComputedStyle(document.querySelector('.codex-list')).overflowY})");
if(locked.cards!==7||locked.locked!==6||locked.leaks||locked.scroll!=='auto')throw new Error(`Locked-state check failed: ${JSON.stringify(locked)}`);
for(const category of ['物品','场景','事件']){
 await send('Runtime.evaluate',{expression:`codex('${category}',0)`});await new Promise(resolve=>setTimeout(resolve,120));
 const result=await evaluate(`({category:document.querySelector('.codex-gallery').dataset.category,cards:document.querySelectorAll('.codex-card').length,detail:!!document.querySelector('.codex-showcase')})`);
 if(result.category!==category||!result.cards||!result.detail)throw new Error(`Category check failed: ${JSON.stringify(result)}`);
}
await send('Runtime.evaluate',{expression:"localStorage.wujia='7';location.reload()"});
console.log('PASS: live browser locked-state masking, independent scrolling, and all four collection categories.');
ws.close();
