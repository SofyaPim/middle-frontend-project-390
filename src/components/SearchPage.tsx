import * as Sentry from "@sentry/browser";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import type { City, Flight } from "../types";
import { FlightCard } from "./FlightCard";

export function SearchPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchState, setSearchState] = useState<{
    key: string;
    flights: Flight[];
    error: string | null;
  } | null>(null);

  // Показываем результат только если он относится к текущему поиску в URL.
  // Иначе во время нового запроса мигали бы рейсы предыдущего.
  const searchKey = searchParams.toString();
  const isCurrentSearch = searchState?.key === searchKey;
  const flights = isCurrentSearch && searchState ? searchState.flights : [];
  const error = isCurrentSearch && searchState ? searchState.error : null;
  const loading = !isCurrentSearch;

  // Значения полей читаются из URL, а не живут в состоянии.
  const originParam = searchParams.get("origin") ?? "";
  const destinationParam = searchParams.get("destination") ?? "";
  const dateParam = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const passengersParam = searchParams.get("passengers") ?? "1";

   useEffect(() => {
    // Разбираем searchKey вместо чтения внешних переменных:
    // так эффект зависит ровно от одной величины — от адреса.
    const params = new URLSearchParams(searchKey);
    const origin = params.get("origin");
    const destination = params.get("destination");
    if (!origin || !destination) {
      return;
    }
    // ignore защищает от гонки: если URL сменился, пока летел предыдущий
    // запрос, его ответ не должен затирать новый.
    let ignore = false;

    const query = new URLSearchParams({
      origin,
      destination,
      date: params.get("date") ?? new Date().toISOString().split("T")[0],
      passengers: params.get("passengers") ?? "1",
    });

    fetch(`/api/flights?${query.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка при поиске рейсов");
        return res.json();
      })
      .then((data: Flight[]) => {
        if (ignore) return;
        setSearchState({ key: searchKey, flights: data, error: null });
      })
      .catch((err) => {
        if (ignore) return;
        setSearchState({ key: searchKey, flights: [], error: err.message });
      });

    return () => {
      ignore = true;
    };
  }, [searchKey]);
  // Справочник городов грузится один раз за всё приложение.
  useEffect(() => {
    fetch("/api/cities")
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить список городов");
        return res.json();
      })
      .then((data: City[]) => {
        setCities(data);
        if (searchParams.get("origin") && searchParams.get("destination")) {
          return;
        }

        if (data.length >= 2) {
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
        } else {
          setSearchState({ key: searchParams.toString(), flights: [], error: null });
        }
      })
      .catch((err) => {
        console.error("Ошибка запроса к моку:", err);
        setSearchState({ key: searchParams.toString(), flights: [], error: err.message });
      });
    // Справочник городов — статичные данные, грузим один раз за всё приложение.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Значения читаем прямо из формы — состояния с полями больше нет.
    const formData = new FormData(e.currentTarget);
    setSearchParams({
      origin: String(formData.get("origin")),
      destination: String(formData.get("destination")),
      date: String(formData.get("date")),
      passengers: String(formData.get("passengers")),
    });
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
<form
        key={`${searchKey}::${cities.length}`}
        data-testid="flight-search-form"
        onSubmit={handleSearch}
        className="search-form"
      >
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
