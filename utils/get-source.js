'use strict'

const fs = require('fs')
const path = require('path')
const request = require('request')


/**
 * 获取ssi资源内容
 * 
 * @param {String} dir 路径
 * @param {Object} setting 设置，主要使用localBaseDir和publicPath
 * @returns {Promise}  resolve(解析dir得到的资源) reject(错误状态码||异常信息栈)
 */
function getSource(dir, setting){


    const isRemotePath = /https?\:\/\//g.test(dir)
    const context = setting.localBaseDir
    const publicPath = setting.publicPath.trim()

    if(publicPath !== ''){
        return Promise.resolve(`<!--#include file="${publicPath}/${path.basename(dir)}"-->`)
    }

    if(isRemotePath){

        return new Promise((resolve, reject) => {
            request({
                url: dir,
                gzip: true,
                timeout: 5000
            }, (err, res, body) => {

                if(err){
                    reject(err)
                }

                if(res.statusCode !== 200){
                    reject(res.statusCode)
                }
                resolve(body)

            })
        })

    }else {

        return new Promise((resolve, reject) => {

            try{

                const absoultPath = path.normalize(context ? path.join(context, dir) : dir)
                const body = fs.readFileSync(absoultPath).toString()

                resolve(body)

            }catch(e){
                reject(e)
            }

        })

    }

}

module.exports = getSource