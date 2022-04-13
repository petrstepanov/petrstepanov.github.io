var browserify = require('gulp-browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

const sass = require('gulp-sass')(require('sass'));
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var del = require('del');

var log = require('gulplog');

var yaml = require('js-yaml');
var fs = require('fs');
var ejs = require('gulp-ejs');
var Markdown = require('markdown-to-html').Markdown;

const path = require('path');

TODO: try https://www.npmjs.com/package/html5-to-pdf

var pdf = require('html-pdf');

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

// Test generate (cs, ms, ui)

// function yamlToJSON() {
// 	gulp.src('./src/templates/data/*.yml')
// 	.pipe(yaml({ space: 2 }))
// 	.pipe(gulp.dest('./src/templates/data/'))
// }

// See original GULP docs for (cb)
function renderMD(cb) {
	console.log(process.argv);
	const positions = ["cs", "ms", "ui"];
	// Generate Markdown resumes
	var promises = [];
	for (pos of positions){
		const thatPos = pos;
		// console.log("renderMD: starting " + pos)
		const promise = new Promise((resolve, reject) => {
			// Replace tabs in file (trick to easier read)
			fs.readFile('./src/templates/main.ejs', 'utf8', function (err,data) {
				if (err) {
				  return console.log(err);
				}
				var result = data.replace(/\t/g, '');
			  
				fs.writeFile('./src/templates/main-no-tabs.ejs', result, 'utf8', function (err) {
					if (err){
						reject();
						return console.log(err);
					}
					// https://stackoverflow.com/questions/28096836/how-to-pipe-yaml-into-ejs-in-a-gulp-stream
					gulp.src('./src/templates/main-no-tabs.ejs')
					.pipe(ejs({
						position: thatPos,
						topLinks: yaml.load(fs.readFileSync('./src/templates/data/top-links.yml', 'utf-8')),
						work:     yaml.load(fs.readFileSync('./src/templates/data/work.yml', 'utf-8'))
					}))
					.pipe(rename({ basename: 'petr-stepanov-' + thatPos, extname: '.md' }))
					.pipe(gulp.dest('static/'))
					.on('end', function() {
						// console.log("renderMD: " + thatPos + " done");
						// Delete temp file
						// fs.unlink('./src/templates/main-no-tabs.ejs');
						resolve();
					});
				});
			});
		});
		promises.push(promise);
	}
	
	Promise.all(promises).then((values) => {
		console.log("All MD's generated");
		cb();
	});
}

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function getFilesWithExtension(folder, extension){
	var files = fs.readdirSync(folder); // ["file1", "file2"]

	// Filter files by extension
	// https://stackoverflow.com/questions/44199883/how-do-i-get-a-list-of-files-with-specific-file-extension-using-node-js

	const targetFiles = files.filter(file => {
    	return path.extname(file).toLowerCase() === extension;
	});

	// Add full path
	let targetFilesWithPath = [];
	for (file of targetFiles){
		targetFilesWithPath.push(path.join(folder, file));
	}

	return targetFilesWithPath;
}

function renderHTML(cb){
	files = getFilesWithExtension('./static', '.md');

	var promises = [];
	// https://www.npmjs.com/package/markdown-to-html
	for (file of files){
		// var that = this;
		const promise = new Promise((resolve, reject) => {
			var opts = {title: 'File $BASENAME in $DIRNAME', 
			            stylesheet: './../src/templates/css/md-to-html.css',
						// stylesheet: './../node_modules/bootstrap/dist/css/bootstrap-reboot.css',
						// stylesheet: './../node_modules/normalize.css/normalize.css',
			            flavor: 'markdown'};

			var md = new Markdown();
			md.bufmax = 2048;

			var outFile = file.replace('.md', '.html');

			md.render(file, opts, function(err) {
				if (err) {
					console.error(err);
					reject();
					process.exit();
				}

				// Replace a few tweaks
				replaceAll(md.html, '</th>', '</td>');
				replaceAll(md.html, '<th>', '<td>');

				// Write HTML to file system
				fs.writeFile(outFile, md.html, function(err) {
					// console.log ("renderHTML: fs.writeFile done " + outFile);
					if (err){
						reject();
						throw err;
					} else {
						resolve();
					}
				});
			});	
		});
		promises.push(promise);
	}

	Promise.all(promises).then((values) => {
		console.log("All HTML's generated");
		cb();
	});
}

// Need to call cb() when task is done => promises
// function renderPDF(){
// 	return gulp.src('./static/*.html')
// 		.pipe(pdf())
// 		.pipe(gulp.dest('./'))
// }

function renderPDF(cb){
	files = getFilesWithExtension('./static', '.html');

	var promises = [];
	// https://www.npmjs.com/package/html-pdf?activeTab=readme
	for (file of files){
		const promise = new Promise((resolve, reject) => {
			var html = fs.readFileSync(file, 'utf8');
			// var options = { format: 'Letter', 
			//                 phantomPath: './node_modules/phantomjs/bin/phantomjs' };
			let options = { format: 'Letter' };
			var outFile = file.replace('.html', '.pdf');

			pdf.create(html, options).toFile(outFile, function(err, res) {
				if (err){
					reject();
					return console.log(err);
				}
				console.log(res); // { filename: '/app/businesscard.pdf' }
				resolve();
			});
		});
		promises.push(promise);
	}

	Promise.all(promises).then((values) => {
		console.log("All PDF's generated");
		cb();
	});
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

// var myRender = gulp.series(yamlToJSON, renderEJS);
var render = gulp.series(renderMD, renderHTML, renderPDF);
var development = gulp.series(clean, copy, render, gulp.parallel(stylesDev, scriptsDev), watch);
var production = gulp.series(clean, copy, render, gulp.parallel(styles, scripts));


// Exports

exports.clean = clean;
exports.render = render;
exports.stylesDev = stylesDev;
exports.styles = styles;
exports.scriptsDev = scriptsDev;
exports.scripts = scripts;
exports.watch = watch;
exports.development = development;
exports.production = production;

exports.default = production;
