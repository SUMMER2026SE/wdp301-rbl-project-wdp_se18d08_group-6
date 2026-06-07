const cards = [
  "My bookings",
  "AI try-on requests",
  "Deposit and refund status",
  "Profile and measurements",
];

export default function CustomerDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-jade">Customer</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Customer dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <section key={card} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">{card}</h2>
            <p className="mt-2 text-sm text-slate-600">Module placeholder for the first MVP sprint.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
