import { useState, useEffect } from "react";
import type { Flight, Passenger, BookingPageProps, BookingResponse } from "../types";
import { PassengerForm } from "./PassengerForm";
import { BookingSuccess } from "./BookingSuccess";
import { BookingFlight } from "./BookingFlight";
import { validateBookingForm } from "../utils/bookingValidation";



export function BookingPage({ bookingFlightId }: BookingPageProps) {
  // 1. Локальные стейты страницы бронирования
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flightNotFound, setFlightNotFound] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<BookingResponse | null>(null);
  
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [passengersList, setPassengersList] = useState<Passenger[]>([
    { firstName: "", lastName: "", dateOfBirth: "", documentNumber: "" }
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
    passengers?: Record<number, Partial<Record<keyof Passenger, string>>>;
  }>({});

  // 2. Эффект загрузки информации о рейсе по его ID
  useEffect(() => { 

    fetch(`/api/flights/${bookingFlightId}`)
      .then((res) => {
        if (res.status === 404) {
          setFlightNotFound(true);
          throw new Error("Рейс не найден");
        }
        if (!res.ok) throw new Error("Ошибка при загрузке рейса");
        return res.json();
      })
      .then((data) => {
        setSelectedFlight(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookingFlightId]);

  // 3. Управление списком пассажиров (добавление и изменение полей)
  const handleAddPassenger = () => {
    setPassengersList([
      ...passengersList,
      { firstName: "", lastName: "", dateOfBirth: "", documentNumber: "" }
    ]);
  };

  const handlePassengerChange = (index: number, partialPassenger: Partial<Passenger>) => {
    const updated = [...passengersList];
    updated[index] = { ...updated[index], ...partialPassenger };
    setPassengersList(updated);
  };

  // 4. Валидация и отправка бронирования
  const handleBookingSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const { hasErrors, errors } = validateBookingForm({
    contactEmail,
    contactPhone,
    passengersList,
  });

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    if (passengersList.length === 0) {
      setError("Добавьте хотя бы одного пассажира");
      return;
    }

    if (!selectedFlight) {
      setError("Не удалось определить рейс");
      return;
    }

    const requestBody = {
      flightId: selectedFlight.id,
      contact: {
        email: contactEmail,
        phone: contactPhone,
      },
      passengers: passengersList.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        documentNumber: p.documentNumber,
      }))
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 422 && errorData.errors) {
          const serverErrors: typeof validationErrors = {};
          const pErrorsArr: NonNullable<(typeof validationErrors)["passengers"]> = {};

          // Записываем ошибки контактов
          if (errorData.errors.email) serverErrors.email = errorData.errors.email;
          if (errorData.errors.phone) serverErrors.phone = errorData.errors.phone;

          // Записываем ошибки для каждого пассажира
          if (errorData.errors.passengers && Array.isArray(errorData.errors.passengers)) {
            errorData.errors.passengers.forEach((pErr: Partial<Passenger> | null | undefined, index: number) => {
              if (pErr) {
                pErrorsArr[index] = {
                  firstName: pErr.firstName,
                  lastName: pErr.lastName,
                  dateOfBirth: pErr.dateOfBirth,
                  documentNumber: pErr.documentNumber,
                };
              }
            });
            serverErrors.passengers = pErrorsArr;
          }

          setValidationErrors(serverErrors);
          throw new Error("Ошибка валидации на сервере");
        }

        throw new Error(errorData.message || "Не удалось оформить бронирование");
      }

      const result = await response.json();
      setBookingSuccessData(result);
    } catch(err) {
      const errorMessage = err instanceof Error ? err.message : "Произошла неизвестная ошибка";
      console.error(errorMessage);
      setError(errorMessage);
    }
  };

   // 5. Точно такой же переключатель контента, который был в App.tsx
  if (flightNotFound) {
    return (
      <div data-testid="flight-not-found" className="status-message status-message--not-found">
        Рейс не найден
      </div>
    );
  }

  if (bookingSuccessData) {
    return <BookingSuccess bookingData={bookingSuccessData} flight={selectedFlight} />;
  }
 if (error && !selectedFlight) return <p className="status-message status-message--error">{error}</p>;
  if (!selectedFlight) return null;
  return (
    <>
      {/* Заголовок формы */}
      <h2 className="booking-page__title">Оформление бронирования</h2>
      
      {/* Карточка рейса с лоадером */}
      {loading ? (
        <div>Загрузка данных...</div>
      ) : (
        <BookingFlight selectedFlight={selectedFlight} />
      )}

      {/* Сама форма */}
      <form onSubmit={handleBookingSubmit} data-testid="booking-form" className="booking-form">
        <div>
          <h3>Контактные данные</h3>
          <div className="booking-form__contact-fields">
            <label className="form-field">
              Email
              <input
                type="email"
                data-testid="contact-email"
                placeholder="ivan@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="form-field__input"
              />
            </label>
            {validationErrors.email && <p className="field-error">{validationErrors.email}</p>}

            <label className="form-field">
              Телефон
              <input
                type="tel"
                data-testid="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="form-field__input"
              />
            </label>
            {validationErrors.phone && <p className="field-error">{validationErrors.phone}</p>}
          </div>
        </div>

        <div>
          <h3>Пассажиры</h3>
          {passengersList.map((passenger, index) => (
            <PassengerForm
              key={index}
              index={index}
              passenger={passenger}
              onChange={handlePassengerChange}
              errors={validationErrors.passengers?.[index] || {}}
            />
          ))}

          <button type="button" data-testid="add-passenger" onClick={handleAddPassenger} className="button button--secondary">
            Добавить пассажира
          </button>
        </div>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" data-testid="booking-submit" className="button button--primary">
          Подтвердить бронирование
        </button>
      </form>
    </>
  );
}
