var browserify = require('gulp-browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var sass = require('gulp-sass');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var del = require('del');

var log = require('gulplog');

var paths = {
	styles: {
		src: ['./src/sass/app.scss'],
		srcWatch: './src/sass/**/*.scss',
		dest: './css'
	},
	scripts: {
		src: ['./src/js/splash.js', './src/js/app.js'],  // Only entry point for browserify
		srcWatch: './src/js/**/*.js,',
		dest: './js'
	},
	fonts: {
		src: ['./node_modules/typeface-zilla-slab/files/zilla-slab-latin-700.*',
			'./node_modules/ionicons/dist/fonts/ionicons.w*'],
		dest: './fonts'
	}
};


// Clean

function clean() {
	return del([paths.styles.dest, paths.scripts.dest, paths.fonts.dest]);
}


// Copy resources

function copy() {
	return gulp.src(paths.fonts.src)
		.pipe(gulp.dest(paths.fonts.dest));
}

// Styles Task

function stylesDev() {
	return gulp.src(paths.styles.src)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(autoprefixer())
		.pipe(gulp.dest(paths.styles.dest));
}

function styles() {
	return gulp.src(paths.styles.src)
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(paths.styles.dest));
}

// Scripts Task

function scriptsDev() {
	return gulp.src(paths.scripts.src)
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(browserify({
			insertGlobals : true,
			debug: true // source maps support
	  	}))
		.pipe(gulp.dest(paths.scripts.dest));
}

function scripts() {
	return gulp.src(paths.scripts.src)
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(browserify({
			insertGlobals : true,
			debug: false
	  	}))
		.pipe(gulp.dest(paths.scripts.dest));
}


// Watch

function watch() {
	gulp.watch(paths.scripts.srcWatch, scriptsDev);
	gulp.watch(paths.styles.srcWatch, stylesDev);
}


// Build

var development = gulp.series(clean, copy, gulp.parallel(stylesDev, scriptsDev), watch);
var production = gulp.series(clean, copy, gulp.parallel(styles, scripts));


// Exports

exports.clean = clean;
exports.stylesDev = stylesDev;
exports.styles = styles;
exports.scriptsDev = scriptsDev;
exports.scripts = scripts;
exports.watch = watch;
exports.development = development;
exports.production = production;

exports.default = production;
