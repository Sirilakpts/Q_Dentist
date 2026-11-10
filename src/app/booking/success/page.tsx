'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Booking } from '@/types/booking';
import { getBookings, getStatusMeta } from '@/lib/booking';
import { AppointmentSlip } from '@/components/booking/AppointmentSlip';
import { Alert } from '@/components/ui/Alert';
import { Clock, Search, CalendarPlus, Home, AlertCircle } from 'lucide-react';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!refCode) {
      setLoading(false);
      return;
    }

    const allBookings = getBookings();
    const found = allBookings.find(
      (b) => b.referenceCode.toUpperCase() === refCode.trim().toUpperCase()
    );

    if (found) {
      setBooking(found);
    }
    setLoading(false);
  }, [refCode]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 max-w-md mx-auto">
        <div className="w-8 h-8 border-3 border-[#063466] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">กำลังค้นหาข้อมูลใบนัดหมาย...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Alert type="warning" title="ไม่พบข้อมูลการจอง">
          ไม่พบรหัสอ้างอิงการจอง หรือข้อมูลอาจยังไม่ได้ถูกบันทึกในเบราว์เซอร์นี้
        </Alert>
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/booking"
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-[#063466] text-white font-semibold text-sm hover:bg-[#042345] transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            จองคิวใหม่
          </Link>
          <Link
            href="/"
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const statusMeta = getStatusMeta(booking.status);
  const isPending = booking.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in Print) */}
      <div className="text-center space-y-2 max-w-xl mx-auto no-print">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
          <Clock className="w-6 h-6 text-[#D5A423]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#063466]">
          {isPending ? 'บันทึกคำขอจองคิวเรียบร้อย' : 'ผลการนัดหมายรับบริการ'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {isPending
            ? 'สถานะ: รอเจ้าหน้าที่ตรวจสอบและยืนยันคิว กรุณาพิมพ์หรือบันทึกใบนัดหมายด้านล่าง'
            : statusMeta.description}
        </p>
      </div>

      {/* Official A4 Appointment Slip */}
      <AppointmentSlip booking={booking} />

      {/* Navigation Buttons (Hidden in Print) */}
      <div className="max-w-md mx-auto pt-2 flex flex-col sm:flex-row items-center gap-3 no-print">
        <Link
          href={`/tracking?query=${booking.referenceCode}`}
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-[#063466] hover:bg-[#042345] text-white font-medium text-xs sm:text-sm transition-colors shadow-2xs"
        >
          <Search className="w-4 h-4 text-[#D5A423]" />
          ตรวจสอบสถานะคิวนี้
        </Link>
        <Link
          href="/booking"
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors"
        >
          <CalendarPlus className="w-4 h-4" />
          จองคิวใหม่อีกครั้ง
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Suspense
        fallback={
          <div className="text-center py-16 text-slate-400">
            <div className="w-8 h-8 border-3 border-[#063466] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">กำลังโหลดข้อมูลใบนัดหมาย...</p>
          </div>
        }
      >
        <BookingSuccessContent />
      </Suspense>
    </div>
  );
}
