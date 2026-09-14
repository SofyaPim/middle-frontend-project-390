import React from 'react';
import type { Flight, BookingResponse } from '../types';

interface BookingSuccessProps {
  bookingData: BookingResponse;
  flight: Flight | null;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ bookingData, flight }) => {
  const bookedFlight = bookingData.flight || flight;

  return (
    <div data-testid="booking-success" className="booking-success">
      <h2 className="booking-success__title">Бронирование оформлено</h2>

      <p className="booking-success__detail">
        Код бронирования: <strong data-testid="booking-code">{bookingData.code}</strong>
      </p>

      <div className="booking-card">
        <div className="booking-card__section">
          <h3 className="booking-card__heading">Рейс</h3>
          {bookedFlight ? (
            <>
              <p className="booking-card__route">
                {bookedFlight.origin.name} → {bookedFlight.destination.name}
              </p>
              <p className="booking-card__meta">
                {bookedFlight.airline.name} · {bookedFlight.flightNumber}
              </p>
            </>
          ) : (
            <p className="booking-card__meta">Данные рейса недоступны</p>
          )}
        </div>

        <div className="booking-card__section">
          <h3 className="booking-card__heading">Пассажиры</h3>
          {bookingData.passengers?.length ? (
            <ul className="booking-card__passengers">
              {bookingData.passengers.map((passenger, index) => (
                <li key={`${passenger.firstName}-${passenger.lastName}-${index}`}>
                  {passenger.firstName} {passenger.lastName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="booking-card__meta">Данные пассажиров недоступны</p>
          )}
        </div>

        <p className="booking-success__detail">
          Статус: <strong>{bookingData.status || "—"}</strong>
        </p>

      <p className="booking-success__detail booking-success__total">
          Итого: {bookingData.totalPrice?.amount.toLocaleString('ru-RU') || 0} {bookingData.totalPrice?.currency || 'RUB'}
        </p>
      </div>
    </div>
  );
};
