// module.exports = {
//     plugins: {
//         'postcss-pxtorem': {
//             rootValue: 75, // 已设计稿宽度375px为例 vant用的是375的设计稿
//             unitPrecision: 10,
//             propList: ['*'],
//         },
//     },
// };





// .postcssrc.js


module.exports = {
    "plugins": {
        'postcss-px-to-viewport': {
            propList: ['*'],
            viewportWidth: 750,
            unitPrecision: 10,
            fontViewportUnit: 'vw',
            viewportUnit: 'vw',
            mediaQuery: true,
            landscape: false
        }
    }
}