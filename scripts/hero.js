 let camZ = 100;          // start (minDistance)
const targetZ = 3;  

// https://dev.to/clementgaudiniere/create-a-parallax-effect-when-the-mouse-moves-3km0
// document.addEventListener("mousemove", parallax);
// function parallax(event) {
//   this.querySelectorAll(".hero-content").forEach((shift) => {
//     const position = shift.getAttribute("value");
//     const x = (window.innerWidth - event.pageX * position) / 90;
//     const y = (window.innerHeight - event.pageY * position) / 90;

//     shift.style.transform = `translateX(${x}px) translateY(${y}px)`;
//   });
// }



  // ── Cursor ──────────────────────────────────────────────
  const cur=document.getElementById('cur'),curR=document.getElementById('curR');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  (function mc(){requestAnimationFrame(mc);rx+=(mx-rx)*.6;ry+=(my-ry)*.6;cur.style.left=mx+'px';cur.style.top=my+'px';curR.style.left=rx+'px';curR.style.top=ry+'px';})();

const mouse = { x: 0, y: 0 };


window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

  // ── Scroll reveal ────────────────────────────────────────
  const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible');}),{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // ── Astronomy ────────────────────────────────────────────
  function getGMST(d){const JD=d.getTime()/86400000+2440587.5,T=(JD-2451545)/36525;let s=24110.54841+8640184.812866*T+0.093104*T*T-6.2e-6*T*T*T;const U=d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds()+d.getUTCMilliseconds()/1000;s=((s+U*1.00273790935)%86400+86400)%86400;return(s/86400)*2*Math.PI;}
  function getObl(d){const T=(d.getTime()/86400000+2440587.5-2451545)/36525;return 23.439291111-0.013004167*T-0.000000164*T*T+0.000000504*T*T*T;}
  function getSun(d){const JD=d.getTime()/86400000+2440587.5,n=JD-2451545,L=(280.46+0.9856474*n)%360,g=((357.528+0.9856003*n)%360)*Math.PI/180,λ=(L+1.915*Math.sin(g)+0.02*Math.sin(2*g))*Math.PI/180,ε=getObl(d)*Math.PI/180,dec=Math.asin(Math.sin(ε)*Math.sin(λ)),ra=Math.atan2(Math.cos(ε)*Math.sin(λ),Math.cos(λ)),g2=getGMST(d);return new THREE.Vector3(Math.cos(dec)*Math.cos(ra-g2),Math.sin(dec),Math.cos(dec)*Math.sin(ra-g2)).normalize();}


  // ── Three.js ─────────────────────────────────────────────
  const heroEl=document.getElementById('hero');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,heroEl.clientWidth/heroEl.clientHeight,0.01,2000); // further back = smaller globe
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

  window.addEventListener('resize',()=>{camera.aspect=heroEl.clientWidth/heroEl.clientHeight;camera.updateProjectionMatrix();renderer.setSize(heroEl.clientWidth,heroEl.clientHeight);});

  const TOFF=Math.PI,cDR=(2*Math.PI)/(10*24*3600);
  let cD=0,lT=performance.now(),lH=0;

  function anim(ts){
    camZ += (targetZ - camZ) * 0.04;

if (Math.abs(targetZ - camZ) < 0.0001) {
  ctrl.autoRotate = false;
  camZ = targetZ;
}

const parallaxStrength = 0.1;

// target offset
const targetX = mouse.x * parallaxStrength;
const targetY = mouse.y * parallaxStrength;

// smooth it
ctrl.target.x += (targetX - ctrl.target.x) * 0.05;
ctrl.target.y += (targetY - ctrl.target.y) * 0.05;



camera.position.z = camZ;

    requestAnimationFrame(anim);
    const now=new Date(),gmst=getGMST(now),obl=getObl(now);
    pivot.rotation.z=obl*Math.PI/180;
    earth.rotation.y=-(360-23.5);
    const sd=getSun(now);sunLight.position.copy(sd).multiplyScalar(50);
    [nO,term].forEach(m=>{if(m.material.userData.shader)m.material.userData.shader.uniforms.sunDir.value.copy(sd);});
    ctrl.update();renderer.render(scene,camera);
  
    
  }
    

  anim(performance.now());

