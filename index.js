'use strict'

const path = require('path')
const minify = require('html-minifier').minify
const getSource = require('./utils/get-source.js')

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
		this.setting = Object.assign({}, {
			publicPath: '',
			localBaseDir: '/',
			ext: '.html',
			minify: false
		}, options)
	}

	apply(compiler) {
		const pluginName = 'SSICompileWebpackPlugin';
		const { webpack } = compiler;
		const { Compilation, sources: { RawSource } } = webpack;

		compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
			const htmlArray = this.addFileToWebpackAsset(compilation);
			const contents = htmlArray.map((filename) => this.replaceSSIFile(compilation, filename))

			Promise.all(contents)
				.then(() => callback())
		})
	}

	replaceSSIFile(compilation, filename){
		const includeTagRegExp = /<!--#\s*include\s+(file|virtual)=(.*?)-->/g
		let source = compilation.assets[filename].source()
		const includeTags = source.match(includeTagRegExp)

		if(!includeTags){
			return Promise.resolve(source)
		}

		return Promise.all(includeTags.map((item) => {
			const src = item.split('"')[1]
			return getSource(src, this.userOptions)
		}))
			.then((results) => {
				includeTags.forEach((tag, index) => {
					source = source.replace(tag, (matchItem) => (
						decodeURIComponent(matchItem = encodeURIComponent(results[index]))
					))
				})

				compilation.assets[filename].source = () => {
					return this.userOptions.minify ? minify(source, {
						collapseWhitespace: true,
						minifyCSS: true,
						minifyJS: true
					}) : source
				}

				return results
			})
			.catch(err => {
				console.log('ERROR: ', err)
			})
	}

	addFileToWebpackAsset(compilation){
		const htmlName = []
		const source = compilation.assets

		Object.keys(source).forEach((item, index, array) => {
			let extReg = new RegExp(this.userOptions.ext, 'g')
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
}

module.exports = SSICompileWebpackplugin
