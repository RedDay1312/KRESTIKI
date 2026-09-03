const boardEl=document.querySelector('#board');
const statusEl=document.querySelector('#status');
const turnEl=document.querySelector('#turn');
const scoreXEl=document.querySelector('#scoreX');
const scoreOEl=document.querySelector('#scoreO');
const scoreXLabel=document.querySelector('#scoreXLabel');
const scoreOLabel=document.querySelector('#scoreOLabel');
const difficultyEl=document.querySelector('#difficulty');
const difficultyWrap=document.querySelector('#difficultyWrap');
const soundToggle=document.querySelector('#soundToggle');
const gamesPlayedEl=document.querySelector('#gamesPlayed');
const gamesWonEl=document.querySelector('#gamesWon');
const winStreakEl=document.querySelector('#winStreak');
const modeButtons=[...document.querySelectorAll('.mode')];
const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const corners=[0,2,6,8];
const empty=()=>Array(9).fill('');
let board=empty(),current='X',gameOver=false,thinking=false,mode='ai',soundOn=localStorage.getItem('tttSound')!=='off';
let score={X:Number(localStorage.getItem('tttX')||0),O:Number(localStorage.getItem('tttO')||0)};
let stats={games:Number(localStorage.getItem('tttGames')||0),wins:Number(localStorage.getItem('tttWins')||0),streak:Number(localStorage.getItem('tttStreak')||0)};
let audioContext=null;

function isAiTurn(){return mode==='ai'&&current==='O'&&!gameOver}
function getWinner(state){for(const line of wins){const[a,b,c]=line;if(state[a]&&state[a]===state[b]&&state[a]===state[c])return line}return null}
function isDraw(state){return state.every(Boolean)&&!getWinner(state)}
function updateStats(){gamesPlayedEl.textContent=stats.games;gamesWonEl.textContent=stats.wins;winStreakEl.textContent=stats.streak}
function save(){localStorage.setItem('tttX',score.X);localStorage.setItem('tttO',score.O);localStorage.setItem('tttGames',stats.games);localStorage.setItem('tttWins',stats.wins);localStorage.setItem('tttStreak',stats.streak);localStorage.setItem('tttSound',soundOn?'on':'off')}
function beep(freq=440,duration=.07,type='sine'){if(!soundOn)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();const osc=audioContext.createOscillator();const gain=audioContext.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.06,audioContext.currentTime+.01);gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration+.02)}catch{}}
function render(winLine=null){boardEl.innerHTML='';board.forEach((value,index)=>{const cell=document.createElement('button');cell.type='button';cell.className=`cell${value?' '+value.toLowerCase():''}${winLine?.includes(index)?' win':''}`;cell.textContent=value;cell.disabled=Boolean(value)||gameOver||thinking;cell.setAttribute('aria-label',`Клетка ${index+1}${value?', '+value:''}`);cell.addEventListener('click',()=>move(index));boardEl.appendChild(cell)});scoreXEl.textContent=score.X;scoreOEl.textContent=score.O;scoreXLabel.textContent=mode==='ai'?'Вы':'Крестики';scoreOLabel.textContent=mode==='ai'?'ИИ':'Нолики';turnEl.textContent=gameOver?'Игра окончена':mode==='ai'?(current==='X'?'Ваш ход':'Ход ИИ…'):`Ход ${current==='X'?'крестиков':'ноликов'}`;updateStats();soundToggle.textContent=soundOn?'🔊':'🔇';soundToggle.setAttribute('aria-label',soundOn?'Выключить звук':'Включить звук')}
function finish(line){gameOver=true;const winner=board[line[0]];score[winner]++;stats.games++;if(mode==='ai'&&winner==='X'){stats.wins++;stats.streak++}else if(mode==='ai'&&winner==='O'){stats.streak=0}else if(mode==='local'){stats.wins+=winner==='X'?1:0}save();statusEl.textContent=mode==='ai'?(winner==='X'?'Вы победили! 🎉':'ИИ победил. Реванш?'):`Победили ${winner==='X'?'крестики':'нолики'}!`;beep(winner==='X'?660:220,.18,'triangle');setTimeout(()=>beep(winner==='X'?880:180,.18,'triangle'),80);render(line)}
function finishDraw(){gameOver=true;stats.games++;if(mode==='ai')stats.streak=0;save();statusEl.textContent='Ничья! Сыграем ещё?';beep(330,.15,'square');render()}
function move(index){if(gameOver||thinking||board[index]||isAiTurn())return;board[index]=current;beep(current==='X'?520:360);render();const line=getWinner(board);if(line)return finish(line);if(isDraw(board))return finishDraw();current=current==='X'?'O':'X';statusEl.textContent=mode==='ai'?'ИИ думает…':`Ход ${current==='X'?'крестиков':'ноликов'}`;render();if(isAiTurn()){thinking=true;render();setTimeout(aiMove,360)}}
function findImmediateMove(state,player){for(let i=0;i<9;i++){if(!state[i]){state[i]=player;const ok=Boolean(getWinner(state));state[i]='';if(ok)return i}}return null}
function randomMove(state){const free=state.map((v,i)=>v?null:i).filter(v=>v!==null);return free.length?free[Math.floor(Math.random()*free.length)]:null}
function chooseEasy(state){return randomMove(state)}
function chooseMedium(state){const win=findImmediateMove(state,'O');if(win!==null)return win;const block=findImmediateMove(state,'X');if(block!==null)return block;if(!state[4])return 4;const freeCorners=corners.filter(i=>!state[i]);if(freeCorners.length)return freeCorners[Math.floor(Math.random()*freeCorners.length)];return randomMove(state)}
function minimax(state,maximizing,depth=0){const line=getWinner(state);if(line)return{score:state[line[0]]==='O'?10-depth:depth-10};if(state.every(Boolean))return{score:0};const moves=[];for(let i=0;i<9;i++){if(state[i])continue;state[i]=maximizing?'O':'X';moves.push({index:i,score:minimax(state,!maximizing,depth+1).score});state[i]=''};return maximizing?moves.reduce((a,b)=>b.score>a.score?b:a):moves.reduce((a,b)=>b.score<a.score?b:a)}
function chooseHard(state){return minimax([...state],true).index}
function chooseAiMove(){const level=difficultyEl.value;return level==='easy'?chooseEasy(board):level==='hard'?chooseHard(board):chooseMedium(board)}
function aiMove(){if(!isAiTurn()){thinking=false;render();return}const index=chooseAiMove();thinking=false;if(index===null)return;board[index]='O';beep(360);const line=getWinner(board);if(line)return finish(line);if(isDraw(board))return finishDraw();current='X';statusEl.textContent='Ваш ход — выберите клетку';render()}
function restart(){board=empty();current='X';gameOver=false;thinking=false;statusEl.textContent='Ваш ход — выберите клетку';render()}
function setMode(nextMode){mode=nextMode;modeButtons.forEach(button=>button.classList.toggle('active',button.dataset.mode===mode));difficultyWrap.hidden=mode!=='ai';restart()}
modeButtons.forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
difficultyEl.addEventListener('change',restart);
soundToggle.addEventListener('click',()=>{soundOn=!soundOn;save();render();if(soundOn)beep(620,.08)});
document.querySelector('#restart').addEventListener('click',restart);
document.querySelector('#resetScore').addEventListener('click',()=>{score={X:0,O:0};stats={games:0,wins:0,streak:0};save();restart()});
render();