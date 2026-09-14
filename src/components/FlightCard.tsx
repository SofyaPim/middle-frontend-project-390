import React from 'react';
import type { Flight } from '../types';

interface FlightCardProps {
  flight: Flight;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
  return (
    <div data-testid="flight-result-item" className="flight-card">
      <div>
        <h3 className="flight-card__title">
          {flight.airline.name} · {flight.flightNumber}
        </h3>
        <p className="flight-card__route">
          {flight.origin.name} → {flight.destination.name}
        </p>
        <p className="flight-card__duration">
          Время в пути: {flight.durationMinutes} мин
        </p>
      </div>
      <div className="flight-card__price-block">
        <span className="flight-card__price">
          {flight.price.amount.toLocaleString('ru-RU')} {flight.price.currency === 'RUB' ? '₽' : flight.price.currency}
        </span>
        <a
          href={`/booking/${flight.id}`}
          data-testid="book-flight"
          className="flight-card__link"
        >
          Забронировать
        </a>
      </div>
    </div>
  );
};
