#!/usr/bin/env node

import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

async function exportESLintConfig() {
  try {
    const configPath = new URL('./eslint.config.js', import.meta.url).pathname
    const { default: configFactory } = await import(pathToFileURL(configPath))
    const config = await configFactory

    const seen = new WeakSet()
    const serializedConfig = JSON.stringify(config, (_key, value) => {
      if (typeof value === 'function') {
        return `[Function: ${value.name || 'anonymous'}]`
      }
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]'
        }
        seen.add(value)
        if (value.constructor && value.constructor.name && value.constructor.name !== 'Object' && value.constructor.name !== 'Array') {
          return `[${value.constructor.name}: ${value.toString ? value.toString() : 'object'}]`
        }
      }
      return value
    }, 2)

    writeFileSync('./eslint-config-export.json', serializedConfig, 'utf8')
    
    process.stdout.write('✅ ESLint configuration exported to eslint-config-export.json\n')
    process.stdout.write(`📊 Total size: ${(serializedConfig.length / 1024).toFixed(2)} KB\n`)
    
    if (Array.isArray(config)) {
      process.stdout.write(`📋 Configuration blocks: ${config.length}\n`)
    }
  } catch (error) {
    process.stderr.write(`❌ Error reading ESLint config: ${error.message}\n`)
    process.exit(1)
  }
}

exportESLintConfig()
