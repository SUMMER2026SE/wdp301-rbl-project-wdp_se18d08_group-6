import Link from "next/link";

const quickLinks = [
  {
    href: "/dashboard/customer/profile",
    title: "Profile details",
    description: "Update the contact information your orders and delivery team rely on.",
  },
  {
    href: "/dashboard/customer/measurements",
    title: "Measurements",
    description: "Save body measurements to speed up fitting and recommendations.",
  },
  {
    href: "/dashboard/customer/addresses",
    title: "Delivery addresses",
    description: "Keep default drop-off and pick-up addresses ready for future bookings.",
  },
];

const reminders = [
  "Bookings, deposits, and AI try-on history will be added in the next dashboard sprint.",
  "Profile, measurement, and address changes are saved directly through the NestJS backend API.",
  "Your default delivery address is always shown first when the address book loads.",
];

export default function CustomerDashboardPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <h2 className="text-xl font-semibold text-ink">Account tools</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">What is ready now</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          {reminders.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
