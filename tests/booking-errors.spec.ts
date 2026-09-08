import { test, expect } from "@playwright/test";
test("должен отображать ошибки валидации от сервера (422)", async ({ page }) => {

  await page.route("**/api/bookings", async (route) => {
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        errors: {
          email: "Серверный сбой: email не прошел проверку",
          phone: "Серверный сбой: неверный формат телефона",
        },
      }),
    });
  });


await page.goto('/booking/fl_1');

  await page.getByTestId("contact-email").fill("test@example.com");
  await page.getByTestId("contact-phone").fill("+79991112233");

  await page.getByTestId("passenger-0-firstName").fill("Ivan");
  await page.getByTestId("passenger-0-lastName").fill("Ivanov");
  await page.getByTestId("passenger-0-dateOfBirth").fill("1990-01-01");
  await page.getByTestId("passenger-0-documentNumber").fill("1234567890");


  await page.locator('button[type="submit"]').click();


  await expect(page.locator("text=Серверный сбой: email не прошел проверку")).toBeVisible();
  await expect(page.locator("text=Серверный сбой: неверный формат телефона")).toBeVisible();
});
