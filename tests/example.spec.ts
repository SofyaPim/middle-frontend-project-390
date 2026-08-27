import { test, expect } from '@playwright/test';

// Вытягиваем адрес из переменной окружения APP_URL. Без хардкода!
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

test('Главная страница открывается без ошибок в консоли и показывает заголовок', async ({ page }) => {
  // Сюда будем складывать ошибки, если они появятся в консоли браузера
  const consoleErrors: string[] = [];

  // Слушаем критические падения самого JavaScript (uncaught exceptions)
  page.on('pageerror', (exception) => {
    consoleErrors.push(`Критическая ошибка: ${exception.message}`);
  });

  // Слушаем обычные console.error, которые могут сыпаться от неудачных fetch-запросов
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`Ошибка в консоли: ${msg.text()}`);
    }
  });

  // 1. Настоящий чистый браузер открывает приложение по нужному адресу
  await page.goto(APP_URL);

  // 2. Проверяем условие из ТЗ: массив пойманных ошибок должен остаться абсолютно пустым
  expect(consoleErrors).toEqual([]);

  // 3. Ищем заголовок h1 по специальному атрибуту data-testid
  const title = page.getByTestId('page-title');
  
  // 4. Проверяем условия ТЗ: заголовок виден и его текст не пустой
  await expect(title).toBeVisible();
  await expect(title).not.toBeEmpty();
});
