import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for accessibility and responsive design testing
 * Tests all pages at mobile, tablet, and desktop breakpoints
 * Includes keyboard navigation and accessibility tests
 */
export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.(spec|test)\.(js|ts|mjs)/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'mobile-small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'mobile-medium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 }
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'tablet-landscape',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 }
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'desktop-large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
