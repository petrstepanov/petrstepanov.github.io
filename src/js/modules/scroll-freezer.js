// Scroll Freezer

var ScrollFreezer = (function(){

  function freeze(){
    $('html, body').addClass('no-scroll');
    $('html, body').bind('touchend', function(event){
      event.preventDefault();
    });
  }

  function unfreeze(){
    $('html, body').removeClass('no-scroll');    
    $('html, body').unbind('touchend');
  }

  return {
    freeze: freeze,
    unfreeze: unfreeze
  };
})();
