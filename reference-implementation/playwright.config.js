import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // No retries - fail fast
  retries: 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: 'html',
  
  use: {
    // Run browser in headless mode (hidden)
    headless: true,
    
    // Base URL to use in actions like `await page.goto('/')`
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: true, // Run browser in headless mode (hidden)
        // Critical: Allow file:// protocol access
        launchOptions: {
          args: [
            '--allow-file-access-from-files',
            '--disable-web-security'
          ]
        }
      },
    },
  ],

  // Timeout settings
  timeout: 15000, // 15 seconds per test
  expect: {
    timeout: 5000, // 5 seconds for expect assertions
  },
});

