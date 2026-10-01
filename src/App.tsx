import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";

import { BookingPage } from "./components/BookingPage";
import { Header } from "./components/Header";
import { MyBookings } from "./components/MyBookings";
import { SearchPage } from "./components/SearchPage";

function getPageClassName(pathname: string) {
  if (pathname.startsWith("/booking/")) {
    return "app-page--booking";
  }
  if (pathname === "/lookup") {
    return "app-page--bookings";
  }
  return "app-page--search";
}

function Layout() {
  const { pathname } = useLocation();

  return (
    <div className={`app-page ${getPageClassName(pathname)}`}>
      <Header />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/booking/:flightId" element={<BookingPage />} />
        <Route path="/lookup" element={<MyBookings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;