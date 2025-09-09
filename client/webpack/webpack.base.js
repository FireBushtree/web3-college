import path from 'node:path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import WebpackBar from 'webpackbar'

const __dirname = path.resolve('./')

export default {
  entry: './src/main.tsx',
  output: {
    publicPath: '/',
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
    }),
    new WebpackBar({
      fancy: true,
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
        use: {
          loader: 'swc-loader',
          options: genSwcLoaderOptions(),
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        include: [path.resolve(__dirname, 'src')],
      },
    ],
  },
}

function genSwcLoaderOptions() {
  const isDev = process.env.NODE_ENV === 'development'

  return {
    jsc: {
      parser: {
        syntax: 'typescript',
        jsx: true,
        decorators: false,
        dynamicImport: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
          development: isDev,
          importSource: 'react',
        },
      },
      target: 'es2017',
    },
    module: {
      type: 'es6',
    },
    sourceMaps: true,
  }
}
