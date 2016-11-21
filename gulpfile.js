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
const projectCaptionLog = projectCaption;
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


const chalk = require('chalk');
const logFileSizes = require('gulp-size');
const logLine = '\n'+'-'.repeat(79);







global.console.log = global.console.log.bind(global.console, chalk.blue(projectCaptionLog));
global.wlcLog = function() {
	let args = Array.prototype.slice.apply(arguments);
	let time = new Date();
	let timeStamp = '[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ']';
	args.unshift(chalk.gray(timeStamp));
	global.console.log.apply(global.console, args);
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
	var globsForBaseCSS = WLCClientProjectSettings.globs.filesViaConcatenation.CSS.base; 
		globsForBaseCSS.forEach((glob, i, globs) => {
			globs[i] = pathSrcRoot+'/'+folderNameCSS+'/'+glob;
		});

	const pathForSavingBaseCSS = pathNewDevBuildCacheRoot+'/assets/styles/base/';
	const cssBuildingOptions = runtime.buildingOptions.forCurrentMode;
	const cssminOptions = genOptionsForCSSMin();


	gulp.task('styles-base', ['before-everything'], () => {
		if (cssBuildingOptions.shouldGenerateSoureMaps) {
			return gulp.src(globsForBaseCSS)
				.pipe(sourcemaps.init())
					.pipe(concat('base.min.css'))
					// .pipe(minifyCSS(cssminOptions))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(pathForSavingBaseCSS))
			;
		} else {
			return gulp.src(globsForBaseCSS)
				.pipe(concat('base.min.css'))
				// .pipe(minifyCSS(cssminOptions))
				.pipe(gulp.dest(pathForSavingBaseCSS))
			;
		}
	});

	gulp.task('styles-base-rest-files', ['before-everything'], () => {
		let globsForRestOfBaseCSS = [
			pathSrcRoot+'/'+folderNameAssets+'/base-_framework/**/*.css',
			pathSrcRoot+'/'+folderNameAssets+'/base-of-this-project/**/*.css'
		];

		globsForBaseCSS.forEach((glob) => {
			globsForRestOfBaseCSS.push('!'+glob); //前面加一个惊叹号，代表忽略这个glob。
		});


		if (cssBuildingOptions.shouldGenerateSoureMaps) {
			return gulp.src(globsForRestOfBaseCSS)
				.pipe(sourcemaps.init())
					.pipe(minifyCSS(cssminOptions))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(pathForSavingBaseCSS)) // 将文件写入指定文件夹
			;
		} else {
			return gulp.src(globsForRestOfBaseCSS)
				.pipe(minifyCSS(cssminOptions))
				.pipe(gulp.dest(pathForSavingBaseCSS)) // 将文件写入指定文件夹
			;
		}
	});


	gulp.task('styles-iconfonts', ['before-everything'], () => {
		return gulp.src([
			pathSrcRoot+'/assets/styles/base-of-this-project/iconfonts/*',
			'!'+pathSrcRoot+'/assets/styles/base-of-this-project/iconfonts/*.css', //前面加一个惊叹号，代表忽略这个glob。
		])
			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/assets/styles/base/')) // 将文件写入指定文件夹
		;
	});


	gulp.task('styles-specific', ['before-everything'], () => {
		const pathCSSTargetFolder = pathNewDevBuildCacheRoot+'/assets/styles/pages';
		let globsForCSSForSpecificPages = [
			pathSrcRoot+'/'+folderNameAssets+'/pages/**/*.css'
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
				.pipe(gulp.dest(pathCSSTargetFolder)) // 将文件写入指定文件夹
			;
		} else {
			return gulp.src(globsForCSSForSpecificPages)
				.pipe(minifyCSS(cssminOptions))
				.pipe(rename((fullPathName) => {
					fullPathName.basename += '.min';
					return fullPathName;
				}))
				.pipe(gulp.dest(pathCSSTargetFolder)) // 将文件写入指定文件夹
			;
		}
	});



	gulp.task('styles', [
		'styles-base',
		'styles-base-rest-files',
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
				// .pipe(concat('base.min.js'))
				// .pipe(minifyJS({preserveComments: 'some'}))
				.pipe(rename((fullPathName) => {
					fullPathName.basename += '.min';
					return fullPathName;
				}))
			// .pipe(sourcemaps.write('.'))

			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/assets/scripts')) // 将文件写入指定文件夹
		;
	});

	gulp.task('scripts', ['scripts-minify']);
})();



(function devAllHTMLTasks() {
	gulp.task('copy-html-snippets-files-to-temp-folder',  ['before-everything'], () => {
		return gulp.src([pathSrcRoot+'/html-snippets/**/*'])
			.pipe(gulp.dest(pathNewBuildTempRoot+/html-snippets/)) // 将文件写入指定文件夹
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
			.pipe(gulp.dest(pathNewBuildTempRoot+'/html-snippets/')) // 将文件写入指定文件夹
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
		let htmlminOptions = genOptionsForHTMLMin(runtime.buildingOptions.forCurrentMode.shouldMinifyHTML);

		return gulp.src([
			pathNewDevBuildCacheRoot+'/**/*.html',
			'!'+pathNewDevBuildCacheRoot+'/html-snippets/*'
		])
			.pipe(minifyHTML(htmlminOptions))
			.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files:   HTML', showFiles: false})) // 为了装逼，在命令行窗口中打印一下文件尺寸
			.pipe(gulp.dest(pathNewDevBuildCacheRoot)) // 将文件写入指定文件夹
		;
	});
})();



(function devAllAssetsTasks() {
	gulp.task('assets-vendors', ['before-everything'], () => {
		return gulp.src(pathSrcRoot+'/assets-vendors/**/*')
			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/assets-vendors/')) // 将文件写入指定文件夹
		;
	});


	gulp.task('fonts', ['before-everything'], () => {
		return gulp.src([
			pathSrcRoot+'/fonts/**/*'
		])
			.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files:  Fonts'})) // 为了装逼，在命令行窗口中打印一下文件尺寸
			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/fonts')) // 将文件写入指定文件夹
		;
	});

	gulp.task('images', ['before-everything'], () => {
		return gulp.src([
			pathSrcRoot+'/images/**/*'
		])
			.pipe(logFileSizes({title: '>>>>>>>>  Reporting Files: Images'})) // 为了装逼，在命令行窗口中打印一下文件尺寸
			.pipe(gulp.dest(pathNewDevBuildCacheRoot+'/images')) // 将文件写入指定文件夹
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

gulp.task('ship-cached-files', ['delete-old-dist'], () => {
	var shouldCopyFilesInsteadOfRenameFolder = false;

	if (shouldCopyFilesInsteadOfRenameFolder) {

		wlcLog('           >>>>>>>>  Copying all files from "'+pathNewDevBuildCacheRoot+'" to "'+pathDevBuildRoot+'"...');
		return gulp.src([pathNewDevBuildCacheRoot+'/**/*'])
			.pipe(gulp.dest(pathDevBuildRoot)) // 将文件写入指定文件夹
		;

	} else {

		wlcLog('           >>>>>>>>  Reanming "'+pathNewDevBuildCacheRoot+'" folder into "'+pathDevBuildRoot+'"...');
		fileSystem.renameSync(pathNewDevBuildCacheRoot, pathDevBuildRoot);

	}
});


gulp.task('finishing-after-shipping', ['ship-cached-files'], () => {
	wlcLog('最后，删除临时文件……');
	return del([pathNewBuildTempRoot]);
});






gulp.task('build-entire-app', ['finishing-after-shipping']);


gulp.task('watch-dev-folder', ['finishing-after-shipping'], () => {
	wlcLog('           >>>>>>>>  Starting watching development folder...');

	return gulp.watch(
		[pathSrcRoot+'/**/*'], // 监视这个文件夹
	 	['build-entire-app']   // 一旦有文件改动，执行这个任务
	)
		.on('change', (/*event, done*/) => {
			wlcLog('\n');
			wlcLog('-----------------------------------------------------------');
			wlcLog(new Date().toLocaleString());
			wlcLog('Wulechuan is telling you that some files were just changed.');
			wlcLog('-----------------------------------------------------------');
		})
	;
});


(function allTopLevelTasks() {
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
