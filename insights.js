(()=>{
const actions=document.querySelector('.actions');if(!actions)return;
const panel=document.createElement('div');panel.className='insights';panel.innerHTML='<div><span>Эффективность</span><b id="winRate">0%</b></div><div><span>Лучший streak</span><b id="bestStreak">0</b></div><div><span>Сложный ИИ</span><b id="hardWins">0</b></div>';
actions.insertAdjacentElement('afterend',panel);
function n(k){return Number(localStorage.getItem(k)||0)}
function render(){const g=n('tttGames'),w=n('tttWins');const rate=g?Math.round(w/g*100):0;document.querySelector('#winRate').textContent=rate+'%';document.querySelector('#bestStreak').textContent=Math.max(n('tttStreak'),n('tttBestStreak'));document.querySelector('#hardWins').textContent=n('tttPerfect')}
render();setInterval(render,1000);
})();