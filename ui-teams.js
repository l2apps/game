import {REGIONS,SLOT_NAMES} from './config.js';
import {ROLES,rolesForSlot,randomPick} from './roles.js';
export const esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const avgElo=t=>Math.round(t.members.reduce((s,m)=>s+m.elo,0)/5);
const INP='bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100';

export function renderTeams(st){
  const rg=st.activeRegion;
  document.getElementById('region-tabs').innerHTML=REGIONS.map(r=>`<button data-region='${r.id}' class='rounded-xl border p-3 text-left font-bold text-sm ${r.id===rg?'border-amber-400 bg-slate-800':'border-slate-800 bg-slate-900/80'}'>${r.icon} ${r.name}<div class='text-[11px] text-slate-400 font-normal'>${st.teams.filter(t=>t.region===r.id).length} đội</div></button>`).join('');
  document.getElementById('teams-list').innerHTML=st.teams.filter(t=>t.region===rg).map(t=>`
   <div class='bg-slate-950/60 border border-slate-800 rounded-lg p-2.5'>
    <div class='flex flex-wrap items-center gap-2 mb-2'>
     <input data-tid='${t.id}' data-f='name' value='${esc(t.name)}' maxlength='20' class='${INP} w-48 font-bold'>
     <span class='text-[11px] text-slate-400'>Elo TB <b class='text-amber-300 font-mono'>${avgElo(t)}</b></span>
     <select data-tid='${t.id}' data-f='region' class='${INP}'>${REGIONS.map(r=>`<option value='${r.id}' ${r.id===t.region?'selected':''}>${r.icon} ${r.name}</option>`).join('')}</select>
     <button data-del='${t.id}' class='ml-auto px-2 py-1 rounded text-[11px] bg-slate-800 hover:bg-rose-900 border border-slate-700 ${st.teams.length<=2?'opacity-40 pointer-events-none':''}'>🗑️ Xóa</button></div>
    <div class='grid grid-cols-1 sm:grid-cols-5 gap-2'>${t.members.map((m,i)=>`
     <div class='bg-slate-900/50 border border-slate-800 rounded-lg p-1.5'><div class='text-[10px] text-slate-400 font-semibold mb-1'>Vị trí ${i+1} • ${SLOT_NAMES[i]}</div>
      <div class='flex gap-1'><input data-tid='${t.id}' data-i='${i}' data-f='mname' value='${esc(m.name)}' maxlength='14' placeholder='Tên...' class='${INP} min-w-0 flex-1'>
      <input type='number' min='100' max='4000' step='10' data-tid='${t.id}' data-i='${i}' data-f='elo' value='${m.elo}' class='${INP} w-16 font-mono text-center'></div></div>`).join('')}</div>
    <div class='mt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1'>
     <span>🏆 ${t.trophies.length?t.trophies.map(c=>`<b class='text-amber-300'>${esc(c.name)}</b> <span class='text-slate-500'>(${esc(c.season)}, ${c.kind==='wc'?'WC':'Khu vực'})</span>`).join(' • '):'<span class="text-slate-600">Chưa có cúp</span>'}</span>
     <span>🎖️ FMVP: ${t.fmvps.length?t.fmvps.map(f=>`<b class='text-sky-300'>${esc(f.player)}</b> <span class='text-slate-500'>(${esc(f.tournament)})</span>`).join(' • '):'<span class="text-slate-600">Chưa có</span>'}</span></div></div>`).join('')
   ||`<div class='text-slate-500 text-sm p-4'>Khu vực này chưa có đội.</div>`;
  const opts=st.teams.map(t=>`<option value='${t.id}'>${esc(t.name)} (${avgElo(t)})</option>`).join('');
  ['blue','red'].forEach((s,k)=>{const el=document.getElementById('sel-'+s),v=el.value;el.innerHTML=opts;el.value=v&&st.teams.some(t=>t.id===v)?v:st.teams[k%st.teams.length].id});
}

export function renderGuide(){
  document.getElementById('guide-body').innerHTML=SLOT_NAMES.map((n,s)=>`<div><div class='font-extrabold text-amber-300 text-sm mb-2'>Vị trí ${s+1} • ${n}</div>
   <div class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>${rolesForSlot(s).map(r=>`<div class='bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-[11px] space-y-1'>
    <div class='flex justify-between'><b class='text-sm text-white'>${r.icon} ${r.name}</b><span class='font-mono text-amber-300'>CD ${r.skillCd}s</span></div>
    <div class='font-mono text-slate-300'>❤️${r.maxHp} ⚔️${r.dmg} 🛡️${r.armor} 📏${r.range}</div>
    <div><b class='text-sky-300'>✨ ${r.skillName}</b><div class='text-slate-300'>${r.skillDesc}</div></div></div>`).join('')}</div></div>`).join('')
   +`<div class='text-[11px] text-slate-400 border-t border-slate-800 pt-2'>Elo mốc 1200: HP +3%/100, DMG +2.5%/100, Giáp +2/100. Va chạm: gần 22% DMG, xa 7% DMG. Hồi sinh: 15/20/30/45/50s theo phút.</div>`;
}

// Modal Fearless Draft → Promise<{blue:[ids],red:[ids]}|null>
export function openDraft({teams,locked,title,sub}){
  const m=document.getElementById('draft-modal'),body=document.getElementById('draft-body');
  document.getElementById('draft-title').textContent=title;document.getElementById('draft-sub').textContent=sub||'';
  const pick={blue:[],red:[]},off={blue:[false,false,false,false,false],red:[false,false,false,false,false]};
  const firstFree=(s,side)=>randomPick(s,locked[side],false)||ROLES.find(r=>!locked[side].has(r.id)).id;
  ['blue','red'].forEach(side=>{for(let s=0;s<5;s++)pick[side][s]=rolesForSlot(s).find(r=>!locked[side].has(r.id))?.id||firstFree(s,side)});
  const draw=()=>{body.innerHTML=['blue','red'].map(side=>{const b=side==='blue';return `<div class='rounded-xl border ${b?'border-sky-900/70':'border-rose-900/70'} p-3 space-y-2'>
    <div class='flex justify-between items-center'><b class='${b?'text-sky-400':'text-rose-400'}'>${b?'🔵':'🔴'} ${esc(teams[side].name)}</b><button data-all='${side}' class='px-2 py-1 rounded text-[11px] bg-slate-800 border border-slate-700'>🎲 Random Cả Đội</button></div>
    ${[0,1,2,3,4].map(s=>`<div class='flex items-center gap-1.5'><span class='w-24 text-[10px] text-slate-400 shrink-0'>V${s+1} ${SLOT_NAMES[s]}<br><b class='text-slate-200'>${esc(teams[side].members[s].name||'—')}</b></span>
      <select data-side='${side}' data-s='${s}' class='${INP} flex-1 min-w-0'>${(off[side][s]?ROLES:rolesForSlot(s)).map(r=>`<option value='${r.id}' ${locked[side].has(r.id)?'disabled':''} ${pick[side][s]===r.id?'selected':''}>${r.icon} ${r.name}${locked[side].has(r.id)?' 🔒':''}</option>`).join('')}</select>
      <button data-rnd='${side}:${s}' class='px-1.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs'>🎲</button>
      <label class='text-[10px] text-slate-400 flex items-center gap-1'><input type='checkbox' data-off='${side}:${s}' ${off[side][s]?'checked':''}>Bài dị</label></div>`).join('')}</div>`}).join('')};
  draw();m.classList.remove('hidden');m.classList.add('flex');
  return new Promise(res=>{
    const done=v=>{m.classList.add('hidden');m.classList.remove('flex');body.onchange=body.onclick=null;ok.onclick=cancel.onclick=null;res(v)};
    const ok=document.getElementById('draft-ok'),cancel=document.getElementById('draft-cancel');
    body.onchange=e=>{const t=e.target;if(t.dataset.side)pick[t.dataset.side][+t.dataset.s]=t.value;
      else if(t.dataset.off){const[sd,s]=t.dataset.off.split(':');off[sd][+s]=t.checked;if(!t.checked&&!rolesForSlot(+s).some(r=>r.id===pick[sd][+s]))pick[sd][+s]=firstFree(+s,sd);draw()}};
    body.onclick=e=>{const a=e.target.closest('[data-all]'),r=e.target.closest('[data-rnd]');
      if(a){const sd=a.dataset.all;for(let s=0;s<5;s++){off[sd][s]=false;pick[sd][s]=firstFree(s,sd)}draw()}
      if(r){const[sd,s]=r.dataset.rnd.split(':');pick[sd][+s]=randomPick(+s,locked[sd],off[sd][+s])||pick[sd][+s];draw()}};
    ok.onclick=()=>done({blue:pick.blue.slice(),red:pick.red.slice()});cancel.onclick=()=>done(null);
  });
}
