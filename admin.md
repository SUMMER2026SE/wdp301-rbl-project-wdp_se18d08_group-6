Auditlod:

<!DOCTYPE html><html lang="vi"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Nhật Ký Truy Cập &amp; Kiểm Toán Hệ Thống | Cổ Phục Rental ERP</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&amp;family=Manrope:wght@200..800&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "state-damaged": "#A63D40",
                        "on-secondary-fixed": "#271900",
                        "secondary-fixed-dim": "#f7bd48",
                        "jade-green": "#00A86B",
                        "surface-container-high": "#fee2dd",
                        "on-error-container": "#93000a",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#bcc3ff",
                        "primary": "#610000",
                        "on-surface-variant": "#5a403c",
                        "secondary-fixed": "#ffdea6",
                        "antique-gold": "#C5A059",
                        "on-primary": "#ffffff",
                        "on-secondary": "#ffffff",
                        "secondary": "#7b5800",
                        "inverse-primary": "#ffb4a8",
                        "on-background": "#261816",
                        "on-error": "#ffffff",
                        "on-secondary-container": "#715000",
                        "inverse-on-surface": "#ffedea",
                        "surface-dim": "#efd4d0",
                        "on-surface": "#261816",
                        "muted-teal": "#4F797B",
                        "surface": "#fff8f6",
                        "on-tertiary-fixed": "#000d60",
                        "ink-black": "#1A1A1A",
                        "tertiary-fixed": "#dfe0ff",
                        "on-primary-fixed": "#410000",
                        "clay-brown": "#8C6A5E",
                        "tertiary": "#00178d",
                        "outline": "#8e706b",
                        "surface-container": "#ffe9e6",
                        "on-secondary-fixed-variant": "#5d4200",
                        "on-tertiary-container": "#9ea9ff",
                        "background": "#fff8f6",
                        "state-maintenance": "#914E36",
                        "state-rented": "#2E3B5E",
                        "state-available": "#3D7A63",
                        "surface-variant": "#f8dcd8",
                        "on-primary-fixed-variant": "#920703",
                        "on-primary-container": "#ff907f",
                        "on-tertiary-fixed-variant": "#0d2ccc",
                        "on-tertiary": "#ffffff",
                        "surface-container-low": "#fff0ee",
                        "primary-fixed-dim": "#ffb4a8",
                        "surface-container-highest": "#f8dcd8",
                        "oxblood": "#4A0404",
                        "weathered-bronze": "#6E5E40",
                        "inverse-surface": "#3d2c2a",
                        "primary-fixed": "#ffdad4",
                        "error-container": "#ffdad6",
                        "secondary-container": "#fdc34d",
                        "state-laundry": "#7E97A6",
                        "lacquer-red": "#8B0000",
                        "tertiary-container": "#0025c8",
                        "surface-tint": "#b52619",
                        "surface-container-lowest": "#ffffff",
                        "state-reserved": "#D4AF37",
                        "primary-container": "#8b0000",
                        "warm-ivory": "#F9F5F0",
                        "surface-bright": "#fff8f6",
                        "state-inspection": "#B3541E",
                        "outline-variant": "#e3beb8",
                        "state-completed": "#1B4D3E"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "margin-tablet": "32px",
                        "container-max-width": "1440px",
                        "margin-desktop": "64px",
                        "unit": "4px",
                        "margin-mobile": "16px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "label-md": ["Manrope"],
                        "body-md": ["Manrope"],
                        "headline-md": ["EB Garamond"],
                        "body-sm": ["Manrope"],
                        "display-lg": ["EB Garamond"],
                        "display-md": ["EB Garamond"],
                        "body-lg": ["Manrope"],
                        "headline-lg": ["EB Garamond"],
                        "label-sm": ["Manrope"],
                        "headline-lg-mobile": ["EB Garamond"]
                    },
                    "fontSize": {
                        "label-md": ["13px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                        "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "500"}],
                        "display-md": ["36px", {"lineHeight": "1.2", "fontWeight": "500"}],
                        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "600"}],
                        "label-sm": ["11px", {"lineHeight": "1.2", "letterSpacing": "0.08em", "fontWeight": "700"}],
                        "headline-lg-mobile": ["28px", {"lineHeight": "1.3", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
<style>
        body { background-color: #F9F5F0; color: #261816; font-family: 'Manrope', sans-serif; }
        .erp-table-row:hover { background-color: #fff0ee; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid #E5E0D8; }
    </style>
</head>
<body class="flex flex-col min-h-screen">
<!-- TopNavBar -->
<nav class="bg-surface dark:bg-inverse-surface fixed top-0 w-full border-b border-outline-variant dark:border-outline flex justify-between items-center px-margin-desktop h-16 z-50">
<div class="flex items-center">
<span class="text-headline-md font-headline-md text-primary dark:text-primary-fixed-dim tracking-tight">Cổ Phục Atelier ERP</span>
</div>
<div class="flex items-center gap-4">
<div class="flex gap-2">
<button aria-label="notifications" class="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
<span class="material-symbols-outlined">notifications</span>
</button>
<button aria-label="help_outline" class="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
<span class="material-symbols-outlined">help_outline</span>
</button>
</div>
<div class="flex items-center gap-3 cursor-pointer active:opacity-80 p-2 rounded-lg hover:bg-surface-container-low transition-colors">
<span class="text-label-sm font-label-sm text-primary font-bold">Admin Profile</span>
<img alt="Administrator Portrait" class="w-8 h-8 rounded-full object-cover border border-outline-variant" data-alt="Professional portrait of an Asian male administrator in a tailored dark suit against a neutral studio background, conveying authority and competence in a high-end corporate setting with soft even lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-gUS3l8TUKgdQ6_2Lze_5HZYNhTjhKjBPRl6vf9ahFnzrIi01BZn6gL5a_kahRGUG2PO9E06H1muPvVDMmm7qD0tQI4wKHNramtG9G332xkoC4EOiimkgKztUlwccwV6LuNn4DlLohEh-NA4fkiD-rSig1l5ZmqUFaF6-0r3lU0vE_jwcyjIeSwHjRyHz3bqL738n564W_91hJsgZx-J1K-WALdcLiOhfkvE4pzWy9fbtp9siIthmQhrUD37MxIn9buJ504-wDa9k">
</div>
</div>
</nav>
<div class="flex flex-1 pt-16">
<!-- SideNavBar -->
<aside class="bg-surface-container-low dark:bg-surface-container fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-outline-variant dark:border-outline flex flex-col py-6 gap-2 z-40 hidden md:flex">
<div class="px-6 mb-4 flex flex-col items-center">
<img alt="System Administrator" class="w-16 h-16 rounded-full object-cover mb-2 border-2 border-outline-variant" data-alt="Professional portrait of an Asian male administrator in a tailored dark suit against a neutral studio background, conveying authority and competence in a high-end corporate setting with soft even lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD52Y6VwmvqbhHj_1n8COuiUZZCsMa97S4FaNRVjNU-Q7UfrQ7oXxpcUvC3kJ8lA1RYaMG73TpUzWrmg7DZ1POvkUdR6iM5FBy_fuRUBl1DxCmO8Nr5fsixsl_JyUH2jJBxLvWAr_l6hCLpS2UHAo97lOKCEhfP3q4k5yHtzw86Iy1zIKpB45cWi56LAjtAa69Cwxb_2dVqDdd4hkbFhPjOWUCzX-I9gBD0iDYXAuCntP8E-l0zXWCxC0a-B_Rk0aW9u01MvvNA4aAi">
<span class="text-headline-md font-headline-md text-on-surface">Admin Panel</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">System Control</span>
</div>
<nav class="flex-1 overflow-y-auto">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">admin_panel_settings</span>
<span class="text-label-md font-label-md">User Roles</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">psychology</span>
<span class="text-label-md font-label-md">AI Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">payments</span>
<span class="text-label-md font-label-md">Payments</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-lg mx-2 active:scale-[0.98] duration-200" href="#">
<span class="material-symbols-outlined text-on-primary">history_edu</span>
<span class="text-label-md font-label-md">Audit Logs</span>
</a>
</nav>
<div class="px-4 mt-auto">
<button class="w-full bg-lacquer-red text-on-primary py-2 rounded text-label-md font-label-md mb-4 hover:bg-primary transition-colors">Generate Report</button>
<div class="border-t border-outline-variant pt-2">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary mx-2 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="text-label-md font-label-md">Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary mx-2 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">contact_support</span>
<span class="text-label-md font-label-md">Support</span>
</a>
</div>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 md:ml-64 p-margin-mobile md:p-margin-desktop bg-warm-ivory w-full">
<!-- Page Header -->
<div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h1 class="text-headline-lg font-headline-lg text-on-surface mb-2">System Audit Logs</h1>
<p class="text-body-md font-body-md text-on-surface-variant max-w-2xl">Comprehensive record of all administrative actions, configuration changes, and system security events. Restricted access.</p>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 border border-weathered-bronze text-on-surface rounded text-label-md font-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">download</span> Export CSV
                    </button>
<button class="px-4 py-2 bg-lacquer-red text-on-primary rounded text-label-md font-label-md hover:bg-primary transition-colors flex items-center gap-2 shadow-sm shadow-oxblood/10">
<span class="material-symbols-outlined text-[18px]">filter_list</span> Advanced Filters
                    </button>
</div>
</div>
<!-- Filters Bar (Glassmorphism) -->
<div class="glass-panel rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
<div class="flex-1 min-w-[200px]">
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Date Range</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_today</span>
<input class="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-antique-gold focus:ring-1 focus:ring-antique-gold outline-none" type="text" value="Oct 01, 2023 - Oct 24, 2023">
</div>
</div>
<div class="flex-1 min-w-[150px]">
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Action Type</label>
<select class="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-antique-gold focus:ring-1 focus:ring-antique-gold outline-none appearance-none">
<option>All Actions</option>
<option>Security</option>
<option>Configuration</option>
<option>User Management</option>
</select>
</div>
<div class="flex-1 min-w-[150px]">
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Severity</label>
<select class="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-antique-gold focus:ring-1 focus:ring-antique-gold outline-none appearance-none">
<option>All Severities</option>
<option>Critical</option>
<option>Warning</option>
<option>Info</option>
</select>
</div>
<div class="flex-none">
<button class="px-4 py-2 border border-outline-variant text-on-surface rounded text-label-md font-label-md hover:bg-surface-container-low transition-colors bg-surface">
                        Reset
                    </button>
</div>
</div>
<!-- Data Table Container -->
<div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant">
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Timestamp</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">User / Role</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Action Type</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Description</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">IP Address</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider"></th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<!-- Row 1: Critical -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-24 14:32:05</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">NT</div>
<div>
<div class="text-label-md font-label-md text-on-surface">Nguyen T.</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Super Admin</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-error-container text-on-error-container text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[14px]">security</span> Security
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Changed global authentication policy: MFA required for all managers.</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-on-surface-variant font-mono">192.168.1.105</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-available text-label-sm font-label-sm border border-state-available/20">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Success
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
<!-- Row 2: Warning -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-24 11:15:22</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">LV</div>
<div>
<div class="text-label-md font-label-md text-on-surface">Le V.</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Inventory Mgr</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[14px]">inventory_2</span> Configuration
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Bulk updated deposit requirements for 50+ Imperial Robes.</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-on-surface-variant font-mono">10.0.0.42</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-reserved text-label-sm font-label-sm border border-state-reserved/20">
<span class="material-symbols-outlined text-[14px]">warning</span> Warning
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
<!-- Row 3: Info/Success -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-24 09:05:11</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">SY</div>
<div>
<div class="text-label-md font-label-md text-on-surface">System</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Automated</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-on-surface-variant text-label-sm font-label-sm border border-outline-variant">
<span class="material-symbols-outlined text-[14px]">backup</span> System
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Daily database backup completed successfully to AWS S3.</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-on-surface-variant font-mono">localhost</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-available text-label-sm font-label-sm border border-state-available/20">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Success
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
<!-- Row 4: Failed -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-23 22:45:01</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">UNK</div>
<div>
<div class="text-label-md font-label-md text-on-surface">Unknown</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Unauthenticated</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-error-container text-on-error-container text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[14px]">login</span> Auth
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Failed login attempt for Admin account (5th attempt).</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-error font-mono">203.0.113.45</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-damaged text-label-sm font-label-sm border border-state-damaged/20">
<span class="material-symbols-outlined text-[14px]">cancel</span> Failed
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
<!-- Row 5: User Management -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-23 15:20:00</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">NT</div>
<div>
<div class="text-label-md font-label-md text-on-surface">Nguyen T.</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Super Admin</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[14px]">manage_accounts</span> User Mgmt
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Revoked 'Delete' permissions for role 'Store Clerk'.</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-on-surface-variant font-mono">192.168.1.105</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-available text-label-sm font-label-sm border border-state-available/20">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Success
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination -->
<div class="px-4 py-3 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
<span class="text-body-sm font-body-sm text-on-surface-variant">Showing 1 to 5 of 1,248 entries</span>
<div class="flex gap-1">
<button class="p-1 rounded text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50" disabled="">
<span class="material-symbols-outlined text-[20px]">chevron_left</span>
</button>
<button class="w-8 h-8 rounded bg-lacquer-red text-on-primary text-label-sm font-label-sm flex items-center justify-center">1</button>
<button class="w-8 h-8 rounded text-on-surface hover:bg-surface-variant text-label-sm font-label-sm flex items-center justify-center transition-colors">2</button>
<button class="w-8 h-8 rounded text-on-surface hover:bg-surface-variant text-label-sm font-label-sm flex items-center justify-center transition-colors">3</button>
<span class="w-8 h-8 flex items-center justify-center text-on-surface-variant">...</span>
<button class="p-1 rounded text-on-surface hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
</div>
</div>
</div>
</main>
</div>
</body></html>

--Dashboard:

<!DOCTYPE html><html lang="vi"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Nhật Ký Truy Cập &amp; Kiểm Toán Hệ Thống | Cổ Phục Rental ERP</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&amp;family=Manrope:wght@200..800&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "state-damaged": "#A63D40",
                        "on-secondary-fixed": "#271900",
                        "secondary-fixed-dim": "#f7bd48",
                        "jade-green": "#00A86B",
                        "surface-container-high": "#fee2dd",
                        "on-error-container": "#93000a",
                        "error": "#ba1a1a",
                        "tertiary-fixed-dim": "#bcc3ff",
                        "primary": "#610000",
                        "on-surface-variant": "#5a403c",
                        "secondary-fixed": "#ffdea6",
                        "antique-gold": "#C5A059",
                        "on-primary": "#ffffff",
                        "on-secondary": "#ffffff",
                        "secondary": "#7b5800",
                        "inverse-primary": "#ffb4a8",
                        "on-background": "#261816",
                        "on-error": "#ffffff",
                        "on-secondary-container": "#715000",
                        "inverse-on-surface": "#ffedea",
                        "surface-dim": "#efd4d0",
                        "on-surface": "#261816",
                        "muted-teal": "#4F797B",
                        "surface": "#fff8f6",
                        "on-tertiary-fixed": "#000d60",
                        "ink-black": "#1A1A1A",
                        "tertiary-fixed": "#dfe0ff",
                        "on-primary-fixed": "#410000",
                        "clay-brown": "#8C6A5E",
                        "tertiary": "#00178d",
                        "outline": "#8e706b",
                        "surface-container": "#ffe9e6",
                        "on-secondary-fixed-variant": "#5d4200",
                        "on-tertiary-container": "#9ea9ff",
                        "background": "#fff8f6",
                        "state-maintenance": "#914E36",
                        "state-rented": "#2E3B5E",
                        "state-available": "#3D7A63",
                        "surface-variant": "#f8dcd8",
                        "on-primary-fixed-variant": "#920703",
                        "on-primary-container": "#ff907f",
                        "on-tertiary-fixed-variant": "#0d2ccc",
                        "on-tertiary": "#ffffff",
                        "surface-container-low": "#fff0ee",
                        "primary-fixed-dim": "#ffb4a8",
                        "surface-container-highest": "#f8dcd8",
                        "oxblood": "#4A0404",
                        "weathered-bronze": "#6E5E40",
                        "inverse-surface": "#3d2c2a",
                        "primary-fixed": "#ffdad4",
                        "error-container": "#ffdad6",
                        "secondary-container": "#fdc34d",
                        "state-laundry": "#7E97A6",
                        "lacquer-red": "#8B0000",
                        "tertiary-container": "#0025c8",
                        "surface-tint": "#b52619",
                        "surface-container-lowest": "#ffffff",
                        "state-reserved": "#D4AF37",
                        "primary-container": "#8b0000",
                        "warm-ivory": "#F9F5F0",
                        "surface-bright": "#fff8f6",
                        "state-inspection": "#B3541E",
                        "outline-variant": "#e3beb8",
                        "state-completed": "#1B4D3E"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "margin-tablet": "32px",
                        "container-max-width": "1440px",
                        "margin-desktop": "64px",
                        "unit": "4px",
                        "margin-mobile": "16px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "label-md": ["Manrope"],
                        "body-md": ["Manrope"],
                        "headline-md": ["EB Garamond"],
                        "body-sm": ["Manrope"],
                        "display-lg": ["EB Garamond"],
                        "display-md": ["EB Garamond"],
                        "body-lg": ["Manrope"],
                        "headline-lg": ["EB Garamond"],
                        "label-sm": ["Manrope"],
                        "headline-lg-mobile": ["EB Garamond"]
                    },
                    "fontSize": {
                        "label-md": ["13px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                        "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "500"}],
                        "display-md": ["36px", {"lineHeight": "1.2", "fontWeight": "500"}],
                        "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "600"}],
                        "label-sm": ["11px", {"lineHeight": "1.2", "letterSpacing": "0.08em", "fontWeight": "700"}],
                        "headline-lg-mobile": ["28px", {"lineHeight": "1.3", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
<style>
        body { background-color: #F9F5F0; color: #261816; font-family: 'Manrope', sans-serif; }
        .erp-table-row:hover { background-color: #fff0ee; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid #E5E0D8; }
    </style>
</head>
<body class="flex flex-col min-h-screen">
<!-- TopNavBar -->
<nav class="bg-surface dark:bg-inverse-surface fixed top-0 w-full border-b border-outline-variant dark:border-outline flex justify-between items-center px-margin-desktop h-16 z-50">
<div class="flex items-center">
<span class="text-headline-md font-headline-md text-primary dark:text-primary-fixed-dim tracking-tight">Cổ Phục Atelier ERP</span>
</div>
<div class="flex items-center gap-4">
<div class="flex gap-2">
<button aria-label="notifications" class="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
<span class="material-symbols-outlined">notifications</span>
</button>
<button aria-label="help_outline" class="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
<span class="material-symbols-outlined">help_outline</span>
</button>
</div>
<div class="flex items-center gap-3 cursor-pointer active:opacity-80 p-2 rounded-lg hover:bg-surface-container-low transition-colors">
<span class="text-label-sm font-label-sm text-primary font-bold">Admin Profile</span>
<img alt="Administrator Portrait" class="w-8 h-8 rounded-full object-cover border border-outline-variant" data-alt="Professional portrait of an Asian male administrator in a tailored dark suit against a neutral studio background, conveying authority and competence in a high-end corporate setting with soft even lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-gUS3l8TUKgdQ6_2Lze_5HZYNhTjhKjBPRl6vf9ahFnzrIi01BZn6gL5a_kahRGUG2PO9E06H1muPvVDMmm7qD0tQI4wKHNramtG9G332xkoC4EOiimkgKztUlwccwV6LuNn4DlLohEh-NA4fkiD-rSig1l5ZmqUFaF6-0r3lU0vE_jwcyjIeSwHjRyHz3bqL738n564W_91hJsgZx-J1K-WALdcLiOhfkvE4pzWy9fbtp9siIthmQhrUD37MxIn9buJ504-wDa9k">
</div>
</div>
</nav>
<div class="flex flex-1 pt-16">
<!-- SideNavBar -->
<aside class="bg-surface-container-low dark:bg-surface-container fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-outline-variant dark:border-outline flex flex-col py-6 gap-2 z-40 hidden md:flex">
<div class="px-6 mb-4 flex flex-col items-center">
<img alt="System Administrator" class="w-16 h-16 rounded-full object-cover mb-2 border-2 border-outline-variant" data-alt="Professional portrait of an Asian male administrator in a tailored dark suit against a neutral studio background, conveying authority and competence in a high-end corporate setting with soft even lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD52Y6VwmvqbhHj_1n8COuiUZZCsMa97S4FaNRVjNU-Q7UfrQ7oXxpcUvC3kJ8lA1RYaMG73TpUzWrmg7DZ1POvkUdR6iM5FBy_fuRUBl1DxCmO8Nr5fsixsl_JyUH2jJBxLvWAr_l6hCLpS2UHAo97lOKCEhfP3q4k5yHtzw86Iy1zIKpB45cWi56LAjtAa69Cwxb_2dVqDdd4hkbFhPjOWUCzX-I9gBD0iDYXAuCntP8E-l0zXWCxC0a-B_Rk0aW9u01MvvNA4aAi">
<span class="text-headline-md font-headline-md text-on-surface">Admin Panel</span>
<span class="text-label-sm font-label-sm text-on-surface-variant">System Control</span>
</div>
<nav class="flex-1 overflow-y-auto">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">admin_panel_settings</span>
<span class="text-label-md font-label-md">User Roles</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">psychology</span>
<span class="text-label-md font-label-md">AI Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all mx-2 rounded-lg group" href="#">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">payments</span>
<span class="text-label-md font-label-md">Payments</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-lg mx-2 active:scale-[0.98] duration-200" href="#">
<span class="material-symbols-outlined text-on-primary">history_edu</span>
<span class="text-label-md font-label-md">Audit Logs</span>
</a>
</nav>
<div class="px-4 mt-auto">
<button class="w-full bg-lacquer-red text-on-primary py-2 rounded text-label-md font-label-md mb-4 hover:bg-primary transition-colors">Generate Report</button>
<div class="border-t border-outline-variant pt-2">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary mx-2 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="text-label-md font-label-md">Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary mx-2 rounded-lg transition-all" href="#">
<span class="material-symbols-outlined">contact_support</span>
<span class="text-label-md font-label-md">Support</span>
</a>
</div>
</div>
</aside>
<!-- Main Content -->
<main class="flex-1 md:ml-64 p-margin-mobile md:p-margin-desktop bg-warm-ivory w-full">
<!-- Page Header -->
<div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h1 class="text-headline-lg font-headline-lg text-on-surface mb-2">System Audit Logs</h1>
<p class="text-body-md font-body-md text-on-surface-variant max-w-2xl">Comprehensive record of all administrative actions, configuration changes, and system security events. Restricted access.</p>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 border border-weathered-bronze text-on-surface rounded text-label-md font-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">download</span> Export CSV
                    </button>
<button class="px-4 py-2 bg-lacquer-red text-on-primary rounded text-label-md font-label-md hover:bg-primary transition-colors flex items-center gap-2 shadow-sm shadow-oxblood/10">
<span class="material-symbols-outlined text-[18px]">filter_list</span> Advanced Filters
                    </button>
</div>
</div>
<!-- Filters Bar (Glassmorphism) -->
<div class="glass-panel rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
<div class="flex-1 min-w-[200px]">
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Date Range</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_today</span>
<input class="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-antique-gold focus:ring-1 focus:ring-antique-gold outline-none" type="text" value="Oct 01, 2023 - Oct 24, 2023">
</div>
</div>
<div class="flex-1 min-w-[150px]">
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Action Type</label>
<select class="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-antique-gold focus:ring-1 focus:ring-antique-gold outline-none appearance-none">
<option>All Actions</option>
<option>Security</option>
<option>Configuration</option>
<option>User Management</option>
</select>
</div>
<div class="flex-1 min-w-[150px]">
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Severity</label>
<select class="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-antique-gold focus:ring-1 focus:ring-antique-gold outline-none appearance-none">
<option>All Severities</option>
<option>Critical</option>
<option>Warning</option>
<option>Info</option>
</select>
</div>
<div class="flex-none">
<button class="px-4 py-2 border border-outline-variant text-on-surface rounded text-label-md font-label-md hover:bg-surface-container-low transition-colors bg-surface">
                        Reset
                    </button>
</div>
</div>
<!-- Data Table Container -->
<div class="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant">
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Timestamp</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">User / Role</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Action Type</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Description</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">IP Address</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
<th class="py-3 px-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider"></th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<!-- Row 1: Critical -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-24 14:32:05</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">NT</div>
<div>
<div class="text-label-md font-label-md text-on-surface">Nguyen T.</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Super Admin</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-error-container text-on-error-container text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[14px]">security</span> Security
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Changed global authentication policy: MFA required for all managers.</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-on-surface-variant font-mono">192.168.1.105</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-available text-label-sm font-label-sm border border-state-available/20">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Success
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
<!-- Row 2: Warning -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-24 11:15:22</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">LV</div>
<div>
<div class="text-label-md font-label-md text-on-surface">Le V.</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Inventory Mgr</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[14px]">inventory_2</span> Configuration
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Bulk updated deposit requirements for 50+ Imperial Robes.</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-on-surface-variant font-mono">10.0.0.42</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-reserved text-label-sm font-label-sm border border-state-reserved/20">
<span class="material-symbols-outlined text-[14px]">warning</span> Warning
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
<!-- Row 3: Info/Success -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-24 09:05:11</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">SY</div>
<div>
<div class="text-label-md font-label-md text-on-surface">System</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Automated</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-on-surface-variant text-label-sm font-label-sm border border-outline-variant">
<span class="material-symbols-outlined text-[14px]">backup</span> System
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Daily database backup completed successfully to AWS S3.</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-on-surface-variant font-mono">localhost</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-available text-label-sm font-label-sm border border-state-available/20">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Success
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
<!-- Row 4: Failed -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-23 22:45:01</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">UNK</div>
<div>
<div class="text-label-md font-label-md text-on-surface">Unknown</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Unauthenticated</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-error-container text-on-error-container text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[14px]">login</span> Auth
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Failed login attempt for Admin account (5th attempt).</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-error font-mono">203.0.113.45</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-damaged text-label-sm font-label-sm border border-state-damaged/20">
<span class="material-symbols-outlined text-[14px]">cancel</span> Failed
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
<!-- Row 5: User Management -->
<tr class="erp-table-row transition-colors cursor-pointer">
<td class="py-4 px-4 whitespace-nowrap">
<div class="text-body-sm font-body-sm text-on-surface">2023-10-23 15:20:00</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">ICT (+7)</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-label-sm">NT</div>
<div>
<div class="text-label-md font-label-md text-on-surface">Nguyen T.</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">Super Admin</div>
</div>
</div>
</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[14px]">manage_accounts</span> User Mgmt
                                    </span>
</td>
<td class="py-4 px-4">
<div class="text-body-sm font-body-sm text-on-surface max-w-md truncate">Revoked 'Delete' permissions for role 'Store Clerk'.</div>
</td>
<td class="py-4 px-4 whitespace-nowrap text-body-sm font-body-sm text-on-surface-variant font-mono">192.168.1.105</td>
<td class="py-4 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-variant text-state-available text-label-sm font-label-sm border border-state-available/20">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Success
                                    </span>
</td>
<td class="py-4 px-4 whitespace-nowrap text-right text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined">more_vert</span>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination -->
<div class="px-4 py-3 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
<span class="text-body-sm font-body-sm text-on-surface-variant">Showing 1 to 5 of 1,248 entries</span>
<div class="flex gap-1">
<button class="p-1 rounded text-on-surface-variant hover:bg-surface-variant transition-colors disabled:opacity-50" disabled="">
<span class="material-symbols-outlined text-[20px]">chevron_left</span>
</button>
<button class="w-8 h-8 rounded bg-lacquer-red text-on-primary text-label-sm font-label-sm flex items-center justify-center">1</button>
<button class="w-8 h-8 rounded text-on-surface hover:bg-surface-variant text-label-sm font-label-sm flex items-center justify-center transition-colors">2</button>
<button class="w-8 h-8 rounded text-on-surface hover:bg-surface-variant text-label-sm font-label-sm flex items-center justify-center transition-colors">3</button>
<span class="w-8 h-8 flex items-center justify-center text-on-surface-variant">...</span>
<button class="p-1 rounded text-on-surface hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
</div>
</div>
</div>
</main>
</div>
</body></html>

---User roles admin quản lý

<!DOCTYPE html><html lang="vi"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Quản Lý Vai Trò &amp; Phân Quyền | Cổ Phục Rental ERP</title>
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600&amp;family=Manrope:wght@400;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "state-damaged": "#A63D40",
                    "on-secondary-fixed": "#271900",
                    "secondary-fixed-dim": "#f7bd48",
                    "jade-green": "#00A86B",
                    "surface-container-high": "#fee2dd",
                    "on-error-container": "#93000a",
                    "error": "#ba1a1a",
                    "tertiary-fixed-dim": "#bcc3ff",
                    "primary": "#610000",
                    "on-surface-variant": "#5a403c",
                    "secondary-fixed": "#ffdea6",
                    "antique-gold": "#C5A059",
                    "on-primary": "#ffffff",
                    "on-secondary": "#ffffff",
                    "secondary": "#7b5800",
                    "inverse-primary": "#ffb4a8",
                    "on-background": "#261816",
                    "on-error": "#ffffff",
                    "on-secondary-container": "#715000",
                    "inverse-on-surface": "#ffedea",
                    "surface-dim": "#efd4d0",
                    "on-surface": "#261816",
                    "muted-teal": "#4F797B",
                    "surface": "#fff8f6",
                    "on-tertiary-fixed": "#000d60",
                    "ink-black": "#1A1A1A",
                    "tertiary-fixed": "#dfe0ff",
                    "on-primary-fixed": "#410000",
                    "clay-brown": "#8C6A5E",
                    "tertiary": "#00178d",
                    "outline": "#8e706b",
                    "surface-container": "#ffe9e6",
                    "on-secondary-fixed-variant": "#5d4200",
                    "on-tertiary-container": "#9ea9ff",
                    "background": "#fff8f6",
                    "state-maintenance": "#914E36",
                    "state-rented": "#2E3B5E",
                    "state-available": "#3D7A63",
                    "surface-variant": "#f8dcd8",
                    "on-primary-fixed-variant": "#920703",
                    "on-primary-container": "#ff907f",
                    "on-tertiary-fixed-variant": "#0d2ccc",
                    "on-tertiary": "#ffffff",
                    "surface-container-low": "#fff0ee",
                    "primary-fixed-dim": "#ffb4a8",
                    "surface-container-highest": "#f8dcd8",
                    "oxblood": "#4A0404",
                    "weathered-bronze": "#6E5E40",
                    "inverse-surface": "#3d2c2a",
                    "primary-fixed": "#ffdad4",
                    "error-container": "#ffdad6",
                    "secondary-container": "#fdc34d",
                    "state-laundry": "#7E97A6",
                    "lacquer-red": "#8B0000",
                    "tertiary-container": "#0025c8",
                    "surface-tint": "#b52619",
                    "surface-container-lowest": "#ffffff",
                    "state-reserved": "#D4AF37",
                    "primary-container": "#8b0000",
                    "warm-ivory": "#F9F5F0",
                    "surface-bright": "#fff8f6",
                    "state-inspection": "#B3541E",
                    "outline-variant": "#e3beb8",
                    "state-completed": "#1B4D3E"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "margin-tablet": "32px",
                    "container-max-width": "1440px",
                    "margin-desktop": "64px",
                    "unit": "4px",
                    "margin-mobile": "16px",
                    "gutter": "24px"
            },
            "fontFamily": {
                    "label-md": ["Manrope"],
                    "body-md": ["Manrope"],
                    "headline-md": ["EB Garamond"],
                    "body-sm": ["Manrope"],
                    "display-lg": ["EB Garamond"],
                    "display-md": ["EB Garamond"],
                    "body-lg": ["Manrope"],
                    "headline-lg": ["EB Garamond"],
                    "label-sm": ["Manrope"],
                    "headline-lg-mobile": ["EB Garamond"]
            },
            "fontSize": {
                    "label-md": ["13px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600"}],
                    "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                    "headline-md": ["24px", {"lineHeight": "1.4", "fontWeight": "600"}],
                    "body-sm": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
                    "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "500"}],
                    "display-md": ["36px", {"lineHeight": "1.2", "fontWeight": "500"}],
                    "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "headline-lg": ["32px", {"lineHeight": "1.3", "fontWeight": "600"}],
                    "label-sm": ["11px", {"lineHeight": "1.2", "letterSpacing": "0.08em", "fontWeight": "700"}],
                    "headline-lg-mobile": ["28px", {"lineHeight": "1.3", "fontWeight": "600"}]
            }
          }
        }
      }
    </script>
<style>
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: theme('colors.outline-variant');
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-warm-ivory text-on-surface font-body-md antialiased overflow-x-hidden">
<aside class="fixed left-0 top-0 h-screen w-64 bg-surface-container-low dark:bg-surface-container border-r border-outline-variant dark:border-outline flex flex-col h-full py-6 gap-2 z-50">
<div class="px-6 mb-8 flex flex-col items-center text-center">
<h1 class="text-headline-md font-headline-md text-lacquer-red mb-4">Admin Panel</h1>
<img alt="System Administrator" class="w-16 h-16 rounded-full border border-outline-variant object-cover mb-2" data-alt="A close-up portrait photography of a sophisticated Vietnamese professional male administrator wearing a subtle, modern deep oxblood suit. The lighting is soft, natural, and creates a premium, calm, light-mode atelier aesthetic. The background is a clean warm ivory surface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPWMPyZn9yWQKqY6R4dqwlWmzxEfgUqzbCOa_JkJr8f3eErh-06x9Be9UqMcusIU__pBg9gSO9YVWSljkE2p66v2jqFCrT5OxQOf4JxshRW_6SsfO0xmVbZYkjgnqehbbTF6i3gVXmbxjO_bZss2RjSRa3tEg9Hf4tES6EfGh58NGGwv5tMHlVaXeh4Z1h3nOz8lxPhUuZVDophYH5kkvQV8mlarNzJYw9sId6J1hQSW-YKxiIlbZ-QcdUcJRVZPMGP_BA9ELoPOuk">
<div class="text-label-md font-label-md text-primary dark:text-inverse-primary">System Administrator</div>
<div class="text-label-sm font-label-sm text-on-surface-variant">System Control</div>
</div>
<div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all rounded-lg" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all rounded-lg" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-lg mx-2 transition-all shadow-[0_4px_12px_rgba(74,4,4,0.1)]" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">admin_panel_settings</span>
<span class="text-label-md font-label-md">User Roles</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all rounded-lg" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">psychology</span>
<span class="text-label-md font-label-md">AI Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all rounded-lg" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">payments</span>
<span class="text-label-md font-label-md">Payments</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all rounded-lg" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">history_edu</span>
<span class="text-label-md font-label-md">Audit Logs</span>
</a>
</div>
<div class="px-4 mt-auto pt-4 border-t border-outline-variant/50">
<button class="w-full py-3 px-4 bg-surface border border-outline text-primary text-label-md font-label-md rounded hover:bg-surface-container-low transition-colors mb-4 flex justify-center items-center gap-2">
                Generate Report
            </button>
<div class="flex flex-col gap-1">
<a class="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors mx-2" href="#">
<span class="material-symbols-outlined text-[20px]">settings</span>
<span class="text-label-sm font-label-sm">Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors mx-2" href="#">
<span class="material-symbols-outlined text-[20px]">contact_support</span>
<span class="text-label-sm font-label-sm">Support</span>
</a>
</div>
</div>
</aside>
<div class="ml-64 flex flex-col min-h-screen">
<header class="bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline flex justify-between items-center w-full px-margin-desktop h-16 z-40 sticky top-0">
<div class="flex items-center gap-4">
<div class="flex items-center bg-surface-container-low border border-outline-variant rounded-full px-4 py-1.5 focus-within:border-antique-gold focus-within:ring-1 focus-within:ring-antique-gold/20 transition-all">
<span class="material-symbols-outlined text-on-surface-variant mr-2">search</span>
<input class="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm text-on-surface placeholder-on-surface-variant/70 w-64" placeholder="Search system..." type="text">
</div>
</div>
<div class="flex items-center gap-6">
<div class="text-headline-md font-headline-md text-primary dark:text-primary-fixed-dim tracking-tight hidden lg:block">Cổ Phục Atelier ERP</div>
<div class="flex items-center gap-4 border-l border-outline-variant pl-6 ml-2">
<button class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80">
<span class="material-symbols-outlined">help_outline</span>
</button>
<button class="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded-full cursor-pointer active:opacity-80 border border-outline-variant/50">
<span class="text-label-sm font-label-sm text-primary">Admin Profile</span>
</button>
</div>
</div>
</header>
<main class="flex-1 p-margin-desktop pb-24">
<div class="mb-8 flex justify-between items-end">
<div>
<h2 class="text-display-md font-display-md text-on-surface mb-2">Quản Lý Vai Trò</h2>
<p class="text-body-md font-body-md text-on-surface-variant max-w-2xl">Thiết lập và quản lý quyền hạn truy cập hệ thống cho từng nhóm người dùng để đảm bảo an toàn thông tin và quy trình làm việc.</p>
</div>
<button class="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded hover:bg-oxblood transition-colors shadow-[0_4px_14px_rgba(74,4,4,0.15)] flex items-center gap-2">
<span class="material-symbols-outlined text-[20px]">add</span>
                    Tạo Vai Trò Mới
                </button>
</div>
<div class="flex gap-gutter items-start">
<div class="w-80 flex-shrink-0 bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div class="p-5 border-b border-outline-variant/60 bg-surface-container-lowest">
<h3 class="text-headline-md font-headline-md text-on-surface">Danh Sách Vai Trò</h3>
</div>
<div class="flex flex-col p-2 gap-1">
<button class="flex items-start gap-4 p-4 text-left rounded-lg transition-colors hover:bg-surface-container-low">
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0">
<span class="material-symbols-outlined">shield_person</span>
</div>
<div>
<div class="text-label-md font-label-md text-on-surface mb-1">Super Admin</div>
<div class="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">Quyền truy cập toàn bộ hệ thống và thiết lập cốt lõi.</div>
</div>
</button>
<button class="flex items-start gap-4 p-4 text-left rounded-lg transition-colors bg-surface-container border border-primary/20 shadow-[inset_4px_0_0_0_theme(colors.primary)]">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">manage_accounts</span>
</div>
<div>
<div class="text-label-md font-label-md text-primary mb-1">Manager</div>
<div class="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">Quản lý vận hành hàng ngày, kho bãi và nhân sự cấp dưới.</div>
</div>
</button>
<button class="flex items-start gap-4 p-4 text-left rounded-lg transition-colors hover:bg-surface-container-low">
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0">
<span class="material-symbols-outlined">badge</span>
</div>
<div>
<div class="text-label-md font-label-md text-on-surface mb-1">Staff / Consultant</div>
<div class="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">Tiếp khách, xử lý đơn đặt hàng và tư vấn trang phục.</div>
</div>
</button>
<button class="flex items-start gap-4 p-4 text-left rounded-lg transition-colors hover:bg-surface-container-low">
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0">
<span class="material-symbols-outlined">face</span>
</div>
<div>
<div class="text-label-md font-label-md text-on-surface mb-1">Customer (Portal)</div>
<div class="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">Quyền hạn cơ bản trên giao diện front-end của khách hàng.</div>
</div>
</button>
</div>
</div>
<div class="flex-1 bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
<div class="p-6 border-b border-outline-variant/60 flex justify-between items-center bg-surface-container-lowest">
<div>
<h3 class="text-headline-lg font-headline-lg text-primary mb-1">Chi Tiết Phân Quyền: Manager</h3>
<p class="text-body-sm font-body-sm text-on-surface-variant">Điều chỉnh các thao tác mà vai trò này được phép thực hiện trên từng phân hệ.</p>
</div>
<button class="px-5 py-2.5 bg-warm-ivory border border-outline text-on-surface font-label-md text-label-md rounded hover:bg-surface-container transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">save</span>
                            Lưu Thay Đổi
                        </button>
</div>
<div class="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8">
<div class="permission-group">
<div class="flex items-center gap-3 mb-4 border-b border-outline-variant/40 pb-2">
<span class="material-symbols-outlined text-secondary">inventory_2</span>
<h4 class="text-headline-md font-headline-md text-on-surface">Kho Hàng (Inventory)</h4>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr>
<th class="py-3 pr-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant w-1/3">Tài nguyên</th>
<th class="py-3 px-2 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Xem</th>
<th class="py-3 px-2 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Thêm</th>
<th class="py-3 px-2 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Sửa</th>
<th class="py-3 px-2 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Xóa</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/30">
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="py-3 pr-4 font-body-md text-body-md text-on-surface">Sản phẩm Cổ phục</td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="py-3 pr-4 font-body-md text-body-md text-on-surface">Danh mục &amp; Bộ sưu tập</td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="permission-group">
<div class="flex items-center gap-3 mb-4 border-b border-outline-variant/40 pb-2">
<span class="material-symbols-outlined text-secondary">assignment</span>
<h4 class="text-headline-md font-headline-md text-on-surface">Đơn Đặt &amp; Thuê (Bookings)</h4>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr>
<th class="py-3 pr-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant w-1/3">Tài nguyên</th>
<th class="py-3 px-2 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Xem</th>
<th class="py-3 px-2 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Thêm</th>
<th class="py-3 px-2 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Sửa</th>
<th class="py-3 px-2 text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Xóa</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/30">
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="py-3 pr-4 font-body-md text-body-md text-on-surface">Hợp đồng thuê</td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input checked="" class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
<td class="py-3 px-2 text-center"><label class="inline-flex cursor-pointer"><input class="peer sr-only" type="checkbox"><div class="w-5 h-5 border border-outline-variant rounded bg-surface peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all"><span class="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 font-bold">check</span></div></label></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
</body></html>

----
cấu hình hệ thống:

<!DOCTYPE html><html class="light" lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Cấu Hình Hệ Thống &amp; Trí Tuệ Nhân Tạo | Cổ Phục Rental ERP</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&amp;family=Manrope:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "state-damaged": "#A63D40", "on-secondary-fixed": "#271900", "secondary-fixed-dim": "#f7bd48", "jade-green": "#00A86B",
                        "surface-container-high": "#fee2dd", "on-error-container": "#93000a", "error": "#ba1a1a", "tertiary-fixed-dim": "#bcc3ff",
                        "primary": "#610000", "on-surface-variant": "#5a403c", "secondary-fixed": "#ffdea6", "antique-gold": "#C5A059",
                        "on-primary": "#ffffff", "on-secondary": "#ffffff", "secondary": "#7b5800", "inverse-primary": "#ffb4a8",
                        "on-background": "#261816", "on-error": "#ffffff", "on-secondary-container": "#715000", "inverse-on-surface": "#ffedea",
                        "surface-dim": "#efd4d0", "on-surface": "#261816", "muted-teal": "#4F797B", "surface": "#fff8f6",
                        "on-tertiary-fixed": "#000d60", "ink-black": "#1A1A1A", "tertiary-fixed": "#dfe0ff", "on-primary-fixed": "#410000",
                        "clay-brown": "#8C6A5E", "tertiary": "#00178d", "outline": "#8e706b", "surface-container": "#ffe9e6",
                        "on-secondary-fixed-variant": "#5d4200", "on-tertiary-container": "#9ea9ff", "background": "#fff8f6",
                        "state-maintenance": "#914E36", "state-rented": "#2E3B5E", "state-available": "#3D7A63", "surface-variant": "#f8dcd8",
                        "on-primary-fixed-variant": "#920703", "on-primary-container": "#ff907f", "on-tertiary-fixed-variant": "#0d2ccc",
                        "on-tertiary": "#ffffff", "surface-container-low": "#fff0ee", "primary-fixed-dim": "#ffb4a8",
                        "surface-container-highest": "#f8dcd8", "oxblood": "#4A0404", "weathered-bronze": "#6E5E40", "inverse-surface": "#3d2c2a",
                        "primary-fixed": "#ffdad4", "error-container": "#ffdad6", "secondary-container": "#fdc34d", "state-laundry": "#7E97A6",
                        "lacquer-red": "#8B0000", "tertiary-container": "#0025c8", "surface-tint": "#b52619", "surface-container-lowest": "#ffffff",
                        "state-reserved": "#D4AF37", "primary-container": "#8b0000", "warm-ivory": "#F9F5F0", "surface-bright": "#fff8f6",
                        "state-inspection": "#B3541E", "outline-variant": "#e3beb8", "state-completed": "#1B4D3E"
                    },
                    borderRadius: {
                        DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", full: "0.75rem"
                    },
                    spacing: {
                        "margin-tablet": "32px", "container-max-width": "1440px", "margin-desktop": "64px",
                        "unit": "4px", "margin-mobile": "16px", "gutter": "24px"
                    },
                    fontFamily: {
                        "label-md": ["Manrope"], "body-md": ["Manrope"], "headline-md": ["EB Garamond"],
                        "body-sm": ["Manrope"], "display-lg": ["EB Garamond"], "display-md": ["EB Garamond"],
                        "body-lg": ["Manrope"], "headline-lg": ["EB Garamond"], "label-sm": ["Manrope"],
                        "headline-lg-mobile": ["EB Garamond"]
                    },
                    fontSize: {
                        "label-md": ["13px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
                        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
                        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
                        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
                        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" }],
                        "display-md": ["36px", { lineHeight: "1.2", fontWeight: "500" }],
                        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
                        "headline-lg": ["32px", { lineHeight: "1.3", fontWeight: "600" }],
                        "label-sm": ["11px", { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "700" }],
                        "headline-lg-mobile": ["28px", { lineHeight: "1.3", fontWeight: "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .input-erp {
            @apply w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-surface font-body-md focus:border-antique-gold focus:ring-0 transition-colors;
        }
    </style>
</head>
<body class="bg-surface-container-low text-on-surface font-body-md min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
<!-- TopNavBar -->
<header class="fixed top-0 w-full bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline flex justify-between items-center px-margin-desktop h-16 z-50">
<div class="flex items-center gap-4">
<span class="text-headline-md font-headline-md text-primary dark:text-primary-fixed-dim tracking-tight">Cổ Phục Atelier ERP</span>
</div>
<div class="flex items-center gap-6">
<div class="relative hidden md:flex items-center">
<span class="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]" data-icon="search">search</span>
<input class="pl-10 pr-4 py-1.5 bg-surface-container rounded-full border-0 focus:ring-1 focus:ring-antique-gold text-body-sm font-body-sm w-64 placeholder:text-on-surface-variant/50" placeholder="Search system settings..." type="text">
</div>
<div class="flex items-center gap-4">
<button class="hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded-full p-2 text-on-surface-variant dark:text-surface-variant cursor-pointer active:opacity-80">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors rounded-full p-2 text-on-surface-variant dark:text-surface-variant cursor-pointer active:opacity-80">
<span class="material-symbols-outlined" data-icon="help_outline">help_outline</span>
</button>
<div class="flex items-center gap-3 pl-4 border-l border-outline-variant ml-2 cursor-pointer hover:opacity-80 transition-opacity">
<img alt="Administrator Portrait" class="w-8 h-8 rounded-full border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBubCoPTzzYev16TO7veEaZKvfYChSsGFtpO5UyUfwuOgxP1Q6sWjmUL37nmr0ysSfh1OHxuym3i9wioSWCWaepRbNpzfkvbGkgAT3TQKo4VLxCp4OpnFvwCvYY0010aJfkiLJE4q-M5Eexf4ca5YawQHGIzPCYQQDCRX2vHNb7vtZ0wuxgZuT03zYTFSzlWyPL7BgWLywljcvr1lhtnJ8koPhI3SrAkna8q9YPdH_htKr3xXRIHE3EEIXH4MsAcv23n8dfFlJcPdrh">
<span class="text-label-md font-label-md text-primary dark:text-inverse-primary hidden lg:block">Admin Profile</span>
</div>
</div>
</div>
</header>
<!-- SideNavBar -->
<nav class="fixed left-0 top-0 h-screen w-64 bg-surface-container-low dark:bg-surface-container border-r border-outline-variant dark:border-outline flex flex-col py-6 gap-2 pt-20 z-40 hidden md:flex">
<div class="px-6 mb-6">
<h2 class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Admin Panel</h2>
<p class="text-body-sm font-body-sm text-on-surface opacity-70">System Control</p>
</div>
<div class="flex-1 overflow-y-auto px-2">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 rounded-lg hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all active:scale-[0.98] duration-200" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="text-label-md font-label-md">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 rounded-lg hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all active:scale-[0.98] duration-200" href="#">
<span class="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
<span class="text-label-md font-label-md">Inventory</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 rounded-lg hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all active:scale-[0.98] duration-200" href="#">
<span class="material-symbols-outlined" data-icon="admin_panel_settings">admin_panel_settings</span>
<span class="text-label-md font-label-md">User Roles</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-lg mx-2 transition-all active:scale-[0.98] duration-200 shadow-sm" href="#">
<span class="material-symbols-outlined" data-icon="psychology" data-weight="fill" style="font-variation-settings: 'FILL' 1;">psychology</span>
<span class="text-label-md font-label-md font-bold">AI Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 rounded-lg hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all active:scale-[0.98] duration-200" href="#">
<span class="material-symbols-outlined" data-icon="payments">payments</span>
<span class="text-label-md font-label-md">Payments</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim mx-2 rounded-lg hover:bg-surface-container-high dark:hover:bg-surface-variant transition-all active:scale-[0.98] duration-200" href="#">
<span class="material-symbols-outlined" data-icon="history_edu">history_edu</span>
<span class="text-label-md font-label-md">Audit Logs</span>
</a>
</div>
<div class="px-4 mt-auto border-t border-outline-variant pt-4 mx-2">
<button class="w-full flex items-center justify-center gap-2 py-2.5 bg-surface text-on-surface border border-outline-variant rounded hover:border-primary transition-colors text-label-md font-label-md">
<span class="material-symbols-outlined text-[18px]">summarize</span>
                Generate Report
            </button>
<div class="mt-4 flex flex-col gap-1">
<a class="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">
<span class="material-symbols-outlined text-[18px]" data-icon="settings">settings</span>
                    Settings
                </a>
<a class="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">
<span class="material-symbols-outlined text-[18px]" data-icon="contact_support">contact_support</span>
                    Support
                </a>
</div>
</div>
</nav>
<!-- Main Content Canvas -->
<main class="md:ml-64 pt-16 min-h-screen px-margin-mobile md:px-margin-desktop py-8">
<!-- Page Header -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
<div>
<p class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">home</span> / System / AI Configuration
                </p>
<h1 class="text-display-md font-display-md text-on-surface">Cấu Hình Hệ Thống &amp; Trí Tuệ Nhân Tạo</h1>
</div>
<div class="flex gap-3">
<button class="px-6 py-2.5 border border-outline-variant text-on-surface font-label-md rounded hover:bg-surface-container transition-colors">Discard</button>
<button class="px-6 py-2.5 bg-lacquer-red text-white font-label-md rounded shadow-sm hover:bg-primary transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">save</span>
                    Save Changes
                </button>
</div>
</div>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-12 gap-gutter">
<!-- AI Engine Config Card -->
<div class="col-span-12 xl:col-span-8 bg-surface rounded-lg border border-outline-variant p-6 shadow-sm flex flex-col">
<div class="flex justify-between items-start mb-6 border-b border-outline-variant pb-4">
<div>
<h2 class="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-antique-gold">model_training</span>
                            AI Engine Parameters
                        </h2>
<p class="text-body-sm font-body-sm text-on-surface-variant mt-1">Configure credentials for the Heritage-V3.2 neural network integration.</p>
</div>
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-state-available text-state-available text-label-sm font-label-sm bg-state-available/5">
<span class="w-1.5 h-1.5 rounded-full bg-state-available"></span>
                        Operational
                    </span>
</div>
<div class="space-y-6 flex-1">
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Model Version</label>
<select class="input-erp cursor-pointer">
<option selected="" value="v3.2">Heritage-V3.2 (Current Stable)</option>
<option value="v4.0-beta">Heritage-V4.0 (Beta)</option>
<option value="v3.1">Heritage-V3.1 (Legacy)</option>
</select>
</div>
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Base Endpoint URL</label>
<input class="input-erp" type="text" value="https://api.cophuc-ai.vn/v1/inference">
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Primary API Key</label>
<div class="relative">
<input class="input-erp pr-10" type="password" value="sk-heritage-live-1a2b3c4d5e6f7g8h9i0j">
<button class="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-2" type="button">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</div>
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Secondary/Failover Key</label>
<div class="relative">
<input class="input-erp pr-10" type="password" value="sk-heritage-fail-0j9i8h7g6f5e4d3c2b1a">
<button class="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-2" type="button">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</div>
</div>
</div>
</div>
<!-- Compute & Thresholds Card -->
<div class="col-span-12 xl:col-span-4 bg-surface rounded-lg border border-outline-variant p-6 shadow-sm">
<div class="mb-6 border-b border-outline-variant pb-4">
<h2 class="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-muted-teal">memory</span>
                        Compute Allocation
                    </h2>
<p class="text-body-sm font-body-sm text-on-surface-variant mt-1">Manage system load and GPU cluster distribution.</p>
</div>
<div class="space-y-6">
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Target GPU Cluster</label>
<select class="input-erp cursor-pointer">
<option selected="" value="asia-se1-a">asia-southeast1-a (Primary - A100)</option>
<option value="asia-se1-b">asia-southeast1-b (Secondary - V100)</option>
<option value="asia-east1">asia-east1 (Fallback)</option>
</select>
</div>
<div class="bg-surface-container-low p-4 rounded border border-outline-variant/50">
<div class="flex justify-between items-center mb-2">
<label class="text-label-sm font-label-sm text-on-surface font-semibold">Max Concurrent Sessions</label>
<span class="text-body-sm font-body-sm text-primary font-medium">120</span>
</div>
<input class="w-full accent-lacquer-red cursor-pointer" max="500" min="10" type="range" value="120">
<div class="flex justify-between mt-1 text-[10px] text-on-surface-variant uppercase">
<span>10</span>
<span>500</span>
</div>
</div>
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Inference Timeout (ms)</label>
<input class="input-erp" max="30000" min="1000" type="number" value="8500">
</div>
<label class="flex items-center gap-3 cursor-pointer group mt-4">
<div class="relative">
<input checked="" class="sr-only peer" type="checkbox">
<div class="w-10 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-jade-green"></div>
</div>
<span class="text-body-sm font-body-sm text-on-surface group-hover:text-primary transition-colors">Enable Auto-Scaling</span>
</label>
</div>
</div>
<!-- Payment Gateways Card -->
<div class="col-span-12 bg-surface rounded-lg border border-outline-variant p-6 shadow-sm mt-2">
<div class="flex justify-between items-start mb-6 border-b border-outline-variant pb-4">
<div>
<h2 class="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-secondary">account_balance_wallet</span>
                            Payment Gateway Integration
                        </h2>
<p class="text-body-sm font-body-sm text-on-surface-variant mt-1">Configure credentials for deposit processing.</p>
</div>
<div class="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
<button class="px-4 py-1.5 text-label-sm font-label-sm bg-surface shadow-sm rounded border border-outline-variant/50 text-on-surface">VNPAY</button>
<button class="px-4 py-1.5 text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-colors">Momo</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
<!-- Environment Toggle -->
<div class="col-span-1 md:col-span-2 lg:col-span-3 mb-2">
<label class="flex items-center gap-3 cursor-pointer w-fit">
<span class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Environment:</span>
<div class="relative inline-flex items-center bg-surface-variant rounded-full p-0.5 border border-outline-variant">
<span class="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-state-damaged text-white shadow-sm z-10 transition-all">Sandbox</span>
<span class="px-3 py-1 text-[10px] font-bold uppercase rounded-full text-on-surface-variant opacity-50 z-0 absolute right-0">Live</span>
</div>
<span class="text-body-sm font-body-sm text-state-damaged italic ml-2">Testing mode active</span>
</label>
</div>
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">vnp_TmnCode</label>
<input class="input-erp font-mono text-sm" type="text" value="ATELIER_TEST">
</div>
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">vnp_HashSecret</label>
<div class="relative">
<input class="input-erp font-mono text-sm pr-10" type="password" value="secretkey1234567890">
<button class="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-2" type="button">
<span class="material-symbols-outlined text-[20px]">visibility_off</span>
</button>
</div>
</div>
<div>
<label class="block text-label-sm font-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">vnp_ReturnUrl</label>
<input class="input-erp text-sm" type="text" value="https://erp.cophuc.vn/payments/callback">
</div>
</div>
</div>
</div>
</main>
</body></html>

