import path from 'node:path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

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
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
      historyApiFallback: {},
      port: 8080,
      hot: true,
      compress: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
      }),
      new MiniCssExtractPlugin({
        filename: 'styles/[name].[contenthash].css',
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
          include: [
            path.resolve(__dirname, 'src'),
          ],
        },
      ],
    },
  }
}
