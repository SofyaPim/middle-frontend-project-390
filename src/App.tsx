import { useState } from "react";

import { Header } from "./components/Header";
import { MyBookings } from "./components/MyBookings";
import { SearchPage } from "./components/SearchPage";
import { BookingPage } from "./components/BookingPage";
import * as Sentry from "@sentry/browser";

function App() {
   const [lastPath, setLastPath] = useState(window.location.pathname);
  const isBookingPage = lastPath.startsWith("/booking/");
  const isMyBookingsPage = lastPath === "/lookup";
  const bookingFlightId = isBookingPage ? lastPath.replace("/booking/", "") : null;

  const triggerSentryTestError = () => {
    const error = new Error("Sentry test error from flight booking app");
    Sentry.captureException(error);
    throw error;
  };
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
      <button
        type="button"
        className="button button--sentry-test"
        data-testid="sentry-test-error"
        onClick={triggerSentryTestError}
      >
        Отправить тестовую ошибку
      </button>
      <SearchPage />
    </div>
  );
}

export default App;
