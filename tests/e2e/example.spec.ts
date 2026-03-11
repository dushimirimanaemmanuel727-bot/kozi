import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in login form
    await page.fill('input[name="phone"]', '0750000001');
    await page.fill('input[name="password"]', 'SuperAdmin123!');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await expect(page).toHaveURL('/');
  });

  test('user can signup', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill in signup form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="phone"]', '0750000002');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.selectOption('select[name="role"]', 'worker');
    await page.fill('input[name="district"]', 'Kigali');

    // Click signup button
    await page.click('button[type="submit"]');

    // Wait for success message or redirect
    await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 10000 });
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in invalid credentials
    await page.fill('input[name="phone"]', '0750000000');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Navigation', () => {
  test('main navigation works', async ({ page }) => {
    await page.goto('/');

    // Check main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Find Workers')).toBeVisible();
    await expect(page.locator('text=Post Jobs')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('responsive design works', async ({ page }) => {
    await page.goto('/');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('nav')).toBeVisible();
  });
});
