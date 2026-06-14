import Link from "next/link";
import { BookingFlowShell } from "@/components/heritage/ui";
import { bookingSelection, logisticsMethods } from "@/lib/heritage-mock-data";

export default function BookingLogisticsPage() {
  return (
    <BookingFlowShell
      currentStep="logistics"
      title="Phương thức vận chuyển"
      description="Xác nhận cách nhận đồ, địa điểm bàn giao và những ghi chú chăm sóc cần thiết trước khi chuyển sang bước kiểm tra đơn hàng."
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-8">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_40px_rgba(77,16,15,0.05)]">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-sand pb-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-3xl text-ink"><span className="material-symbols-outlined text-jade">check_circle</span>Đã xác nhận lịch</h2>
                <p className="mt-1 text-sm text-stone-600">Bộ đồ còn trống cho đúng khoảng thời gian bạn đã chọn.</p>
              </div>
              <span className="rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-jade">Có thể giữ lịch</span>
            </div>

            <div className="flex items-center gap-5">
              <img alt={bookingSelection.garment.title} className="h-24 w-20 rounded object-cover" src={bookingSelection.garment.detailImages[0]} />
              <div>
                <h3 className="text-lg font-semibold text-ink">{bookingSelection.garment.title}</h3>
                <p className="mt-1 text-sm text-stone-600">Thời gian thuê: <span className="font-medium text-ink">{bookingSelection.rentalDates}</span></p>
                <p className="text-sm text-stone-600">Kích thước: <span className="font-medium text-ink">Cỡ {bookingSelection.garment.size}</span></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-3xl text-lotus">Phương thức nhận đồ</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {logisticsMethods.map((item, index) => (
                <label key={item.key} className="cursor-pointer">
                  <input className="peer sr-only" defaultChecked={index === 0} name="delivery_method" type="radio" />
                  <div className="h-full rounded-xl border border-sand bg-white p-5 transition peer-checked:border-antique peer-checked:bg-[#fff0ee] hover:border-antique/60">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f9f5f0] text-bronze">
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <span className="material-symbols-outlined text-stone-300 peer-checked:text-antique">check_circle</span>
                    </div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-stone-600">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-sand bg-[#fff4ef] p-6">
            <h2 className="font-display text-3xl text-ink">Địa điểm nhận tại atelier</h2>
            <p className="mt-1 text-sm text-stone-600">Vui lòng đến trong khung giờ làm việc để thử và nhận bộ đồ.</p>

            <div className="mt-5 flex items-start gap-4 rounded-lg border border-sand bg-white p-4">
              <span className="material-symbols-outlined mt-1 text-antique">location_on</span>
              <div>
                <h3 className="font-semibold text-ink">Heritage Atelier</h3>
                <p className="mt-1 text-sm leading-7 text-stone-600">123 Silk Road, Quận 1<br />TP. Hồ Chí Minh, Việt Nam</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-bronze">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span>09:00 - 20:00</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call</span>+84 28 3822 0000</span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 border-t border-sand pt-8 sm:flex-row sm:justify-between">
            <Link href="/booking/date-selection" className="inline-flex items-center justify-center gap-2 rounded-lg border border-bronze px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-bronze transition hover:bg-[#fff0ee]">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại lịch thuê
            </Link>
            <Link href="/booking/review" className="inline-flex items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood">
              Sang bước kiểm tra đơn
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-xl border border-sand bg-white/90 p-6 shadow-[0_10px_40px_rgba(77,16,15,0.05)] backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lotus/10 text-lotus">
                <span className="material-symbols-outlined text-[18px]">diamond</span>
              </div>
              <h2 className="font-display text-2xl text-ink">Chăm sóc & tiền cọc</h2>
            </div>
            <ul className="space-y-3 text-sm leading-7 text-stone-600">
              <li className="flex gap-2"><span className="material-symbols-outlined text-antique">shield</span><span>Tiền cọc sẽ được áp vào bước xác nhận cuối cùng.</span></li>
              <li className="flex gap-2"><span className="material-symbols-outlined text-antique">dry_cleaning</span><span>Không tự giặt hoặc hấp sấy. Atelier phụ trách khâu làm sạch và phục hồi.</span></li>
              <li className="flex gap-2"><span className="material-symbols-outlined text-antique">policy</span><span>Hoàn cọc sau khi nhân viên kiểm tra tình trạng bộ đồ khi trả.</span></li>
            </ul>
          </section>

          <div className="overflow-hidden rounded-xl border border-sand">
            <img alt="Chi tiết atelier" className="h-52 w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOPhCFude7PxawmN0MrTwuX6n7HfCj-8AF07wIYz0444JqDsAkjZ46ZYI2sniylyFIUDlVdrMGCrjYPa9n8dtnizc0N-9gFF7LwBc4XzrHQOnDvl9xmNnMJrcfJNIn5jjsWnh49v_TQw7uU8UdBPjev2hWeAJNPzvW0Tza5Hw2O2fNCK4TV7sWQDX_qqjIJNrT3bG06P6sp7-NTPMYW-rD9ggrn4ATYE1PW_yqcPHIj6s3-dHPHQxPFC-EthJ9hX8vD7Ikb-DsivMG" />
          </div>
        </aside>
      </div>
    </BookingFlowShell>
  );
}
