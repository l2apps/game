import {ARENA as AR,COLLISION_MELEE,COLLISION_RANGED,COLLISION_CD,TIME_LIMIT,respawnAt} from './config.js';
import {getRole,getEloStats} from './roles.js';
import {castSkill} from './skills.js';
const U=AR.unitRadius,dist=(a,b,c,d)=>Math.hypot(c-a,d-b);
const cx=x=>Math.max(AR.rectX+U+4,Math.min(AR.rectX+AR.rectW-U-4,x)),cy=y=>Math.max(AR.rectY+U+4,Math.min(AR.rectY+AR.rectH-U-4,y));
const seg=(px,py,x1,y1,x2,y2)=>{const l=(x2-x1)**2+(y2-y1)**2;if(!l)return dist(px,py,x1,y1);const t=Math.max(0,Math.min(1,((px-x1)*(x2-x1)+(py-y1)*(y2-y1))/l));return dist(px,py,x1+t*(x2-x1),y1+t*(y2-y1))};
const midY=AR.rectY+AR.rectH/2,OFF=[[260,-150],[225,-75],[275,0],[225,75],[190,150]];

// lineup: {blue:[{role,elo,name}x5], red:[...]}, names:{blue,red}
export function createMatch(lineup,names={blue:'ĐỘI XANH',red:'ĐỘI ĐỎ'}){
  const S={t:0,over:false,winner:null,names,kills:{blue:0,red:0},ch:[],pr:[],fx:[],pt:[],ft:[],zones:[],minions:[],events:[],cd:{},speed:1,ace:null,
    nexus:{blue:{x:AR.rectX+AR.nexusOffset,y:midY,hp:AR.nexusMaxHp,max:AR.nexusMaxHp,at:0,flash:0},red:{x:AR.rectX+AR.rectW-AR.nexusOffset,y:midY,hp:AR.nexusMaxHp,max:AR.nexusMaxHp,at:0,flash:0}}};
  ['blue','red'].forEach(team=>lineup[team].forEach((m,i)=>{const role=getRole(m.role),st=getEloStats(role,m.elo),b=team==='blue';
    S.ch.push({id:team+i,team,slot:i,role,elo:m.elo,member:m.name||'',...st,hp:st.maxHp,atkT:Math.random()*.35,skillCd:role.skillCd,skillT:role.skillCd*(.35+Math.random()*.4),
      x:b?AR.rectX+OFF[i][0]:AR.rectX+AR.rectW-OFF[i][0],y:midY+OFF[i][1],k:0,d:0,a:0,alive:true,respT:0,hitF:0,skillF:0,shield:0,shieldT:0,
      stunT:0,slowT:0,chillT:0,dodgeT:0,rageT:0,hasteT:0,stealthT:0,nextCrit:false,drT:0,bardT:0,giantT:0,markT:0,burnT:0,burnD:0,dashT:0,dashVx:0,dashVy:0,dashHit:{},burst:[],
      flank:Math.random()>.5?1:-1,jit:0,jitT:Math.random()*.35,str:0,strT:Math.random()*.8,log:{},trail:[]})}));
  S.A=api(S);return S}

function api(S){const A={zones:S.zones,minions:S.minions,dist,seg,cx,cy,
  enemies:u=>S.ch.filter(c=>c.team!==u.team&&c.alive),allies:u=>S.ch.filter(c=>c.team===u.team&&c.alive),
  fx:e=>S.fx.push({maxLife:e.life,...e}),
  text:(u,t,c='#fde047',s=11)=>ft(S,u.x,u.y-30,t,c,s),
  heal:(u,n)=>{n=Math.round(n*(inZone(S,u)?.5:1));if(n>0&&u.alive){u.hp=Math.min(u.maxHp,u.hp+n);ft(S,u.x,u.y-26,'+'+n+'💚','#4ade80',12)}},
  hit:(a,v,raw,o)=>hit(S,a,v,raw,o),
  proj:(u,p)=>S.pr.push({att:u,team:u.team,x:u.x,y:u.y,vx:0,vy:0,r:p.r||5,color:p.color||(u.team==='blue'?'#38bdf8':'#fb7185'),...p,spd:p.spd||0,tgtE:p.tgt})};
  return A}
const inZone=(S,u)=>S.zones.some(z=>z.team!==u.team&&dist(z.x,z.y,u.x,u.y)<=z.r);
function ft(S,x,y,text,color,size=12){if(S.speed>=4&&size<13)return;S.ft.push({x:x+(Math.random()-.5)*14,y,text,color,size,life:.72})}

function hit(S,a,v,raw,o={}){
  if(!v.alive||S.over)return 0;const dodge=o.dodge!==false;
  if(!o.tower&&dodge&&Math.random()<(v.dodgeT>0?.55:v.role.dodgeChance)){ft(S,v.x,v.y-24,'NÉ!','#fde047',11);return 0}
  let d=raw,crit=false;
  if(!o.tower&&a&&(a.nextCrit||Math.random()<a.role.critChance)){d*=1.6;crit=true;a.nextCrit=false}
  const arm=(v.armor+(v.giantT>0?40:0))*(1-(o.pierce||0));let f=Math.max(1,Math.round(d*100/(100+arm)));
  if(v.drT>0)f=Math.max(1,Math.round(f*.65));
  if(v.role.id==='assassin'&&v.dashT>0)f=Math.max(1,Math.round(f*.1));
  if(a&&o.trueMax)f+=Math.round(v.maxHp*o.trueMax);
  let hp=f;if(v.shield>0){const ab=Math.min(v.shield,hp);v.shield-=ab;hp-=ab}
  v.hp=Math.max(0,v.hp-hp);v.hitF=.14;if(a)v.log[a.id]=S.t;
  if(a&&a.rageT>0)A_heal(S,a,f*.3);
  ft(S,v.x,v.y-22,crit?`💥${f}!`:hp?'-'+hp:'🛡️',crit?'#facc15':(a&&a.team==='blue'?'#7dd3fc':'#fda4af'),crit?14:11);
  if(v.hp<=0)die(S,a,v,!!o.tower);return f}
const A_heal=(S,u,n)=>{if(u.alive)u.hp=Math.min(u.maxHp,u.hp+Math.round(n*(inZone(S,u)?.5:1)))};

function die(S,killer,v,tower){
  if(v.markT>0){v.markT=0;v.hp=Math.round(v.maxHp*.45);ft(S,v.x,v.y-30,'⏳ HỒI SINH!','#67e8f9',13);return}
  v.alive=false;v.hp=0;v.d++;v.respT=respawnAt(S.t);v.shield=0;v.burst=[];v.dashT=0;v.trail=[];
  for(let i=0;i<14;i++){const a=i/14*6.28,s=60+Math.random()*140;S.pt.push({x:v.x,y:v.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:2+Math.random()*3,color:v.team==='blue'?'#38bdf8':'#fb7185',life:.6})}
  let c=killer;if(tower||!c){let lt=-1;Object.entries(v.log).forEach(([id,t])=>{if(S.t-t<=5&&t>lt){lt=t;c=S.ch.find(x=>x.id===id)}})}
  if(c){c.k++;S.kills[c.team]++;if(c.role.id==='assassin'&&c.alive){c.skillT=0;ft(S,c.x,c.y-38,'⚡ RESET!','#fde047',13)}}else S.kills[v.team==='blue'?'red':'blue']++;
  Object.entries(v.log).forEach(([id,t])=>{if(S.t-t<=5&&(!c||id!==c.id)){const x=S.ch.find(q=>q.id===id);if(x&&x.team!==v.team)x.a++}});v.log={};
  if(c)S.events.push({type:'kill',killer:c,victim:v});
  S.ace=S.ch.some(x=>x.team===v.team&&x.alive)?(S.ace===v.team?null:S.ace):(v.team==='blue'?'red':'blue');
}

function target(S,u){
  let es=S.ch.filter(c=>c.team!==u.team&&c.alive);const vis=es.filter(e=>e.stealthT<=0);if(vis.length)es=vis;
  if(es.length){const D=e=>dist(u.x,u.y,e.x,e.y);
    if(u.role.id==='assassin')return{type:'champion',entity:es.sort((a,b)=>a.hp-b.hp||D(a)-D(b))[0]};
    if(u.slot===0){let b=es[0],bs=1e9;es.forEach(e=>{const s=D(e)-(e.slot<=1?40:0);if(s<bs){bs=s;b=e}});return{type:'champion',entity:b}}
    return{type:'champion',entity:es.sort((a,b)=>D(a)-D(b))[0]}}
  return{type:'nexus',entity:S.nexus[u.team==='blue'?'red':'blue']}}

function basic(S,u,ti){const t=ti.entity;u.atkT=u.role.attackCd/(u.rageT>0?1.6:1)/(u.bardT>0?1.3:1)*(u.chillT>0?2:1);
  if(u.role.isRanged){S.A.proj(u,{x:u.x,y:u.y,tgt:ti.type==='champion'?t:null,nex:ti.type==='nexus'?t:null,spd:u.role.id==='sniper'?700:480,dmg:u.dmg,r:4.5,life:1.5,basic:1});return}
  S.fx.push({type:'arc',x:u.x,y:u.y,ang:Math.atan2(t.y-u.y,t.x-u.x),r:24,color:u.team==='blue'?'#38bdf8':'#fb7185',life:.18,maxLife:.18});
  if(ti.type==='champion')hit(S,u,t,u.dmg);else nexusHit(S,u,t,u.dmg)}
function nexusHit(S,u,n,d){n.hp=Math.max(0,n.hp-d);n.flash=.14;if(n.hp<=0)finish(S,u.team)}

export function finish(S,w){S.over=true;S.winner=w;S.ace=null}
export function step(S,dt){
  if(S.over)return;let left=dt*S.speed;
  while(left>1e-6&&!S.over){const s=Math.min(1/60,left);left-=s;tick(S,s)}
  if(!S.over&&S.t>=TIME_LIMIT){const b=S.nexus.blue.hp,r=S.nexus.red.hp;finish(S,b!==r?(b>r?'blue':'red'):S.kills.blue!==S.kills.red?(S.kills.blue>S.kills.red?'blue':'red'):Math.random()<.5?'blue':'red')}}
export function simulateFast(S){S.speed=1;let g=0;while(!S.over&&g++<40000)step(S,1/60);return S}

function tick(S,dt){
  S.t+=dt;const alive=S.ch.filter(c=>c.alive),A=S.A;
  S.ch.forEach(u=>{
    if(!u.alive){u.respT=Math.max(0,u.respT-dt);if(u.respT<=0){const b=u.team==='blue';u.alive=true;u.hp=u.maxHp;u.skillT=u.skillCd*.4;
      u.x=b?AR.rectX+30:AR.rectX+AR.rectW-30;u.y=midY+(Math.random()-.5)*56;if(S.ace&&S.ace!==u.team)S.ace=null}return}
    ['atkT','skillT','hitF','skillF','dodgeT','slowT','chillT','rageT','hasteT','stealthT','drT','bardT','giantT','markT'].forEach(k=>{if(u[k]>0)u[k]=Math.max(0,u[k]-dt)});
    if(u.shieldT>0){u.shieldT-=dt;if(u.shieldT<=0){u.shield=0;u.shieldT=0}}
    for(let i=u.burst.length-1;i>=0;i--){u.burst[i].d-=dt;if(u.burst[i].d<=0){const s=u.burst.splice(i,1)[0];if(s.t&&s.t.alive)A.proj(u,{tgt:s.t,spd:560,dmg:u.dmg*(s.silver?.8:.75),r:5,color:s.silver?'#e2e8f0':'#fde047',life:1.2,trueMax:s.silver?.04:0})}}
    if(u.stunT>0){u.stunT=Math.max(0,u.stunT-dt);u.dashT=0;return}
    if(u.dashT>0){const ox=u.x,oy=u.y;u.dashT=Math.max(0,u.dashT-dt);u.x=cx(u.x+u.dashVx*dt);u.y=cy(u.y+u.dashVy*dt);
      u.trail.push({x:u.x,y:u.y,a:.7});if(u.trail.length>9)u.trail.shift();u.trail.forEach(t=>t.a*=.88);S.fx.push({type:'line',x:ox,y:oy,x2:u.x,y2:u.y,color:'#fde047',w:4,life:.16,maxLife:.16});return}
    u.jitT-=dt;if(u.jitT<=0){u.jitT=.22+Math.random()*.23;u.jit=(Math.random()-.5)*1.16}
    u.strT-=dt;if(u.strT<=0){u.strT=.38+Math.random()*.52;u.str=Math.random()<.45?(Math.random()<.5?1:-1)*(.35+Math.random()*.4):0}
    const ti=target(S,u),t=ti.entity;
    if(u.skillT<=0&&castSkill(A,u,ti)){u.skillT=u.skillCd;u.skillF=.35;if(u.role.id==='bloodfiend'&&u.hp<=0)u.hp=1}
    const dx=t.x-u.x,dy=t.y-u.y,d=Math.hypot(dx,dy)||1,er=ti.type==='nexus'?u.role.range+26:u.role.range,ba=Math.atan2(dy,dx),R=u.role.isRanged,champ=ti.type==='champion';
    let mx=0,my=0;
    if(R&&champ&&d<er*(u.slot===3?.65:.55)){const a=ba+Math.PI+u.jit;mx=Math.cos(a);my=Math.sin(a)}
    else if(d>er*.92){let a=ba+u.jit;if(u.role.id==='assassin'&&champ&&d>140)a+=u.flank*.65;mx=Math.cos(a);my=Math.sin(a)}
    else if(R&&champ){const a=ba+Math.PI/2*u.flank+u.jit*.4;mx=Math.cos(a)*.45;my=Math.sin(a)*.45}
    if(u.str){mx+=Math.cos(ba+1.57)*u.str;my+=Math.sin(ba+1.57)*u.str}
    let sx=0,sy=0;for(const o of alive){if(o===u)continue;const ox=u.x-o.x,oy=u.y-o.y,od=Math.hypot(ox,oy);if(od>0&&od<U*2.02){const p=(U*2.02-od)/(U*2.02);sx+=ox/od*p*1.35;sy+=oy/od*p*1.35}}
    const fx=mx+sx,fy=my+sy,mg=Math.hypot(fx,fy);
    if(mg>.05){const sp=u.role.speed*(u.slowT>0?.6:1)*(u.chillT>0?.5:1)*(u.rageT>0?1.6:1)*(u.hasteT>0?1.5:1)*(u.bardT>0?1.25:1);
      u.x=cx(u.x+fx/mg*sp*Math.min(1,mg)*dt);u.y=cy(u.y+fy/mg*sp*Math.min(1,mg)*dt)}
    if(u.role.id==='assassin'||u.role.id==='ninja'){u.trail.push({x:u.x,y:u.y,a:.4});if(u.trail.length>6)u.trail.shift();u.trail.forEach(q=>q.a*=.85)}
    if(dist(u.x,u.y,t.x,t.y)<=er&&u.atkT<=0)basic(S,u,ti)});

  // va chạm giữa hai đội
  for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){const a=alive[i],b=alive[j];if(!a.alive||!b.alive||a.team===b.team)continue;
    const d=dist(a.x,a.y,b.x,b.y);if(d>U*2+2)continue;const k=a.id<b.id?a.id+b.id:b.id+a.id,aD=a.role.id==='assassin'&&a.dashT>0,bD=b.role.id==='assassin'&&b.dashT>0;
    const nA=aD&&!a.dashHit[b.id],nB=bD&&!b.dashHit[a.id];
    if(!S.cd[k]||S.t>=S.cd[k]||nA||nB){S.cd[k]=S.t+COLLISION_CD;if(nA)a.dashHit[b.id]=1;if(nB)b.dashHit[a.id]=1;
      let dA=a.dmg*(a.role.isRanged?COLLISION_RANGED:COLLISION_MELEE),dB=b.dmg*(b.role.isRanged?COLLISION_RANGED:COLLISION_MELEE);
      if(aD)dA=(nA?a.dmg*1.1:dA)*1.5;if(bD)dB=(nB?b.dmg*1.1:dB)*1.5;
      if(a.alive&&b.alive)hit(S,a,b,dA,{dodge:false});if(a.alive&&b.alive)hit(S,b,a,dB,{dodge:false});
      const nx=(b.x-a.x)/(d||1),ny=(b.y-a.y)/(d||1);if(a.alive&&!aD){a.x=cx(a.x-nx*9);a.y=cy(a.y-ny*9)}if(b.alive&&!bD){b.x=cx(b.x+nx*9);b.y=cy(b.y+ny*9)}}}

  // trụ
  ['blue','red'].forEach(team=>{const n=S.nexus[team];if(n.flash>0)n.flash=Math.max(0,n.flash-dt);if(n.at>0){n.at-=dt;return}
    let nr=null,m=AR.nexusRange;S.ch.forEach(c=>{if(c.team!==team&&c.alive){const d=dist(n.x,n.y,c.x,c.y);if(d<=m){m=d;nr=c}}});
    if(nr){n.at=AR.nexusCooldown;S.fx.push({type:'line',x:n.x,y:n.y,x2:nr.x,y2:nr.y,color:team==='blue'?'#38bdf8':'#fb7185',w:5,life:.22,maxLife:.22});hit(S,null,nr,AR.nexusDmg,{tower:true})}});

  // vùng độc, đốt, tinh linh
  for(let i=S.zones.length-1;i>=0;i--){const z=S.zones[i];z.life-=dt;S.ch.forEach(e=>{if(e.alive&&e.team!==z.team&&dist(z.x,z.y,e.x,e.y)<=z.r)hit(S,z.owner,e,z.dps*dt,{dodge:false})});if(z.life<=0)S.zones.splice(i,1)}
  S.ch.forEach(u=>{if(u.burnT>0&&u.alive){u.burnT-=dt;hit(S,u.burnSrc,u,u.burnD*dt,{dodge:false})}});
  for(let i=S.minions.length-1;i>=0;i--){const m=S.minions[i];m.life-=dt;m.cd-=dt;const e=S.ch.filter(c=>c.team!==m.team&&c.alive).sort((a,b)=>dist(m.x,m.y,a.x,a.y)-dist(m.x,m.y,b.x,b.y))[0];
    if(e){const d=dist(m.x,m.y,e.x,e.y)||1;if(d>U+10){m.x+=(e.x-m.x)/d*170*dt;m.y+=(e.y-m.y)/d*170*dt}else if(m.cd<=0){m.cd=.7;hit(S,m.owner,e,m.owner.dmg*.4,{dodge:false})}}
    if(m.life<=0||m.hp<=0)S.minions.splice(i,1)}

  // đạn
  for(let i=S.pr.length-1;i>=0;i--){const p=S.pr[i];p.life-=dt;let rm=false;
    if(p.tgtE&&p.tgtE.alive&&p.spd){let tg=p.tgtE;const g=S.ch.find(c=>c.team===tg.team&&c.giantT>0&&c.alive&&dist(c.x,c.y,p.x,p.y)<=220);if(g&&p.team!==g.team)tg=p.tgtE=g;
      const a=Math.atan2(tg.y-p.y,tg.x-p.x);p.vx=Math.cos(a)*p.spd;p.vy=Math.sin(a)*p.spd}
    else if(p.nex&&p.spd){const a=Math.atan2(p.nex.y-p.y,p.nex.x-p.x);p.vx=Math.cos(a)*p.spd;p.vy=Math.sin(a)*p.spd}
    else if(!p.free&&!p.vx&&!p.vy){rm=true}
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.nex){if(dist(p.x,p.y,p.nex.x,p.nex.y)<=30){nexusHit(S,p.att,p.nex,p.dmg);rm=true}}
    else{const mi=S.minions.find(m=>m.team!==p.team&&dist(p.x,p.y,m.x,m.y)<=16);
      if(mi){mi.hp-=p.dmg;rm=true}
      else{const e=S.ch.find(c=>c.team!==p.team&&c.alive&&c.stealthT<=0&&dist(p.x,p.y,c.x,c.y)<=U+p.r*(p.spd>0?1:1));
        if(e){rm=true;
          if(p.aoe){S.fx.push({type:'ring',x:p.x,y:p.y,r:12,r2:p.aoe,color:p.color,life:.38,maxLife:.38,fill:1});
            S.ch.forEach(c=>{if(c.team!==p.team&&c.alive&&dist(p.x,p.y,c.x,c.y)<=p.aoe+U){hit(S,p.att,c,p.dmg*(c===e?1:.75),{dodge:false});
              if(p.kb&&c.alive){const a=Math.atan2(c.y-p.y,c.x-p.x);c.x=cx(c.x+Math.cos(a)*p.kb);c.y=cy(c.y+Math.sin(a)*p.kb)}
              if(p.burn&&c.alive){c.burnT=2;c.burnD=p.burn;c.burnSrc=p.att}}})}
          else{let dm=p.dmg;if(p.missingBonus)dm*=1+(1-e.hp/e.maxHp)*p.missingBonus;hit(S,p.att,e,dm,{trueMax:p.trueMax});if(p.slow&&e.alive)e.slowT=Math.max(e.slowT,p.slow)}}}}
    if(rm||p.life<=0)S.pr.splice(i,1)}
  for(const k of ['fx','pt','ft']){const a=S[k];for(let i=a.length-1;i>=0;i--){const e=a[i];if(k==='pt'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.94;e.vy*=.94}if(k==='ft')e.y-=28*dt;e.life-=dt;if(e.life<=0)a.splice(i,1)}}
}

export function render(ctx,S){
  const {W,H,rectX,rectY,rectW,rectH}=AR;ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#0b1221';ctx.fillRect(rectX,rectY,rectW,rectH);ctx.strokeStyle='rgba(148,163,184,.06)';
  for(let x=rectX+40;x<rectX+rectW;x+=40){ctx.beginPath();ctx.moveTo(x,rectY);ctx.lineTo(x,rectY+rectH);ctx.stroke()}
  for(let y=rectY+40;y<rectY+rectH;y+=40){ctx.beginPath();ctx.moveTo(rectX,y);ctx.lineTo(rectX+rectW,y);ctx.stroke()}
  ctx.strokeStyle='#334155';ctx.lineWidth=2.5;ctx.strokeRect(rectX,rectY,rectW,rectH);
  ['blue','red'].forEach(tm=>{const n=S.nexus[tm],b=tm==='blue',c=n.flash>0?'#fff':b?'#38bdf8':'#fb7185';
    ctx.save();ctx.beginPath();ctx.arc(n.x,n.y,AR.nexusRange,0,6.283);ctx.strokeStyle=b?'rgba(56,189,248,.14)':'rgba(251,113,133,.14)';ctx.setLineDash([5,6]);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(n.x,n.y,32,0,6.283);ctx.fillStyle=b?'#0c4a6e':'#881337';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=c;ctx.stroke();
    ctx.font='22px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🏰',n.x,n.y+1);
    ctx.fillStyle='#0f172a';ctx.fillRect(n.x-36,n.y-49,72,8);ctx.fillStyle=c;ctx.fillRect(n.x-36,n.y-49,72*n.hp/n.max,8);ctx.restore()});
  S.zones.forEach(z=>{ctx.save();ctx.globalAlpha=.25;ctx.fillStyle=z.color;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,6.283);ctx.fill();ctx.restore()});
  S.fx.forEach(e=>{const k=e.life/e.maxLife,p=1-k;ctx.save();ctx.globalAlpha=Math.max(0,k);
    if(e.type==='ring'){ctx.beginPath();ctx.arc(e.x,e.y,e.r+(e.r2-e.r)*p,0,6.283);ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.stroke();if(e.fill){ctx.globalAlpha=k*.2;ctx.fillStyle=e.color;ctx.fill()}}
    else if(e.type==='line'){ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);ctx.strokeStyle=e.color;ctx.lineWidth=e.w||5;ctx.lineCap='round';ctx.stroke()}
    else if(e.type==='arc'){ctx.beginPath();ctx.arc(e.x+Math.cos(e.ang)*18,e.y+Math.sin(e.ang)*18,e.r,e.ang-.75,e.ang+.75);ctx.strokeStyle=e.color;ctx.lineWidth=4;ctx.stroke()}ctx.restore()});
  S.minions.forEach(m=>{ctx.font='18px sans-serif';ctx.textAlign='center';ctx.fillText('👾',m.x,m.y)});
  S.ch.forEach(c=>{const b=c.team==='blue',col=c.hitF>0?'#fff':b?'#38bdf8':'#fb7185';
    if(!c.alive){const x=b?AR.rectX+30:AR.rectX+AR.rectW-30,y=midY+(c.slot-2)*26;ctx.fillStyle='#e2e8f0';ctx.font='700 12px monospace';ctx.textAlign='center';ctx.fillText(Math.ceil(c.respT),x,y);return}
    ctx.save();if(c.stealthT>0)ctx.globalAlpha=.4;const r=U*(c.giantT>0?1.4:1);
    c.trail.forEach(t=>{ctx.beginPath();ctx.arc(t.x,t.y,r*.6,0,6.283);ctx.fillStyle=b?'rgba(56,189,248,.16)':'rgba(251,113,133,.16)';ctx.fill()});
    ctx.beginPath();ctx.arc(c.x,c.y,r,0,6.283);ctx.fillStyle=b?'#172554':'#4c0519';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=col;ctx.stroke();
    if(c.stunT>0||c.dodgeT>0||c.slowT>0||c.chillT>0||c.drT>0){ctx.beginPath();ctx.arc(c.x,c.y,r+5,0,6.283);ctx.strokeStyle=c.stunT>0?'#facc15':c.drT>0?'#fde68a':'#7dd3fc';ctx.lineWidth=2;ctx.stroke()}
    const cd=1-Math.min(1,c.skillT/c.skillCd);ctx.beginPath();ctx.arc(c.x,c.y,r-3.5,-1.571,-1.571+6.283*cd);ctx.strokeStyle=cd>=1?'rgba(250,204,21,.8)':'rgba(148,163,184,.3)';ctx.lineWidth=2;ctx.stroke();
    ctx.font=`${Math.round(22*r/U)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(c.role.icon,c.x,c.y+1);
    const hr=Math.max(0,c.hp/c.maxHp);ctx.fillStyle='#0f172a';ctx.fillRect(c.x-28,c.y-r-14,56,7);ctx.fillStyle=hr>.5?(b?'#22d3ee':'#f43f5e'):hr>.25?'#facc15':'#f97316';ctx.fillRect(c.x-28,c.y-r-14,56*hr,7);
    if(c.shield>0){ctx.fillStyle='rgba(224,242,254,.9)';ctx.fillRect(c.x-28,c.y-r-14,56*Math.min(1,c.shield/c.maxHp),3.5)}
    if(c.member){ctx.fillStyle='#e2e8f0';ctx.font='700 15px Inter,sans-serif';ctx.fillText(c.member,c.x,c.y+r+16)}ctx.restore()});
  S.pr.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0});
  S.pt.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/.6);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fillStyle=p.color;ctx.fill();ctx.globalAlpha=1});
  S.ft.forEach(f=>{ctx.globalAlpha=Math.max(0,f.life/.72);ctx.font=`800 ${Math.round(f.size*1.4)}px Inter,sans-serif`;ctx.textAlign='center';ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.globalAlpha=1})}
