export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  _id: string;
  customerName: string;
  contactInfo: string;
  tableId: string;
  roomId: string;
  companyId: string;
  venueId: string;
  numberOfPeople: number;
  reservationDate: string; // formato ISO
  reservationTime: string; // HH:mm (ej: "19:30")
  status: ReservationStatus;
  createdAt: string;
}

export interface NewReservation {
  customerName: string;
  contactInfo: string;
  tableId: string;
  roomId: string;
  numberOfPeople: number;
  reservationDate: string;
  reservationTime: string;
}

export type ReservationInput = {
  customerName: string;
  contactInfo: string;
  tableId: string;
  roomId: string;
  numberOfPeople: number;
  reservationTime: string;
};