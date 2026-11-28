import {REGIONS} from './config.js';
import {esc,avgElo} from './ui-teams.js';
import * as T from './tournament.js';
let C,rf={region:'red',sel:new Set(),name:''},wf={name:'',sel:null};const open=new Set();
const $=id=>document.getElementById(id),nm=id=>C.st.teams.find(t=>t.id===id)?.name||'?',cl=o=>JSON.parse(JSON.stringify(o));
const BTN='px-2 py-1 rounded text-[11px] font-bold border border-slate-700 ';
export function initTour(ctx){C=ctx;const r=$('view-tour');r.onclick=click;r.onchange=chg;
  r.oninput=e=>{if(e.target.dataset.f==='tname')rf.name=e.target.value;if(e.target.dataset.f==='wname')wf.name=e.target.value};
  document.querySelector('[data-tab=tour]').addEventListener('click',render);render()}
function modal(html){const d=document.createElement('div');d.className='fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-3';
  d.innerHTML=`<div class='bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-3 text-sm'>${html}</div>`;document.body.appendChild(d);return d}
function wcDef(rg){const st=C.st,tr=st.tour.find(t=>t.kind==='region'&&t.region===rg&&t.done);
  if(tr)return tr.placements.slice(0,4);return st.teams.filter(t=>t.region===rg).sort((a,b)=>avgElo(b)-avgElo(a)).slice(0,4).map(t=>t.id)}

function render(){const st=C.st,s=st.season;$('season-label').textContent=s.name+(s.ended?' (đã kết thúc)':'');
  if(!wf.sel){wf.sel={};REGIONS.forEach(r=>wf.sel[r.id]=wcDef(r.id))}
  const inp='bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs';
  const rteams=st.teams.filter(t=>t.region===rf.region);
  let h=`<div class='space-y-3'><div class='flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-3'>
   <b class='text-amber-300'>${esc(s.name)}</b>${s.ended?`<button data-newseason class='${BTN}bg-emerald-700 text-white'>✨ Tạo Mùa Mới</button>`:`<button data-end class='${BTN}bg-rose-800 text-white'>🔒 Kết Thúc ${esc(s.name)}</button>`}</div>`;
  if(!s.ended)h+=`<div class='grid grid-cols-1 lg:grid-cols-2 gap-3'>
   <div class='bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2'><b>🏆 Tạo Giải Khu Vực</b>
    <div class='flex gap-2'><select data-f='rregion' class='${inp}'>${REGIONS.map(r=>`<option value='${r.id}' ${r.id===rf.region?'selected':''}>${r.icon} ${r.name}</option>`).join('')}</select>
    <input data-f='tname' value='${esc(rf.name)}' placeholder='Tên giải (VD: Red Spring Cup)' class='${inp} flex-1'></div>
    <div class='flex flex-wrap gap-2 text-xs'>${rteams.map(t=>`<label class='bg-slate-950 border border-slate-800 rounded px-2 py-1'><input type='checkbox' data-chk='${t.id}' ${rf.sel.has(t.id)?'checked':''}> ${esc(t.name)}</label>`).join('')||'<span class="text-slate-500">Khu vực chưa có đội</span>'}</div>
    <button data-create='region' class='${BTN}bg-indigo-600 text-white'>Tạo giải (tối thiểu 4 đội)</button></div>
   <div class='bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2'><b>🌍 Tạo Giải WC</b> <span class='text-[11px] text-slate-400'>(4 đội/khu vực, tự lấy Top 4 giải khu vực nếu có)</span>
    <input data-f='wname' value='${esc(wf.name)}' placeholder='World Championship ${esc(s.name)}' class='${inp} w-full'>
    <div class='grid grid-cols-2 gap-2'>${REGIONS.map(r=>`<div class='text-[11px]'><div class='font-bold'>${r.icon}</div>${[0,1,2,3].map(i=>`<select data-wc='${r.id}:${i}' class='${inp} w-full mb-0.5'><option value=''>— chọn —</option>${st.teams.filter(t=>t.region===r.id).map(t=>`<option value='${t.id}' ${wf.sel[r.id][i]===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`).join('')}</div>`).join('')}</div>
    <button data-create='wc' class='${BTN}bg-indigo-600 text-white'>Tạo giải WC (16 đội)</button></div></div>`;
  h+=st.tour.map(t=>tourHtml(t)).join('')||`<div class='text-slate-500 text-sm p-4'>Chưa có giải nào trong mùa này.</div>`;
  $('view-tour').innerHTML=h+'</div>'}

function tourHtml(t){const o=open.has(t.id),rg=REGIONS.find(r=>r.id===t.region);
  let h=`<div class='bg-slate-900/90 border border-slate-800 rounded-xl'><div data-open='${t.id}' class='p-3 flex flex-wrap gap-2 items-center cursor-pointer'><b>${t.kind==='wc'?'🌍':'🏆'} ${esc(t.name)}</b>
   <span class='text-[11px] text-slate-400'>${t.kind==='wc'?'WC':rg?.name} • ${esc(t.season)} • ${t.done?'✅ Hoàn thành':t.stage==='rr'?'Vòng bảng':t.stage==='swiss'?'Swiss':'Playoff'}</span>
   ${t.done?`<span class='ml-auto text-amber-300 font-bold'>👑 ${esc(nm(t.champion))}</span>`:''}</div>`;
  if(o){h+=`<div class='p-3 pt-0 space-y-3'>`;
   if(t.kind==='region'&&t.stage!=='po'||t.kind==='region'&&t.matches.some(m=>m.stage==='rr'))h+=`<table class='text-xs w-full max-w-md'><tr class='text-slate-400'><td>#</td><td>Đội</td><td>T-B</td><td>Ván</td></tr>${T.standings(t).map((x,i)=>`<tr class='${i<4?'text-amber-200':''}'><td>${i+1}</td><td>${esc(nm(x.id))}</td><td>${x.w}-${x.l}</td><td>${x.gw}-${x.gl}</td></tr>`).join('')}</table>`;
   if(t.kind==='wc'){const rec=T.swissRec(t);h+=`<div class='text-xs flex flex-wrap gap-1'>${t.teams.map(id=>`<span class='bg-slate-950 border ${rec[id].w>=3?'border-emerald-700':rec[id].l>=3?'border-rose-900 opacity-60':'border-slate-800'} rounded px-2 py-0.5'>${esc(nm(id))} <b>${rec[id].w}-${rec[id].l}</b></span>`).join('')}</div>`}
   const groups=[...new Set(t.matches.map(m=>m.stage==='swiss'?m.label.split(' (')[0]:m.stage==='rr'?'Vòng bảng':'Playoff'))];
   groups.forEach(g=>{h+=`<div><div class='text-[11px] font-bold text-slate-400 mb-1'>${g}</div><div class='space-y-1'>${t.matches.filter(m=>(m.stage==='swiss'?m.label.split(' (')[0]:m.stage==='rr'?'Vòng bảng':'Playoff')===g).map(m=>mrow(t,m)).join('')}</div></div>`});
   h+='</div>'}
  return h+'</div>'}
function mrow(t,m){const S=T.sides(t,m),r=T.ready(t,m),d=m.status==='done',n=x=>x?esc(nm(x)):`<i class='text-slate-500'>${esc(T.refLabel(t,x===S.a?m.a:m.b))}</i>`;
  const A=S.a?esc(nm(S.a)):`<i class='text-slate-500'>${esc(T.refLabel(t,m.a))}</i>`,B=S.b?esc(nm(S.b)):`<i class='text-slate-500'>${esc(T.refLabel(t,m.b))}</i>`;
  const b=(a,l)=>`<button data-act='${a}' data-t='${t.id}' data-m='${m.id}' class='${BTN}bg-slate-800'>${l}</button>`;
  return `<div class='flex flex-wrap items-center gap-2 bg-slate-950/70 border border-slate-800 rounded px-2 py-1 text-xs'><span class='text-slate-500 w-28 truncate'>${esc(m.label)} • BO${m.bo}</span>
   <span class='${d&&m.winner===S.a?'text-emerald-300 font-bold':''}'>${A}</span><b class='font-mono'>${m.wins[0]} - ${m.wins[1]}</b><span class='${d&&m.winner===S.b?'text-emerald-300 font-bold':''}'>${B}</span>
   <span class='ml-auto flex gap-1'>${d?'✔':r?b('live','⚔️ Vào Trận')+b('fast','⏩ Nhanh')+b('series','⏩⏩ Cả loạt'):'⏳'}</span></div>`}

function chg(e){const el=e.target,d=el.dataset;
  if(d.f==='rregion'){rf.region=el.value;rf.sel.clear();render()}
  else if(d.chk){el.checked?rf.sel.add(d.chk):rf.sel.delete(d.chk)}
  else if(d.wc){const[rg,i]=d.wc.split(':');wf.sel[rg][+i]=el.value}}

function click(e){const st=C.st,t=e.target,d=t.closest('[data-act]'),o=t.closest('[data-open]');
  if(d){const tr=st.tour.find(x=>x.id===d.dataset.t);run(tr,tr.matches.find(m=>m.id===d.dataset.m),d.dataset.act);return}
  if(t.closest('[data-create]')){create(t.closest('[data-create]').dataset.create);return}
  if(t.closest('[data-end]')){endSeason();return}
  if(t.closest('[data-newseason]')){const n=st.season.n+1,name=prompt('Tên mùa mới:','Mùa '+n);if(!name)return;st.season={n,name,ended:false};st.tour=[];wf.sel=null;C.save();render();return}
  if(o){open.has(o.dataset.open)?open.delete(o.dataset.open):open.add(o.dataset.open);render()}}

function create(kind){const st=C.st,s=st.season;
  if(kind==='region'){const ids=[...rf.sel].filter(id=>st.teams.find(t=>t.id===id));if(ids.length<4)return alert('Cần chọn ít nhất 4 đội.');
    const rg=REGIONS.find(r=>r.id===rf.region),t=T.createRegional({name:rf.name.trim()||rg.name+' Cup',region:rf.region,teamIds:ids,season:s.name});st.tour.unshift(t);open.add(t.id);rf.name='';rf.sel.clear()}
  else{const ids=REGIONS.flatMap(r=>wf.sel[r.id]);if(ids.some(x=>!x)||new Set(ids).size!==16)return alert('Cần chọn đủ 16 đội khác nhau (4 đội mỗi khu vực).');
    const t=T.createWC({name:wf.name.trim()||'World Championship '+s.name,teams:ids,season:s.name});st.tour.unshift(t);open.add(t.id);wf.name=''}
  C.save();render()}

async function run(t,m,mode){const st=C.st;
  if(mode==='live'){const r=T.ready(t,m);if(!r)return;const a=m.games.length%2===0?'blue':'red',b=a==='blue'?'red':'blue';
    const res=await C.playGame({blueId:a==='blue'?r.a:r.b,redId:a==='blue'?r.b:r.a,locked:{[a]:T.lockOf(m,'a'),[b]:T.lockOf(m,'b')},
      title:`${t.name} • ${m.label} • Ván ${m.games.length+1}/BO${m.bo}`,sub:`${nm(r.a)} ${m.wins[0]} - ${m.wins[1]} ${nm(r.b)}`});
    C.show('tour');if(!res)return;T.recordGame(m,res.S,a,res.pick,r)}
  else if(mode==='fast')T.simGame(t,m,st.teams);else while(m.status!=='done')T.simGame(t,m,st.teams);
  if(m.status==='done')T.advance(t);C.save();if(t.done&&!t.awarded)fmvp(t);render()}

function fmvp(t){const gf=t.matches.find(m=>m.id==='GF'),side=gf.ta===t.champion?'a':'b',team=C.st.teams.find(x=>x.id===t.champion);
  const ag=[0,1,2,3,4].map(i=>{const o={slot:i,k:0,d:0,a:0};gf.games.forEach(g=>g.stats.filter(x=>x.s===side&&x.slot===i).forEach(x=>{o.k+=x.k;o.d+=x.d;o.a+=x.a}));o.kda=(o.k+o.a)/Math.max(1,o.d);return o});
  const best=ag.reduce((p,c)=>c.kda>p.kda?c:p);
  const d=modal(`<h2 class='text-xl font-black text-amber-300 text-center'>🏆 ${esc(team.name)} vô địch ${esc(t.name)}!</h2><div class='text-center text-xs text-slate-400'>Chọn FMVP (gợi ý: KDA cao nhất trong loạt Chung kết)</div>
   ${ag.map(x=>`<label class='flex justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2 cursor-pointer'><span><input type='radio' name='fm' value='${x.slot}' ${x===best?'checked':''}> Vị trí ${x.slot+1} • ${esc(team.members[x.slot].name||'—')}</span><span class='font-mono'>${x.k}/${x.d}/${x.a} • KDA ${x.kda.toFixed(2)}</span></label>`).join('')}
   <button id='fm-ok' class='${BTN}bg-emerald-600 text-white w-full py-2'>✅ Xác nhận FMVP & trao cúp</button>`);
  d.querySelector('#fm-ok').onclick=()=>{const sl=+d.querySelector('input[name=fm]:checked').value;
    team.trophies.push({name:t.name,season:t.season,kind:t.kind});team.fmvps.push({player:team.members[sl].name||'Vị trí '+(sl+1),tournament:t.name,season:t.season});
    t.awarded=true;C.save();C.refreshTeams();d.remove();render()}}

function endSeason(){const st=C.st,s=st.season;if(!confirm(`Kết thúc ${s.name}? Elo của tuyển thủ sẽ biến động và dữ liệu giải được lưu vào lịch sử.`))return;
  s.ended=true;st.history.push({season:s.name,n:s.n,regional:st.tour.filter(t=>t.kind==='region').map(t=>({...cl(t),matches:cl(t.matches.filter(m=>m.stage!=='rr'))})),wc:st.tour.filter(t=>t.kind==='wc').map(cl)});
  const ch=[];st.teams.forEach(t=>t.members.forEach((m,i)=>{const r=Math.random();let to=m.elo;
    if(r<.1)to=Math.min(4000,m.elo+15+Math.floor(Math.random()*26));else if(r<.2)to=Math.max(800,m.elo-(15+Math.floor(Math.random()*26)));
    if(to!==m.elo){ch.push({t:t.name,p:m.name||'Vị trí '+(i+1),a:m.elo,b:to});m.elo=to}}));
  C.save();C.refreshTeams();render();
  const d=modal(`<h2 class='text-lg font-black text-amber-300'>📈 Biến động phong độ cuối ${esc(s.name)}</h2>${ch.length?`<div class='space-y-1 text-xs'>${ch.map(c=>`<div class='flex justify-between bg-slate-950 border border-slate-800 rounded px-2 py-1'><span>${esc(c.t)} • ${esc(c.p)}</span><b class='font-mono ${c.b>c.a?'text-emerald-400':'text-rose-400'}'>${c.a} → ${c.b} (${c.b>c.a?'+':''}${c.b-c.a})</b></div>`).join('')}</div>`:'<div class="text-slate-400">Không ai biến động.</div>'}<button id='ok' class='${BTN}bg-slate-800 w-full py-2'>Đóng</button>`);
  d.querySelector('#ok').onclick=()=>d.remove()}
