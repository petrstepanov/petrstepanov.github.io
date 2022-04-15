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
// var Markdown = require('markdown-to-html').Markdown;
var MarkdownIt = require('markdown-it');
// var NodeHtmlMarkdown = require('node-html-markdown').NodeHtmlMarkdown;
// var NodeHtmlMarkdownOptions = require('node-html-markdown').NodeHtmlMarkdownOptions;

// import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from 'node-html-markdown'

const path = require('path');

// TODO: try https://www.npmjs.com/package/html5-to-pdf

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

// function escapeRegExp(string) {
// 	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
// }

// function replaceAll(str, find, replace) {
// 	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
// }

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
			// var opts = {title: 'File $BASENAME in $DIRNAME', 
			//             // stylesheet: './../src/templates/css/md-to-html.css',
			// 			// stylesheet: './../node_modules/bootstrap/dist/css/bootstrap-reboot.css',
			// 			// stylesheet: './../node_modules/normalize.css/normalize.css',
			//             flavor: 'markdown'};

			// var md = new Markdown();
			// md.bufmax = 2048;
			// var outFile = file.replace('.md', '.html');

			var renderString = fs.readFileSync(file, 'utf8');
			md = new MarkdownIt();
			var result = md.render(renderString);

			// Replace a few things
			result = result.replaceAll('<th>', '<td>');
			result = result.replaceAll('</th>', '</td>');
			result = result.replaceAll('<thead>', '');
			result = result.replaceAll('</thead>', '');

			// From ionicons
			result = result.replaceAll('✉️', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M460.6 147.3L353 256.9c-.8.8-.8 2 0 2.8l75.3 80.2c5.1 5.1 5.1 13.3 0 18.4-2.5 2.5-5.9 3.8-9.2 3.8s-6.7-1.3-9.2-3.8l-75-79.9c-.8-.8-2.1-.8-2.9 0L313.7 297c-15.3 15.5-35.6 24.1-57.4 24.2-22.1.1-43.1-9.2-58.6-24.9l-17.6-17.9c-.8-.8-2.1-.8-2.9 0l-75 79.9c-2.5 2.5-5.9 3.8-9.2 3.8s-6.7-1.3-9.2-3.8c-5.1-5.1-5.1-13.3 0-18.4l75.3-80.2c.7-.8.7-2 0-2.8L51.4 147.3c-1.3-1.3-3.4-.4-3.4 1.4V368c0 17.6 14.4 32 32 32h352c17.6 0 32-14.4 32-32V148.7c0-1.8-2.2-2.6-3.4-1.4z"/><path d="M256 295.1c14.8 0 28.7-5.8 39.1-16.4L452 119c-5.5-4.4-12.3-7-19.8-7H79.9c-7.5 0-14.4 2.6-19.8 7L217 278.7c10.3 10.5 24.2 16.4 39 16.4z"/></svg>')
			result = result.replaceAll('📞', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M436.9 364.8c-14.7-14.7-50-36.8-67.4-45.1-20.2-9.7-27.6-9.5-41.9.8-11.9 8.6-19.6 16.6-33.3 13.6-13.7-2.9-40.7-23.4-66.9-49.5-26.2-26.2-46.6-53.2-49.5-66.9-2.9-13.8 5.1-21.4 13.6-33.3 10.3-14.3 10.6-21.7.8-41.9C184 125 162 89.8 147.2 75.1c-14.7-14.7-18-11.5-26.1-8.6 0 0-12 4.8-23.9 12.7-14.7 9.8-22.9 18-28.7 30.3-5.7 12.3-12.3 35.2 21.3 95 27.1 48.3 53.7 84.9 93.2 124.3l.1.1.1.1c39.5 39.5 76 66.1 124.3 93.2 59.8 33.6 82.7 27 95 21.3 12.3-5.7 20.5-13.9 30.3-28.7 7.9-11.9 12.7-23.9 12.7-23.9 2.9-8.1 6.2-11.4-8.6-26.1z"/></svg>')
			result = result.replaceAll('🏠', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M208 448V320h96v128h97.6V256H464L256 64 48 256h62.4v192z"/></svg>')
			result = result.replaceAll('💻', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9 1.4.3 2.6.4 3.8.4 8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1-8.4 1.9-15.9 2.7-22.6 2.7-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1 10.5 0 20-3.4 25.6-6 2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8 0 0 1.6-.5 5-.5 8.1 0 26.4 3.1 56.6 24.1 17.9-5.1 37-7.6 56.1-7.7 19 .1 38.2 2.6 56.1 7.7 30.2-21 48.5-24.1 56.6-24.1 3.4 0 5 .5 5 .5 12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5 1.2 0 2.6-.1 4-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z"/></svg>')
			result = result.replaceAll('🏀', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M256 64C150 64 64 150 64 256c0 106.1 86 192 192 192s192-85.9 192-192c0-106-86-192-192-192zm121.9 88.5c21.6 25.4 35.3 57.6 37.7 92.9-34.6-1.8-76-1.8-109.2 1.3-4.2-10.6-8.5-21-13.2-31 38.3-16.6 67.8-38.4 84.7-63.2zM256 96c38.8 0 74.4 13.8 102.1 36.8-17.4 22-44.7 41.1-78.7 55.6-18.6-34.4-40-64-62.8-87.3 12.7-3.2 25.8-5.1 39.4-5.1zm-72.4 17.5c23.1 23 44.8 52.3 63.8 86.6-36.1 11-77.5 17.3-121.7 17.3-8.4 0-16.6-.3-24.7-.8 11.5-45.1 42-82.5 82.6-103.1zM96.3 248.4c9.1.4 18.3.6 27.6.5 50.4-.6 97.3-8.5 137.6-21.4 3.8 7.9 7.4 16 10.8 24.3-5.5 1.3-10.4 2.7-14.3 4.3-55.1 23.1-98.5 60.4-122 105.5-24.8-28.2-40-65.1-40-105.6 0-2.6.1-5.1.3-7.6zM256 416c-37 0-71-12.6-98.1-33.7 21.3-42.2 59.3-77.1 107.2-98.8 4.5-2.1 10.5-3.8 17.4-5.3 5.7 15.8 10.8 32.2 15.3 49.2 6.9 26.5 11.8 52.7 14.8 78.1C295 412.2 276 416 256 416zm86.5-25.5c-3-25.7-7.9-52.1-14.9-78.9-3.4-13-7.3-25.6-11.5-37.9 31.4-2.6 69-2.2 98.9 0-5.4 49.1-33 91.3-72.5 116.8z"/></svg>')
			result = result.replaceAll('🎓', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M426.2 80.4l-170.2 32-170.2-32C64 77 48 97.3 48 118v244.5c0 20.7 16 32.6 37.8 37.6L256 432l170.2-32c21.8-5 37.8-16.9 37.8-37.6V118c0-20.7-16-41-37.8-37.6zm0 282l-151.2 32V149.9l151.2-32v244.5zm-189.2 32l-151.2-32V118L237 150v244.4z"/></svg>')

			// Add inline stylesheet
			var template = ''; // '<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@700&display=swap" rel="stylesheet">';
			template += '<head><style>';
			template += fs.readFileSync('./src/templates/css/md-to-html.css', 'utf8');
			template += '</style></head>';
			template += result;

			// Write HTML to file system
			var outFile = file.replace('.md', '.html');
			fs.writeFile(outFile, template, function(err) {
				// console.log ("renderHTML: fs.writeFile done " + outFile);
				if (err){
					reject();
					throw err;
				} else {
					resolve();
				}
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

// var pdf = require('html-pdf');

/*
function renderPDF(cb){
	// could not load the shared library:dso_dlfcn.c:185:filename(libproviders.so): libproviders.so: cannot open shared object file: No such file or directory
	// Fix:
	// > touch /tmp/openssl.cnf
	// > export OPENSSL_CONF="/tmp/openssl.cnf"

	// Get HTML files
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
*/

const puppeteer = require('puppeteer-core');

async function renderPDFpuppeteer(cb){
	// Get HTML files
	files = getFilesWithExtension('./static', '.html');

	// launch a new chrome instance
	const browser = await puppeteer.launch({headless: true, executablePath: '/usr/bin/chromium-browser'});

	// create a new page
	const page = await browser.newPage();

	var promises = [];
	// https://www.npmjs.com/package/html-pdf?activeTab=readme
	for (file of files){
		var html = fs.readFileSync(file, 'utf8');
	
		await page.setContent(html, {
			waitUntil: 'load'
		});

		var pdfFilePath = file.replace('.html', '.pdf');

		await page.pdf({
			format: 'Letter',
			margin: {
				top: '0.5in',
				bottom: '0.5in',
				left: '0.5in',
				right: '0.5in'
			},
			path: pdfFilePath
		});

		const promise = new Promise((resolve, reject) => {
			resolve();
		});
		promises.push(promise);
	}

	Promise.all(promises).then((values) => {
		console.log("All PDF's generated");

		browser.close(()=>{
			cb();
		});
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
var render = gulp.series(renderMD, renderHTML, renderPDFpuppeteer);
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
