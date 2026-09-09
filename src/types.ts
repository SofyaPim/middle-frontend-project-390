export interface City {
  code: string;
  name: string;
  country?: string;
}

export interface Airline {
  code: string;
  name: string;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  origin: City;
  destination: City;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  price: Money;
  seatsAvailable: number;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  documentNumber: string;
}

export interface BookingResponse {
  code: string;
  passengers: Passenger[];
  totalPrice: {
    amount: number;
    currency: string;
  };
}

export interface Booking extends BookingResponse {
  contact?: {
    email: string;
    phone: string;
  };
  passengers: Passenger[];
}
export interface MyBookingsProps {
  loading: boolean;
  error: string | null;
  bookings: Booking[];
}
export interface SearchPageProps {
  cities: City[];
  origin: string;
  setOrigin: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  passengers: number;
  setPassengers: (value: number) => void;
  handleSearch: (e:React.SubmitEvent)=>void;
}
export interface ValidateParams {
  contactEmail: string;
  contactPhone: string;
  passengersList: Passenger[];
}
