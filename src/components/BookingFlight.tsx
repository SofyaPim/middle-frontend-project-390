import React from 'react';
import type { Flight } from '../types';

interface BookingFlightProps {
  selectedFlight: Flight | null;
}

export const BookingFlight: React.FC<BookingFlightProps> = ({ selectedFlight }) => {
  return (
    <div data-testid="booking-flight" className="booking-flight">
      <strong>
        {selectedFlight?.origin.name} → {selectedFlight?.destination.name}, {selectedFlight?.flightNumber}
      </strong>
    </div>
  );
};
