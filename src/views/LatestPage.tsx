"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { fetchNewsList } from "../lib/api";
import { formatSriLankaDate } from "../lib/datetime";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  source: string;
  category_ta?: string;
  created_at: string;
  approved_at?: string;
  view_count?: number;
  excerpt?: string;
}

const PAGE_SIZE = 12;

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

function displayDate(article: NewsItem) {
  return article.approved_at || article.created_at;
}

function articleExcerpt(article: NewsItem) {
  const text = article.excerpt?.trim();
  if (text) return text;
  return formatDate(displayDate(article));
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

export default function LatestPage() {
  const searchParams = useSearchParams();
  const search = searchParams?.get("search")?.trim() ?? "";
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setPage(0);
    });
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setLoadError(null);
      }
    });

    fetchNewsList<NewsItem>({
      search,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then((data) => {
        if (!cancelled) {
          setArticles(data.items);
          setTotal(data.total);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setArticles([]);
          setTotal(0);
          setLoadError(
            error instanceof Error ? error.message : "Unable to load news."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading && articles.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f6fafe] py-24">
        <div className="border border-[#c6c6cd] bg-white px-6 py-4 text-sm font-semibold text-[#76777d]">
          Loading news...
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f6fafe] px-4 py-24 text-center">
        <div className="max-w-xl border border-[#c6c6cd] bg-white p-8">
          <h1 className="font-serif text-2xl font-black text-black">
            Unable to load news
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#45464d]">{loadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#f6fafe] text-[#171c1f]">
      <section className="mx-auto w-full max-w-[1280px] border-b border-[#c6c6cd] bg-white sm:border-x">
        <div className="flex flex-col justify-between gap-6 border-b border-black px-4 py-7 sm:px-7 sm:py-10 md:flex-row md:items-end">
          <div>
            <h1 className="break-words font-serif text-[30px] font-black leading-tight text-black sm:text-[38px] md:text-[54px]">
              சமீபத்திய செய்திகள்
            </h1>
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-4 bg-[#f6fafe] p-4 sm:gap-7 sm:p-7 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={articleHref(article)}
                className="group min-h-[320px] border border-[#c6c6cd] bg-white p-5 transition-colors hover:border-black hover:bg-[#f0f4f8] sm:min-h-[360px] sm:p-7"
              >
                <div className="mb-5 aspect-video overflow-hidden">
                  {articleImage(
                    article,
                    "h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  )}
                </div>
                <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.08em] text-[#bb0112]">
                  {article.category_ta || "News"}
                </span>
                <h2 className="break-words font-serif text-[20px] font-black leading-tight text-black transition-colors group-hover:text-[#bb0112] sm:text-[22px]">
                  {article.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-[14px] font-semibold leading-6 text-[#45464d]">
                  {articleExcerpt(article)}
                </p>
                <p className="mt-5 border-t border-[#c6c6cd] pt-4 text-sm font-semibold text-[#76859b]">
                  {formatDate(displayDate(article))}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-sm font-semibold text-[#76777d]">
            No articles found.
          </div>
        )}

        {total > PAGE_SIZE ? (
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-[#c6c6cd] bg-white p-4 text-sm font-black text-[#45464d] sm:flex-row sm:items-center sm:p-6">
            <span>
              Page {page + 1} of {totalPages} • {total} articles
            </span>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0 || loading}
                className="min-h-11 border border-[#c6c6cd] px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages - 1, current + 1))
                }
                disabled={page >= totalPages - 1 || loading}
                className="min-h-11 border border-[#c6c6cd] bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
