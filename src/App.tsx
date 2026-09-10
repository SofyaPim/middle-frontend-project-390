import { useEffect, useState } from "react";
import type { Booking } from "./types";

import { Header } from "./components/Header";
import { MyBookings } from "./components/MyBookings";
import { SearchPage } from "./components/SearchPage";
import { BookingPage } from "./components/BookingPage";

function App() {
   const [lastPath, setLastPath] = useState(window.location.pathname);
  const isBookingPage = lastPath.startsWith("/booking/");
  const isMyBookingsPage = lastPath === "/my-bookings";
  const bookingFlightId = isBookingPage ? lastPath.replace("/booking/", "") : null;
  // 1. Стейты для роутинга и истории бронирований

  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  // 2. Эффект загрузки истории бронирований
  useEffect(() => {
    if (lastPath !== "/my-bookings") return;

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
  }, [lastPath]);
  // 3. Рендеринг страниц в зависимости от URL

  if (isBookingPage) {
    return (
      <div data-testid="page-title" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <Header onNavigate={(path) => setLastPath(path)} />
        <BookingPage bookingFlightId={bookingFlightId || ""} />
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
  // Главная страница поиска рейсов
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <Header onNavigate={(path) => setLastPath(path)} />
      <SearchPage />
    </div>
  );
}

export default App;
