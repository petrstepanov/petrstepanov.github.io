// Shows loading animation

var SplashScreen = (function () {
	var DOM = {};
	var options = {};
	var template = [
		'<div id="splash-screen" class="fast">',
			'<img src="./img/ps-monogram-crop.svg" class="animated pulse delay-1s faster" />',
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
		setTimeout(
			function () {
				var el = DOM.$html.find('#splash-screen').get(0);
				UIHelper.animateCSS(el, 'fadeOut', function () {
					DOM.$html.find('#splash-screen').remove();
				});
			}, 1800);
	}

	function _render() {
		DOM.$html.append(template);
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