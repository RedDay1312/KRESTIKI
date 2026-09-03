(()=>{
const $=s=>document.querySelector(s);
const app=$('.app'), card=$('.card'), actions=$('.actions'), result=$('#resultModal');
if(!app||!card||!actions||!result)return;
const KEYS={zen:'tttZen',auto:'tttAuto',session:'tttSessionStart'};
const read=(k,d)=>localStorage.getItem(k)??d;
const button=(text,cls='tool-button')=>{const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;return b};
let wakeLock=null;
const tools=button('⚙ Дополнительно','history-button secondary');
actions.insertAdjacentElement('afterend',tools);

// 1. Zen mode
const zen=button('🧘 Zen режим');
zen.addEventListener('click',()=>{const on=document.body.classList.toggle('zen-mode');localStorage.setItem(KEYS.zen,on?'on':'off');zen.textContent=on?'↩ Вернуть интерфейс':'🧘 Zen режим';});
if(read(KEYS.zen,'off')==='on'){document.body.classList.add('zen-mode');zen.textContent='↩ Вернуть интерфейс'}

// 2. Random theme
const randomTheme=button('🎨 Случайная тема');
randomTheme.addEventListener('click',()=>{const el=$('#theme');if(!el)return;const values=[...el.options].map(o=>o.value);el.value=values[Math.floor(Math.random()*values.length)];el.dispatchEvent(new Event('change',{bubbles:true}));});

// 3. Quick rematch
const rematch=button('⚡ Быстрый реванш');
rematch.addEventListener('click',()=>{$('#restart')?.click()});

// 4. Copy result summary
const copy=button('📋 Скопировать результат');
copy.addEventListener('click',async()=>{const title=$('#resultTitle')?.textContent||'Партия';const score=$('#resultScore')?.textContent||'';const text=`Крестики-нолики • Arena\n${title}\nСчёт: ${score}`;try{await navigator.clipboard.writeText(text);copy.textContent='✅ Скопировано'}catch{copy.textContent='❌ Не удалось скопировать'}setTimeout(()=>copy.textContent='📋 Скопировать результат',1400)});

// 5. Auto next round
const auto=button('▶ Авто-следующий раунд');
auto.className='tool-button toggle-tool';
function syncAuto(){const on=read(KEYS.auto,'off')==='on';auto.classList.toggle('enabled',on);auto.textContent=on?'⏸ Авто-следующий: ВКЛ':'▶ Авто-следующий: ВЫКЛ'}
auto.addEventListener('click',()=>{localStorage.setItem(KEYS.auto,read(KEYS.auto,'off')==='on'?'off':'on');syncAuto()});syncAuto();

// 6. Wake lock
const wake=button('☀ Не выключать экран');
async function toggleWake(){if(!('wakeLock' in navigator)){wake.textContent='ℹ Недоступно';setTimeout(()=>wake.textContent='☀ Не выключать экран',1600);return}try{if(wakeLock){await wakeLock.release();wakeLock=null;wake.textContent='☀ Не выключать экран'}else{wakeLock=await navigator.wakeLock.request('screen');wake.textContent='🌙 Экран активен'}}catch{wake.textContent='ℹ Заблокировано'}}
wake.addEventListener('click',toggleWake);document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'&&wakeLock===null&&document.body.classList.contains('wake-requested')){try{wakeLock=await navigator.wakeLock.request('screen')}catch{}}});

// 7. Session timer
const session=document.createElement('div');session.className='session-clock';session.innerHTML='<span>Сессия</span><b id="sessionClock">00:00</b>';actions.insertAdjacentElement('afterend',session);
if(!localStorage.getItem(KEYS.session))localStorage.setItem(KEYS.session,String(Date.now()));
function tickSession(){const sec=Math.max(0,Math.floor((Date.now()-Number(localStorage.getItem(KEYS.session)||Date.now()))/1000));const m=String(Math.floor(sec/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0');$('#sessionClock').textContent=`${m}:${s}`}
tickSession();setInterval(tickSession,1000);

// 8. Result celebration
const celebrate=()=>{const old=document.querySelector('.confetti-layer');old?.remove();const layer=document.createElement('div');layer.className='confetti-layer';for(let i=0;i<28;i++){const p=document.createElement('i');p.style.left=`${Math.random()*100}%`;p.style.setProperty('--delay',`${Math.random()*.35}s`);p.style.setProperty('--drift',`${(Math.random()-.5)*140}px`);p.textContent=['✦','•','+','◆'][i%4];layer.appendChild(p)}document.body.appendChild(layer);setTimeout(()=>layer.remove(),1500)};
let wasHidden=true;new MutationObserver(()=>{const visible=!result.hidden;if(visible&&!wasHidden){celebrate();if(read(KEYS.auto,'off')==='on'){setTimeout(()=>$('#nextRound')?.click(),1400)}}wasHidden=!visible}).observe(result,{attributes:true,attributeFilter:['hidden']});

// 9. Keyboard cheat sheet
const help=button('⌨ Горячие клавиши');
const helpModal=document.createElement('div');helpModal.className='extra-modal';helpModal.hidden=true;helpModal.innerHTML='<div class="extra-backdrop"></div><section class="extra-dialog" role="dialog" aria-modal="true"><div class="extra-head"><h2>Горячие клавиши</h2><button class="icon-button" data-close>✕</button></div><div class="key-grid"><span>1–9</span><b>Клетка</b><span>← ↑ ↓ →</span><b>Навигация</b><span>Enter</span><b>Сделать ход</b><span>Z</span><b>Отменить</b><span>H</span><b>Подсказка</b><span>F</span><b>Полный экран</b><span>Esc</span><b>Новый матч</b></div></section></div>';
document.body.appendChild(helpModal);help.addEventListener('click',()=>helpModal.hidden=false);helpModal.addEventListener('click',e=>{if(e.target.closest('[data-close],.extra-backdrop'))helpModal.hidden=true});

// 10. Safe reset
const reset=button('🧹 Полный сброс прогресса');
reset.addEventListener('click',()=>{if(!confirm('Удалить счёт, статистику, достижения, историю и сохранённые настройки?'))return;['tttX','tttO','tttGames','tttWins','tttLosses','tttDraws','tttStreak','tttPerfect','tttBestStreak','tttSound','tttMode','tttHuman','tttDifficulty','tttMatchLength','tttStarter','tttTimeLimit','tttTheme','tttMotion','tttHistory','tttPowerups','tttZen','tttAuto','tttSessionStart'].forEach(k=>localStorage.removeItem(k));location.reload()});

const extraPanel=document.createElement('div');extraPanel.className='extra-panel';extraPanel.hidden=true;[zen,randomTheme,rematch,copy,auto,wake,help,reset].forEach(b=>extraPanel.appendChild(b));document.body.appendChild(extraPanel);tools.addEventListener('click',()=>{extraPanel.hidden=!extraPanel.hidden});
})();