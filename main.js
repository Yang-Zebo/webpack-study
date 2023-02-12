import add from "./src/utils/add";
import "./public/css/index.css";
import "./public/less/index.less";
import "./public/sass/index.sass";
import "./public/sass/index.scss";
console.log(add(3, 3, 4, 5));
const aa = 222;
// 开发时我们修改了其中一个模块代码，Webpack 默认会将所有模块全部重新打包编译，速度很慢。
// 所以我们需要做到修改某个模块代码，就只有这个模块代码需要重新打包编译，
// 其他模块不变，这样打包速度就能很快。
// 这样我们就需要热模块替换 HotModuleReplacement ，在开发环境的 devserve 中
// hot：true，可以开启功能，style-loader可以进行是 css 样式热替换
// JS的话还需要自己动手如下
// if (module.hot) {
//   module.hot.accept("./src/utils/add.js", function (count) {
//     // 这个函数是个回调函数，在进行热模块替换时会调用，可以不写
//     const result1 = count(2, 1);
//     console.log(result1);
//   });
// }
// 上面这样写会很麻烦，所以实际开发我们会使用其他 loader 来解决。
// 比如：vue-loader, react-hot-loader。
