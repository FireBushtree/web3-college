// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  react: true,
  rules: {
    'react-dom/no-missing-button-type': 'off',
  },
})
