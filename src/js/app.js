var splashScreen = require('./modules/splash-screen');
var morphNavigation = require('./modules/morph-navigation');

console.log("std::cout << \"Welcome to my home page!\" << std::endl;");
console.log("std::cout << \"Shoot me an email at stepanovps@gmail.com\" << std::endl;");

splashScreen.init();

var morphNavigationElement = document.querySelector('.js--init-morph-navigation');
morphNavigation.init(morphNavigationElement);