import Link from "next/link";

const collectionCards = [
  {
    title: "Áo Dài Truyền Thống",
    subtitle: "Dòng Di Sản",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCdYyqGTfQnuRqFD-y9kVntrYQAgRK7rpVTrV7Z74z6DLaCvh8FZkvGIWeQOhI48Dpinw1M-GjDLsMYORDoQLE8-mMY6i4bWg3s7CN2izGDDNAJ6i-1zxSPmZ60EJLrOE-X1Kj93BX8ioVTJkpfV6mI5Z4UjoDd48TjE0PvGnzcoYr4e-9EZ0sqGbm_CfCa74jP6wDxg7yZiYV0WTjXYao1g9EtMPWobFDY4S-dhW1KrcIa5qvf8-K3TUVMALTNxWD7pgxajlFRQct",
  },
  {
    title: "Áo Dài Cách Tân",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpdew3ggLs6xlVpmJgHap9WUw51NiN8-SxZWc86HUd9JvUYXaAk5-M3DypF1FMxsO3kNu01OGy-kQjU1PAp0AXHNP7Jf7L9-ulP3kBMVjnSPdqbrW4WB_Klqenl5xpyMrEanc_WAZ9CVkvIEIlBxsT5uOv76VGhgt_WPLW3zGg_0HBn3ppgZUi3J1zHml8--uq-_9PpHGmkfACxuONpGtfDGiC9h0jrET4HMI_c6BDLqq37iaAcUrMvRKL2JuFJkLPnlJaEKugt7ic",
  },
  {
    title: "Cổ Phục",
    subtitle: "Trang Phục Cung Đình",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgqP8fvN3GZeVJ3psiQhYUhgjItEg077zfr7314uDziivOOh4-eZ2xYn4uKkwZF_HxD27tmUjgq2kjF88WIpVjjfbWMpp0esGS2gc1Xx0A2jRa6nCQKlR_jCUqGsn1Sp-Mt90xEzNLJJvaQhXMG4XrfVekkMNu5dbFAXfk4pimCqd7Y9Ijs3NXMGLpFiE0Q_SxNkXht3H1fAMFd3tGpYYz9naAa_3EatwCLBfMlMLhOBr8wPhsg88vasNex7Gra359wHF6BKHijlfl",
  },
];

const journeySteps = [
  {
    icon: "search_insights",
    title: "1. Khám Phá & Thử Đồ AI",
    description:
      "Khám phá kho lưu trữ kỹ thuật số của chúng tôi và hình dung sự vừa vặn ngay lập tức với công nghệ AI độc quyền của Xưởng May.",
  },
  {
    icon: "calendar_month",
    title: "2. Đặt Lịch Lễ Phục",
    description:
      "Đặt trước trang phục cho ngày đặc biệt của bạn. Cấu trúc đặt cọc minh bạch và quy trình đặt lịch an toàn.",
  },
  {
    icon: "dry_cleaning",
    title: "3. Chăm Sóc Tiêu Chuẩn Bảo Tàng",
    description:
      "Trang phục được chuẩn bị tỉ mỉ, là ủi và đóng gói trước khi bàn giao, đảm bảo sự hoàn hảo tuyệt đối.",
  },
];

const erpRows = [
  {
    code: "AD-042: Sen Trắng",
    note: "Cập nhật lần cuối: 10 phút trước",
    status: "Đã Thuê",
    statusClass: "bg-[#2E3B5E]/10 text-[#2E3B5E]",
  },
  {
    code: "CP-105: Nhật Bình",
    note: "Đang trong quá trình giặt ủi",
    status: "Giặt Ủi",
    statusClass: "bg-[#7E97A6]/10 text-[#7E97A6]",
  },
];

export default function HomePage() {
  return (
    <div className="bg-[#fff8f6] text-ink">
      <section id="di-san" className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            alt="Hero Image"
            className="h-full w-full object-cover object-center"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdXabEdciQNtP8s0EBdQxoYDN_Z8tN5a4UAmfwWGfGXzMNYDzlBoq8KWOI8vD1bEKJ3Wb1ySq3UUe0yKMT7y4ZaoSNVSVHlkVpGttfzGj5bIufevdo49t2H2IARFJLxROf0IdHgdAt6VTZOW2_-LVezBxUbzmnFapH-yLQ7u7xqzq3Qv23LJLAklm4itoE283BhNCQxiHnEeQzYgwpUqjSIWoC5QQAqPhFQE0xoRA8N0Hmoli0d2qme7VED0lpopAePMF2f_CoH-sj"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-black/4 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto mt-20 max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-5xl leading-none text-white drop-shadow-lg sm:text-6xl lg:text-[72px]">
            Di Sản Việt Trong Tầm Tay
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/90 drop-shadow-md sm:text-lg">
            Trải nghiệm vẻ đẹp thanh lịch của trang phục truyền thống Việt Nam. Được tuyển chọn cho các nghi lễ hiện đại, bảo quản với tiêu chuẩn bảo tàng. Tìm kiếm sự vừa vặn hoàn hảo với tính năng Thử Đồ AI của Xưởng May chúng tôi.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/catalog" className="w-full rounded-sm bg-lotus px-8 py-4 text-sm font-semibold tracking-[0.16em] text-white transition hover:bg-oxblood sm:w-auto">
              Khám Phá Bộ Sưu Tập
            </Link>
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-sm border border-white/50 bg-white/5 px-8 py-4 text-sm font-semibold tracking-[0.16em] text-white backdrop-blur transition hover:bg-white/10 sm:w-auto">
              <span className="material-symbols-outlined text-[18px]">magic_button</span>
              Thử Đồ AI
            </button>
          </div>
        </div>
      </section>

      <section id="bo-suu-tap" className="heritage-grid mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-start justify-between gap-4 border-b border-sand pb-6 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-4xl text-oxblood sm:text-5xl">Bộ Sưu Tập Tuyển Chọn</h2>
            <p className="mt-2 text-base text-[#8C6A5E]">Khám phá những bộ trang phục được bảo quản tỉ mỉ của chúng tôi.</p>
          </div>
          <button type="button" className="flex items-center gap-1 text-sm font-semibold text-[#6E5E40] transition hover:text-lotus">
            Xem Tất Cả Lưu Trữ <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:auto-rows-[400px]">
          <article className="group relative overflow-hidden rounded-sm bg-[#f8dcd8] md:col-span-8">
            <img alt={collectionCards[0].title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={collectionCards[0].image} />
            <div className="absolute inset-0 bg-gradient-to-t from-oxblood/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-8">
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-antique">{collectionCards[0].subtitle}</span>
                <h3 className="text-3xl font-semibold text-white">{collectionCards[0].title}</h3>
              </div>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur transition hover:border-lotus hover:bg-lotus">
                <span className="material-symbols-outlined">arrow_outward</span>
              </button>
            </div>
          </article>

          <div className="flex h-full flex-col gap-6 md:col-span-4">
            <article className="group relative flex-1 overflow-hidden rounded-sm bg-[#f8dcd8]">
              <img alt={collectionCards[1].title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={collectionCards[1].image} />
              <div className="absolute inset-0 bg-gradient-to-t from-oxblood/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-3xl font-semibold text-white">{collectionCards[1].title}</h3>
              </div>
            </article>

            <article className="group relative flex-1 overflow-hidden rounded-sm bg-black">
              <img alt={collectionCards[2].title} className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105" src={collectionCards[2].image} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-3xl font-semibold text-white">{collectionCards[2].title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-antique">{collectionCards[2].subtitle}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="hanh-trinh" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl text-oxblood sm:text-5xl">Hành Trình Xưởng May</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#8C6A5E]">Trải nghiệm liền mạch từ khám phá kỹ thuật số đến sự thanh lịch hiện thực.</p>
          </div>

          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="absolute left-[15%] right-[15%] top-[60px] hidden border-t border-dashed border-[#6E5E40]/30 md:block" />
            {journeySteps.map((step) => (
              <article key={step.title} className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-sand bg-[#F9F5F0] shadow-[0_8px_30px_rgba(74,4,4,0.05)] transition hover:border-antique">
                  <span className="material-symbols-outlined text-4xl text-lotus">{step.icon}</span>
                </div>
                <h3 className="text-2xl font-semibold text-oxblood">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5a403c]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="quan-tri-erp" className="border-y border-sand bg-[#fff0ee] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 lg:flex-row">
          <div className="w-full lg:w-1/2">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.28em] text-jade">Vận Hành Xuất Sắc</span>
            <h2 className="font-display text-4xl text-ink sm:text-5xl">Dành Cho Nhà Quản Lý</h2>
            <p className="mt-6 text-base leading-8 text-[#5a403c]">
              Đằng sau sự thanh lịch là sự chính xác. Hệ thống ERP thiết kế riêng của chúng tôi quản lý vòng đời trang phục, theo dõi giặt ủi và logistics đặt lịch với độ chính xác tuyệt đối.
            </p>
            <div className="mt-8 space-y-4 text-sm text-ink">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-jade">check_circle</span>
                <span>Theo dõi tình trạng &amp; hàng tồn kho theo thời gian thực</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-jade">check_circle</span>
                <span>Lên lịch giặt ủi tự động</span>
              </div>
            </div>
            <Link href="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-sm border border-sand bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-[#6E5E40]">
              Đến Trang Quản Trị ERP
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="relative overflow-hidden rounded-lg border border-sand bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-jade to-[#00A86B]" />
              <div className="mb-6 flex items-center justify-between border-b border-sand pb-4">
                <h4 className="text-sm font-semibold text-ink">Bảng Điều Khiển Trực Tiếp</h4>
                <span className="rounded bg-[#ffe9e6] px-2 py-1 text-xs font-semibold text-jade">Hệ Thống Hoạt Động</span>
              </div>
              <div className="space-y-4">
                {erpRows.map((row) => (
                  <div key={row.code} className="flex items-center justify-between rounded border border-sand/60 bg-[#fff8f6] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-sand/40">
                        <span className="material-symbols-outlined text-[16px] text-[#8C6A5E]">apparel</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink">{row.code}</div>
                        <div className="text-xs text-[#5a403c]">{row.note}</div>
                      </div>
                    </div>
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${row.statusClass}`}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-oxblood px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="font-display text-4xl leading-none text-white">Cổ Phục Rental</div>
          <nav className="flex flex-wrap justify-center gap-8 text-sm text-white/80">
            <button type="button" className="transition hover:text-antique">Truyền Thống</button>
            <button type="button" className="transition hover:text-antique">Điều Khoản Nghi Lễ</button>
            <button type="button" className="transition hover:text-antique">Chăm Sóc Trang Phục</button>
            <button type="button" className="transition hover:text-antique">Liên Hệ Xưởng May</button>
          </nav>
          <div className="max-w-xs text-center text-sm text-white/60 md:text-right">
            © 2024 Cổ Phục Rental. Bảo tồn Di sản Việt qua Sự Xuất sắc Hiện đại.
          </div>
        </div>
      </footer>
    </div>
  );
}
