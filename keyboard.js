(()=>{
const b=document.querySelector('#board');if(!b)return;
let focus=0;
function sync(){const cells=[...b.children];cells[focus]?.focus()}
function move(dx,dy){const x=focus%3,y=Math.floor(focus/3);const nx=Math.max(0,Math.min(2,x+dx)),ny=Math.max(0,Math.min(2,y+dy));focus=ny*3+nx;sync()}
b.addEventListener('focusin',e=>{const i=[...b.children].indexOf(e.target);if(i>=0)focus=i});
document.addEventListener('keydown',e=>{
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
  if(document.activeElement?.closest('#board')){e.preventDefault();move(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0)}
 }
 if(e.key==='Enter'&&document.activeElement?.closest('#board'))document.activeElement.click();
});
const obs=new MutationObserver(()=>{focus=Math.min(focus,b.children.length-1);if(document.activeElement?.closest('#board'))sync()});obs.observe(b,{childList:true});
})();