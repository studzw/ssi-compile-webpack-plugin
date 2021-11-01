'use strict'

const path = require('path')
const minify = require('html-minifier').minify
const getResource = require('./utils/getResource.js')

/**
 * @class SSICompileWebpackplugin
 * Replaces file/virtual tags in .*html files with online or local resources
 */
class SSICompileWebpackplugin{
	/**
	 * Creates an instance of SSICompileWebpackplugin.
	 * @param {String} publicPath Resource base path. If it is empty, the path will not be processed. If it is not empty, the path will be spliced into `${publicPath}/${path.basename}`
	 * @param {String} localBaseDir base directory for local files to be processed
	 * @param {String} ext File suffix to be processed. Use '\|' to separate multiple suffixes, such as '.html\|.shtml'
	 * @param {Boolean} minify Whether or not to compress HTML
	 */
	constructor(options){
		this.userOptions = options || {}
	}

	apply(compiler) {
		const pluginName = 'SSICompileWebpackPlugin';
		const defaultOptions = {
			publicPath: '',
			localBaseDir: '/',
			ext: '.html',
			minify: false,
			remoteBasePath: undefined,
		}
		this.options = Object.assign(defaultOptions, this.userOptions)

		compiler.hooks.emit.tapPromise(pluginName, (compilation) => {
			const htmlArray = this.addFileToWebpackAsset(compilation);
			const contents = htmlArray.map((filename) => this.replaceSSIFile(compilation, filename))

		 	return Promise.all(contents)
		})
	}

	addFileToWebpackAsset(compilation){
		const htmlName = []
		const source = compilation.assets

		Object.keys(source).forEach((item) => {
			let extReg = new RegExp(this.options.ext, 'g')
			if (extReg.test(item)) {
				htmlName.push(item)
				compilation.fileDependencies.add(item)

				const str = source[item].source()
				compilation.assets[item] = {
					source: function() {
						return str
					},
					size: function() {
						return str.length
					}
				}
			}
		})

		return htmlName
	}

	replaceSSIFile(compilation, filename){
		const includeTagRegExp = /<!--#\s*include\s+(file|virtual)=(.*?)-->/g
		let source = compilation.assets[filename].source()
		const includeTags = source.match(includeTagRegExp)

		if(!includeTags){
			return Promise.resolve(source)
		}

		const getResourceForMatchingTags = includeTags.map((item) => {
			const src = item.split('"')[1]
			return getResource(src, this.options)
		})

		return Promise.all(getResourceForMatchingTags)
			.then((resources) => this.replaceAssetWithResource(resources, source, includeTags))
			.then((source) => this.overwriteComplication(compilation, source, filename))
			.catch(console.error)
	}

	replaceAssetWithResource(resources, source, includeTags){
		includeTags.forEach((tag, index) => {
			source = source.replace(tag, (matchItem) => (
				decodeURIComponent(matchItem = encodeURIComponent(resources[index]))
			))
		})

		return source
	}

	overwriteComplication(compilation, source, filename) {
		compilation.assets[filename].source = () => {
			return this.options.minify ? minify(source, {
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true
			}) : source
		}
	}
}

module.exports = SSICompileWebpackplugin
