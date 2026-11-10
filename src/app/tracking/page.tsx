'use client';

import { Suspense, useState, useEffect, useId } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Booking, BookingStatus } from '@/types/booking';
import {
  getBookings,
  cancelBooking,
  formatThaiDate,
  getStatusMeta,
} from '@/lib/booking';
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  Check,
  Building2,
  Lock,
} from 'lucide-react';

function maskPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-XXX-${clean.slice(6)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 2)}-XXX-${clean.slice(5)}`;
  }
  return phone;
}

function maskPatientName(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    const lastName = parts.slice(1).join(' ');
    const maskedLast = lastName.length > 2 ? `${lastName.slice(0, 2)}***` : '***';
    return `${parts[0]} ${maskedLast}`;
  }
  return name;
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || searchParams.get('query') || '';

  // Form states
  const [refInput, setRefInput] = useState<string>(initialRef);
  const [verifyInput, setVerifyInput] = useState<string>('');
  const [matchedBookings, setMatchedBookings] = useState<Booking[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cancellation modal state
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Form input element IDs for accessibility
  const refInputId = useId();
  const verifyInputId = useId();
  const cancelReasonInputId = useId();

  // Search logic requiring Reference Code + Verification detail (Phone or ID card last 4)
  const handleSearch = (customRef?: string, customVerify?: string) => {
    const targetRef = (customRef !== undefined ? customRef : refInput).trim().toUpperCase();
    const targetVerify = (customVerify !== undefined ? customVerify : verifyInput).trim();

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!targetRef) {
      setErrorMsg('กรุณากรอกรหัสอ้างอิงการจอง เช่น BR-1001');
      return;
    }

    if (!targetVerify) {
      setErrorMsg('กรุณากรอกข้อมูลยืนยันตัวตน (เบอร์โทรศัพท์ที่ใช้จอง หรือเลขบัตร ปชช. 4 หลักท้าย)');
      return;
    }

    const cleanVerify = targetVerify.replace(/[^0-9]/g, '');
    const allBookings = getBookings();

    const results = allBookings.filter((b) => {
      // 1. Match reference code
      if (b.referenceCode.toUpperCase() !== targetRef) {
        return false;
      }

      // 2. Match confirmation data (phone or last 4 digits of ID card)
      const cleanPhone = b.phone.replace(/[^0-9]/g, '');
      const matchPhone = cleanVerify.length >= 4 && cleanPhone.endsWith(cleanVerify);
      const matchId4 = b.idCardLast4 === cleanVerify;

      return matchPhone || matchId4;
    });

    setMatchedBookings(results);
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialRef) {
      // If ref passed in URL, set it and let user enter phone/ID to verify
      setRefInput(initialRef);
    }
  }, [initialRef]);

  // Handle Cancel action via existing booking logic
  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    const res = cancelBooking(bookingToCancel.referenceCode, cancelReason.trim());
    setIsCancelling(false);

    if (!res.success) {
      setErrorMsg(res.error || 'ไม่สามารถยกเลิกการจองได้');
      setBookingToCancel(null);
      return;
    }

    setSuccessMsg(`ยกเลิกรายการจองรหัส ${bookingToCancel.referenceCode} สำเร็จแล้ว สิทธิ์ช่วงเวลาดังกล่าวได้ถูกคืนสู่ระบบ`);
    setBookingToCancel(null);
    setCancelReason('');

    // Refresh matching list
    handleSearch(refInput, verifyInput);
  };

  // Helper to render Status Badge with Icon + Label
  const renderStatusBadge = (status: BookingStatus) => {
    const meta = getStatusMeta(status);
    let IconComponent = Clock;
    if (status === 'confirmed') IconComponent = CheckCircle2;
    if (status === 'checked_in') IconComponent = CheckCircle2;
    if (status === 'completed') IconComponent = Check;
    if (status === 'cancelled') IconComponent = XCircle;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
      >
        <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{meta.label}</span>
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Demo & Privacy Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-semibold">
            ระบบต้นแบบบริการประชาชน (Demo Mode)
          </p>
          <p className="text-amber-800">
            เพื่อปกป้องความเป็นส่วนตัว ระบบกำหนดให้ระบุรหัสอ้างอิงคู่กับข้อมูลยืนยันตัวตน (เบอร์โทรศัพท์หรือเลขบัตร 4 หลักท้าย) ข้อมูลจะถูกจัดเก็บในเครื่องเบราว์เซอร์เท่านั้น และยังไม่ใช่ระบบพิสูจน์ตัวตนขั้นสูงสำหรับใช้งานจริง
          </p>
        </div>
      </div>

      {/* Page Heading */}
      <div className="text-center space-y-1.5 pb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#063466]">
          ตรวจสอบสถานะและจัดการคิวทันตกรรม
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          ตรวจสอบความถูกต้องของวันเวลานัดหมาย พิมพ์ใบนัดหมาย หรือขอยกเลิกคิวตรวจรักษา
        </p>
      </div>

      {/* Search & Verification Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Reference Code Input */}
            <div className="space-y-1.5">
              <label
                htmlFor={refInputId}
                className="block text-xs sm:text-sm font-semibold text-slate-800"
              >
                1. รหัสอ้างอิงการจอง <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id={refInputId}
                  type="text"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="เช่น BR-1001"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#063466] focus:border-[#063466] text-sm uppercase font-mono font-bold text-slate-800 bg-[#F5F7FA] focus:bg-white transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                ระบุรหัส 7 หลักที่ได้รับตอนบันทึกการจอง
              </span>
            </div>

            {/* 2. Verification Info Input */}
            <div className="space-y-1.5">
              <label
                htmlFor={verifyInputId}
                className="block text-xs sm:text-sm font-semibold text-slate-800"
              >
                2. เบอร์โทร หรือเลขบัตร 4 หลักท้าย <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id={verifyInputId}
                  type="text"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="เช่น 0812345678 หรือ 1234"
                  maxLength={10}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#063466] focus:border-[#063466] text-sm font-mono text-slate-800 bg-[#F5F7FA] focus:bg-white transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                เพื่อยืนยันว่าท่านเป็นเจ้าของข้อมูลการจอง
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-[#063466] hover:bg-[#082E57] active:scale-[0.99] text-white font-semibold text-sm sm:text-base transition-colors shadow-sm"
            >
              <Search className="w-4 h-4 text-[#D5A423] icon-interactive icon-scale" />
              <span>ตรวจสอบข้อมูลคิวทันตกรรม</span>
            </button>
          </div>
        </form>

        {/* Demo Test Quick Fill Chips */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-600">ตัวอย่างข้อมูลจำลองเพื่อการทดสอบ:</span>
            {[
              { label: 'BR-1001 (เบอร์ 0812345678)', ref: 'BR-1001', verify: '0812345678' },
              { label: 'BR-1002 (บัตร 5678)', ref: 'BR-1002', verify: '5678' },
              { label: 'BR-1003 (เบอร์ 0861112233)', ref: 'BR-1003', verify: '0861112233' },
            ].map((sample) => (
              <button
                key={sample.ref}
                type="button"
                onClick={() => {
                  setRefInput(sample.ref);
                  setVerifyInput(sample.verify);
                  handleSearch(sample.ref, sample.verify);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#063466] hover:text-white text-slate-700 font-mono text-[11px] transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold">ไม่สามารถค้นหาข้อมูลได้</div>
            <div className="text-xs text-rose-800">{errorMsg}</div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold">ดำเนินการสำเร็จ</div>
            <div className="text-xs text-emerald-800">{successMsg}</div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1">
            <span>
              ผลการค้นหา: พบข้อมูลที่ตรงกัน <strong>{matchedBookings.length}</strong> รายการ
            </span>
            {matchedBookings.length > 0 && (
              <button
                type="button"
                onClick={() => handleSearch()}
                className="inline-flex items-center gap-1.5 text-xs text-[#063466] hover:underline font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                รีเฟรชข้อมูล
              </button>
            )}
          </div>

          {/* Not Found State */}
          {matchedBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  ไม่พบข้อมูลการจองที่ตรงกับรหัสและข้อมูลยืนยัน
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  โปรดตรวจสอบความถูกต้องของรหัสอ้างอิง และหมายเลขโทรศัพท์หรือเลขบัตรประชาชน 4 หลักท้ายที่ใช้ทำการจองอีกครั้ง
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRefInput('');
                    setVerifyInput('');
                    setHasSearched(false);
                    setErrorMsg(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ล้างข้อมูลค้นหา
                </button>
                <Link
                  href="/booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-[#063466] hover:bg-[#082E57] text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  <CalendarPlus className="w-4 h-4 text-[#D5A423]" />
                  จองคิวทันตกรรมใหม่
                </Link>
              </div>
            </div>
          ) : (
            /* Matched Booking Cards */
            <div className="space-y-4">
              {matchedBookings.map((booking) => {
                const statusMeta = getStatusMeta(booking.status);
                // According to original rules: only pending and confirmed can be cancelled
                const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5 transition-all hover:border-[#063466]/40"
                  >
                    {/* Top Row: Ref & Queue Number & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 text-[#063466] font-black text-lg font-mono">
                          {booking.queueNumber}
                        </div>
                        <div>
                          <div className="text-[11px] text-slate-500">รหัสอ้างอิงการจอง</div>
                          <div className="font-mono text-sm sm:text-base font-bold text-slate-800">
                            {booking.referenceCode}
                          </div>
                        </div>
                      </div>

                      <div>{renderStatusBadge(booking.status)}</div>
                    </div>

                    {/* Service, Date, Time & Location Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          บริการทันตกรรม:
                        </span>
                        <div className="font-bold text-[#063466] text-sm sm:text-base">
                          {booking.serviceName}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          วันและเวลานัดหมาย:
                        </span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#063466] shrink-0" />
                          <span>{formatThaiDate(booking.date)}</span>
                        </div>
                        <div className="text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-4 h-4 text-[#D5A423] shrink-0" />
                          <span>{booking.timeSlotLabel}</span>
                        </div>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          สถานที่รับบริการ:
                        </span>
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <MapPin className="w-4 h-4 text-[#063466] shrink-0 mt-0.5" />
                          <span>
                            กลุ่มงานทันตสาธารณสุข ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์ (ถนนรมย์บุรี)
                          </span>
                        </div>
                      </div>

                      {/* Patient & Masked Info for Privacy */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          ผู้รับบริการ:
                        </span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{maskPatientName(booking.patientName)}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          เบอร์โทรศัพท์ (ปกปิด):
                        </span>
                        <div className="font-mono text-slate-700 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{maskPhone(booking.phone)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status note description */}
                    <div className="p-3 rounded-xl bg-[#F5F7FA] border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2">
                      <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700">คำอธิบายสถานะ: </span>
                        <span>{statusMeta.description}</span>
                      </div>
                    </div>

                    {/* Cancellation reason if already cancelled */}
                    {booking.status === 'cancelled' && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-0.5">
                        <span className="font-bold text-rose-950">บันทึกการยกเลิก:</span>
                        <p>{booking.cancelReason || 'ผู้รับบริการหรือเจ้าหน้าที่ได้ยกเลิกคิวนี้เรียบร้อยแล้ว'}</p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <Link
                        href={`/booking/success?ref=${booking.referenceCode}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#063466] text-[#063466] hover:bg-[#063466] hover:text-white font-semibold text-xs sm:text-sm transition-colors min-h-[48px]"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>ดู / พิมพ์ใบนัดหมายรับบริการ</span>
                      </Link>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setBookingToCancel(booking)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs sm:text-sm transition-colors min-h-[48px]"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>ขอยกเลิกการจองคิวนี้</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  ยืนยันการยกเลิกคิวทันตกรรม?
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  รหัสอ้างอิง: <strong>{bookingToCancel.referenceCode}</strong> ({bookingToCancel.queueNumber})
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div><strong>บริการ:</strong> {bookingToCancel.serviceName}</div>
              <div><strong>วันเวลา:</strong> {formatThaiDate(bookingToCancel.date)} ({bookingToCancel.timeSlotLabel})</div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              เมื่อท่านยืนยันการยกเลิก ระบบจะคืนสิทธิ์ช่วงเวลาดังกล่าวให้ประชาชนท่านอื่น หากต้องการรับบริการในภายหลัง ท่านจำเป็นต้องทำรายการจองใหม่อีกครั้ง
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor={cancelReasonInputId}
                className="block text-xs font-semibold text-slate-700"
              >
                เหตุผลในการยกเลิก (ระบุหรือไม่ก็ได้):
              </label>
              <input
                id={cancelReasonInputId}
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="เช่น ติดภารกิจด่วน, อาการดีขึ้นแล้ว, ขอเลื่อนนัด..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#063466] bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setBookingToCancel(null);
                  setCancelReason('');
                }}
                disabled={isCancelling}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 min-h-[44px] transition-colors"
              >
                ไม่ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold min-h-[48px] shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isCancelling ? 'กำลังดำเนินการ...' : 'ยืนยันการยกเลิกคิว'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8 sm:py-12 px-4 sm:px-6">
      <Suspense
        fallback={
          <div className="max-w-md mx-auto text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-8 h-8 border-3 border-[#063466] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">กำลังโหลดหน้าค้นหาคิว...</p>
          </div>
        }
      >
        <TrackingContent />
      </Suspense>
    </div>
  );
}
