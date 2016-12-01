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

        this.setting = Object.assign({}, {
            publicPath: '',
            localBaseDir: '/',
            ext: '.html',
            minify: false
        }, options)
    }


    apply(compile, callback){

        compile.plugin('emit',  (compilation, callback) => {

            const htmlNameArr = this.addFileToWebpackAsset(compilation)

            if(htmlNameArr.length === 0){
                return callback()
            }

            eachPromise(htmlNameArr.map((item) => {
                return this.replaceSSIFile(compilation, item)
            }))
            .then(() => {
                callback()
            }, () => {
                callback()
            })
            .catch(() => {
                throw new Error('ssi资源替换出错')
            })

            


        })

    }


    replaceSSIFile(compilation, name){
        const includeFileReg = /<!--#\s*include\s+(file|virtual)=(['"])([^\r\n\s]+?)\2\s*(.*)-->/g
        let source = compilation.assets[name].source()
        const fileArr = source.match(includeFileReg)

        if(!fileArr){
            Promise.resolve(source)
        }
        
        return new Promise((resolve, reject) => {


            eachPromise(fileArr.map((item) => {
                const src = item.split('"')[1]
                return getSource(src, this.setting)
            }))
            .then((sucessResult) => {

                fileArr.forEach((i, j) => {
                    source = source.replace(i, function(matchItem){
                        return decodeURIComponent(matchItem = encodeURIComponent(sucessResult[j].data))
                    })
                })

                compilation.assets[name].source = () => {
                    return this.setting.minify ? minify(source, {
                        collapseWhitespace: true,
                        minifyCSS: true,
                        minifyJS: true
                    }) : source
                }

                resolve(sucessResult)
            }, (errResult) => {

                fileArr.forEach((i, j) => {
                    source = source.replace(i, function(matchItem){
                        return decodeURIComponent(matchItem = encodeURIComponent(errResult[j].data))
                    })
                })

                compilation.assets[name].source = () => {
                    return this.setting.minify ? minify(source, {
                        collapseWhitespace: true,
                        minifyCSS: true,
                        minifyJS: true
                    }) : source
                }

                reject(errResult)
            })
            .catch((err) => {
                reject(err)
            })

        })

    }


    addFileToWebpackAsset(compilation){

        const htmlName = []
        const source = compilation.assets

        Object.keys(source).forEach((item, index, array) => {
            let extReg = new RegExp(this.setting.ext, 'g')
            if(extReg.test(item)){

                htmlName.push(item)
                compilation.fileDependencies.push(item)

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