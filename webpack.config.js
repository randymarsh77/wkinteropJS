var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, 'src');
var MinifyPlugin = new webpack.optimize.UglifyJsPlugin({
	compress:{
		warnings: true
	}
});

var config = {
	entry: APP_DIR + '/index.js',
	resolve: {
		extensions: [ '', '.js' ]
	},
	output: {
		path: BUILD_DIR,
		filename: 'index.js',
		library: 'wkinterop',
		libraryTarget: 'umd',
	    umdNamedDefine: true,
	},
	module : {
		loaders : [
			{
				test : /\.js/,
				include : APP_DIR,
				loader : 'babel',
				query : {
					presets : [ 'es2015', 'stage-1' ],
					plugins: [
						'transform-decorators-legacy',
					],
				},
			},
		]
	},
	plugins: [
		MinifyPlugin,
	]
};

module.exports = config;
