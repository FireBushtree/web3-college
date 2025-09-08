import path from 'node:path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

const __dirname = path.resolve('./')

export default (env, argv) => {
  const isProd = argv.mode === 'production'

  return {
    cache: {
      type: 'filesystem',
    },
    entry: './src/main.tsx',
    output: {
      publicPath: '/',
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].chunk.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        // 通用大小限制
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },

      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: true, drop_debugger: true },
          },
        }),
      ],
    },
    devServer: {
      historyApiFallback: {},
      port: 8080,
      hot: true,
      compress: true,
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
      }),
      new MiniCssExtractPlugin({
        filename: 'styles/[name].[contenthash].css',
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'server', // 可选: 'server', 'static', 'json'
        analyzerHost: '127.0.0.1',
        analyzerPort: 8888,
        openAnalyzer: true, // 自动打开浏览器
      }),
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: 'swc-loader',
        },
        {
          test: /\.css$/i,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
          include: [path.resolve(__dirname, 'src')],
        },
      ],
    },
  }
}
