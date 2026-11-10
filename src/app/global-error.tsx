'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4 text-slate-800">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#063466]">เกิดข้อผิดพลาดในการโหลดระบบ</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ระบบไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-[#063466] text-white text-sm font-semibold min-h-[48px]"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </body>
    </html>
  );
}
