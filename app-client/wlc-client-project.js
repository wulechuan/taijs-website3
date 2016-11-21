// 文件夹结构：
//
// {project-root}
//   └─ {app-client-root}
//       ├─ source        <-- 这是开发源码（Development）文件夹
//       │   ├─ html
//       │   └─ assets
//       │       ├─ images
//       │       ├─ scripts
//       │       └─ styles
//       │
//       ├─build-dev      <-- 这是开发预览文件夹
//       │
//       ├─build-release  <-- 这是正式发布文件夹
//       │
//       └─node_modules   <-- 这是node插件文件夹，纯粹供node使用，与最终前端产品毫无干系




module.exports = {
	name: '泰金所 2016-11',
	appFolderStructure: 'tranditional',
	folderOf: {
		srcRoot:                  'source',
		devBuildRoot:             'build-dev',
		releaseBuildRoot:         'build-release',
		newBuildTempRoot:         '_build_temp',
		newDevBuildCacheRoot:     '_build_dev_cache',
		newReleaseBuildCacheRoot: '_build_release_cache',
		assets:                   'assets', // 图片、视频、音频、供下载的文档、字体……
		CSS:                      'assets/styles',
		JS:                       'assets/scripts',
		HTML:                     'html',
		HTMLSnippets:             'html-snippets'
	},

	globs: {
		all: [
			'/assets/base-_framework/iconfonts/**/*',
			'!/assets/base-_framework/iconfonts/**/*.css',
		]
	},

	buildFor: {
		dev: {
			shouldMinifyHTML: false,
			shouldMinifyCSS: false,
			shouldMinifyJS: false,
			shouldGenerateSoureMaps: true
		},
		release: {
			shouldMinifyHTML: true,
			shouldMinifyCSS: true,
			shouldMinifyJS: true,
			shouldGenerateSoureMaps: false
		}
	},

	filesViaConcatenation: {
		CSS: {
			base: [
				// 下面壹壹列出各个glob，目的是保证这些css文件合并的顺序。
				// 我们知道，错误的CSS顺序可能导致错误的结果。
				'base-_framework/_reset*.css',
				'base-of-this-project/iconfonts/*.css',
				'base-_framework/base.css',
				// 'base-_framework/base-ie8.css',
				'base-of-this-project/_fonts*.css',
				'base-of-this-project/layout.css',
				'base-of-this-project/theme-_default.css',
				// 'base-of-this-project/theme-_default-ie8.css'
			]
		}
	},

	injections: [
		{
			snippetsPathRoot: '/html-snippets/',
			couples: [
				{
					replaceTag: 'headBeforeTitle:html',
					withFile:   'tag-head-before-title.html'
				},
				{
					replaceTag: 'headAfterTitle:html',
					withFile:   'tag-head-after-title.html'
				},
				{
					replaceTag: 'bodyBegin:html',
					withFile:   'tag-body-begin.html'
				},
				{
					replaceTag: 'bodyEnd:html',
					withFile:   'tag-body-end.html'
				},
				{
					replaceTag: 'appRootWrapBegin:html',
					withFile:   'module-app-root-wrap-begin.html'
				},
				{
					replaceTag: 'appRootWrapEnd:html',
					withFile:   'module-app-root-wrap-end.html'
				},
				{
					replaceTag: 'appBGLayer0:html',
					withFile:   'module-app-bg-layer-0.html'
				},
				{
					replaceTag: 'appFGLayerWrapBegin:html',
					withFile:   'module-app-fg-layer-wrap-begin.html'
				},
				{
					replaceTag: 'appFGLayerWrapEnd:html',
					withFile:   'module-app-fg-layer-wrap-end.html'
				},
				{
					replaceTag: 'appHeader:html',
					withFile:   'module-app-header.html'
				},
				{
					replaceTag: 'appFooter:html',
					withFile:   'module-app-footer.html'
				},
				{
					replaceTag: 'pageBodyStamp0:html',
					withFile:   'module-page-body-stamp-0.html'
				},
				{
					replaceTag: 'pageBodyStamp1:html',
					withFile:   'module-page-body-stamp-1.html'
				},
				{
					replaceTag: 'globalPopupLayers:html',
					withFile:   'module-global-popup-layers.html'
				},
				{
					replaceTag: 'popupLayersWrapBegin:html',
					withFile:   'module-popup-layers-wrap-begin.html'
				},
				{
					replaceTag: 'popupLayersWrapEnd:html',
					withFile:   'module-popup-layers-wrap-end.html'
				},
				{
					replaceTag: 'popupLayerVCodes:html',
					withFile:   'module-popup-layer-vcodes.html'
				}
			]
		}
	]
};