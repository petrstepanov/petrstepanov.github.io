// Shows loading animation splash screen

var $ = require('jquery');
var bodyScrollLock = require('body-scroll-lock');
var uiHelper = require('./ui-helper');

var SplashScreen = function(){
	var DOM = {};
	var template = [
		'<div id="splash-screen">',
		'<img id="splash-logo" src="./img/ps-monogram-crop.svg" class="delay-1s faster" />',
		'<p id="splash-text" class="delay-1s faster"><small>loading</small></p>',
		'</div>'
	].join("\n");

	function _showSplash(){
		return new Promise(function(resolve, reject){
			DOM.$body = $('body');
			DOM.$body.append(template);
			DOM.$splash = DOM.$body.find('#splash-screen')
			DOM.$logo = DOM.$splash.find('#splash-logo');
			DOM.$text = DOM.$splash.find('#splash-text');

			// ScrollFreezer.freeze();
			bodyScrollLock.disableBodyScroll(DOM.$splash.get(0));

			function showLogo(){
				return uiHelper.animateCSS(DOM.$logo.get(0), 'bounceIn');
			}

			function showText(){
				return uiHelper.animateCSS(DOM.$text.get(0), 'fadeInUp');
			}

			Promise.all([showLogo(), showText()]).then(resolve);
		});
	}

	function _windowLoad() {
		return new Promise(function(resolve, reject) {
			$(window).on("load", function(){
				resolve();
			});
		});
	}

	function _hideSplash(){
		return new Promise(function(resolve, reject) {

			function hideLogo(){
				return new Promise(function(resolve, reject){
					uiHelper.animateCSS(DOM.$logo.get(0), 'bounceOut').then(function () {
						DOM.$logo.css('visibility', 'hidden');
						resolve();
					});
				});
			}
	
			function hideText(){
				return new Promise(function(resolve, reject){
					DOM.$text.removeClass('delay-1s');					
					uiHelper.animateCSS(DOM.$text.get(0), 'fadeOutDown').then(function () {
						DOM.$text.css('visibility', 'hidden');
						resolve();
					});
				});
			}
	
			function hideBackground(){
				return new Promise(function(resolve, reject){
					DOM.$splash.fadeOut(500, function () {
						DOM.$splash.remove();
						// ScrollFreezer.unfreeze();	
						bodyScrollLock.enableBodyScroll(DOM.$splash.get(0));						
						resolve();
					});
				});
			}

			hideLogo().then(hideText).then(hideBackground).then(resolve);
		});
	}

	function init() {
		Promise.all([_windowLoad(), _showSplash()]).then(_hideSplash);
	}

	return {
		init: init
	};
};

module.exports = SplashScreen;