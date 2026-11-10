export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface DentalService {
  id: string;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  preparation: string[];
  maxPerDayNote?: string;
  badge?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  capacity: number;  // Max patients per slot
  bookedCount: number;
  isAvailable: boolean;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  isOpen: boolean;
  note?: string;
  slots: TimeSlot[];
}

export interface Booking {
  id: string; // e.g. "BK-20261106-001"
  referenceCode: string; // e.g. "BR-9482"
  queueNumber: string; // e.g. "A01"
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  timeSlotId: string;
  timeSlotLabel: string; // e.g. "09:00 - 10:00 น."
  patientName: string;
  phone: string;
  idCardLast4: string; // เก็บเฉพาะ 4 หลักท้ายเพื่อความเป็นส่วนตัว
  symptomNote?: string;
  status: BookingStatus;
  createdAt: string; // ISO String
  updatedAt?: string;
  cancelReason?: string;
}

export interface CreateBookingInput {
  serviceId: string;
  date: string;
  timeSlotId: string;
  patientName: string;
  phone: string;
  idCardLast4: string;
  symptomNote?: string;
}

