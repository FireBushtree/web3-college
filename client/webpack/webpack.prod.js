import HtmlWebpackPlugin from 'html-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

const plugins = [
  new HtmlWebpackPlugin({
    template: './index.prod.html',
    filename: 'index.html',
    templateParameters: {
      isProduction: true,
    },
  }),
]

if (process.env.ANALYZE) {
  plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'server', // 可选: 'server', 'static', 'json'
      analyzerHost: '127.0.0.1',
      analyzerPort: 8888,
      openAnalyzer: true, // 自动打开浏览器
    }),
  )
}

export default {
  plugins,
  cache: false,
  externals: {
    react: 'React',
    axios: 'axios',
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
}
