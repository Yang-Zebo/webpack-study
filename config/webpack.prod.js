const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// webpack 内置插件用来压缩js代码
const TerserPlugin = require("terser-webpack-plugin");
// nodejs核心模块，直接使用
const os = require("os");
// cpu核数
const threads = os.cpus().length;
// 之前处理样式的配置过多，把相同的提取出来获取处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
  return [
    MiniCssExtractPlugin.loader,
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", // 能解决大多数样式兼容性问题
          ],
        },
      },
    },
    preProcessor,
  ].filter(Boolean);
};
module.exports = {
  // 入口文件 entry 写绝对路径和相对路径都行
  entry: "./main.js",
  // 打包输出的位置
  output: {
    // path 表示所有打包编译的文件输出的位置，需要写绝对路径
    path: path.join(__dirname, "../dist"),
    // filename 表示入口文件要打包编译输出的文件名
    filename: "js/main.js",
    clean: true, // 自动将上次打包目录资源清空
  },
  // loader 加载器
  module: {
    rules: [
      {
        oneOf: [
          {
            // 用来匹配 .css 结尾的文件
            test: /\.css$/,
            // use 数组里面 Loader 执行顺序是从右到左
            // css-loader 用来编译 css 代码到 js 中
            // style-loader js 中的样式变成 style 标签的方式将样式加到 html 里
            // 但是这样我们在加载的时候要先夹在JS,才会有样式，那么这样可能会出现闪屏现象，
            // 我们应该使用 MiniCssExtractPlugin.loader 来取代 style-loader 完成样式的处理
            // MiniCssExtractPlugin.loader 与插件配合会将 CSS 样式生成文件
            // use: ["style-loader", "css-loader"],
            // use: [MiniCssExtractPlugin.loader, "css-loader"],
            use: getStyleLoaders(),
          },
          {
            // 用来匹配 .less 结尾的文件
            test: /\.less$/,
            // less-loader 负责将 less 文件编译成 css 文件
            // use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
            use: getStyleLoaders("less-loader"),
          },
          {
            // 用来匹配 scss 文件或者 sass 文件
            test: /\.s[ac]ss$/,
            // sass-loader 负责将 sass/scss 文件编译成 css 文件
            // use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            use: getStyleLoaders("sass-loader"),
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
            // loader: "babel-loader",
            // babel-loader 的其他配置可以直接写在下面或者写在 babel.config.js 文件里
            // 每次打包时 js 文件都要经过 Eslint 检查 和 Babel 编译，速度比较慢。
            // 我们可以缓存之前的 Eslint 检查 和 Babel 编译结果，
            // 这样第二次打包只会编译修改过的文件，这样速度就会更快了。
            // options: {
            //   cacheDirectory: true, // 开启babel编译缓存
            //   cacheCompression: false, // 缓存文件不要压缩
            // },
            // 不止一个loader就要使用use了
            use: [
              {
                loader: "thread-loader", // 开启多进程
                options: {
                  workers: threads, // 数量
                },
              },
              {
                loader: "babel-loader",
                options: {
                  cacheDirectory: true, // 开启babel编译缓存
                  cacheCompression: false,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  // 使用插件，用来扩展 webpack 功能
  plugins: [
    new ESLintWebpackPlugin({
      // 指定检查文件的根目录,如果不符合规则会报错，如果没这个插件，只有 eslint 那么
      // 只有在打包的时候才会报错
      context: path.join(__dirname, "../src"),
      exclude: "node_modules",
      // 下面这个目前报错不能用 就先用 exclude: /node_modules/,
      // include: path.join(__dirname, "../src")
      cache: true, // 开启缓存
      // 缓存目录
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintcache"
      ),
      threads, // 开启多进程
    }),
    new HtmlWebpackPlugin({
      // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js/css等资源
      // 3. 在生产模式下也可以压缩 html 代码
      // 以 public/index.html 为模板创建文件
      template: path.join(__dirname, "../public/index.html"),
    }),
    new MiniCssExtractPlugin({
      // 可以设置生产的 css 文件的路径与名称
      filename: "css/main.css",
    }),
    // css 压缩 可以写在一个专门压缩的对象里
    // new CssMinimizerPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      // css压缩也可以写到optimization.minimizer里面，效果一样的
      new CssMinimizerPlugin(),
      // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
      new TerserPlugin({
        parallel: threads, // 开启多进程,前期会比较耗时，当代码多了就反而会快了
      }),
    ],
  },
  // 打包编译的模式 development 开发模式 production 生产模式
  mode: "production",
  // 开发服务器，只要文件一修改就会自动在内存中打包编译
  // 生产模式不需要devServer
  // devServer: {
  //   host: "localhost", // 启动服务器域名
  //   port: "3000", // 启动服务器端口号
  //   open: true, // 是否自动打开浏览器
  // },
  // SourceMap（源代码映射）是一个用来生成源代码与构建后代码一一映射的文件的方案。
  // 它会生成一个 xxx.map 文件，里面包含源代码和构建后代码每一行、每一列的映射关系。当构建后代码出错了，会通过 xxx.map 文件，从构建后代码出错位置找到映射后源代码出错位置，
  // 从而让浏览器提示源代码文件出错位置，帮助我们更快的找到错误根源。用 devtool 开启
  // 生产模式：source-map 优点：包含行/列映射 缺点：打包编译速度更慢
  devtool: "source-map",
};
