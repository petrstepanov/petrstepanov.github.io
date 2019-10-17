// Shows loading animation splash screen

var $ = require('jquery');
var bodyScrollLock = require('body-scroll-lock');
var uiHelper = require('./ui-helper');

var DOM = {};
var template = [
	'<div id="splash-screen">',
	'<img id="splash-logo" src="./img/ps-monogram-crop.svg" class="delay-1s faster" />',
	'<p id="splash-text" class="delay-1s faster"><small>loading</small></p>',
	'</div>'
].join("\n");

function init() {
	DOM.$html = $('html');
	DOM.$body = $('body');
	DOM.$html.append(template);
	DOM.$splash = DOM.$html.find("#splash-screen");
	DOM.$logo = DOM.$splash.find("#splash-logo");
	DOM.$text = DOM.$splash.find("#splash-text");

	// ScrollFreezer.freeze();
	bodyScrollLock.disableBodyScroll(DOM.$splash.get(0));

	uiHelper.animateCSS(DOM.$text.get(0), 'fadeInUp');

	var promiseWindowLoad = new Promise(function (resolve, reject) {
		$(window).on("load", resolve("Stuff loaded!"));
	});

	var promiseLogoAnimate = new Promise(function (resolve, reject) {
		uiHelper.animateCSS(DOM.$logo.get(0), 'bounceIn', function () {
			resolve("Logo animated!");
		});
	});

	var that = this;
	Promise.all([promiseWindowLoad, promiseLogoAnimate]).then(function (values) {
		uiHelper.animateCSS(DOM.$logo.get(0), 'bounceOut', function () {
			DOM.$logo.css('visibility', 'hidden');
			DOM.$text.removeClass('delay-1s');
			uiHelper.animateCSS(DOM.$text.get(0), 'fadeOutDown', function () {
				DOM.$text.remove();
			});

			setTimeout(function () {
				DOM.$splash.fadeOut(500, function () {
					DOM.$splash.remove();
					// ScrollFreezer.unfreeze();	
					bodyScrollLock.enableBodyScroll(DOM.$splash.get(0));					
				});
			}, 500);
		});
	});
}

exports.init = init;