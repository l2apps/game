// Kỹ năng chủ động + nội tại của 30 vai trò. A = API do engine truyền vào.
const U=25;
const fan=(A,u,t,n,spread,spd,mul,extra={})=>{const b=Math.atan2(t.y-u.y,t.x-u.x);
  for(let i=0;i<n;i++){const a=b+(i-(n-1)/2)*spread;A.proj(u,{x:u.x+Math.cos(a)*18,y:u.y+Math.sin(a)*18,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,dmg:u.dmg*mul,life:.7,free:true,...extra})}};
const line=(A,u,x2,y2,mul,w,o={})=>A.enemies(u).forEach(e=>{if(A.seg(e.x,e.y,u.x,u.y,x2,y2)<=U+w)A.hit(u,e,u.dmg*mul,{dodge:false,...o})});
const aoe=(A,u,x,y,r,mul,fn)=>A.enemies(u).forEach(e=>{if(A.dist(x,y,e.x,e.y)<=r+U){A.hit(u,e,u.dmg*mul,{dodge:false});if(e.alive&&fn)fn(e)}});
const push=(A,e,fx,fy,d)=>{const a=Math.atan2(e.y-fy,e.x-fx);e.x=A.cx(e.x+Math.cos(a)*d);e.y=A.cy(e.y+Math.sin(a)*d)};
const dashTo=(A,u,t,d)=>{const a=Math.atan2(t.y-u.y,t.x-u.x),m=Math.min(d,A.dist(u.x,u.y,t.x,t.y)-U*1.6);if(m>0){u.x=A.cx(u.x+Math.cos(a)*m);u.y=A.cy(u.y+Math.sin(a)*m)}};
const front=(A,u,t)=>({ang:Math.atan2(t.y-u.y,t.x-u.x)});

export const SKILLS={
fighter:(A,u,t)=>{const n=A.enemies(u).filter(e=>A.dist(u.x,u.y,e.x,e.y)<=92+U);if(!n.length)return false;
  let tot=0;n.forEach(e=>tot+=A.hit(u,e,u.dmg*1.35,{dodge:false}));A.heal(u,tot*.35);A.fx({type:'ring',x:u.x,y:u.y,r:26,r2:92,color:'#fb923c',life:.3});return true},
samurai:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>210)return false;const a=front(A,u,t).ang;
  line(A,u,u.x+Math.cos(a)*210,u.y+Math.sin(a)*210,1.35,14);A.fx({type:'line',x:u.x,y:u.y,x2:u.x+Math.cos(a)*210,y2:u.y+Math.sin(a)*210,color:'#fde047',w:10,life:.28});u.dodgeT=1.5;return true},
bloodfiend:(A,u)=>{u.hp=Math.max(1,u.hp-u.hp*.1);u.rageT=2.5;A.text(u,'🩸 KHÁT MÁU','#f43f5e');return true},
hammer:(A,u,t)=>{const n=A.enemies(u).filter(e=>A.dist(u.x,u.y,e.x,e.y)<=100+U);if(!n.length)return false;
  aoe(A,u,u.x,u.y,100,1.5,e=>{e.stunT=Math.max(e.stunT,.8);push(A,e,u.x,u.y,45)});A.fx({type:'ring',x:u.x,y:u.y,r:20,r2:100,color:'#f59e0b',life:.35});return true},
lancer:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>130+U)return false;const a=front(A,u,t).ang;
  line(A,u,u.x+Math.cos(a)*130,u.y+Math.sin(a)*130,1.4,10,{pierce:.5});A.fx({type:'line',x:u.x,y:u.y,x2:u.x+Math.cos(a)*130,y2:u.y+Math.sin(a)*130,color:'#e2e8f0',w:6,life:.22});return true},
knight:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>260)return false;dashTo(A,u,t,150);u.shield=Math.max(u.shield,Math.round(140*u.hpScale));u.shieldT=2.5;
  const e=A.enemies(u).filter(e=>A.dist(u.x,u.y,e.x,e.y)<=U*2+10).sort((a,b)=>A.dist(u.x,u.y,a.x,a.y)-A.dist(u.x,u.y,b.x,b.y))[0];
  if(e){A.hit(u,e,u.dmg*1.2,{dodge:false});e.stunT=Math.max(e.stunT,.5)}return true},
assassin:(A,u)=>{const e=A.enemies(u).sort((a,b)=>a.hp-b.hp)[0];const dx=e.x-u.x,dy=e.y-u.y,d=Math.hypot(dx,dy)||1;if(d>360)return false;
  const dd=Math.min(240,Math.max(95,d+15));u.dashT=.26;u.dashVx=dx/d*dd/.26;u.dashVy=dy/d*dd/.26;u.dashHit={};A.text(u,'💨 LƯỚT!','#fde047');return true},
ninja:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>230)return false;fan(A,u,t,3,.26,500,.95,{color:'#cbd5e1',r:5.5});
  const a=front(A,u,t).ang;A.fx({type:'ring',x:u.x,y:u.y,r:14,r2:42,color:'#94a3b8',life:.35});u.x=A.cx(u.x-Math.cos(a)*95);u.y=A.cy(u.y-Math.sin(a)*95);return true},
ghost:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>360)return false;u.stealthT=1.5;u.hasteT=1.5;u.nextCrit=true;A.text(u,'👻 TÀNG HÌNH','#c4b5fd');return true},
dancer:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>320)return false;const sx=u.x,sy=u.y;dashTo(A,u,t,300);
  A.enemies(u).forEach(e=>{if(A.seg(e.x,e.y,sx,sy,u.x,u.y)<=U+16)A.hit(u,e,u.dmg*1.1,{dodge:false})});
  A.fx({type:'line',x:sx,y:sy,x2:u.x,y2:u.y,color:'#f0abfc',w:6,life:.2});
  const bx=u.x,by=u.y;u.x=A.cx(sx);u.y=A.cy(sy);A.enemies(u).forEach(e=>{if(A.seg(e.x,e.y,bx,by,u.x,u.y)<=U+16)A.hit(u,e,u.dmg*1.1,{dodge:false})});return true},
nighthunter:(A,u)=>{const e=A.enemies(u).filter(e=>A.dist(u.x,u.y,e.x,e.y)<=260).sort((a,b)=>a.hp-b.hp)[0];if(!e)return false;
  dashTo(A,u,e,260);e.slowT=1.5;A.hit(u,e,u.dmg*1.1,{dodge:false});A.fx({type:'line',x:u.x,y:u.y,x2:e.x,y2:e.y,color:'#a78bfa',w:4,life:.25});return true},
thunder:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>300)return false;dashTo(A,u,t,300);let c=t;const hit=new Set();
  for(let i=0;i<3&&c;i++){hit.add(c.id);A.hit(u,c,u.dmg*1.0,{dodge:false});const p=c;
    c=A.enemies(u).filter(e=>!hit.has(e.id)&&A.dist(p.x,p.y,e.x,e.y)<=170).sort((a,b)=>A.dist(p.x,p.y,a.x,a.y)-A.dist(p.x,p.y,b.x,b.y))[0];
    if(c)A.fx({type:'line',x:p.x,y:p.y,x2:c.x,y2:c.y,color:'#facc15',w:5,life:.25})}return true},
mage:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>360)return false;const a=front(A,u,t).ang,x2=u.x+Math.cos(a)*390,y2=u.y+Math.sin(a)*390;
  A.fx({type:'line',x:u.x,y:u.y,x2,y2,color:u.team==='blue'?'#818cf8':'#f472b6',w:6,life:.3});line(A,u,x2,y2,1.5,10);return true},
frost:(A,u)=>{const es=A.enemies(u);if(!es.length)return false;const c=es.map(e=>({e,n:es.filter(o=>A.dist(e.x,e.y,o.x,o.y)<=115).length})).sort((a,b)=>b.n-a.n)[0].e;
  if(A.dist(u.x,u.y,c.x,c.y)>340)return false;aoe(A,u,c.x,c.y,115,.6,e=>e.chillT=2.5);A.fx({type:'ring',x:c.x,y:c.y,r:20,r2:115,color:'#7dd3fc',life:.5,fill:1});return true},
pyro:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>u.range+60)return false;A.proj(u,{x:u.x,y:u.y,tgt:t,spd:330,dmg:u.dmg*1.4,aoe:110,burn:u.dmg*.25,color:'#f97316',r:9,life:2});return true},
gravity:(A,u)=>{const es=A.enemies(u);if(!es.length)return false;const c=es.map(e=>({e,n:es.filter(o=>A.dist(e.x,e.y,o.x,o.y)<=130).length})).sort((a,b)=>b.n-a.n)[0].e;
  if(A.dist(u.x,u.y,c.x,c.y)>340)return false;es.forEach(e=>{if(A.dist(c.x,c.y,e.x,e.y)<=130+U){e.x=A.cx(e.x+(c.x-e.x)*.8);e.y=A.cy(e.y+(c.y-e.y)*.8);e.stunT=Math.max(e.stunT,.6);A.hit(u,e,u.dmg*.7,{dodge:false})}});
  A.fx({type:'ring',x:c.x,y:c.y,r:130,r2:20,color:'#6366f1',life:.5,fill:1});return true},
toxic:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>330)return false;A.zones.push({team:u.team,owner:u,x:t.x,y:t.y,r:95,life:3,dps:u.dmg*.5,color:'#84cc16'});return true},
summoner:(A,u,t)=>{for(let i=0;i<2;i++)A.minions.push({team:u.team,owner:u,x:A.cx(u.x+(i?24:-24)),y:u.y+(i?20:-20),hp:90*u.hpScale,life:9,cd:0});A.text(u,'👾 TRIỆU HỒI','#a3e635');return true},
marksman:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>u.range+40)return false;u.burst=[0,.09,.18].map(d=>({d,t}));return true},
cannoneer:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>u.range+45)return false;A.proj(u,{x:u.x,y:u.y,tgt:t,spd:250,dmg:u.dmg*1.5,aoe:105,kb:38,color:'#f97316',r:10,life:1.9});return true},
archer:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>330)return false;fan(A,u,t,5,.18,530,.75,{color:'#38bdf8',r:4.5,slow:1.5});return true},
sniper:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>450)return false;A.proj(u,{x:u.x,y:u.y,tgt:t,spd:800,dmg:u.dmg*1.7,missingBonus:1.4,color:'#fef08a',r:5,life:1});return true},
monsterhunter:(A,u,t)=>{if(A.dist(u.x,u.y,t.x,t.y)>u.range+40)return false;u.burst=[0,.12].map(d=>({d,t,silver:1}));return true},
rocketeer:(A,u)=>{const es=A.enemies(u).filter(e=>A.dist(u.x,u.y,e.x,e.y)<=u.range+60);if(!es.length)return false;
  for(let i=0;i<4;i++)A.proj(u,{x:u.x,y:u.y,tgt:es[i%es.length],spd:330,dmg:u.dmg*.8,color:'#fb7185',r:5,life:2});return true},
tank:(A,u)=>{const n=A.enemies(u).filter(e=>A.dist(u.x,u.y,e.x,e.y)<=110+U);if(!n.length)return false;
  n.forEach(e=>{e.stunT=Math.max(e.stunT,1);A.hit(u,e,u.dmg*.8,{dodge:false})});u.shield=Math.max(u.shield,Math.round(180*u.hpScale));u.shieldT=2.5;
  A.fx({type:'ring',x:u.x,y:u.y,r:24,r2:110,color:'#facc15',life:.38});return true},
support:(A,u)=>{const a=A.allies(u).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(!a||a.hp>=a.maxHp*.9)return false;
  A.heal(a,Math.round(110*u.hpScale));a.shield=Math.max(a.shield,Math.round(120*u.hpScale));a.shieldT=2.5;A.fx({type:'ring',x:a.x,y:a.y,r:14,r2:44,color:'#34d399',life:.42});return true},
paladin:(A,u)=>{if(!A.enemies(u).some(e=>A.dist(u.x,u.y,e.x,e.y)<=330))return false;
  A.allies(u).forEach(a=>{if(A.dist(u.x,u.y,a.x,a.y)<=130+U)a.drT=2});A.fx({type:'ring',x:u.x,y:u.y,r:20,r2:130,color:'#fde68a',life:.5,fill:1});return true},
bard:(A,u)=>{if(!A.enemies(u).some(e=>A.dist(u.x,u.y,e.x,e.y)<=360))return false;
  A.allies(u).forEach(a=>{if(A.dist(u.x,u.y,a.x,a.y)<=160+U)a.bardT=2.5});A.fx({type:'ring',x:u.x,y:u.y,r:20,r2:160,color:'#f9a8d4',life:.5,fill:1});return true},
giant:(A,u)=>{if(!A.enemies(u).some(e=>A.dist(u.x,u.y,e.x,e.y)<=300))return false;u.giantT=2.5;A.text(u,'🗿 KHỔNG LỒ','#fbbf24');return true},
chrono:(A,u)=>{const a=A.allies(u).filter(x=>x.markT<=0).sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(!a||a.hp>=a.maxHp*.9)return false;
  a.markT=2.5;A.fx({type:'ring',x:a.x,y:a.y,r:10,r2:40,color:'#67e8f9',life:.5});return true}
};
export function castSkill(A,u,ti){const f=SKILLS[u.role.id];if(!f)return false;
  const es=A.enemies(u);if(!es.length&&u.role.id!=='support')return false;
  const t=ti.type==='champion'?ti.entity:es[0];return f(A,u,t)}
