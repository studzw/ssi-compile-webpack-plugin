'use strict'

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

function checkStatus(res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res;
  } else {
    throw new Error(res.statusText);
  }
}

/**
 * 获取ssi资源内容
 *
 * @param {String} dir 路径
 * @param {Object} setting 设置，主要使用localBaseDir和publicPath
 * @returns {Promise}  resolve(解析dir得到的资源) reject(错误状态码||异常信息栈)
 */

async function getSource(dir, setting){
  const isRemotePath = /https?\:\/\//g.test(dir)
  const context = setting.localBaseDir
  const publicPath = setting.publicPath.trim()

  if(publicPath !== ''){
    return Promise.resolve(`<!--#include file="${publicPath}/${path.basename(dir)}"-->`)
  }

  if(isRemotePath){
    return fetch(dir, {
      compress: true,
      timeout: 5000,
    })
      .then(checkStatus)
      .then(res => res.text())
  } else {
    return new Promise((resolve, reject) => {
      try{
        const absolutePath = path.normalize(context ? path.join(context, dir) : dir)
        const body = fs.readFileSync(absolutePath).toString()
        resolve(body)
      }catch(e){
        reject(e)
      }
    })
  }
}

module.exports = getSource
