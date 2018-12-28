const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')

const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i

module.exports = {
  // 'dist', 生产环境构建文件的目录
  outputDir: process.env.outputDir || 'dist',
  productionSourceMap: false,
  lintOnSave: false,

  configureWebpack: config => {
    if (IS_PROD) {
      const plugins = [];
      plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              warnings: false,
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log']
            }
          },
          sourceMap: false,
          parallel: true
        })
      )

      // plugins.push(
      //   new CompressionWebpackPlugin({
      //     filename: '[path].gz[query]',
      //     algorithm: 'gzip',
      //     test: productionGzipExtensions,
      //     threshold: 10240,
      //     minRatio: 0.8
      //   })
      // )

      // // 上传文件到oss
      // if (process.env.ACCESS_KEY_ID || process.env.ACCESS_KEY_SECRET || process.env.REGION || process.env.BUCKET || process.env.PREFIX) {
      //   plugins.push(
      //     new AliOssPlugin({
      //       accessKeyId: process.env.ACCESS_KEY_ID,
      //       accessKeySecret: process.env.ACCESS_KEY_SECRET,
      //       region: process.env.REGION,
      //       bucket: process.env.BUCKET,
      //       prefix: process.env.PREFIX,
      //       exclude: /.*\.html$/,
      //       deleteAll: false
      //     })
      //   );
      // }

      config.plugins = [
        ...config.plugins,
        ...plugins
      ]
    }
  },
  chainWebpack: config => {
    // 修复HMR
    config.resolve.symlinks(true)

    // 修复Lazy loading routes Error： Cyclic dependency  [https://github.com/vuejs/vue-cli/issues/1669]
    config.plugin('html').tap(args => {
      args[0].chunksSortMode = 'none'
      return args
    })

    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      // .set('assets', resolve('src/assets'))
      // .set('components', resolve('src/components'))
      // .set('layout', resolve('src/layout'))
      // .set('base', resolve('src/base'))
      // .set('static', resolve('src/static'))

    // 多页面配置，为js添加hash
    // config.output.chunkFilename(`js/[name].[chunkhash:8].js`)

    // 修改图片输出路径
    // config.module
    //   .rule('images')
    //   .test(/\.(png|jpe?g|gif|ico)(\?.*)?$/)
    //   .use('url-loader')
    //   .loader('url-loader')
    //   .options({
    //       name: path.join('../assets/', 'img/[name].[ext]')
    //   })

  },
  css: {
    modules: false,
    extract: IS_PROD,
    // 为css后缀添加hash
    extract: {
     filename: 'css/[name].[hash:8].css',
     chunkFilename: 'css/[name].[hash:8].css'
    },
    sourceMap: false,
    loaderOptions: {
      sass: {
        data: `@import "@/styles/variables.scss";`
      },
      // px转换为rem
      // postcss: {
      //   plugins: [
      //     require('postcss-pxtorem')({
      //       rootValue : 1, // 换算的基数
      //       selectorBlackList  : ['weui', 'el'], // 忽略转换正则匹配项
      //       propList   : ['*']
      //     })
      //   ]
      // }
    }
  },
  pluginOptions: {
      // 安装vue-cli-plugin-style-resources-loader插件
      // 添加全局样式global.scss
      // "style-resources-loader": {
      //   preProcessor: "scss",
      //   patterns: [
      //     resolve(__dirname, "./src/scss/scss/variables.scss")
      //   ]
      // }
  },
  parallel: require('os').cpus().length > 1,
  devServer: {
      // overlay: {
      //   warnings: true,
      //   errors: true
      // },
      open: IS_PROD,
      // host: '127.0.0.1',
      port: 8000,
      https: false,
      hotOnly: false,
      proxy: {
          '/api': {
              target: process.env.API_BASE_URL || 'http://127.0.0.1:8080',
              changeOrigin: true
          }
      }
  }
}
