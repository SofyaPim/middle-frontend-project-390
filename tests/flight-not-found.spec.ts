import { test, expect } from '@playwright/test';

test('Отображение состояния Рейс не найден', async ({ page }) => {
  // Имитируем ответ 404 от сервера при попытке загрузить несуществующий рейс с ID 999
  // Подстройте маску пути под ваш реальный GET-запрос загрузки рейса (например, **/api/flights/999)
  await page.route(url => url.pathname.includes('flights/999') || url.pathname.includes('flight/999'), async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Рейс не найден' })
    });
  });

  // Переходим по адресу несуществующего рейса
  await page.goto('http://localhost:5173/booking/999');

  // Проверяем, что форма бронирования НЕ отображается
  await expect(page.getByTestId('booking-form')).not.toBeVisible();

  // Проверяем, что отображается блок «Рейс не найден» строго по вашему списку data-testid
  await expect(page.getByTestId('flight-not-found')).toBeVisible();
});
