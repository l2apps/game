export const DEFAULT_ELO=1200;
export const ARENA={W:1400,H:760,rectX:70,rectY:28,rectW:1260,rectH:704,fountainR:68,nexusOffset:135,nexusRange:175,nexusMaxHp:2400,nexusDmg:58,nexusCooldown:1.05,unitRadius:25};
export const COLLISION_MELEE=0.22, COLLISION_RANGED=0.07, COLLISION_CD=0.45;
export const RESPAWN_STEPS=[[60,15],[120,20],[180,30],[240,45],[Infinity,50]];
export const respawnAt=t=>RESPAWN_STEPS.find(([m])=>t<m)[1];
export const TIME_LIMIT=420;
export const REGIONS=[{id:'red',name:'Khu vực Đỏ',icon:'🔴'},{id:'yellow',name:'Khu vực Vàng',icon:'🟡'},{id:'blue',name:'Khu vực Xanh',icon:'🔵'},{id:'green',name:'Khu vực Lục',icon:'🟢'}];
export const SLOT_NAMES=['Tuyến đầu','Cơ động','Pháp thuật','Xạ kích','Bảo kê'];
