import { sentrySvelteKit } from '@sentry/sveltekit'
import { sveltekit } from '@sveltejs/kit/vite'
import { threeMinifier } from '@yushijinhun/three-minifier-rollup'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		{ ...threeMinifier(), enforce: 'pre' },
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'sushi',
				project: 'hexagon-new'
			}
		}),
		sveltekit()
	],
	build: {
		target: 'esnext',
		sourcemap: false,
		minify: 'esbuild',
		rollupOptions: {
			output: {
				sourcemap: 'hidden' // hide inline source maps
			}
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
