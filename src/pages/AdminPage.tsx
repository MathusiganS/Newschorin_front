"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { TAMIL_NEWS_CATEGORIES } from "../constants/tamilCategories";
import { fetchAdminJson } from "../lib/api";

type AdminStatus = "pending" | "approved" | "rejected";

type StatusCounts = Record<AdminStatus, number>;

interface AdminNewsItem {
  id: number;
  title: string;
  original_title: string;
  url: string;
  image: string;
  image_path: string;
  full_text: string;
  original_full_text: string;
  source: string;
  category_ta?: string;
  status: AdminStatus;
  created_at: string;
}

type OriginalPreview = {
  label: string;
  value: string;
};

const STATUS_TABS: Array<{
  value: AdminStatus;
  label: string;
  className: string;
}> = [
  {
    value: "pending",
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    value: "approved",
    label: "Approved",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "rejected",
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  அரசியல்: "account_balance",
  பொருளாதாரம்: "monitoring",
  வணிகம்: "business_center",
  விளையாட்டு: "sports_cricket",
  சுகாதாரம்: "health_and_safety",
  தொழில்நுட்பம்: "memory",
  சர்வதேசம்: "public",
  "குற்றம் & சட்டம்": "gavel",
  கல்வி: "school",
  "விபத்து & அனர்த்தம்": "warning",
  போக்குவரத்து: "directions_car",
  "அரசு அறிவிப்பு": "campaign",
  "சுற்றுலா & குடிவரவு": "flight",
  "மதம் & கலாச்சாரம்": "temple_hindu",
};

const CATEGORY_NAV = [
  { value: "admin", icon: "edit_square", label: "நிர்வாக பலகம்" },
  { value: "all", icon: "grid_view", label: "அனைத்து செய்திகள்" },
  ...TAMIL_NEWS_CATEGORIES.map((category) => ({
    value: category,
    icon: CATEGORY_ICONS[category] ?? "article",
    label: category,
  })),
];

const PAGE_SIZES = [10, 20, 30];

function formatRelativeTime(iso: string) {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  const diffMs = Date.now() - dt.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AdminStatus>("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<AdminNewsItem | null>(null);
  const [originalPreview, setOriginalPreview] = useState<OriginalPreview | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  useEffect(() => {
    queueMicrotask(() => {
      setAuthed(!!localStorage.getItem("adminAuth"));
    });
  }, []);

  const loadItems = useCallback((filter: AdminStatus) => {
    setLoading(true);
    setLoadError(null);
    fetchAdminJson<AdminNewsItem[]>(`/api/admin/news?status=${filter}`)
      .then((data) => {
        setItems(data);
        setPage(1);
        setActiveItem((current) => {
          if (!current) return current;
          return data.find((d) => d.id === current.id) || null;
        });
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Failed to load admin data";
        setLoadError(msg);
        if (msg.toLowerCase().includes("401")) {
          localStorage.removeItem("adminAuth");
          setAuthed(false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const loadCounts = useCallback(() => {
    Promise.all([
      fetchAdminJson<AdminNewsItem[]>("/api/admin/news?status=pending"),
      fetchAdminJson<AdminNewsItem[]>("/api/admin/news?status=approved"),
      fetchAdminJson<AdminNewsItem[]>("/api/admin/news?status=rejected"),
    ])
      .then(([pending, approved, rejected]) => {
        setCounts({
          pending: pending.length,
          approved: approved.length,
          rejected: rejected.length,
        });
      })
      .catch(() => {
        setCounts({ pending: 0, approved: 0, rejected: 0 });
      });
  }, []);

  useEffect(() => {
    if (!authed) return;
    queueMicrotask(() => {
      loadItems(statusFilter);
      loadCounts();
    });
  }, [authed, loadItems, loadCounts, statusFilter]);

  const onLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const token = btoa(`${username}:${password}`);
    localStorage.setItem("adminAuth", token);
    setAuthed(true);
    setUsername("");
    setPassword("");
  };

  const onLogout = () => {
    localStorage.removeItem("adminAuth");
    setAuthed(false);
    setItems([]);
    setActiveItem(null);
  };

  const updateStatus = (id: number, status: AdminStatus) => {
    setSaving(true);
    fetchAdminJson(`/api/admin/news/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(() => {
        loadItems(statusFilter);
        loadCounts();
      })
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : "Failed to update status");
      })
      .finally(() => setSaving(false));
  };

  const onSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeItem) return;
    setSaving(true);
    fetchAdminJson(`/api/admin/news/${activeItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: activeItem.title,
        url: activeItem.url,
        image_path: activeItem.image_path,
        full_text: activeItem.full_text,
        source: activeItem.source,
        category_ta: activeItem.category_ta || "",
        status: activeItem.status,
        created_at: activeItem.created_at,
      }),
    })
      .then(() => {
        loadItems(statusFilter);
        loadCounts();
      })
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : "Failed to save changes");
      })
      .finally(() => setSaving(false));
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === "admin" ||
        categoryFilter === "all" ||
        item.category_ta === categoryFilter;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [items, categoryFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const isEditing = !!activeItem;

  if (!authed) {
    return (
      <main className="min-h-screen bg-surface text-on-surface flex items-center justify-center px-4 py-16 font-body-md">
        <form
          onSubmit={onLogin}
          className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm"
        >
          <h1 className="font-display-lg text-display-lg text-on-surface mb-4">
            Admin Login
          </h1>
          <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-outline-variant rounded-DEFAULT px-sm py-[8px] font-body-md text-body-md bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none mb-4"
            type="text"
            autoComplete="username"
            required
          />
          <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-outline-variant rounded-DEFAULT px-sm py-[8px] font-body-md text-body-md bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none mb-5"
            type="password"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-on-primary rounded-DEFAULT py-[10px] font-body-md text-body-md hover:bg-primary/90 transition-colors"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="bg-surface text-on-surface h-screen flex overflow-hidden antialiased font-body-md">
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-[280px] bg-gradient-to-b from-[#0e2a66] to-[#0a1f45] text-white flex-col pt-6 pb-4 z-40">
        <div className="px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f59ff] font-bold text-white">
              N
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold uppercase tracking-wide">
                NEWSCHORIN
              </p>
              <p className="text-[11px] text-white/70">ஆசிரியர் மேசை</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-white/60">செய்தி மேலாண்மை</p>
        </div>

        <div className="mt-7 flex-1 space-y-1.5 overflow-y-auto px-4 custom-scrollbar">
          {CATEGORY_NAV.map((cat) => {
            const active = categoryFilter === cat.value;
            const className = `grid h-11 w-full grid-cols-[32px_1fr] items-center gap-3 rounded-lg border px-3 text-left transition-colors ${
              active
                ? "border-white/20 bg-white/10 text-white shadow-sm"
                : "border-transparent text-white/80 hover:bg-white/10 hover:text-white"
            }`;

            const content = (
              <>
                <span className="material-symbols-outlined flex h-8 w-8 items-center justify-center text-[19px]">
                  {cat.icon}
                </span>
                <span className="min-w-0 truncate text-[14px] font-semibold leading-none">
                  {cat.label}
                </span>
              </>
            );

            if (cat.value === "all") {
              return (
                <Link key={cat.value} href="/" className={className}>
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoryFilter(cat.value)}
                className={className}
              >
                {content}
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5 border-t border-white/10 px-4 pt-4">
          <button
            type="button"
            className="grid h-11 w-full grid-cols-[32px_1fr] items-center gap-3 rounded-lg px-3 text-left text-white/80 hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined flex h-8 w-8 items-center justify-center text-[19px]">
              settings
            </span>
            <span className="truncate text-[14px] font-semibold">அமைப்புகள்</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="grid h-11 w-full grid-cols-[32px_1fr] items-center gap-3 rounded-lg px-3 text-left text-white/80 hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined flex h-8 w-8 items-center justify-center text-[19px]">
              logout
            </span>
            <span className="truncate text-[14px] font-semibold">வெளியேறு</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-full bg-surface lg:ml-[280px]">
        <header className="h-16 px-8 flex items-center justify-between border-b border-outline-variant bg-white">
          <div className="text-sm text-secondary flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-secondary/50">›</span>
            <span className="text-primary font-semibold">Admin Panel</span>
            {isEditing ? (
              <>
                <span className="text-secondary/50">›</span>
                <span className="text-primary font-semibold">Edit Article</span>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <div className="relative">
                <input
                  className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Search articles..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                  search
                </span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => {
                loadItems(statusFilter);
                loadCounts();
              }}
              className="flex items-center gap-2 px-3 py-2 border border-outline-variant rounded-lg text-sm text-secondary hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
            <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-semibold">
              A
            </div>
          </div>
        </header>

        {!isEditing ? (
          <section className="px-8 py-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-on-surface">Admin Panel</h1>
              <p className="text-sm text-on-surface-variant">
                Manage approvals and edit articles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium shadow-sm ${tab.className} ${
                    statusFilter === tab.value ? "ring-2 ring-primary/20" : "opacity-80"
                  }`}
                >
                  {tab.label} ({counts[tab.value]})
                </button>
              ))}
            </div>

            {loadError ? (
              <div className="border border-error-container bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
                {loadError}
              </div>
            ) : null}

            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-outline-variant">
                <h2 className="text-sm font-semibold text-on-surface">
                  Pending Articles ({filteredItems.length})
                </h2>
              </div>
              <div className="divide-y divide-outline-variant">
                {loading ? (
                  <div className="px-5 py-6 text-sm text-on-surface-variant">Loading...</div>
                ) : pagedItems.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-on-surface-variant">
                    No articles found.
                  </div>
                ) : (
                  pagedItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className="w-full flex items-start gap-4 px-5 py-4 hover:bg-surface-container-low transition-colors text-left"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant">
                        {item.image ? (
                          <img
                            alt="thumb"
                            src={item.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-on-surface leading-snug">
                          {item.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-semibold">
                            {item.source.toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full border ${
                            item.status === "approved"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : item.status === "rejected"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                          {item.category_ta ? (
                            <span className="px-2 py-0.5 rounded-full border border-outline-variant">
                              {item.category_ta}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-on-surface-variant">
                        <span>{formatRelativeTime(item.created_at)}</span>
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="px-5 py-4 border-t border-outline-variant flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 5)
                    .map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 rounded-full border ${
                          page === num
                            ? "bg-primary text-on-primary border-primary"
                            : "border-outline-variant"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center"
                  >
                    ›
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="border border-outline-variant rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                  <span>
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, filteredItems.length)} of{" "}
                    {filteredItems.length} articles
                  </span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="px-8 py-6 overflow-y-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-on-surface">Edit Article</h1>
                <p className="text-sm text-on-surface-variant">
                  Update the article details and manage approval.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateStatus(activeItem.id, "approved")}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(activeItem.id, "rejected")}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="mt-4 text-sm text-primary font-semibold"
            >
              ← Back to list
            </button>

            {activeItem ? (
              <form onSubmit={onSave} className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-6">
                <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Featured Image</h3>
                    <span className="text-xs text-red-500">*</span>
                  </div>
                  <div className="mt-4 rounded-2xl overflow-hidden border border-outline-variant">
                    {activeItem.image ? (
                      <img
                        alt="Featured"
                        src={activeItem.image}
                        className="w-full h-44 object-cover"
                      />
                    ) : (
                      <div className="h-44 flex items-center justify-center text-sm text-on-surface-variant">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg border border-outline-variant text-sm"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveItem({
                          ...activeItem,
                          image_path: "",
                        })
                      }
                      className="px-3 py-2 rounded-lg text-sm text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs text-on-surface-variant">Image URL</label>
                    <input
                      className="mt-2 w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                      value={activeItem.image_path}
                      onChange={(e) =>
                        setActiveItem({
                          ...activeItem,
                          image_path: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs text-on-surface-variant">Title *</label>
                      <button
                        type="button"
                        onClick={() =>
                          setOriginalPreview({
                            label: "Original Title",
                            value: activeItem.original_title || activeItem.title,
                          })
                        }
                        className="text-xs px-2 py-1 rounded-md border border-outline-variant text-primary font-semibold"
                      >
                        Original
                      </button>
                    </div>
                    <input
                      className="mt-2 w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                      value={activeItem.title}
                      onChange={(e) =>
                        setActiveItem({ ...activeItem, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant">URL *</label>
                    <input
                      className="mt-2 w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                      value={activeItem.url}
                      onChange={(e) =>
                        setActiveItem({ ...activeItem, url: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-on-surface-variant">Source *</label>
                      <input
                        className="mt-2 w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                        value={activeItem.source}
                        onChange={(e) =>
                          setActiveItem({ ...activeItem, source: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-on-surface-variant">Category (தமிழ்) *</label>
                      <select
                        className="mt-2 w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                        value={activeItem.category_ta || ""}
                        onChange={(e) =>
                          setActiveItem({
                            ...activeItem,
                            category_ta: e.target.value,
                          })
                        }
                      >
                        <option value="">Select</option>
                        {TAMIL_NEWS_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-on-surface-variant">Status *</label>
                      <select
                        className="mt-2 w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                        value={activeItem.status}
                        onChange={(e) =>
                          setActiveItem({
                            ...activeItem,
                            status: e.target.value as AdminStatus,
                          })
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-on-surface-variant">Created At (IST)</label>
                      <input
                        className="mt-2 w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                        value={activeItem.created_at}
                        onChange={(e) =>
                          setActiveItem({
                            ...activeItem,
                            created_at: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs text-on-surface-variant">Full Text *</label>
                      <button
                        type="button"
                        onClick={() =>
                          setOriginalPreview({
                            label: "Original Full Text",
                            value: activeItem.original_full_text || activeItem.full_text,
                          })
                        }
                        className="text-xs px-2 py-1 rounded-md border border-outline-variant text-primary font-semibold"
                      >
                        Original
                      </button>
                    </div>
                    <div className="mt-2 border border-outline-variant rounded-lg overflow-hidden">
                      <div className="flex items-center gap-2 border-b border-outline-variant px-3 py-2 text-xs text-secondary">
                        <span className="px-2 py-1 rounded bg-surface-container-low">Paragraph</span>
                        <span className="font-bold">B</span>
                        <span className="italic">I</span>
                        <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                        <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
                        <span className="material-symbols-outlined text-[16px]">format_quote</span>
                        <span className="material-symbols-outlined text-[16px]">link</span>
                        <span className="material-symbols-outlined text-[16px]">image</span>
                      </div>
                      <textarea
                        className="w-full min-h-[220px] px-3 py-3 text-sm outline-none"
                        value={activeItem.full_text}
                        onChange={(e) =>
                          setActiveItem({
                            ...activeItem,
                            full_text: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            ) : null}
          </section>
        )}
      </main>
      {originalPreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl border border-outline-variant">
            <div className="flex items-center justify-between gap-4 border-b border-outline-variant px-5 py-4">
              <h3 className="text-sm font-semibold">{originalPreview.label}</h3>
              <button
                type="button"
                onClick={() => setOriginalPreview(null)}
                className="material-symbols-outlined text-[20px] text-on-surface-variant"
                aria-label="Close"
              >
                close
              </button>
            </div>
            <div className="max-h-[62vh] overflow-auto whitespace-pre-wrap px-5 py-4 text-sm leading-7 text-on-surface">
              {originalPreview.value || "No original text available."}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
