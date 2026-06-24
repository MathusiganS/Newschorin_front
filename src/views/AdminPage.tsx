"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { TAMIL_NEWS_CATEGORIES } from "../constants/tamilCategories";
import { fetchAdminJson, loginAdmin, logoutAdmin } from "../lib/api";
import { formatSriLankaDate } from "../lib/datetime";

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

interface SyncErrorItem {
  id: number;
  url: string;
  original_title: string;
  error_message: string;
  occurred_at: string;
}

type OriginalPreview = {
  label: string;
  value: string;
};

type Feedback = {
  type: "success" | "error" | "info";
  message: string;
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

const NEWS_SOURCES = [
  { value: "all", label: "All sources" },
  { value: "tamilwin", label: "Tamilwin" },
  { value: "virakesari", label: "Virakesari" },
  { value: "lankasri", label: "Lankasri" },
  { value: "newswire", label: "Newswire" },
] as const;

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

function formatSriLankaDateTime(iso: string) {
  return formatSriLankaDate(iso, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeArticleUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

function isAuthError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("401") ||
    normalized.includes("not authenticated") ||
    normalized.includes("invalid or expired session") ||
    normalized.includes("invalid admin credentials")
  );
}

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AdminStatus>("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("admin");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [syncErrors, setSyncErrors] = useState<SyncErrorItem[]>([]);
  const [syncErrorsLoading, setSyncErrorsLoading] = useState(false);
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageData, setPendingImageData] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  useEffect(() => {
    queueMicrotask(() => {
      setAuthed(true);
    });
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const loadItems = useCallback((filter: AdminStatus, source = sourceFilter) => {
    setLoading(true);
    setLoadError(null);
    const params = new URLSearchParams({ status: filter });
    if (source !== "all") params.set("source", source);
    fetchAdminJson<AdminNewsItem[]>(`/api/admin/news?${params.toString()}`)
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
        if (isAuthError(msg)) {
          setAuthed(false);
          setItems([]);
          setActiveItem(null);
        }
      })
      .finally(() => setLoading(false));
  }, [sourceFilter]);

  const loadCounts = useCallback(() => {
    const sourceQuery =
      sourceFilter === "all"
        ? ""
        : `&source=${encodeURIComponent(sourceFilter)}`;
    Promise.all([
      fetchAdminJson<AdminNewsItem[]>(`/api/admin/news?status=pending${sourceQuery}`),
      fetchAdminJson<AdminNewsItem[]>(`/api/admin/news?status=approved${sourceQuery}`),
      fetchAdminJson<AdminNewsItem[]>(`/api/admin/news?status=rejected${sourceQuery}`),
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
  }, [sourceFilter]);

  const loadSyncErrors = useCallback(() => {
    setSyncErrorsLoading(true);
    fetchAdminJson<SyncErrorItem[]>("/api/admin/sync-errors")
      .then((data) => setSyncErrors(data))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to load sync errors";
        setFeedback({ type: "error", message });
        if (isAuthError(message)) setAuthed(false);
      })
      .finally(() => setSyncErrorsLoading(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    queueMicrotask(() => {
      loadItems(statusFilter);
      loadCounts();
      loadSyncErrors();
    });
  }, [authed, loadItems, loadCounts, loadSyncErrors, statusFilter]);

  const onLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setLoadError(null);
    setFeedback({ type: "info", message: "Signing in..." });
    loginAdmin(username, password)
      .then(() => {
        setAuthed(true);
        setUsername("");
        setPassword("");
        setFeedback({ type: "success", message: "Signed in successfully." });
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Sign in failed";
        setLoadError(message);
        setFeedback({ type: "error", message });
      })
      .finally(() => setSaving(false));
  };

  const onLogout = () => {
    setFeedback({ type: "info", message: "Signing out..." });
    logoutAdmin().catch(() => {
      // Even if the server is unreachable, clear the local admin view.
    });
    setAuthed(false);
    setItems([]);
    setActiveItem(null);
  };

  const updateStatus = (id: number, status: AdminStatus) => {
    setSaving(true);
    setFeedback({ type: "info", message: "Updating article status..." });
    fetchAdminJson(`/api/admin/news/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(() => {
        setFeedback({
          type: "success",
          message: status === "approved" ? "Article approved." : "Article rejected.",
        });
        loadItems(statusFilter);
        loadCounts();
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to update status";
        setLoadError(message);
        setFeedback({ type: "error", message });
        if (isAuthError(message)) setAuthed(false);
      })
      .finally(() => setSaving(false));
  };

  const resolveSyncError = (errorId: number) => {
    setSaving(true);
    setFeedback({ type: "info", message: "Marking sync error resolved..." });
    fetchAdminJson<{ ok: boolean }>(`/api/admin/sync-errors/${errorId}/resolve`, {
      method: "POST",
    })
      .then(() => {
        setSyncErrors((current) => current.filter((item) => item.id !== errorId));
        setFeedback({ type: "success", message: "Sync error marked resolved." });
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to resolve sync error";
        setFeedback({ type: "error", message });
        if (isAuthError(message)) setAuthed(false);
      })
      .finally(() => setSaving(false));
  };

  const onSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeItem) return;
    setSaving(true);
    setLoadError(null);
    setSaveMessage(null);
    setFeedback({ type: "info", message: "Saving changes..." });
    fetchAdminJson<{
      ok: boolean;
      image?: string;
      image_path?: string;
    }>(`/api/admin/news/${activeItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: activeItem.title,
        url: activeItem.url,
        image_path: activeItem.image_path,
        image_data: pendingImageData,
        full_text: activeItem.full_text,
        source: activeItem.source,
        category_ta: activeItem.category_ta || "",
        status: activeItem.status,
        created_at: activeItem.created_at,
      }),
    })
      .then(async (saved) => {
        if (!saved.ok) throw new Error("The server did not confirm the update.");
        const committed = await fetchAdminJson<AdminNewsItem>(
          `/api/admin/news/${activeItem.id}?updated=${Date.now()}`,
          { cache: "no-store" }
        );

        if (
          pendingImageData &&
          (!committed.image_path || committed.image_path === activeItem.image_path)
        ) {
          throw new Error(
            "The running backend is outdated and did not store the image. Deploy the latest tamilwin_scraper backend and try again."
          );
        }

        setActiveItem(committed);
        setPendingImageData(null);
        setSaveMessage("Changes saved successfully.");
        setFeedback({ type: "success", message: "Changes saved successfully." });
        loadItems(statusFilter);
        loadCounts();
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to save changes";
        setLoadError(message);
        setFeedback({ type: "error", message });
        if (isAuthError(message)) setAuthed(false);
      })
      .finally(() => setSaving(false));
  };

  const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !activeItem) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      const message = "Choose a JPG, PNG, WebP, GIF, or AVIF image.";
      setLoadError(message);
      setFeedback({ type: "error", message });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      const message = "Image must be 8 MB or smaller.";
      setLoadError(message);
      setFeedback({ type: "error", message });
      return;
    }

    setUploadingImage(true);
    setLoadError(null);
    setSaveMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === "string" ? reader.result : "";
      if (!imageData) {
        setLoadError("Could not read the selected image.");
        setFeedback({ type: "error", message: "Could not read the selected image." });
        setUploadingImage(false);
        return;
      }
      setPendingImageData(imageData);
      setFeedback({
        type: "success",
        message: "Image selected. Click Save Changes to update the article.",
      });
      setActiveItem((current) =>
        current
          ? {
              ...current,
              image: imageData,
            }
          : current
      );
      setUploadingImage(false);
    };
    reader.onerror = () => {
      setLoadError("Could not read the selected image.");
      setFeedback({ type: "error", message: "Could not read the selected image." });
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
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
          {loadError ? (
            <div className="mb-4 rounded-DEFAULT border border-error-container bg-error-container px-3 py-2 text-sm text-on-error-container">
              {loadError}
            </div>
          ) : null}
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
                onClick={() => {
                  setCategoryFilter(cat.value);
                  setPage(1);
                }}
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                  search
                </span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setFeedback({ type: "info", message: "Refreshing articles..." });
                loadItems(statusFilter);
                loadCounts();
                loadSyncErrors();
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

            <div className="flex flex-wrap items-end justify-between gap-4">
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

              <label className="flex min-w-[220px] flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  News source
                </span>
                <span className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-secondary">
                    source
                  </span>
                  <select
                    value={sourceFilter}
                    onChange={(event) => setSourceFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-outline-variant bg-white pl-10 pr-10 text-sm font-medium text-on-surface shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    aria-label="Filter articles by news source"
                  >
                    {NEWS_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary">
                    expand_more
                  </span>
                </span>
              </label>
            </div>

            {loadError ? (
              <div className="border border-error-container bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
                {loadError}
              </div>
            ) : null}

            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm">
              <div className="flex flex-col gap-3 border-b border-outline-variant px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-on-surface">
                    Sync Errors ({syncErrors.length})
                  </h2>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Failed scraped items are stored here until marked resolved.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadSyncErrors}
                  disabled={syncErrorsLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  {syncErrorsLoading ? "Loading..." : "Refresh errors"}
                </button>
              </div>
              {syncErrorsLoading ? (
                <div className="px-5 py-6 text-sm text-on-surface-variant">
                  Loading sync errors...
                </div>
              ) : syncErrors.length === 0 ? (
                <div className="px-5 py-6 text-sm text-on-surface-variant">
                  No unresolved sync errors.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {syncErrors.map((error) => (
                    <div key={error.id} className="px-5 py-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-on-surface">
                              {error.original_title || "Untitled scraped item"}
                            </h3>
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                              Failed
                            </span>
                          </div>
                          {safeArticleUrl(error.url) ? (
                            <a
                              href={safeArticleUrl(error.url) ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block break-all text-xs font-semibold text-primary hover:underline"
                            >
                              {error.url}
                            </a>
                          ) : error.url ? (
                            <p className="mt-1 break-all text-xs text-on-surface-variant">
                              {error.url}
                            </p>
                          ) : null}
                          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">
                            {error.error_message}
                          </p>
                          <p className="mt-2 text-[11px] text-on-surface-variant">
                            {formatSriLankaDateTime(error.occurred_at)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => resolveSyncError(error.id)}
                          disabled={saving}
                          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-outline-variant">
                <h2 className="text-sm font-semibold text-on-surface">
                  {STATUS_TABS.find((tab) => tab.value === statusFilter)?.label} Articles ({filteredItems.length})
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
                      onClick={() => {
                        setPendingImageData(null);
                        setActiveItem(item);
                      }}
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
                        <span>{formatSriLankaDateTime(item.created_at)}</span>
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
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(activeItem.id, "rejected")}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving || uploadingImage}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
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

            {loadError ? (
              <div className="mt-4 border border-error-container bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">
                {loadError}
              </div>
            ) : null}

            {saveMessage ? (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                {saveMessage}
              </div>
            ) : null}

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
                    <label className={`cursor-pointer px-3 py-2 rounded-lg border border-outline-variant text-sm font-medium ${
                      uploadingImage ? "pointer-events-none opacity-60" : "hover:bg-surface-container-low"
                    }`}>
                      {uploadingImage ? "Uploading..." : "Choose Image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        onChange={onImageUpload}
                        className="sr-only"
                        disabled={uploadingImage}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingImageData(null);
                        setSaveMessage(null);
                        setActiveItem({
                          ...activeItem,
                          image: "",
                          image_path: "",
                        });
                      }}
                      className="px-3 py-2 rounded-lg text-sm text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs text-on-surface-variant">
                      Or paste an image URL
                    </label>
                    <input
                      className="mt-2 w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                      value={activeItem.image_path}
                      placeholder="https://example.com/image.jpg"
                      onChange={(e) => {
                        setPendingImageData(null);
                        setSaveMessage(null);
                        setActiveItem({
                          ...activeItem,
                          image_path: e.target.value,
                          image: e.target.value,
                        });
                      }}
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
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-xs text-on-surface-variant">URL *</label>
                      {safeArticleUrl(activeItem.url) ? (
                        <a
                          href={safeArticleUrl(activeItem.url) ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Open article
                          <span className="material-symbols-outlined text-[15px]">
                            open_in_new
                          </span>
                        </a>
                      ) : null}
                    </div>
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
                      <label className="text-xs text-on-surface-variant">Created At (Sri Lanka)</label>
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
      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-5 top-5 z-[70] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {feedback.type === "success"
              ? "check_circle"
              : feedback.type === "error"
                ? "error"
                : "info"}
          </span>
          <span className="leading-5">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="material-symbols-outlined ml-1 text-[18px] opacity-70 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            close
          </button>
        </div>
      ) : null}
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
