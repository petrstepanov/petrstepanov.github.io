// Material alike navigation menu

var $ = require('jquery');
var bodyScrollLock = require('body-scroll-lock');
var uiHelper = require('./ui-helper');

var DOM = {};
var options = {};

function _cacheDom(element) {
    DOM.$el = $(element);
    DOM.$morphButton = DOM.$el.find('.morph-button');
    DOM.$icon = DOM.$el.find('.js--icon');
    DOM.$links = DOM.$el.find('li a');
}

function _bindEvents(element) {
    DOM.$morphButton.on('click', function(event){
        // Prevent from scrolling up
        event.preventDefault();
        _toggleMenu();        
    });
    DOM.$links.on('click', _toggleMenu);
}

function _toggleMenu(){
    if (!DOM.$el.hasClass('is-open')){
        uiHelper.animateCSS(DOM.$icon.get(0), "fadeOut", function(){
            DOM.$icon.removeClass('ion-ios-menu');
            DOM.$icon.addClass('ion-ios-close');
            uiHelper.animateCSS(DOM.$icon.get(0), "fadeIn");
        });
        bodyScrollLock.disableBodyScroll(DOM.$el.get(0));
    }
    else {
        uiHelper.animateCSS(DOM.$icon.get(0), "fadeOut", function(){
            DOM.$icon.removeClass('ion-ios-close');
            DOM.$icon.addClass('ion-ios-menu');
            uiHelper.animateCSS(DOM.$icon.get(0), "fadeIn");
        });
        bodyScrollLock.enableBodyScroll(DOM.$el.get(0));
    }
    DOM.$el.toggleClass('is-open');
}

function init(element) {
    if (element) {
        options = $.extend(options, $(element).data());
        _cacheDom(element);
        _bindEvents();
        // _render();
    }
}

exports.init = init;
// module.exports = init;
