/* Presentation-only photo crossfade and animated motion reel. */
(function(){
 const slides=Array.from(document.querySelectorAll('.icee-slide'));
 if(slides.length>1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  let i=0;setInterval(()=>{slides[i].classList.remove('active');i=(i+1)%slides.length;slides[i].classList.add('active')},6500);
 }
 const toggle=document.getElementById('motionToggle');const reel=document.getElementById('motionReel');
 if(toggle && reel)toggle.addEventListener('click',()=>{const p=reel.classList.toggle('paused');toggle.textContent=p?'▶ Play motion':'❚❚ Pause motion';toggle.setAttribute('aria-pressed',String(p));});
})();
