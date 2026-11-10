'use client';

import { DentalService, TimeSlot } from '@/types/booking';
import { formatThaiDate, formatPhone } from '@/lib/booking';
import { Calendar, Clock, User, Phone, CreditCard, FileText, CheckCircle2, X } from 'lucide-react';

interface BookingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  service: DentalService | null;
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  patientName: string;
  phone: string;
  idCardLast4: string;
  symptomNote: string;
  isSubmitting?: boolean;
}

export function BookingSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  service,
  selectedDate,
  selectedSlot,
  patientName,
  phone,
  idCardLast4,
  symptomNote,
  isSubmitting = false,
}: BookingSummaryModalProps) {
  if (!isOpen || !service || !selectedSlot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-orange-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <div>
              <h3 className="text-base font-bold leading-tight">
                ตรวจสอบและยืนยันข้อมูลการจองคิว
              </h3>
              <p className="text-xs text-orange-100">
                กรุณาตรวจสอบความถูกต้องก่อนกดยืนยัน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto text-slate-700">
          {/* Service & Time details */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-800">
              รายละเอียดการนัดหมาย
            </div>
            <div className="text-slate-900 font-bold text-base">
              {service.name}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{formatThaiDate(selectedDate, true)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{selectedSlot.startTime} - {selectedSlot.endTime} น.</span>
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs sm:text-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              ข้อมูลผู้รับบริการ
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-xs mr-2">ชื่อ-นามสกุล:</span>
                  <span className="font-semibold text-slate-900">{patientName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-xs mr-2">เบอร์โทรศัพท์:</span>
                  <span className="font-semibold text-slate-900">{formatPhone(phone)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-500 text-xs mr-2">บัตรประชาชน:</span>
                  <span className="font-semibold text-slate-900">•••• •••• ••• {idCardLast4}</span>
                </div>
              </div>

              {symptomNote && (
                <div className="flex items-start gap-2 pt-1 border-t border-slate-200">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 text-xs block">อาการ/ข้อมูลเพิ่มเติม:</span>
                    <span className="text-slate-800">{symptomNote}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <span className="font-semibold text-slate-700 block mb-0.5">ข้อแนะนำ:</span>
            • เดินทางมาถึงก่อนเวลานัด 15 นาที พร้อมบัตรประชาชนตัวจริง
          </div>
        </div>

        {/* Footer actions with min-h-[44px] buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] px-5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            ย้อนกลับไปแก้ไข
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] px-6 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              'ยืนยันการจองคิวทันตกรรม'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
