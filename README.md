# ssi-compile-webpack-plugin
Statically compile SSI resources

## Getting Started

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

### Note about other plugins

The resources of the plug-in are generated by searching for the suffix of `.html` in the existing resource table of webpack. So normally you need to cooperate with other plug-ins/loaders to read .html as the entrance

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


## Options

| Name | Type | Default | Description |
| :---------  | :--------- | :--------- | :------------------- |
| publicPath | String | '' | Resource base path. If it is empty, the path will not be processed. If it is not empty, the path will be spliced into `${publicPath}/${path.basename}`|
| localBaseDir | String | '/' | The base path of the si local path |
| minify | Boolean | false | Whether or not to compress HTML |
| ext | String | '.html' | File suffix to be processed. Use '\|' to separate multiple suffixes, such as '.html\|.shtml' |
