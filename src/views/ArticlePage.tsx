"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { fetchJson, fetchNewsList, fetchPopularNews } from "../lib/api";
import { formatSriLankaDate } from "../lib/datetime";

interface ArticleDetail {
  id: number;
  title: string;
  url: string;
  image: string;
  full_text: string;
  source: string;
  category_ta?: string;
  created_at: string;
  approved_at?: string;
  view_count?: number;
}

interface NewsItem {
  id: number;
  title: string;
  image: string;
  source: string;
  category_ta?: string;
  created_at: string;
  approved_at?: string;
  view_count?: number;
}

function groupArticleIntoParagraphs(text: string, sentencesPerParagraph = 3) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  let sentences: string[] = [];
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("ta", { granularity: "sentence" });
    sentences = Array.from(segmenter.segment(normalized), ({ segment }) =>
      segment.trim()
    ).filter(Boolean);
  } else {
    sentences = (
      normalized.match(/[^.!?\u0964\u2026]+(?:[.!?\u0964\u2026]+|$)/g) ?? [normalized]
    )
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  }

  const paragraphs: string[] = [];
  for (let index = 0; index < sentences.length; index += sentencesPerParagraph) {
    paragraphs.push(sentences.slice(index, index + sentencesPerParagraph).join(" "));
  }
  return paragraphs;
}

function displayDate(item: { approved_at?: string; created_at: string }) {
  return item.approved_at || item.created_at;
}

export default function ArticlePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [trending, setTrending] = useState<NewsItem[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const trackedViewId = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setNotFound(false);
        setLoadError(null);
      }
    });

    fetchJson<ArticleDetail>(`/api/news/${id}`)
      .then((articleData) => {
        if (cancelled) return;
        setArticle(articleData);
        const category = articleData.category_ta?.trim();
        return fetchNewsList<NewsItem>(
          category ? { category_ta: category } : undefined
        ).then((allNews) => {
          if (cancelled) return;
          setRelated(
            allNews.items
              .filter((n: NewsItem) => n.id !== articleData.id)
              .slice(0, 4)
          );
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
          setNotFound(true);
        } else {
          setLoadError(msg || "Failed to load article");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id || trackedViewId.current === id) return;

    trackedViewId.current = id;
    fetchJson<{
      id: number;
      view_count: number;
      last_30_days_view_count: number;
    }>(`/api/news/${id}/view`, { method: "POST" })
      .then((data) => {
        setArticle((current) =>
          current && String(current.id) === id
            ? { ...current, view_count: data.view_count }
            : current
        );
      })
      .catch(() => undefined);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    fetchPopularNews<NewsItem>(3)
      .then((data) => {
        if (!cancelled) setTrending(data);
      })
      .catch(() => {
        if (!cancelled) setTrending([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-500">Loading article...</div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          Could not load article
        </h1>
        <p className="text-sm text-gray-600 mb-4">{loadError}</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          &larr; Back to Home
        </Link>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article not found
          </h1>
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = groupArticleIntoParagraphs(article.full_text, 3);

  const formattedDate = formatSriLankaDate(displayDate(article), {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const category = article.category_ta || "செய்திகள்";

  const shareArticle = () => {
    const shareData = {
      title: article.title,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => undefined);
      return;
    }

    navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <main className="flex-1 bg-white text-[#171c1f]">
      <div className="print-hidden fixed left-0 top-0 z-[100] h-1 w-full pointer-events-none">
        <div
          className="h-full bg-[#bb0112] transition-[width] duration-100"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-5 sm:py-8">
        <nav className="print-hidden mb-6 flex min-w-0 flex-wrap items-center gap-2 text-[12px] font-black tracking-[0.05em] text-[#45464d]">
          <Link
            href={`/?category=${encodeURIComponent(category)}`}
            className="hover:text-black"
          >
            {category}
          </Link>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
          <span className="text-[#76777d]">செய்தி</span>
        </nav>

        <article className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-20">
          <div className="print-article lg:col-span-8">
            <header className="mb-6 sm:mb-12">
              <h1 className="break-words font-serif text-[30px] font-black leading-tight text-black sm:text-[34px] md:text-[48px]">
                {article.title}
              </h1>

              <div className="mt-4 border-y border-[#c6c6cd] py-3 sm:mt-8 sm:py-4">
                <div className="flex w-full items-center justify-between gap-3">
                  <time className="text-[13px] font-semibold text-[#45464d]">
                    {formattedDate}
                  </time>
                  <div className="print-hidden flex shrink-0 items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={shareArticle}
                      className="flex h-10 w-10 items-center justify-center text-[#45464d] hover:text-[#bb0112]"
                      aria-label="Share"
                    >
                      <span className="material-symbols-outlined">share</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex h-10 w-10 items-center justify-center text-[#45464d] hover:text-[#bb0112]"
                      aria-label="Print"
                    >
                      <span className="material-symbols-outlined">print</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <figure className="mb-6 sm:mb-12">
              <div className="aspect-video w-full overflow-hidden rounded">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#e4e9ed]">
                    <span className="font-serif text-6xl font-black text-[#c6c6cd]">
                      N
                    </span>
                  </div>
                )}
              </div>
            </figure>

            <div className="max-w-none text-[16px] leading-7 text-black sm:text-[18px] sm:leading-8">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={`mb-6 ${
                      index === 0
                        ? "first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-black first-letter:leading-none"
                        : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="italic text-[#45464d]">
                  முழு செய்தி உரை கிடைக்கவில்லை.
                </p>
              )}
            </div>

            <div className="print-hidden mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#c6c6cd] pt-6 sm:mt-20 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                <span className="rounded bg-[#f0f4f8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.05em] text-[#45464d]">
                  {category}
                </span>
                <span className="rounded bg-[#f0f4f8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.05em] text-[#45464d]">
                  தமிழ் செய்திகள்
                </span>
                <span className="rounded bg-[#f0f4f8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.05em] text-[#45464d]">
                  அகரம்
                </span>
              </div>

              <div className="flex items-center gap-4">
                <p className="text-[12px] font-black uppercase tracking-[0.05em] text-[#45464d]">
                  பகிர்
                </p>
                <button
                  type="button"
                  onClick={shareArticle}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-[#bb0112]"
                  aria-label="Share story"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    share
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard
                      ?.writeText(window.location.href)
                      .catch(() => undefined)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-[#bb0112]"
                  aria-label="Copy link"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    link
                  </span>
                </button>
              </div>
            </div>
          </div>

          <aside className="print-hidden space-y-10 lg:col-span-4 lg:space-y-12">
            <div className="flex flex-col items-center border border-[#c6c6cd] bg-[#f0f4f8] p-2">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#45464d]">
                விளம்பரம்
              </p>
              <div className="flex h-[250px] w-full max-w-[300px] items-center justify-center bg-[#dfe3e7] p-4 text-center">
                <div className="space-y-2">
                  <p className="text-[12px] font-black text-black">
                    அகரம் Premium
                  </p>
                  <p className="text-[13px] font-semibold text-[#45464d]">
                    நம்பகமான செய்தி பகுப்பாய்வு.
                  </p>
                  <button className="text-[12px] font-black text-[#bb0112]">
                    மேலும் அறிக
                  </button>
                </div>
              </div>
            </div>

            <section>
              <h3 className="mb-6 inline-block border-b-2 border-black pb-1 text-[12px] font-black uppercase tracking-[0.05em] text-black">
                அதிகம் வாசிக்கப்பட்டவை
              </h3>
              <div className="mt-4 space-y-4">
                {(trending.length ? trending : related).slice(0, 3).map(
                  (item, index) => (
                    <div key={`${item.id}-view-trending`}>
                      <Link
                        href={`/article/${item.id}`}
                        className="group flex min-w-0 items-start gap-4"
                      >
                        <span className="font-serif text-[42px] font-black leading-none text-[#c6c6cd] transition-colors group-hover:text-[#bb0112]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <h4 className="break-words text-[16px] font-black leading-tight text-black group-hover:underline">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-[13px] font-semibold text-[#45464d]">
                            {formatSriLankaDate(displayDate(item), {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </Link>
                      {index < 2 ? (
                        <div className="mt-4 h-px w-full bg-[#c6c6cd]" />
                      ) : null}
                    </div>
                  )
                )}
              </div>
            </section>
          </aside>
        </article>

        {related.length > 0 ? (
          <section className="print-hidden mt-12 border-t border-[#c6c6cd] pt-12 sm:mt-20 sm:pt-20">
            <h2 className="mb-8 font-serif text-[26px] font-black text-black sm:mb-12 sm:text-[32px]">
              தொடர்புடைய செய்திகள்
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/article/${item.id}`}
                  className="group flex h-full flex-col border border-[#c6c6cd] bg-white transition-colors hover:bg-[#f0f4f8]"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#e4e9ed]">
                        <span className="font-serif text-3xl font-black text-[#c6c6cd]">
                          N
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="mb-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#bb0112]">
                      {item.category_ta || category}
                    </span>
                    <h3 className="break-words font-serif text-[18px] font-black leading-snug text-black group-hover:underline">
                      {item.title}
                    </h3>
                    <p className="mt-auto pt-4 text-[13px] font-semibold text-[#45464d]">
                      {formatSriLankaDate(displayDate(item), {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
