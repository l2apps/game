const KEY='auto_arena_v5', OLD='auto_arena_teams_v4';
const uid=()=>'t'+Date.now().toString(36)+Math.floor(Math.random()*1e4);
export function newTeam(name,region='red'){
  return {id:uid(),name,region,members:Array.from({length:5},()=>({name:'',elo:1200})),trophies:[],fmvps:[]};
}
export function load(){
  try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d&&Array.isArray(d.teams))return d}catch(e){}
  const d={teams:[],season:{n:1,name:'Mùa 1'},history:[],activeRegion:'red'};
  try{ // di chuyển từ v4: giữ tên + Elo theo vị trí, vai trò sẽ chọn lại ở Draft
    const o=JSON.parse(localStorage.getItem(OLD)||'null');
    if(o&&o.teams)o.teams.forEach((t,i)=>{const nt=newTeam(t.name,['red','yellow','blue','green'][i%4]);
      (t.members||[]).slice(0,5).forEach((m,k)=>{nt.members[k]={name:m.name||'',elo:+m.elo||1200}});d.teams.push(nt)});
  }catch(e){}
  if(!d.teams.length)['Alpha','Bravo','Charlie','Delta'].forEach((n,i)=>d.teams.push(newTeam('Đội '+n,'red')));
  return d;
}
export function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
