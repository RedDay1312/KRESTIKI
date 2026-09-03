const boardEl=document.querySelector('#board');
const statusEl=document.querySelector('#status');
const turnEl=document.querySelector('#turn');
const scoreXEl=document.querySelector('#scoreX');
const scoreOEl=document.querySelector('#scoreO');
const scoreXLabel=document.querySelector('#scoreXLabel');
const scoreOLabel=document.querySelector('#scoreOLabel');
const difficultyEl=document.querySelector('#difficulty');
const difficultyWrap=document.querySelector('#difficultyWrap');
const markWrap=document.querySelector('#markWrap');
const playerMarkEl=document.querySelector('#playerMark');
const matchLengthEl=document.querySelector('#matchLength');
const starterEl=document.querySelector('#starter');
const soundToggle=document.querySelector('#soundToggle');
const gamesPlayedEl=document.querySelector('#gamesPlayed');
const gamesWonEl=document.querySelector('#gamesWon');
const gamesLostEl=document.querySelector('#gamesLost');
const gamesDrawEl=document.querySelector('#gamesDraw');
const winStreakEl=document.querySelector('#winStreak');
const progressFill=document.querySelector('#progressFill');
const matchInfoEl=document.querySelector('#matchInfo');
const roundInfoEl=document.querySelector('#roundInfo');
const undoBtn=document.querySelector('#undo');
const hintBtn=document.querySelector('#hintBtn');
const surrenderBtn=document.querySelector('#surrenderBtn');
const achievementFirst=document.querySelector('#achievementFirst');
const achievementStreak=document.querySelector('#achievementStreak');
const achievementPerfect=document.querySelector('#achievementPerfect');
const modeButtons=[...document.querySelectorAll('.mode')];
const resultModal=document.querySelector('#resultModal');
const resultIcon=document.querySelector('#resultIcon');
const resultTitle=document.querySelector('#resultTitle');
const resultText=document.querySelector('#resultText');
const resultScore=document.querySelector('#resultScore');
const nextRoundBtn=document.querySelector('#nextRound');
const closeResultBtn=document.querySelector('#closeResult');
const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const corners=[0,2,6,8];
const empty=()=>Array(9).fill('');
let board=empty(),current='X',gameOver=false,thinking=false,mode=localStorage.getItem('tttMode')||'ai',human=localStorage.getItem('tttHuman')||'X',ai='O';
let soundOn=localStorage.getItem('tttSound')!=='off';
let score={X:Number(localStorage.getItem('tttX')||0),O:Number(localStorage.getItem('tttO')||0)};
let stats={games:Number(localStorage.getItem('tttGames')||0),wins:Number(localStorage.getItem('tttWins')||0),losses:Number(localStorage.getItem('tttLosses')||0),draws:Number(localStorage.getItem('tttDraws')||0),streak:Number(localStorage.getItem('tttStreak')||0),perfect:Number(localStorage.getItem('tttPerfect')||0)};
let matchScores={X:0,O:0},round=0,history=[],aiTimer=null,audioContext=null,matchFinished=false,hintUsed=false,hintTimer=null;
function targetWins(){return Number(matchLengthEl.value)}
function isAiTurn(){return mode==='ai'&&current===ai&&!gameOver&&!matchFinished}
function getWinner(state){for(const line of wins){const[a,b,c]=line;if(state[a]&&state[a]===state[b]&&state[a]===state[c])return line}return null}
function isDraw(state){return state.every(Boolean)&&!getWinner(state)}
function playerLabel(symbol){return mode==='local'?(symbol==='X'?'Крестики':'Нолики'):(symbol===human?'Вы':'ИИ')}
function save(){localStorage.setItem('tttX',score.X);localStorage.setItem('tttO',score.O);localStorage.setItem('tttGames',stats.games);localStorage.setItem('tttWins',stats.wins);localStorage.setItem('tttLosses',stats.losses);localStorage.setItem('tttDraws',stats.draws);localStorage.setItem('tttStreak',stats.streak);localStorage.setItem('tttPerfect',stats.perfect);localStorage.setItem('tttSound',soundOn?'on':'off');localStorage.setItem('tttMode',mode);localStorage.setItem('tttHuman',human);localStorage.setItem('tttDifficulty',difficultyEl.value);localStorage.setItem('tttMatchLength',matchLengthEl.value);localStorage.setItem('tttStarter',starterEl.value)}
function updateStats(){gamesPlayedEl.textContent=stats.games;gamesWonEl.textContent=stats.wins;gamesLostEl.textContent=stats.losses;gamesDrawEl.textContent=stats.draws;winStreakEl.textContent=stats.streak;achievementFirst.classList.toggle('unlocked',stats.wins>=1);achievementStreak.classList.toggle('unlocked',stats.streak>=3);achievementPerfect.classList.toggle('unlocked',stats.perfect>=1)}
function updateMatch(){const target=targetWins();matchInfoEl.textContent=target===1?'До 1 победы':`Матч до ${target} побед`;roundInfoEl.textContent=`Раунд ${round}`;const leader=Math.max(matchScores.X,matchScores.O);progressFill.style.width=matchFinished?'100%':`${Math.min(100,(leader/target)*100)}%`;undoBtn.disabled=history.length===0||thinking||gameOver||matchFinished;hintBtn.disabled=mode!=='ai'||current!==human||gameOver||thinking||matchFinished||hintUsed;surrenderBtn.disabled=mode!=='ai'||gameOver||thinking||matchFinished}
function beep(freq=440,duration=.07,type='sine'){if(!soundOn)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.06,audioContext.currentTime+.01);gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration+.02)}catch{}}
function render(winLine=null){boardEl.innerHTML='';board.forEach((value,index)=>{const cell=document.createElement('button');cell.type='button';cell.className=`cell${value?' '+value.toLowerCase():''}${winLine?.includes(index)?' win':''}`;cell.textContent=value;cell.disabled=Boolean(value)||gameOver||thinking||matchFinished;cell.setAttribute('aria-label',`Клетка ${index+1}${value?', '+playerLabel(value):''}`);cell.addEventListener('click',()=>move(index));boardEl.appendChild(cell)});scoreXEl.textContent=score.X;scoreOEl.textContent=score.O;scoreXLabel.textContent=playerLabel('X');scoreOLabel.textContent=playerLabel('O');turnEl.textContent=matchFinished?'Матч завершён':gameOver?'Раунд завершён':mode==='ai'?(current===human?'Ваш ход':'Ход ИИ…'):`Ход ${playerLabel(current)}`;soundToggle.textContent=soundOn?'🔊':'🔇';soundToggle.setAttribute('aria-label',soundOn?'Выключить звук':'Включить звук');updateStats();updateMatch()}
function showResult(title,text,icon='🏆'){resultIcon.textContent=icon;resultTitle.textContent=title;resultText.textContent=text;resultScore.textContent=mode==='local'?`${matchScores.X} : ${matchScores.O}`:`${matchScores[human]} : ${matchScores[ai]}`;resultModal.hidden=false;nextRoundBtn.textContent=matchFinished?'Новый матч':'Следующий раунд';nextRoundBtn.focus()}
function hideResult(){resultModal.hidden=true}
function finish(line){gameOver=true;const winner=board[line[0]];score[winner]++;matchScores[winner]++;stats.games++;if(mode==='ai'){if(winner===human){stats.wins++;stats.streak++;if(difficultyEl.value==='hard'&&!hintUsed)stats.perfect++}else{stats.losses++;stats.streak=0}}else{if(winner==='X')stats.wins++;else stats.losses++}save();statusEl.textContent=mode==='ai'?(winner===human?'Вы забрали раунд! 🎉':'ИИ забрал раунд.'):`Раунд выиграли ${playerLabel(winner)}!`;beep(winner===human?660:220,.18,'triangle');setTimeout(()=>beep(winner===human?880:180,.18,'triangle'),80);render(line);const target=targetWins();if(matchScores[winner]>=target){matchFinished=true;setTimeout(()=>{render(line);showResult(winner===human?'Вы выиграли матч!':'Матч выиграл ИИ',winner===human?'Отличная победная серия.':'Попробуйте другую тактику.',winner===human?'🏆':'🤖');beep(winner===human?880:160,.25,'sawtooth')},500)}else setTimeout(()=>showResult(winner===human?'Раунд за вами!':'Раунд за ИИ',`Счёт матча: ${matchScores[human]} : ${matchScores[ai]}`,winner===human?'🎉':'🤖'),350)}
function finishDraw(){gameOver=true;stats.games++;stats.draws++;if(mode==='ai')stats.streak=0;save();statusEl.textContent='Ничья. Раунд без победителя.';beep(330,.15,'square');render();setTimeout(()=>showResult('Ничья','Никто не забрал раунд.','🤝'),350)}
function startRound(){if(aiTimer){clearTimeout(aiTimer);aiTimer=null}if(hintTimer){clearTimeout(hintTimer);hintTimer=null}hideResult();board=empty();thinking=false;gameOver=false;history=[];hintUsed=false;round++;const starter=starterEl.value;current=starter==='random'?(Math.random()<.5?'X':'O'):'X';statusEl.textContent=mode==='ai'?(current===human?'Ваш ход — выберите клетку':'ИИ начинает…'):`Ход ${playerLabel(current)}`;render();if(isAiTurn()){thinking=true;render();aiTimer=setTimeout(aiMove,420)}}
function newMatch(){if(aiTimer){clearTimeout(aiTimer);aiTimer=null}matchScores={X:0,O:0};round=0;matchFinished=false;startRound()}
function move(index){if(gameOver||thinking||matchFinished||board[index]||isAiTurn())return;if(hintTimer){clearTimeout(hintTimer);hintTimer=null}history.push({board:[...board],current});board[index]=current;beep(current===human?520:360);render();const line=getWinner(board);if(line)return finish(line);if(isDraw(board))return finishDraw();current=current==='X'?'O':'X';statusEl.textContent=mode==='ai'?'ИИ думает…':`Ход ${playerLabel(current)}`;render();if(isAiTurn()){thinking=true;render();aiTimer=setTimeout(aiMove,360)}}
function findImmediateMove(state,player){for(let i=0;i<9;i++){if(!state[i]){state[i]=player;const ok=Boolean(getWinner(state));state[i]='';if(ok)return i}}return null}
function randomMove(state){const free=state.map((v,i)=>v?null:i).filter(v=>v!==null);return free.length?free[Math.floor(Math.random()*free.length)]:null}
function chooseEasy(state){return randomMove(state)}
function chooseMedium(state){const win=findImmediateMove(state,ai);if(win!==null)return win;const block=findImmediateMove(state,human);if(block!==null)return block;if(!state[4])return 4;const freeCorners=corners.filter(i=>!state[i]);if(freeCorners.length)return freeCorners[Math.floor(Math.random()*freeCorners.length)];return randomMove(state)}
function minimax(state,maximizing,depth=0){const line=getWinner(state);if(line)return{score:state[line[0]]===ai?10-depth:depth-10};if(state.every(Boolean))return{score:0};const moves=[];for(let i=0;i<9;i++){if(state[i])continue;state[i]=maximizing?ai:human;moves.push({index:i,score:minimax(state,!maximizing,depth+1).score});state[i]=''};return maximizing?moves.reduce((a,b)=>b.score>a.score?b:a):moves.reduce((a,b)=>b.score<a.score?b:a)}
function chooseHard(state){return minimax([...state],true).index}
function chooseAiMove(){const level=difficultyEl.value;return level==='easy'?chooseEasy(board):level==='hard'?chooseHard(board):chooseMedium(board)}
function aiMove(){aiTimer=null;if(!isAiTurn()){thinking=false;render();return}const index=chooseAiMove();thinking=false;if(index===null){render();return}history.push({board:[...board],current});board[index]=ai;beep(ai===human?520:360);const line=getWinner(board);if(line)return finish(line);if(isDraw(board))return finishDraw();current=human;statusEl.textContent='Ваш ход — выберите клетку';render()}
function undo(){if(thinking||gameOver||matchFinished||history.length===0)return;if(aiTimer){clearTimeout(aiTimer);aiTimer=null;thinking=false}if(hintTimer){clearTimeout(hintTimer);hintTimer=null}const previous=history.pop();board=previous.board;current=previous.current;if(mode==='ai'&&previous.current===ai&&history.length){const second=history.pop();board=second.board;current=second.current}statusEl.textContent=mode==='ai'?'Ход отменён — ваш ход.':`Ход ${playerLabel(current)}`;beep(240,.06);render()}
function chooseBestHint(state,player){if(player==='O'&&mode==='ai')return chooseHard(state);const opponent=player==='X'?'O':'X';const win=findImmediateMove(state,player);if(win!==null)return win;const block=findImmediateMove(state,opponent);if(block!==null)return block;if(!state[4])return 4;const freeCorners=corners.filter(i=>!state[i]);if(freeCorners.length)return freeCorners[0];return randomMove(state)}
function giveHint(){if(hintBtn.disabled)return;const index=chooseBestHint(board,current);if(index===null)return;hintUsed=true;statusEl.textContent=`Подсказка: попробуйте клетку ${index+1}`;render();boardEl.children[index]?.classList.add('hint');beep(740,.08);hintTimer=setTimeout(()=>{boardEl.children[index]?.classList.remove('hint');hintTimer=null;if(!gameOver&&!thinking)statusEl.textContent=current===human?'Ваш ход — выберите клетку':'Ход соперника'},1500)}
function surrender(){if(surrenderBtn.disabled)return;const winner=ai;score[winner]++;matchScores[winner]++;stats.games++;stats.losses++;stats.streak=0;gameOver=true;save();statusEl.textContent='Вы сдались.';render();if(matchScores[winner]>=targetWins()){matchFinished=true;render();showResult('Матч проигран','ИИ забирает матч.','🏳️')}else showResult('Раунд проигран','ИИ забирает раунд.','🏳️');beep(150,.25,'sawtooth')}
function syncPlayers(){human=mode==='ai'?playerMarkEl.value:'X';ai=human==='X'?'O':'X';save()}
function setMode(nextMode){mode=nextMode;syncPlayers();modeButtons.forEach(button=>button.classList.toggle('active',button.dataset.mode===mode));difficultyWrap.hidden=mode!=='ai';markWrap.hidden=mode!=='ai';newMatch()}
modeButtons.forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
playerMarkEl.addEventListener('change',()=>{syncPlayers();newMatch()});
difficultyEl.addEventListener('change',()=>{save();if(!gameOver)statusEl.textContent='Сложность изменена';render()});
matchLengthEl.addEventListener('change',()=>{save();newMatch()});
starterEl.addEventListener('change',()=>{save();newMatch()});
soundToggle.addEventListener('click',()=>{soundOn=!soundOn;save();render();if(soundOn)beep(620,.08)});
document.querySelector('#restart').addEventListener('click',newMatch);
undoBtn.addEventListener('click',undo);
hintBtn.addEventListener('click',giveHint);
surrenderBtn.addEventListener('click',surrender);
document.querySelector('#resetScore').addEventListener('click',()=>{score={X:0,O:0};stats={games:0,wins:0,losses:0,draws:0,streak:0,perfect:0};save();newMatch()});
nextRoundBtn.addEventListener('click',()=>{if(matchFinished)newMatch();else startRound()});
closeResultBtn.addEventListener('click',hideResult);resultModal.querySelector('[data-close-result]').addEventListener('click',hideResult);
document.addEventListener('keydown',event=>{if(!resultModal.hidden){if(event.key==='Enter')return nextRoundBtn.click();if(event.key==='Escape')return hideResult();return}if(event.key==='Escape'){newMatch();return}if(event.key.toLowerCase()==='z'&&!event.ctrlKey&&!event.metaKey){event.preventDefault();undo();return}if(event.key.toLowerCase()==='h'){giveHint();return}const digit=Number(event.key);if(digit>=1&&digit<=9)move(digit-1)});
modeButtons.forEach(button=>button.classList.toggle('active',button.dataset.mode===mode));
difficultyEl.value=localStorage.getItem('tttDifficulty')||'medium';matchLengthEl.value=localStorage.getItem('tttMatchLength')||'3';starterEl.value=localStorage.getItem('tttStarter')||'X';playerMarkEl.value=human;syncPlayers();difficultyWrap.hidden=mode!=='ai';markWrap.hidden=mode!=='ai';newMatch();