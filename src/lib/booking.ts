import { Booking, BookingStatus, DaySchedule, DentalService, TimeSlot, CreateBookingInput } from '@/types/booking';
import { DENTAL_SERVICES, INITIAL_MOCK_BOOKINGS, INITIAL_MOCK_SCHEDULES, getTodayDateString } from '@/data/mock';

const STORAGE_KEYS = {
  BOOKINGS: 'qdentist_bookings_v1',
  SCHEDULES: 'qdentist_schedules_v1',
};

// Safe access to window.localStorage
function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function initLocalStorage(): void {
  if (!isClient()) return;

  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_MOCK_BOOKINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_MOCK_SCHEDULES));
  }
}

export function getServices(): DentalService[] {
  return DENTAL_SERVICES;
}

export function getServiceById(id: string): DentalService | undefined {
  return DENTAL_SERVICES.find((s) => s.id === id);
}

export function getBookings(): Booking[] {
  if (!isClient()) return INITIAL_MOCK_BOOKINGS;
  initLocalStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : INITIAL_MOCK_BOOKINGS;
  } catch {
    return INITIAL_MOCK_BOOKINGS;
  }
}

export function getSchedules(): DaySchedule[] {
  if (!isClient()) return INITIAL_MOCK_SCHEDULES;
  initLocalStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return raw ? JSON.parse(raw) : INITIAL_MOCK_SCHEDULES;
  } catch {
    return INITIAL_MOCK_SCHEDULES;
  }
}

export function saveBookings(bookings: Booking[]): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

export function saveSchedules(schedules: DaySchedule[]): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
}

// Check slot availability considering active bookings
export function getScheduleWithAvailability(dateStr: string): DaySchedule | null {
  const schedules = getSchedules();
  const schedule = schedules.find((s) => s.date === dateStr);
  if (!schedule) return null;

  if (!schedule.isOpen) {
    return {
      ...schedule,
      slots: [],
    };
  }

  const allBookings = getBookings();
  const activeBookings = allBookings.filter(
    (b) => b.date === dateStr && b.status !== 'cancelled'
  );

  const updatedSlots: TimeSlot[] = schedule.slots.map((slot) => {
    const bookedCount = activeBookings.filter((b) => b.timeSlotId === slot.id).length;
    return {
      ...slot,
      bookedCount,
      isAvailable: bookedCount < slot.capacity,
    };
  });

  return {
    ...schedule,
    slots: updatedSlots,
  };
}

export function getAvailableDays(limit: number = 14): { date: string; isOpen: boolean; openSlotsCount: number }[] {
  const schedules = getSchedules();
  const today = getTodayDateString();

  return schedules
    .filter((s) => s.date >= today)
    .slice(0, limit)
    .map((s) => {
      const liveSchedule = getScheduleWithAvailability(s.date);
      const openSlotsCount = liveSchedule
        ? liveSchedule.slots.filter((slot) => slot.isAvailable).length
        : 0;

      return {
        date: s.date,
        isOpen: s.isOpen && openSlotsCount > 0,
        openSlotsCount,
      };
    });
}

function generateReferenceCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BR-${randomStr}`;
}

function generateQueueNumber(serviceId: string, date: string): string {
  const prefixMap: Record<string, string> = {
    checkup: 'A',
    scaling: 'B',
    filling: 'C',
    extraction: 'D',
  };
  const prefix = prefixMap[serviceId] || 'Q';
  const bookings = getBookings().filter((b) => b.date === date && b.serviceId === serviceId);
  const count = bookings.length + 1;
  return `${prefix}${String(count).padStart(2, '0')}`;
}

export function createBooking(input: CreateBookingInput): { success: boolean; booking?: Booking; error?: string } {
  const today = getTodayDateString();

  // 1. ไม่อนุญาตให้จองวันย้อนหลัง
  if (input.date < today) {
    return { success: false, error: 'ไม่สามารถจองคิวย้อนหลังได้ กรุณาเลือกวันที่ตั้งแต่วันนี้เป็นต้นไป' };
  }

  // 2. Validate Service
  const service = getServiceById(input.serviceId);
  if (!service) {
    return { success: false, error: 'ไม่พบบริการทันตกรรมที่เลือก' };
  }

  // 3. Check Schedule and Slot
  const daySchedule = getScheduleWithAvailability(input.date);
  if (!daySchedule || !daySchedule.isOpen) {
    return { success: false, error: 'วันที่เลือกไม่ได้เปิดให้บริการ กรุณาเลือกวันทำการอื่น' };
  }

  const slot = daySchedule.slots.find((s) => s.id === input.timeSlotId);
  if (!slot) {
    return { success: false, error: 'ไม่พบช่วงเวลาที่เลือก' };
  }

  if (!slot.isAvailable || slot.bookedCount >= slot.capacity) {
    return { success: false, error: 'ช่วงเวลาที่เลือกมีผู้จองเต็มแล้ว กรุณาเลือกช่วงเวลาอื่น' };
  }

  // 4. Validate Patient Info
  if (!input.patientName.trim()) {
    return { success: false, error: 'กรุณาระบุชื่อ-นามสกุลของผู้รับบริการ' };
  }
  const cleanPhone = input.phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length < 9 || cleanPhone.length > 10) {
    return { success: false, error: 'กรุณาระบุหมายเลขโทรศัพท์ที่ถูกต้อง (9-10 หลัก)' };
  }
  const cleanId4 = input.idCardLast4.replace(/[^0-9]/g, '');
  if (cleanId4.length !== 4) {
    return { success: false, error: 'กรุณาระบุเลขบัตรประชาชน 4 หลักท้ายให้ครบถ้วน' };
  }

  const newBooking: Booking = {
    id: `BK-${Date.now()}`,
    referenceCode: generateReferenceCode(),
    queueNumber: generateQueueNumber(input.serviceId, input.date),
    serviceId: service.id,
    serviceName: service.name,
    date: input.date,
    timeSlotId: slot.id,
    timeSlotLabel: `${slot.startTime} - ${slot.endTime} น.`,
    patientName: input.patientName.trim(),
    phone: cleanPhone,
    idCardLast4: cleanId4,
    symptomNote: input.symptomNote?.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const existing = getBookings();
  saveBookings([newBooking, ...existing]);

  return { success: true, booking: newBooking };
}

export function findBooking(query: string): Booking[] {
  const trimmed = query.trim().toUpperCase();
  if (!trimmed) return [];

  const bookings = getBookings();
  const cleanPhone = query.replace(/[^0-9]/g, '');

  return bookings.filter((b) => {
    const matchRef = b.referenceCode.toUpperCase() === trimmed;
    const matchPhone = cleanPhone && b.phone.includes(cleanPhone);
    const matchName = b.patientName.toLowerCase().includes(query.trim().toLowerCase());
    return matchRef || matchPhone || matchName;
  });
}

export function cancelBooking(referenceCode: string, reason?: string): { success: boolean; error?: string } {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.referenceCode === referenceCode.trim().toUpperCase());

  if (idx === -1) {
    return { success: false, error: 'ไม่พบรายการจองตามเลขอ้างอิงนี้' };
  }

  const target = bookings[idx];
  if (target.status === 'cancelled') {
    return { success: false, error: 'รายการจองนี้ถูกยกเลิกไปแล้ว' };
  }
  if (target.status === 'completed' || target.status === 'checked_in') {
    return { success: false, error: 'ไม่สามารถยกเลิกรายการที่เข้ารับบริการหรือเสร็จสิ้นแล้ว' };
  }

  target.status = 'cancelled';
  target.updatedAt = new Date().toISOString();
  target.cancelReason = reason || 'ผู้รับบริการขอยกเลิกผ่านระบบ';

  bookings[idx] = target;
  saveBookings(bookings);
  return { success: true };
}

export function updateBookingStatus(
  referenceCode: string,
  newStatus: BookingStatus,
  cancelReason?: string
): { success: boolean; error?: string } {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.referenceCode.toUpperCase() === referenceCode.trim().toUpperCase());

  if (idx === -1) {
    return { success: false, error: 'ไม่พบรายการจองตามเลขอ้างอิงนี้' };
  }

  const target = bookings[idx];
  target.status = newStatus;
  target.updatedAt = new Date().toISOString();
  if (newStatus === 'cancelled') {
    target.cancelReason = cancelReason || 'เจ้าหน้าที่ยกเลิกรายการ';
  }

  bookings[idx] = target;
  saveBookings(bookings);
  return { success: true };
}

// Thai Date formatting helper
export function formatThaiDate(dateStr: string, includeDayName: boolean = true): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const date = new Date(year, month, day);
  const thaiYear = year + 543;

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const dayNames = [
    'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
  ];

  const dayName = dayNames[date.getDay()];
  const monthName = monthNames[month];

  if (includeDayName) {
    return `${dayName}ที่ ${day} ${monthName} พ.ศ. ${thaiYear}`;
  }
  return `${day} ${monthName} ${thaiYear}`;
}

export function formatShortThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10) + 543;
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const shortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  return `${day} ${shortMonths[month]} ${year}`;
}

export function formatThaiDateTime(isoStr: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear() + 543;
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const shortMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${day} ${shortMonths[month]} ${year} เวลา ${hours}:${mins} น.`;
  } catch {
    return isoStr;
  }
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5)}`;
  }
  return phone;
}

export interface StatusMeta {
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}

export function getStatusMeta(status: BookingStatus): StatusMeta {
  switch (status) {
    case 'pending':
      return {
        label: 'รอเจ้าหน้าที่ยืนยัน',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
        dotColor: 'bg-amber-500',
        description: 'ระบบบันทึกคำขอจองคิวเรียบร้อย อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบและยืนยันนัด'
      };
    case 'confirmed':
      return {
        label: 'ยืนยันนัดหมายแล้ว',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
        description: 'เจ้าหน้าที่ยืนยันช่วงเวลาและคิวตรวจรักษาเรียบร้อยแล้ว'
      };
    case 'checked_in':
      return {
        label: 'เช็คอินเข้ารับบริการแล้ว',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotColor: 'bg-blue-500',
        description: 'ผู้รับบริการมาถึงจุดบริการและลงทะเบียนแล้ว'
      };
    case 'completed':
      return {
        label: 'รับบริการเสร็จสิ้น',
        badgeClass: 'bg-stone-100 text-stone-700 border-stone-300',
        dotColor: 'bg-stone-500',
        description: 'เสร็จสิ้นกระบวนการตรวจรักษา'
      };
    case 'cancelled':
      return {
        label: 'ยกเลิกการจอง',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        dotColor: 'bg-rose-500',
        description: 'รายการจองนี้ถูกยกเลิกแล้ว'
      };
    default:
      return {
        label: 'ไม่ทราบสถานะ',
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
        dotColor: 'bg-gray-400',
        description: '-'
      };
  }
}

