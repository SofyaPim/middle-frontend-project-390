import { useState } from "react";

import { Header } from "./components/Header";
import { MyBookings } from "./components/MyBookings";
import { SearchPage } from "./components/SearchPage";
import { BookingPage } from "./components/BookingPage";

function App() {
   const [lastPath, setLastPath] = useState(window.location.pathname);
  const isBookingPage = lastPath.startsWith("/booking/");
  const isMyBookingsPage = lastPath === "/lookup";
  const bookingFlightId = isBookingPage ? lastPath.replace("/booking/", "") : null;
  // Рендеринг страниц в зависимости от URL

  if (isBookingPage) {
    return (
      <div data-testid="page-title" className="app-page app-page--booking">
        <Header onNavigate={(path) => setLastPath(path)} />
        <BookingPage bookingFlightId={bookingFlightId || ""} />
      </div>
    );
  }
  if (isMyBookingsPage) {
    return (
      <div className="app-page app-page--bookings">
        <Header onNavigate={(path) => setLastPath(path)} />
        <MyBookings />
      </div>
    );
  }
  // Главная страница поиска рейсов
  return (
    <div className="app-page app-page--search">
      <Header onNavigate={(path) => setLastPath(path)} />
      <SearchPage />
    </div>
  );
}

export default App;
