import { ApiStatusNote } from "@/components/api-status-note";
import { API_BASE_URL } from "@/lib/api";
import { sampleGarments } from "@/lib/sample-data";

type GarmentCard = {
  id: string;
  name: string;
  category: string;
  size: string;
  dailyPrice: string;
  deposit: string;
  status: string;
};

type BackendGarment = {
  id: string;
  name: string;
  categoryName: string | null;
  sizeLabel: string | null;
  dailyPrice: number;
  depositAmount: number;
};

async function getGarments(): Promise<{ garments: GarmentCard[]; fromBackend: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/garments`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Backend unavailable");
    }

    const payload = (await response.json()) as { success: boolean; data?: BackendGarment[] };
    if (!payload.success || !payload.data) {
      throw new Error("Invalid backend response");
    }

    return {
      fromBackend: true,
      garments: payload.data.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.categoryName ?? "Uncategorized",
        size: item.sizeLabel ?? "Free size",
        dailyPrice: `${Number(item.dailyPrice).toLocaleString("vi-VN")} VND/day`,
        deposit: `${Number(item.depositAmount).toLocaleString("vi-VN")} VND`,
        status: "Check availability",
      })),
    };
  } catch {
    return {
      fromBackend: false,
      garments: sampleGarments.map((item, index) => ({ id: String(index), ...item })),
    };
  }
}

export default async function CatalogPage() {
  const { garments, fromBackend } = await getGarments();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-jade">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Trang phuc cho thue</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Frontend calls the Node.js backend API. Sample data is used when the backend is offline.
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          {garments.length} items
        </div>
      </div>

      {!fromBackend ? <div className="mt-6"><ApiStatusNote /></div> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {garments.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{item.category}</p>
                <h2 className="mt-2 text-lg font-semibold text-ink">{item.name}</h2>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{item.size}</span>
            </div>
            <dl className="mt-5 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><dt>Price</dt><dd>{item.dailyPrice}</dd></div>
              <div className="flex justify-between"><dt>Deposit</dt><dd>{item.deposit}</dd></div>
              <div className="flex justify-between"><dt>Status</dt><dd>{item.status}</dd></div>
            </dl>
            <button className="focus-ring mt-5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Check availability
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}