import type { Passenger, ValidateParams } from "../types";

export function validateBookingForm({ contactEmail, contactPhone, passengersList }: ValidateParams) {
  let hasErrors = false;
  
  // Просто объект, TS сам поймет его структуру
 const errors: {
    email?: string;
    phone?: string;
    passengers?: Record<number, Partial<Record<keyof Passenger, string>>>;
  } = {};
    const pErrorsArr: Record<number, Partial<Record<keyof Passenger, string>>> = {};

  // Валидация контактов
  if (!contactEmail.trim()) {
    errors.email = "Email обязателен";
    hasErrors = true;
  } else if (!/\S+@\S+\.\S+/.test(contactEmail)) {
    errors.email = "Некорректный формат email";
    hasErrors = true;
  }

  if (!contactPhone.trim()) {
    errors.phone = "Телефон обязателен";
    hasErrors = true;
  }

  // Валидация списка пассажиров
  passengersList.forEach((passenger, index) => {
     const pError: Partial<Record<keyof Passenger, string>> = {};

    if (!passenger.firstName?.trim()) pError.firstName = "Имя обязательно";
    if (!passenger.lastName?.trim()) pError.lastName = "Фамилия обязательна";
    if (!passenger.dateOfBirth?.trim()) pError.dateOfBirth = "Дата рождения обязательна";
    if (!passenger.documentNumber?.trim()) pError.documentNumber = "Документ обязателен";

    if (Object.keys(pError).length > 0) {
      pErrorsArr[index] = pError;
      hasErrors = true;
    }
  });

  if (Object.keys(pErrorsArr).length > 0) {
    errors.passengers = pErrorsArr;
  }

  return { hasErrors, errors };
}