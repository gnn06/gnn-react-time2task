import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: './teste2e/global-setup.ts',
  testDir: './teste2e',
  testMatch: ['**/*.pw.test.{ts,tsx}'],

  /* Les tests partagent un utilisateur Supabase unique : exécution séquentielle obligatoire
   * pour éviter les interférences entre tests (lectures/écritures concurrentes en base). */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', {open: 'never'}]],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:4173/gnn-react-time2task',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: ['**/setup-auth.ts'],
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: ['**/*-noauth-*'],
      use: { ...devices['Desktop Chrome'], storageState: 'teste2e/.auth/user.json' },
    },
    {
      /* Tests sans session pré-injectée : authentification et persistence userconf */
      name: 'chromium-unauth',
      testMatch: ['**/*-noauth-*'],
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* FIX un problème de performance dans les tests playwright suite à l'upgrade react 19 
   * Build de prod + vite preview — beaucoup plus rapide que le dev server en React 19.
   * Après une modification du code source, tuer le serveur preview et relancer les tests
   * pour déclencher un rebuild (ou lancer manuellement `npm run build`). */
  webServer: {
    command: 'npm run build:e2e && npm run serve',
    url: 'http://localhost:4173/gnn-react-time2task',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
