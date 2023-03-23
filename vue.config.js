const {
    defineConfig
} = require('@vue/cli-service')


const getIPAdress = () => {
    var interfaces = require('os').networkInterfaces()
    for (var devName in interfaces) {
        var iface = interfaces[devName]
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i]
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address
            }
        }
    }
}

module.exports = defineConfig({
    transpileDependencies: true,

    productionSourceMap: false,

    publicPath: '/',

    outputDir: 'dist',

    devServer: {
        host: getIPAdress(),
        port: 1314,

        proxy: {
            /**
             * /?.app 服务的接口
             */
            '/appapi': {
                target: 'http://admin.vehicle-dev.mokua.com:6080/',
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    '^/appapi': '/'
                }
            },


            /**
             *  /api 服务的接口
             */
            '/api': {
                target: 'http://10.33.0.60:6012/',
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/'
                }
            },
        }
    }
})