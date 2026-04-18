import { test, expect } from '@playwright/test';
import { login, logout } from './helpers/login';

test.describe('userconf Persistence', () => {

  const INITIAL_VIEW = "list";

  test.beforeEach(async ({ page }) => {
    await page.goto('');
    let view = INITIAL_VIEW;
    await page.route('**/user_confs**', (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postData() || '{}';
        const postView = JSON.parse(postData)?.value?.slotViewFilterConf?.view || "list";
        view = postView;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              "user_id": "99999999-9999-9999-9999-999999999999",
              "conf": "default",
              "value": {
                "slotViewFilterConf": {
                  "view": view,
                  "remove": [],
                  "collapse": [
                    "this_month next_week",
                    "this_month following_week",
                    "next_month"
                  ],
                  "levelMin": null,
                  "slotStrict": true,
                  "levelMaxIncluded": null
                }
              }
            }
          ])
        });
      }
    });
  });

  test('login refresh relogin', async ({ page }) => {
    // Given l'appli s'ouvre, le login est proposé
    await expect(page.getByRole("button", { name: "login" })).toBeVisible();

    // When je me loggue
    await login(page);
    await expect(page.getByRole("combobox", { name: "slot-view-select" })).toBeVisible();

    // Récupère valeur courante
    const currentValueBeforeRefresh = await page.locator('div[role="combobox"][aria-label="slot-view-select"] + input').inputValue();

    // vérifie que c'est bien la valeur issue de la bdd (mockée dans le test)
    expect(currentValueBeforeRefresh).toEqual(INITIAL_VIEW);

    const newValue = currentValueBeforeRefresh === "tree" ? "list" : "tree";
    console.log("current value ", currentValueBeforeRefresh);
    console.log("new value",      newValue);

    // Change slot-view-select
    await page.getByRole("combobox", { name: "slot-view-select" }).click();
    await page.getByRole("option", { name: newValue }).click();

    // need to wait 1 second to let persistence debouncing to be launched
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    // refresh
    console.log("refresh page");
    await page.reload();

    // wait reload
    await expect(page.getByRole("combobox", { name: "slot-view-select" })).toBeVisible();

    // check value after refresh
    const currentValueAfterRefresh = await page.locator('div[role="combobox"][aria-label="slot-view-select"] + input').inputValue();
    console.log("value after refresh", currentValueAfterRefresh);
    expect(currentValueAfterRefresh).toBe(newValue);

    // Logout
    await logout(page);

    // Relogin
    console.log("relogin");
    await login(page);
    await expect(page.getByRole("combobox", { name: "slot-view-select" })).toBeVisible();

    const currentValueAfterRelogin = await page.locator('div[role="combobox"][aria-label="slot-view-select"] + input').inputValue();
    console.log("value after login", currentValueAfterRelogin);

    // Check value after relogin
    expect(currentValueAfterRelogin).toBe(newValue);
  });
});
