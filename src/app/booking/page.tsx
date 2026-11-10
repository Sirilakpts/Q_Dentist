import { Suspense } from 'react';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'จองคิวทันตกรรมออนไลน์ | เทศบาลนครบุรีรัมย์',
  description: 'แบบฟอร์มจองคิวบริการทันตกรรม ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์',
};

export default function BookingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#063466]/10 text-[#063466] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#D5A423]" />
          ระบบจองคิวออนไลน์ ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#063466]">
          จองคิวรับบริการทันตกรรม
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          สะดวกรวดเร็ว นัดหมายล่วงหน้า เลือกวันและช่วงเวลาที่สะดวกได้ด้วยตนเอง
        </p>
      </div>

      {/* Main Stepper Wizard */}
      <Suspense
        fallback={
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-[#063466] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">กำลังโหลดระบบจองคิว...</p>
          </div>
        }
      >
        <BookingWizard />
      </Suspense>
    </div>
  );
}
