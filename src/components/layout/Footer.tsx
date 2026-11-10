import Link from 'next/link';
import { HeartHandshake, MapPin, PhoneCall, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 text-xs no-print">
      {/* Decorative Top Accent line in Municipality Gold */}
      <div className="h-0.5 bg-[#D5A423] w-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#063466] text-[#D5A423] flex items-center justify-center font-bold text-xs">
                ทน
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                งานทันตสาธารณสุข เทศบาลนครบุรีรัมย์
              </h4>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์ ให้บริการตรวจสุขภาพช่องปาก อุดฟัน ถอนฟัน และขูดหินปูน มุ่งเน้นบริการรวดเร็ว ปลอดภัย ได้มาตรฐาน
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-[#063466]">
              ข้อมูลการติดต่อ & สถานที่
            </h5>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D5A423] shrink-0 mt-0.5" />
                <span>ถนนรมย์บุรี ตำบลในเมือง อำเภอเมือง จังหวัดบุรีรัมย์ 31000</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#D5A423] shrink-0" />
                <span>โทรศัพท์: 044-602-XXX (จำลอง)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D5A423] shrink-0" />
                <span>วันจันทร์ - ศุกร์ 08:30 - 16:30 น. (เว้นวันหยุดราชการ)</span>
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-[#063466]">
              ระบบบริการประชาชน
            </h5>
            <div className="flex flex-col gap-1.5 text-slate-600 font-medium">
              <Link href="/" className="hover:text-[#063466] hover:underline">
                หน้าแรกระบบ
              </Link>
              <Link href="/booking" className="hover:text-[#063466] hover:underline">
                จองคิวทันตกรรมออนไลน์
              </Link>
              <Link href="/tracking" className="hover:text-[#063466] hover:underline">
                ตรวจสอบสถานะ / ใบนัดหมาย
              </Link>
              <Link href="/staff" className="hover:text-[#063466] hover:underline text-slate-400">
                เข้าสู่ระบบเจ้าหน้าที่
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
          <p>© 2569 งานทันตสาธารณสุข เทศบาลนครบุรีรัมย์ — ระบบต้นแบบจำลองบริการประชาชน</p>
          <p className="flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-[#D5A423]" /> เพื่อรอยยิ้มสุขภาพดีของชาวบุรีรัมย์
          </p>
        </div>
      </div>
    </footer>
  );
}
