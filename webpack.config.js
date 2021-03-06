const path = require('path');
const findImports = require('find-imports');
const stylusLoader = require('stylus-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const nib = require('nib');
const webpack = require('webpack');
const pkg = require('./package.json');
const babelConfig = require('./babel.config');

const publicname = pkg.name.replace(/^@\w+\//, ''); // Strip out "@trendmicro/" from package name
const banner = [
    publicname + ' v' + pkg.version,
    '(c) ' + new Date().getFullYear() + ' Trend Micro Inc.',
    pkg.license,
    pkg.homepage
].join(' | ');
const localClassPrefix = publicname.replace(/^react-/, ''); // Strip out "react-" from publicname

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        [publicname]: path.resolve(__dirname, 'src/index.js')
    },
    output: {
        path: path.join(__dirname, 'lib'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    externals: []
        .concat(findImports(['src/**/*.{js,jsx}'], { flatten: true }))
        .concat(Object.keys(pkg.peerDependencies))
        .concat(Object.keys(pkg.dependencies)),
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: babelConfig
            },
            {
                test: /\.styl$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: `${localClassPrefix}---[local]---[hash:base64:5]`,
                            camelCase: true,
                            importLoaders: 1
                        }
                    },
                    'stylus-loader'
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|svg)$/,
                loader: 'url-loader'
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    mimetype: 'application/font-woff'
                }
            },
            {
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                // This has effect on the react lib size
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new stylusLoader.OptionsPlugin({
            default: {
                // nib - CSS3 extensions for Stylus
                use: [nib()],
                // no need to have a '@import "nib"' in the stylesheet
                import: ['~nib/lib/nib/index.styl']
            }
        }),
        new MiniCssExtractPlugin({
            filename: '../dist/[name].css',
        }),
        new webpack.BannerPlugin(banner)
    ],
    resolve: {
        extensions: ['.js', '.json', '.jsx']
    }
};
