"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { TAMIL_NEWS_CATEGORIES } from "../constants/tamilCategories";
import { fetchNewsList, fetchPopularNews } from "../lib/api";
import { formatSriLankaDate, sriLankaTimeValue } from "../lib/datetime";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  source: string;
  category_ta?: string;
  created_at: string;
  view_count?: number;
  excerpt?: string;
}

const SECTION_ROWS = [
  ["அரசியல்", "தொழில்நுட்பம்"],
] as const;

const INTERNATIONAL_CATEGORY = "சர்வதேசம்";
const HOME_FEED_LIMIT = 16;
const HOME_SECTION_POOL_LIMIT = 60;

function articleHref(article: NewsItem) {
  return `/article/${article.id}`;
}

function formatDate(date: string) {
  return formatSriLankaDate(date, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function articleImage(article: NewsItem, className: string) {
  if (article.image) {
    return <img src={article.image} alt={article.title} className={className} />;
  }

  return (
    <div className={`${className} flex items-center justify-center bg-[#e4e9ed]`}>
      <span className="font-serif text-4xl font-black text-[#c6c6cd]">N</span>
    </div>
  );
}

function AdBlock({
  label,
  size,
  compact = false,
  variant = "billboard",
}: {
  label: string;
  size: string;
  compact?: boolean;
  variant?: "billboard" | "leaderboard";
}) {
  const isLeaderboard = variant === "leaderboard";

  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#e4e9ed] text-center ${
        compact
          ? "min-h-[220px] p-2 sm:min-h-[250px]"
          : isLeaderboard
            ? "my-6 px-3 py-6 sm:my-10 sm:px-4 sm:py-8"
            : "my-6 min-h-[220px] p-4 sm:my-10 sm:min-h-[280px] sm:p-8"
      }`}
    >
      <span className="mb-2 text-[10px] font-bold uppercase text-[#76777d]">
        விளம்பரம்
      </span>
      <div
        className={`flex items-center justify-center border border-dashed border-[#76777d] text-sm font-semibold text-[#76777d] ${
          compact
            ? "h-[206px] w-full max-w-[300px]"
            : isLeaderboard
              ? "h-[90px] w-full max-w-[728px]"
              : "h-[204px] w-full max-w-[970px]"
        }`}
      >
        {label} - {size}
      </div>
    </div>
  );
}

function articleExcerpt(article: NewsItem) {
  const text = article.excerpt?.trim();
  if (text) return text;
  return formatDate(article.created_at);
}

function isInternationalArticle(article: NewsItem) {
  return article.category_ta === INTERNATIONAL_CATEGORY;
}

function SectionTitle({
  title,
  link,
}: {
  title: string;
  link?: string;
}) {
  return (
    <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-[#c6c6cd] bg-[#f0f4f8] px-4 py-3 sm:px-7">
      <h2 className="border-l-4 border-[#bb0112] pl-3 font-serif text-[20px] font-black leading-tight sm:text-[24px]">
        {title}
      </h2>
      {link ? (
        <Link
          href={link}
          className="text-[11px] font-black text-black hover:text-[#bb0112]"
        >
          அனைத்தும்
        </Link>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category")?.trim() ?? "";
  const searchQuery = searchParams?.get("search")?.trim() ?? "";
  const categoryFilter =
    categoryParam &&
    (TAMIL_NEWS_CATEGORIES as readonly string[]).includes(categoryParam)
      ? categoryParam
      : "";

  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [allArticles, setAllArticles] = useState<NewsItem[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<NewsItem[]>([]);
  const [categoryVisibleState, setCategoryVisibleState] = useState({
    category: "",
    count: 4,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setLoadError(null);
      }
    });

    fetchNewsList<NewsItem>({
      category_ta: categoryFilter || undefined,
      search: searchQuery || undefined,
      limit: categoryFilter ? HOME_SECTION_POOL_LIMIT : HOME_FEED_LIMIT,
      offset: 0,
    })
      .then((data) => {
        if (!cancelled) setArticles(data.items);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setArticles([]);
          setLoadError(
            error instanceof Error ? error.message : "செய்திகளை ஏற்ற முடியவில்லை."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    let cancelled = false;

    fetchNewsList<NewsItem>({
      search: searchQuery || undefined,
      limit: HOME_SECTION_POOL_LIMIT,
      offset: 0,
    })
      .then((data) => {
        if (!cancelled) setAllArticles(data.items);
      })
      .catch(() => {
        if (!cancelled) setAllArticles([]);
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    const loadTrending = () => {
      fetchPopularNews<NewsItem>(4)
        .then((data) => {
          if (!cancelled) {
            setTrendingArticles(
              data.filter((article) => (article.view_count ?? 0) > 0)
            );
          }
        })
        .catch(() => {
          if (!cancelled) setTrendingArticles([]);
        });
    };

    const loadTrendingWhenVisible = () => {
      if (document.visibilityState === "visible") loadTrending();
    };

    loadTrending();
    window.addEventListener("focus", loadTrending);
    window.addEventListener("pageshow", loadTrending);
    document.addEventListener("visibilitychange", loadTrendingWhenVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", loadTrending);
      window.removeEventListener("pageshow", loadTrending);
      document.removeEventListener("visibilitychange", loadTrendingWhenVisible);
    };
  }, []);

  const categorySourceArticles = allArticles.length ? allArticles : articles;

  const grouped = useMemo(() => {
    return TAMIL_NEWS_CATEGORIES.reduce<Record<string, NewsItem[]>>(
      (acc, category) => {
        acc[category] = categorySourceArticles.filter(
          (article) => article.category_ta === category
        );
        return acc;
      },
      {}
    );
  }, [categorySourceArticles]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f6fafe] py-24">
        <div className="border border-[#c6c6cd] bg-white px-6 py-4 text-sm font-semibold text-[#76777d]">
          செய்திகள் ஏற்றப்படுகின்றன...
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f6fafe] px-4 py-24 text-center">
        <div className="max-w-xl border border-[#c6c6cd] bg-white p-8">
          <h1 className="font-serif text-2xl font-black text-black">
            செய்திகள் ஏற்ற முடியவில்லை
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#45464d]">{loadError}</p>
        </div>
      </main>
    );
  }

  if (articles.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f6fafe] px-4 py-24 text-center">
        <div className="max-w-xl border border-[#c6c6cd] bg-white p-8">
          <h1 className="font-serif text-2xl font-black text-black">
            செய்திகள் இல்லை
          </h1>
          {categoryFilter ? (
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-black text-[#bb0112] hover:underline"
            >
              அனைத்து செய்திகளையும் காட்டு
            </Link>
          ) : null}
        </div>
      </main>
    );
  }

  const featured = articles[0];
  const latestArticles = articles.slice(1);
  const latest = latestArticles.slice(0, 4);
  const hasMoreLatest = latestArticles.length > latest.length;
  const trending = trendingArticles.slice(0, 4);
  const internationalStories = categorySourceArticles
    .filter(isInternationalArticle)
    .slice(0, 3);

  if (categoryFilter) {
    const categoryLead = articles[0];
    const categoryDevelopments = articles.slice(1);
    const categoryVisibleCount =
      categoryVisibleState.category === categoryFilter
        ? categoryVisibleState.count
        : 4;
    const visibleCategoryDevelopments = categoryDevelopments.slice(
      0,
      categoryVisibleCount
    );
    const hasMoreCategoryDevelopments =
      categoryVisibleCount < categoryDevelopments.length;
    const categoryTrending = categorySourceArticles
      .filter((article) => article.category_ta === categoryFilter)
      .slice()
      .sort((a, b) => {
        const viewDiff = (b.view_count ?? 0) - (a.view_count ?? 0);
        if (viewDiff !== 0) return viewDiff;
        return sriLankaTimeValue(b.created_at) - sriLankaTimeValue(a.created_at);
      })
      .slice(0, 5);

    return (
      <main className="flex-1 bg-white text-[#171c1f]">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-5 sm:py-12">
          <header className="mb-8 flex flex-col justify-between gap-6 border-b border-black pb-6 md:mb-12 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <h1 className="break-words font-serif text-[34px] font-black leading-tight text-black sm:text-[42px] md:text-[56px]">
                {categoryFilter}
              </h1>
              <p className="mt-3 text-[16px] leading-7 text-[#45464d] sm:text-[18px] sm:leading-8">
                {categoryFilter} தொடர்பான சமீபத்திய செய்திகள், முக்கிய
                நிகழ்வுகள் மற்றும் விரிவான தகவல்கள்.
              </p>
            </div>
            <div className="hidden text-right md:block">
              <p className="text-[12px] font-black uppercase tracking-[0.16em] text-[#76777d]">
                NewsChorin / Tamil News
              </p>
            </div>
          </header>

          <Link
            href={articleHref(categoryLead)}
            className="group mb-12 flex cursor-pointer flex-col gap-6 sm:gap-8 lg:mb-20 lg:flex-row lg:gap-12"
          >
            <div className="overflow-hidden rounded lg:w-[40%]">
              {articleImage(
                categoryLead,
                "h-[240px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[320px] lg:h-[400px]"
              )}
            </div>
            <div className="flex flex-col justify-center lg:w-[60%]">
              <span className="mb-5 w-fit rounded bg-[#f0f4f8] px-3 py-1 text-[12px] font-black tracking-[0.05em] text-black">
                {categoryFilter}
              </span>
              <h2 className="break-words font-serif text-[28px] font-black leading-tight text-black group-hover:underline group-hover:decoration-[#bb0112] group-hover:decoration-2 group-hover:underline-offset-4 sm:text-[34px] md:text-[48px]">
                {categoryLead.title}
              </h2>
              <p className="mt-4 text-[16px] leading-7 text-[#45464d] sm:mt-6 sm:text-[18px] sm:leading-8">
                {articleExcerpt(categoryLead)}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-[13px] font-black text-black">
                  {categoryLead.category_ta || categoryFilter}
                </span>
                <span className="h-1 w-1 rounded-full bg-[#c6c6cd]" />
                <span className="text-[13px] font-semibold text-[#76777d]">
                  {formatDate(categoryLead.created_at)}
                </span>
              </div>
            </div>
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h3 className="mb-6 border-b border-[#c6c6cd] pb-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#bb0112]">
                சமீபத்திய முன்னேற்றங்கள்
              </h3>

              {categoryDevelopments.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
                    {visibleCategoryDevelopments.map((article) => (
                      <Link
                        key={article.id}
                        href={articleHref(article)}
                        className="group flex cursor-pointer flex-col overflow-hidden rounded border border-[#c6c6cd] bg-white transition-colors hover:border-black"
                      >
                        <div className="aspect-video overflow-hidden">
                          {articleImage(
                            article,
                            "h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          )}
                        </div>
                        <div className="p-5 sm:p-6">
                          <h4 className="break-words font-serif text-[21px] font-black leading-tight text-black transition-colors group-hover:text-[#bb0112] sm:text-[24px]">
                            {article.title}
                          </h4>
                          <p className="mt-4 line-clamp-3 text-[15px] leading-6 text-[#45464d]">
                            {articleExcerpt(article)}
                          </p>
                          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#c6c6cd] pt-4">
                            <span className="text-[13px] font-semibold text-[#76777d]">
                              {formatDate(article.created_at)}
                            </span>
                            <span className="material-symbols-outlined text-[#76777d] transition-colors group-hover:text-black">
                              bookmark
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {hasMoreCategoryDevelopments ? (
                    <div className="mt-12 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setCategoryVisibleState({
                            category: categoryFilter,
                            count: categoryDevelopments.length,
                          })
                        }
                        className="min-h-11 border border-black px-8 py-3 text-[12px] font-black uppercase tracking-[0.08em] text-black transition-colors hover:bg-black hover:text-white sm:px-10 sm:py-4"
                      >
                        மேலும் செய்திகள்
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="border border-[#c6c6cd] bg-[#f6fafe] p-8 text-sm font-semibold text-[#76777d]">
                  இந்தப் பிரிவில் மேலும் செய்திகள் இல்லை.
                </div>
              )}
            </div>

            <aside className="space-y-12 lg:col-span-4">
              <section className="rounded bg-[#f0f4f8] p-6">
                <h3 className="mb-6 flex items-center gap-2 border-b-2 border-black pb-2 text-[12px] font-black uppercase tracking-[0.08em] text-black">
                  <span className="material-symbols-outlined text-[19px]">
                    trending_up
                  </span>
                  {categoryFilter} அதிகம் வாசிக்கப்பட்டவை
                </h3>
                <ul className="space-y-6">
                  {categoryTrending.map((article, index) => (
                    <li key={`${article.id}-category-trend`}>
                      <Link
                        href={articleHref(article)}
                        className="group flex gap-5"
                      >
                        <span className="font-serif text-[28px] font-black leading-none text-[#c6c6cd] transition-colors group-hover:text-[#bb0112]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="text-[16px] font-black leading-tight text-black group-hover:underline">
                            {article.title}
                          </h4>
                          <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-5 text-[#45464d]">
                            {articleExcerpt(article)}
                          </p>
                          <span className="mt-2 block text-[13px] font-semibold text-[#76777d]">
                            {formatDate(article.created_at)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="flex flex-col items-center">
                <span className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#76777d]">
                  விளம்பரம்
                </span>
                <div className="flex h-[250px] w-full max-w-[300px] items-center justify-center border border-[#c6c6cd] bg-[#e4e9ed] p-6 text-center">
                  <div>
                    <p className="mb-2 text-[12px] font-black text-[#76777d]">
                      300×250 Sidebar MREC
                    </p>
                    <p className="font-serif text-[24px] font-black leading-tight text-[#45464d]">
                      உண்மையான செய்திகளுடன் இருங்கள்.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#f6fafe] text-[#171c1f]">
      <section className="mx-auto w-full max-w-[1280px] border-b border-[#c6c6cd] bg-white sm:border-x">
        <Link
          href={articleHref(featured)}
          className="group grid text-black lg:grid-cols-5"
        >
          <div className="relative mt-6  h-[300px] overflow-hidden sm:h-[300px] lg:col-span-2">
            
            {articleImage(
              featured,
              "h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
            )}
            <span className="absolute left-6 top-6 bg-white px-3 py-1 text-[11px] font-black tracking-wide text-black transition-colors group-hover:text-[#bb0112] group-active:text-[#bb0112]">
              முக்கிய செய்தி
            </span>
          </div>
          <div className="flex min-h-[220px] flex-col justify-center p-5 sm:min-h-[260px] sm:p-8 lg:col-span-3 lg:p-10">
            <span className="mb-4 text-[11px] font-black tracking-[0.14em] text-[#bd1414]">
              {featured.category_ta || "செய்திகள்"}
            </span>
            <h1 className="break-words font-serif text-[26px] font-black leading-tight text-black transition-colors group-hover:text-[#bb0112] group-active:text-[#bb0112] sm:text-[30px] md:text-[36px]">
              {featured.title}
            </h1>
            <p className="mt-4 line-clamp-2 text-[15px] font-semibold leading-6 text-[#45464d]">
              {articleExcerpt(featured)}
            </p>
            <div className="mt-5 border-t border-[#c6c6cd] pt-3">
              <p className="text-xs font-black text-black">
                {featured.category_ta || "செய்திகள்"}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#76859b]">
                {formatDate(featured.created_at)}
              </p>
            </div>
          </div>
        </Link>
      </section>

      <section className="mx-auto grid w-full max-w-[1280px] border-b border-[#c6c6cd] bg-white sm:border-x lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="lg:border-r lg:border-[#c6c6cd]">
          <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-[#c6c6cd] bg-[#f0f4f8] px-4 py-3 sm:px-7">
            <h2 className="font-serif text-[20px] font-black leading-tight sm:text-2xl">
              சமீபத்திய செய்திகள்
            </h2>
            {hasMoreLatest ? (
              <Link
                href="/latest"
                className="text-[11px] font-black text-black transition-colors hover:text-[#bb0112]"
              >
                அனைத்தும்
              </Link>
            ) : categoryFilter ? (
              <Link
                href="/"
                className="text-[11px] font-black text-[#bb0112] hover:underline"
              >
                வடிகட்டலை நீக்கு
              </Link>
            ) : null}
          </div>

          <div className="grid md:grid-cols-2">
            {latest.map((article, index) => (
              <Link
                key={article.id}
                href={articleHref(article)}
                className={`group min-h-[245px] border-b border-[#c6c6cd] p-5 transition-colors hover:bg-[#f0f4f8] sm:min-h-[285px] sm:p-7 ${
                  index % 2 === 0 ? "md:border-r md:border-[#c6c6cd]" : ""
                }`}
              >
                {index < 2 ? (
                  <div className="mb-5 aspect-video overflow-hidden">
                    {articleImage(
                      article,
                      "h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
                    )}
                  </div>
                ) : null}
                <span className="mb-2 block text-[11px] font-black text-[#bb0112]">
                  {article.category_ta || "செய்திகள்"}
                </span>
                <h3 className="font-serif text-[22px] font-black leading-tight group-hover:underline">
                  {article.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-[14px] font-semibold leading-6 text-[#45464d]">
                  {articleExcerpt(article)}
                </p>
                <p className="mt-4 text-sm font-semibold text-[#76859b]">
                  {formatDate(article.created_at)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="flex flex-col bg-[#f0f4f8]">
          <div className="bg-black px-5 py-5 text-[12px] font-black tracking-[0.12em] text-white sm:px-7 sm:py-6">
            அதிகம் வாசிக்கப்பட்டவை
          </div>
          <div className="bg-white">
            {trending.length > 0 ? (
              trending.map((article, index) => (
                <Link
                  key={`${article.id}-trend`}
                  href={articleHref(article)}
                  className="group flex gap-4 border-b border-[#c6c6cd] p-5 transition-colors hover:bg-[#f0f4f8] sm:gap-5 sm:p-7"
                >
                  <span className="font-serif text-[38px] font-black leading-none text-[#c6c6cd]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-serif text-[16px] font-black leading-tight group-hover:underline">
                      {article.title}
                  </h3>
                  <p className="mt-2 text-xs font-semibold text-[#76859b]">
                      {article.category_ta || "செய்திகள்"} •{" "}
                      {formatDate(article.created_at)}
                  </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="border-b border-[#c6c6cd] p-7 text-sm font-semibold leading-6 text-[#76859b]">
                வாசிப்பு எண்ணிக்கை கிடைத்த பிறகு அதிகம் வாசிக்கப்பட்ட செய்திகள் இங்கு தோன்றும்.
              </div>
            )}
          </div>
          <div className="mt-auto min-h-[260px] bg-[#f0f4f8] p-2 pt-8 sm:min-h-[330px] sm:pt-20">
            <AdBlock label="MREC" size="300×250" compact />
          </div>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-0">
        <AdBlock label="நடுப்பக்க விளம்பரம்" size="970×250" />
      </section>

      {SECTION_ROWS.map((row) => {
        const visibleSections = row.map((category) => ({
          category,
          items: grouped[category]?.slice(0, 2) ?? [],
        }));

        if (visibleSections.every((section) => section.items.length === 0)) {
          return null;
        }

        return (
          <section
            key={row.join("-")}
            className="mx-auto grid w-full max-w-[1280px] border-b border-[#c6c6cd] bg-white sm:border-x lg:grid-cols-2"
          >
            {visibleSections.map((section, index) => (
              <div
                key={section.category}
                className={
                  index === 0 && visibleSections.length > 1
                    ? "lg:border-r lg:border-[#c6c6cd]"
                    : ""
                }
              >
                <SectionTitle
                  title={section.category}
                  link={`/?category=${encodeURIComponent(section.category)}`}
                />
                <div className="grid md:grid-cols-2">
                  {section.items.length > 0
                    ? section.items.map((article, articleIndex) => (
                        <Link
                          key={article.id}
                          href={articleHref(article)}
                          className={`min-h-[220px] p-5 transition-colors hover:bg-[#f0f4f8] sm:min-h-[245px] sm:p-7 ${
                            articleIndex === 0
                              ? "border-b border-[#c6c6cd] md:border-b-0 md:border-r"
                              : ""
                          }`}
                        >
                          <span className="mb-3 block text-[10px] font-black text-[#bb0112]">
                            {article.category_ta || "செய்திகள்"}
                          </span>
                          <h3 className="font-serif text-[20px] font-black leading-tight">
                            {article.title}
                          </h3>
                          <p className="mt-3 line-clamp-2 text-[14px] font-semibold leading-6 text-[#45464d]">
                            {articleExcerpt(article)}
                          </p>
                          <p className="mt-5 text-sm font-black text-[#76859b]">
                            {formatDate(article.created_at)}
                          </p>
                        </Link>
                      ))
                    : [0, 1].map((slot) => (
                        <div
                          key={`${section.category}-${slot}`}
                          className={`min-h-[180px] p-5 sm:min-h-[210px] sm:p-7 ${
                            slot === 0
                              ? "border-b border-[#c6c6cd] md:border-b-0 md:border-r"
                              : ""
                          }`}
                        />
                      ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}

      <section className="mx-auto w-full max-w-[1280px] px-0">
        <AdBlock
          label="தலைப்பு விளம்பரம்"
          size="728×90"
          variant="leaderboard"
        />
      </section>

      <section className="mx-auto w-full max-w-[1280px] border-y border-[#c6c6cd] bg-white sm:border">
        <SectionTitle
          title={INTERNATIONAL_CATEGORY}
          link={`/?category=${encodeURIComponent(INTERNATIONAL_CATEGORY)}`}
        />
        <div className="p-5 sm:p-7">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
            {internationalStories.map((article) => (
              <Link
                href={articleHref(article)}
                key={article.id}
                className="group flex cursor-pointer flex-col gap-4"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {articleImage(
                    article,
                    "h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
                  )}
                </div>
                <h3 className="font-serif text-[18px] font-black leading-tight text-[#76859b] group-hover:underline">
                  {article.title}
                </h3>
                <p className="line-clamp-2 text-[15px] leading-6 text-[#45464d]">
                  {articleExcerpt(article)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
