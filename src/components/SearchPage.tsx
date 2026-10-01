import * as Sentry from "@sentry/browser";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import type { City, Flight } from "../types";
import { getCities, searchFlights } from "../api";
import { FlightCard } from "./FlightCard";

export function SearchPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchKey = searchParams.toString();

  const originParam = searchParams.get("origin") ?? "";
  const destinationParam = searchParams.get("destination") ?? "";
  const dateParam = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const passengersParam = searchParams.get("passengers") ?? "1";

  useEffect(() => {
    const params = new URLSearchParams(searchKey);
    const origin = params.get("origin");
    const destination = params.get("destination");
    if (!origin || !destination) {
      return;
    }

    // ignore защищает от гонки: если URL сменился, пока летел предыдущий
    // запрос, его ответ не должен затирать новый.
    let ignore = false;

    (async () => {
      try {
        const data = await searchFlights({
          origin,
          destination,
          date: params.get("date") ?? new Date().toISOString().split("T")[0],
          passengers: params.get("passengers") ?? "1",
        });
        if (ignore) return;
        setFlights(data);
      } catch (err) {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Ошибка при поиске рейсов");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [searchKey]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCities();
        setCities(data);

        if (searchParams.get("origin") && searchParams.get("destination")) {
          return;
        }

        if (data.length < 2) {
          setError("Не удалось определить города для поиска");
          setLoading(false);
          return;
        }

        const [from, to] = data;
        // replace: авто-поиск при первом входе не должен засорять историю,
        // иначе «Назад» на главной уводит на предыдущую главную.
        setSearchParams(
          {
            origin: from.code,
            destination: to.code,
            date: new Date().toISOString().split("T")[0],
            passengers: "1",
          },
          { replace: true },
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось загрузить список городов");
        setLoading(false);
      }
    })();

    // Справочник городов — статичные данные, грузим один раз за всё приложение.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const next = {
      origin: String(formData.get("origin")),
      destination: String(formData.get("destination")),
      date: String(formData.get("date")),
      passengers: String(formData.get("passengers")),
    };

    // Очищаем список в том же такте, что и клик. React Router применяет
    // навигацию позже, и если оставить старые рейсы на экране, тест успеет
    // посчитать их вместо результатов нового поиска.
    if (new URLSearchParams(next).toString() !== searchKey) {
      setFlights([]);
      setLoading(true);
    }

    setSearchParams(next);
  };
  const triggerSentryTestError = () => {
    const error = new Error("Sentry test error from flight booking app");
    Sentry.captureException(error);
    throw error;
  };
  return (
    <div className="search-page">
      <button type="button" className="button button--sentry-test" data-testid="sentry-test-error" onClick={triggerSentryTestError}>
        Отправить тестовую ошибку
      </button>
      <form key={`${searchKey}::${cities.length}`} data-testid="flight-search-form" onSubmit={handleSearch} className="search-form">
        <div className="search-form__field">
          <label className="search-form__label">Откуда</label>
          <select name="origin" data-testid="search-origin" defaultValue={originParam} className="search-form__input">
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-form__field">
          <label className="search-form__label">Куда</label>
          <select name="destination" data-testid="search-destination" defaultValue={destinationParam} className="search-form__input">
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="search-form__field">
          <label className="search-form__label">Дата</label>
          <input type="date" name="date" data-testid="search-date" defaultValue={dateParam} className="search-form__input" />
        </div>

        <div className="search-form__field search-form__field--passengers">
          <label className="search-form__label">Пассажиры</label>
          <input type="number" name="passengers" min="1" data-testid="search-passengers" defaultValue={passengersParam} className="search-form__input" />
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
