'use strict'

const path = require('path')
const minify = require('html-minifier').minify
const getSource = require('./utils/get-source.js')
const eachPromise = require('./utils/each-promise.js')




/**
 * @class SSICompileWebpackplugin
 * ssi资源路径替换策略
 * 解析file路径 => 判断是否为线上资源
 * 线上资源 => http => 组合页面
 * 本地资源 => 解析路径 => fs => 组合页面
 */
class SSICompileWebpackplugin{

    /**
     * Creates an instance of SSICompileWebpackplugin.
     *
     * @param {String} publicPath 资源基础路径,为空时不处理路径，不为空的时将拼接路径的`${publicPath}/${path.basename}`
     * @param {String} localBaseDir ssi本地路径的基础路径前缀
     * @param {String} ext 需要处理的后缀名，多个后缀可使用`|`分割
     * @param {Boolean} minify true压缩, false不压缩
     *
     * @memberOf SSICompileWebpackplugin
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
            if(extReg.test(item)){

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
