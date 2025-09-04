// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  react: true,
  rules: {
    'react-dom/no-missing-button-type': 'off',
    'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
  },
})
