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
 * Get SSI resource
 *
 * @param {String} source source of the SSI resource, from the file/virtual attribute
 * @param {Object} options options passed in from initialization of the plugin
 * @returns {Promise} resolve(body obtained from resource) reject(error status code/information stack)
 */

async function getResource(source, options){
  const isRemotePath = /https?\:\/\//g.test(source)
  const context = options.localBaseDir
  const publicPath = options.publicPath.trim()

  if(publicPath !== ''){
    return Promise.resolve(`<!--#include file="${publicPath}/${path.basename(source)}"-->`)
  }

  if(isRemotePath){
    return fetch(source, {
      compress: true,
      timeout: 5000,
    })
      .then(checkStatus)
      .then(res => res.text())
  }

  return new Promise((resolve, reject) => {
    try{
      const absolutePath = path.normalize(context ? path.join(context, source) : source)
      const body = fs.readFileSync(absolutePath).toString()
      resolve(body)
    }catch(e){
      reject(e)
    }
  })
}

module.exports = getResource
