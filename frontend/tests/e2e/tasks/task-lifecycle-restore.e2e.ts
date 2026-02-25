import { expect, test } from '@playwright/test';

test.describe('Task lifecycle and restore flow', () => {
  test('creates, completes, deletes, and restores a team task', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /team task manager/i })).toBeVisible();

    await page.getByRole('button', { name: /new task/i }).click();
    await page.getByLabel(/title/i).fill('MVP lifecycle task');
    await page.getByLabel(/description/i).fill('Task created in e2e lifecycle test');
    await page.getByRole('button', { name: /create task/i }).click();

    await expect(page.getByText('MVP lifecycle task')).toBeVisible();

    await page.getByRole('button', { name: /mark complete/i }).click();
    await expect(page.getByText(/completed/i)).toBeVisible();

    await page.getByRole('button', { name: /delete task/i }).click();
    await expect(page.getByText('MVP lifecycle task')).not.toBeVisible();

    await page.getByRole('tab', { name: /recently deleted/i }).click();
    await expect(page.getByText('MVP lifecycle task')).toBeVisible();

    await page.getByRole('button', { name: /restore task/i }).click();
    await page.getByRole('tab', { name: /active tasks/i }).click();

    await expect(page.getByText('MVP lifecycle task')).toBeVisible();
  });
});
