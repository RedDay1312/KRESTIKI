(()=>{
  const HISTORY_KEY='tttHistory';
  const MAX_HISTORY=12;
  const resultModal=document.querySelector('#resultModal');
  const actions=document.querySelector('.actions');
  if(!resultModal||!actions)return;

  const historyButton=document.createElement('button');
  historyButton.type='button';
  historyButton.className='history-button secondary';
  historyButton.textContent='📜 История партий';
  historyButton.setAttribute('aria-label','Открыть историю партий');
  actions.insertAdjacentElement('afterend',historyButton);

  const modal=document.createElement('div');
  modal.className='history-modal';
  modal.hidden=true;
  modal.innerHTML=`<div class="history-backdrop" data-close-history></div><section class="history-dialog" role="dialog" aria-modal="true" aria-labelledby="historyTitle"><div class="history-head"><h2 id="historyTitle">История партий</h2><button class="icon-button" type="button" data-close-history aria-label="Закрыть">✕</button></div><div class="history-summary"><div class="history-stat"><span>Всего записей</span><b id="historyCount">0</b></div><div class="history-stat"><span>Побед</span><b id="historyWins">0</b></div><div class="history-stat"><span>Поражений</span><b id="historyLosses">0</b></div></div><div class="history-list" id="historyList"></div><button class="tool-button history-clear" id="clearHistory" type="button">🗑 Очистить историю</button></section>`;
  document.body.appendChild(modal);

  const list=modal.querySelector('#historyList');
  const countEl=modal.querySelector('#historyCount');
  const winsEl=modal.querySelector('#historyWins');
  const lossesEl=modal.querySelector('#historyLosses');

  function getHistory(){try{const raw=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');return Array.isArray(raw)?raw:[]}catch{return[]}}
  function saveHistory(items){localStorage.setItem(HISTORY_KEY,JSON.stringify(items.slice(0,MAX_HISTORY)))}
  function loadMode(){return localStorage.getItem('tttMode')||'ai'}
  function iconFor(title){const t=String(title).toLowerCase();if(t.includes('ничья'))return'🤝';if(t.includes('проиг'))return'🤖';if(t.includes('ии'))return'🤖';return'🏆'}
  function resultType(title){const t=String(title).toLowerCase();if(t.includes('ничья'))return'draw';if(t.includes('проиг')||t.includes('ии'))return'loss';return'win'}
  function formatDate(ts){return new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(ts))}

  function renderHistory(){
    const items=getHistory();
    const wins=items.filter(x=>x.result==='win').length;
    const losses=items.filter(x=>x.result==='loss').length;
    countEl.textContent=items.length;
    winsEl.textContent=wins;
    lossesEl.textContent=losses;
    list.innerHTML='';
    if(!items.length){list.innerHTML='<div class="history-empty">Пока нет завершённых партий.<br>Сыграйте первый раунд — он появится здесь.</div>';return}
    items.forEach(item=>{
      const row=document.createElement('article');
      row.className='history-item';
      const modeText=item.mode==='local'?'👥 2 игрока':`🤖 ИИ • ${item.difficulty==='hard'?'сложно':item.difficulty==='easy'?'легко':'средне'}`;
      row.innerHTML=`<span class="history-icon">${iconFor(item.title)}</span><div><div class="history-title"></div><div class="history-meta">${modeText} • ${formatDate(item.time)}</div></div><span class="history-score"></span>`;
      row.querySelector('.history-title').textContent=item.title||'Раунд завершён';
      row.querySelector('.history-score').textContent=item.score||'—';
      list.appendChild(row);
    });
  }

  let wasVisible=false;
  const observer=new MutationObserver(()=>{
    const visible=!resultModal.hidden;
    if(visible&&!wasVisible){
      const title=resultModal.querySelector('#resultTitle')?.textContent?.trim()||'Раунд завершён';
      const score=resultModal.querySelector('#resultScore')?.textContent?.trim()||'—';
      const entry={title,score,result:resultType(title),mode:loadMode(),difficulty:localStorage.getItem('tttDifficulty')||'medium',time:Date.now()};
      const history=getHistory();
      const previous=history[0];
      if(!previous||previous.time!==entry.time){saveHistory([entry,...history])}
      renderHistory();
    }
    wasVisible=visible;
  });
  observer.observe(resultModal,{attributes:true,attributeFilter:['hidden']});

  function open(){renderHistory();modal.hidden=false;modal.querySelector('[data-close-history]')?.focus()}
  function close(){modal.hidden=true;historyButton.focus()}
  historyButton.addEventListener('click',open);
  modal.addEventListener('click',e=>{if(e.target.matches('[data-close-history]'))close()});
  modal.querySelector('#clearHistory').addEventListener('click',()=>{localStorage.removeItem(HISTORY_KEY);renderHistory()});
  document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape')close()});
  window.addEventListener('storage',renderHistory);
  renderHistory();
})();