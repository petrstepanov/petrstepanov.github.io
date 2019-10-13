// Navigation

var MorphNavigation = (function(){
    var DOM = {};
    var options = {};

    function _cacheDom(element) {
        DOM.$el = $(element);
        DOM.$morphButton = DOM.$el.find('.morph-button');
        DOM.$icon = DOM.$el.find('.js--icon');
        DOM.$html = $('html');
        DOM.$body = $('body');
    }

    function _bindEvents(element) {
        DOM.$morphButton.on('click', function(event){
            if (!DOM.$el.hasClass('is-open')){
                UIHelper.animateCSS(DOM.$icon.get(0), "fadeOut", function(){
                    DOM.$icon.removeClass('ion-ios-menu');
                    DOM.$icon.addClass('ion-ios-close');
                    UIHelper.animateCSS(DOM.$icon.get(0), "fadeIn");
                });
            }
            else {
                UIHelper.animateCSS(DOM.$icon.get(0), "fadeOut", function(){
                    DOM.$icon.removeClass('ion-ios-close');
                    DOM.$icon.addClass('ion-ios-menu');
                    UIHelper.animateCSS(DOM.$icon.get(0), "fadeIn");
                });
            }
            DOM.$el.toggleClass('is-open');
            DOM.$html.toggleClass('no-scroll');
            DOM.$body.toggleClass('no-scroll');               
        });
    }

    // function _render(){

    // }

    function init(element) {
        if (element) {
            options = $.extend(options, $(element).data());
            _cacheDom(element);
            _bindEvents();
            // _render();
        }
    }

    return {
        init: init
    };
})();

