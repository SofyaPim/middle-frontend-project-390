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

    const requestBody = {
      flight_id: selectedFlight?.id,
      passengers: passengersList.map(p => ({
        first_name: p.firstName,
        last_name: p.lastName,
        birth_date: p.dateOfBirth,
        document_number: p.documentNumber
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
      <div data-testid="flight-not-found" style={{ color: "red", padding: "20px", textAlign: "center", border: "1px dashed red", borderRadius: "8px", marginTop: "20px" }}>
        Рейс не найден
      </div>
    );
  }

  if (bookingSuccessData) {
    return <BookingSuccess bookingData={bookingSuccessData} flight={selectedFlight} />;
  }
 if (error && !selectedFlight) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;
  if (!selectedFlight) return null;
  return (
    <>
      {/* Заголовок формы */}
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Оформление бронирования</h2>
      
      {/* Карточка рейса с лоадером */}
      {loading ? (
        <div>Загрузка данных...</div>
      ) : (
        <BookingFlight selectedFlight={selectedFlight} />
      )}

      {/* Сама форма */}
      <form onSubmit={handleBookingSubmit} data-testid="booking-form" style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
        <div>
          <h3>Контактные данные</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "bold", fontSize: "14px" }}>
              Email
              <input
                type="email"
                data-testid="contact-email"
                placeholder="ivan@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </label>
            {validationErrors.email && <p style={{ color: "red", margin: 0 }}>{validationErrors.email}</p>}

            <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "bold", fontSize: "14px" }}>
              Телефон
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </label>
            {validationErrors.phone && <p style={{ color: "red", margin: 0 }}>{validationErrors.phone}</p>}
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

          <button type="button" onClick={handleAddPassenger} style={{ marginTop: "10px", padding: "8px 16px" }}>
            Добавить пассажира
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={{ padding: "12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" }}>
          Подтвердить бронирование
        </button>
      </form>
    </>
  );
}
