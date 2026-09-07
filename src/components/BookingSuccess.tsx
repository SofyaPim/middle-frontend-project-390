import React from 'react';
import type { Flight, BookingResponse } from '../types';

interface BookingSuccessProps {
  bookingData: BookingResponse;
  flight: Flight | null;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ bookingData, flight }) => {
  return (
    <div  data-testid="booking-success" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Бронирование оформлено</h2>
      
      <p style={{ margin: '12px 0', fontSize: '16px' }}>
        Код бронирования: <strong data-testid="booking-code">{bookingData.code}</strong>
      </p>
      
      {flight && (
        <p style={{ margin: '12px 0', fontSize: '16px' }}>
          {flight.origin.name} → {flight.destination.name}, {flight.flightNumber}
        </p>
      )}
      
      <p style={{ margin: '12px 0', fontSize: '16px' }}>
        Пассажиров: {bookingData.passengers?.length || 0}
      </p>
      
      <p style={{ margin: '12px 0', fontSize: '16px', fontWeight: 'bold' }}>
        Итого: {bookingData.totalPrice?.amount.toLocaleString('ru-RU') || 0} ₽
      </p>
    </div>
  );
};
