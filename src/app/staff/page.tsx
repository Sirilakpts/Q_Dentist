'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  CheckCheck,
  XCircle,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  AlertTriangle,
  X,
  Phone,
  User,
  ArrowLeft,
  Info,
  CalendarCheck2,
  Inbox,
  ShieldAlert
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types/booking';
import {
  getBookings,
  updateBookingStatus,
  formatThaiDate,
  formatShortThaiDate,
  formatThaiDateTime,
  formatPhone,
  getStatusMeta
} from '@/lib/booking';
import { getTodayDateString } from '@/data/mock';

export default function StaffDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter & Search states for today's list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals state
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [statusModalBooking, setStatusModalBooking] = useState<Booking | null>(null);
  const [targetStatus, setTargetStatus] = useState<BookingStatus>('confirmed');
  const [cancelReasonInput, setCancelReasonInput] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Load bookings from localStorage
  const loadData = () => {
    setIsLoading(true);
    const data = getBookings();
    setBookings(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = useMemo(() => getTodayDateString(), []);

  // 1-4. Calculate live metrics from actual localStorage data for TODAY
  const todayBookings = useMemo(() => {
    return bookings.filter((b) => b.date === todayStr);
  }, [bookings, todayStr]);

  const metrics = useMemo(() => {
    return {
      totalToday: todayBookings.length,
      pending: todayBookings.filter((b) => b.status === 'pending').length,
      confirmed: todayBookings.filter((b) => b.status === 'confirmed').length,
      completed: todayBookings.filter((b) => b.status === 'completed' || b.status === 'checked_in').length,
    };
  }, [todayBookings]);

  // 5. Today's bookings sorted chronologically by time slot / start time
  const sortedTodayBookings = useMemo(() => {
    return [...todayBookings].sort((a, b) => {
      // Sort by timeSlotLabel or timeSlotId first, then by queueNumber
      const timeCompare = a.timeSlotLabel.localeCompare(b.timeSlotLabel);
      if (timeCompare !== 0) return timeCompare;
      return a.queueNumber.localeCompare(b.queueNumber);
    });
  }, [todayBookings]);

  // Filtered Today's bookings (search & status)
  const filteredTodayBookings = useMemo(() => {
    return sortedTodayBookings.filter((b) => {
      // Search filter (Ref code, Queue number, Patient name, Phone)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const refMatch = b.referenceCode.toLowerCase().includes(query);
        const nameMatch = b.patientName.toLowerCase().includes(query);
        const phoneMatch = b.phone.includes(query.replace(/[^0-9]/g, ''));
        const queueMatch = b.queueNumber.toLowerCase().includes(query);
        if (!refMatch && !nameMatch && !phoneMatch && !queueMatch) {
          return false;
        }
      }

      // Status filter
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'completed') {
          return b.status === 'completed' || b.status === 'checked_in';
        }
        return b.status === selectedStatusFilter;
      }

      return true;
    });
  }, [sortedTodayBookings, searchQuery, selectedStatusFilter]);

  // Handle open status change modal
  const handleOpenStatusModal = (booking: Booking, initialTargetStatus?: BookingStatus) => {
    setStatusModalBooking(booking);
    setTargetStatus(initialTargetStatus || booking.status);
    setCancelReasonInput(booking.cancelReason || '');
  };

  // Execute status change
  const handleConfirmStatusChange = () => {
    if (!statusModalBooking) return;

    const result = updateBookingStatus(
      statusModalBooking.referenceCode,
      targetStatus,
      targetStatus === 'cancelled' ? cancelReasonInput.trim() : undefined
    );

    if (result.success) {
      loadData();
      setActionSuccessMessage(`อัปเดตสถานะคิว ${statusModalBooking.queueNumber} (${statusModalBooking.referenceCode}) เป็น "${getStatusMeta(targetStatus).label}" สำเร็จ`);
      setTimeout(() => setActionSuccessMessage(null), 4000);

      if (viewingBooking && viewingBooking.referenceCode === statusModalBooking.referenceCode) {
        setViewingBooking({
          ...viewingBooking,
          status: targetStatus,
          cancelReason: targetStatus === 'cancelled' ? cancelReasonInput.trim() : viewingBooking.cancelReason,
          updatedAt: new Date().toISOString()
        });
      }

      setStatusModalBooking(null);
    }
  };

  // Helper: Status Badge with Icon + Text for Accessibility
  const renderStatusBadge = (status: BookingStatus) => {
    const meta = getStatusMeta(status);
    let IconComponent = Clock;
    if (status === 'confirmed') IconComponent = CheckCircle2;
    if (status === 'checked_in') IconComponent = UserCheck;
    if (status === 'completed') IconComponent = CheckCheck;
    if (status === 'cancelled') IconComponent = XCircle;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
      >
        <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{meta.label}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 pb-16">
      {/* 1. Demo Mode Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2.5 text-xs sm:text-sm text-amber-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>โหมดสาธิต (Demo Mode):</strong> ระบบ Dashboard เจ้าหน้าที่ ข้อมูลจำลองจากเบราว์เซอร์ (localStorage) ยังไม่มีระบบตรวจสอบสิทธิ์เจ้าหน้าที่จริง (No Authentication)
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-amber-900 hover:text-amber-700 font-medium shrink-0 underline text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            กลับสู่หน้าระบบประชาชน
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#063466] text-white">
                Staff Dashboard
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#063466]">
                แดชบอร์ดงานบริการทันตกรรม
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              กลุ่มงานทันตกรรม ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์ — ประจำวัน{formatThaiDate(todayStr, false)}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs min-h-[40px]"
              title="รีเฟรชข้อมูลล่าสุด"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="p-1 text-emerald-700 hover:text-emerald-950 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1-4. Summary Cards (4 รายการ) */}
        <section aria-labelledby="summary-cards-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="summary-cards-heading" className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#063466]" />
              สรุปจำนวนคิววันนี้ ({formatShortThaiDate(todayStr)})
            </h2>
            <span className="text-xs text-slate-500">คลิกที่การ์ดเพื่อกรองรายการ</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: จำนวนคิวทั้งหมดของวันนี้ */}
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('all')}
              className={`p-4 rounded-2xl border text-left transition-all bg-white hover:border-[#063466] shadow-sm ${
                selectedStatusFilter === 'all'
                  ? 'ring-2 ring-[#063466] border-[#063466]'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">จำนวนคิววันนี้ทั้งหมด</span>
                <span className="p-2 rounded-xl bg-blue-50 text-[#063466]">
                  <Calendar className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#063466]">
                  {metrics.totalToday}
                </span>
                <span className="text-xs text-slate-500">คิว</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">คิวที่นัดหมายทั้งหมดในวันนี้</p>
            </button>

            {/* Card 2: จำนวนคิวรอยืนยัน */}
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('pending')}
              className={`p-4 rounded-2xl border text-left transition-all bg-white hover:border-amber-400 shadow-sm ${
                selectedStatusFilter === 'pending'
                  ? 'ring-2 ring-amber-500 border-amber-500'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800">รอยืนยัน</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                  {metrics.pending}
                </span>
                <span className="text-xs text-slate-500">คิว</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">รอเจ้าหน้าที่ตรวจสอบคำขอ</p>
            </button>

            {/* Card 3: จำนวนคิวยืนยันแล้ว */}
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('confirmed')}
              className={`p-4 rounded-2xl border text-left transition-all bg-white hover:border-emerald-500 shadow-sm ${
                selectedStatusFilter === 'confirmed'
                  ? 'ring-2 ring-emerald-500 border-emerald-500'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">ยืนยันแล้ว</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  {metrics.confirmed}
                </span>
                <span className="text-xs text-slate-500">คิว</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">พร้อมรอรับบริการตามเวลานัด</p>
            </button>

            {/* Card 4: จำนวนคิวเสร็จสิ้น */}
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('completed')}
              className={`p-4 rounded-2xl border text-left transition-all bg-white hover:border-slate-400 shadow-sm ${
                selectedStatusFilter === 'completed'
                  ? 'ring-2 ring-slate-600 border-slate-600'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">เสร็จสิ้น</span>
                <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <CheckCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                  {metrics.completed}
                </span>
                <span className="text-xs text-slate-500">คิว</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">รับบริการเสร็จสิ้น/เช็คอินแล้ว</p>
            </button>
          </div>
        </section>

        {/* 5-6. รายการจองของวันนี้เรียงตามเวลา (อยู่ใต้การ์ดสรุป) */}
        <section aria-labelledby="today-bookings-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          {/* Section Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 id="today-bookings-heading" className="text-base sm:text-lg font-bold text-[#063466]">
                  รายการจองคิวประจำวันนี้ (เรียงตามรอบเวลา)
                </h2>
                <p className="text-xs text-slate-500">
                  แสดง {filteredTodayBookings.length} คิว (จากทั้งหมด {todayBookings.length} คิวของวันนี้)
                </p>
              </div>

              {/* Status filter tabs for quick toggle */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">กรองสถานะ:</span>
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'pending', label: 'รอยืนยัน' },
                  { id: 'confirmed', label: 'ยืนยันแล้ว' },
                  { id: 'completed', label: 'เสร็จสิ้น' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedStatusFilter(item.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedStatusFilter === item.id
                        ? 'bg-[#063466] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick search input within today's list */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาเลขอ้างอิง, ลำดับคิว, ชื่อผู้รับบริการ หรือเบอร์โทรศัพท์ของวันนี้..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#063466] focus:border-[#063466] bg-slate-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 8. Empty State: กรณีไม่มีการจองวันนี้ */}
          {todayBookings.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CalendarCheck2 className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                ไม่มีรายการจองคิวในวันนี้
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                ยังไม่มีผู้รับบริการจองคิวตรวจรักษาสำหรับวันที่ {formatThaiDate(todayStr, false)} หรืออาจเป็นวันหยุดทำการ
              </p>
            </div>
          ) : filteredTodayBookings.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <Inbox className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบคิวที่ตรงกับเงื่อนไขการค้นหา/กรอง</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatusFilter('all');
                }}
                className="text-xs text-[#063466] hover:underline font-medium"
              >
                ล้างคำค้นหาและแสดงคิววันนี้ทั้งหมด
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View: Sorted chronologically */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                      <th className="py-3 px-4 w-28">ลำดับคิว</th>
                      <th className="py-3 px-4 w-32">เลขอ้างอิง</th>
                      <th className="py-3 px-4">รอบเวลา</th>
                      <th className="py-3 px-4">บริการ</th>
                      <th className="py-3 px-4">ผู้รับบริการ</th>
                      <th className="py-3 px-4 w-44">สถานะ</th>
                      <th className="py-3 px-4 text-center w-36">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTodayBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Queue Number */}
                        <td className="py-3.5 px-4 font-bold text-base text-[#063466]">
                          {b.queueNumber}
                        </td>

                        {/* Reference Code */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                          {b.referenceCode}
                        </td>

                        {/* Time Slot (Sorted) */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#D5A423] shrink-0" />
                            <span>{b.timeSlotLabel}</span>
                          </div>
                        </td>

                        {/* Service */}
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {b.serviceName}
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{b.patientName}</div>
                          <div className="text-xs text-slate-500 font-mono">{formatPhone(b.phone)}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {renderStatusBadge(b.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingBooking(b)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#063466] hover:bg-slate-100 transition-colors"
                              title="ดูรายละเอียดคิว"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenStatusModal(b)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#063466] bg-slate-100 hover:bg-[#063466] hover:text-white transition-colors"
                            >
                              เปลี่ยนสถานะ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card / List View: Avoids horizontal scroll */}
              <div className="block md:hidden divide-y divide-slate-200">
                {filteredTodayBookings.map((b) => (
                  <div key={b.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
                    {/* Top Row: Queue, Ref & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-[#063466] bg-slate-100 px-2.5 py-0.5 rounded-md font-mono">
                          {b.queueNumber}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-600">
                          {b.referenceCode}
                        </span>
                      </div>
                      {renderStatusBadge(b.status)}
                    </div>

                    {/* Time & Service */}
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#063466] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D5A423] shrink-0" />
                        <span>{b.timeSlotLabel}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {b.serviceName}
                      </div>
                    </div>

                    {/* Patient Name & Phone */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">{b.patientName}</span>
                      </div>
                      <div className="font-mono text-slate-500">
                        {formatPhone(b.phone)}
                      </div>
                    </div>

                    {/* Mobile Action Buttons (min-height 48px) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setViewingBooking(b)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 min-h-[48px]"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>ดูรายละเอียด</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(b)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold rounded-xl bg-[#063466] text-white hover:bg-[#042345] min-h-[48px]"
                      >
                        <span>เปลี่ยนสถานะ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* MODAL 1: View Booking Details */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-[#063466] text-base">
                  รายละเอียดคิวทันตกรรม
                </h3>
                <p className="text-xs text-slate-500">
                  เลขอ้างอิง: <span className="font-mono font-bold text-slate-800">{viewingBooking.referenceCode}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingBooking(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium">ลำดับคิวตรวจ</span>
                  <div className="text-2xl font-black text-[#063466]">
                    {viewingBooking.queueNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium block mb-1">สถานะปัจจุบัน</span>
                  {renderStatusBadge(viewingBooking.status)}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-800 text-xs text-[#063466] uppercase tracking-wider">
                  ข้อมูลการนัดหมาย
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">บริการ:</span>
                    <span className="font-semibold text-slate-800">{viewingBooking.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">วันที่นัดหมาย:</span>
                    <span className="font-semibold">{formatThaiDate(viewingBooking.date)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">ช่วงเวลา:</span>
                    <span className="font-semibold">{viewingBooking.timeSlotLabel}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <h4 className="font-bold text-slate-800 text-xs text-[#063466] uppercase tracking-wider">
                  ข้อมูลผู้รับบริการ
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">ชื่อ - นามสกุล:</span>
                    <span className="font-semibold text-slate-800">{viewingBooking.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">เบอร์โทรศัพท์:</span>
                    <a
                      href={`tel:${viewingBooking.phone}`}
                      className="font-mono font-semibold text-[#063466] hover:underline"
                    >
                      {formatPhone(viewingBooking.phone)}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">เลขบัตร ปชช. (4 หลักท้าย):</span>
                    <span className="font-mono font-semibold">**** - **** - ** - {viewingBooking.idCardLast4}</span>
                  </div>
                </div>

                {viewingBooking.symptomNote && (
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-slate-700">
                    <span className="text-[11px] font-semibold text-amber-900 block">อาการเบื้องต้น / บันทึกเพิ่มเติม:</span>
                    <p className="text-xs mt-0.5">{viewingBooking.symptomNote}</p>
                  </div>
                )}

                {viewingBooking.cancelReason && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                    <span className="text-[11px] font-semibold text-rose-950 block">เหตุผลการยกเลิก:</span>
                    <p className="text-xs mt-0.5">{viewingBooking.cancelReason}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 space-y-0.5">
                <div>สร้างเมื่อ: {formatThaiDateTime(viewingBooking.createdAt)}</div>
                {viewingBooking.updatedAt && (
                  <div>แก้ไขสถานะล่าสุด: {formatThaiDateTime(viewingBooking.updatedAt)}</div>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 min-h-[44px]"
              >
                ปิด
              </button>

              <button
                type="button"
                onClick={() => {
                  const b = viewingBooking;
                  handleOpenStatusModal(b);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#063466] hover:bg-[#042345] text-white text-xs font-semibold min-h-[44px]"
              >
                เปลี่ยนสถานะคิวนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Status & Confirmation */}
      {statusModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#063466] text-base">
                  เปลี่ยนสถานะคิว {statusModalBooking.queueNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {statusModalBooking.patientName} ({statusModalBooking.referenceCode})
                </p>
              </div>
              <button
                onClick={() => setStatusModalBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เลือกสถานะใหม่:
                </label>
                <div className="space-y-2">
                  {(
                    [
                      { status: 'pending', label: 'รอเจ้าหน้าที่ยืนยัน', desc: 'ผู้รับบริการเพิ่งส่งคำขอจอง' },
                      { status: 'confirmed', label: 'ยืนยันนัดหมายแล้ว', desc: 'เจ้าหน้าที่ยืนยันคิวและเวลาตรวจ' },
                      { status: 'checked_in', label: 'เช็คอินเข้ารับบริการแล้ว', desc: 'ผู้รับบริการมาถึงจุดบริการแล้ว' },
                      { status: 'completed', label: 'รับบริการเสร็จสิ้น', desc: 'เสร็จสิ้นการตรวจรักษาเรียบร้อย' },
                      { status: 'cancelled', label: 'ยกเลิกการจอง', desc: 'ยกเลิกคิวนี้ออกจากระบบ' },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.status}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        targetStatus === item.status
                          ? item.status === 'cancelled'
                            ? 'border-rose-400 bg-rose-50/60 ring-1 ring-rose-400'
                            : 'border-[#063466] bg-blue-50/40 ring-1 ring-[#063466]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dashboardStatus"
                        value={item.status}
                        checked={targetStatus === item.status}
                        onChange={() => setTargetStatus(item.status)}
                        className="mt-0.5 text-[#063466] focus:ring-[#063466]"
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-800">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {targetStatus === 'cancelled' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-rose-50 border border-rose-200 animate-fade-in">
                  <label className="block text-xs font-bold text-rose-950">
                    ระบุเหตุผลการยกเลิก: <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    placeholder="เช่น ผู้ป่วยขอเลื่อนนัด, ไม่สามารถติดต่อได้, ไม่มาตามนัดหมาย..."
                    className="w-full p-2.5 text-xs rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  กรุณาตรวจสอบความถูกต้อง การเปลี่ยนสถานะจะมีผลทันทีในฐานข้อมูลจำลอง (Mock Data)
                </span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusModalBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 min-h-[44px]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={targetStatus === 'cancelled' && !cancelReasonInput.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white min-h-[48px] shadow-sm transition-colors ${
                  targetStatus === 'cancelled'
                    ? 'bg-rose-600 hover:bg-rose-700 disabled:opacity-50'
                    : 'bg-[#063466] hover:bg-[#042345]'
                }`}
              >
                ยืนยันการเปลี่ยนสถานะ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
