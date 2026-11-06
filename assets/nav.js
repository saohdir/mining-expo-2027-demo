/* Independent SIAL-inspired navigation – responsive and keyboard accessible. */
(()=>{
  const menu=document.getElementById('navLinks'), toggle=document.getElementById('navToggle');
  if(!menu)return;
  function closeSubmenus(except){document.querySelectorAll('.nav-menu.is-open').forEach(el=>{if(el!==except){el.classList.remove('is-open');el.querySelector(':scope > button')?.setAttribute('aria-expanded','false')}})}
  document.querySelectorAll('.nav-menu > button').forEach(trigger=>{
    trigger.addEventListener('click',ev=>{
      ev.preventDefault();const item=trigger.closest('.nav-menu');const opening=!item.classList.contains('is-open');closeSubmenus(item);item.classList.toggle('is-open',opening);trigger.setAttribute('aria-expanded',String(opening));
    });
  });
  document.addEventListener('click',ev=>{
    if(!ev.target.closest('.nav-menu'))closeSubmenus();
    if(ev.target.closest('#navLinks a')){menu.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}
  });
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){closeSubmenus();menu.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}});
  // Hide open menu when the viewport crosses a breakpoint.
  window.matchMedia('(min-width: 851px)').addEventListener('change',()=>{menu.classList.remove('open');closeSubmenus();toggle?.setAttribute('aria-expanded','false')});
})();
