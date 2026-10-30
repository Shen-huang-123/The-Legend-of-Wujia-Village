import fs from 'node:fs';
let [endpoint,output,width='1600',height='900',pageUrl,openExpression="codex('人物',0)"]=process.argv.slice(2);
if(openExpression==='viewer')openExpression="codex('人物',0);setTimeout(()=>document.querySelector('#codexAppreciate').click(),120);setTimeout(()=>{document.querySelector('[data-art-expression=\"1\"]').click();document.querySelector('[data-art-bg=\"scene\"]').click()},380)";
if(!endpoint||!output)throw new Error('Usage: node capture-codex.mjs <ws-url> <output> [width] [height]');
const ws=new WebSocket(endpoint);let sequence=0;const pending=new Map();
ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){const {resolve,reject}=pending.get(msg.id);pending.delete(msg.id);msg.error?reject(new Error(msg.error.message)):resolve(msg.result)}};
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:+width,height:+height,deviceScaleFactor:1,mobile:false});
if(pageUrl){await send('Page.navigate',{url:pageUrl});await new Promise(resolve=>setTimeout(resolve,1200))}
await send('Runtime.evaluate',{expression:"localStorage.wujia='7'; location.reload()"});
await new Promise(resolve=>setTimeout(resolve,1800));
await send('Runtime.evaluate',{expression:openExpression});
await new Promise(resolve=>setTimeout(resolve,700));
const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
fs.writeFileSync(output,Buffer.from(shot.data,'base64'));
ws.close();
