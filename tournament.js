import {createMatch,simulateFast} from './engine.js';
import {lockedRoles,randomPick,ROLES} from './roles.js';
const uid=()=>Math.random().toString(36).slice(2,8);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const M=(id,a,b,bo,stage,label)=>({id,a,b,bo,stage,label,wins:[0,0],games:[],used:{a:[],b:[]},h:false,status:'pending',winner:null,loser:null,ta:null,tb:null});
const W=id=>({w:id}),L=id=>({l:id});
export const find=(t,id)=>t.matches.find(m=>m.id===id);
const res=(t,r)=>{if(typeof r==='string')return r;const m=find(t,r.w||r.l);return m&&m.status==='done'?(r.w?m.winner:m.loser):null};
export const sides=(t,m)=>({a:res(t,m.a),b:res(t,m.b)});
export const ready=(t,m)=>{if(m.status==='done'||m.h)return null;const s=sides(t,m);return s.a&&s.b?s:null};
export const lockOf=(m,k)=>lockedRoles(m.used[k],m.games.length+1,m.bo);
export const refLabel=(t,r)=>typeof r==='string'?r:(r.w?'Thắng ':'Thua ')+(find(t,r.w||r.l)?.label||'?');

export function createRegional({name,region,teamIds,season}){
  const t={id:uid(),kind:'region',name,region,season,teams:teamIds,stage:'rr',matches:[],done:false,awarded:false,champion:null,placements:[]};
  for(let i=0;i<teamIds.length;i++)for(let j=i+1;j<teamIds.length;j++)t.matches.push(M(`rr${i}-${j}`,teamIds[i],teamIds[j],5,'rr','Vòng bảng'));
  return t}
export function createWC({name,teams,season,seeds}){
  const t={id:uid(),kind:'wc',name,season,teams,seeds:seeds||{},stage:'swiss',round:0,matches:[],done:false,awarded:false,champion:null,placements:[]};
  advance(t);return t}

export function standings(t){const s={};t.teams.forEach(id=>s[id]={id,w:0,l:0,gw:0,gl:0});
  t.matches.filter(m=>m.stage==='rr'&&m.status==='done').forEach(m=>{const A=s[m.a],B=s[m.b];A.gw+=m.wins[0];A.gl+=m.wins[1];B.gw+=m.wins[1];B.gl+=m.wins[0];
    if(m.winner===m.a){A.w++;B.l++}else{B.w++;A.l++}});
  return Object.values(s).sort((x,y)=>y.w-x.w||(y.gw-y.gl)-(x.gw-x.gl)||y.gw-x.gw)}
export function swissRec(t){const r={};t.teams.forEach(id=>r[id]={w:0,l:0,opp:[]});
  t.matches.filter(m=>m.stage==='swiss'&&m.status==='done').forEach(m=>{r[m.winner].w++;r[m.loser].l++;r[m.a].opp.push(m.b);r[m.b].opp.push(m.a)});return r}

function swissRound(t,rec,act){
  const rnd=++t.round,start=t.matches.length;let n=0;
  const hi=shuffle(t.teams.filter(i=>t.seeds[i]<=2)),lo=shuffle(t.teams.filter(i=>t.seeds[i]>2));
  if(rnd===1&&hi.length&&hi.length===lo.length){ // V1: Pool Cao (seed 1-2) gặp Pool Thấp (seed 3-4), cho phép nội chiến
    hi.forEach((a,i)=>t.matches.push(M(`sw1-${n++}`,a,lo[i],3,'swiss','Swiss V1 (0-0)')))
  }else{
    const g={};act.forEach(id=>{(g[rec[id].w+'-'+rec[id].l]=g[rec[id].w+'-'+rec[id].l]||[]).push(id)});
    const keys=Object.keys(g).sort((x,y)=>(+y[0]-+x[0])||(+x[2]-+y[2]));let carry=[];
    keys.forEach(k=>{const pool=carry.concat(shuffle(g[k]));carry=[];
      while(pool.length>1){const a=pool.shift();let j=pool.findIndex(b=>!rec[a].opp.includes(b));if(j<0)j=0;const b=pool.splice(j,1)[0];
        const bo=(rec[a].w===2||rec[a].l===2)?5:3;t.matches.push(M(`sw${rnd}-${n++}`,a,b,bo,'swiss',`Swiss V${rnd} (${k})`))}
      carry=pool})}
  shuffle(t.matches.splice(start)).forEach(m=>{m.h=true;t.matches.push(m)})} // chờ bốc thăm
function buildPo(t,q){const P=(id,a,b,bo,l)=>t.matches.push(M(id,a,b,bo,'po',l));
  P('W1',q[0],q[1],5,'NT Vòng 1');P('W2',q[2],q[3],5,'NT Vòng 1');P('W3',q[4],q[5],5,'NT Vòng 1');P('W4',q[6],q[7],5,'NT Vòng 1');
  P('L1a',L('W1'),L('W2'),5,'NL Vòng 1');P('L1b',L('W3'),L('W4'),5,'NL Vòng 1');
  P('WS1',W('W1'),W('W2'),7,'Bán kết NT');P('WS2',W('W3'),W('W4'),7,'Bán kết NT');
  P('L2a',W('L1a'),L('WS2'),7,'NL Vòng 2');P('L2b',W('L1b'),L('WS1'),7,'NL Vòng 2');P('L3',W('L2a'),W('L2b'),7,'Bán kết NL');
  P('WF',W('WS1'),W('WS2'),7,'Chung kết NT');P('LF',L('WF'),W('L3'),7,'Chung kết NL');P('GF',W('WF'),W('LF'),7,'CHUNG KẾT TỔNG');['W1','W2','W3','W4'].forEach(id=>find(t,id).h=true)}
function fin(t,p){t.done=true;t.champion=p[0];t.placements=p}

export function advance(t){
  const pend=t.matches.some(m=>m.status!=='done');
  if(t.kind==='region'){
    if(t.stage==='rr'&&!pend){const s=standings(t).slice(0,4).map(x=>x.id);t.seeds=s;
      t.matches.push(M('W1',s[0],s[1],7,'po','Nhánh thắng • Trận 1'),M('L1',s[2],s[3],7,'po','Nhánh thua • Trận 2'),
        M('LF',L('W1'),W('L1'),7,'po','Chung kết nhánh thua'),M('GF',W('W1'),W('LF'),7,'po','CHUNG KẾT TỔNG'));t.stage='po'}
    else if(t.stage==='po'){const g=find(t,'GF');if(g.status==='done'&&!t.done)fin(t,[g.winner,g.loser,find(t,'LF').loser,find(t,'L1').loser])}
  }else{
    if(t.stage==='swiss'&&!pend){const rec=swissRec(t),act=t.teams.filter(i=>rec[i].w<3&&rec[i].l<3);
      if(act.length)swissRound(t,rec,act);else{t.qual=shuffle(t.teams.filter(i=>rec[i].w>=3));buildPo(t,t.qual);t.stage='po'}}
    else if(t.stage==='po'){const g=find(t,'GF');if(g.status==='done'&&!t.done)fin(t,[g.winner,g.loser,find(t,'LF').loser,find(t,'L3').loser])}
  }}

export function recordGame(m,S,aSide,pick,r){
  const bSide=aSide==='blue'?'red':'blue';if(r){m.ta=r.a;m.tb=r.b}
  const w=S.winner===aSide?0:1;m.wins[w]++;m.used.a.push(pick[aSide]);m.used.b.push(pick[bSide]);
  m.games.push({w:w?'b':'a',stats:S.ch.map(c=>({s:c.team===aSide?'a':'b',slot:c.slot,name:c.member,role:c.role.id,k:c.k,d:c.d,a:c.a}))});
  if(m.wins[w]>=Math.ceil(m.bo/2)){m.status='done';m.winner=w?m.tb:m.ta;m.loser=w?m.ta:m.tb}}

// Mô phỏng nhanh 1 ván (không vẽ), tự random vai trò theo Fearless Draft
export function simGame(t,m,teams){
  const r=ready(t,m);if(!r)return;
  const aSide=m.games.length%2===0?'blue':'red',bSide=aSide==='blue'?'red':'blue',tm=id=>teams.find(x=>x.id===id);
  const pk=set=>[0,1,2,3,4].map(s=>randomPick(s,set)||ROLES.find(x=>!set.has(x.id)).id);
  const pick={[aSide]:pk(lockOf(m,'a')),[bSide]:pk(lockOf(m,'b'))};
  const line=(id,sd)=>tm(id).members.map((x,i)=>({role:pick[sd][i],elo:x.elo,name:x.name}));
  const S=createMatch({[aSide]:line(r.a,aSide),[bSide]:line(r.b,bSide)});simulateFast(S);recordGame(m,S,aSide,pick,r);return S}
