import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Assuming your app runs on this port
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
