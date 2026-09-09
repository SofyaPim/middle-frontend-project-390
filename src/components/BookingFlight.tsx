import React from 'react';
import type { Flight } from '../types';

interface BookingFlightProps {
  selectedFlight: Flight | null;
}

export const BookingFlight: React.FC<BookingFlightProps> = ({ selectedFlight }) => {
  return (
    <div data-testid="booking-flight" style={{ padding: "15px", margin: "0 auto" }}>
      <strong>
        {selectedFlight?.origin.name} → {selectedFlight?.destination.name}, {selectedFlight?.flightNumber}
      </strong>
    </div>
  );
};
