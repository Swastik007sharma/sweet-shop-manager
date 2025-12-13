import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	test: {
		globals: true,
		environment: "jsdom", // Use jsdom to simulate a browser environment
		setupFiles: "./src/setupTests.js", // File to set up custom matchers
		css: false, // Don't process CSS during tests
	},

	// Optional: Add proxy config for API calls to your backend
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:5000", // Your Express server port
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
