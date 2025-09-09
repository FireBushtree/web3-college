import { merge } from 'webpack-merge'
import BaseConfig from './webpack/webpack.base.js'
import DevConfig from './webpack/webpack.dev.js'
import ProdConfig from './webpack/webpack.prod.js'

const config = merge(
  BaseConfig,
  process.env.NODE_ENV === 'development' ? DevConfig : ProdConfig,
)

export default config
