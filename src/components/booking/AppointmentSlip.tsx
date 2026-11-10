'use client';

import { Booking } from '@/types/booking';
import { formatThaiDate, formatThaiDateTime, formatPhone, getStatusMeta } from '@/lib/booking';
import { Printer, Calendar, Clock, MapPin, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AppointmentSlipProps {
  booking: Booking;
  onPrint?: () => void;
  showActions?: boolean;
}

export function AppointmentSlip({ booking, onPrint, showActions = true }: AppointmentSlipProps) {
  const statusMeta = getStatusMeta(booking.status);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* On-screen Action Toolbar (Hidden during Print) */}
      {showActions && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs no-print">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>ใบนัดหมายพร้อมพิมพ์หรือบันทึกเป็น PDF (ขนาด A4 หน้าเดียว)</span>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#063466] hover:bg-[#042345] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-[#D5A423]" />
            พิมพ์ใบนัดหมาย / บันทึก PDF
          </button>
        </div>
      )}

      {/* The Official A4 Printable Appointment Document */}
      <div
        id="printable-appointment-document"
        className="printable-document bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden text-slate-800 p-6 sm:p-8 space-y-6"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Emblem */}
              <div className="w-12 h-12 rounded-xl bg-[#063466] text-[#D5A423] flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" width="28" height="28">
                  <path d="M7 2C4.24 2 2 4.24 2 7c0 3.12 1.44 5.37 2.7 7.35C5.82 16.11 7 18 7 21a1 1 0 0 0 2 0c0-2.31-.83-3.61-1.78-5.1C6.18 14.28 5 12.44 5 10c0-1.65 1.35-3 3-3s3 1.35 3 3c0 .55.45 1 1 1s1-.45 1-1c0-1.65 1.35-3 3-3s3 1.35 3 3c0 2.44-1.18 4.28-2.22 5.9C15.83 17.39 15 18.69 15 21a1 1 0 0 0 2 0c0-3 1.18-4.89 2.3-6.65C20.56 12.37 22 10.12 22 7c0-2.76-2.24-5-5-5-2.21 0-4.08 1.44-4.73 3.44C11.62 3.44 9.75 2 7 2z" />
                </svg>
              </div>

              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-slate-600">
                  ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์
                </h2>
                <h1 className="text-lg sm:text-2xl font-black text-[#063466] tracking-tight">
                  {booking.status === 'confirmed' || booking.status === 'checked_in' || booking.status === 'completed'
                    ? 'ใบนัดหมายรับบริการทันตกรรม'
                    : booking.status === 'cancelled'
                    ? 'หลักฐานการยกเลิกคิวทันตกรรม'
                    : 'หลักฐานคำขอจองคิวทันตกรรม'}
                </h1>
                <p className="text-[11px] text-slate-500">
                  กลุ่มงานทันตสาธารณสุข กองสาธารณสุขและสิ่งแวดล้อม
                </p>
              </div>
            </div>

            {/* Document Meta (Right top) */}
            <div className="text-right text-xs shrink-0">
              <span className="text-slate-500 block text-[11px]">เลขอ้างอิงการจอง:</span>
              <span className="font-mono font-bold text-sm sm:text-base text-[#063466]">
                {booking.referenceCode}
              </span>
              <span className="text-slate-500 block text-[10px] mt-1">วันที่ออกเอกสาร:</span>
              <span className="text-slate-700 text-[11px]">
                {formatThaiDateTime(booking.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Highlight Queue & Status Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              หมายเลขลำดับคิวประจำวัน
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#063466] mt-0.5 tracking-tight font-mono">
              {booking.queueNumber || 'รอจัดสรร'}
            </div>
            <span className="text-[10px] text-slate-500">จัดลำดับตามบริการและรอบเวลา</span>
          </div>

          <div className="flex flex-col justify-center sm:items-end">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              สถานะการนัดหมาย
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm border border-slate-300 bg-white">
              <span className={`w-2.5 h-2.5 rounded-full ${statusMeta.dotColor}`} />
              <span className="text-slate-900">{statusMeta.label}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 sm:text-right">
              {statusMeta.description}
            </span>
          </div>
        </div>

        {/* Appointment Information Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#063466] uppercase tracking-wider border-b border-slate-200 pb-1">
            รายละเอียดการนัดหมายและผู้รับบริการ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">บริการทันตกรรม:</span>
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {booking.serviceName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">ชื่อ - นามสกุล ผู้รับบริการ:</span>
              <span className="font-bold text-slate-900">
                {booking.patientName}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">วันที่นัดหมาย:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-[#D5A423] shrink-0" />
                {formatThaiDate(booking.date, true)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">หมายเลขโทรศัพท์:</span>
              <span className="font-mono font-medium text-slate-900">
                {formatPhone(booking.phone)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">ช่วงเวลานัดหมาย:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-[#D5A423] shrink-0" />
                {booking.timeSlotLabel}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">เลขบัตรประชาชน (เฉพาะ 4 หลักท้าย):</span>
              <span className="font-mono text-slate-700">
                •••• •••• ••• {booking.idCardLast4}
              </span>
            </div>
          </div>
        </div>

        {/* Service Location */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <MapPin className="w-4 h-4 text-[#063466] shrink-0" />
            สถานที่เข้ารับบริการ:
          </div>
          <p className="text-slate-700 pl-5.5 leading-relaxed">
            กลุ่มงานทันตสาธารณสุข ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์ ถนนรมย์บุรี ตำบลในเมือง อำเภอเมือง จังหวัดบุรีรัมย์ 31000
          </p>
        </div>

        {/* Pre-visit Instructions */}
        <div className="space-y-2 text-xs border-t border-slate-200 pt-4">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <AlertCircle className="w-4 h-4 text-[#D5A423] shrink-0" />
            คำแนะนำก่อนเข้ารับบริการ:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
            <li>กรุณาเดินทางมาถึงก่อนเวลานัดหมายอย่างน้อย 15 นาที เพื่อรับการตรวจคัดกรองเบื้องต้นและวัดสัญญาณชีพ</li>
            <li>นำบัตรประจำตัวประชาชนตัวจริงมาแสดงต่อเจ้าหน้าที่ ณ จุดลงทะเบียน</li>
            <li>หากท่านรับประทานยาประจำตัว โดยเฉพาะยาต้านการแข็งตัวของเลือด กรุณาแจ้งทันตแพทย์ก่อนรับการรักษา</li>
            <li>หากไม่สามารถมารับบริการตามนัดหมายได้ กรุณากดยกเลิกนัดผ่านระบบ เพื่อเปิดสิทธิ์ให้แก่ประชาชนท่านอื่น</li>
          </ol>
        </div>

        {/* Contact info & Official Prototype Disclaimer */}
        <div className="border-t border-slate-200 pt-4 space-y-2 text-[11px] text-slate-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              สายด่วนทันตกรรม: 044-602-XXX (ในวันและเวลาราชการ 08:30 - 16:30 น.)
            </span>
            <span className="text-slate-400 font-mono">
              REF: {booking.referenceCode}
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center text-amber-900 font-medium">
            * เอกสารต้นแบบ ไม่ใช่หลักฐานนัดหมายจากหน่วยงานจริง (Prototype Demonstration Only)
          </div>
        </div>
      </div>
    </div>
  );
}
