import React from "react";
import type { MyBookingsProps } from "../types"; // <-- Импортируем готовый тип

export const MyBookings: React.FC<MyBookingsProps> = ({ loading, error, bookings }) => {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
        Мои бронирования
      </h2>
      {loading && <p>Загрузка списка бронирований...</p>}
      {error && <div data-testid="booking-error" style={{ color: "red" }}>Ошибка: {error}</div>}
      {!loading && !error && bookings.length === 0 && <p>У вас пока нет забронированных рейсов.</p>}
      {!loading && !error && bookings.length > 0 && (
        <div>
          {bookings.map((booking) => (
            <div key={booking.code} data-testid="booking-item">
              <strong>Код: <span data-testid="booking-code">{booking.code}</span></strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
