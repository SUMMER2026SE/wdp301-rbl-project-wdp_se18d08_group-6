export function ApiStatusNote() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Backend API is expected at <code className="font-mono">NEXT_PUBLIC_API_URL</code>. If the backend is not
      running, pages fall back to sample MVP data.
    </div>
  );
}