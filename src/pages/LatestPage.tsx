"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { fetchNewsList } from "../lib/api";
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

function articleExcerpt(article: NewsItem) {
  const text = article.excerpt?.trim();
  if (text) return text;
  return formatDate(article.created_at);
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
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(null);

    fetchNewsList<NewsItem>()
      .then((data) => {
        if (!cancelled) setArticles(data);
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
  }, []);

  const latestArticles = useMemo(() => {
    return articles
      .slice()
      .sort(
        (a, b) => sriLankaTimeValue(b.created_at) - sriLankaTimeValue(a.created_at)
      );
  }, [articles]);

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

  return (
    <main className="flex-1 bg-[#f6fafe] text-[#171c1f]">
      <section className="mx-auto w-full max-w-[1280px] border-x border-b border-[#c6c6cd] bg-white">
        <div className="flex flex-col justify-between gap-6 border-b border-black px-7 py-10 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#bb0112]">
              NewsChorin
            </p>
            <h1 className="font-serif text-[38px] font-black leading-tight text-black md:text-[54px]">
              சமீபத்திய செய்திகள்
            </h1>
            <p className="mt-4 max-w-2xl text-[16px] font-semibold leading-7 text-[#45464d]">
              புதிய செய்திகள் அனைத்தும் நேர வரிசையில் இங்கு தொகுக்கப்பட்டுள்ளன.
            </p>
          </div>
          
        </div>

        {latestArticles.length > 0 ? (
          <div className="grid gap-7 bg-[#f6fafe] p-7 md:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article, index) => (
              <Link
                key={article.id}
                href={articleHref(article)}
                className="group min-h-[360px] border border-[#c6c6cd] bg-white p-7 transition-colors hover:border-black hover:bg-[#f0f4f8]"
              >
                <div className="mb-5 aspect-video overflow-hidden">
                  {articleImage(
                    article,
                    "h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  )}
                </div>
                <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.08em] text-[#bb0112]">
                  {article.category_ta || "செய்திகள்"}
                </span>
                <h2 className="font-serif text-[22px] font-black leading-tight text-black transition-colors group-hover:text-[#bb0112]">
                  {article.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-[14px] font-semibold leading-6 text-[#45464d]">
                  {articleExcerpt(article)}
                </p>
                <p className="mt-5 border-t border-[#c6c6cd] pt-4 text-sm font-semibold text-[#76859b]">
                  {formatDate(article.created_at)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-sm font-semibold text-[#76777d]">
            செய்திகள் இல்லை.
          </div>
        )}
      </section>
    </main>
  );
}
