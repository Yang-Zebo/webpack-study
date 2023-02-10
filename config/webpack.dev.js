const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  // 入口文件 entry 写绝对路径和相对路径都行
  // 我们在外面运行，所以相对路径不用改
  entry: "./main.js",
  // 打包输出的位置
  output: {
    // path 表示所有打包编译的文件输出的位置，需要写绝对路径
    // 由于是开发环境，所以可以不用输出
    path: undefined,
    // filename 表示入口文件要打包编译输出的文件名
    filename: "js/main.js",
    clean: true, // 自动将上次打包目录资源清空
  },
  // loader 加载器
  module: {
    rules: [
      {
        // 用来匹配 .css 结尾的文件
        test: /\.css$/,
        // use 数组里面 Loader 执行顺序是从右到左
        // css-loader 用来编译 css 文件
        // style-loader 将样式资源打包到 main.js
        // 引入 main.js 后会用 style 标签的方式将样式加到 html 里
        use: ["style-loader", "css-loader"],
      },
      {
        // 用来匹配 .less 结尾的文件
        test: /\.less$/,
        // less-loader 负责将 less 文件编译成 css 文件
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        // 用来匹配 scss 文件或者 sass 文件
        test: /\.s[ac]ss$/,
        // sass-loader 负责将 sass/scss 文件编译成 css 文件
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      // 处理图片资源
      // 过去在 Webpack4 时，我们处理图片资源通过 file-loader 和 url-loader 进行处理
      // 现在 Webpack5 已经将两个 Loader 功能内置到 Webpack 里了，我们只需要简单配置即可处理图片资源
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: "asset",
        // 我们还可以进行优化 将小于某个大小的图片转化成 data URI 形式（Base64 格式）
        // 优点：减少请求数量  缺点：体积变得更大
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
          },
        },
        // 继续优化，设置图片文件的输出地址
        generator: {
          // 将图片文件输出到 static/images 目录中
          // 将图片文件命名 [hash:8][ext][query]
          // [hash:8]: hash值取8位
          // [ext]: 使用之前的文件扩展名
          // [query]: 添加之前的query参数 可有可无
          filename: "images/[hash:8][ext][query]",
        },
      },
      // 字体图标处理，也可以处理音视频文件，直接在 test 上加规则就行
      {
        test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
        // resource 资源完整输出
        // 由于不需要进行base64转换所以不用像上面一样配置
        type: "asset/resource",
        generator: {
          filename: "media/[hash:8][ext][query]",
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/, // 排除node_modules代码不编译
        loader: "babel-loader",
        // babel-loader 的其他配置可以直接写在下面或者写在 babel.config.js 文件里
        // options: {
        //   presets: ['@babel/preset-env']
        // }
      },
    ],
  },
  // 使用插件，用来扩展 webpack 功能
  plugins: [
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录,如果不符合规则会报错，如果没这个插件，只有 eslint 那么
      // 只有在打包的时候才会报错
      // 由于在config文件里，绝对路径要出去一级文件夹，注意正确
      context: path.join(__dirname, "../src"),
    }),
    new HtmlWebpackPlugin({
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
      // 以 public/index.html 为模板创建文件
      template: path.join(__dirname, "../public/index.html"),
    }),
  ],
  // 打包编译的模式 development 开发模式 production 生产模式
  mode: "development",
  // 开发服务器，只要文件一修改就会自动在内存中打包编译
  devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
  },
};
