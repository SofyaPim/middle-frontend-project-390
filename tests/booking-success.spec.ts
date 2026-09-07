import { test, expect } from '@playwright/test';

test('Успешное оформление бронирования рейса', async ({ page }) => {
  // Мокаем получение данных рейса
 await page.route('**/api/bookings', async (route) => {
  await route.fulfill({
    status: 200, // или 200
    contentType: 'application/json',
    body: JSON.stringify({ code: 'XYZ123' }) // плоский объект, как мы выяснили по типам
  });
});

  // Открываем страницу
  await page.goto('http://localhost:5173/booking/1');

  // Убеждаемся, что форма и рейс на месте
  await expect(page.getByTestId('booking-flight')).toBeVisible();
  await expect(page.getByTestId('booking-form')).toBeVisible();

  // Добавляем второго пассажира (нажимаем на кнопку по вашему data-testid)
  await page.getByTestId('add-passenger').click();

  // Заполняем контакты
  await page.getByTestId('contact-email').fill('test@example.com');
  await page.getByTestId('contact-phone').fill('+79991112233');

  // Заполняем первого пассажира (индекс 0)
  await page.getByTestId('passenger-0-firstName').fill('Ivan');
  await page.getByTestId('passenger-0-lastName').fill('Ivanov');
    await page.getByTestId("passenger-0-dateOfBirth").fill("1990-01-01");
  await page.getByTestId("passenger-0-documentNumber").fill("1234567890");

  // Заполняем только что добавленного второго пассажира (индекс 1)
  await page.getByTestId('passenger-1-firstName').fill('Petr');
  await page.getByTestId('passenger-1-lastName').fill('Petrov');
  await page.getByTestId("passenger-1-dateOfBirth").fill("1990-01-01");
  await page.getByTestId("passenger-1-documentNumber").fill("1234567890");

  // Отправляем форму
  await page.getByTestId('booking-submit').click();

  // Проверяем появление панели успеха и совпадение уникального кода по ТЗ
  await expect(page.getByTestId('booking-success')).toBeVisible();
  await expect(page.getByTestId('booking-code')).toHaveText('XYZ123');
});
