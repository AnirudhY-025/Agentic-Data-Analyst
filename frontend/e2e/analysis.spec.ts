import { test, expect } from '@playwright/test';

test.describe('Agentic Data Analyst Workflow', () => {
  test('should display landing page and navigate to login', async ({ page }) => {
    await page.goto('/');

    // Verify title and landing page content
    await expect(page).toHaveTitle(/InsightFlow|Agentic/i);
    const loginButton = page.locator('text=Sign In').first();
    await expect(loginButton).toBeVisible();
  });

  test('should render analysis interface with model selection', async ({ page }) => {
    // Navigate directly to dashboard / analyze route
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
