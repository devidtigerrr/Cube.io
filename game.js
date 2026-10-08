(function(){
var adminFlag=false;
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
const $=id=>document.getElementById(id);
let W,H,dpr;
function resize(){dpr=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize);resize();

const WORLD=5000,FOODN=900,BOTN=14,MAXC=16,MERGE=15,MINSPLIT=35,FOODRESP=9000,MATCH=240,RESULTS=12,PRIZES=[30,20,10],MINFINAL=100;
const CYCLE=(MATCH+RESULTS)*1000;
const hOf=m=>4*Math.sqrt(m);
const rnd=(a,b)=>a+Math.random()*(b-a);
const cheb=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const BOTNAMES=['Dice','Cutie','Block','Square','Brick','Cubert','Prism','Pixel','Lego','Boxy','Crate','Corner','Rubik','Tofu'];
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ---------- skins & shop (coins only) ----------
// $ = price. New skins are appended at the end so saved purchases keep working.
const SK=[
 {n:'Classic',$:0},
 {n:'Stripes',pt:'stripes',h:340,$:40},
 {n:'Checker',pt:'checker',h:215,$:40},
 {n:'Smiley',e:'😀',h:50,$:80},
 {n:'Frog',e:'🐸',h:105,$:100},
 {n:'Pizza',e:'🍕',h:38,$:150},
 {n:'Cat',e:'🐱',h:28,$:200},
 {n:'Ice',e:'❄️',h:190,$:300},
 {n:'Fire',e:'🔥',h:8,$:450},
 {n:'Robot',e:'🤖',h:210,$:600},
 {n:'Alien',e:'👾',h:130,$:800},
 {n:'Panda',e:'🐼',gray:1,h:0,$:1200},
 {n:'Star',e:'⭐',h:48,$:1800},
 {n:'Unicorn',e:'🦄',h:300,fx:'rainbow',$:3000},
 {n:'Crown',e:'👑',h:46,fx:'gold',$:6000},
 // --- new ---
 {n:'Dots',pt:'dots',h:160,$:50},
 {n:'Plaid',pt:'plaid',h:10,$:60},
 {n:'Cookie',e:'🍪',h:30,$:90},
 {n:'Duck',e:'🦆',h:52,$:120},
 {n:'Burger',e:'🍔',h:25,$:140},
 {n:'Dog',e:'🐶',h:35,$:220},
 {n:'Penguin',e:'🐧',h:215,$:260},
 {n:'Ghost',e:'👻',gray:1,h:0,$:350},
 {n:'Pumpkin',e:'🎃',h:28,$:500},
 {n:'Skull',e:'💀',gray:1,h:0,$:700},
 {n:'Rocket',e:'🚀',h:0,$:900},
 {n:'Octopus',e:'🐙',h:330,$:1500},
 {n:'Dragon',e:'🐉',h:12,fx:'fire',$:2200},
 {n:'Galaxy',e:'🌌',h:260,fx:'galaxy',$:3500},
 {n:'Diamond',e:'💎',h:190,fx:'diamond',$:4500},
 {n:'Prism',e:'🌈',h:0,fx:'prism',$:10000}
];
const TIERS=[{n:'Free',c:'#8c97a3'},{n:'Common',c:'#5fae5f'},{n:'Rare',c:'#4a8bff'},{n:'Epic',c:'#a05cff'},{n:'Legendary',c:'#ff9a1f'},{n:'Mythic',c:'#e0a000'}];
const tierOf=p=>p<=0?TIERS[0]:p<100?TIERS[1]:p<400?TIERS[2]:p<1000?TIERS[3]:p<5000?TIERS[4]:TIERS[5];
const SHINE={gold:'#fff2a8',diamond:'#d6f8ff',prism:'#ffffff'};

let save={c:0,o:[0],k:0,n:''};
try{
  const s=JSON.parse(localStorage.getItem('kocka2')||'null');
  if(s){
    if(Number.isFinite(s.c)&&s.c>=0)save.c=Math.floor(s.c);
    if(Array.isArray(s.o))save.o=[...new Set([0,...s.o.filter(i=>Number.isInteger(i)&&i>=0&&i<SK.length)])];
    if(Number.isInteger(s.k)&&save.o.includes(s.k))save.k=s.k;
    if(typeof s.n==='string')save.n=s.n.slice(0,14);
  }
}catch(e){}
function persist(){try{localStorage.setItem('kocka2',JSON.stringify(save))}catch(e){}}
const owned=i=>save.o.includes(i);
if(save.n)$('nm').value=save.n;

function pickBg(s){
  const h=s.h||0;
  if(s.fx==='gold')return 'linear-gradient(135deg,#fff3a6,#ffd23d,#e0a000)';
  if(s.fx==='rainbow')return 'linear-gradient(135deg,#ff7ad9,#8f7bff,#4fe3ff)';
  if(s.fx==='prism')return 'linear-gradient(135deg,#ff6b6b,#ffd23d,#52e08a,#4fb3ff,#b46bff)';
  if(s.fx==='diamond')return 'linear-gradient(135deg,#f0feff,#7fe3ff,#35b8e8)';
  if(s.fx==='galaxy')return 'radial-gradient(circle at 30% 30%,#7b4dff,#1a0f4d)';
  if(s.fx==='fire')return 'linear-gradient(135deg,#ffd23d,#ff6a1a,#d62a00)';
  if(s.gray)return s.n==='Skull'?'linear-gradient(135deg,#9aa4af,#4a525c)':'#dfe5ea';
  if(s.h===undefined)return 'linear-gradient(135deg,#ff5a5a,#ffd23d,#52c25a,#4a7dff)';
  if(s.pt==='stripes')return 'repeating-linear-gradient(135deg,hsl('+h+',85%,60%) 0 7px,hsl('+h+',85%,78%) 7px 14px)';
  if(s.pt==='checker')return 'conic-gradient(hsl('+h+',80%,55%) 25%,hsl('+h+',80%,75%) 0 50%,hsl('+h+',80%,55%) 0 75%,hsl('+h+',80%,75%) 0)';
  if(s.pt==='dots')return 'radial-gradient(circle,rgba(255,255,255,.85) 22%,transparent 24%) 0 0/10px 10px,hsl('+h+',70%,52%)';
  if(s.pt==='plaid')return 'repeating-linear-gradient(0deg,rgba(255,255,255,.35) 0 6px,transparent 6px 12px),repeating-linear-gradient(90deg,rgba(255,255,255,.35) 0 6px,transparent 6px 12px),hsl('+h+',75%,55%)';
  return 'linear-gradient(135deg,hsl('+h+',90%,68%),hsl('+h+',80%,52%))';
}
let viewing=save.k;
const cellEls=[];
const order=[...SK.keys()].sort((a,b)=>SK[a].$-SK[b].$||a-b);
for(const i of order){
  const s=SK[i];
  const b=document.createElement('button');b.type='button';b.className='sk';
  b.style.background=pickBg(s);b.style.borderColor=tierOf(s.$).c;b.title=s.n;
  const ic=document.createElement('i');ic.textContent=s.e||(s.pt?'':'?');
  const pr=document.createElement('small');
  b.append(ic,pr);b.onclick=()=>{viewing=i;if(owned(i)){save.k=i;persist()}refresh()};
  $('skins').appendChild(b);cellEls[i]={b,pr};
}
function refresh(){
  $('wallet').textContent=adminFlag?'🪙 ∞ (admin)':'🪙 '+save.c;
  SK.forEach((s,i)=>{
    const {b,pr}=cellEls[i],o=owned(i);
    b.classList.toggle('lock',!o);b.classList.toggle('on',o&&save.k===i);b.classList.toggle('view',viewing===i);
    pr.textContent=o?(save.k===i?'✓':''):'🪙'+s.$;
  });
  const s=SK[viewing],t=tierOf(s.$);
  const info=$('skinfo');info.textContent=s.n;
  const tg=document.createElement('em');tg.textContent=t.n;tg.style.background=t.c;info.appendChild(tg);
  const buy=$('buy');
  if(owned(viewing)){buy.classList.add('hide')}
  else{
    buy.classList.remove('hide');
    const can=save.c>=s.$;
    buy.disabled=!can;
    buy.textContent=can?'Buy '+s.n+' for 🪙 '+s.$:'Need 🪙 '+(s.$-save.c)+' more for '+s.n;
  }
}
$('buy').onclick=()=>{
  const s=SK[viewing];
  if(owned(viewing)||save.c<s.$)return;
  save.c-=s.$;save.o.push(viewing);save.k=viewing;persist();refresh();
};
refresh();

function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2400)}

let me={cells:[],hue:200,name:'',l:0,k:0};
let playing=false,peak=0,kills=0,curMatch=-1,inResults=false,mouse={x:0,y:0},cam={x:WORLD/2,y:WORLD/2,z:1};
let food=[],bots=[],pellets=[],viruses=[],eaten=new Map(),smooth=new Map();
let room=null,botsOn=true,aloneT=0,lastW=0,pid=0;
const myId=Math.random().toString(36).slice(2,8);
const total=()=>me.cells.reduce((s,c)=>s+c.m,0);
function buildBoard(rs){
  const board=[];
  if(botsOn)for(const b of bots)board.push({name:b.name,m:b.m});
  for(const p of rs)board.push({name:p.name,m:p.total});
  if(playing)board.push({name:me.name,m:total(),me:true});
  board.sort((a,b)=>b.m-a.m);
  return board;
}
// ---------- matches: everyone shares the same wall-clock schedule ----------
function newMatch(){
  inResults=false;$('results').classList.add('hide');
  for(const f of food){f.alive=true;f.respawn=0}
  for(const v of viruses)v.cd=0;
  pellets=[];eaten.clear();
  for(const b of bots)spawnBot(b);
  if(playing){
    const x=rnd(300,WORLD-300),y=rnd(300,WORLD-300);
    me.cells=[{x,y,m:10,vx:0,vy:0,mt:0}];peak=10;kills=0;me.l++;
    cam.x=x;cam.y=y;
  }
}
function endMatch(rs){
  inResults=true;
  const board=buildBoard(rs),top=board.slice(0,3);
  let note='';
  const idx=board.findIndex(c=>c.me);
  if(playing&&idx>=0&&idx<3&&board[idx].m>=MINFINAL){
    const prize=PRIZES[idx];
    save.c+=prize;persist();refresh();
    note='You finished #'+(idx+1)+' and won 🪙 '+prize+'!';
    toast('🏆 +'+prize+' 🪙');
  }else if(playing){
    note=idx>=0&&idx<3?'You need at least '+MINFINAL+' mass to win coins.':'Not in the top 3 this time. Next match starts soon!';
  }
  const r=$('results');r.textContent='';
  const h=document.createElement('div');h.style.cssText='font-size:24px;font-weight:800;margin-bottom:8px';h.textContent='🏁 Match over!';r.appendChild(h);
  const medals=['🥇','🥈','🥉'];
  top.forEach((c,i)=>{
    const row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;gap:20px;padding:2px 0;'+(c.me?'color:#ffd86b;font-weight:700':'');
    const a=document.createElement('span');a.textContent=medals[i]+' '+c.name;
    const b=document.createElement('span');b.textContent=Math.round(c.m)+'  (🪙 '+PRIZES[i]+')';
    row.append(a,b);r.appendChild(row);
  });
  if(note){const n=document.createElement('div');n.style.marginTop='10px';n.textContent=note;r.appendChild(n)}
  if(top.length)r.classList.remove('hide');
}
let lastTimer='';
function matchTick(rs){
  const t=Date.now(),id=Math.floor(t/CYCLE),ph=(t%CYCLE)/1000,res=ph>=MATCH;
  if(id!==curMatch){curMatch=id;newMatch()}
  if(res&&!inResults)endMatch(rs);
  const left=Math.ceil(res?MATCH+RESULTS-ph:MATCH-ph);
  const txt=res?'🏁 Next match in '+left+'s':'⏱ '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0');
  if(txt!==lastTimer){lastTimer=txt;$('timer').textContent=txt}
  return !res;
}

// ---------- admin & bans ----------
// Admin = whoever can edit this artifact (the owner shows up as TigerD). Bans live in the shared db,
// only editors can write them, everyone reads them: honest clients hide and ignore banned accounts.
let user=null,db=null,uid=null,isAdmin=false,adminName='TigerD',banned=false,bans=new Map(),adminNames=new Map();
const norm=x=>String(x).toLowerCase().replace(/[^a-z0-9]/g,'');
const reserved=x=>{const n=norm(x);return n.includes('tigerd')||n.startsWith('admin')||n==='mod'||n==='moderator'};
function updateGo(){const g=$('go');g.disabled=banned;g.style.opacity=banned?.55:1;g.textContent=banned?'Banned':(me.l?'Play again':'Play')}
function checkBan(){
  const was=banned;banned=!!(uid&&bans.has(uid)&&!isAdmin);
  if(banned&&playing){
    playing=false;me.cells=[];
    if(room)room.presence({d:1}).catch(()=>{});
    $('menu').classList.remove('hide');['lb','score','bs','bw'].forEach(i=>$(i).classList.add('hide'));
  }
  if(banned)$('msg').textContent='You have been banned from cube.io by the admin.';
  else if(was)$('msg').textContent='Your ban was lifted. Play fair!';
  updateGo();
}
function banPlayer(id,name){
  if(!db||!id||id===uid)return;
  db.collection('bans').doc(id).set({n:String(name).slice(0,16),t:Date.now()}).then(()=>toast('Banned '+name)).catch(()=>toast('Ban failed (no permission?)'));
}
function unban(id){if(db)db.collection('bans').doc(id).delete().catch(()=>toast('Unban failed'))}
function renderBans(){
  if(!isAdmin)return;
  const bl=$('blist');bl.textContent='';
  if(!bans.size){const e=document.createElement('div');e.style.color='#9aa6c0';e.textContent='Nobody banned.';bl.appendChild(e);return}
  for(const [id,d] of bans){
    const r=document.createElement('div');r.className='arow';
    const n=document.createElement('span');n.className='nm';n.textContent=(d&&d.n)||'Player';
    const b=document.createElement('button');b.className='ub';b.textContent='Unban';b.onclick=()=>unban(id);
    r.append(n,b);bl.appendChild(r);
  }
}
const arows=new Map();
function adminTick(rs){
  if(!isAdmin||$('apanel').classList.contains('hide'))return;
  const seen=new Set(),al=$('alist');
  for(const p of rs){
    seen.add(p.peer);
    let r=arows.get(p.peer);
    if(!r){
      const el=document.createElement('div');el.className='arow';
      const n=document.createElement('span');n.className='nm';
      const m=document.createElement('span');m.className='ms';
      const b=document.createElement('button');
      r={el,n,m,b,p,armed:false};
      b.onclick=()=>{
        if(!r.p.by||r.p.admin)return;
        if(!r.armed){r.armed=true;b.textContent='Sure?';setTimeout(()=>{r.armed=false;b.textContent='Ban'},3000)}
        else{banPlayer(r.p.by,r.p.name);r.armed=false;b.textContent='Ban'}
      };
      el.append(n,m,b);al.appendChild(el);arows.set(p.peer,r);
    }
    r.p=p;
    r.n.textContent=(p.sus?'⚠️ ':'')+p.name;
    r.n.title=p.sus?'Moved faster than possible recently - possible speed hack':'';
    r.m.textContent=Math.round(p.total);
    r.b.disabled=!p.by||p.admin;
    if(!r.armed)r.b.textContent=p.admin?'Admin':!p.by?'No ID':'Ban';
  }
  for(const [k,r] of arows)if(!seen.has(k)){r.el.remove();arows.delete(k)}
  $('acount').textContent='('+rs.length+')';
}
$('abtn').onclick=()=>{$('apanel').classList.toggle('hide');renderBans()};
(async()=>{
  try{
    if(!window.claude||!claude.use)return;
    user=await claude.use('user');db=await claude.use('db');
    if(user){
      uid=await user.id();
      isAdmin=!!(await user.canEdit());
      adminName=(await user.isOwner())?'TigerD':'Mod';
    }
    if(db){
      db.collection('admins').onSnapshot(sn=>{adminNames=new Map(sn.docs.map(d=>[d.id,String((d.data()||{}).n||'Admin').slice(0,10)]))},()=>{});
      db.collection('bans').onSnapshot(sn=>{bans=new Map(sn.docs.map(d=>[d.id,d.data()||{}]));renderBans();checkBan()},()=>{});
      if(isAdmin&&uid)db.collection('admins').doc(uid).set({n:adminName,t:Date.now()}).catch(()=>{});
    }
    if(isAdmin){
      adminFlag=true;save.o=SK.map((_,i)=>i);persist();refresh();
      $('abtn').classList.remove('hide');
      $('nm').value=adminName;$('nm').disabled=true;
      renderBans();
    }
  }catch(e){}
})();

// shared world: same seed -> same food and virus positions for everyone
const fr=mulberry(777);
for(let i=0;i<FOODN;i++)food.push({x:40+fr()*(WORLD-80),y:40+fr()*(WORLD-80),hue:Math.floor(fr()*360),alive:true,respawn:0});
const vr=mulberry(20240607);
for(let i=0;i<18;i++)viruses.push({x:300+vr()*(WORLD-600),y:300+vr()*(WORLD-600),m:100,cd:0});
function spawnBot(b){b.x=rnd(100,WORLD-100);b.y=rnd(100,WORLD-100);b.m=rnd(12,60);
  b.sk=SK[Math.floor(rnd(0,SK.length))];b.hue=b.sk.h!==undefined?b.sk.h:Math.floor(rnd(0,360));
  b.name=b.name||BOTNAMES[Math.floor(rnd(0,BOTNAMES.length))];b.tx=b.x;b.ty=b.y;b.t=0;return b}
for(let i=0;i<BOTN;i++)bots.push(spawnBot({name:BOTNAMES[i%BOTNAMES.length]}));

// ---------- multiplayer ----------
let outbox={f:[],p:[],v:[],j:[]},lastSend=0;
function eatFood(i){const f=food[i];f.alive=false;f.respawn=performance.now()+FOODRESP;outbox.f.push(i)}
function flush(now){
  if(!room||now-lastSend<120)return;
  const o=outbox;if(!(o.f.length||o.p.length||o.v.length||o.j.length))return;
  lastSend=now;outbox={f:[],p:[],v:[],j:[]};
  room.emit('sync',{f:o.f.slice(0,200),p:o.p.slice(0,40),v:o.v.slice(0,18),j:o.j.slice(0,30)}).catch(()=>{});
}
function onSync(m){
  if(m.isMe)return;
  if(m.by&&bans.has(m.by))return;
  const d=m.data;if(!d||typeof d!=='object')return;
  const now=performance.now();
  if(Array.isArray(d.f))for(const i of d.f)if(Number.isInteger(i)&&food[i]){food[i].alive=false;food[i].respawn=now+FOODRESP}
  if(Array.isArray(d.p)&&d.p.length){const s=new Set(d.p);pellets=pellets.filter(p=>!s.has(p.id))}
  if(Array.isArray(d.v))for(const i of d.v)if(Number.isInteger(i)&&viruses[i])viruses[i].cd=5;
  if(Array.isArray(d.j))for(const a of d.j){
    if(!Array.isArray(a)||a.length<6||pellets.length>240)continue;
    const [id,x,y,vx,vy,h]=a;
    if(typeof id!=='string'||![x,y,vx,vy,h].every(isFinite))continue;
    pellets.push({id:id.slice(0,16),x:+x,y:+y,vx:+vx,vy:+vy,hue:+h,age:0});
  }
}
if(window.claude&&claude.use){
  claude.use('room').then(r=>{if(!r)return;room=r;r.on('sync',onSync);$('net').classList.remove('hide')}).catch(()=>{});
}
function remotes(dt){
  const out=[];if(!room)return out;
  const seen=new Set();
  for(const p of room.peers()){
    if(p.isMe)continue;
    const d=p.presence;
    if(!d||d.d||!Array.isArray(d.c))continue;
    if(p.by&&bans.has(p.by))continue;
    const tc=d.c.slice(0,MAXC).filter(a=>Array.isArray(a)&&isFinite(a[0])&&isFinite(a[1])&&isFinite(a[2])&&a[2]>0).map(a=>({x:+a[0],y:+a[1],m:Math.min(+a[2],1e6)}));
    if(!tc.length)continue;
    seen.add(p.peer);
    let s=smooth.get(p.peer);
    if(!s){s={peer:p.peer,cells:[]};smooth.set(p.peer,s)}
    s.tc=tc;
    if(s.cells.length!==tc.length)s.cells=tc.map(a=>({x:a.x,y:a.y,m:a.m}));
    else{const k=1-Math.pow(.001,dt||.016);s.cells.forEach((c,i)=>{c.m=tc[i].m;c.x+=(tc[i].x-c.x)*k;c.y+=(tc[i].y-c.y)*k})}
    s.hue=+d.u||0;s.l=d.l||0;s.by=p.by;
    const an=p.by?adminNames.get(p.by):null;s.admin=!!an;
    const rawn=String(d.n||'Player').slice(0,16);
    s.name=an?'🛡️ '+an:(reserved(rawn.replace('🛡️',''))||rawn.includes('🛡️')?'Player':rawn);
    s.sk=SK[Number.isInteger(d.k)&&d.k>=0&&d.k<SK.length?d.k:0];
    s.total=tc.reduce((a,c)=>a+c.m,0);
    const tn=performance.now();
    if(tc.length===1&&s.pc===1&&s.pl===s.l&&s.px!==undefined&&(tc[0].x!==s.px||tc[0].y!==s.py)){
      const dts=(tn-s.pt)/1000;
      if(dts>.05&&Math.hypot(tc[0].x-s.px,tc[0].y-s.py)/dts>1100)s.susT=tn;
    }
    if(s.px===undefined||tc[0].x!==s.px||tc[0].y!==s.py){s.px=tc[0].x;s.py=tc[0].y;s.pt=tn}
    s.pl=s.l;s.pc=tc.length;s.sus=!!(s.susT&&tn-s.susT<30000);
    out.push(s);
  }
  for(const k of smooth.keys())if(!seen.has(k))smooth.delete(k);
  return out;
}

// ---------- input ----------
addEventListener('pointermove',e=>{if(e.target.closest&&e.target.closest('.noctl'))return;mouse.x=e.clientX;mouse.y=e.clientY});
addEventListener('pointerdown',e=>{if(e.target.closest&&(e.target.closest('.btn')||e.target.closest('.noctl')))return;mouse.x=e.clientX;mouse.y=e.clientY});
function mouseWorld(){return{x:cam.x+(mouse.x-W/2)/cam.z,y:cam.y+(mouse.y-H/2)/cam.z}}
function split(){
  if(!playing)return;
  const mw=mouseWorld();
  for(const c of me.cells.slice()){
    if(me.cells.length>=MAXC)break;
    if(c.m<MINSPLIT)continue;
    let dx=mw.x-c.x,dy=mw.y-c.y,d=Math.hypot(dx,dy);if(d<1){dx=1;dy=0;d=1}
    c.m/=2;c.mt=MERGE;
    me.cells.push({x:c.x,y:c.y,m:c.m,vx:dx/d*780,vy:dy/d*780,mt:MERGE});
  }
}
function eject(){
  if(!playing)return;
  const mw=mouseWorld();
  for(const c of me.cells){
    if(c.m<MINSPLIT)continue;
    let dx=mw.x-c.x,dy=mw.y-c.y,d=Math.hypot(dx,dy);if(d<1){dx=1;dy=0;d=1}
    c.m-=16;
    const h=hOf(c.m),p={id:myId+(pid++),x:c.x+dx/d*h,y:c.y+dy/d*h,vx:dx/d*650,vy:dy/d*650,hue:me.hue,age:0};
    pellets.push(p);
    outbox.j.push([p.id,Math.round(p.x),Math.round(p.y),650*dx/d|0,650*dy/d|0,me.hue]);
  }
}
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  if(e.code==='Space'){e.preventDefault();if(!e.repeat)split()}
  else if(e.key==='w'||e.key==='W'){e.preventDefault();const n=performance.now();if(n-lastW>90){lastW=n;eject()}}
});
$('bs').addEventListener('pointerdown',e=>{e.preventDefault();split()});
$('bw').addEventListener('pointerdown',e=>{e.preventDefault();eject()});

function start(){
  if(banned)return;
  const typed=$('nm').value.trim();
  if(!isAdmin&&(reserved(typed)||typed.includes('🛡️'))){toast('That name is reserved');return}
  me.name=isAdmin?'🛡️ '+adminName:(typed||'Anonymous').slice(0,14);
  if(!isAdmin){save.n=typed.slice(0,14);persist()}
  me.k=owned(save.k)?save.k:0;const s=SK[me.k];
  me.hue=s.h!==undefined?s.h:Math.floor(rnd(0,360));
  me.l++;peak=10;kills=0;
  const x=rnd(300,WORLD-300),y=rnd(300,WORLD-300);
  me.cells=[{x,y,m:10,vx:0,vy:0,mt:0}];
  cam.x=x;cam.y=y;mouse.x=W/2;mouse.y=H/2;
  playing=true;
  $('menu').classList.add('hide');
  ['lb','score','bs','bw'].forEach(i=>$(i).classList.remove('hide'));
}
$('go').onclick=start;
$('nm').addEventListener('keydown',e=>{if(e.key==='Enter')start()});
function die(by){
  playing=false;me.cells=[];
  $('msg').textContent='Eaten by '+by+'. Peak mass: '+Math.round(peak)+'. Jump back in - coins go to the top 3 at the end of the match!';
  updateGo();
  viewing=save.k;refresh();
  $('menu').classList.remove('hide');
  ['lb','score','bs','bw'].forEach(i=>$(i).classList.add('hide'));
  if(room)room.presence({d:1}).catch(()=>{});
}

// ---------- drawing ----------
const STARS=[[-.6,-.5],[.3,-.7],[.65,.1],[-.2,.35],[.5,.6],[-.7,.4],[.05,-.1],[.7,-.5]];
function hueFor(sk,base,t){
  const fx=sk&&sk.fx;
  if(fx==='rainbow'||fx==='prism')return (t/12)%360;
  if(fx==='fire')return 14+22*Math.sin(t/170);
  return base;
}
function cube(x,y,h,hue,shadow,sk){
  const d=h*.32,r=h*.3,gray=sk&&sk.gray,fx=sk&&sk.fx,galaxy=fx==='galaxy';
  const t=fx?performance.now():0;
  if(shadow){ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.roundRect(x-h+d*.5,y-h+d*1.5,2*h,2*h,r);ctx.fill()}
  ctx.fillStyle=galaxy?'hsl(255,60%,10%)':gray?'#8f9aa6':'hsl('+hue+',65%,34%)';
  ctx.beginPath();ctx.roundRect(x-h,y-h+d,2*h,2*h,r);ctx.fill();
  const g=ctx.createLinearGradient(x-h,y-h,x+h,y+h);
  if(galaxy){g.addColorStop(0,'hsl(262,65%,40%)');g.addColorStop(1,'hsl(250,70%,13%)')}
  else if(gray){
    if(sk.n==='Skull'){g.addColorStop(0,'#aab3bd');g.addColorStop(1,'#4d555f')}
    else{g.addColorStop(0,'#ffffff');g.addColorStop(1,'#cbd3db')}
  }else{g.addColorStop(0,'hsl('+hue+',95%,66%)');g.addColorStop(1,'hsl('+hue+',85%,52%)')}
  ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x-h,y-h,2*h,2*h,r);ctx.fill();
  if(sk&&sk.pt){
    ctx.save();ctx.beginPath();ctx.roundRect(x-h,y-h,2*h,2*h,r);ctx.clip();
    if(sk.pt==='stripes'){
      ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=h*.26;ctx.beginPath();
      for(let k=-5;k<=5;k++){ctx.moveTo(x+k*h*.55-h*1.5,y+h*1.5);ctx.lineTo(x+k*h*.55+h*1.5,y-h*1.5)}
      ctx.stroke();
    }else if(sk.pt==='checker'){
      ctx.fillStyle='rgba(255,255,255,.45)';const c4=h/2;
      for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)ctx.fillRect(x-h+i*c4,y-h+j*c4,c4,c4);
    }else if(sk.pt==='dots'){
      ctx.fillStyle='rgba(255,255,255,.7)';
      for(let i=0;i<4;i++)for(let j=0;j<4;j++){ctx.beginPath();ctx.arc(x-h*.75+i*h*.5,y-h*.75+j*h*.5,h*.12,0,6.3);ctx.fill()}
    }else if(sk.pt==='plaid'){
      ctx.fillStyle='rgba(255,255,255,.3)';
      for(let i=0;i<3;i++){ctx.fillRect(x-h+i*h*.7,y-h,h*.28,2*h);ctx.fillRect(x-h,y-h+i*h*.7,2*h,h*.28)}
    }
    ctx.restore();
  }
  if(galaxy){
    ctx.save();ctx.beginPath();ctx.roundRect(x-h,y-h,2*h,2*h,r);ctx.clip();
    STARS.forEach((s,i)=>{ctx.globalAlpha=.35+.65*Math.abs(Math.sin(t/320+i*2.1));ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+s[0]*h,y+s[1]*h,h*.07,0,6.3);ctx.fill()});
    ctx.restore();
  }
  if(fx==='gold'||fx==='diamond'||fx==='prism'){
    ctx.save();ctx.beginPath();ctx.roundRect(x-h,y-h,2*h,2*h,r);ctx.clip();
    const tt=(t/(fx==='diamond'?1500:1100))%1,sx=x-h*1.6+tt*h*3.2;
    const sg=ctx.createLinearGradient(sx-h*.6,y-h,sx+h*.6,y+h);
    sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.75)');sg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=sg;ctx.fillRect(x-h,y-h,2*h,2*h);ctx.restore();
  }
  ctx.strokeStyle=galaxy?'hsl(265,70%,62%)':gray?'#6f7b88':'hsl('+hue+',70%,40%)';ctx.lineWidth=Math.max(1,h*.09);
  ctx.beginPath();ctx.roundRect(x-h,y-h,2*h,2*h,r);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=Math.max(1,h*.06);
  ctx.beginPath();ctx.roundRect(x-h*.78,y-h*.78,1.56*h,1.56*h,r*.7);ctx.stroke();
  if(SHINE[fx]){ctx.strokeStyle=SHINE[fx];ctx.lineWidth=Math.max(1.5,h*.05);ctx.beginPath();ctx.roundRect(x-h*1.05,y-h*1.05,2.1*h,2.1*h,r*1.1);ctx.stroke()}
  if(sk&&sk.e){
    ctx.font=(h*1.05)+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#000';
    ctx.fillText(sk.e,x,y-h*.14);
  }
}
function virusDraw(x,y,h){
  ctx.fillStyle='hsl(125,70%,30%)';ctx.beginPath();
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2,r=i%2?h*1.02:h*1.5;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r+h*.2)}
  ctx.closePath();ctx.fill();
  cube(x,y,h*.95,115,true,null);
}
function label(x,y,h,name,low){
  const fs=low?Math.max(10,Math.min(h*.36,26)):Math.max(11,Math.min(h*.5,40));
  const ly=low?y+h*.62:y-h*.05;
  ctx.font='700 '+fs+'px "Ubuntu","Segoe UI",system-ui,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.lineJoin='round';ctx.lineWidth=fs*.2;ctx.strokeStyle='rgba(0,0,0,.65)';ctx.strokeText(name,x,ly);
  ctx.fillStyle='#fff';ctx.fillText(name,x,ly);
}

// ---------- update ----------
function update(dt){
  const rs=remotes(dt),now=performance.now();
  if(rs.length===0)aloneT+=dt;else aloneT=0;
  const want=!room||aloneT>4;
  if(want&&!botsOn)for(const b of bots)spawnBot(b);
  botsOn=want;
  const live=matchTick(rs);

  for(const f of food)if(!f.alive&&now>f.respawn)f.alive=true;
  for(const p of pellets){p.x+=p.vx*dt;p.y+=p.vy*dt;const dc=Math.exp(-5*dt);p.vx*=dc;p.vy*=dc;p.age+=dt;
    p.x=Math.max(8,Math.min(WORLD-8,p.x));p.y=Math.max(8,Math.min(WORLD-8,p.y))}
  const still=p=>p.age>.35;

  if(playing&&live){
    const dxs=mouse.x-W/2,dys=mouse.y-H/2,f=Math.min(1,Math.hypot(dxs,dys)/90),mw=mouseWorld();
    for(const c of me.cells){
      const dx=mw.x-c.x,dy=mw.y-c.y,d=Math.hypot(dx,dy),spd=480/Math.pow(c.m,.28)*f;
      if(d>1){c.x+=dx/d*spd*dt;c.y+=dy/d*spd*dt}
      c.x+=c.vx*dt;c.y+=c.vy*dt;const dc=Math.exp(-4*dt);c.vx*=dc;c.vy*=dc;
      c.mt-=dt;
      if(c.m>10)c.m-=c.m*.003*dt;
      const h=hOf(c.m);c.x=Math.max(h,Math.min(WORLD-h,c.x));c.y=Math.max(h,Math.min(WORLD-h,c.y));
    }
    const cs=me.cells;
    for(let i=0;i<cs.length;i++){const a=cs[i];if(a.dead)continue;
      for(let j=i+1;j<cs.length;j++){const b=cs[j];if(b.dead)continue;
        const dx=b.x-a.x,dy=b.y-a.y,ax=Math.abs(dx),ay=Math.abs(dy),ha=hOf(a.m),hb=hOf(b.m);
        if(a.mt<=0&&b.mt<=0){
          if(Math.max(ax,ay)<Math.max(ha,hb)*.7){a.m+=b.m;b.dead=true}
        }else{
          const pen=ha+hb-Math.max(ax,ay);
          if(pen>0){
            if(ax>ay){const s=dx>=0?1:-1;a.x-=s*pen/2;b.x+=s*pen/2}
            else{const s=dy>=0?1:-1;a.y-=s*pen/2;b.y+=s*pen/2}
          }
        }
      }
    }
    me.cells=me.cells.filter(c=>!c.dead);
    let killer=null;
    for(const c of me.cells){
      const hc=hOf(c.m);
      for(let i=0;i<food.length;i++){const fd=food[i];
        if(fd.alive&&Math.abs(fd.x-c.x)<hc&&Math.abs(fd.y-c.y)<hc){c.m+=1;eatFood(i)}}
      for(let i=pellets.length-1;i>=0;i--){const p=pellets[i];
        if(still(p)&&Math.abs(p.x-c.x)<hc&&Math.abs(p.y-c.y)<hc){c.m+=12;outbox.p.push(p.id);pellets.splice(i,1)}}
      if(c.m>=130&&me.cells.length<MAXC){
        for(let vi=0;vi<viruses.length;vi++){
          const v=viruses[vi];
          if(v.cd<=0&&cheb(c,v)<hc-.3*hOf(v.m)){
            v.cd=5;outbox.v.push(vi);
            const n=Math.min(MAXC-me.cells.length,7);
            if(n<1)break;
            const piece=c.m/(n+1);c.m=piece;c.mt=MERGE;
            for(let k=0;k<n;k++){const a=k/n*Math.PI*2+rnd(0,.5);
              me.cells.push({x:c.x,y:c.y,m:piece,vx:Math.cos(a)*620,vy:Math.sin(a)*620,mt:MERGE+rnd(0,3)})}
            break;
          }
        }
      }
      for(const p of rs){
        for(let i=0;i<p.cells.length;i++){
          const rc=p.cells[i],hp=hOf(rc.m);
          if(rc.m<c.m*.8&&cheb(c,rc)<hc-.3*hp){
            const key=p.peer+':'+p.l+':'+i;
            if(!(eaten.get(key)>now)){eaten.set(key,now+1500);c.m+=rc.m;kills++}
          }else if(rc.m>c.m*1.25&&cheb(c,rc)<hp-.3*hc){c.dead=true;killer=p.name}
        }
      }
      if(botsOn)for(const b of bots){
        const hb=hOf(b.m);
        if(b.m<c.m*.8&&cheb(c,b)<hc-.3*hb){c.m+=b.m;kills++;spawnBot(b)}
        else if(b.m>c.m*1.25&&cheb(c,b)<hb-.3*hc){c.dead=true;killer=b.name}
      }
    }
    me.cells=me.cells.filter(c=>!c.dead);
    peak=Math.max(peak,total());
    if(!me.cells.length){flush(now+1000);die(killer||'someone');return rs}
    if(room)room.presence({c:me.cells.map(c=>[Math.round(c.x),Math.round(c.y),Math.round(c.m)]),n:me.name,u:me.hue,k:me.k,l:me.l,d:null}).catch(()=>{});
  }
  for(const v of viruses)if(v.cd>0)v.cd-=dt;
  flush(now);

  if(botsOn&&live){
    const shared=[];for(const p of rs)for(const c of p.cells)shared.push(c);
    if(playing)for(const c of me.cells)shared.push(c);
    for(const b of bots){
      b.t-=dt;
      if(b.t<=0){
        b.t=rnd(.3,.7);
        let best=null,bd=450,fear=null,fd=520;
        for(const o of bots.concat(shared)){
          if(o===b)continue;
          const d=Math.hypot(o.x-b.x,o.y-b.y);
          if(o.m>b.m*1.25&&d<fd){fd=d;fear=o}
          else if(o.m<b.m*.8&&d<bd){bd=d;best=o}
        }
        if(fear){b.tx=b.x-(fear.x-b.x);b.ty=b.y-(fear.y-b.y)}
        else if(best){b.tx=best.x;b.ty=best.y}
        else{
          let nf=null,nd=1e9;
          for(const f of food){if(!f.alive)continue;const d=Math.abs(f.x-b.x)+Math.abs(f.y-b.y);if(d<nd){nd=d;nf=f}}
          if(nf){b.tx=nf.x;b.ty=nf.y}
        }
      }
      const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy)||1,sp=440/Math.pow(b.m,.28)*.85;
      b.x+=dx/d*sp*dt;b.y+=dy/d*sp*dt;
      const hb=hOf(b.m);
      b.x=Math.max(hb,Math.min(WORLD-hb,b.x));b.y=Math.max(hb,Math.min(WORLD-hb,b.y));
      for(const f of food)if(f.alive&&Math.abs(f.x-b.x)<hb&&Math.abs(f.y-b.y)<hb){b.m+=1;f.alive=false;f.respawn=now+FOODRESP}
      for(let i=pellets.length-1;i>=0;i--){const p=pellets[i];if(still(p)&&Math.abs(p.x-b.x)<hb&&Math.abs(p.y-b.y)<hb){b.m+=12;pellets.splice(i,1)}}
      if(b.m>10)b.m-=b.m*.003*dt;
      for(const o of bots)if(o!==b&&o.m<b.m*.8&&cheb(b,o)<hb-.3*hOf(o.m)){b.m+=o.m;spawnBot(o)}
    }
  }
  if(pellets.length>240)pellets.splice(0,pellets.length-240);
  return rs;
}

// ---------- render ----------
function render(rs){
  const tm=total()||20;
  const target=1.15/(1+hOf(tm)/70);
  cam.z+=(target-cam.z)*.06;
  if(playing&&me.cells.length){
    let sx=0,sy=0,sm=0;for(const c of me.cells){sx+=c.x*c.m;sy+=c.y*c.m;sm+=c.m}
    cam.x+=(sx/sm-cam.x)*.18;cam.y+=(sy/sm-cam.y)*.18;
  }
  ctx.fillStyle='#dfe6ec';ctx.fillRect(0,0,W,H);
  ctx.save();
  ctx.translate(W/2,H/2);ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);
  const vw=W/cam.z/2+60,vh=H/cam.z/2+60;
  const x0=cam.x-vw,x1=cam.x+vw,y0=cam.y-vh,y1=cam.y+vh;
  ctx.fillStyle='#f7fafc';ctx.fillRect(0,0,WORLD,WORLD);
  ctx.strokeStyle='rgba(30,60,90,.09)';ctx.lineWidth=2;ctx.beginPath();
  const gs=60;
  for(let x=Math.max(0,Math.floor(x0/gs)*gs);x<=Math.min(WORLD,x1);x+=gs){ctx.moveTo(x,Math.max(0,y0));ctx.lineTo(x,Math.min(WORLD,y1))}
  for(let y=Math.max(0,Math.floor(y0/gs)*gs);y<=Math.min(WORLD,y1);y+=gs){ctx.moveTo(Math.max(0,x0),y);ctx.lineTo(Math.min(WORLD,x1),y)}
  ctx.stroke();
  ctx.strokeStyle='rgba(30,60,90,.35)';ctx.lineWidth=8;ctx.strokeRect(0,0,WORLD,WORLD);
  for(const f of food)if(f.alive&&f.x>x0&&f.x<x1&&f.y>y0&&f.y<y1)cube(f.x,f.y,6,f.hue,false,null);
  for(const p of pellets)if(p.x>x0&&p.x<x1&&p.y>y0&&p.y<y1)cube(p.x,p.y,9,p.hue,true,null);
  for(const v of viruses)if(v.x>x0-80&&v.x<x1+80&&v.y>y0-80&&v.y<y1+80)virusDraw(v.x,v.y,hOf(v.m));

  const cells=[];
  if(botsOn)for(const b of bots)cells.push({x:b.x,y:b.y,m:b.m,hue:b.hue,name:b.name,sk:b.sk});
  for(const p of rs)for(const c of p.cells)cells.push({x:c.x,y:c.y,m:c.m,hue:p.hue,name:p.name,sk:p.sk});
  if(playing)for(const c of me.cells)cells.push({x:c.x,y:c.y,m:c.m,hue:me.hue,name:me.name,sk:SK[me.k],me:true});
  cells.sort((a,b)=>a.m-b.m);
  const tnow=performance.now();
  for(const c of cells){
    const h=hOf(c.m);
    if(c.x+h<x0||c.x-h>x1||c.y+h<y0||c.y-h>y1)continue;
    const sk=c.sk&&(c.sk.e||c.sk.pt||c.sk.gray||c.sk.fx)?c.sk:null;
    cube(c.x,c.y,h,hueFor(sk,c.hue,tnow),true,sk);
    label(c.x,c.y,h,c.name,!!(sk&&sk.e));
  }
  ctx.restore();

  adminTick(rs);
  const board=buildBoard(rs);
  const box=$('lbl');box.textContent='';
  board.slice(0,10).forEach((c,i)=>{
    const row=document.createElement('div');if(c.me)row.className='me';
    const a=document.createElement('span');a.textContent=(i+1)+'. '+c.name;
    const b=document.createElement('span');b.textContent=Math.round(c.m);
    row.append(a,b);box.appendChild(row);
  });
  if(playing){$('sc').textContent=Math.round(total())}
  if(room)$('net').textContent='Online players: '+(rs.length+(playing?1:0));
}

let last=performance.now();
function loop(t){
  const dt=Math.min(.05,(t-last)/1000);last=t;
  const rs=update(dt)||[];
  render(rs);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
