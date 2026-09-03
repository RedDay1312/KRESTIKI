(()=>{
const d=document.querySelector('#difficulty');const s=document.querySelector('#status');if(!d||!s)return;
const names={easy:['🎈 Дружелюбный','Играет рискованно и часто ошибается'],medium:['🧠 Тактик','Ищет угрозы и хорошие позиции'],hard:['👑 Гроссмейстер','Не прощает очевидных ошибок']};
const badge=document.createElement('div');badge.className='ai-personality';
const parent=d.closest('.setting');parent?.appendChild(badge);
function render(){const [name,desc]=names[d.value]||names.medium;badge.innerHTML=`<b>${name}</b><span>${desc}</span>`}
d.addEventListener('change',render);render();
})();