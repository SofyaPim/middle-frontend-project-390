import { useEffect, useState } from "react";
import type { City, Flight } from "../types";
import { FlightCard } from "./FlightCard";

export function SearchPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Данные формы поиска (по ТЗ: откуда, куда, дата, пассажиры)
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [passengers, setPassengers] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const fetchFlights = (from: string, to: string, departureDate: string, passCount: number) => {
    setLoading(true);
    setError(null);

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

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    fetchFlights(origin, destination, date, passengers);
  };
  return (
    <div className="search-page">
      <form data-testid="flight-search-form" onSubmit={handleSearch} className="search-form">
        <div className="search-form__field">
          <label className="search-form__label">Откуда</label>
          <select data-testid="search-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} className="search-form__input">
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-form__field">
          <label className="search-form__label">Куда</label>
          <select data-testid="search-destination" value={destination} onChange={(e) => setDestination(e.target.value)} className="search-form__input">
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-form__field">
          <label className="search-form__label">Дата</label>
          <input type="date" data-testid="search-date" value={date} onChange={(e) => setDate(e.target.value)} className="search-form__input" />
        </div>

        <div className="search-form__field search-form__field--passengers">
          <label className="search-form__label">Пассажиры</label>
          <input type="number" min="1" data-testid="search-passengers" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="search-form__input" />
        </div>

        <div>
          <button type="submit" data-testid="search-submit" className="button button--search">
            Найти
          </button>
        </div>
      </form>
      {loading && <p>Загрузка рейсов...</p>}

      {error && (
        <div data-testid="booking-error" className="status-message status-message--error search-page__error">
          Произошла ошибка запроса: {error}
        </div>
      )}

      {!loading && !error && flights.length === 0 && (
        <p data-testid="flights-empty" className="search-page__empty">
          рейсов не найдено
        </p>
      )}

      {!loading && !error && flights.length > 0 && (
        <div data-testid="flight-results" className="flight-results">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}
