     // ── Cursor ──────────────────────────────────────────────
  const cur=document.getElementById('cur'),curR=document.getElementById('curR');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  (function mc(){requestAnimationFrame(mc);rx+=(mx-rx)*.12;ry+=(my-ry)*.12;cur.style.left=mx+'px';cur.style.top=my+'px';curR.style.left=rx+'px';curR.style.top=ry+'px';})();

  // ── Scroll reveal ────────────────────────────────────────
  const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible');}),{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // ── Astronomy ────────────────────────────────────────────
  function getGMST(d){const JD=d.getTime()/86400000+2440587.5,T=(JD-2451545)/36525;let s=24110.54841+8640184.812866*T+0.093104*T*T-6.2e-6*T*T*T;const U=d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds()+d.getUTCMilliseconds()/1000;s=((s+U*1.00273790935)%86400+86400)%86400;return(s/86400)*2*Math.PI;}
  function getObl(d){const T=(d.getTime()/86400000+2440587.5-2451545)/36525;return 23.439291111-0.013004167*T-0.000000164*T*T+0.000000504*T*T*T;}
  function getSun(d){const JD=d.getTime()/86400000+2440587.5,n=JD-2451545,L=(280.46+0.9856474*n)%360,g=((357.528+0.9856003*n)%360)*Math.PI/180,λ=(L+1.915*Math.sin(g)+0.02*Math.sin(2*g))*Math.PI/180,ε=getObl(d)*Math.PI/180,dec=Math.asin(Math.sin(ε)*Math.sin(λ)),ra=Math.atan2(Math.cos(ε)*Math.sin(λ),Math.cos(λ)),g2=getGMST(d);return new THREE.Vector3(Math.cos(dec)*Math.cos(ra-g2),Math.sin(dec),Math.cos(dec)*Math.sin(ra-g2)).normalize();}
  function gmstHMS(r){const h=(r/(2*Math.PI))*24,hh=Math.floor(h)%24,mm=Math.floor((h%1)*60),ss=Math.floor(((h%1)*60%1)*60);return`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;}


  // ── Three.js ─────────────────────────────────────────────
  const heroEl=document.getElementById('hero');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,heroEl.clientWidth/heroEl.clientHeight,0.01,2000);
  camera.position.set(0,0.5,4); // further back = smaller globe
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(heroEl.clientWidth,heroEl.clientHeight);
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.0;
  renderer.setClearColor(0,0);
  heroEl.insertBefore(renderer.domElement,heroEl.firstChild);

  const ctrl=new THREE.OrbitControls(camera,renderer.domElement);
      ctrl.enableDamping  = true;
    ctrl.dampingFactor  = 0.05;
    ctrl.minDistance=3;
    ctrl.maxDistance=100;
    ctrl.autoRotate     = true;
    ctrl.autoRotateSpeed = 0.5;
    ctrl.enableZoom=false;
  // ctrl.enableDamping=true;ctrl.dampingFactor=.05;ctrl.autoRotate=false;ctrl.minDistance=2;ctrl.maxDistance=10;ctrl.enableZoom=false;ctrl.enablePan=false;

  // // Stars
  // {const N=8000,p=new Float32Array(N*3),c=new Float32Array(N*3);for(let i=0;i<N;i++){const th=Math.random()*2*Math.PI,ph=Math.acos(2*Math.random()-1),r=500+Math.random()*300;p[i*3]=r*Math.sin(ph)*Math.cos(th);p[i*3+1]=r*Math.sin(ph)*Math.sin(th);p[i*3+2]=r*Math.cos(ph);const t=Math.random();c[i*3]=.7+t*.3;c[i*3+1]=.8+t*.15;c[i*3+2]=.9+t*.1;}
  // const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({size:.45,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:.75})));}

  const sunLight=new THREE.DirectionalLight(0xe8d5a0,.5);scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x050e20,3.1));

  const pivot=new THREE.Group();scene.add(pivot);
  const BASE='https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/';
  const loader=new THREE.TextureLoader();

  const earth=new THREE.Mesh(new THREE.SphereGeometry(1,64,64),new THREE.MeshPhongMaterial({map:loader.load(BASE+'earth_atmos_2048.jpg'),specularMap:loader.load(BASE+'earth_specular_2048.jpg'),normalMap:loader.load(BASE+'earth_normal_2048.jpg'),specular:new THREE.Color(0x224488),shininess:18}));
  pivot.add(earth);

  // Night overlay
  const nO=new THREE.Mesh(new THREE.SphereGeometry(1.001,64,64),new THREE.MeshBasicMaterial({color:0x000510,transparent:true,opacity:.80,side:THREE.FrontSide,depthWrite:false}));
  nO.material.onBeforeCompile=sh=>{sh.uniforms.sunDir={value:new THREE.Vector3(1,0,0)};nO.material.userData.shader=sh;sh.vertexShader='varying vec3 vN;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvN=normal;');sh.fragmentShader='varying vec3 vN;\nuniform vec3 sunDir;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>\nvec3 wn=normalize((modelMatrix*vec4(vN,0.0)).xyz);gl_FragColor.a*=1.0-smoothstep(-0.07,0.13,dot(wn,sunDir));`);};
  pivot.add(nO);

  const term=new THREE.Mesh(new THREE.SphereGeometry(1.002,64,64),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  term.material.onBeforeCompile=sh=>{sh.uniforms.sunDir={value:new THREE.Vector3(1,0,0)};term.material.userData.shader=sh;sh.vertexShader='varying vec3 vN2;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvN2=normal;');sh.fragmentShader='varying vec3 vN2;\nuniform vec3 sunDir;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>\nvec3 wn=normalize((modelMatrix*vec4(vN2,0.0)).xyz);float ring=1.0-smoothstep(0.0,0.065,abs(dot(wn,sunDir)));gl_FragColor=vec4(1.0,0.55,0.22,ring*0.35);`);};
  pivot.add(term);

  const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.012,64,64),new THREE.MeshPhongMaterial({map:loader.load(BASE+'earth_clouds_1024.png'),transparent:true,opacity:.32,depthWrite:false}));
  pivot.add(clouds);
  pivot.add(new THREE.Mesh(new THREE.SphereGeometry(1.055,48,48),new THREE.MeshPhongMaterial({color:0x2255cc,transparent:true,opacity:.06,side:THREE.FrontSide,depthWrite:false})));
  pivot.add(new THREE.Mesh(new THREE.SphereGeometry(1.16,48,48),new THREE.MeshPhongMaterial({color:0x1133aa,transparent:true,opacity:.025,side:THREE.BackSide,depthWrite:false})));

  
  function latLon(lat,lon,r){const phi=(90-lat)*Math.PI/180,theta=(lon+180)*Math.PI/180;return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));}
  const issMesh=new THREE.Mesh(new THREE.SphereGeometry(0.014,10,10),new THREE.MeshBasicMaterial({color:0x88ffcc}));
  const issGlow=new THREE.Mesh(new THREE.SphereGeometry(0.026,10,10),new THREE.MeshBasicMaterial({color:0x44ffaa,transparent:true,opacity:.2,depthWrite:false}));
  scene.add(issMesh);scene.add(issGlow);
  const orbPos=new Float32Array(180*3);const orbGeo=new THREE.BufferGeometry();orbGeo.setAttribute('position',new THREE.BufferAttribute(orbPos,3));orbGeo.setDrawRange(0,0);
  scene.add(new THREE.Line(orbGeo,new THREE.LineBasicMaterial({color:0x7ecfff,transparent:true,opacity:.35})));
  let issH=[],issData=null;


  window.addEventListener('resize',()=>{camera.aspect=heroEl.clientWidth/heroEl.clientHeight;camera.updateProjectionMatrix();renderer.setSize(heroEl.clientWidth,heroEl.clientHeight);});

  const TOFF=Math.PI,cDR=(2*Math.PI)/(10*24*3600);
  let cD=0,lT=performance.now(),lH=0;

  function anim(ts){requestAnimationFrame(anim);const dt=Math.min((ts-lT)/1000,.1);lT=ts;cD+=cDR*dt;
    const now=new Date(),gmst=getGMST(now),obl=getObl(now);
    pivot.rotation.z=obl*Math.PI/180;
    earth.rotation.y=-(360-22.5);
    const sd=getSun(now);sunLight.position.copy(sd).multiplyScalar(50);
    [nO,term].forEach(m=>{if(m.material.userData.shader)m.material.userData.shader.uniforms.sunDir.value.copy(sd);});
    if(issData){const lat=parseFloat(issData.latitude),lon=parseFloat(issData.longitude),alt=parseFloat(issData.altitude),vel=parseFloat(issData.velocity);
      const lp=latLon(lat,lon,1+alt/6371);const ry2=earth.rotation.y,cos=Math.cos(ry2),sin=Math.sin(ry2);
      const wp=new THREE.Vector3(lp.x*cos+lp.z*sin,lp.y,-lp.x*sin+lp.z*cos);
      wp.applyQuaternion(new THREE.Quaternion().setFromEuler(pivot.rotation));
      issMesh.position.copy(wp);issGlow.position.copy(wp);
      issH.push(wp.clone());if(issH.length>180)issH.shift();
      const arr=orbGeo.attributes.position.array;for(let i=0;i<issH.length;i++){arr[i*3]=issH[i].x;arr[i*3+1]=issH[i].y;arr[i*3+2]=issH[i].z;}
      orbGeo.attributes.position.needsUpdate=true;orbGeo.setDrawRange(0,issH.length);
      if(ts-lH>1000){document.getElementById('ds-alt').textContent=alt.toFixed(0)+' km';}
    }
    if(ts-lH>1000){lH=ts;const now2=new Date();const h=String(now2.getUTCHours()).padStart(2,'0'),m=String(now2.getUTCMinutes()).padStart(2,'0'),s=String(now2.getUTCSeconds()).padStart(2,'0');document.getElementById('ds-utc').textContent=`${h}:${m}:${s}`;document.getElementById('ds-gmst').textContent=gmstHMS(gmst);document.getElementById('ds-tilt').textContent=obl.toFixed(3)+'°';}
    ctrl.update();renderer.render(scene,camera);}
  anim(performance.now());

