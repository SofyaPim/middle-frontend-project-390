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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <form data-testid="flight-search-form" onSubmit={handleSearch} style={{ display: "flex", gap: "15px", alignItems: "flex-end", backgroundColor: "#fff", padding: "15px 0", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>Откуда</label>
          <select data-testid="search-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ced4da" }}>
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>Куда</label>
          <select data-testid="search-destination" value={destination} onChange={(e) => setDestination(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ced4da" }}>
            {cities.map((city) => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>Дата</label>
          <input type="date" data-testid="search-date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ced4da" }} />
        </div>

        <div style={{ width: "120px" }}>
          <label style={{ display: "block", fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>Пассажиры</label>
          <input type="number" min="1" data-testid="search-passengers" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} style={{ width: "100%", padding: "9px", borderRadius: "6px", border: "1px solid #ced4da" }} />
        </div>

        <div>
          <button type="submit" data-testid="search-submit" style={{ padding: "11px 24px", backgroundColor: "#1d8bf1", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            Найти
          </button>
        </div>
      </form>
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
