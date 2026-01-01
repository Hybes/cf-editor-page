import withNuxt from './.nuxt/eslint.config.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import unusedImports from 'eslint-plugin-unused-imports'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
})

export default withNuxt([
	{
		ignores: ['./lib/**/*', './app/components/ui/**/*', './.nuxt/**/*']
	},
	...compat.extends('eslint:recommended', 'plugin:prettier/recommended'),
	{
		plugins: {
			'unused-imports': unusedImports
		},
		rules: {
			'prettier/prettier': [
				'error',
				{
					singleQuote: true,
					semi: false,
					useTabs: true,
					tabWidth: 4,
					trailingComma: 'none',
					bracketSpacing: true,
					printWidth: 120,
					endOfLine: 'auto'
				}
			],
			'@typescript-eslint/no-dynamic-delete': 'off',
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_'
				}
			],
			'vue/no-use-v-if-with-v-for': 'off',
			'vue/no-v-html': 'off',
			'vue/multi-word-component-names': 'off'
		}
	}
])
