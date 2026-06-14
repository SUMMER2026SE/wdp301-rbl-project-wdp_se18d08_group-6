import Link from "next/link";
import { CustomerDashboardShell } from "@/components/heritage/ui";
import { customerOrderHistory, customerTimeline, customerWidgets } from "@/lib/heritage-mock-data";

export default function CustomerDashboardPage() {
  return (
    <CustomerDashboardShell>
      <header className="mb-12">
        <h1 className="font-display text-5xl text-lotus sm:text-6xl">Xin chào, Nguyễn Lê</h1>
        <p className="mt-3 flex items-center gap-2 text-base text-stone-600"><span className="material-symbols-outlined text-antique">workspace_premium</span>Thành viên di sản</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section className="overflow-hidden rounded-xl border border-sand bg-white p-8 shadow-[0_10px_40px_rgba(77,16,15,0.05)]">
            <div className="flex flex-col gap-6 md:flex-row">
              <img alt="Nhật Bình Hoàng Phái" className="w-full rounded-lg border border-sand object-cover md:w-64" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVIBgokmYBeh3WWBQXNHIEsN-ajXa3P-XiktmgrY7bT3wqoiOcLpzeDqJgX1K1aUNflGOMBsEJiA-GL-iuBTN2GR1fQkBvIWn5SerTICxuAP4ZAaL2rt8tYCNrpxSJIdYZivweyu6vLkEr1QqSl2a76fGlrpuKv9kx7Bya65DNMyytax9JkvVFpumgbbeB4hPI2Rxp6fA22Jy4FcP6qOvosV2Nh-3wlKnsTuuSW9_hJaeAgvB1V6S-gZNvBeFh4wnnYCWN-qTuJgi2" />
              <div className="flex-1">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-4xl text-ink">Nhật Bình Hoàng Phái</h2>
                    <p className="mt-1 text-sm text-stone-600">14/09/2024 - 16/09/2024</p>
                  </div>
                  <span className="rounded-full bg-[#ffe9e6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-lotus">Đang chuẩn bị</span>
                </div>

                <div className="space-y-5 border-l border-sand pl-5">
                  {customerTimeline.map((item) => (
                    <div key={item.title} className="relative">
                      <div className={item.state === 'done' ? "absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-jade" : item.state === 'active' ? "absolute -left-[27px] top-0.5 h-4 w-4 rounded-full border-2 border-white bg-lotus shadow ring-2 ring-[#ffe9e6]" : "absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-sand"} />
                      <p className={item.state === 'active' ? "font-semibold text-lotus" : item.state === 'done' ? "font-semibold text-jade" : "font-semibold text-stone-400"}>{item.title}</p>
                      <p className="mt-1 text-sm text-stone-600">{item.note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/booking/success" className="inline-flex items-center justify-center rounded-lg bg-lotus px-5 py-3 text-sm font-semibold text-white transition hover:bg-oxblood">Xem tiến trình</Link>
                  <button type="button" className="rounded-lg border border-bronze px-5 py-3 text-sm font-semibold text-bronze transition hover:bg-[#fff0ee]">Liên hệ atelier</button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-6 font-display text-4xl text-ink">Lịch sử thuê trang phục</h2>
            <div className="overflow-hidden rounded-xl border border-sand bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#fff4ef] text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    <th className="px-6 py-4">Trang phục</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrderHistory.map((item) => (
                    <tr key={item.title} className="border-t border-sand transition hover:bg-[#fff8f6]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img alt={item.title} className="h-10 w-10 rounded object-cover" src={item.image} />
                          <span className="font-medium text-ink">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-600">{item.period}</td>
                      <td className="px-6 py-4"><span className="rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-jade">{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          {customerWidgets.map((item) => (
            <div key={item.title} className="rounded-xl border border-sand bg-white p-6 shadow-[0_10px_30px_rgba(77,16,15,0.04)]">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.accent}`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <span className="material-symbols-outlined text-stone-400">arrow_forward</span>
              </div>
              <h3 className="font-display text-3xl text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-600">{item.description}</p>
            </div>
          ))}
        </aside>
      </div>
    </CustomerDashboardShell>
  );
}
