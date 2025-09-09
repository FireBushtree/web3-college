import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.dev.html',
      filename: 'index.html',
    }),
  ],

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
}
