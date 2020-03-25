// Helper with UI functions

function animateCSS(node, animationName) {
	return new Promise(function(resolve, reject){
		function handleAnimationEnd() {
			node.classList.remove('animated', animationName);
			node.removeEventListener('animationend', handleAnimationEnd);
			resolve();
		}
	
		node.addEventListener('animationend', handleAnimationEnd);
		node.classList.add('animated', animationName);	
	});
}

exports.animateCSS = animateCSS;