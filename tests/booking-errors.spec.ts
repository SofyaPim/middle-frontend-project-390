import { test, expect } from "@playwright/test";
test("должен отображать ошибки валидации от сервера (422)", async ({ page }) => {
  // 1. Перехватываем POST запрос к API бронирования
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

  // 2. Открываем страницу бронирования рейса
  await page.goto("http://localhost:5173/booking/1"); // подставьте реальный ID для теста

  // 3. Заполняем поля, чтобы пройти клиентскую валидацию
  await page.getByTestId("contact-email").fill("test@example.com");
  await page.getByTestId("contact-phone").fill("+79991112233");

  // Заполняем поля пассажира (укажите селекторы вашего компонента PassengerForm)
  await page.getByTestId("passenger-0-firstName").fill("Ivan");
  await page.getByTestId("passenger-0-lastName").fill("Ivanov");
  await page.getByTestId("passenger-0-dateOfBirth").fill("1990-01-01");
  await page.getByTestId("passenger-0-documentNumber").fill("1234567890");

  // 4. Кликаем на кнопку отправки
  await page.locator('button[type="submit"]').click();

  // 5. Проверяем, что на экране появились сообщения об ошибках от сервера
  await expect(page.locator("text=Серверный сбой: email не прошел проверку")).toBeVisible();
  await expect(page.locator("text=Серверный сбой: неверный формат телефона")).toBeVisible();
});
