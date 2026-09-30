import {THREE,v,mesh,box,cylinder,sphere,torus,rod,pbr,textPlate,reducedMotion} from './engine.js';

export function createPump(engine){
  engine.setTheme(true);const root=new THREE.Group();engine.root.add(root);
  const steel=pbr('#b1b7b4',{metalness:.95,roughness:.28}),paint=pbr('#345666',{metalness:.55,roughness:.42,grain:'paint'}),dark=pbr('#283636',{metalness:.6,roughness:.52}),copper=pbr('#c68444',{metalness:.85,roughness:.28}),rubber=pbr('#222929',{metalness:0,roughness:.9});
  const floor=mesh(root,new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#e4e4dd',roughness:.97}),[0,-.63,0],[-Math.PI/2,0,0]);floor.castShadow=false;
  const pedestal=cylinder(root,7.1,.24,new THREE.MeshStandardMaterial({color:'#dedfd7',roughness:.9}),[0,-.51,0]);
  const ring=torus(root,6.8,.012,new THREE.MeshStandardMaterial({color:'#b2bcae',roughness:.8}),[0,-.37,0]);
  box(root,[7.6,.18,2.6],dark,[1,-.26,0]);
  const rail=box(root,[7.55,.07,.12],steel,[1,-.13,1.17]);box(root,[7.55,.07,.12],steel,[1,-.13,-1.17]);
  const assembly=new THREE.Group();assembly.position.set(0,1.15,0);root.add(assembly);
  const parts=[],pickables=[];let exploded=0,running=!reducedMotion,section=false,finish='blue',activeId='housing',tween=null,elapsed=0;
  const partData={cover:{title:'Передняя крышка',code:'01 / INLET COVER',description:'Входной патрубок, фланец и крепёж. Снимается вдоль оси для доступа к рабочему колесу.',material:'Литой корпус · окрашенный металл'},impeller:{title:'Рабочее колесо',code:'02 / IMPELLER',description:'Криволинейные лопатки передают энергию потоку. Вращение показано в замедленном демонстрационном режиме.',material:'Бронза · металлическое покрытие'},housing:{title:'Корпус насоса',code:'03 / VOLUTE CASING',description:'Спиральная камера собирает поток от рабочего колеса и направляет его к выходному патрубку.',material:'Литой корпус · PBR-покрытие'},shaft:{title:'Вал и уплотнение',code:'04 / SHAFT & SEAL',description:'Передаёт вращение двигателя рабочему колесу. Уплотнительные кольца отделяют рабочую среду от привода.',material:'Нержавеющая сталь · эластомер'},motor:{title:'Электродвигатель',code:'05 / ELECTRIC MOTOR',description:'Привод с рёбрами охлаждения, клеммной коробкой и защитным кожухом вентилятора.',material:'Окрашенный металл · сталь'}};
  function part(id,x,offset){const g=new THREE.Group();assembly.add(g);g.position.x=x;g.userData.part=id;const item={id,group:g,base:x,offset};parts.push(item);pickables.push(g);return g;}
  // All rotational elements share a common X axis.
  const axis=[0,0,Math.PI/2];
  const cover=part('cover',-1.81,-3.2);
  cylinder(cover,1.21,.2,paint,[0,0,0],axis);cylinder(cover,1.08,.2,steel,[-.13,0,0],axis);cylinder(cover,.46,.8,paint,[-.58,0,0],axis);
  // Open annular inlet instead of a solid cylinder cap.
  const inlet=mesh(cover,new THREE.CylinderGeometry(.55,.55,.15,64,1,true),steel,[-1.04,0,0],axis);
  torus(cover,.44,.11,steel,[-1.12,0,0],[0,Math.PI/2,0]);cylinder(cover,.34,.015,rubber,[-1.105,0,0],axis);
  function bolts(p,x,r,count=12){for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const o=mesh(p,new THREE.CylinderGeometry(.067,.067,.14,6),steel,[x,Math.cos(a)*r,Math.sin(a)*r],axis);}}
  bolts(cover,-.2,1.01);bolts(cover,-1.15,.47,8);
  const impeller=part('impeller',-1.51,-1.85),rotor=new THREE.Group();impeller.add(rotor);
  cylinder(rotor,.94,.09,copper,[.05,0,0],axis);cylinder(rotor,.24,.36,steel,[0,0,0],axis);torus(rotor,.92,.035,copper,[-.15,0,0],[0,Math.PI/2,0]);
  for(let i=0;i<7;i++){
    const shape=new THREE.Shape();for(let j=0;j<=20;j++){const t=j/20,r=.25+t*.66,a=i*Math.PI*2/7+t*.9;const y=Math.cos(a)*r,z=Math.sin(a)*r;if(j===0)shape.moveTo(y,z);else shape.lineTo(y,z);}for(let j=20;j>=0;j--){const t=j/20,r=.25+t*.66,a=i*Math.PI*2/7+t*.9+.09;shape.lineTo(Math.cos(a)*r,Math.sin(a)*r);}shape.closePath();
    const blade=mesh(rotor,new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.012}),copper,[-.15,0,0],[0,Math.PI/2,0]);
  }
  const housing=part('housing',-.95,0);const clipping=new THREE.Plane(v(0,0,-1),.12);
  const housingPaint=paint.clone(),housingSteel=steel.clone();housingPaint.side=THREE.DoubleSide;housingSteel.side=THREE.DoubleSide;
  const casing=mesh(housing,new THREE.CylinderGeometry(1.27,1.27,1.35,80,1,true),housingPaint,[0,0,0],axis);
  cylinder(housing,1.28,.14,housingPaint,[.69,0,0],axis);torus(housing,1.23,.09,housingSteel,[-.7,0,0],[0,Math.PI/2,0]);torus(housing,1.23,.045,housingSteel,[.65,0,0],[0,Math.PI/2,0]);
  // Tangential discharge with machined flange and bolt circle.
  cylinder(housing,.35,1.0,housingPaint,[.12,1.35,.58]);cylinder(housing,.57,.17,housingSteel,[.12,1.91,.58]);
  cylinder(housing,.25,.015,rubber,[.12,2.002,.58]);for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(housing,.048,.21,steel,[.12+Math.cos(a)*.45,1.94,.58+Math.sin(a)*.45]);}
  for(const z of [-.82,.82])box(housing,[1.45,.55,.2],paint,[.1,-1.06,z]);
  const shaft=part('shaft',.28,1.35);
  cylinder(shaft,.15,2.6,steel,[-.62,0,0],axis);cylinder(shaft,.45,.3,dark,[.1,0,0],axis);cylinder(shaft,.41,.12,steel,[-.12,0,0],axis);
  for(const x of [-.29,-.04,.26])torus(shaft,.33,.055,rubber,[x,0,0],[0,Math.PI/2,0]);
  cylinder(shaft,.38,.25,copper,[.56,0,0],axis);bolts(shaft,.74,.29,6);
  const motor=part('motor',2.2,2.6);cylinder(motor,.81,2.5,paint,[0,0,0],axis);cylinder(motor,.84,.18,steel,[-1.23,0,0],axis);cylinder(motor,.82,.28,dark,[1.34,0,0],axis);
  for(let i=0;i<22;i++){const a=i*Math.PI*2/22;box(motor,[2.25,.13,.048],paint,[0,Math.cos(a)*.84,Math.sin(a)*.84],[a,0,0]);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;box(motor,[.02,.06,1.15],steel,[1.5,0,0],[a,0,0]);}
  box(motor,[.86,.35,.75],paint,[.15,.94,0]);box(motor,[.9,.07,.79],steel,[.15,1.15,0]);for(const x of [-.18,.48])for(const z of [-.25,.25])cylinder(motor,.04,.09,steel,[x,1.2,z]);
  for(const x of [-.8,.8]){box(motor,[.3,.42,1.45],paint,[x,-.87,0]);box(motor,[.6,.11,1.85],steel,[x,-1.1,0]);for(const z of [-.76,.76])cylinder(motor,.065,.13,dark,[x,-1.02,z]);}
  const plate=textPlate(motor,'AX-80 / DRIVE',[0,.1,.876],1.15,'#c5d2d0','#263b43');
  const basePlate=textPlate(root,'AX-80   /   CENTRIFUGAL PUMP',[1,-.26,1.306],3.6,'#c2cbc3','#293735');
  const dimensionMat=new THREE.LineBasicMaterial({color:'#9aa994',transparent:true,opacity:.6});
  function line(points){const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>v(...p)));const obj=new THREE.Line(geometry,dimensionMat);root.add(obj);return obj;}
  line([[-3.2,-.32,2.5],[4.9,-.32,2.5]]);for(const x of [-3.2,4.9])line([[x,-.32,2.3],[x,-.32,2.7]]);
  const labelMap=parts.map(p=>({part:p,label:engine.label(partData[p.id].title,[p.base,3.6,0],()=>selectPart(p.id))}));
  const focus=new THREE.BoxHelper(housing,'#7f9b6f');focus.material.transparent=true;focus.material.opacity=.4;focus.visible=false;root.add(focus);
  function setExplode(value,animate=false){exploded=Math.max(0,Math.min(1,Number(value)));tween?.kill();parts.forEach(p=>gsap.killTweensOf(p.group.position));engine.renderer.shadowMap.needsUpdate=true;
    if(animate&&!reducedMotion){tween=gsap.timeline({onUpdate:()=>{engine.renderer.shadowMap.needsUpdate=true;}});parts.forEach((p,i)=>tween.to(p.group.position,{x:p.base+p.offset*exploded,duration:1.25,ease:'power3.inOut'},i*.035));}
    else parts.forEach(p=>p.group.position.x=p.base+p.offset*exploded);
    const range=document.querySelector('#explode');if(range)range.value=exploded*100;const output=document.querySelector('#explode-value');if(output)output.textContent=Math.round(exploded*100)+'%';const button=document.querySelector('#explode-button');if(button)button.innerHTML=exploded>.5?'Собрать насос <span>↙</span>':'Разобрать насос <span>↗</span>';
  }
  function selectPart(id){activeId=id;const p=parts.find(x=>x.id===id);focus.setFromObject(p.group);focus.visible=true;document.querySelectorAll('[data-part]').forEach(b=>b.classList.toggle('selected',b.dataset.part===id));const d=partData[id];document.querySelector('#part-info').innerHTML=`<strong>${d.title}</strong><p>${d.description}</p><small>${d.material}</small>`;}
  function renderPanel(){document.querySelector('#panel').innerHTML=`
    <div class="panel-top"><span>PRODUCT EXPLORER</span><span class="pill">AX SERIES</span></div><h2>Центробежный насос</h2><p class="panel-description">AX-80 / Демонстрационная сборка.<br>Исследуйте конструкцию, слой за слоем.</p>
    <button id="explode-button" class="primary">Разобрать насос <span>↗</span></button>
    <label class="range-header" for="explode"><span>Степень разборки</span><output id="explode-value">0%</output></label><input id="explode" type="range" min="0" max="100" value="0" step="1"><div class="range-ends"><span>СБОРКА</span><span>ДЕТАЛИ</span></div>
    <div class="divider"></div><div class="section-label">КОМПОНЕНТЫ / 05</div><div class="asset-list">${parts.map((p,i)=>`<button class="asset ${activeId===p.id?'selected':''}" data-part="${p.id}"><span class="asset-index">0${i+1}</span><span class="asset-main"><strong>${partData[p.id].title}</strong></span><span class="asset-arrow">+</span></button>`).join('')}</div>
    <div id="part-info" class="part-info" aria-live="polite"></div><div class="divider"></div>
    <div class="toggle-row"><span>Сечение корпуса</span><button id="section-toggle" class="switch" role="switch" aria-label="Сечение корпуса" aria-checked="false"></button></div><div class="toggle-row"><span>Вращение ротора</span><button id="rotor-toggle" class="switch" role="switch" aria-label="Вращение ротора" aria-checked="${running}"></button></div>
    <div class="range-header"><span>Покрытие корпуса</span><span id="finish-name" class="metric-label">Ocean blue</span></div><div class="swatches" role="group" aria-label="Покрытие корпуса"><button class="swatch selected" data-color="blue" aria-label="Синее покрытие" aria-pressed="true"></button><button class="swatch" data-color="silver" aria-label="Стальное покрытие" aria-pressed="false"></button><button class="swatch" data-color="orange" aria-label="Медное покрытие" aria-pressed="false"></button></div>
    <p class="small-note">Концептуальная модель. Пропорции и вращение адаптированы для демонстрации конструкции.</p>`;
    document.querySelector('#explode-button').onclick=()=>setExplode(exploded>.5?0:1,true);
    document.querySelector('#explode').oninput=e=>setExplode(e.target.value/100);
    document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>selectPart(b.dataset.part));
    document.querySelector('#section-toggle').onclick=e=>{section=!section;housingPaint.clippingPlanes=section?[clipping]:[];housingSteel.clippingPlanes=section?[clipping]:[];housingPaint.needsUpdate=true;housingSteel.needsUpdate=true;e.currentTarget.setAttribute('aria-checked',section);};
    document.querySelector('#rotor-toggle').onclick=e=>{running=!running;e.currentTarget.setAttribute('aria-checked',running);};
    document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{finish=b.dataset.color;const palette={blue:['#345666',.55,.42,'Ocean blue'],silver:['#b7bfba',.92,.26,'Brushed steel'],orange:['#b9693f',.55,.42,'Burnt copper']};const [color,metalness,roughness,name]=palette[finish];for(const m of [paint,housingPaint]){m.color.set(color);m.metalness=metalness;m.roughness=roughness;}document.querySelector('#finish-name').textContent=name;document.querySelectorAll('[data-color]').forEach(s=>{s.classList.toggle('selected',s===b);s.setAttribute('aria-pressed',s===b);});});
    selectPart(activeId);focus.visible=false;
  }
  function findPart(obj){while(obj&&!obj.userData.part)obj=obj.parent;return obj?.userData.part;}
  renderPanel();engine.setView([-11,7.3,14],[0,1,0],false);engine.controls.minDistance=5;engine.controls.maxDistance=45;
  return {pickables,select(obj){const id=findPart(obj);if(id)selectPart(id);},hover(obj){const id=findPart(obj);if(id){focus.setFromObject(parts.find(p=>p.id===id).group);focus.visible=true;}else focus.visible=false;},update(t,dt){elapsed+=dt;if(running)rotor.rotation.x-=dt*1.3;for(const {part,label} of labelMap){label.position.set(part.group.position.x,part.id==='housing'?4:part.id==='motor'?3.3:3.5,0);label.visible=exploded>.65&&(part.id==='cover'||part.id==='impeller'||part.id==='motor');}if(focus.visible)focus.update();},dispose(){tween?.kill();parts.forEach(p=>gsap.killTweensOf(p.group.position));engine.controls.maxDistance=65;}};
}
