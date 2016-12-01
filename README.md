# 静态编译ssi资源

## 使用

```javascript
// webpack.config.js
const SSICompileWebpackplugin = require('ssi-compile-webpack-plugin')
module.exports = {
    // config
    plugin: [
        new SSICompileWebpackplugin({
            publicPath: '',
            localBaseDir: '/',
            minify: false
        })
    ]
}
```

### 配合其他插件

> 插件的资源是根据webpack已有资源表中查找`.html`后缀产生的。所以正常需要配合其他插件/loader去读取.html作为入口

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SSICompileWebpackplugin = require('ssi-compile-webpack-plugin')
module.exports = {
    // config
    plugin: [
        new HtmlWebpackPlugin({
            // setting
        }),
        new SSICompileWebpackplugin({
            publicPath: '',
            localBaseDir: '/',
            minify: false
        })
    ]
}
```


## 配置说明

| *key* | *value* | *说明* |
| :---------  | :--------- | :------------------- |
| publicPath | String | 资源基础路径,为空时不处理路径，不为空的时将路径拼接为`${publicPath}/${path.basename}`, 默认 '' |
| localBaseDir | String | si本地路径的基础路径, 默认 '/' |
| minify | Boolean | 是否压缩html, 默认 false |
| ext | String | 需要处理的文件后缀,多后缀名使用`|`分割，如 `.html|.shtml` 默认 .html |
