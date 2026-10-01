import type { Booking, BookingResponse, City, Flight, Passenger } from "./types";

interface ApiErrorBody {
  message?: string;
  errors?: {
    email?: string;
    phone?: string;
    passengers?: Partial<Record<keyof Passenger, string>>[];
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.message ?? `Ошибка запроса (${status})`);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(response.status, body);
  }

  return response.json();
}

export async function getCities(): Promise<City[]> {
  return request<City[]>("/api/cities");
}

export async function searchFlights(filters: {
  origin: string;
  destination: string;
  date: string;
  passengers: string;
}): Promise<Flight[]> {
  return request<Flight[]>(`/api/flights?${new URLSearchParams(filters)}`);
}

export async function getFlight(flightId: string): Promise<Flight> {
  return request<Flight>(`/api/flights/${flightId}`);
}

export async function createBooking(body: {
  flightId: string;
  contact: { email: string; phone: string };
  passengers: Passenger[];
}): Promise<BookingResponse> {
  return request<BookingResponse>("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getBooking(code: string, lastName: string): Promise<Booking> {
  const query = new URLSearchParams({ lastName });
  return request<Booking>(`/api/bookings/${encodeURIComponent(code)}?${query}`);
}

export async function cancelBooking(code: string, lastName: string): Promise<Booking> {
  return request<Booking>(`/api/bookings/${encodeURIComponent(code)}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lastName }),
  });
}