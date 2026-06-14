import Link from "next/link";
import { BookingFlowShell } from "@/components/heritage/ui";
import { bookingSelection } from "@/lib/heritage-mock-data";

export default function BookingReviewPage() {
  return (
    <BookingFlowShell
      currentStep="review"
      title="Kiểm tra đơn hàng"
      description="Bước cuối cùng để rà lại bộ đồ, thời gian thuê, phương thức nhận đồ và các khoản thanh toán trước khi xác nhận booking."
    >
      <div className="grid gap-8 xl:grid-cols-12 xl:items-start">
        <div className="space-y-8 xl:col-span-7">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <h2 className="mb-6 border-b border-sand pb-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Trang phục đã chọn</h2>
            <div className="flex flex-col gap-6 sm:flex-row">
              <img alt={bookingSelection.garment.title} className="w-full rounded-lg border border-sand object-cover sm:w-40" src={bookingSelection.garment.detailImages[0]} />
              <div className="flex-1">
                <h3 className="font-display text-4xl text-ink">{bookingSelection.garment.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{bookingSelection.garment.category} • Lụa thêu tay phục dựng</p>
                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Size</span><span className="text-ink">{bookingSelection.garment.size}</span></div>
                  <div><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tình trạng</span><span className="text-ink">Lưu trữ tốt</span></div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-8 md:grid-cols-2">
            <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-sand pb-3">
                <span className="material-symbols-outlined text-stone-500">calendar_today</span>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Lịch thuê</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between"><span className="text-stone-500">Nhận đồ</span><span className="font-medium text-ink">14/09/2024</span></div>
                <div className="flex items-center justify-between"><span className="text-stone-500">Trả đồ</span><span className="font-medium text-ink">16/09/2024</span></div>
                <div className="flex items-center justify-between border-t border-sand pt-4"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Thời lượng</span><span className="font-semibold text-lotus">{bookingSelection.duration}</span></div>
              </div>
            </section>

            <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-sand pb-3">
                <span className="material-symbols-outlined text-stone-500">local_shipping</span>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Vận chuyển</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Phương thức</span><span className="font-medium text-ink">Nhận tại atelier & hoàn trả tại cửa hàng</span></div>
                <div><span className="block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Địa điểm</span><span className="leading-7 text-stone-600">123 Silk Road, Quận 1<br />TP. Hồ Chí Minh</span></div>
              </div>
            </section>
          </div>
        </div>

        <aside className="xl:col-span-5 xl:sticky xl:top-28">
          <section className="rounded-xl border border-sand bg-white p-8 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
            <h2 className="border-b border-sand pb-4 font-display text-3xl text-ink">Tóm tắt thanh toán</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-stone-500">Tiền thuê (3 ngày)</span><span className="text-ink">{bookingSelection.rentalFee}</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-500">Làm sạch chuyên biệt</span><span className="font-medium text-jade">Đã bao gồm</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-500">Tư vấn phối đồ</span><span className="font-medium text-jade">Đã bao gồm</span></div>
            </div>

            <div className="mt-8 rounded-lg border border-antique/40 bg-antique/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1 text-sm font-semibold text-bronze"><span className="material-symbols-outlined text-[16px]">security</span>Tiền cọc bảo đảm</span>
                <span className="font-medium text-bronze">{bookingSelection.deposit}</span>
              </div>
              <p className="mt-2 text-xs leading-6 text-bronze">Hoàn lại sau khi nhân viên kiểm tra đạt yêu cầu ở bước hậu kiểm.</p>
            </div>

            <div className="mt-8 border-t border-sand pt-6">
              <div className="mb-2 flex items-end justify-between gap-4"><span className="text-lg text-ink">Tổng thanh toán</span><span className="font-display text-4xl text-lotus">{bookingSelection.grandTotal}</span></div>
              <p className="text-right text-xs text-stone-500">Gồm tiền thuê và tiền cọc hoàn lại</p>
            </div>

            <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm leading-7 text-stone-600">
              <input className="mt-1 h-5 w-5 rounded border-sand text-lotus focus:ring-lotus" type="checkbox" defaultChecked />
              <span>Tôi đã đọc chính sách nghi lễ và đồng ý giữ gìn trang phục như một tài sản văn hóa trong suốt thời gian thuê.</span>
            </label>

            <Link href="/booking/success" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood">
              Xác nhận đặt lịch
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </section>
        </aside>
      </div>
    </BookingFlowShell>
  );
}
