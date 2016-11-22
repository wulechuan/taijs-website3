// 文件夹结构：
//
// {project-root}
//   └─ app-client
const pathClientAppRoot = './app-client/';



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

const pathSrcRoot                        = pathClientAppRoot + folderNameSrcRoot;
const pathDevBuildRoot                   = pathClientAppRoot + folderNameDevBuildRoot;
const pathReleaseBuildRoot               = pathClientAppRoot + folderNameReleaseBuildRoot;
const pathNewBuildTempRoot               = pathClientAppRoot + folderNameNewBuildTempRoot;
const pathNewDevBuildCacheRoot           = pathClientAppRoot + folderNameNewDevBuildCacheRoot;
const pathNewReleaseBuildCacheRoot       = pathClientAppRoot + folderNameNewReleaseBuildCacheRoot;


// sub folders
const folderNameAssets                   = folderOf.assets;
const folderNameCSS                      = folderOf.CSS;
const folderNameJS                       = folderOf.JS;
const folderNameHTMLSnippets             = folderOf.HTMLSnippets;


// runtime environment
let runtime = {
	buildingOptions: {
		forCurrentMode: null,
		forDevMode: WLCClientProjectSettings.buildFor.dev,
		forReleaseMode: WLCClientProjectSettings.buildFor.release
	},
	isInReleaseMode: false
};

runtime.buildingOptions.forCurrentMode = 
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
const filter        = require('gulp-filter');

const concatInto    = require('gulp-concat');
const inject        = require('gulp-inject');

// 方便的文件编辑插件
const changeContent = require('gulp-change');

const eslint        = require('gulp-eslint');
const minifyJS      = require('gulp-uglify');
const minifyCSS     = require('gulp-cssmin');
const minifyHTML    = require('gulp-htmlmin');
const sourcemaps    = require('gulp-sourcemaps');


const chalk        = require('chalk');
const logFileSizes = require('gulp-size');
const logLine      = '\n'+'-'.repeat(79);






const rawConsoleLog = global.console.log;
const projectCaptionLog = chalk.blue(projectCaption);
global.console.log = rawConsoleLog.bind(global.console, projectCaptionLog);
global.wlcLog = function() {
	let args = Array.prototype.slice.apply(arguments);

	let time = new Date();
	let tH = time.getHours();
	let tM = time.getMinutes();
	let tS = time.getSeconds();

	tH = (tH < 10 ? '0' : '') + tH;
	tM = (tM < 10 ? '0' : '') + tM;
	tS = (tS < 10 ? '0' : '') + tS;
	let timeStamp = chalk.white('[' + chalk.gray(tH + ':' + tM + ':' + tS)+ ']');

	args.unshift(projectCaptionLog);
	args.unshift(timeStamp);

	rawConsoleLog.apply(global.console, args);
};



function genOptionsForCSSMin() {
	let cssminOptions = {
		advanced: false
	};

	return cssminOptions;
}
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
// 当然，我们也可以指明执行某个任务。例如，要执行一个名为“styles”的任务，可以像这样：
//     gulp styles<回车>

// 不要忘记Gulp默认是令任务并行的。因此也不要忘记总是使用return语句返回gulp动作的返回值，
// 因为这些动作的返回值，是一个个Stream对象，返回这些Stream对象才能保证各个相互依赖的任务
// 依照预定顺序执行；否则，虽然任务可能会被执行，却不能保证依照预定顺序，从而可能造成晚期错误的结果。

gulp.task('before-everything', () => {
	wlcLog('预先删除临时文件……');
	return del([pathNewBuildTempRoot]);
});



(function devAllCSSAndIconFontsTasks() {
	let globsForBaseCSS = WLCClientProjectSettings.globs.filesViaConcatenation.CSS.base; 
		globsForBaseCSS.forEach((glob, i, globs) => {
			globs[i] = pathSrcRoot+'/'+folderNameCSS+'/'+glob;
		});

	let globsForBaseThemeCSS = WLCClientProjectSettings.globs.filesViaConcatenation.CSS.theme; 
		globsForBaseThemeCSS.forEach((glob, i, globs) => {
			globs[i] = pathSrcRoot+'/'+folderNameCSS+'/'+glob;
		});

	const pathForSavingBaseCSS = pathNewDevBuildCacheRoot+'/assets/styles/base/';
	const cssBuildingOptions = runtime.buildingOptions.forCurrentMode;
	const cssminOptions = genOptionsForCSSMin();


	gulp.task('styles-base', ['before-everything'], () => {
		const baseCSSFileName = 'base.min.css';
		if (cssBuildingOptions.shouldGenerateSoureMaps) {
			return gulp.src(globsForBaseCSS)
				.pipe(sourcemaps.init())
					.pipe(concatInto(baseCSSFileName))
					// .pipe(minifyCSS(cssminOptions))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(pathForSavingBaseCSS))
			;
		} else {
			return gulp.src(globsForBaseCSS)
				.pipe(concatInto(baseCSSFileName))
				// .pipe(minifyCSS(cssminOptions))
				.pipe(gulp.dest(pathForSavingBaseCSS))
			;
		}
	});


	gulp.task('styles-base-theme', ['before-everything'], () => {
		const baseThemeCSSFileName = 'theme-_default.min.css';
		if (cssBuildingOptions.shouldGenerateSoureMaps) {
			return gulp.src(globsForBaseThemeCSS)
				.pipe(sourcemaps.init())
					.pipe(concatInto(baseThemeCSSFileName))
					// .pipe(minifyCSS(cssminOptions))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(pathForSavingBaseCSS))
			;
		} else {
			return gulp.src(globsForBaseThemeCSS)
				.pipe(concatInto(baseThemeCSSFileName))
				// .pipe(minifyCSS(cssminOptions))
				.pipe(gulp.dest(pathForSavingBaseCSS))
			;
		}
	});


	gulp.task('styles-iconfonts', ['before-everything'], () => {
		return gulp.src([
			pathSrcRoot+'/'+folderNameCSS+'/base-of-this-project/0_iconfonts/*',
			'!'+pathSrcRoot+'/'+folderNameCSS+'/base-of-this-project/0_iconfonts/*.css' //前面加一个惊叹号，代表忽略这个glob。
		])
			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/'+folderNameCSS+'/base/'))
		;
	});


	gulp.task('styles-specific', ['before-everything'], () => {
		const pathCSSTargetFolder = pathNewDevBuildCacheRoot+'/'+folderNameCSS+'/pages';
		let globsForCSSForSpecificPages = [
			pathSrcRoot+'/'+folderNameCSS+'/pages/**/*.css'
		];


		if (cssBuildingOptions.shouldGenerateSoureMaps) {
			return gulp.src(globsForCSSForSpecificPages)
				.pipe(sourcemaps.init())
					.pipe(minifyCSS(cssminOptions))
					.pipe(rename((fullPathName) => {
						fullPathName.basename += '.min';
						return fullPathName;
					}))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(pathCSSTargetFolder))
			;
		} else {
			return gulp.src(globsForCSSForSpecificPages)
				.pipe(minifyCSS(cssminOptions))
				.pipe(rename((fullPathName) => {
					fullPathName.basename += '.min';
					return fullPathName;
				}))
				.pipe(gulp.dest(pathCSSTargetFolder))
			;
		}
	});



	gulp.task('styles', [
		'styles-base',
		'styles-base-theme',
		'styles-iconfonts',
		'styles-specific'
	]);
})();



(function devAllJSTasks() {
	gulp.task('es-lint', ['before-everything'], () => {
		return gulp.src([pathSrcRoot+'/assets/scripts/**/*.js'])
			.pipe(eslint())
			.pipe(eslint.format())
		;
	});

	// 我的 scripts-minify 任务须在 eslint 任务完成之后才可以开始。
	// 虽然不先做 lint 代码审查，也可以同步压缩和输出脚本文件，但那样做意义不大。
	// 更何况我们不希望未通过审查的新版代码覆盖旧版的代码。所以我故意这样安排。
	gulp.task('scripts-minify', ['es-lint'], () => {
		return gulp.src([pathSrcRoot+'/assets/scripts/**/*.js'])
			// .pipe(sourcemaps.init())
				// .pipe(concatInto('base.min.js'))
				// .pipe(minifyJS({preserveComments: 'some'}))
				.pipe(rename((fullPathName) => {
					fullPathName.basename += '.min';
					return fullPathName;
				}))
			// .pipe(sourcemaps.write('.'))

			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/assets/scripts'))
		;
	});

	gulp.task('scripts', ['scripts-minify']);
})();



(function devAllHTMLTasks() {
	gulp.task('copy-html-snippets-files-to-temp-folder',  ['before-everything'], () => {
		return gulp.src([pathSrcRoot+'/html-snippets/**/*'])
			.pipe(gulp.dest(pathNewBuildTempRoot+/html-snippets/))
		;
	});

	gulp.task('pre-process-html-snippets',  ['copy-html-snippets-files-to-temp-folder'], () => {
		return gulp.src([
			pathNewBuildTempRoot+'/html-snippets/module-app-footer.html'
		])
			.pipe(
				changeContent((fileContentString) => {
					var thisYear = new Date().getFullYear();
					return fileContentString.replace(/(\&copy\;\s*)\d+/g, '$1'+thisYear);
				})
			)
			.pipe(gulp.dest(pathNewBuildTempRoot+'/html-snippets/'))
		;
	});

	gulp.task('html-inject-snippets', ['pre-process-html-snippets'], () => {
		const globsSourceHTMLSnippets = pathSrcRoot+'/'+folderNameHTMLSnippets;
		const globsAllSourceHTMLFilesInAllFolders = pathSrcRoot+'/**/*.html'; // 其中包含了index.html

		const globsSourceFolderAllHTMLPages = [
			globsAllSourceHTMLFilesInAllFolders,
			'!'+globsSourceHTMLSnippets // 我们要排除的是源文件夹的片段，而不是临时文件夹的片段
		];

		const injectionSets = WLCClientProjectSettings.injections;

		let globsOfCurrentStage = gulp.src(globsSourceFolderAllHTMLPages);
		for (let iInjection = 0; iInjection < injectionSets.length; iInjection++) {
			let injectionSet = injectionSets[iInjection];

			let pathTempSnippets = pathNewBuildTempRoot + injectionSet.snippetsPathRoot;
			let couples = injectionSet.couples;

			for (let iCouple = 0; iCouple < couples.length; iCouple++) {
				let couple = couples[iCouple];
				let tempSnippetFile = pathTempSnippets + couple.withFile;
				let injectionStartTag = '<!-- inject:'+couple.replaceTag+' -->';

				// wlcLog(tempSnippetFile);
				// wlcLog(injectionStartTag);

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
			.pipe(gulp.dest(pathNewDevBuildCacheRoot))
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

	gulp.task('remove-html-snippets-in-dev-cache',  ['html-inject-snippets'], () => {
		return del([
			// pathNewDevBuildCacheRoot+'/html-snippets/**/*',
			pathNewDevBuildCacheRoot+'/html-snippets'
		]);
	});

	gulp.task('html', ['remove-html-snippets-in-dev-cache'], () => {
		let htmlminOptions = genOptionsForHTMLMin(runtime.buildingOptions.forCurrentMode.shouldMinifyHTML);

		return gulp.src([
			pathNewDevBuildCacheRoot+'/**/*.html',
			'!'+pathNewDevBuildCacheRoot+'/html-snippets/*'
		])
			.pipe(minifyHTML(htmlminOptions))
			.pipe(gulp.dest(pathNewDevBuildCacheRoot))
		;
	});
})();



(function devAllAssetsTasks() {
	gulp.task('assets-vendors', ['before-everything'], () => {
		return gulp.src(pathSrcRoot+'/assets-vendors/**/*')
			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/assets-vendors/'))
		;
	});


	gulp.task('fonts', ['before-everything'], () => {
		return gulp.src([
			pathSrcRoot+'/fonts/**/*'
		])
			.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files:  Fonts'})) // 为了装逼，在命令行窗口中打印一下文件尺寸
			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/fonts'))
		;
	});

	gulp.task('images', ['before-everything'], () => {
		return gulp.src([
			pathSrcRoot+'/images/**/*'
		])
			.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files: Images'})) // 为了装逼，在命令行窗口中打印一下文件尺寸
			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/images'))
		;
	});

	gulp.task('assets', [
		'fonts',
		'images',
		'styles',
		'scripts'
	]);
})();







gulp.task('prepare-all-new-files-in-cache', [
	'assets-vendors',
	'assets',
	'html'
]);

gulp.task('delete-old-dist', ['prepare-all-new-files-in-cache'], () => {
	wlcLog('删除旧有的【开发预览】文件夹……');
	return del([pathDevBuildRoot]);
});

gulp.task('将【开发预览缓存】发布为新的【开发预览】', ['delete-old-dist'], () => {
	wlcLog('将【'+folderNameNewDevBuildCacheRoot+'】更名为【'+folderNameDevBuildRoot+'】……');
	fileSystem.renameSync(pathNewDevBuildCacheRoot, pathDevBuildRoot);
});


gulp.task('删除临时文件夹和临时文件', ['将【开发预览缓存】发布为新的【开发预览】'], () => {
	wlcLog('最后，删除临时文件……');
	return del([pathNewBuildTempRoot]);
});






gulp.task('build-entire-app', ['删除临时文件夹和临时文件']);


gulp.task('监视【开发源码】文件夹', ['删除临时文件夹和临时文件'], () => {
	wlcLog('           >>>>>>>>  Starting watching development folder...');

	return gulp.watch(
		[pathSrcRoot+'/**/*'], // 监视这个文件夹
	 	['build-entire-app']   // 一旦有文件改动，执行这个任务
	)
		.on('change', (/*event, done*/) => {
			wlcLog(logLine+'\n\t'+new Date().toLocaleString()+' 【'+pathSrcRoot+'】变动了!'+logLine);
		})
	;
});


(function allTopLevelTasks() {
	// 下面这个任务就是 “default” 任务。
	// 当我们从命令行窗口输入gulp并回车时，gulp会自动从 default 任务开始执行。
	gulp.task('default', [
		'build-entire-app',
		'监视【开发源码】文件夹'
	], (onThisTaskDone) => {
		onThisTaskDone();
	});

	gulp.task('del', () => {
		try {
			fileSystem.unlinkSync(pathDevBuildRoot);
		} catch (e) {
			wlcLog('using del...');
			del([
				pathNewDevBuildCacheRoot,
				pathNewBuildTempRoot,
				pathDevBuildRoot
			]);
		}
	}); // For cli usage
})();
