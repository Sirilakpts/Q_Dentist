'use client';

import { useState, useEffect, useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DentalService, TimeSlot } from '@/types/booking';
import {
  getServices,
  getScheduleWithAvailability,
  getAvailableDays,
  createBooking,
  formatThaiDate,
  formatShortThaiDate,
  formatPhone,
} from '@/lib/booking';
import { getTodayDateString } from '@/data/mock';
import { ServiceCard } from '@/components/booking/ServiceCard';
import { Alert } from '@/components/ui/Alert';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CreditCard,
  FileEdit,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';

export function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('service');

  const [services] = useState<DentalService[]>(getServices());
  const [selectedService, setSelectedService] = useState<DentalService | null>(null);

  // Date & Slot state
  const [availableDays, setAvailableDays] = useState<{ date: string; isOpen: boolean; openSlotsCount: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentSlots, setCurrentSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);
  const [dayClosedNote, setDayClosedNote] = useState<string>('');

  // Patient form state
  const [patientName, setPatientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [idCardLast4, setIdCardLast4] = useState<string>('');
  const [symptomNote, setSymptomNote] = useState<string>('');

  // 4-Step UI state
  const [step, setStep] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form input element IDs
  const patientNameInputId = useId();
  const phoneInputId = useId();
  const idCardLast4InputId = useId();
  const symptomNoteInputId = useId();

  // Load available days on mount
  useEffect(() => {
    const days = getAvailableDays(14);
    setAvailableDays(days);

    if (initialServiceId) {
      const match = services.find((s) => s.id === initialServiceId);
      if (match) {
        setSelectedService(match);
        setStep(2); // Automatically advance to Step 2 to eliminate redundant service selection
      }
    }

    const firstOpenDay = days.find((d) => d.isOpen);
    if (firstOpenDay) {
      setSelectedDate(firstOpenDay.date);
    } else {
      setSelectedDate(getTodayDateString());
    }
  }, [initialServiceId, services]);

  // Load slots whenever selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    const schedule = getScheduleWithAvailability(selectedDate);
    if (!schedule || !schedule.isOpen) {
      setIsDayClosed(true);
      setDayClosedNote(schedule?.note || 'คลินิกปิดทำการในวันดังกล่าว');
      setCurrentSlots([]);
      setSelectedSlot(null);
    } else {
      setIsDayClosed(false);
      setDayClosedNote('');
      setCurrentSlots(schedule.slots);
      setSelectedSlot(null);
    }
  }, [selectedDate]);

  const handleServiceSelect = (service: DentalService) => {
    setSelectedService(service);
    setFormError(null);
  };

  const handleNextToStep2 = () => {
    if (!selectedService) {
      setFormError('กรุณาเลือกบริการทันตกรรมที่ต้องการก่อนดำเนินการต่อ');
      return;
    }
    setFormError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextToStep3 = () => {
    if (!selectedDate) {
      setFormError('กรุณาเลือกวันที่ต้องการเข้ารับบริการ');
      return;
    }
    if (isDayClosed) {
      setFormError('วันที่เลือกปิดทำการ กรุณาเลือกวันอื่น');
      return;
    }
    if (!selectedSlot) {
      setFormError('กรุณาเลือกช่วงเวลาที่ต้องการจองคิว');
      return;
    }
    if (!selectedSlot.isAvailable || selectedSlot.bookedCount >= selectedSlot.capacity) {
      setFormError('ช่วงเวลานี้มีผู้จองเต็มแล้ว กรุณาเลือกช่วงเวลาอื่น');
      return;
    }
    setFormError(null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextToStep4 = () => {
    setFormError(null);
    if (!patientName.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุลของผู้รับบริการ');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 10) {
      setFormError('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9 - 10 หลัก)');
      return;
    }
    const cleanId = idCardLast4.replace(/[^0-9]/g, '');
    if (cleanId.length !== 4) {
      setFormError('กรุณากรอกเลขบัตรประชาชน 4 หลักท้ายให้ครบถ้วน');
      return;
    }

    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    if (!selectedService || !selectedSlot) return;

    setIsSubmitting(true);
    setFormError(null);

    const res = createBooking({
      serviceId: selectedService.id,
      date: selectedDate,
      timeSlotId: selectedSlot.id,
      patientName: patientName.trim(),
      phone: phone.trim(),
      idCardLast4: idCardLast4.trim(),
      symptomNote: symptomNote.trim(),
    });

    setIsSubmitting(false);

    if (!res.success || !res.booking) {
      setFormError(res.error || 'เกิดข้อผิดพลาดในการบันทึกการจอง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    router.push(`/booking/success?ref=${res.booking.referenceCode}`);
  };

  const stepsList = [
    { num: 1, label: 'เลือกบริการ' },
    { num: 2, label: 'เลือกวันเวลา' },
    { num: 3, label: 'กรอกข้อมูล' },
    { num: 4, label: 'ตรวจสอบและยืนยัน' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 4-Step Stepper: Clean, Responsive, Municipality Styled */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stepsList.map((s) => {
            const isCurrent = step === s.num;
            const isPast = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                disabled={!isPast && !isCurrent}
                onClick={() => {
                  if (s.num === 1) setStep(1);
                  if (s.num === 2 && selectedService) setStep(2);
                  if (s.num === 3 && selectedService && selectedSlot) setStep(3);
                }}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors min-h-[44px] ${
                  isCurrent
                    ? 'bg-[#063466] text-[#D5A423] shadow-xs'
                    : isPast
                    ? 'bg-[#063466]/5 text-[#063466] hover:bg-[#063466]/10 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-[#D5A423] text-[#063466]'
                      : isPast
                      ? 'bg-[#063466] text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isPast ? '✓' : s.num}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {formError && (
        <Alert type="error" title="ข้อผิดพลาด">
          {formError}
        </Alert>
      )}

      {/* STEP 1: เลือกบริการ */}
      {step === 1 && (
        <section className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#063466]">
                ขั้นตอนที่ 1: เลือกบริการทันตกรรม
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                เลือกบริการที่ท่านต้องการเข้ารับการรักษา (จำกัด 1 บริการต่อการจองคิว 1 ครั้ง)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedService?.id === service.id}
                  onSelect={handleServiceSelect}
                  showPreparation={true}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextToStep2}
              disabled={!selectedService}
              className={`group w-full sm:w-auto min-h-[48px] px-8 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${
                selectedService
                  ? 'bg-[#063466] hover:bg-[#042345] active:scale-98 text-[#D5A423] shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>ถัดไป: เลือกวันเวลา</span>
              <ArrowRight className="w-4 h-4 icon-interactive icon-slide-right" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: เลือกวันเวลา */}
      {step === 2 && (
        <section className="space-y-4">
          {/* Selected Service Pill */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-[#063466] text-[#D5A423] flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#063466] bg-[#063466]/10 px-2 py-0.5 rounded">
                    {selectedService?.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    ระยะเวลาประมาณ {selectedService?.durationMinutes} นาที
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                  {selectedService?.name}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-[#063466] text-xs font-semibold text-[#063466] hover:bg-slate-50 transition-colors min-h-[44px] self-start sm:self-auto"
            >
              เปลี่ยนบริการ
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#063466] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#D5A423]" />
                ขั้นตอนที่ 2: เลือกวันและช่วงเวลานัดหมาย
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                เลือกวันที่ต้องการ (จันทร์ - ศุกร์) และเลือกรอบเวลาที่ยังมีคิวว่าง
              </p>
            </div>

            {/* Date selection grid */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                เลือกวันที่รับบริการ (14 วันทำการ):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {availableDays.map((day) => {
                  const isSelected = selectedDate === day.date;
                  return (
                    <button
                      key={day.date}
                      type="button"
                      disabled={!day.isOpen}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setFormError(null);
                      }}
                      className={`min-h-[54px] p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'border-[#063466] bg-[#063466] text-[#D5A423] font-bold shadow-xs'
                          : day.isOpen
                          ? 'border-slate-200 bg-white hover:border-[#D5A423] hover:bg-slate-50 text-slate-800 cursor-pointer'
                          : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className={`text-[11px] leading-tight ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                        {formatShortThaiDate(day.date)}
                      </span>
                      <span className="text-[10px] font-medium">
                        {day.isOpen ? (
                          <span className={`px-1 rounded ${isSelected ? 'bg-white/20 text-[#D5A423]' : 'bg-emerald-50 text-emerald-700 font-semibold'}`}>
                            ว่าง {day.openSlotsCount} รอบ
                          </span>
                        ) : (
                          <span className="text-slate-400">ปิด</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-center justify-between">
              <span>วันที่เลือก: <strong>{formatThaiDate(selectedDate)}</strong></span>
              {isDayClosed && <span className="text-rose-600 font-semibold">{dayClosedNote}</span>}
            </div>

            {/* Time Slot Buttons Grid */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D5A423]" />
                เลือกรอบเวลา (รอบที่เต็มจะไม่สามารถกดได้):
              </label>

              {isDayClosed ? (
                <Alert type="warning" title="วันหยุดทำการ">
                  {dayClosedNote || 'วันที่ท่านเลือกศูนย์บริการปิดทำการ กรุณาเลือกวันอื่น'}
                </Alert>
              ) : currentSlots.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">กำลังตรวจสอบข้อมูลช่วงเวลา...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {currentSlots.map((slot) => {
                    const remaining = slot.capacity - slot.bookedCount;
                    const isFull = !slot.isAvailable || remaining <= 0;
                    const isSelected = selectedSlot?.id === slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setFormError(null);
                        }}
                        className={`min-h-[58px] p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#063466] bg-slate-50 ring-2 ring-[#063466]/20 shadow-xs'
                            : isFull
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                            : 'border-slate-200 bg-white hover:border-[#D5A423] text-slate-800 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">
                            {slot.startTime} - {slot.endTime} น.
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#063466] text-[#D5A423] flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500">ความจุ {slot.capacity} คน</span>
                          {isFull ? (
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                              คิวเต็ม
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                              ว่าง {remaining} คิว
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-2 gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="group min-h-[48px] px-5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 icon-interactive icon-slide-left" />
              <span>ย้อนกลับ</span>
            </button>
            <button
              type="button"
              onClick={handleNextToStep3}
              disabled={!selectedSlot || isDayClosed}
              className={`group min-h-[48px] px-7 rounded-xl font-bold text-sm inline-flex items-center gap-1.5 transition-all ${
                selectedSlot && !isDayClosed
                  ? 'bg-[#063466] hover:bg-[#042345] active:scale-98 text-[#D5A423] shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>ถัดไป: กรอกข้อมูลผู้จอง</span>
              <ArrowRight className="w-4 h-4 icon-interactive icon-slide-right" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: กรอกข้อมูลผู้รับบริการ */}
      {step === 3 && (
        <section className="space-y-4">
          {/* Summary Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                สรุปวันเวลาที่เลือก:
              </span>
              <div className="font-bold text-slate-900 text-base">{selectedService?.name}</div>
              <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-x-3">
                <span>📅 {formatThaiDate(selectedDate)}</span>
                <span>⏰ {selectedSlot?.startTime} - {selectedSlot?.endTime} น.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-[#063466] hover:underline min-h-[44px] flex items-center self-start sm:self-center"
            >
              แก้ไขวันหรือเวลา
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#063466] flex items-center gap-2">
                <User className="w-5 h-5 text-[#D5A423]" />
                ขั้นตอนที่ 3: ข้อมูลผู้รับบริการ
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                กรุณาระบุข้อมูลตามความเป็นจริงเพื่อใช้ในการตรวจสอบและออกใบนัดหมาย
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label htmlFor={patientNameInputId} className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                  ชื่อ - นามสกุล (ผู้รับบริการ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id={patientNameInputId}
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="เช่น นายสมชาย บุรีรัมย์ดี"
                    className="w-full pl-9 pr-3 min-h-[44px] rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#063466] text-sm text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Phone & ID Card 4 digits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={phoneInputId} className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                    หมายเลขโทรศัพท์มือถือ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id={phoneInputId}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="เช่น 0812345678"
                      maxLength={10}
                      className="w-full pl-9 pr-3 min-h-[44px] rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#063466] text-sm text-slate-900 bg-white"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">ใช้สำหรับตรวจสอบสถานะคิว</span>
                </div>

                <div>
                  <label htmlFor={idCardLast4InputId} className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                    เลขบัตรประชาชน 4 หลักท้าย <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      id={idCardLast4InputId}
                      type="text"
                      value={idCardLast4}
                      onChange={(e) => setIdCardLast4(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="เช่น 1234"
                      maxLength={4}
                      className="w-full pl-9 pr-3 min-h-[44px] rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#063466] text-sm text-slate-900 bg-white tracking-wider font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">เพื่อความปลอดภัย เก็บเฉพาะ 4 หลักท้าย</span>
                </div>
              </div>

              {/* Symptom Note */}
              <div>
                <label htmlFor={symptomNoteInputId} className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                  อาการเบื้องต้น หรือประวัติแพ้ยา (ถ้ามี)
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <textarea
                    id={symptomNoteInputId}
                    rows={2}
                    value={symptomNote}
                    onChange={(e) => setSymptomNote(e.target.value)}
                    placeholder="เช่น ปวดฟันกรามล่างซ้ายมา 2 วัน หรือมีประวัติแพ้ยาเพนิซิลลิน..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#063466] text-sm text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 Actions */}
          <div className="flex items-center justify-between pt-2 gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="group min-h-[48px] px-5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 icon-interactive icon-slide-left" />
              <span>ย้อนกลับ</span>
            </button>
            <button
              type="button"
              onClick={handleNextToStep4}
              className="group min-h-[48px] px-7 rounded-xl bg-[#063466] hover:bg-[#042345] active:scale-98 text-[#D5A423] font-bold text-sm inline-flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span>ถัดไป: ตรวจสอบและยืนยัน</span>
              <ArrowRight className="w-4 h-4 icon-interactive icon-slide-right" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: ตรวจสอบและยืนยัน */}
      {step === 4 && (
        <section className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#063466] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D5A423]" />
                ขั้นตอนที่ 4: ตรวจสอบข้อมูลก่อนยืนยันการจอง
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                โปรดตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนกดยืนยันการจองคิว
              </p>
            </div>

            {/* Review Cards */}
            <div className="space-y-4">
              {/* Appointment details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#063466]">
                  ข้อมูลการนัดหมาย
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-800">
                  <div>
                    <span className="text-slate-500 block text-xs">บริการ:</span>
                    <span className="font-bold">{selectedService?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">วันที่นัด:</span>
                    <span className="font-bold flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#D5A423]" />
                      {formatThaiDate(selectedDate, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">ช่วงเวลา:</span>
                    <span className="font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D5A423]" />
                      {selectedSlot?.startTime} - {selectedSlot?.endTime} น.
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">สถานที่:</span>
                    <span>ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์</span>
                  </div>
                </div>
              </div>

              {/* Patient info */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#063466]">
                  ข้อมูลผู้รับบริการ
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-800">
                  <div>
                    <span className="text-slate-500 block text-xs">ชื่อ-นามสกุล:</span>
                    <span className="font-bold">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">เบอร์โทรศัพท์:</span>
                    <span className="font-mono font-medium">{formatPhone(phone)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">เลขบัตรประชาชน:</span>
                    <span className="font-mono">•••• •••• ••• {idCardLast4}</span>
                  </div>
                  {symptomNote && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block text-xs">อาการ/ข้อมูลเพิ่มเติม:</span>
                      <span>{symptomNote}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Note Notice */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#D5A423] shrink-0 mt-0.5" />
                <div>
                  <strong>หมายเหตุสถานะการจอง:</strong> เมื่อกดยืนยันแล้ว รายการจะถูกบันทึกในสถานะ <em>"รอเจ้าหน้าที่ยืนยัน"</em> โดยท่านจะได้รับใบนัดหมายพร้อมรหัสอ้างอิงสำหรับติดตามสถานะ
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 Actions */}
          <div className="flex items-center justify-between pt-2 gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={isSubmitting}
              className="group min-h-[48px] px-5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 icon-interactive icon-slide-left" />
              <span>แก้ไขข้อมูล</span>
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="group min-h-[48px] px-8 rounded-xl bg-[#063466] hover:bg-[#042345] active:scale-98 text-[#D5A423] font-bold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#D5A423] border-t-transparent rounded-full animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3] icon-interactive icon-scale" />
                  <span>ยืนยันการจองคิวทันตกรรม</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
