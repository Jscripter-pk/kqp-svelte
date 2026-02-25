import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: true, // This allows any host to connect
		proxy: {
			'/apik': {
				target: 'http://141.164.63.141',
				changeOrigin: true
			}
		}
	}
});
