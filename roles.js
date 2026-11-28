import {DEFAULT_ELO} from './config.js';
// [id,name,icon,slot,hp,dmg,armor,atkCd,range,speed,crit,dodge,ranged,skillCd,skillName,skillDesc]
const R=[
['fighter','Đấu sĩ','⚔️',0,680,52,25,.85,64,120,.10,.06,0,4,'Xoay Rìu','Xoay 92px (1.35× DMG), hút 35% máu.'],
['samurai','Samurai','🗡️',0,490,60,18,.76,66,128,.20,.12,0,3.5,'Sóng Kiếm & Né','Sóng kiếm 210px (1.35× DMG), Né 55% trong 1.5s.'],
['bloodfiend','Huyết Quỷ','🩸',0,600,50,20,.85,62,118,.10,.05,0,4,'Khát Máu','Mất 10% HP hiện tại: +60% tốc đánh/chạy 2.5s, đòn hồi máu.'],
['hammer','Chiến Binh Búa','🔨',0,700,54,28,1.0,64,108,.08,.04,0,4.5,'Đập Đất','Sát thương lớn, Choáng 0.8s, hất văng địch.'],
['lancer','Thương Thủ','🔱',0,560,56,22,.82,80,122,.14,.07,0,3.5,'Đâm Xuyên','Đâm 130px, bỏ qua 50% Giáp.'],
['knight','Kỵ Sĩ Thép','🐎',0,720,46,32,.95,64,112,.08,.04,0,4.5,'Xung Phong','Húc 150px, Giáp ảo, choáng nhẹ địch đầu tiên.'],
['assassin','Sát thủ','🗡️',1,520,72,25,.78,60,144,.22,.09,0,3.5,'Lướt Ám Sát','Lướt 240px tới kẻ yếu nhất; -90% DMG nhận, +50% DMG gây ra khi lướt; hạ gục hồi chiêu.'],
['ninja','Ninja','🥷',1,440,50,12,.78,175,138,.16,.10,1,3.5,'Phi Tiêu Phân Thân','3 phi tiêu quạt (0.95× DMG), lùi 95px.'],
['ghost','Bóng Ma','👻',1,430,58,12,.80,62,140,.18,.12,0,4.5,'Tàng Hình','Không thể bị chọn 1.5s, tăng tốc, đòn kế chắc chắn Chí mạng.'],
['dancer','Vũ Công Kiếm','💃',1,460,54,15,.74,62,142,.18,.14,0,4,'Vũ Điệu Lướt','Lướt ziczac 2 lần, chém mọi địch trên đường.'],
['nighthunter','Thợ Săn Đêm','🦇',1,470,56,16,.80,64,136,.16,.08,0,4,'Xích Kéo','Kéo bản thân tới mục tiêu yếu máu (260px), làm chậm 1.5s.'],
['thunder','Lôi Thần','⚡',1,450,52,14,.78,64,140,.16,.08,0,3.5,'Lôi Điện','Lướt tới địch, tia sét nảy tối đa 3 mục tiêu.'],
['mage','Pháp sư','🔮',2,370,56,10,1.0,260,100,.08,.06,1,4,'Tia Laser Xuyên Thấu','Laser 390px xuyên đội hình (1.5× DMG).'],
['frost','Băng Thuật Sư','❄️',2,380,50,10,1.0,255,100,.06,.06,1,4.5,'Bão Tuyết','Bão 115px nơi đông địch nhất, chậm 50% chạy & đánh 2.5s.'],
['pyro','Hỏa Pháp Sư','🔥',2,360,58,10,1.05,255,98,.08,.05,1,4.5,'Thiên Thạch','Nổ lan 110px + đốt 2s.'],
['gravity','Trọng Lực Sư','🌌',2,400,48,12,1.05,250,98,.06,.05,1,5,'Hố Đen','Hố đen 130px hút địch vào tâm, choáng 0.6s.'],
['toxic','Độc Sư','🧪',2,380,46,10,1.0,250,100,.06,.06,1,4,'Bình Độc','Vùng khói 3s, sát thương liên tục, giảm 50% hồi máu/giáp.'],
['summoner','Triệu Hồi Sư','👾',2,390,44,10,1.05,245,100,.06,.06,1,5.5,'Triệu Tinh Linh','2 tinh linh tấn công và đỡ đạn.'],
['marksman','Xạ thủ','🏹',3,380,56,10,.62,245,108,.18,.06,1,3,'Liên Thanh 3 Viên','3 viên cách 0.09s, mỗi viên 0.75× DMG.'],
['cannoneer','Pháo thủ','💣',3,420,74,14,1.35,275,92,.10,.05,1,4.5,'Đạn Pháo Hạng Nặng','Nổ lan 105px (1.5× DMG), đẩy lùi.'],
['archer','Cung thủ','🎯',3,360,44,10,.80,310,104,.15,.07,1,3.5,'Mưa Tên Làm Chậm','5 mũi tên 330px (0.75× DMG), chậm 40% 1.5s.'],
['sniper','Xạ Thủ Tỉa','🔭',3,340,60,8,1.1,350,100,.16,.05,1,4.5,'Phát Bắn Tỉa','Bắn 450px, thêm sát thương theo % máu đã mất.'],
['monsterhunter','Thợ Săn Quái','🔫',3,390,52,12,.78,245,106,.14,.06,1,3.5,'Đạn Bạc','2 viên, thêm sát thương chuẩn theo % máu tối đa.'],
['rocketeer','Pháo Liên Hoàn','🚀',3,380,46,10,.95,250,104,.10,.06,1,4.5,'Tên Lửa Tầm Nhiệt','4 tên lửa tự tìm 4 địch khác nhau.'],
['tank','Đỡ đòn','🧱',4,880,28,45,1.08,60,90,.06,.04,0,5,'Dậm Đất Choáng','110px Choáng 1.0s, Giáp ảo 180 HP 2.5s.'],
['support','Trợ thủ','🛡️',4,480,30,22,1.05,200,102,.06,.06,1,4.5,'Hồi Phục & Giáp Ảo','Hồi máu + Giáp ảo 120 HP cho đồng đội yếu nhất.'],
['paladin','Thánh Kỵ Sĩ','✝️',4,700,34,35,1.0,62,98,.06,.05,0,5,'Hào Quang','130px, đồng đội trong vùng nhận -35% sát thương 2s.'],
['bard','Nhạc Công','🎵',4,440,30,16,1.05,190,104,.06,.06,1,4.5,'Khúc Cổ Vũ','Đồng đội trong 160px: +30% tốc đánh, +25% tốc chạy 2.5s.'],
['giant','Người Khổng Lồ','🗿',4,780,32,38,1.1,62,94,.05,.03,0,5,'Hóa Khổng Lồ','2.5s tăng kích thước & giáp, hút đạn bay của địch.'],
['chrono','Pháp Sư Thời Gian','⏳',4,450,32,18,1.05,195,102,.06,.06,1,5.5,'Ấn Thời Gian','Đồng đội yếu nhất: nếu chết trong 2.5s sẽ hồi 45% máu.']
];
export const ROLES=R.map(a=>({id:a[0],name:a[1],icon:a[2],slot:a[3],maxHp:a[4],dmg:a[5],armor:a[6],attackCd:a[7],range:a[8],speed:a[9],critChance:a[10],dodgeChance:a[11],isRanged:!!a[12],skillCd:a[13],skillName:a[14],skillDesc:a[15]}));
export const ROLE_MAP=Object.fromEntries(ROLES.map(r=>[r.id,r]));
export const rolesForSlot=s=>ROLES.filter(r=>r.slot===s);
export const getRole=id=>ROLE_MAP[id]||ROLES[0];
// Elo mốc 1200: HP +3%/100, DMG +2.5%/100, Giáp +2/100
export function getEloStats(role,elo){
  const d=(elo-DEFAULT_ELO)/100;
  const hpScale=Math.min(1.45,Math.max(.75,1+d*.03)),dmgScale=Math.min(1.4,Math.max(.8,1+d*.025));
  const armor=Math.max(0,Math.round(role.armor+Math.max(-10,Math.min(40,d*2))));
  return {maxHp:Math.round(role.maxHp*hpScale),dmg:Math.round(role.dmg*dmgScale),armor,hpScale,dmgScale};
}
// Fearless Draft: danh sách vai trò bị khóa của 1 đội trong loạt BO (ván 7 BO7 mở khóa)
export function lockedRoles(usedPerGame,gameNo,bestOf){
  if(bestOf===7&&gameNo===7)return new Set();
  return new Set(usedPerGame.flat());
}
export function randomPick(slot,locked,offPosition=false){
  const pool=(offPosition?ROLES:rolesForSlot(slot)).filter(r=>!locked.has(r.id));
  return pool.length?pool[Math.floor(Math.random()*pool.length)].id:null;
}
