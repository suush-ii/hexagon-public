import { sentrySvelteKit } from '@sentry/sveltekit'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'sushi',
				project: 'javascript-sveltekit'
			}
		}),
		sveltekit()
	],
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
