import { useEffect, useState } from "react";
import type { City, Flight, Passenger, BookingResponse, Booking } from "./types";

import { Header } from "./components/Header";
import { PassengerForm } from "./components/PassengerForm";
import { BookingSuccess } from "./components/BookingSuccess";
import { MyBookings } from "./components/MyBookings";
import { FlightCard } from "./components/FlightCard";
import { BookingFlight } from "./components/BookingFlight";
import { SearchPage } from "./components/SearchPage";

import { validateBookingForm } from "./utils/bookingValidation";

function App() {
  const currentPath = window.location.pathname;
  const isBookingPage = currentPath.startsWith("/booking/");
  const isMyBookingsPage = currentPath === "/my-bookings";
  const bookingFlightId = isBookingPage ? currentPath.replace("/booking/", "") : null;

  // Данные из API
  const [cities, setCities] = useState<City[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Данные формы поиска (по ТЗ: откуда, куда, дата, пассажиры)
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [passengers, setPassengers] = useState<number>(1);

  const [loading, setLoading] = useState(true);

  // Переменные для экрана оформления бронирования (Шаг 4)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [flightNotFound, setFlightNotFound] = useState<boolean>(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<BookingResponse | null>(null);

  // Контакты формы бронирования
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");

  const [myBookings, setMyBookings] = useState<
    (BookingResponse & {
      flightId?: string | null;
      contact?: { email: string; phone: string };
      passengers?: Passenger[];
    })[]
  >([]);

  // Список пассажиров (по умолчанию стартуем с одного пустого пассажира)
  const [passengersList, setPassengersList] = useState<Passenger[]>([{ firstName: "", lastName: "", dateOfBirth: "", documentNumber: "" }]);
  // Автоматический сброс состояний при смене страницы (без использования useEffect, как просит линтер)
  const [lastPath, setLastPath] = useState(currentPath);
  if (currentPath !== lastPath) {
    setLastPath(currentPath);
    setError(null);
    setFlightNotFound(false);
    setBookingSuccessData(null);
  }
  // Стейт для хранения ошибок валидации формы
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
    passengers?: Record<number, Partial<Record<keyof Passenger, string>>>;
  }>({});

  // Функция для запроса рейсов у API
  const fetchFlights = (from: string, to: string, departureDate: string, passCount: number) => {
    setLoading(true);
    setError(null);

    // Собираем параметры в строку: ?origin=MOW&destination=LED...
    const queryParams = new URLSearchParams({
      origin: from,
      destination: to,
      date: departureDate,
      passengers: passCount.toString(),
    });

    fetch(`/api/flights?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка при поиске рейсов");
        return res.json();
      })
      .then((data: Flight[]) => {
        setFlights(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить список городов");
        return res.json();
      })
      .then((data: City[]) => {
        setCities(data);

        if (data.length >= 2) {
          const firstCityId = data[0].code;
          const secondCityId = data[1].code;

          setOrigin(firstCityId);
          setDestination(secondCityId);

          //  Сразу автоматически ищем рейсы между ними, не требуя клика от пользователя
          fetchFlights(firstCityId, secondCityId, date, passengers);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Ошибка запроса к моку:", err);
        setError(err.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Загрузка данных конкретного рейса при прямом переходе на страницу бронирования
  useEffect(() => {
    // Если мы не на странице бронирования или ID нет, ничего не делаем
    if (!isBookingPage || !bookingFlightId) {
      return;
    }

    fetch(`/api/flights/${bookingFlightId}`)
      .then((res) => {
        if (res.status === 404) {
          setFlightNotFound(true);
          throw new Error("Рейс не найден");
        }
        if (!res.ok) {
          if (res.status === 404) {
            setFlightNotFound(true);
          }
          throw new Error("Ошибка загрузки рейса");
        }
        return res.json();
      })
      .then((data: Flight) => {
        setSelectedFlight(data); // Сохраняем информацию о выбранном рейсе
        setLoading(false);
      })
      .catch((err) => {
        console.error(err.message);
        setError(err.message);
        setLoading(false);
      });
  }, [isBookingPage, bookingFlightId]);

  useEffect(() => {
    if (currentPath !== "/my-bookings") return;

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) throw new Error("Не удалось загрузить список бронирований");

        const data: Booking[] = await res.json();
        setMyBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Произошла неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentPath]);

  // 1. Функция для добавления нового пассажира в форму
  const handleAddPassenger = () => {
    setPassengersList([...passengersList, { firstName: "", lastName: "", dateOfBirth: "", documentNumber: "" }]);
  };
  const handlePassengerChange = (index: number, field: Partial<Passenger>) => {
    setPassengersList((prevList) => prevList.map((passenger, i) => (i === index ? { ...passenger, ...field } : passenger)));
  };
  // 2. Функция отправки формы бронирования на сервер
  const handleBookingSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
  setValidationErrors({});

  // Передаем данные одним объектом 
  const { hasErrors, errors } = validateBookingForm({
    contactEmail,
    contactPhone,
    passengersList,
  });

  // Блокировка отправки формы
  if (hasErrors) {
    setValidationErrors(errors);
    return;
  }


    setError(null);

    if (passengersList.length === 0) {
      setError("Добавьте хотя бы одного пассажира");
      return;
    }

    const requestBody = {
      flightId: bookingFlightId,
      contact: {
        email: contactEmail,
        phone: contactPhone,
      },
      passengers: passengersList,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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

      const data = await response.json();
      setBookingSuccessData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Произошла неизвестная ошибка";
      console.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    fetchFlights(origin, destination, date, passengers);
  };

  if (isBookingPage) {
    return (
      <div data-testid="page-title" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <Header onNavigate={(path) => setLastPath(path)} />

        {/* Переключатель контента */}
        {flightNotFound ? (
          <div data-testid="flight-not-found" style={{ color: "red", padding: "20px", textAlign: "center", border: "1px dashed red", borderRadius: "8px", marginTop: "20px" }}>
            Рейс не найден
          </div>
        ) : bookingSuccessData ? (
          <BookingSuccess bookingData={bookingSuccessData} flight={selectedFlight} />
        ) : (
          <form onSubmit={handleBookingSubmit} data-testid="booking-form">
            {/* Перенесли подзаголовок формы сюда, чтобы он исчезал при успехе */}
            <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Оформление бронирования</h2>

            {/* карточка рейса */}
            {selectedFlight ? <BookingFlight selectedFlight={selectedFlight} /> : <div> Загрузка данных...</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "bold", fontSize: "14px" }}>
                Email
                <input type="email" data-testid="contact-email" placeholder="ivan@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: `1px solid ${validationErrors.email ? "red" : "#ccc"}`, fontSize: "15px" }} />
                {validationErrors.email && <span style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{validationErrors.email}</span>}
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "bold", fontSize: "14px" }}>
                Телефон
                <input type="tel" data-testid="contact-phone" placeholder="+7 999 000-11-22" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: `1px solid ${validationErrors.phone ? "red" : "#ccc"}`, fontSize: "15px" }} />
                {validationErrors.phone && <span style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{validationErrors.phone}</span>}
              </label>
            </div>

            {/* Визуальный разделитель «Пассажиры» */}
            <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "#888", fontSize: "12px" }}>
              <span style={{ paddingRight: "10px", whiteSpace: "nowrap" }}>Пассажиры</span>
              <hr style={{ width: "100%", border: "0", borderTop: "1px solid #eee" }} />
            </div>

            {passengersList.map((passenger, index) => (
              <PassengerForm key={index} passenger={passenger} index={index} onChange={handlePassengerChange} errors={validationErrors.passengers?.[index]} />
            ))}
            <button type="button" data-testid="add-passenger" onClick={handleAddPassenger} style={{ padding: "8px 16px", backgroundColor: "#0d6efd", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Добавить пассажира
            </button>
            <button type="submit" data-testid="booking-submit" style={{ padding: "8px 16px", backgroundColor: "#0d6efd", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Забронировать
            </button>
          </form>
        )}
      </div>
    );
  }
  if (isMyBookingsPage) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <Header onNavigate={(path) => setLastPath(path)} />
        <MyBookings loading={loading} error={error} bookings={myBookings} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <Header onNavigate={(path) => setLastPath(path)} />
      <SearchPage cities={cities} origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination} date={date} setDate={setDate} passengers={passengers} setPassengers={setPassengers} handleSearch={handleSearch} />

      {loading && <p>Загрузка рейсов...</p>}

      {error && (
        <div data-testid="booking-error" style={{ color: "red", padding: "10px", border: "1px solid red", marginBottom: "20px", borderRadius: "4px" }}>
          Произошла ошибка запроса: {error}
        </div>
      )}

      {!loading && !error && flights.length === 0 && (
        <p data-testid="flights-empty" style={{ fontStyle: "italic", color: "#666", marginTop: "20px" }}>
          рейсов не найдено
        </p>
      )}

      {!loading && !error && flights.length > 0 && (
        <div data-testid="flight-results" style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
