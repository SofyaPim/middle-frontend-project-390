import { expect, test } from "@playwright/test";

const booking = {
  code: "AB1234",
  status: "confirmed",
  flight: {
    id: "fl_1",
    flightNumber: "SU1234",
    airline: { code: "SU", name: "Аэрофлот" },
    origin: { code: "MOW", name: "Москва" },
    destination: { code: "LED", name: "Санкт-Петербург" },
    departureAt: "2026-07-01T08:00:00Z",
    arrivalAt: "2026-07-01T09:25:00Z",
    durationMinutes: 85,
    price: { amount: 5400, currency: "RUB" },
    seatsAvailable: 42,
  },
  passengers: [
    {
      firstName: "Иван",
      lastName: "Петров",
      dateOfBirth: "1990-05-20",
      documentNumber: "4509 123456",
    },
  ],
  contact: { email: "ivan@example.com", phone: "+79991234567" },
  totalPrice: { amount: 5400, currency: "RUB" },
  createdAt: "2026-06-25T12:00:00Z",
};

test("Ссылка открывает экран Мои брони", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("nav-lookup").click();

  await expect(page).toHaveURL(/\/lookup$/);
  await expect(page.getByTestId("booking-lookup-form")).toBeVisible();
});

test("Поиск и отмена брони обновляют карточку и статус", async ({ page }) => {
  await page.route("**/api/bookings/AB1234**", async (route) => {
    if (route.request().method() === "POST") {
      expect(route.request().postDataJSON()).toEqual({ lastName: "Петров" });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...booking, status: "cancelled" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(booking),
    });
  });

  await page.goto("/lookup");
  await page.getByTestId("lookup-code").fill("AB1234");
  await page.getByTestId("lookup-lastName").fill("Петров");
  await page.getByTestId("lookup-submit").click();

  await expect(page.getByTestId("booking-details")).toBeVisible();
  await expect(page.getByTestId("booking-code")).toHaveText("AB1234");
  await expect(page.getByTestId("booking-status")).toHaveAttribute("data-status", "confirmed");

  await page.getByTestId("cancel-booking").click();

  await expect(page.getByTestId("booking-status")).toHaveAttribute("data-status", "cancelled");
  await expect(page.getByTestId("booking-status")).toHaveText("Отменена");
  await expect(page.getByTestId("cancel-booking")).not.toBeVisible();
});

test("Неверные данные показывают ошибку ненайденной брони", async ({ page }) => {
  await page.route("**/api/bookings/UNKNOWN**", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: "Бронь не найдена" }),
    });
  });

  await page.goto("/lookup");
  await page.getByTestId("lookup-code").fill("UNKNOWN");
  await page.getByTestId("lookup-lastName").fill("Петров");
  await page.getByTestId("lookup-submit").click();

  await expect(page.getByTestId("booking-not-found")).toHaveText(
    "Бронь не найдена. Проверьте код и фамилию.",
  );
});
