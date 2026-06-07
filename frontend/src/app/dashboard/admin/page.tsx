const cards = [
  "User accounts",
  "Roles and permissions",
  "System settings",
  "Audit logs",
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-jade">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">System administration</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <section key={card} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">{card}</h2>
            <p className="mt-2 text-sm text-slate-600">Module placeholder for platform configuration.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
