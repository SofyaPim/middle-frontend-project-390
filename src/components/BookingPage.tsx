import { useParams } from "react-router";
import { useState, useEffect } from "react";
import type { Flight, Passenger, BookingResponse } from "../types";
import { PassengerForm } from "./PassengerForm";
import { BookingSuccess } from "./BookingSuccess";
import { BookingFlight } from "./BookingFlight";
import { validateBookingForm } from "../utils/bookingValidation";
import { ApiError, createBooking, getFlight } from "../api";

export function BookingPage() {
  const { flightId } = useParams();
  const flightIdToLoad = flightId ?? "";
  // 1. Локальные стейты страницы бронирования
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flightNotFound, setFlightNotFound] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<BookingResponse | null>(null);

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [passengersList, setPassengersList] = useState<Passenger[]>([{ firstName: "", lastName: "", dateOfBirth: "", documentNumber: "" }]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
    passengers?: Record<number, Partial<Record<keyof Passenger, string>>>;
  }>({});

  // 2. Эффект загрузки информации о рейсе по его ID
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const flight = await getFlight(flightIdToLoad);
        if (ignore) return;
        setSelectedFlight(flight);
      } catch (err) {
        if (ignore) return;
        if (err instanceof ApiError && err.status === 404) {
          setFlightNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Ошибка при загрузке рейса");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [flightIdToLoad]);

  // 3. Управление списком пассажиров (добавление и изменение полей)
  const handleAddPassenger = () => {
    setPassengersList([...passengersList, { firstName: "", lastName: "", dateOfBirth: "", documentNumber: "" }]);
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

   const { hasErrors, errors } = await validateBookingForm({
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
      passengers: passengersList.map((p) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        documentNumber: p.documentNumber,
      })),
    };

    try {
      setBookingSuccessData(await createBooking(requestBody));
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.body?.errors) {
        const serverErrors: typeof validationErrors = {};
        const pErrorsArr: NonNullable<(typeof validationErrors)["passengers"]> = {};

        if (err.body.errors.email) serverErrors.email = err.body.errors.email;
        if (err.body.errors.phone) serverErrors.phone = err.body.errors.phone;

        err.body.errors.passengers?.forEach((pErr, index) => {
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

        setValidationErrors(serverErrors);
        setError("Ошибка валидации на сервере");
        return;
      }

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
      {loading ? <div>Загрузка данных...</div> : <BookingFlight selectedFlight={selectedFlight} />}

      {/* Сама форма */}
      <form onSubmit={handleBookingSubmit} data-testid="booking-form" className="booking-form">
        <div>
          <h3>Контактные данные</h3>
          <div className="booking-form__contact-fields">
            <label className="form-field">
              Email
              <input type="email" data-testid="contact-email" placeholder="ivan@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="form-field__input" />
            </label>
            {validationErrors.email && <p className="field-error">{validationErrors.email}</p>}

            <label className="form-field">
              Телефон
              <input type="tel" data-testid="contact-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="form-field__input" />
            </label>
            {validationErrors.phone && <p className="field-error">{validationErrors.phone}</p>}
          </div>
        </div>

        <div>
          <h3>Пассажиры</h3>
          {passengersList.map((passenger, index) => (
            <PassengerForm key={index} index={index} passenger={passenger} onChange={handlePassengerChange} errors={validationErrors.passengers?.[index] || {}} />
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
