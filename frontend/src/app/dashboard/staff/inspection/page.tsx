import { StaffPortalShell } from "@/components/heritage/ui";
import { inspectionChecklist, inspectionPhotos } from "@/lib/heritage-mock-data";

export default function StaffInspectionPage() {
  return (
    <StaffPortalShell active="inspection" title="Kiểm tra trang phục hoàn trả" subtitle="Màn staff dùng để hậu kiểm, ghi chú hư hỏng và điều hướng bộ đồ sang giặt sấy hoặc bảo trì.">
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b border-sand pb-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Thông tin đơn thuê</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-stone-500">Mã đơn</span><span className="font-semibold text-ink">#ORD-892</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-500">Khách hàng</span><span className="font-medium text-ink">Phạm Minh Hoàng</span></div>
              <div className="flex items-center justify-between"><span className="text-stone-500">Ngày trả</span><span className="font-medium text-ink">16/09/2024</span></div>
            </div>
          </section>

          <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <img alt="Nhật Bình Hoàng Phái" className="h-40 w-28 rounded object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALOOLBuqsG6X4lPsFcrlHs0MBvgIcUkPQny3eHcgt-KvgCAFxkTcoimNA44q_BMG4kzCvsv6mnFXb2cvfF6ctEO0Bqsg_CwsMN1bKBqvZqo2eDUFkXeiSDyl-f5WpEWeOhvPYHpcLe7l4H4GGRPCXwsYlb67kccd93uSdFnTJCfNd0O5e85u-puGsWmXh4O-PsJ1qkUtDXx8_a6pi3oZLDaakRQykui5U0drF3G_iY-rqVBHvSHEgFaEBTixlPwXMTsmt_NnX2Z0lP" />
              <div>
                <h2 className="font-display text-3xl text-ink">Nhật Bình Hoàng Phái</h2>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Asset ID: NB-001</p>
                <span className="mt-3 inline-flex rounded-full bg-[#fff0ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink">Cỡ M</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-sand pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Checklist kiểm tra</h2>
              <span className="text-sm text-stone-500">0/4 hoàn tất</span>
            </div>
            <div className="space-y-4">
              {inspectionChecklist.map((item) => (
                <label key={item.title} className="flex cursor-pointer items-start gap-3">
                  <input className="mt-1 h-5 w-5 rounded border-sand text-antique focus:ring-antique" type="checkbox" />
                  <div>
                    <p className="font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-sm leading-7 text-stone-600">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <h2 className="mb-6 border-b border-sand pb-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Đánh giá tình trạng</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="cursor-pointer">
                <input className="peer sr-only" defaultChecked name="status" type="radio" />
                <div className="rounded-lg border border-sand bg-[#f9fff8] p-4 text-center transition peer-checked:border-jade">
                  <span className="material-symbols-outlined text-3xl text-jade">check_circle</span>
                  <h3 className="mt-2 font-semibold text-ink">Không vấn đề</h3>
                  <p className="mt-1 text-sm text-stone-600">Sẵn sàng cho làm sạch tiêu chuẩn</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input className="peer sr-only" name="status" type="radio" />
                <div className="rounded-lg border border-sand bg-[#fff8f2] p-4 text-center transition peer-checked:border-orange-600">
                  <span className="material-symbols-outlined text-3xl text-orange-700">build_circle</span>
                  <h3 className="mt-2 font-semibold text-ink">Mòn nhẹ</h3>
                  <p className="mt-1 text-sm text-stone-600">Cần vá nhỏ hoặc xử lý điểm bẩn</p>
                </div>
              </label>
              <label className="cursor-pointer">
                <input className="peer sr-only" name="status" type="radio" />
                <div className="rounded-lg border border-sand bg-[#fff4f4] p-4 text-center transition peer-checked:border-red-700">
                  <span className="material-symbols-outlined text-3xl text-red-700">error</span>
                  <h3 className="mt-2 font-semibold text-ink">Hư hỏng nặng</h3>
                  <p className="mt-1 text-sm text-stone-600">Cần chuyển phục hồi ngay</p>
                </div>
              </label>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-ink">Ghi chú chi tiết</label>
              <textarea className="h-32 w-full rounded-lg border border-sand bg-[#fff8f6] p-4 text-sm text-ink outline-none transition focus:border-antique" placeholder="Mô tả vị trí sờn, vết bẩn hoặc phụ kiện thiếu..." />
            </div>
          </section>

          <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-sand pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Bằng chứng hình ảnh</h2>
              <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-lotus transition hover:text-oxblood">
                <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                Thêm ảnh
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="overflow-hidden rounded-lg border border-sand bg-[#fff0ee]">
                <img alt="Ảnh kiểm tra" className="aspect-square w-full object-cover" src={inspectionPhotos[0]} />
              </div>
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-sand bg-[#fff8f6] text-stone-500 transition hover:border-antique hover:text-lotus">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  <span className="mt-2 text-xs font-semibold uppercase tracking-[0.16em]">Tải ảnh</span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm italic text-stone-500">Hệ thống yêu cầu ít nhất một ảnh nếu đánh dấu “Mòn nhẹ” hoặc “Hư hỏng nặng”.</p>
          </section>

          <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 rounded-xl border border-sand bg-white/95 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] backdrop-blur">
            <button type="button" className="rounded-lg border border-bronze px-5 py-3 text-sm font-semibold text-bronze transition hover:bg-[#fff0ee]">Chuyển giặt sấy</button>
            <button type="button" className="rounded-lg border border-orange-300 px-5 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50">Cần bảo trì</button>
            <button type="button" className="rounded-lg border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50">Ghi nhận hư hỏng</button>
            <button type="button" className="rounded-lg bg-jade px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest">Sẵn sàng cho thuê</button>
          </div>
        </div>
      </div>
    </StaffPortalShell>
  );
}
