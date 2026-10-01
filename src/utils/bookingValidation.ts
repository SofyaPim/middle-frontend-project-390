import * as yup from "yup";
import type { Passenger, ValidateParams } from "../types";

type BookingErrors = {
  email?: string;
  phone?: string;
  passengers?: Record<number, Partial<Record<keyof Passenger, string>>>;
};

const passengerSchema = yup.object({
  firstName: yup.string().trim().required("Имя обязательно"),
  lastName: yup.string().trim().required("Фамилия обязательна"),
  dateOfBirth: yup.string().trim().required("Дата рождения обязательна"),
  documentNumber: yup.string().trim().required("Документ обязателен"),
});

const bookingSchema = yup.object({
  contactEmail: yup
    .string()
    .trim()
    .required("Email обязателен")
    .email("Некорректный формат email"),
  contactPhone: yup.string().trim().required("Телефон обязателен"),
  passengersList: yup.array().of(passengerSchema),
});

export async function validateBookingForm({ contactEmail, contactPhone, passengersList }: ValidateParams) {
  const errors: BookingErrors = {};

  try {
    await bookingSchema.validate(
      { contactEmail, contactPhone, passengersList },
      { abortEarly: false },
    );
  } catch (err) {
    if (!(err instanceof yup.ValidationError)) throw err;

    err.inner.forEach((e) => {
      // Путь к полю пассажира выглядит как passengersList[0].firstName
      const passengerMatch = e.path?.match(/^passengersList\[(\d+)\]\.(.+)$/);

      if (passengerMatch) {
        const index = Number(passengerMatch[1]);
        const field = passengerMatch[2] as keyof Passenger;
        const previous = errors.passengers?.[index] ?? {};
        errors.passengers = { ...errors.passengers, [index]: { ...previous, [field]: e.message } };
        return;
      }

      if (e.path === "contactEmail") errors.email = e.message;
      if (e.path === "contactPhone") errors.phone = e.message;
    });
  }

  return { hasErrors: Object.keys(errors).length > 0, errors };
}