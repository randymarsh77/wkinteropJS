import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		dts({
			include: ['src/**/*'],
			exclude: ['src/**/*.test.*'],
		}),
	],
	build: {
		lib: {
			entry: 'src/index.ts',
			name: 'WKInterop',
			fileName: 'index',
			formats: ['es'],
		},
		rollupOptions: {
			external: ['uuid'],
			output: {
				globals: {
					uuid: 'uuid',
				},
			},
		},
	},
});
