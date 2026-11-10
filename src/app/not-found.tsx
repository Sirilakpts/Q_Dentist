import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#063466] flex items-center justify-center mx-auto">
        <FileQuestion className="w-7 h-7 text-[#D5A423]" />
      </div>
      <h1 className="text-2xl font-black text-[#063466]">ไม่พบหน้าที่ค้นหา</h1>
      <p className="text-xs sm:text-sm text-slate-500">
        ขออภัย หน้าเว็บที่ท่านเรียกอาจถูกย้าย หรือที่อยู่ URL ไม่ถูกต้อง
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#063466] text-[#D5A423] font-semibold text-xs sm:text-sm min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
