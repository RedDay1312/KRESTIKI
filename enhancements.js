(()=>{
  const theme=document.querySelector('#theme');
  const motion=document.querySelector('#motionToggle');
  const fullscreen=document.querySelector('#fullscreenToggle');
  const savedTheme=localStorage.getItem('tttTheme')||'midnight';
  const savedMotion=localStorage.getItem('tttMotion')!=='off';

  function applyTheme(value){
    document.body.classList.remove('theme-midnight','theme-neon','theme-emerald','theme-sunset');
    document.body.classList.add(`theme-${value}`);
    if(theme) theme.value=value;
    localStorage.setItem('tttTheme',value);
  }
  function applyMotion(enabled){
    document.body.classList.toggle('reduced-motion',!enabled);
    if(motion) motion.checked=enabled;
    localStorage.setItem('tttMotion',enabled?'on':'off');
  }
  async function toggleFullscreen(){
    try{
      if(!document.fullscreenElement){await document.documentElement.requestFullscreen();}
      else{await document.exitFullscreen();}
    }catch{}
    updateFullscreenIcon();
  }
  function updateFullscreenIcon(){
    if(!fullscreen)return;
    fullscreen.textContent=document.fullscreenElement?'⛶':'⛶';
    fullscreen.setAttribute('aria-label',document.fullscreenElement?'Выйти из полноэкранного режима':'Полноэкранный режим');
  }

  applyTheme(savedTheme);
  applyMotion(savedMotion);
  theme?.addEventListener('change',e=>applyTheme(e.target.value));
  motion?.addEventListener('change',e=>applyMotion(e.target.checked));
  fullscreen?.addEventListener('click',toggleFullscreen);
  document.addEventListener('fullscreenchange',updateFullscreenIcon);

  document.addEventListener('keydown',event=>{
    if(event.key.toLowerCase()==='f'&& !event.ctrlKey && !event.altKey && !event.metaKey){
      event.preventDefault();
      toggleFullscreen();
    }
  });
})();
