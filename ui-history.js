import {REGIONS} from './config.js';
import {esc} from './ui-teams.js';
export function initHist(C){
  const root=document.getElementById('view-hist'),nm=id=>C.st.teams.find(t=>t.id===id)?.name||'(đã xóa)';
  const pl=(t,lab)=>t.placements.slice(0,4).map((id,i)=>`<span class='text-[11px] ${i===0?'text-amber-300 font-bold':'text-slate-300'}'>${['🥇','🥈','🥉','4️⃣'][i]} ${esc(nm(id))}</span>`).join(' ');
  const tcard=t=>`<div class='bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 items-center'><b class='text-xs'>${t.kind==='wc'?'🌍':'🏆'} ${esc(t.name)}</b>${t.done?pl(t):'<span class="text-[11px] text-slate-500">chưa hoàn thành</span>'}</div>`;
  function render(){const st=C.st;
    const players=st.teams.flatMap(t=>t.members.map((m,i)=>({n:m.name||'Vị trí '+(i+1),t:t.name,s:i+1,e:m.elo}))).sort((a,b)=>b.e-a.e).slice(0,15);
    const hof=st.teams.map(t=>({t,wc:t.trophies.filter(c=>c.kind==='wc').length,rg:t.trophies.filter(c=>c.kind!=='wc').length,f:t.fmvps.length})).filter(x=>x.wc+x.rg+x.f).sort((a,b)=>b.wc-a.wc||b.rg-a.rg||b.f-a.f);
    const hist=[...st.history].reverse().map(h=>`<div class='space-y-1'><div class='font-bold text-amber-300 text-sm'>${esc(h.season)}</div>${h.wc.map(tcard).join('')}${h.regional.map(t=>tcard({...t,done:t.done})).join('')||''}</div>`).join('');
    const cur=st.tour.filter(t=>t.done);
    root.innerHTML=`<div class='grid grid-cols-1 lg:grid-cols-2 gap-3'>
     <div class='bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2'><b>📈 Top 15 Elo tuyển thủ</b>${players.map((p,i)=>`<div class='flex justify-between text-xs bg-slate-950/70 border border-slate-800 rounded px-2 py-1'><span><span class='text-slate-500'>${i+1}.</span> ${esc(p.n)} <span class='text-slate-500'>• ${esc(p.t)} • V${p.s}</span></span><b class='font-mono text-amber-300'>${p.e}</b></div>`).join('')}</div>
     <div class='bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2'><b>🏛️ Phòng truyền thống</b>${hof.map(x=>`<div class='flex justify-between text-xs bg-slate-950/70 border border-slate-800 rounded px-2 py-1'><span>${esc(x.t.name)}</span><span>🌍 ${x.wc} • 🏆 ${x.rg} • 🎖️ FMVP ${x.f}</span></div>`).join('')||'<div class="text-xs text-slate-500">Chưa có cúp nào.</div>'}</div></div>
     <div class='bg-slate-900/90 border border-slate-800 rounded-xl p-3 mt-3 space-y-3'><b>📜 Lịch sử các mùa</b>${cur.length?`<div class='space-y-1'><div class='font-bold text-sm text-emerald-300'>${esc(st.season.name)} (đang diễn ra)</div>${cur.map(tcard).join('')}</div>`:''}${hist||(cur.length?'':'<div class="text-xs text-slate-500">Chưa có mùa nào kết thúc.</div>')}</div>`}
  document.querySelector('[data-tab=hist]').addEventListener('click',render);render()}
