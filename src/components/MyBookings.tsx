import { useState } from "react";
import type { Booking } from "../types";

export function MyBookings() {
  const [code, setCode] = useState("");
  const [lastName, setLastName] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotFound(false);
    setBooking(null);

    try {
      const params = new URLSearchParams({ lastName });
      const response = await fetch(`/api/bookings/${encodeURIComponent(code)}?${params}`);

      if (!response.ok) {
        if (response.status === 404) setNotFound(true);
        throw new Error(response.status === 404
          ? "Бронь не найдена. Проверьте код и фамилию."
          : "Не удалось найти бронирование");
      }

      setBooking(await response.json());
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Произошла неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    setCancelling(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(booking.code)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName }),
      });

      if (!response.ok) {
        if (response.status === 404) setNotFound(true);
        throw new Error(response.status === 404
          ? "Бронь не найдена. Проверьте код и фамилию."
          : "Не удалось отменить бронирование");
      }

      setBooking(await response.json());
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Не удалось отменить бронирование");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <h2 className="bookings__title">
        Мои бронирования
      </h2>
      <form className="lookup-form" data-testid="booking-lookup-form" onSubmit={handleLookup}>
        <label className="form-field">
          Код бронирования
          <input
            className="form-field__input"
            data-testid="lookup-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </label>
        <label className="form-field">
          Фамилия пассажира
          <input
            className="form-field__input"
            data-testid="lookup-lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </label>
        <button className="button button--primary" data-testid="lookup-submit" type="submit" disabled={loading}>
          {loading ? "Поиск..." : "Найти бронирование"}
        </button>
      </form>

      {error && <div data-testid={notFound ? "booking-not-found" : "booking-error"} className="status-message status-message--error">{error}</div>}
      {booking && (
        <div data-testid="booking-details" className="booking-item">
          <strong>Код: <span data-testid="booking-code">{booking.code}</span></strong>
          <p>Пассажиров: {booking.passengers.length}</p>
          <p>
            Статус: <strong data-testid="booking-status" data-status={booking.status || "confirmed"}>
              {booking.status === "cancelled" ? "Отменена" : "Подтверждена"}
            </strong>
          </p>
          {booking.status === "confirmed" && (
            <button
              type="button"
              className="button button--cancel"
              data-testid="cancel-booking"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Отмена..." : "Отменить бронь"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
