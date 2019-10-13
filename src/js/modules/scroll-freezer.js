// Scroll Freezer

var ScrollFreezer = (function(){

  function freeze(){
    $('html, body').addClass('no-scroll');
  }

  function release(){
    $('html, body').removeClass('no-scroll');    
  }

  return {
    freeze: freeze,
    release: release
  };
})();
