const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: './src/index.js',
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, "public"),
    filename: "[name].[hash].js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html")
    })
  ],
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  devServer: {
    historyApiFallback: {
      disableDotRule: true
    },
    contentBase: path.resolve(__dirname, "public"),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false
      }
    }
  }
};
