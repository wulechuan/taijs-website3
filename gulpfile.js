// 文件夹结构：
//
// {project-root}
//   └─ app-client
const pathClientAppRoot = './app-client/';

/*--------旧内容--------*/
var pathDistRoot         = 'app-client/build-dev';
var pathNewDistCacheRoot = 'app-client/_build-cache';
var pathTempRoot         = 'app-client/_temp';
var shouldMinifyHTML     = true;
/*--------旧内容--------*/



const pathWLCConfigurationFile = pathClientAppRoot+'wlc-client-project.js';
const WLCClientProjectSettings = require(pathWLCConfigurationFile);
const projectCaption = WLCClientProjectSettings.name || 'untitled';



let folderOf = WLCClientProjectSettings.folderOf;

// top level folders
const folderNameSrcRoot                  = folderOf.srcRoot;
const folderNameDevBuildRoot             = folderOf.devBuildRoot;
const folderNameReleaseBuildRoot         = folderOf.releaseBuildRoot;
const folderNameNewBuildTempRoot         = folderOf.newBuildTempRoot;
const folderNameNewDevBuildCacheRoot     = folderOf.newDevBuildCacheRoot;
const folderNameNewReleaseBuildCacheRoot = folderOf.newReleaseBuildCacheRoot;

const pathSrcRoot                  = pathClientAppRoot + folderNameSrcRoot;
const pathDevBuildRoot             = pathClientAppRoot + folderNameDevBuildRoot;
const pathReleaseBuildRoot         = pathClientAppRoot + folderNameReleaseBuildRoot;
const pathNewBuildTempRoot         = pathClientAppRoot + folderNameNewBuildTempRoot;
const pathNewDevBuildCacheRoot     = pathClientAppRoot + folderNameNewDevBuildCacheRoot;
const pathNewReleaseBuildCacheRoot = pathClientAppRoot + folderNameNewReleaseBuildCacheRoot;


// sub folders
const folderNameAssets       = folderOf.assets;
const folderNameCSS          = folderOf.CSS;
const folderNameJS           = folderOf.JS;
const folderNameHTMLSnippets = folderOf.HTMLSnippets;



// runtime environment
const projectCaptionLog = '['+projectCaption+'] ';
let runtime = {
	buildingOptions: {
		forCurrentMode: null,
		forDevMode: WLCClientProjectSettings.buildFor.dev,
		forReleaseMode: WLCClientProjectSettings.buildFor.release
	},
	isInReleaseMode: false
};

runtime.forCurrentMode = 
	runtime.isInReleaseMode ? 
	runtime.buildingOptions.forReleaseMode : 
	runtime.buildingOptions.forDevMode;







const gulp = require('gulp');

// Nodejs 自带的 FileSystem 模块。
const fileSystem = require('fs');

// 方便好用的重命名文件工具
const rename = require('gulp-rename');

// 用来删除文件，例如，总是在输出之前先删除所有旧版输出文件。
// 每当文件改名时，确保不残留使用旧名字的文件。
const del   = require('del');
const clean = require('gulp-clean');

// 用于在管道流程中过滤掉一些Globs。
const filter = require('gulp-filter');

// const groupConcat = require('gulp-group-concat');
const concat = require('gulp-concat');
const inject = require('gulp-inject');

// 方便的文件编辑插件
const changeContent = require('gulp-change');

const eslint = require('gulp-eslint');
const minifyJS = require('gulp-uglify');
const minifyCSS = require('gulp-cssmin');
const minifyHTML = require('gulp-htmlmin');
const sourcemaps = require('gulp-sourcemaps');

const logFileSizes = require('gulp-size');
const logLine = '\n'+'-'.repeat(79);








global.console.log = global.console.log.bind(global.console, projectCaptionLog);
const log = global.console.log;

function genOptionsForHTMLMin(shouldMinifyHTML) {
	let htmlminOptions = {
		preserveLineBreaks: !shouldMinifyHTML,
		collapseWhitespace: !!shouldMinifyHTML,

		removeComments: true,
		collapseBooleanAttributes: true,
		removeAttributeQuotes: false,
		removeRedundantAttributes: true,
		removeEmptyAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true
		// removeOptionalTags: true
	};

	return htmlminOptions;
}









// 下面定义各种任务，特别是一个叫做 “default” 的任务。
// 当我们从命令行窗口输入gulp并回车时，gulp会自动从 default 任务开始执行。
// 当然，我们也可以指明执行某个任务，像这样：
//     gulp styles<回车>

// 不要忘记Gulp默认是令任务并行的。因此也不要忘记总是使用return语句返回gulp动作的返回值，
// 因为这些动作的返回值，是一个个Stream对象，返回这些Stream对象才能保证各个相互依赖的任务
// 依照预定顺序执行；否则，虽然任务可能会被执行，却不能保证依照预定顺序，从而可能造成晚期错误的结果。

gulp.task('before-everything', () => {
	log('           >>>>>>>>  Deleting old temp files...');
	return del([pathNewDistCacheRoot]);
});



var baseCssGlobs = [
	// 下面壹壹列出各个glob，目的是保证这些css文件合并的顺序。我们知道，错误的顺序将导致错误的结果。
	pathSrcRoot+'/assets/styles/base/_reset*.css',
	pathSrcRoot+'/assets/styles/base/iconfonts/*.css',
	pathSrcRoot+'/assets/styles/base/_fonts*.css',
	pathSrcRoot+'/assets/styles/base/base.css',
	pathSrcRoot+'/assets/styles/base/layout.css',
];

gulp.task('styles-base', ['before-everything'], () => {
	return gulp.src(baseCssGlobs)
		// .pipe(sourcemaps.init())
			.pipe(concat('base.min.css')) // 这些css我要合并成单一文件
			// .pipe(minifyCSS())
		// .pipe(sourcemaps.write('.'))

		.pipe(gulp.dest(pathNewDistCacheRoot+'/assets/styles/base/')) // 将文件写入指定文件夹
	;
});


gulp.task('styles-iconfonts', ['before-everything'], () => {
	return gulp.src([
		pathSrcRoot+'/assets/styles/base/iconfonts/*',
		'!'+pathSrcRoot+'/assets/styles/base/iconfonts/*.css', //前面加一个惊叹号，代表忽略这个glob。
	])
		.pipe(gulp.dest(pathNewDistCacheRoot+'/assets/styles/base/')) // 将文件写入指定文件夹
	;
});


gulp.task('styles-specific', ['before-everything'], () => {
	var baseCssGlobsIngored = [];

	baseCssGlobs.forEach((glob) => {
		baseCssGlobsIngored.push('!'+glob); //前面加一个惊叹号，代表忽略这个glob。
	});

	return gulp.src(
		[pathSrcRoot+'/assets/styles/**/*.css'].concat(baseCssGlobsIngored)
	)
		// .pipe(sourcemaps.init())
			// .pipe(concat('main.min.css')) // 这些css我不打算合并
			// .pipe(minifyCSS())
			.pipe(rename((fullPathName) => {
				fullPathName.basename += '.min';
				return fullPathName;
			}))
		// .pipe(sourcemaps.write('.'))

		.pipe(gulp.dest(pathNewDistCacheRoot+'/assets/styles')) // 将文件写入指定文件夹
	;
});

// 我的 styles 任务依赖我的3个前导任务： styles-base 、 styles-iconfonts 和 styles-specific
// 我的 styles 任务有一个无关紧要的动作，即打印所有css文件的总计大小。
// 实际上，该 styles 任务可以没有自己的动作，那样的话，其存在意义仅仅是将其所用前导任务打成一个任务包。
gulp.task('styles', [
	'styles-base',
	'styles-iconfonts',
	'styles-specific'
], () => {
	return gulp.src([
		pathNewDistCacheRoot+'/assets/styles/**/*.css'
	])
		.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files:    CSS', showFiles: false})) // 为了装逼，在命令行窗口中打印一下文件尺寸
	;
});



gulp.task('es-lint', ['before-everything'], () => {
	return gulp.src([pathSrcRoot+'/assets/scripts/**/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
	;
});

// 我的 scripts-unglify 任务须在 eslint 任务完成之后才可以开始。
// 虽然不先做 lint 代码审查，也可以同步压缩和输出脚本文件，但那样做意义不大。
// 更何况我们不希望未通过审查的新版代码覆盖旧版的代码。所以我故意这样安排。
gulp.task('scripts-unglify', ['es-lint'], () => {
	return gulp.src([pathSrcRoot+'/assets/scripts/**/*.js'])
		// .pipe(sourcemaps.init())
			// .pipe(concat('base.min.js'))
			// .pipe(minifyJS({preserveComments: 'some'}))
			.pipe(rename((fullPathName) => {
				fullPathName.basename += '.min';
				return fullPathName;
			}))
		// .pipe(sourcemaps.write('.'))

		.pipe(gulp.dest(pathNewDistCacheRoot+'/assets/scripts')) // 将文件写入指定文件夹
	;
});

gulp.task('scripts', ['scripts-unglify'], () => {
	return gulp.src([pathNewDistCacheRoot+'/assets/scripts/**/*.js'])
		.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files:     JS', showFiles: false})) // 为了装逼，在命令行窗口中打印一下文件尺寸
	;
});

gulp.task('copy-html-snippets-files-to-temp-folder',  ['before-everything'], () => {
	return gulp.src([pathSrcRoot+'/html-snippets/**/*'])
		.pipe(gulp.dest(pathTempRoot+/html-snippets/)) // 将文件写入指定文件夹
	;
});

gulp.task('pre-process-html-snippets',  ['copy-html-snippets-files-to-temp-folder'], () => {
	return gulp.src([
		pathTempRoot+'/html-snippets/module-app-footer.html'
	])
		.pipe(
			changeContent((fileContentString) => {
				var thisYear = new Date().getFullYear();
				return fileContentString.replace(/(\&copy\;\s*)\d+/g, '$1'+thisYear);
			})
		)
		.pipe(gulp.dest(pathTempRoot+'/html-snippets/')) // 将文件写入指定文件夹
	;
});

gulp.task('html-inject-snippets', ['pre-process-html-snippets'], () => {
	const globsAllSourceHTMLFilesInAllFolders = pathSrcRoot+'/**/*.html'; // 其中包含了index.html

	const globsSourceFolderAllHTMLPages = [
		globsAllSourceHTMLFilesInAllFolders,
		'!'+globsSourceHTMLSnippets // 我们要排除的是源文件夹的片段，而不是临时文件夹的片段
	];

	const injectionSets = WLCClientProjectSettings.injections;

	let globsOfCurrentStage = gulp.src(globsSourceFolderAllHTMLPages);
	for (let ii = 0; ii < injectionSets.length; ii++) {
		let injectionSet = injectionSets[ii];

		let pathTempSnippets = pathNewBuildTempRoot + injectionSet.snippetsPathRoot;
		let couples = injectionSet.couples;

		for (let ci = 0; ci < couples.length; ci++) {
			let couple = couples[ci];
			let tempSnippetFile = pathTempSnippets + couple.withFile;
			let injectionStartTag = '<!-- inject:'+couple.replaceTag+' -->';

			// log(tempSnippetFile);
			// log(injectionStartTag);

			globsOfCurrentStage = globsOfCurrentStage.pipe(
				inject(gulp.src([tempSnippetFile]),
					{
						starttag: injectionStartTag,
						transform: wlcProcessHtmlSnippetString,
						quiet: true
					}
				)
			);
		}
	}

	return globsOfCurrentStage
		.pipe(gulp.dest(pathNewDevBuildCacheRoot)) // 将文件写入指定文件夹
	;


	function wlcProcessHtmlSnippetString(fullPathName, snippetFile, index, count, targetFile) {
		const pageFileRelativePathName = targetFile.path.slice(targetFile.base.length);
		const pageFileIsAtClientRootFolder = pageFileRelativePathName.search(/\/|\\/) < 0;

		var snippetString = snippetFile.contents ? snippetFile.contents.toString('utf8') : '';
		snippetString = _wlcAlignRelativeUrlsInsideSnippet(pageFileIsAtClientRootFolder, snippetString);
		return snippetString;
	}

	function _wlcAlignRelativeUrlsInsideSnippet(pageFileIsAtClientRootFolder, snippetString) {
		if (pageFileIsAtClientRootFolder) {
			snippetString = snippetString.replace(/\=\s*\"\.\.\//g, '=\"');
		}
		return snippetString;
			}
});


gulp.task('html', ['html-inject-snippets'], () => {
	let htmlminOptions = genOptionsForHTMLMin(runtime.forCurrentMode.shouldMinifyHTML);


	return gulp.src([
		pathNewDistCacheRoot+'/**/*.html',
		'!'+pathNewDistCacheRoot+'/html-snippets/*'
	])
		.pipe(minifyHTML(htmlminOptions))
		.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files:   HTML', showFiles: false})) // 为了装逼，在命令行窗口中打印一下文件尺寸
		.pipe(gulp.dest(pathNewDistCacheRoot)) // 将文件写入指定文件夹
	;
});


gulp.task('fonts', ['before-everything'], () => {
	return gulp.src([
		pathSrcRoot+'/fonts/**/*'
	])
		.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files:  Fonts'})) // 为了装逼，在命令行窗口中打印一下文件尺寸
		.pipe(gulp.dest(pathNewDistCacheRoot+'/fonts')) // 将文件写入指定文件夹
	;
});

gulp.task('images', ['before-everything'], () => {
	return gulp.src([
		pathSrcRoot+'/images/**/*'
	])
		.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files: Images'})) // 为了装逼，在命令行窗口中打印一下文件尺寸
		.pipe(gulp.dest(pathNewDistCacheRoot+'/images')) // 将文件写入指定文件夹
	;
});

gulp.task('assets', [
	'fonts',
	'images',
	'styles',
	'scripts'
]);







gulp.task('assets-vendors', ['before-everything'], () => {
	return gulp.src(pathSrcRoot+'/assets-vendors/**/*')
		.pipe(gulp.dest(pathNewDistCacheRoot+'/assets-vendors/')) // 将文件写入指定文件夹
	;
});

gulp.task('prepare-all-new-files-in-cache', [
	'assets-vendors',
	'assets',
	'html'
]);

gulp.task('delete-old-dist', [
	'prepare-all-new-files-in-cache'
], () => {
	log('           >>>>>>>>  Deleting old distribution files...');

	return del([
		pathDistRoot,
	]);
});

gulp.task('ship-cached-files', [
	'delete-old-dist'
], () => {
	var shouldCopyFilesInsteadOfRenameFolder = false;

	if (shouldCopyFilesInsteadOfRenameFolder) {

		log('           >>>>>>>>  Copying all files from "'+pathNewDistCacheRoot+'" to "'+pathDistRoot+'"...');
		return gulp.src([pathNewDistCacheRoot+'/**/*'])
			.pipe(gulp.dest(pathDistRoot)) // 将文件写入指定文件夹
		;

	} else {

		log('           >>>>>>>>  Reanming "'+pathNewDistCacheRoot+'" folder into "'+pathDistRoot+'"...');
		fileSystem.renameSync(pathNewDistCacheRoot, pathDistRoot);

	}
});


gulp.task('finishing-after-shipping', [
	'ship-cached-files'
], () => {
	log('           >>>>>>>>  Deleting useless files...');

	return del([
		pathTempRoot
	]);
});






gulp.task('build-entire-app', ['finishing-after-shipping'], () => {
	return gulp.src([pathDistRoot+'/**/*'])
		.pipe(logFileSizes({title: '=======>  Reporting Files:'})) // 为了装逼，在命令行窗口中打印一下文件尺寸
	;
});

gulp.task('watch-dev-folder', ['finishing-after-shipping'], () => {
	log('           >>>>>>>>  Starting watching development folder...');

	return gulp.watch([
		pathSrcRoot+'/**/*'   // 监视这个文件夹
	], [
		'build-entire-app'  // 一旦有文件改动，执行这个任务
	])
		.on('change', (/*event, done*/) => {
			log('\n');
			log('-----------------------------------------------------------');
			log(new Date().toLocaleString());
			log('Wulechuan is telling you that some files were just changed.');
			log('-----------------------------------------------------------');
		})
	;
});



// 下面这个任务就是 “default” 任务。
// 当我们从命令行窗口输入gulp并回车时，gulp会自动从 default 任务开始执行。
gulp.task('default', [
	'build-entire-app',
	'watch-dev-folder'
], (onThisTaskDone) => {
	onThisTaskDone();
});

gulp.task('del', () => {
	try {
		fileSystem.unlinkSync(pathDistRoot);
	} catch (e) {
		log('using del...');
		del([
			pathNewDistCacheRoot,
			pathTempRoot,
			pathDistRoot
		]);
	}
}); // For cli usage
