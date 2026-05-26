import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { fetchJson, fetchNewsList } from "../lib/api";

interface ArticleDetail {
  id: number;
  title: string;
  url: string;
  image: string;
  full_text: string;
  source: string;
  category_ta?: string;
  created_at: string;
}

interface NewsItem {
  id: number;
  title: string;
  image: string;
  source: string;
  category_ta?: string;
  created_at: string;
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setLoadError(null);

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
            allNews
              .filter((n: NewsItem) => n.id !== articleData.id)
              .slice(0, 3)
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
        <Link to="/" className="text-blue-600 hover:underline text-sm">
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
          <Link to="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = article.full_text
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const formattedDate = new Date(article.created_at).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <main className="flex-1">
      {/* Back Link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>

      {/* Hero Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="overflow-hidden rounded-2xl">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-96 bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-blue-400 text-6xl font-bold">N</span>
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
          {article.title}
        </h1>

        {article.category_ta ? (
          <p className="mb-6">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              {article.category_ta}
            </span>
          </p>
        ) : null}

        {/* Meta */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">NEWSCHORIN</p>
              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="max-w-none">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => {
              if (index === 0) {
                return (
                  <p
                    key={index}
                    className="text-gray-700 leading-relaxed mb-6 first-letter:text-5xl first-letter:font-bold first-letter:text-gray-900 first-letter:float-left first-letter:mr-3 first-letter:mt-1"
                  >
                    {paragraph}
                  </p>
                );
              }
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-6">
                  {paragraph}
                </p>
              );
            })
          ) : (
            <p className="text-gray-500 italic">
              Full article text not available. Read the original below.
            </p>
          )}
        </div>

        {/* Original link */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            Read original article &rarr;
          </a>
        </div>
      </article>

      {/* Related News */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">
            Related News
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/article/${item.id}`}
                className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-3xl font-bold">
                        N
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-auto pt-3 text-xs text-gray-400 text-right">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
