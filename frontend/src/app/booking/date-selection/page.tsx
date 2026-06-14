import Link from "next/link";
import { BookingFlowShell } from "@/components/heritage/ui";
import { bookingSelection } from "@/lib/heritage-mock-data";

const days = [
  "", "", "1", "2", "3", "4", "5",
  "6", "7", "8", "9", "10", "11", "12",
  "13", "14", "15", "16", "17", "18", "19",
  "20", "21", "22", "23", "24", "25", "26",
  "27", "28", "29", "30", "", "", "",
];

export default function BookingDateSelectionPage() {
  return (
    <BookingFlowShell
      currentStep="schedule"
      title="Chọn ngày thuê"
      description="Chọn khoảng thời gian phù hợp cho sự kiện của bạn. Luồng giao diện được dựng trước để mô phỏng lịch thuê, giá tạm tính và các điều kiện giữ lịch theo đúng mockup."
    >
      <div className="grid gap-8 xl:grid-cols-12">
        <section className="xl:col-span-5">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-sand bg-white shadow-[0_10px_40px_rgba(77,16,15,0.05)]">
            <img alt={bookingSelection.garment.title} className="aspect-[4/5] w-full object-cover" src={bookingSelection.garment.detailImages[0]} />
            <div className="flex flex-1 flex-col p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lotus">Cung đình</span>
              <h2 className="mt-2 font-display text-4xl text-ink">{bookingSelection.garment.title}</h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">Lụa thêu thủ công, chuẩn bị kỹ trước ngày nhận đồ và có quy trình giữ cọc riêng cho tài sản phục dựng.</p>

              <dl className="mt-auto space-y-4 border-t border-sand pt-6 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-stone-500">Đơn giá cơ bản</dt>
                  <dd className="font-medium text-ink">{bookingSelection.garment.dailyPrice}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-stone-500">Tiền cọc bắt buộc</dt>
                  <dd className="font-medium text-ink">{bookingSelection.deposit}</dd>
                </div>
                <div className="flex items-start gap-3 border-t border-sand pt-4 text-xs text-stone-500">
                  <span className="material-symbols-outlined text-jade">verified_user</span>
                  <p>Cọc được hoàn sau khi nhân viên kiểm tra tình trạng bộ đồ và phụ kiện đi kèm.</p>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="space-y-8 xl:col-span-7">
          <div className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_40px_rgba(77,16,15,0.05)] sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl text-lotus">Tháng 09 / 2024</h2>
              <div className="flex gap-2">
                <button type="button" className="rounded-full border border-sand p-2 text-stone-600 transition hover:bg-[#fff0ee]">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button type="button" className="rounded-full border border-sand p-2 text-stone-600 transition hover:bg-[#fff0ee]">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((label) => <div key={label} className="py-2">{label}</div>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
              {days.map((day, index) => {
                const selected = day === '14' || day === '16';
                const inRange = day === '15';
                const disabled = ['1', '2', '3', '4', '5', '17', '18', '19', ''].includes(day);
                return (
                  <div
                    key={`${day}-${index}`}
                    className={selected
                      ? "flex aspect-square items-center justify-center rounded-full bg-lotus font-semibold text-white"
                      : inRange
                        ? "flex aspect-square items-center justify-center rounded-full bg-[#ffe9e6] text-ink"
                        : disabled
                          ? "flex aspect-square items-center justify-center rounded-full text-stone-300 line-through"
                          : "flex aspect-square items-center justify-center rounded-full text-ink transition hover:bg-[#fff0ee]"}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-sand pt-6 text-sm text-stone-600">
              <div className="flex flex-wrap gap-4">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-sand bg-white" />Trống</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-lotus" />Đã chọn</span>
              </div>
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Tối thiểu 3 ngày thuê
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_40px_rgba(77,16,15,0.05)] sm:p-8">
            <h3 className="font-display text-3xl text-ink">Tóm tắt chi phí</h3>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-stone-500">Khoảng ngày</span><span className="font-medium text-ink">{bookingSelection.rentalDates} ({bookingSelection.duration})</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-500">Tiền thuê</span><span className="font-medium text-ink">{bookingSelection.rentalFee}</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-500">Làm sạch & chuẩn bị</span><span className="font-medium text-ink">{bookingSelection.serviceFee}</span></div>
              <div className="flex items-end justify-between border-t border-sand pt-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tạm thanh toán hôm nay</p><p className="text-xs text-stone-500">Chưa bao gồm cọc</p></div><span className="font-display text-4xl text-lotus">{bookingSelection.totalToday}</span></div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/catalog/nhat-binh-hoang-phai" className="inline-flex flex-1 items-center justify-center rounded-lg border border-bronze px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-bronze transition hover:bg-[#fff0ee]">
                Quay lại chi tiết
              </Link>
              <Link href="/booking/logistics" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood">
                Sang bước vận chuyển
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </BookingFlowShell>
  );
}
