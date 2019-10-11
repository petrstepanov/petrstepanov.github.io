// Helper with UI functions

var UIHelper = (function () {

	function animateCSS(node, animationName, callback) {
		// var node = document.querySelector(element)
		node.classList.add('animated', animationName)
	
		function handleAnimationEnd() {
			node.classList.remove('animated', animationName)
			node.removeEventListener('animationend', handleAnimationEnd)
	
			if (typeof callback === 'function') callback()
		}
	
		node.addEventListener('animationend', handleAnimationEnd)
	}

	return {
		animateCSS: animateCSS
	};
})();