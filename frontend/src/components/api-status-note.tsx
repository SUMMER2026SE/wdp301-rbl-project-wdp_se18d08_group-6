export function ApiStatusNote() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Backend API được đọc từ <code className="font-mono">NEXT_PUBLIC_API_URL</code>. Nếu backend chưa chạy,
      giao diện sẽ tự rơi về dữ liệu mẫu của MVP để bạn vẫn xem được luồng màn hình.
    </div>
  );
}
