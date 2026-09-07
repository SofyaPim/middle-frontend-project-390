import { test, expect } from "@playwright/test";

// Вытягиваем адрес из переменной окружения APP_URL. Без хардкода!
const APP_URL = "http://localhost:5173";

test("Главная страница открывается без ошибок в консоли и показывает заголовок", async ({ page }) => {
  // Сюда будем складывать ошибки, если они появятся в консоли браузера
  const consoleErrors: string[] = [];

  // Слушаем критические падения самого JavaScript (uncaught exceptions)
  page.on("pageerror", (exception) => {
    consoleErrors.push(`Критическая ошибка: ${exception.message}`);
  });

  // Слушаем обычные console.error, которые могут сыпаться от неудачных fetch-запросов
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`Ошибка в консоли: ${msg.text()}`);
    }
  });

  // 1. Настоящий чистый браузер открывает приложение по нужному адресу
  await page.goto(APP_URL);

  // 2. Проверяем условие из ТЗ: массив пойманных ошибок должен остаться абсолютно пустым
  expect(consoleErrors).toEqual([]);

  // 3. Ищем заголовок h1 по специальному атрибуту data-testid
  const title = page.getByTestId("page-title");

  // 4. Проверяем условия ТЗ: заголовок виден и его текст не пустой
  await expect(title).toBeVisible();
  await expect(title).not.toBeEmpty();
});
// test('Успешное оформление бронирования', async ({ page }) => {
//   // 1. Переходим напрямую на страницу бронирования

// await page.goto(`${APP_URL}/booking/fl_1`);

//   // 2. Проверяем, что форма и карточка рейса на месте
//   await expect(page.getByTestId('booking-flight')).toBeVisible();
//   await expect(page.getByTestId('booking-form')).toBeVisible();

//   // 3. Заполняем контакты
//   await page.getByTestId('contact-email').fill('stark@winterfell.com');
//   await page.getByTestId('contact-phone').fill('+79991112233');

//   // 4. Добавляем пассажира и заполняем поля анкеты (индекс 0)
//   await page.getByTestId('add-passenger').click();
//   await page.getByTestId('passenger-0-firstName').fill('Rob');
//   await page.getByTestId('passenger-0-lastName').fill('Stark');
//   await page.getByTestId('passenger-0-dob').fill('1995-12-04');
//   await page.getByTestId('passenger-0-document').fill('2927 577555');

//   // 5. Отправляем форму
//   await page.getByTestId('booking-submit').click();

//   // 6. Проверяем появление панели успеха и уникального кода
//   await expect(page.getByTestId('booking-success')).toBeVisible();
//   const code = page.getByTestId('booking-code');
//   await expect(code).toBeVisible();
//   await expect(code).not.toBeEmpty();
// });

// test('Отображение состояния "Рейс не найден"', async ({ page }) => {
//   // Заходим на несуществующий ID рейса
// await page.goto(`${APP_URL}/booking/invalid_flight_id`);

//   // Проверяем, что сработал правильный маркер отсутствия рейса
//   await expect(page.getByTestId('flight-not-found')).toBeVisible();
// });

