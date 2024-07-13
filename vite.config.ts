import { sentrySvelteKit } from '@sentry/sveltekit'
import { sveltekit } from '@sveltejs/kit/vite'
import { threeMinifier } from '@yushijinhun/three-minifier-rollup'
import { defineConfig } from 'vite'
import arraybuffer from 'vite-plugin-arraybuffer'

export default defineConfig({
	plugins: [
		{ ...threeMinifier(), enforce: 'pre' },
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'sushi',
				project: 'hexagon-new',
				authToken: process.env.SENTRY_AUTH_TOKEN
			}
		}),
		arraybuffer(),
		sveltekit()
	],
	build: {
		target: 'esnext',
		sourcemap: false,
		minify: 'esbuild',
		rollupOptions: {
			output: {
				sourcemap: 'hidden' // hide inline source maps
			},
			external: ['meshconvert']
		}
	},
	ssr: {
		noExternal: ['three']
	},
	server: {
		port: 9000,
		strictPort: false
		//proxy: {
		//	'/asset': 'http://127.0.0.1:8080'
		//}
	},
	preview: {
		port: 9000,
		strictPort: false
		//proxy: {
		//	'/asset': 'http://127.0.0.1:8080'
		//}
	}
})
