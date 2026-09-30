import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export { THREE };
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const v = (x,y,z) => new THREE.Vector3(x,y,z);
export function mesh(parent,geometry,material,pos=[0,0,0],rotation=[0,0,0]) {
  const obj=new THREE.Mesh(geometry,material); obj.position.set(...pos); obj.rotation.set(...rotation);
  obj.castShadow=true; obj.receiveShadow=true; parent.add(obj); return obj;
}
export const box=(p,s,m,pos,rot)=>mesh(p,new THREE.BoxGeometry(...s),m,pos,rot);
export const cylinder=(p,r,h,m,pos,rot,r2=r)=>mesh(p,new THREE.CylinderGeometry(r2,r,h,48),m,pos,rot);
export const sphere=(p,r,m,pos,scale=[1,1,1])=>{const o=mesh(p,new THREE.SphereGeometry(r,40,24),m,pos);o.scale.set(...scale);return o;};
export function rod(p,a,b,r,m){const av=v(...a),bv=v(...b),d=bv.clone().sub(av);const o=cylinder(p,r,d.length(),m,av.add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(v(0,1,0),d.normalize());return o;}
export function torus(p,r,t,m,pos,rot=[Math.PI/2,0,0]){return mesh(p,new THREE.TorusGeometry(r,t,10,64),m,pos,rot);}

// Deterministic, tileable procedural PBR maps; no external texture requests.
let seed=42;
function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
const textureCache=new Map();
export function pbr(color,{metalness=.75,roughness=.4,grain='metal'}={}) {
  if(!textureCache.has(grain)) {
    const size=256, heights=new Float32Array(size*size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++)heights[y*size+x]=grain==='metal' ? .45+.16*Math.sin(y*2.5)+random()*.22 : .25+random()*.6;
    const images=[0,1,2].map(()=>{const c=document.createElement('canvas');c.width=c.height=size;return c;});
    images.forEach((c,type)=>{const ctx=c.getContext('2d'),im=ctx.createImageData(size,size);
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){let i=(y*size+x)*4,h=heights[y*size+x];
        if(type===2){im.data[i]=128+(h-heights[y*size+(x+1)%size])*45;im.data[i+1]=128+(h-heights[((y+1)%size)*size+x])*45;im.data[i+2]=254;}
        else {let n=type===0?207+h*48:150+h*90;im.data[i]=im.data[i+1]=im.data[i+2]=n;}im.data[i+3]=255;
      }ctx.putImageData(im,0,0);
    });
    const maps=images.map((c,i)=>{const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);t.anisotropy=4;if(i===0)t.colorSpace=THREE.SRGBColorSpace;return t;});textureCache.set(grain,maps);
  }
  const [map,roughnessMap,normalMap]=textureCache.get(grain);
  return new THREE.MeshStandardMaterial({color,metalness,roughness,map,roughnessMap,normalMap,normalScale:new THREE.Vector2(.35,.35)});
}
export function textPlate(parent,text,pos,width=2,color='#c4ddcf',bg='#213739') {
  const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,512,128);x.strokeStyle=color;x.lineWidth=2;x.strokeRect(8,8,496,112);x.fillStyle=color;x.font='500 47px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,66);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  return mesh(parent,new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}),pos);
}
export function flange(p,pos,r,m,rotation=[0,0,0]){
  const g=new THREE.Group();p.add(g);g.position.set(...pos);g.rotation.set(...rotation);
  cylinder(g,r,.13,m);const boltMat=pbr('#aab6b4',{roughness:.35});
  for(let i=0;i<8;i++){const a=i*Math.PI/4;cylinder(g,.045,.2,boltMat,[Math.cos(a)*r*.78,0,Math.sin(a)*r*.78]);}return g;
}
export function pipe(parent,points,r,material){const curve=new THREE.CatmullRomCurve3(points.map(p=>v(...p)),false,'centripetal',.2);const o=mesh(parent,new THREE.TubeGeometry(curve,80,r,12,false),material);return {mesh:o,curve};}
export function flowPipe(parent,points,r,color='#aeeac7') {
  const mat=new THREE.ShaderMaterial({uniforms:{time:{value:0},color:{value:new THREE.Color(color)}},vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float time; uniform vec3 color; varying vec2 vUv; void main(){float t=fract(vUv.x*16.-time*.8);float a=smoothstep(.05,.17,t)*(1.-smoothstep(.42,.62,t));float edge=pow(abs(sin(vUv.y*6.283)),1.5);gl_FragColor=vec4(color*(.65+a*.7),(.13+a*.8)*(.35+edge*.65));}`,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const out=pipe(parent,points,r,mat);out.mesh.castShadow=false;return { ...out, update(t){mat.uniforms.time.value=t;} };
}
export function createEngine(container) {
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(39,1,.1,250);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;renderer.localClippingEnabled=true;container.appendChild(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=5;controls.maxDistance=65;controls.enablePan=true;controls.autoRotateSpeed=.45;
  const env=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);const envTarget=pmrem.fromScene(env,.04);scene.environment=envTarget.texture;scene.environmentIntensity=.55;env.dispose();pmrem.dispose();
  const hemi=new THREE.HemisphereLight('#cee7eb','#132322',2);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff2dc',4);sun.position.set(-12,24,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-23,right:23,top:23,bottom:-23,near:1,far:80});sun.shadow.bias=-.0004;sun.shadow.normalBias=.05;scene.add(sun);
  const fill=new THREE.DirectionalLight('#80c9d3',2);fill.position.set(10,10,-16);scene.add(fill);
  const root=new THREE.Group();scene.add(root);const labels=[];let active=null,tween=null,quality=true,disposed=false;
  let view={position:[26,22,30],target:[0,1,0]};
  const resize=()=>{const {width,height}=container.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);};
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);resize();
  const api={scene,camera,renderer,controls,root,labels,hemi,sun,fill,
    setTheme(light){scene.background=new THREE.Color(light?'#e9e8e3':'#101b22');scene.fog=new THREE.Fog(light?'#e9e8e3':'#101b22',55,130);hemi.intensity=light?2.6:1.4;fill.intensity=light?1.4:2;scene.environmentIntensity=light?.85:.55;renderer.toneMappingExposure=light?1.25:1.15;},
    setActive(controller){active=controller;},
    setView(position,target,animate=true){renderer.shadowMap.needsUpdate=true;view={position:[...position],target:[...target]};return api.fly(position,target,animate);},
    fly(position,target,animate=true){tween?.kill();gsap.killTweensOf(camera.position);gsap.killTweensOf(controls.target);controls.autoRotate=false;document.querySelector('#auto-rotate').setAttribute('aria-pressed','false');controls.enabled=false;
      const narrow=container.clientWidth<650,scale=narrow?Math.max(1.3,Math.min(1.9,650/container.clientWidth)):1;const dest=v(...position).sub(v(...target)).multiplyScalar(scale).add(v(...target)),aim=v(...target);if(narrow){dest.y+=1.2;aim.y+=1.2;}
      if(!animate||reducedMotion){camera.position.copy(dest);controls.target.copy(aim);controls.enabled=true;controls.update();return;}
      tween=gsap.timeline({onComplete:()=>{controls.enabled=true;}}).to(camera.position,{x:dest.x,y:dest.y,z:dest.z,duration:1.35,ease:'power3.inOut'},0).to(controls.target,{x:aim.x,y:aim.y,z:aim.z,duration:1.35,ease:'power3.inOut'},0);
    },
    reset(){api.fly(view.position,view.target);},
    label(text,position,onClick){const el=document.createElement('button');el.className='hotspot';el.textContent=text;el.addEventListener('click',onClick);document.querySelector('#labels').appendChild(el);const item={el,position:v(...position)};labels.push(item);return item;},
    clear(){tween?.kill();controls.enabled=true;gsap.killTweensOf(camera.position);gsap.killTweensOf(controls.target);labels.splice(0).forEach(l=>l.el.remove());active?.dispose?.();active=null;
      const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>{if(m.map&&!Array.from(textureCache.values()).flat().includes(m.map))m.map.dispose();m.dispose();});root.clear();},
    toggleQuality(){quality=!quality;renderer.setPixelRatio(quality?Math.min(devicePixelRatio,1.7):1);renderer.shadowMap.enabled=quality;renderer.shadowMap.needsUpdate=true;resize();return quality;},
    dispose(){disposed=true;api.clear();resizeObserver.disconnect();controls.dispose();envTarget.dispose();renderer.dispose();}
  };
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null,hover=null;
  function pick(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(active?.pickables??[],true);return hits.find(h=>{let p=h.object;while(p){if(!p.visible)return false;p=p.parent;}return true;})?.object;}
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6&&controls.enabled){const hit=pick(e);if(hit)active?.select?.(hit);}down=null;});
  renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons)return;const hit=pick(e);if(hit!==hover){active?.hover?.(hit);hover=hit;}renderer.domElement.style.cursor=hit?'pointer':'grab';});
  renderer.domElement.addEventListener('pointerleave',()=>{active?.hover?.(null);hover=null;down=null;});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.querySelector('#error-message').textContent='Браузер приостановил графический контекст. Перезагрузите сцену, чтобы продолжить.';document.querySelector('#error').hidden=false;});
  let previous=performance.now(),elapsed=0,frames=0,fpsTime=0;
  function loop(now){if(disposed)return;requestAnimationFrame(loop);if(document.hidden){previous=now;return;}const dt=Math.min((now-previous)/1000,.05);previous=now;elapsed+=dt;controls.update();active?.update?.(elapsed,dt);root.updateMatrixWorld(true);
    for(const label of labels){const pos=label.position.clone().project(camera);const x=(pos.x*.5+.5)*container.clientWidth,y=(-pos.y*.5+.5)*container.clientHeight;const show=label.visible!==false&&pos.z<1&&pos.z>-1&&x>20&&x<container.clientWidth-20&&y>175&&y<container.clientHeight-50;label.el.style.display=show?'flex':'none';label.el.style.transform=`translate(${Math.min(Math.max(x,65),container.clientWidth-85)}px,${y}px) translate(-50%,-50%)`;}
    renderer.render(scene,camera);frames++;fpsTime+=dt;if(fpsTime>1){document.querySelector('#fps').textContent=Math.round(frames/fpsTime);fpsTime=0;frames=0;}
  }requestAnimationFrame(loop);return api;
}
