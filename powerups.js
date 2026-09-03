(()=>{
const $=s=>document.querySelector(s);
const status=$('#status');
const board=$('#board');
if(!status||!board)return;
const key='tttPowerups';
let used=JSON.parse(localStorage.getItem(key)||'[]');
function addBadge(text){let el=$('#powerupBadge');if(!el){el=document.createElement('span');el.id='powerupBadge';el.className='powerup-badge';board.parentElement?.appendChild(el)}el.textContent=text}
function daily(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`}
const today=daily();
const challenge=(()=>{let h=0;for(const c of today)h=(h*31+c.charCodeAt(0))>>>0;return ['Центр под запретом','Только углы','Первый ход решает'][h%3]})();
addBadge(`🎯 Испытание дня: ${challenge}`);
window.tttPowerup={challenge,markUsed(name){if(!used.includes(name)){used.push(name);localStorage.setItem(key,JSON.stringify(used.slice(-20)))}addBadge(`✅ ${name}`)}};
})();