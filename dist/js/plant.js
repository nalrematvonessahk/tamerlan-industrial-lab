import {THREE,v,mesh,box,cylinder,sphere,torus,rod,pbr,pipe,flowPipe,flange,textPlate,reducedMotion} from './engine.js';

export function createPlant(engine) {
  engine.setTheme(false);const group=new THREE.Group();engine.root.add(group);
  const mats={steel:pbr('#8ca5a9',{roughness:.32}),dark:pbr('#293d44',{roughness:.52}),paint:pbr('#386569',{roughness:.46,metalness:.45,grain:'paint'}),orange:pbr('#c2853d',{roughness:.42}),concrete:pbr('#3b4b50',{roughness:.94,metalness:0,grain:'stone'}),black:pbr('#15272c',{roughness:.68})};
  const ground=box(group,[25,.38,18],mats.concrete,[0,-.24,0]);
  box(group,[24.7,.025,17.7],mats.dark,[0,-.035,0]);
  const grid=new THREE.GridHelper(24,24,'#395153','#2b4044');grid.position.y=-.015;grid.scale.z=.73;group.add(grid);
  const floor=mesh(group,new THREE.PlaneGeometry(240,240),new THREE.MeshStandardMaterial({color:'#101c23',roughness:1,metalness:0}),[0,-.45,0],[-Math.PI/2,0,0]);floor.castShadow=false;
  // Concrete plinths and the perimeter service lane.
  for(const x of [-10.7,10.7])for(let z=-7;z<=7;z+=1.8)box(group,[.08,.025,.8],mats.orange,[x,0,z]);
  for(let x=-9;x<=9;x+=2)box(group,[.8,.025,.07],mats.orange,[x,0,7.1]);
  const overview=new THREE.Group(),detail=new THREE.Group();group.add(overview,detail);detail.visible=false;
  let mode='overview',selected='separator',flowsEnabled=!reducedMotion,paused=reducedMotion,simTime=0;
  const pickables=[],assets={},flows=[];
  const data={separator:{title:'Сепаратор S-101',code:'S-101',description:'Разделение газожидкостной смеси. Выберите объект, чтобы исследовать внутреннее устройство.',pressure:'6.4',temperature:'84',flow:'128',load:'72'},tank:{title:'Резервуар T-201',code:'T-201',description:'Буферная ёмкость. Внутри — уровень продукта, входной патрубок и узел измерения.',pressure:'1.2',temperature:'42',flow:'86',load:'64'},flare:{title:'Факельная установка',code:'F-301',description:'Демонстрация горелки, газового тракта и процедурного пламени.',pressure:'0.8',temperature:'760',flow:'24',load:'38'}};
  function asset(id,pos){const g=new THREE.Group();g.position.set(...pos);g.userData.asset=id;overview.add(g);assets[id]=g;pickables.push(g);return g;}
  const sep=asset('separator',[-3.7,0,.3]);
  box(sep,[8,.3,4],mats.concrete,[0,.15,0]);
  for(const x of [-2.5,2.5]){box(sep,[.55,1.2,2.2],mats.dark,[x,.9,0]);box(sep,[1.2,.17,2.7],mats.steel,[x,.36,0]);}
  cylinder(sep,1.3,6.3,mats.steel,[0,2.2,0],[0,0,Math.PI/2]);sphere(sep,1.3,mats.steel,[-3.15,2.2,0],[.55,1,1]);sphere(sep,1.3,mats.steel,[3.15,2.2,0],[.55,1,1]);
  for(const x of [-2.5,-.9,.9,2.5])torus(sep,1.312,.055,mats.dark,[x,2.2,0],[0,Math.PI/2,0]);
  for(const x of [-1.9,1.7]){cylinder(sep,.22,.65,mats.steel,[x,3.6,0]);flange(sep,[x,3.94,0],.37,mats.steel);}
  cylinder(sep,.42,.3,mats.dark,[0,3.55,0]);flange(sep,[0,3.72,0],.58,mats.steel);
  textPlate(sep,'S-101',[-.1,2.25,1.315],1.75);
  // Catwalk with open railings and service ladder.
  box(sep,[7.4,.12,.65],mats.dark,[0,3.15,-1.65]);
  for(let x=-3.5;x<=3.5;x+=1.15){rod(sep,[x,3.2,-1.95],[x,4.1,-1.95],.026,mats.orange);}
  for(const y of [3.7,4.1])rod(sep,[-3.65,y,-1.95],[3.65,y,-1.95],.024,mats.orange);
  for(const x of [-3.65,-3.1])rod(sep,[x,.4,-1.95],[x,3.4,-1.95],.032,mats.steel);
  for(let y=.5;y<3.4;y+=.28)rod(sep,[-3.65,y,-1.95],[-3.1,y,-1.95],.027,mats.steel);
  const tank=asset('tank',[4.6,0,-3]);
  cylinder(tank,2.3,.3,mats.concrete,[0,.15,0]);cylinder(tank,1.95,4.7,mats.paint,[0,2.66,0]);sphere(tank,1.95,mats.steel,[0,5.02,0],[1,.23,1]);
  for(const y of [.55,2,3.5,4.9])torus(tank,1.963,.042,mats.steel,[0,y,0]);
  cylinder(tank,.25,.55,mats.steel,[0,5.45,0]);flange(tank,[0,5.7,0],.42,mats.steel);textPlate(tank,'T-201',[0,3.2,1.96],1.7);
  for(const x of [-.35,.35])rod(tank,[x,.3,2.06],[x,5.6,2.06],.035,mats.steel);
  for(let y=.4;y<5.6;y+=.3)rod(tank,[-.35,y,2.06],[.35,y,2.06],.026,mats.steel);
  for(let y=1.4;y<5.7;y+=.8){const ring=mesh(tank,new THREE.TorusGeometry(.55,.025,8,24,Math.PI),mats.orange,[0,y,2.08],[Math.PI/2,0,0]);}
  const tank2=new THREE.Group();tank2.position.set(8.5,0,1.9);overview.add(tank2);cylinder(tank2,1.4,.25,mats.concrete,[0,.125,0]);cylinder(tank2,1.12,3.3,mats.steel,[0,1.9,0]);sphere(tank2,1.12,mats.steel,[0,3.55,0],[1,.26,1]);for(const y of [.45,2.1,3.45])torus(tank2,1.14,.04,mats.dark,[0,y,0]);textPlate(tank2,'T-202',[0,2,1.13],1.1);
  const flare=asset('flare',[-8,0,-5.3]);box(flare,[3,.25,3],mats.concrete,[0,.125,0]);
  cylinder(flare,.27,8.6,mats.dark,[0,4.45,0]);cylinder(flare,.4,.65,mats.steel,[0,8.9,0]);
  for(const x of [-.85,.85])for(const z of [-.85,.85])rod(flare,[x,.25,z],[x*.45,8,z*.45],.055,mats.steel);
  for(let y=1;y<8;y+=1.4){for(const z of [-.8,.8]){rod(flare,[-.8,y,z],[.8,y+1.25,z],.025,mats.steel);rod(flare,[.8,y,z],[-.8,y+1.25,z],.025,mats.steel);}for(const x of [-.8,.8])rod(flare,[x,y,-.8],[x,y+1.25,.8],.025,mats.steel);}
  const flame=createFlame(flare,[0,9.2,0],1);const glow=new THREE.PointLight('#ff9543',20,9,2);glow.position.set(0,9.4,0);flare.add(glow);
  // Pipe rack, pipe elbows, valve wheels and small pump skids.
  for(const x of [-7,-3,1,5,9]){for(const z of [3.5,5.3]){box(overview,[.15,2.3,.15],mats.dark,[x,1.15,z]);box(overview,[.6,.14,.6],mats.concrete,[x,.07,z]);}box(overview,[.16,.18,2.6],mats.steel,[x,2.3,4.4]);}
  for(let i=0;i<3;i++){
    const z=3.8+i*.54;const pts=[[-9,.7,z],[-8.5,1,z],[-8,2.65,z],[-6,2.7,z],[8.5,2.7,z],[9.3,2.3,z],[9.4,.6,z]];
    pipe(overview,pts,.12,i===1?mats.orange:mats.steel);flows.push(flowPipe(overview,pts,.127,i===1?'#e8c68e':'#9dddd0'));
    for(const x of [-6,-2,2,6])flange(overview,[x,2.7,z],.21,mats.dark,[0,0,Math.PI/2]);
  }
  const branch=[[-3,2.2,1.4],[-3,2.2,2],[-2.3,2.7,2.7],[-2.2,2.7,3.8]];pipe(overview,branch,.17,mats.steel);flows.push(flowPipe(overview,branch,.18));
  const branch2=[[4.6,1.1,-1],[4.6,1.1,0],[5.3,1.1,1],[5.3,2.7,3.8]];pipe(overview,branch2,.16,mats.steel);flows.push(flowPipe(overview,branch2,.17));
  for(const x of [-5,0,5]){rod(overview,[x,2.7,4.34],[x,3.22,4.34],.05,mats.steel);torus(overview,.24,.025,mats.orange,[x,3.25,4.34]);}
  for(const x of [-6.3,-2.8]){box(overview,[2.5,.25,1.2],mats.concrete,[x,.16,6]);cylinder(overview,.36,1.1,mats.paint,[x,.66,6],[0,0,Math.PI/2]);cylinder(overview,.5,.36,mats.steel,[x+.75,.66,6],[0,0,Math.PI/2]);for(let a=0;a<8;a++){const t=a*Math.PI/4;box(overview,[.9,.06,.07],mats.dark,[x,.66+Math.sin(t)*.36,6+Math.cos(t)*.36]);}}
  textPlate(overview,'PROCESS / UNIT 01',[-4,.7,8.98],3.8);
  const selectionRing=mesh(overview,new THREE.RingGeometry(2.6,2.63,80),new THREE.MeshBasicMaterial({color:'#c5efaf',transparent:true,opacity:.65,side:THREE.DoubleSide}),[-3.7,.02,.3],[-Math.PI/2,0,0]);selectionRing.scale.set(1.7,1,1);
  const labels=[engine.label('S-101 / Сепаратор',[-3.7,4.45,.5],()=>enter('separator')),engine.label('T-201 / Резервуар',[4.6,6.5,-3],()=>enter('tank')),engine.label('F-301 / Факел',[-8,10.5,-5.3],()=>enter('flare'))];
  let detailFlame=null,detailFlows=[],detailRotor=null;
  function clearDetail(){const geos=new Set(),materials=new Set();detail.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material&&!Object.values(mats).includes(o.material))materials.add(o.material);});geos.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());detail.clear();detailFlows=[];detailFlame=null;detailRotor=null;}
  function buildDetail(id){clearDetail();box(detail,[11,.3,7],mats.concrete,[0,0,0]);
    if(id==='separator'){
      const shell=mesh(detail,new THREE.CylinderGeometry(1.8,1.8,7,64,1,true,Math.PI*.65,Math.PI*1.35),mats.steel,[0,2.7,0],[0,0,Math.PI/2]);shell.material=mats.steel.clone();shell.material.side=THREE.DoubleSide;
      for(const x of [-3.5,3.5]){sphere(detail,1.8,mats.steel,[x,2.7,0],[.25,1,1]);torus(detail,1.83,.08,mats.dark,[x,2.7,0],[0,Math.PI/2,0]);box(detail,[.45,1.6,2.4],mats.dark,[x*.8,.9,0]);}
      box(detail,[6.7,.1,1.8],new THREE.MeshStandardMaterial({color:'#518b7e',metalness:.1,roughness:.2,transparent:true,opacity:.78}),[0,2,0]);
      for(const x of [-2,-.7,.7,2]){const plate=cylinder(detail,1.45,.1,mats.orange,[x,2.7,0],[0,0,Math.PI/2]);plate.scale.z=.68;for(let y=2;y<3.5;y+=.3)for(let z=-.7;z<.8;z+=.3)cylinder(detail,.055,.12,mats.black,[x+.065,y,z],[0,0,Math.PI/2]);}
      const points=[[-5,2.7,.4],[-3,2.7,.4],[0,2.7,.4],[3,3.3,.4],[3.3,4.9,.4]];detailFlows.push(flowPipe(detail,points,.2));textPlate(detail,'SEPARATION CHAMBER',[-.3,.5,3.51],3.4);
    }else if(id==='tank'){
      const shell=mesh(detail,new THREE.CylinderGeometry(2.5,2.5,5,64,1,true,Math.PI*.35,Math.PI*1.35),mats.paint,[0,2.7,0]);shell.material=mats.paint.clone();shell.material.side=THREE.DoubleSide;
      cylinder(detail,2.5,.18,mats.steel,[0,.25,0]);torus(detail,2.5,.07,mats.steel,[0,5.2,0]);
      cylinder(detail,2.4,3.2,new THREE.MeshStandardMaterial({color:'#568b78',transparent:true,opacity:.55,metalness:.1,roughness:.15}),[0,1.95,0]);
      rod(detail,[0,.5,0],[0,5.4,0],.095,mats.steel);detailRotor=new THREE.Group();detailRotor.position.set(0,1.6,0);detail.add(detailRotor);for(let i=0;i<4;i++)box(detailRotor,[2.9,.15,.28],mats.orange,[0,0,0],[0,i*Math.PI/2,Math.PI*.04]);
      const points=[[-4,4.6,0],[-3,4.6,0],[-1.7,4.6,0],[-1.7,3.7,0]];pipe(detail,points,.16,mats.steel);detailFlows.push(flowPipe(detail,points,.18));textPlate(detail,'BUFFER VESSEL',[-.4,.5,3.51],3);
    }else{
      cylinder(detail,.6,3.2,mats.dark,[0,1.9,0]);flange(detail,[0,.55,0],.94,mats.steel);flange(detail,[0,2.7,0],.85,mats.steel);cylinder(detail,.85,.6,mats.steel,[0,3.7,0]);
      for(let i=0;i<12;i++){const a=i*Math.PI/6;cylinder(detail,.08,.8,mats.orange,[Math.cos(a)*.65,4.1,Math.sin(a)*.65]);}
      for(const x of [-1,1])rod(detail,[x,.2,-.7],[x,3.1,-.7],.07,mats.steel);
      detailFlame=createFlame(detail,[0,4.05,0],2);const light=new THREE.PointLight('#ff8b39',40,12);light.position.set(0,4.8,0);detail.add(light);
      const points=[[-4,.5,1],[-2,.5,1],[0,.5,1],[0,1.3,0],[0,3.6,0]];pipe(detail,points,.18,mats.steel);detailFlows.push(flowPipe(detail,points,.195,'#ffcd85'));textPlate(detail,'FLARE / BURNER HEAD',[-.2,.5,3.51],3.5);
    }
  }
  function renderPanel(){const d=data[selected],inner=mode==='detail';document.querySelector('#panel').innerHTML=`
    <div class="panel-top"><span>${inner?'УРОВЕНЬ 02 / ОБОРУДОВАНИЕ':'УРОВЕНЬ 01 / УСТАНОВКА'}</span><span class="pill">● SIMULATION</span></div>
    <h2>${inner?d.title:'Технологический узел'}</h2><p class="panel-description">${inner?d.description:'Интерактивный макет газоперерабатывающей установки. Выберите оборудование для детального просмотра.'}</p>
    <div class="section-label">${inner?d.code+' / ПОКАЗАТЕЛИ':'S-101 / ПОКАЗАТЕЛИ ПРОЦЕССА'}</div>
    <div class="metric-grid"><div><div class="metric-label">Давление</div><div class="metric-value"><span id="pressure">${d.pressure}</span><small>bar</small></div><div class="metric-note">В рабочем диапазоне</div></div><div><div class="metric-label">Температура</div><div class="metric-value"><span id="temperature">${d.temperature}</span><small>°C</small></div><div class="metric-note">Стабильный режим</div></div><div><div class="metric-label">Расход</div><div class="metric-value">${d.flow}<small>м³/ч</small></div></div><div><div class="metric-label">Загрузка</div><div class="metric-value">${d.load}<small>%</small></div></div></div>
    <svg class="sparkline" viewBox="0 0 270 40" preserveAspectRatio="none" aria-label="Демонстрационный тренд давления"><path d="M0 29 12 28 22 30 32 23 43 24 55 19 65 22 78 17 90 20 102 13 112 17 122 16 131 20 141 14 151 17 165 12 178 16 189 10 200 13 213 9 224 13 237 11 249 14 260 9 270 11"/></svg>
    <div class="divider"></div><div class="section-label">${inner?'НАВИГАЦИЯ ПО ОБОРУДОВАНИЮ':'ИССЛЕДОВАТЬ ОБОРУДОВАНИЕ'}</div>
    <div class="asset-list">${Object.entries(data).map(([id,item],i)=>`<button class="asset ${selected===id?'selected':''}" data-asset="${id}"><span class="asset-index">0${i+1}</span><span class="asset-main"><strong>${item.title}</strong><small>${id==='separator'?'РАЗДЕЛЕНИЕ СМЕСИ':id==='tank'?'ХРАНЕНИЕ ПРОДУКТА':'СЖИГАНИЕ ГАЗА'}</small></span><span class="asset-arrow">↗</span></button>`).join('')}</div>
    <div class="divider"></div><div class="toggle-row"><span>Визуализация потоков</span><button id="flow-toggle" class="switch" role="switch" aria-label="Визуализация потоков" aria-checked="${flowsEnabled}"></button></div><div class="toggle-row"><span>Анимация процесса</span><button id="process-toggle" class="switch" role="switch" aria-label="Анимация процесса" aria-checked="${!paused}"></button></div>
    <p class="small-note">${inner?'Открытый разрез показывает внутренние узлы. Вернитесь к общему плану кнопкой на сцене.':'Нажмите на модель или её метку — камера плавно перейдёт к внутренним узлам.'}<br>Показатели синтетические.</p>`;
    document.querySelectorAll('[data-asset]').forEach(b=>b.onclick=()=>enter(b.dataset.asset));
    document.querySelector('#flow-toggle').onclick=e=>{flowsEnabled=!flowsEnabled;e.currentTarget.setAttribute('aria-checked',flowsEnabled);};
    document.querySelector('#process-toggle').onclick=e=>{paused=!paused;e.currentTarget.setAttribute('aria-checked',!paused);};
  }
  function enter(id){if(mode==='detail'&&selected===id)return;selected=id;mode='detail';buildDetail(id);overview.visible=false;detail.visible=true;labels.forEach(l=>l.visible=false);engine.setView(id==='flare'?[12,8,15]:[12,10,16],[0,id==='flare'?3:2,0]);document.querySelector('#back').hidden=false;document.querySelector('#scene-title').innerHTML=id==='separator'?'Внутри<br>сепаратора.':id==='tank'?'Внутри<br>резервуара.':'Факельная<br>горелка.';document.querySelector('#scene-eyebrow').textContent='CASE STUDY 01 / EQUIPMENT DETAIL';renderPanel();}
  function back(){mode='overview';selected='separator';detail.visible=false;overview.visible=true;labels.forEach(l=>l.visible=true);engine.setView([26,22,30],[0,1.5,0]);document.querySelector('#back').hidden=true;document.querySelector('#scene-title').innerHTML='Промышленный<br>мониторинг.';document.querySelector('#scene-eyebrow').textContent='CASE STUDY 01 / DIGITAL TWIN';renderPanel();}
  function findAsset(o){while(o&&!o.userData.asset)o=o.parent;return o?.userData.asset;}
  let hovered=null;function hover(obj){const id=findAsset(obj);if(id===hovered)return;hovered=id;Object.entries(assets).forEach(([key,g])=>g.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissive.setHex(0);}));selectionRing.visible=!id; if(id){selectionRing.visible=true;selectionRing.position.set(assets[id].position.x,.02,assets[id].position.z);selectionRing.scale.set(id==='separator'?1.7:1,1,1);}}
  let lastMetric=0;
  renderPanel();engine.setView([26,22,30],[0,1.5,0],false);
  return {pickables,select(obj){const id=findAsset(obj);if(id)enter(id);},hover,back,update(t,dt){if(!paused)simTime+=dt;for(const flow of [...flows,...detailFlows]){flow.mesh.visible=flowsEnabled;flow.update(simTime);}flame.update(simTime);detailFlame?.update(simTime);if(detailRotor&&!paused)detailRotor.rotation.y+=dt*.6;glow.intensity=18+Math.sin(simTime*9)*3;if(t-lastMetric>1&&!paused){lastMetric=t;const d=data[selected];const pressure=document.querySelector('#pressure');if(pressure)pressure.textContent=(Number(d.pressure)+Math.sin(simTime*.7)*.06).toFixed(1);const temp=document.querySelector('#temperature');if(temp)temp.textContent=Math.round(Number(d.temperature)+Math.sin(simTime*.4)*1.2);}},dispose(){document.querySelector('#back').hidden=true;}};
}

function createFlame(parent,position,scale){
  const material=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vUv; uniform float time; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}void main(){vec2 p=vUv;float n=noise(vec2(p.x*6.,p.y*7.-time*3.));float wobble=sin(p.y*8.-time*4.)*.07*p.y;float width=(1.-p.y)*.37;float shape=1.-smoothstep(width*.25,width+0.03,abs(p.x-.5+wobble)+(n-.5)*.17*p.y);float fade=smoothstep(0.,.08,p.y)*(1.-smoothstep(.65,1.,p.y));float alpha=shape*fade*.95;vec3 color=mix(vec3(1.,.17,.02),vec3(1.,.8,.24),shape*(1.-p.y*.75));color=mix(color,vec3(.25,.48,1.),(1.-smoothstep(0.,.16,p.y))*.75);gl_FragColor=vec4(color*1.7,alpha);}`,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const g=new THREE.Group();g.position.set(...position);g.scale.setScalar(scale);parent.add(g);
  for(let i=0;i<3;i++)mesh(g,new THREE.PlaneGeometry(1.6,3.2),material,[0,1.5,0],[0,i*Math.PI/3,0]).castShadow=false;
  return {update(t){material.uniforms.time.value=t;g.scale.y=scale*(.92+Math.sin(t*7)*.07);}};
}
