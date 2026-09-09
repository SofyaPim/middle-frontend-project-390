import React from 'react';
import type { Flight } from '../types';

interface FlightCardProps {
  flight: Flight;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
  return (
    <div
      data-testid="flight-result-item"
      style={{ border: "1px solid #e0e0e0", padding: "15px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}
    >
      <div>
        <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>
          {flight.airline.name} · {flight.flightNumber}
        </h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
          {flight.origin.name} → {flight.destination.name}
        </p>
        <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
          Время в пути: {flight.durationMinutes} мин
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <span style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
          {flight.price.amount.toLocaleString('ru-RU')} {flight.price.currency === 'RUB' ? '₽' : flight.price.currency}
        </span>
        <a
          href={`/booking/${flight.id}`}
          data-testid="book-flight"
          style={{ display: "inline-block", padding: "6px 12px", background: "#28a745", color: "#fff", textDecoration: "none", borderRadius: "4px", fontSize: "14px" }}
        >
          Забронировать
        </a>
      </div>
    </div>
  );
};
