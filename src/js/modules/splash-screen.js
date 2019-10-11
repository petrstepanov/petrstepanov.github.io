// Shows loading animation

var SplashScreen = (function () {
	var DOM = {};
	var options = {};
	var template = [
		'<div id="splash-screen" class="fast">',
			'<img src="./img/ps-monogram-crop.svg" class="faster" />',
		'</div>'
	].join("\n");

	function _cacheDom() {
		DOM.$html = $('html');
	}

	function _bindEvents(element) {
		// When the page is fully loaded including graphics
		$(window).on("load", _hideSplash);
	}

	function _hideSplash() {
		// DOM.$html.find('#splash-screen').hide(200, function(){
		// 	DOM.$html.removeClass('showSplashScreen');
		// });
		setTimeout(
			function () {
				var el = DOM.$html.find('#splash-screen').get(0);
				UIHelper.animateCSS(el, 'fadeOut', function () {
					DOM.$html.find('#splash-screen').remove();
					DOM.$html.removeClass('show-splash-screen');
				});
			}, 1200);
	}

	function _render() {
		DOM.$html.append(template);
		DOM.$html.addClass('show-splash-screen');
		DOM.$splash = DOM.$html.find('#splash-screen');
		DOM.$img = DOM.$splash.find('img');
		setTimeout(
			function () {
				UIHelper.animateCSS(DOM.$img.get(0), 'pulse');
			}, 500);
	}

	function init() {
		_cacheDom();
		_render();
		_bindEvents();
	}

	return {
		init: init
	};
})();