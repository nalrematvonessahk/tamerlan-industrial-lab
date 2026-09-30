import {createEngine} from './engine.js';
import {createPlant} from './plant.js';

let engine;try{engine=createEngine(document.querySelector('#viewport'));}catch(error){document.querySelector('#loading').hidden=true;document.querySelector('#error').hidden=false;throw error;}let current=null,routeToken=0;
async function route(){const token=++routeToken;const isPump=location.hash.startsWith('#pump');engine.clear();document.body.classList.toggle('pump',isPump);document.querySelectorAll('[data-route]').forEach(a=>{const active=a.dataset.route===(isPump?'pump':'plant');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.querySelector('#scene-description').textContent=isPump?'Каждая деталь на своём месте.':'От общего плана — к каждому узлу.';document.querySelector('#scene-eyebrow').textContent=isPump?'CASE STUDY 02 / PRODUCT EXPLORER':'CASE STUDY 01 / DIGITAL TWIN';document.querySelector('#scene-title').innerHTML=isPump?'Устройство<br>в деталях.':'Промышленный<br>мониторинг.';
  document.querySelector('#loading').hidden=false;
  try{if(isPump){const {createPump}=await import('./pump.js');if(token!==routeToken)return;current=createPump(engine);}else current=createPlant(engine);engine.setActive(current);document.querySelector('#loading').hidden=true;document.querySelector('#error').hidden=true;}catch(error){console.error(error);document.querySelector('#loading').hidden=true;document.querySelector('#error').hidden=false;}
}
document.querySelector('#reset-view').onclick=()=>engine.reset();
document.querySelector('#auto-rotate').onclick=e=>{engine.controls.autoRotate=!engine.controls.autoRotate;e.currentTarget.setAttribute('aria-pressed',engine.controls.autoRotate);};
document.querySelector('#quality').onclick=e=>{const high=engine.toggleQuality();e.currentTarget.setAttribute('aria-pressed',high);e.currentTarget.setAttribute('aria-label',high?'Высокое качество':'Экономное качество');e.currentTarget.textContent=high?'HD':'SD';};
document.querySelector('#back').onclick=()=>current?.back?.();
const dialog=document.querySelector('#about');document.querySelector('#about-open').onclick=()=>dialog.showModal();document.querySelector('#about-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
window.addEventListener('hashchange',route);window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open)current?.back?.();});
route();
// Optional progressive enhancement for browsers implementing WebMCP.
if(document.modelContext?.registerTool){const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});try{Promise.resolve(document.modelContext.registerTool({name:'navigate_industrial_demo',title:'Открыть 3D-демонстрацию',description:'Переключает видимый 3D-кейс: промышленный мониторинг или разборка насоса.',inputSchema:{type:'object',properties:{demo:{type:'string',enum:['plant','pump']}},required:['demo'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){if(!input||!['plant','pump'].includes(input.demo))throw new Error('demo must be plant or pump');history.replaceState(null,'','#'+input.demo);await route();return {demo:input.demo,title:document.querySelector('#scene-title').textContent};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
