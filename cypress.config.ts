import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "57u3wc",
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    setupNodeEvents(on, config) {
      // Node event listeners can be configured here
    },
  },
});
