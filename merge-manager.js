const fs = require('fs');

const content = fs.readFileSync('frontend/src/app/dashboard/manager/page.tsx', 'utf8');

// Replace Chunk 1: Imports
let newContent = content.replace(
  /<<<<<<< HEAD[\s\S]*?=======\s*([\s\S]*?)>>>>>>> 6fb0177 \(role manager\)/,
  `  getPendingManagerRefunds,
  approveRefund,
  type RefundResponse,
$1`
);

// Replace Chunk 2: Tabs definition
newContent = newContent.replace(
  /<<<<<<< HEAD\r?\ntype Tab = "assets" \| "catalog" \| "finance" \| "refunds";\r?\n=======\r?\n([\s\S]*?)type Tab = "overview" \| "assets" \| "inventory" \| "inspection-log" \| "laundry" \| "damaged" \| "finance";\r?\n\r?\nconst VALID_TABS: Tab\[\] = \["overview", "assets", "inventory", "inspection-log", "laundry", "damaged", "finance"\];\r?\n([\s\S]*?)finance:\s+\{ title: "Đối Soát Tài Chính",\s+subtitle: "Theo dõi doanh thu, tiền cọc và phí phạt phát sinh." \},\r?\n\};\r?\n>>>>>>> 6fb0177 \(role manager\)/,
  `$1type Tab = "overview" | "assets" | "inventory" | "inspection-log" | "laundry" | "damaged" | "finance" | "refunds";

const VALID_TABS: Tab[] = ["overview", "assets", "inventory", "inspection-log", "laundry", "damaged", "finance", "refunds"];
$2finance:       { title: "Đối Soát Tài Chính",                subtitle: "Theo dõi doanh thu, tiền cọc và phí phạt phát sinh." },
  refunds:       { title: "Duyệt Hoàn Cọc",                subtitle: "Kiểm duyệt yêu cầu hoàn tiền cọc cho khách." },
};`
);

// Replace Chunk 3: States
newContent = newContent.replace(
  /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> 6fb0177 \(role manager\)/,
  `$1$2`
);

// Replace Chunk 4: UI layout
// Between `<<<<<<< HEAD` around line 557 and `=======` around line 581, HEAD added a custom tab bar.
// Then between `=======` and `>>>>>>> 6fb0177`, 6fb0177 has `<OverviewTab...`.
newContent = newContent.replace(
  /<<<<<<< HEAD\r?\n\s+\{\/\* Tab bar \*\/\}([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> 6fb0177 \(role manager\)/,
  `$2`
);

// Replace Chunk 5: The end of ManagerDashboardPage, where HEAD defines inline tabs and 6fb0177 closes the shell.
// We need to keep 6fb0177's structure but add the RefundsTab call.
// Let's find the closing of FinanceTab:
newContent = newContent.replace(
  /<<<<<<< HEAD\r?\n\s+\)\}\r?\n\r?\n\s+\{loading \? \(([\s\S]*?)=======\r?\n\s+<\/div>\r?\n>>>>>>> 6fb0177 \(role manager\)/,
  `      ) : tab === "refunds" ? (
        <RefundsTab
          pendingRefunds={pendingRefunds}
          loadingRefunds={loadingRefunds}
          handleApproveRefund={handleApproveRefund}
          approvingId={approvingId}
          proofImageUrl={proofImageUrl}
          setProofImageUrl={setProofImageUrl}
          approveNote={approveNote}
          setApproveNote={setApproveNote}
        />
      ) : null}
`
);

// Append the RefundsTab function at the end
const refundsTabComponent = `

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Refunds (Duyệt hoàn cọc)
// ═══════════════════════════════════════════════════════════════════════════════

function RefundsTab({
  pendingRefunds,
  loadingRefunds,
  handleApproveRefund,
  approvingId,
  proofImageUrl,
  setProofImageUrl,
  approveNote,
  setApproveNote,
}: {
  pendingRefunds: any[];
  loadingRefunds: boolean;
  handleApproveRefund: (id: string) => void;
  approvingId: string | null;
  proofImageUrl: string;
  setProofImageUrl: (val: string) => void;
  approveNote: string;
  setApproveNote: (val: string) => void;
}) {
  function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  }

  return (
    <div className="space-y-6">
      {loadingRefunds ? (
        <div className="py-20 text-center text-stone-400">Đang tải danh sách hoàn cọc...</div>
      ) : pendingRefunds.length === 0 ? (
        <div className="py-20 text-center text-stone-400">
          <span className="material-symbols-outlined text-5xl text-stone-200 mb-4 block">check_circle</span>
          Không có yêu cầu hoàn cọc nào đang chờ duyệt.
        </div>
      ) : (
        pendingRefunds.map((refund) => (
          <div
            key={refund.id}
            className="overflow-hidden rounded-xl border border-sand bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-[#fff8f6] px-6 py-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-ink">#{refund.bookingId.slice(0, 8).toUpperCase()}</span>
                <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-yellow-100 text-yellow-700">
                  Chờ duyệt
                </span>
              </div>
              <span className="text-xs text-stone-400">
                Yêu cầu lúc {new Date(refund.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Khách hàng</p>
                <p className="mt-1 font-medium text-ink">{refund.booking.customerName ?? "—"}</p>
                {refund.booking.customerPhone && (
                  <p className="text-sm text-stone-500">{refund.booking.customerPhone}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Số tiền hoàn</p>
                <p className="mt-1 font-display text-2xl text-jade">{formatVND(refund.amount)}</p>
                <p className="text-sm text-stone-500">
                  Cọc: {formatVND(refund.booking.depositTotal)} — Phạt: {formatVND(refund.booking.penaltyTotal)}
                </p>
              </div>
            </div>

            <div className="border-t border-sand bg-[#fff8f6] px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 mb-3">
                Thông tin chuyển khoản
              </p>
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <div>
                  <span className="text-stone-500">Ngân hàng: </span>
                  <span className="font-medium text-ink">{refund.bankName ?? "—"}</span>
                </div>
                <div>
                  <span className="text-stone-500">Số TK: </span>
                  <span className="font-medium text-ink">{refund.bankAccountNumber ?? "—"}</span>
                </div>
                <div>
                  <span className="text-stone-500">Chủ TK: </span>
                  <span className="font-medium text-ink">{refund.bankAccountHolder ?? "—"}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-sand px-6 py-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-500">
                  Ảnh bill chuyển khoản (URL)
                </label>
                <input
                  className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique"
                  placeholder="Dán URL ảnh chụp giao dịch chuyển khoản..."
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-500">
                  Ghi chú (tuỳ chọn)
                </label>
                <input
                  className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique"
                  placeholder="Ghi chú nội bộ..."
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={approvingId === refund.id || !proofImageUrl.trim()}
                  onClick={() => handleApproveRefund(refund.id)}
                  className="rounded-lg bg-jade px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-50"
                >
                  {approvingId === refund.id ? "Đang xử lý..." : \`Duyệt hoàn cọc \${formatVND(refund.amount)}\`}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
`;

fs.writeFileSync('frontend/src/app/dashboard/manager/page.tsx', newContent + refundsTabComponent, 'utf8');
console.log('Merged manager page successfully');
