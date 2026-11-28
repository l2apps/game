import {load,save,newTeam} from './storage.js';
import {createMatch,step,render,simulateFast} from './engine.js';
import {lockedRoles} from './roles.js';
import {respawnAt} from './config.js';
import {renderTeams,renderGuide,openDraft,esc} from './ui-teams.js';
const $=id=>document.getElementById(id);
const st=load();let series=null,S=null,running=false,view='teams',speedI=0,reported=false,hdr=0,last=performance.now(),banner=null;
const SPEEDS=[1,2,4];
const canvas=$('arena-canvas'),ctx=canvas.getContext('2d');
function setupCanvas(){const d=devicePixelRatio||1;canvas.width=1400*d;canvas.height=760*d;ctx.setTransform(d,0,0,d,0,0)}
function show(v){view=v;['teams','tour','match'].forEach(x=>$('view-'+x).classList.toggle('hidden',x!==v));
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('border-amber-400',b.dataset.tab===v))}
const team=id=>st.teams.find(t=>t.id===id);
const refresh=()=>{save(st);renderTeams(st)};
$('season-label').textContent=st.season.name;

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>show(b.dataset.tab));
$('btn-guide').onclick=()=>{$('guide-modal').classList.remove('hidden');$('guide-modal').classList.add('flex')};
$('guide-close').onclick=()=>{$('guide-modal').classList.add('hidden');$('guide-modal').classList.remove('flex')};
$('region-tabs').onclick=e=>{const b=e.target.closest('[data-region]');if(b){st.activeRegion=b.dataset.region;refresh()}};
$('btn-add-team').onclick=()=>{st.teams.push(newTeam('Đội mới '+(st.teams.length+1),st.activeRegion));refresh()};
$('teams-list').onchange=e=>{const el=e.target,t=team(el.dataset.tid);if(!t)return;const f=el.dataset.f,m=t.members[+el.dataset.i];
  if(f==='name'){t.name=el.value.trim().slice(0,20)||t.name}else if(f==='region'){t.region=el.value}
  else if(f==='mname'){m.name=el.value.trim().slice(0,14)}else if(f==='elo'){m.elo=Math.max(100,Math.min(4000,Math.round(+el.value)||m.elo))}
  refresh()};
$('teams-list').onclick=e=>{const b=e.target.closest('[data-del]');if(!b||st.teams.length<=2)return;st.teams=st.teams.filter(t=>t.id!==b.dataset.del);refresh()};
$('btn-friendly').onclick=()=>{let a=$('sel-blue').value,b=$('sel-red').value;if(a===b){b=st.teams.find(t=>t.id!==a).id;$('sel-red').value=b}
  startSeries(a,b,+$('sel-bo').value)};

// Loạt BO (giao hữu dùng chung cơ chế với giải đấu ở Đợt 2)
export function startSeries(blueId,redId,bo){series={bo,blue:blueId,red:redId,wins:{blue:0,red:0},used:{blue:[],red:[]},no:1};nextGame()}
async function nextGame(){
  const T={blue:team(series.blue),red:team(series.red)};
  const locked={blue:lockedRoles(series.used.blue,series.no,series.bo),red:lockedRoles(series.used.red,series.no,series.bo)};
  const pick=await openDraft({teams:T,locked,title:`Pick Tướng • Ván ${series.no}${series.bo>1?' / BO'+series.bo:''}`,
    sub:series.bo>1?'Fearless Draft: vai trò đã dùng ở ván trước bị khóa 🔒'+(series.bo===7&&series.no===7?' (Ván 7: mở khóa toàn bộ)':''):'Giao hữu BO1'});
  if(!pick){show('teams');return}
  ['blue','red'].forEach(s=>series.used[s].push(pick[s]));
  const lineup={};['blue','red'].forEach(s=>lineup[s]=T[s].members.map((m,i)=>({role:pick[s][i],elo:m.elo,name:m.name})));
  S=createMatch(lineup,{blue:T.blue.name,red:T.red.name});S.speed=SPEEDS[speedI];reported=false;running=true;banner=null;
  $('blue-name').textContent=T.blue.name.toUpperCase();$('red-name').textContent=T.red.name.toUpperCase();
  $('victory-modal').classList.add('hidden');$('victory-modal').classList.remove('flex');
  $('series-info').textContent=series.bo>1?`BO${series.bo} • ${series.wins.blue}-${series.wins.red}`:'BO1';
  $('btn-play').textContent='⏸ Tạm dừng';show('match');drawPanels()}

$('btn-play').onclick=()=>{if(!S||S.over)return;running=!running;$('btn-play').textContent=running?'⏸ Tạm dừng':'▶ Tiếp tục'};
$('btn-speed').onclick=()=>{speedI=(speedI+1)%3;if(S)S.speed=SPEEDS[speedI];$('speed-text').textContent=SPEEDS[speedI]+'x'};
$('btn-skip').onclick=()=>{if(S&&!S.over){simulateFast(S);drawPanels()}};
$('v-next').onclick=()=>series&&(isDone()?(show('teams')&&0,$('v-teams').click()):nextGame());
$('v-teams').onclick=()=>{$('victory-modal').classList.add('hidden');$('victory-modal').classList.remove('flex');show('teams')};
const isDone=()=>{const need=Math.ceil(series.bo/2);return series.wins.blue>=need||series.wins.red>=need};

function drawPanels(){
  ['blue','red'].forEach(side=>{const b=side==='blue';
    $('panel-'+side).innerHTML=`<div class='flex justify-between rounded-lg border ${b?'border-sky-800':'border-rose-800'} bg-slate-900/90 px-3 py-2'><b class='text-xs ${b?'text-sky-400':'text-rose-400'} truncate'>${esc(S.names[side])}</b><b class='font-mono text-2xl ${b?'text-sky-400':'text-rose-400'}'>${S.kills[side]}</b></div>`
    +S.ch.filter(c=>c.team===side).map(c=>`<div class='rounded-lg border ${b?'border-sky-900/70 bg-sky-950/30':'border-rose-900/70 bg-rose-950/30'} px-2.5 py-2 ${c.alive?'':'opacity-45 grayscale'}'><div class='flex items-center gap-2'><span class='text-lg'>${c.role.icon}</span>
      <div class='min-w-0 flex-1'><div class='text-sm font-bold truncate'>${esc(c.member||c.role.name)}</div><div class='text-[10px] text-slate-400'>${c.role.name} • Elo ${c.elo}</div></div>${c.alive?'':`<span class='text-[11px] font-mono text-amber-300'>⏳${Math.ceil(c.respT)}s</span>`}</div>
      <div class='text-center font-mono text-sm font-bold'>${c.k} / ${c.d} / ${c.a}</div></div>`).join('')});
  const m=String(Math.floor(S.t/60)).padStart(2,'0'),s=String(Math.floor(S.t%60)).padStart(2,'0');$('match-timer').textContent=m+':'+s}

function showBanner(ev){const k=ev.killer,v=ev.victim,kb=k.team==='blue',el=$('kill-banner');
  el.innerHTML=`<span class='${kb?'text-sky-400':'text-rose-400'}'>${k.role.icon} ${esc(k.member||k.role.name)}</span> <span class='text-slate-400 font-normal'>hạ gục</span> <span class='${kb?'text-rose-400':'text-sky-400'}'>${v.role.icon} ${esc(v.member||v.role.name)}</span>`;
  el.classList.add('show');clearTimeout(banner);banner=setTimeout(()=>el.classList.remove('show'),2200)}

function endGame(){
  reported=true;series.wins[S.winner]++;const w=S.winner==='blue';
  $('v-title').textContent=`🏆 ${S.names[S.winner].toUpperCase()} THẮNG VÁN ${series.no}!`;$('v-title').className='text-2xl font-black text-center '+(w?'text-sky-400':'text-rose-400');
  $('v-sub').textContent=`⏱️ ${Math.floor(S.t/60)}p${Math.floor(S.t%60)}s • Mạng ${S.kills.blue}-${S.kills.red}`+(series.bo>1?` • Loạt BO${series.bo}: ${series.wins.blue}-${series.wins.red}`:'');
  ['blue','red'].forEach(sd=>$('v-'+sd).innerHTML=S.ch.filter(c=>c.team===sd).map(c=>`<div class='flex justify-between bg-slate-900 px-2 py-1 rounded border border-slate-800'><span>${c.role.icon} ${esc(c.member||c.role.name)}</span><span class='font-mono'>${c.k}/${c.d}/${c.a} • ${c.elo}</span></div>`).join(''));
  const done=isDone();series.no++;$('v-next').textContent=done?'✅ Kết thúc loạt':'⚔️ Ván tiếp theo';
  if(done){const t=series.wins.blue>series.wins.red?'blue':'red';$('v-sub').textContent+=` • 🏅 ${S.names[t]} thắng loạt`;$('v-next').onclick=()=>$('v-teams').click()}else $('v-next').onclick=nextGame;
  $('victory-modal').classList.remove('hidden');$('victory-modal').classList.add('flex')}

function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
  if(view==='match'&&S){if(running&&!S.over)step(S,dt);
    while(S.events.length){const e=S.events.shift();showBanner(e)}
    const ab=$('ace-banner');if(S.ace&&!S.over){ab.textContent=`⚡ QUÉT SẠCH (ACE)! ${S.ace==='blue'?'ĐỘI XANH':'ĐỘI ĐỎ'} TỔNG TẤN CÔNG TRỤ!`;ab.className='toast show absolute top-14 left-1/2 z-20 px-5 py-2 rounded-xl border-2 text-xs sm:text-base font-black whitespace-nowrap '+(S.ace==='blue'?'bg-sky-950 border-sky-400 text-sky-200':'bg-rose-950 border-rose-400 text-rose-200')}else ab.classList.remove('show');
    hdr+=dt;if(hdr>.15){hdr=0;drawPanels()}render(ctx,S);
    if(S.over&&!reported){running=false;drawPanels();endGame()}}
  requestAnimationFrame(loop)}
renderGuide();renderTeams(st);setupCanvas();addEventListener('resize',setupCanvas);show('teams');requestAnimationFrame(loop);
