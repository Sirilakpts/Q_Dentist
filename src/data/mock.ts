import { DentalService, DaySchedule, Booking } from '@/types/booking';

export const DENTAL_SERVICES: DentalService[] = [
  {
    id: 'checkup',
    name: 'ตรวจฟันและให้คำปรึกษา',
    category: 'ตรวจสุขภาพช่องปาก',
    description: 'ตรวจสุขภาพฟันและเหงือกเบื้องต้น วินิจฉัยโรคในช่องปาก วางแผนการรักษา และให้คำแนะนำการดูแลฟัน',
    durationMinutes: 20,
    preparation: [
      'แปรงฟันทำความสะอาดช่องปากก่อนเข้ารับบริการ',
      'นำบัตรประจำตัวประชาชนและประวัติการแพ้ยา (ถ้ามี)',
      'หากมีโรคประจำตัวหรือรับประทานยาละลายลิ่มเลือด กรุณาแจ้งล่วงหน้า'
    ],
    badge: 'คิวเร็ว'
  },
  {
    id: 'scaling',
    name: 'ขูดหินปูน',
    category: 'ทันตกรรมป้องกัน',
    description: 'ขจัดคราบหินปูน คราบแบคทีเรีย และคราบพลัคที่เกาะแน่นบนผิวฟันและใต้ขอบเหงือก ป้องกันเหงือกอักเสบ',
    durationMinutes: 30,
    preparation: [
      'รับประทานอาหารให้เรียบร้อยก่อนรับบริการอย่างน้อย 1 ชั่วโมง',
      'ผู้ป่วยความดันโลหิตสูงควรควบคุมระดับความดันให้อยู่ในเกณฑ์ปกติ',
      'แจ้งประวัติโรคหัวใจหรือการใส่ลิ้นหัวใจเทียมแก่เจ้าหน้าที่'
    ]
  },
  {
    id: 'filling',
    name: 'อุดฟัน',
    category: 'ทันตกรรมบูรณะ',
    description: 'บูรณะรอยผุ รูฟันผุ หรือฟันบิ่นแตก ด้วยวัสดุคอมโพสิตสีเหมือนฟันหรืออะมัลกัม เพื่อคืนการทำงานและความสวยงาม',
    durationMinutes: 40,
    preparation: [
      'ทำความสะอาดช่องปากให้สะอาด',
      'หากมีอาการปวดฟันรุนแรงหรือมีหนอง ควรแจ้งเพื่อรับการตรวจประเมินก่อน',
      'หลีกเลี่ยงการดื่มชา กาแฟ หรือน้ำอัดลมก่อนเวลานัด'
    ]
  },
  {
    id: 'extraction',
    name: 'ถอนฟัน',
    category: 'ศัลยศาสตร์ช่องปาก',
    description: 'ถอนฟันที่ไม่สามารถรักษาหรือเก็บไว้ได้ เช่น ฟันผุลึกถึงโพรงประสาท ฟันโยกจากโรคปริทันต์ขั้นรุนแรง',
    durationMinutes: 45,
    preparation: [
      'พักผ่อนให้เพียงพออย่างน้อย 6-8 ชั่วโมงในคืนก่อนหน้า',
      'รับประทานอาหารให้เรียบร้อยก่อนเข้ารับการถอนฟัน',
      'ผู้ที่ทานยาต้านการแข็งตัวของเลือด ต้องปรึกษาแพทย์ประจำตัวก่อน',
      'เตรียมผู้ดูแลหรือยานพาหนะเดินทางกลับบ้าน'
    ],
    maxPerDayNote: 'จำกัดจำนวนคิวต่อวันตามการประเมินทางการแพทย์'
  }
];

export const DEFAULT_SLOT_TEMPLATES = [
  { id: 's1', startTime: '08:30', endTime: '09:30', capacity: 4 },
  { id: 's2', startTime: '09:30', endTime: '10:30', capacity: 4 },
  { id: 's3', startTime: '10:30', endTime: '11:30', capacity: 3 },
  { id: 's4', startTime: '13:00', endTime: '14:00', capacity: 4 },
  { id: 's5', startTime: '14:00', endTime: '15:00', capacity: 3 },
  { id: 's6', startTime: '15:00', endTime: '16:00', capacity: 2 },
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

export const INITIAL_MOCK_SCHEDULES: DaySchedule[] = (() => {
  const today = getTodayDateString();
  const schedules: DaySchedule[] = [];

  for (let i = 0; i < 14; i++) {
    const curDate = addDays(today, i);
    const [y, m, d] = curDate.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay(); // 0 is Sunday, 6 is Saturday

    // ราชการเปิดจันทร์ - ศุกร์ (1-5), ปิดเสาร์-อาทิตย์
    const isOpen = dayOfWeek !== 0 && dayOfWeek !== 6;

    schedules.push({
      date: curDate,
      isOpen,
      note: !isOpen ? 'วันหยุดราชการประจำสัปดาห์' : undefined,
      slots: isOpen
        ? DEFAULT_SLOT_TEMPLATES.map((tmpl) => ({
            id: `${curDate}-${tmpl.id}`,
            startTime: tmpl.startTime,
            endTime: tmpl.endTime,
            capacity: tmpl.capacity,
            bookedCount: 0,
            isAvailable: true,
          }))
        : [],
    });
  }

  return schedules;
})();

export const INITIAL_MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-SAMPLE-001',
    referenceCode: 'BR-1001',
    queueNumber: 'A01',
    serviceId: 'checkup',
    serviceName: 'ตรวจฟันและให้คำปรึกษา',
    date: getTodayDateString(),
    timeSlotId: `${getTodayDateString()}-s1`,
    timeSlotLabel: '08:30 - 09:30 น.',
    patientName: 'สมชาย บุรีรัมย์ดี',
    phone: '0812345678',
    idCardLast4: '1234',
    symptomNote: 'ต้องการตรวจฟันประจำปี',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'BK-SAMPLE-002',
    referenceCode: 'BR-1002',
    queueNumber: 'A02',
    serviceId: 'scaling',
    serviceName: 'ขูดหินปูน',
    date: getTodayDateString(),
    timeSlotId: `${getTodayDateString()}-s2`,
    timeSlotLabel: '09:30 - 10:30 น.',
    patientName: 'สมหญิง ศรีนคร',
    phone: '0898765432',
    idCardLast4: '5678',
    symptomNote: 'มีหินปูนด้านล่างฟันหน้า',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'BK-SAMPLE-003',
    referenceCode: 'BR-1003',
    queueNumber: 'B01',
    serviceId: 'filling',
    serviceName: 'อุดฟัน',
    date: addDays(getTodayDateString(), 1),
    timeSlotId: `${addDays(getTodayDateString(), 1)}-s1`,
    timeSlotLabel: '08:30 - 09:30 น.',
    patientName: 'วิชัย มั่งมี',
    phone: '0861112233',
    idCardLast4: '9988',
    symptomNote: 'ฟันกรามซี่บนมีรูผุ เสียวฟันเวลากินน้ำเย็น',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
];

