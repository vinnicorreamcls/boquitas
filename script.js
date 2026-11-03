var nav=document.getElementById('nav');
var onScroll=function(){nav.classList.toggle('scrolled',window.scrollY>40);};
onScroll();window.addEventListener('scroll',onScroll,{passive:true});

var burger=document.getElementById('burger'),mobile=document.getElementById('mobile');
burger.addEventListener('click',function(){
  var open=mobile.classList.toggle('open');
  burger.setAttribute('aria-expanded',String(open));
  burger.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
});
mobile.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){
  mobile.classList.remove('open');
  burger.setAttribute('aria-expanded','false');
});});

var form=document.getElementById('rform'),toast=document.getElementById('toast');
form.addEventListener('submit',function(e){
  e.preventDefault();
  var d=new FormData(form);
  if(!d.get('name')||!d.get('date')||!d.get('time')){
    showToast('Preencha seu nome, a data e o horário para continuar.');
    return;
  }
  var message=[
    'Olá! Gostaria de solicitar uma reserva no Boquitas.',
    'Nome: '+d.get('name'),
    'Pessoas: '+d.get('size'),
    'Data: '+d.get('date'),
    'Horário: '+d.get('time'),
    d.get('contact')?'Contato para retorno: '+d.get('contact'):''
  ].filter(Boolean).join('\n');
  var url='https://wa.me/5521995928037?text='+encodeURIComponent(message);
  window.open(url,'_blank','noopener,noreferrer');
  showToast('Seu pedido foi preparado. Confirme o envio na conversa do WhatsApp.');
  form.reset();
});

var t;
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(t);t=setTimeout(function(){toast.classList.remove('show');},3500);}

// Carrega o vídeo local só quando a seção de reservas se aproxima da tela.
var reserveVideo=document.querySelector('.reserve-video');
var reserveSource=reserveVideo&&reserveVideo.querySelector('source[data-src]');
if(reserveVideo&&reserveSource&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  var startReserveVideo=function(){
    if(!reserveSource.src){reserveSource.src=reserveSource.dataset.src;reserveVideo.load();}
    reserveVideo.play().catch(function(){});
  };
  if('IntersectionObserver' in window){
    var videoObserver=new IntersectionObserver(function(entries){
      if(entries.some(function(entry){return entry.isIntersecting;})){
        startReserveVideo();videoObserver.disconnect();
      }
    },{rootMargin:'300px'});
    videoObserver.observe(reserveVideo);
  }else{startReserveVideo();}
}

// Fixa o final de uma carta enquanto a próxima seção sobe sobre ela.
var menuStages=Array.from(document.querySelectorAll('.menu-stage'));
var pinnedMenuStage=-1;
var menuStackFrame=false;
var reduceMenuStack=window.matchMedia('(prefers-reduced-motion: reduce)');
function clearPinnedMenuStage(){
  if(pinnedMenuStage<0)return;
  var oldStage=menuStages[pinnedMenuStage];
  var oldPanel=oldStage.querySelector('.menu');
  oldPanel.classList.remove('menu-stack-pinned');
  oldPanel.style.removeProperty('--stack-top');
  oldPanel.style.removeProperty('--stack-left');
  oldPanel.style.removeProperty('--stack-width');
  oldStage.style.removeProperty('height');
  pinnedMenuStage=-1;
}
function pinMenuStage(index){
  clearPinnedMenuStage();
  if(index<0)return;
  var stage=menuStages[index];
  var panel=stage.querySelector('.menu');
  var rect=panel.getBoundingClientRect();
  stage.style.height=rect.height+'px';
  panel.style.setProperty('--stack-top',(window.innerHeight-rect.height)+'px');
  panel.style.setProperty('--stack-left',rect.left+'px');
  panel.style.setProperty('--stack-width',rect.width+'px');
  panel.classList.add('menu-stack-pinned');
  pinnedMenuStage=index;
}
function updateMenuStack(){
  menuStackFrame=false;
  if(menuStages.length<3||reduceMenuStack.matches){clearPinnedMenuStage();return;}
  var viewportBottom=window.innerHeight;
  var firstBottom=menuStages[0].getBoundingClientRect().bottom;
  var secondBottom=menuStages[1].getBoundingClientRect().bottom;
  var thirdBottom=menuStages[2].getBoundingClientRect().bottom;
  var active=-1;
  if(firstBottom<=viewportBottom&&secondBottom>viewportBottom)active=0;
  else if(secondBottom<=viewportBottom&&thirdBottom>viewportBottom)active=1;
  if(active!==pinnedMenuStage)pinMenuStage(active);
}
function scheduleMenuStackUpdate(){
  if(menuStackFrame)return;
  menuStackFrame=true;
  window.requestAnimationFrame(updateMenuStack);
}
window.addEventListener('scroll',scheduleMenuStackUpdate,{passive:true});
window.addEventListener('resize',function(){clearPinnedMenuStage();scheduleMenuStackUpdate();});
reduceMenuStack.addEventListener('change',scheduleMenuStackUpdate);
scheduleMenuStackUpdate();
