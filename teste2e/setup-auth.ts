import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_EMAIL ?? 'e2e@gorsini.fr';
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e';

test('login and storageState', async ({ page }) => {
    await page.goto('');
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible();

    await page.getByRole('textbox', { name: 'email' }).fill(TEST_EMAIL);
    await page.getByRole('textbox', { name: 'password' }).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'login' })).not.toBeVisible();

    await page.context().storageState({ path: 'teste2e/.auth/user.json' });
    console.log('Storage state saved to teste2e/.auth/user.json');
});