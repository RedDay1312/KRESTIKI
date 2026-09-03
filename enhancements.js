(()=>{
  const theme=document.querySelector('#theme');
  const motion=document.querySelector('#motionToggle');
  const fullscreen=document.querySelector('#fullscreenToggle');
  const installBtn=document.querySelector('#installBtn');
  const savedTheme=localStorage.getItem('tttTheme')||'midnight';
  const savedMotion=localStorage.getItem('tttMotion')!=='off';
  let deferredPrompt=null;
  function applyTheme(value){
    const safe=['midnight','neon','emerald','sunset'].includes(value)?value:'midnight';
    document.body.classList.remove('theme-midnight','theme-neon','theme-emerald','theme-sunset');
    document.body.classList.add(`theme-${safe}`);
    if(theme) theme.value=safe;
    localStorage.setItem('tttTheme',safe);
  }
  function applyMotion(enabled){
    document.body.classList.toggle('reduced-motion',!enabled);
    if(motion) motion.checked=enabled;
    localStorage.setItem('tttMotion',enabled?'on':'off');
  }
  async function toggleFullscreen(){
    try{
      if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    }catch{}
    updateFullscreenIcon();
  }
  function updateFullscreenIcon(){
    if(!fullscreen)return;
    fullscreen.setAttribute('aria-label',document.fullscreenElement?'Выйти из полноэкранного режима':'Полноэкранный режим');
  }
  function offerInstall(){if(installBtn)installBtn.hidden=false}
  async function install(){
    if(!deferredPrompt)return;
    deferredPrompt.prompt();
    try{await deferredPrompt.userChoice}catch{}
    deferredPrompt=null;
    if(installBtn)installBtn.hidden=true;
  }
  applyTheme(savedTheme);
  applyMotion(savedMotion);
  theme?.addEventListener('change',e=>applyTheme(e.target.value));
  motion?.addEventListener('change',e=>applyMotion(e.target.checked));
  fullscreen?.addEventListener('click',toggleFullscreen);
  installBtn?.addEventListener('click',install);
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;offerInstall()});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;if(installBtn)installBtn.hidden=true});
  document.addEventListener('fullscreenchange',updateFullscreenIcon);
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  document.addEventListener('keydown',event=>{
    if(event.key.toLowerCase()==='f'&&!event.ctrlKey&&!event.altKey&&!event.metaKey){event.preventDefault();toggleFullscreen()}
  });
})();