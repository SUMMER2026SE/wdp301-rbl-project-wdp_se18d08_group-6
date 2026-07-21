# Cổ Phục Rental — Design Taste (Heritage Vietnamese Theme)

> Based on TasteSkill v2 by Leon Lin. Adapted for Cổ Phục Rental's heritage Vietnamese aesthetic.
> **AI Agent: Read this entire file before generating any frontend code. These rules are NON-NEGOTIABLE.**

---

## 0. Brief Inference Protocol

Before writing ANY code, read the project's design brief. Cổ Phục Rental is:

- **Domain**: Vietnamese traditional costume (áo dài, cổ phục) rental platform
- **Aesthetic**: Heritage, luxurious, warm, museum-quality, editorial
- **Tone**: Elegant, respectful, premium but not cold — "Di sản Việt trong tầm tay"
- **Inferred dials**: VARIANCE: 5 | MOTION: 4 | DENSITY: 5

### Design Read (mandatory one-liner before coding):
"Premium Vietnamese heritage editorial — museum-grade warmth with lotus-red accents on parchment, controlled asymmetry, deliberate typographic hierarchy with Cormorant Garamond display + Manrope body."

---

## 1. Three Inviolable Design Locks

### LOCK 1: Color Consistency — ONE accent color system

| Token | Hex | Role |
|---|---|---|
| **`lotus`** (accent) | `#8b1e1e` | Primary CTAs, active states, links, highlights |
| **`oxblood`** (accent-dark) | `#4d100f` | Button hover, footer, strong emphasis |
| **`ink`** (text-primary) | `#251917` | Body text, headings |
| **`mist`** (bg-primary) | `#fcfaf7` | Main page background |
| **`parchment`** (bg-secondary) | `#f6efe7` | Card backgrounds, sections |
| **`sand`** (border) | `#e6d7c5` | All borders, dividers |
| **`jade`** (positive) | `#225d55` | Success states, confirmed, available |
| **`bronze`** (tertiary-text) | `#7b5a43` | Secondary emphasis, metadata |
| **`antique`** (accent-gold) | `#c6a664` | Subtle highlights, badges, decorative |

**RULES:**
- NEVER use blue, purple, or teal as accent colors
- NEVER use pure black (`#000000`) or pure white (`#ffffff`)
- `lotus` is the ONLY action color for primary buttons
- `jade` is the ONLY color for success/confirmed states
- NO neon, NO gradients with purple/magenta/cyan

### LOCK 2: Shape Consistency — ONE radius system

| Level | Value | Use |
|---|---|---|
| `radius-sm` | `2px` | Inline code, tiny badges |
| `radius-md` | `6px` | **DEFAULT** — buttons, inputs, small cards |
| `radius-lg` | `12px` | Cards, panels, dialogs, modals |
| `radius-xl` | `16px` | Large cards, featured sections |
| `radius-full` | `9999px` | Pills, badges, status indicators, toggle buttons |

**RULES:**
- `rounded-lg` (12px) is the DEFAULT for all cards and panels
- `rounded-full` for ALL status badges and filter pills — NO EXCEPTIONS
- NO `rounded-sm` on cards or buttons
- NO `rounded-2xl` or `rounded-3xl` — use `rounded-xl` for the largest elements
- NEVER mix sharp and round corners on the same page

### LOCK 3: Background Consistency

| Token | Use |
|---|---|
| `mist` (`#fcfaf7`) | **PRIMARY page background** — use everywhere unless overridden |
| `parchment` (`#f6efe7`) | **SECONDARY section background** — alternating sections |
| `white` | Card backgrounds, elevated surfaces |
| `sand` at 10-20% opacity | Hover states, subtle highlights |

**RULES:**
- NEVER use raw `bg-[#fff8f6]`, `bg-[#f9f5f0]`, `bg-[#fff4ef]`, or `bg-[#fff0ee]` — these are undocumented color variants
- Page background is ALWAYS `bg-mist`
- Sidebar backgrounds are ALWAYS `bg-parchment`
- Active nav item background is ALWAYS `bg-lotus/10` (not `bg-[#ffe9e6]`)

---

## 2. Design System — Project Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 3.4 with custom theme tokens |
| Typography | Cormorant Garamond (display) + Manrope (body) |
| Icons | Material Symbols Outlined (primary) + Lucide React (secondary) |
| Animation | IntersectionObserver for scroll reveals; CSS transitions for hover |
| State | React hooks + Supabase |
| Components | Custom-built, heritage-themed (NOT shadcn, NOT MUI) |

### Typography Rules

- Display headings (`font-display`): Cormorant Garamond — use for h1, h2, hero text, section titles
- Body text (`font-sans`): Manrope — use for paragraphs, labels, buttons, UI
- Heading hierarchy:
  - h1: `font-display text-4xl sm:text-5xl lg:text-6xl` — page titles
  - h2: `font-display text-3xl sm:text-4xl` — section titles
  - h3: `font-display text-2xl` — card titles
- Uppercase tracking labels: `text-xs font-semibold uppercase tracking-[0.16em]`
- NO em-dashes in content — use regular dashes or Vietnamese punctuation
- NO heading numbering ("01.", "Step 1:", etc.)
- Body text max-width: 65ch for readability

---

## 3. Component Design Rules

### Buttons

**Primary (CTA):**
```
rounded-md bg-lotus px-6 py-3 text-sm font-semibold text-white transition hover:bg-oxblood
```

**Secondary (outline):**
```
rounded-md border border-lotus/40 px-6 py-3 text-sm font-semibold text-lotus transition hover:bg-lotus hover:text-white
```

**Tertiary (ghost):**
```
rounded-md px-4 py-2 text-sm font-medium text-stone-600 transition hover:text-lotus
```

**Button sizes:**
- `sm`: `px-4 py-2 text-sm`
- `md` (default): `px-6 py-3 text-sm`
- `lg`: `px-8 py-4 text-base`

### Cards

```
rounded-lg border border-sand bg-white p-6 shadow-card
```

- ONE card style across the entire app
- Shadow: `shadow-card` = `0 4px 24px rgba(77, 16, 15, 0.06)`
- Hover: `hover:shadow-card-hover` = `0 8px 32px rgba(77, 16, 15, 0.10)` + `hover:-translate-y-0.5`

### Status Badges (UNIFIED — single source of truth)

```typescript
// File: src/lib/status-labels.ts
export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:                { label: "Nháp",                color: "bg-stone-100 text-stone-600" },
  pending_confirmation: { label: "Chờ xác nhận",        color: "bg-lotus/10 text-lotus" },
  confirmed:            { label: "Đã xác nhận",         color: "bg-jade/10 text-jade" },
  awaiting_payment:     { label: "Chờ thanh toán",      color: "bg-amber-50 text-amber-700" },
  paid:                 { label: "Đã thanh toán",       color: "bg-jade/10 text-jade" },
  preparing:            { label: "Đang chuẩn bị",       color: "bg-lotus/10 text-lotus" },
  ready_for_pickup:     { label: "Sẵn sàng nhận",       color: "bg-jade/10 text-jade" },
  delivering:           { label: "Đang giao",            color: "bg-amber-50 text-amber-700" },
  renting:              { label: "Đang thuê",            color: "bg-lotus/10 text-lotus" },
  returned:             { label: "Đã trả",               color: "bg-stone-100 text-stone-600" },
  inspection_pending:   { label: "Chờ kiểm tra",        color: "bg-amber-50 text-amber-700" },
  completed:            { label: "Hoàn tất",             color: "bg-jade/10 text-jade" },
  cancelled:            { label: "Đã hủy",               color: "bg-stone-100 text-stone-500" },
  rejected:             { label: "Bị từ chối",           color: "bg-red-50 text-red-600" },
  overdue:              { label: "Quá hạn",              color: "bg-red-50 text-red-600" },
};
```

**RULES for status badges:**
- ALWAYS use `rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]`
- ALWAYS import from `@/lib/status-labels` — NEVER define locally
- Same status = same color across ALL dashboards (customer, staff, manager, admin)

### Input Fields

```
rounded-md border border-sand bg-white px-4 py-3 text-sm
  outline-none transition
  focus:border-lotus
  placeholder:text-stone-400
```

- Use `rounded-md` (6px) for all inputs
- Focus ring: `border-lotus` (not blue, not glowing)

### Navigation

- Active nav item: `border-b-2 border-lotus text-lotus`
- Inactive: `border-b-2 border-transparent text-stone-600 hover:text-lotus`
- Sidebar active item: `rounded-lg bg-lotus/10 text-lotus font-semibold`
- Sidebar inactive: `rounded-lg text-stone-600 hover:bg-white hover:text-lotus`

---

## 4. Layout Rules

- Max page width: `max-w-7xl` (1280px) for content, `max-w-[1440px]` for dashboards
- Section spacing: `py-24` for page sections, `py-10` for dashboard content
- Sidebar width: `w-64` or `w-72` — pick one and use consistently (use `w-64`)
- Grid gaps: `gap-6` for cards, `gap-4` for smaller elements
- NO horizontal scroll at any viewport size
- Single-column collapse below `md` (768px)
- Stick to `sticky` headers, not `fixed` — unless the design explicitly requires it

---

## 5. Shadow Scale

```
shadow-xs   = 0 1px 2px rgba(77, 16, 15, 0.04)   — subtle lift
shadow-sm   = 0 2px 8px rgba(77, 16, 15, 0.05)   — cards, inputs
shadow-md   = 0 4px 24px rgba(77, 16, 15, 0.06)  — DEFAUT card shadow
shadow-lg   = 0 8px 32px rgba(77, 16, 15, 0.10)  — hover, featured
shadow-xl   = 0 20px 60px rgba(77, 16, 15, 0.14) — modals, overlays
```

All shadows use `rgba(77, 16, 15, ...)` (oxblood base) — NEVER use `rgba(0, 0, 0, ...)`.

---

## 6. Motion & Animation

- **Transitions**: `transition` (150ms) for hover states, `duration-200` for meaningful transitions
- **Hover effects**: `hover:-translate-y-0.5` for cards, `hover:bg-oxblood` for buttons
- **Scroll reveals**: Use IntersectionObserver with `opacity-0 translate-y-6 → opacity-100 translate-y-0`
- NO `window.addEventListener('scroll')` for animations — use IntersectionObserver
- NO `animate-spin` except for loading states
- Respect `prefers-reduced-motion`

---

## 7. Anti-Patterns (FORBIDDEN)

### Color
- ❌ Purple, blue, teal, cyan, or magenta as accent colors
- ❌ Neon, mesh gradients, AI-purple
- ❌ `bg-[#fff8f6]`, `bg-[#f9f5f0]`, `bg-[#fff4ef]`, `bg-[#fff0ee]` — use `bg-mist` or `bg-parchment`
- ❌ `bg-blue-600`, `bg-rose-600` for action buttons — use `bg-lotus`
- ❌ Pure black (`#000`) or pure white (`#fff`)

### Typography
- ❌ Em-dashes (`—`)
- ❌ Section numbering ("01.", "Step 1:")
- ❌ Fake scroll cues ("Scroll down ↓")
- ❌ Generic filler text ("Lorem ipsum")

### Layout
- ❌ 3 equal-width cards in a row (use varied widths or masonry)
- ❌ Centered hero layout (use left-aligned or asymmetric)
- ❌ `h-screen` — use `min-h-screen` or `min-h-[85vh]`

### Icons & Media
- ❌ Emoji as icons (use Material Symbols Outlined)
- ❌ Broken/placeholder images — always provide fallback
- ❌ Unsplash URLs without proper attribution

### Components
- ❌ `rounded-sm` on buttons or cards
- ❌ `rounded-2xl` or `rounded-3xl` — not in our radius system
- ❌ Hardcoded inline status colors — ALWAYS import from `@/lib/status-labels`
- ❌ Multiple shadow values on the same page

---

## 8. Pre-Flight Check

Before shipping ANY UI code, verify:

- [ ] All buttons use `bg-lotus` (not blue, not custom hex)
- [ ] All status badges use the unified `STATUS_LABELS` from `@/lib/status-labels`
- [ ] Backgrounds use `bg-mist` or `bg-parchment` only (no `bg-[#fff8f6]` variants)
- [ ] Border radius is from the defined scale (`rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`)
- [ ] Shadows use oxblood tint (`rgba(77, 16, 15, ...)`) not black
- [ ] No em-dashes in content
- [ ] No emoji as icons
- [ ] No 3 equal-width cards in a row
- [ ] Page has ONE accent color (lotus) — no competing colors
- [ ] No purple, blue, or teal accents
- [ ] Heading hierarchy is correct (display for titles, sans for body)
- [ ] Sidebar widths are consistent (`w-64`)
- [ ] Cards use `rounded-lg border border-sand bg-white p-6 shadow-md`

---

## 9. Vietnamese-Specific Conventions

- All UI labels in Vietnamese
- Date format: `dd/mm/yyyy`
- Currency: VND with `Intl.NumberFormat("vi-VN")`
- Status labels in Vietnamese (see unified STATUS_LABELS)
- Formal tone ("Quý khách" not "bạn" in customer-facing text)
- Brand names: "Cổ Phục Rental", "Áo Dài Atelier" — use consistently

---

## Appendix: Quick Reference

```
// Button primary
className="rounded-md bg-lotus px-6 py-3 text-sm font-semibold text-white transition hover:bg-oxblood"

// Card
className="rounded-lg border border-sand bg-white p-6 shadow-md"

// Status badge
className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"

// Input
className="rounded-md border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-lotus"

// Active nav
className="border-b-2 border-lotus pb-1 text-sm font-semibold text-lotus"

// Section heading
className="font-display text-4xl text-oxblood sm:text-5xl"

// Page background
className="bg-mist"

// Sidebar
className="bg-parchment"
```
