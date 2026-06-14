import Link from "next/link";
import { StaffPortalShell } from "@/components/heritage/ui";
import { lifecycleCards, pendingRequests, staffScheduleRows, staffStats } from "@/lib/heritage-mock-data";

export default function StaffDashboardPage() {
  return (
    <StaffPortalShell active="overview" title="Tổng quan vận hành" subtitle="Theo dõi giao nhận, đơn chờ xác nhận và vòng đời tài sản trong ngày.">
      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {staffStats.map((item) => (
          <section key={item.label} className="overflow-hidden rounded-xl border border-sand bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{item.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="font-display text-5xl text-ink">{item.value}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${item.accent}`}>{item.note}</span>
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-xl border border-sand bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between border-b border-sand bg-[#fff8f6] px-6 py-4">
              <h2 className="font-display text-3xl text-ink">Lịch trình hôm nay</h2>
              <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                <button type="button" className="rounded border border-sand px-3 py-2 hover:bg-white">Tất cả</button>
                <button type="button" className="rounded border border-sand px-3 py-2 hover:bg-white">Chỉ giao</button>
                <button type="button" className="rounded border border-sand px-3 py-2 hover:bg-white">Chỉ nhận</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-sand bg-[#fff4ef] text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    <th className="px-6 py-3">Mã đơn</th>
                    <th className="px-6 py-3">Khách hàng</th>
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3">Loại</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {staffScheduleRows.map((row) => (
                    <tr key={row.code} className="border-b border-sand last:border-b-0 hover:bg-[#fff8f6]">
                      <td className="px-6 py-4 font-semibold text-ink">{row.code}</td>
                      <td className="px-6 py-4">{row.customer}</td>
                      <td className="px-6 py-4">{row.product}</td>
                      <td className="px-6 py-4"><span className="rounded-full bg-antique/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-antique">{row.type}</span></td>
                      <td className="px-6 py-4 text-right"><button type="button" className="text-sm font-semibold text-lotus hover:underline">{row.action}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-sand bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="border-b border-sand bg-[#fff8f6] px-6 py-4">
              <h2 className="font-display text-3xl text-ink">Yêu cầu chờ xác nhận</h2>
            </div>
            <div className="divide-y divide-sand">
              {pendingRequests.map((item) => (
                <div key={item.code} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-ink">{item.code}</span>
                      <span className="rounded-full bg-antique/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-antique">Chờ xác nhận</span>
                    </div>
                    <p className="text-sm text-ink">{item.garment}</p>
                    <p className="text-sm text-stone-600">Khách: {item.customer} • Thuê: {item.period}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">Từ chối</button>
                    <button type="button" className="rounded-lg bg-lotus px-4 py-2 text-sm font-semibold text-white transition hover:bg-oxblood">Xác nhận</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <h2 className="flex items-center gap-2 font-display text-3xl text-red-700"><span className="material-symbols-outlined">notification_important</span>Cảnh báo quá hạn</h2>
            <div className="mt-4 rounded-lg border border-red-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-ink">#ORD-875</span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">Quá hạn 2 ngày</span>
              </div>
              <p className="mt-2 text-sm text-ink">Áo Ngũ Thân Tay Chẽn (M)</p>
              <p className="mt-1 text-sm text-stone-600">Lê Hữu Lộc • 090 123 4567</p>
              <button type="button" className="mt-4 text-sm font-semibold text-red-700 hover:underline">Liên hệ ngay</button>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-sand bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <div className="border-b border-sand bg-[#fff8f6] px-5 py-4">
              <h2 className="font-display text-3xl text-ink">Theo dõi trạng thái</h2>
            </div>
            <div>
              {lifecycleCards.map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-4 border-b border-sand px-5 py-4 last:border-b-0 hover:bg-[#fff8f6]">
                  <div>
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="text-sm text-stone-600">{item.note}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <Link href="/dashboard/staff/inspection" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lotus px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood">
            Vào màn kiểm tra đồ
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </aside>
      </div>
    </StaffPortalShell>
  );
}
