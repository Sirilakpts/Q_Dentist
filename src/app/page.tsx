import Link from 'next/link';
import { getServices } from '@/lib/booking';
import { ServiceCard } from '@/components/booking/ServiceCard';
import {
  Calendar,
  Search,
  MapPin,
  PhoneCall,
  Clock,
  FileText,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  HeartHandshake
} from 'lucide-react';

export default function HomePage() {
  const services = getServices();

  const steps = [
    {
      num: '1',
      title: 'เลือกบริการ',
      desc: 'ตรวจ ขูดหินปูน อุดฟัน หรือถอนฟัน',
    },
    {
      num: '2',
      title: 'เลือกวันและเวลา',
      desc: 'เลือกรอบคิวว่างล่วงหน้าที่สะดวก',
    },
    {
      num: '3',
      title: 'กรอกข้อมูลผู้จอง',
      desc: 'ระบุชื่อ เบอร์โทร และเลขบัตร 4 หลัก',
    },
    {
      num: '4',
      title: 'รับใบนัดหมาย',
      desc: 'รับรหัสคิวและหลักฐานสำหรับยื่นตรวจ',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* 1. Hero Section: 2 Columns on Desktop (Inspired by Cleargrin Dental Clinic layout) */}
      <section className="bg-white border-b border-slate-200 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Primary Actions */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9F4F1] border border-[#C8E5DD] text-[#063466] text-xs font-semibold cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-[#D5A423] icon-interactive icon-tilt" />
              <span>ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#063466] tracking-tight leading-[1.2]">
              ระบบจองคิวทันตกรรมออนไลน์
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#D5A423] mt-1.5">
                เทศบาลนครบุรีรัมย์
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              บริการดูแลสุขภาพช่องปากและฟันเพื่อประชาชน นัดหมายล่วงหน้า สะดวก รวดเร็ว 
              ลดเวลารอคอย ณ จุดบริการ พร้อมออกหลักฐานใบนัดหมายทันที
            </p>

            {/* Quick Benefits Checklist */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-700 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>จองคิวออนไลน์ 24 ชม.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>นัดล่วงหน้าได้ 14 วันทำการ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>พิมพ์ใบนัดหมายทางการ (A4)</span>
              </div>
            </div>

            {/* Action Buttons (Height >= 48px) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <Link
                href="/booking"
                className="group inline-flex items-center justify-center gap-2 px-8 min-h-[48px] rounded-xl bg-[#063466] hover:bg-[#042345] active:scale-98 text-white font-semibold text-base transition-colors shadow-2xs"
              >
                <Calendar className="w-5 h-5 text-[#D5A423] icon-interactive icon-tilt" />
                <span>จองคิวทันตกรรม</span>
              </Link>

              <Link
                href="/tracking"
                className="group inline-flex items-center justify-center gap-2 px-7 min-h-[48px] rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border-2 border-slate-300 transition-colors shadow-2xs"
              >
                <Search className="w-5 h-5 text-slate-500 icon-interactive icon-scale" />
                <span>ตรวจสอบคิว</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Clinic Card (Soft Mint Background & Friendly Graphics) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-[#E9F4F1] border border-[#C8E5DD] p-6 sm:p-8 shadow-sm overflow-hidden flex flex-col justify-between min-h-[340px]">
              {/* Subtle Decorative Background Rings */}
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/40 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-[#063466]/5 rounded-full blur-xl pointer-events-none" />

              {/* Card Top: Municipal Dental Seal */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#063466] text-[#D5A423] flex items-center justify-center shadow-xs">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M7 2C4.24 2 2 4.24 2 7c0 3.12 1.44 5.37 2.7 7.35C5.82 16.11 7 18 7 21a1 1 0 0 0 2 0c0-2.31-.83-3.61-1.78-5.1C6.18 14.28 5 12.44 5 10c0-1.65 1.35-3 3-3s3 1.35 3 3c0 .55.45 1 1 1s1-.45 1-1c0-1.65 1.35-3 3-3s3 1.35 3 3c0 2.44-1.18 4.28-2.22 5.9C15.83 17.39 15 18.69 15 21a1 1 0 0 0 2 0c0-3 1.18-4.89 2.3-6.65C20.56 12.37 22 10.12 22 7c0-2.76-2.24-5-5-5-2.21 0-4.08 1.44-4.73 3.44C11.62 3.44 9.75 2 7 2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#063466] uppercase tracking-wider block">
                    บริการประชาชน
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    งานทันตสาธารณสุข
                  </span>
                </div>
              </div>

              {/* Card Middle: Feature Summary */}
              <div className="relative z-10 py-6 space-y-3">
                <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-white/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#063466]">
                    <Clock className="w-4 h-4 text-[#D5A423]" />
                    <span>เวลาทำการตรวจรักษา</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    วันจันทร์ - ศุกร์ 08:30 - 16:30 น. (เว้นวันหยุดราชการ)
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-white/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#063466]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>4 ด้านบริการหลัก</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    ตรวจฟัน • ขูดหินปูน • อุดฟัน • ถอนฟัน โดยทันตแพทย์ผู้เชี่ยวชาญ
                  </p>
                </div>
              </div>

              {/* Card Footer: Disclaimer */}
              <div className="relative z-10 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 text-center">
                *ภาพประกอบจำลองระบบบริการสุขภาพช่องปาก เทศบาลนครบุรีรัมย์
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ขั้นตอนการจองคิว 4 ขั้นตอน: จัดระเบียบ สมดุล สวยงาม */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          <div className="text-center max-w-md mx-auto space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#063466] bg-[#E9F4F1] border border-[#C8E5DD] px-3 py-1 rounded-full inline-block mb-1">
              คำแนะนำการใช้งาน
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#063466]">
              ขั้นตอนการจองคิวง่าย ๆ 4 ขั้นตอน
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              สะดวกรวดเร็ว นัดหมายล่วงหน้าได้ด้วยตนเอง
            </p>
          </div>

          {/* Responsive Stepper Grid: Mobile 1 col, Tablet 2 cols, Desktop 4 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {steps.map((step) => (
              <div
                key={step.num}
                className="h-full p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-[#063466]/30 hover:bg-white text-center flex flex-col items-center justify-start transition-colors cursor-default"
              >
                {/* วงกลมหมายเลข 1–4 ชั้นเดียว ขนาด 44x44px พื้น #063466 ตัวเลขสีขาว 20px Semi-bold กึ่งกลางพอดี */}
                <div className="w-[44px] h-[44px] rounded-full bg-[#063466] text-white text-[20px] font-semibold flex items-center justify-center leading-none mb-4 shrink-0">
                  {step.num}
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. บริการทันตกรรม 4 ประเภทเป็น Compact Cards (ทั้ง Card คลิกได้) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#063466] bg-[#E9F4F1] border border-[#C8E5DD] px-2.5 py-0.5 rounded-full inline-block mb-1">
            งานบริการทันตกรรม
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#063466]">
            บริการทันตกรรม 4 ด้านหลัก
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            คลิกที่การ์ดบริการที่ต้องการเพื่อตรวจสอบตารางเวลาว่างและเข้าสู่การจองคิวทันที
          </p>
        </div>

        {/* 4 Compact Cards Grid: 1 col mobile, 2 col tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              actionHref={`/booking?service=${service.id}`}
              actionLabel="เลือกจองคิวนี้"
              showPreparation={false}
            />
          ))}
        </div>
      </section>

      {/* 4. ข้อมูลสำคัญและการติดต่อ (Contact & Location Info) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="border-b border-slate-200 pb-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#063466] bg-[#E9F4F1] border border-[#C8E5DD] px-2.5 py-0.5 rounded-full inline-block mb-1">
            ข้อมูลสำคัญ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#063466]">
            จุดบริการและเวลาทำการ
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Box 1: Location & Opening Hours */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-slate-300 transition-colors shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#063466] shrink-0 icon-interactive icon-bounce" />
              สถานที่รับบริการ
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              กลุ่มงานทันตสาธารณสุข ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์
              ถนนรมย์บุรี ตำบลในเมือง อำเภอเมือง จังหวัดบุรีรัมย์ 31000
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 pt-2 border-t border-slate-100">
              <Clock className="w-4 h-4 text-[#D5A423] shrink-0 icon-interactive icon-rotate-subtle" />
              <span>วันจันทร์ - ศุกร์ 08:30 - 16:30 น. (เว้นวันหยุดราชการ)</span>
            </div>
          </div>

          {/* Box 2: Preparation & Emergency Contact */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-slate-300 transition-colors shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#063466] shrink-0 icon-interactive icon-bounce" />
              เอกสารและคำแนะนำในวันรับบริการ
            </h3>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>นำบัตรประจำตัวประชาชนตัวจริงมาแสดง ณ จุดบริการ</li>
              <li>กรุณาเดินทางมาถึงก่อนเวลานัดหมายอย่างน้อย 15 นาที</li>
              <li>หากมีโรคประจำตัวหรือประวัติแพ้ยา กรุณาแจ้งทันตแพทย์ก่อนรับการรักษา</li>
            </ul>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 pt-2 border-t border-slate-100">
              <PhoneCall className="w-4 h-4 text-[#D5A423] shrink-0 icon-interactive icon-tilt" />
              <span>สายด่วนทันตกรรม: 044-602-XXX (จำลอง)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
