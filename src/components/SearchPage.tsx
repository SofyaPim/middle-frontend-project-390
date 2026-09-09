import type { SearchPageProps } from "../types";

export function SearchPage({
  cities,
  
  origin,
  setOrigin,
  destination,
  setDestination,
  date,
  setDate,
  passengers,
  setPassengers,
  handleSearch,
}: SearchPageProps) {
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
    </div>
  );
}
