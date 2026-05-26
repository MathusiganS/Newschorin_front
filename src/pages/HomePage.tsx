import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { TAMIL_NEWS_CATEGORIES } from "../constants/tamilCategories";
import { fetchNewsList } from "../lib/api";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  source: string;
  category_ta?: string;
  created_at: string;
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category")?.trim() ?? "";
  const categoryFilter =
    categoryParam &&
    (TAMIL_NEWS_CATEGORIES as readonly string[]).includes(categoryParam)
      ? categoryParam
      : "";

  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetchNewsList<NewsItem>(
      categoryFilter ? { category_ta: categoryFilter } : undefined
    )
      .then((data) => {
        if (!cancelled) setArticles(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setArticles([]);
          setLoadError(e instanceof Error ? e.message : "Failed to load news");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryFilter]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-500">Loading news...</div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          Could not load news
        </h1>
        <p className="text-sm text-gray-600 mb-4">{loadError}</p>
        <p className="text-xs text-gray-500">
          From the repo root, run:{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">
            uvicorn tamilwin_scraper.fastapi_app:app --port 4000
          </code>
          , then sync data (e.g. POST /api/sync) if the database is empty.
        </p>
      </main>
    );
  }

  const featured = articles[0];
  const latest = articles.slice(1);

  return (
    <main className="flex-1">
      {articles.length === 0 ? (
        <section className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center gap-2">
          <div className="text-gray-600 font-medium">
            {categoryFilter
              ? `“${categoryFilter}” பிரிவில் செய்திகள் எதுவும் இல்லை.`
              : "No news articles found."}
          </div>
          {categoryFilter ? (
            <Link to="/" className="text-sm text-blue-600 hover:underline">
              அனைத்து செய்திகளையும் காட்டு
            </Link>
          ) : null}
        </section>
      ) : (
        <>
          {/* Hero / Featured Article */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <Link to={`/article/${featured.id}`} className="block group">
              <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
                <div className="relative overflow-hidden rounded-2xl">
                  {featured.image ? (
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-64 md:h-80 bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-blue-400 text-4xl font-bold">N</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {featured.title}
                  </h1>
                  {featured.category_ta ? (
                    <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                      {featured.category_ta}
                    </span>
                  ) : null}
                  <div className="text-sm text-gray-500">
                    {new Date(featured.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </Link>
          </section>

          {/* Latest Stories */}
          {latest.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  LATEST STORIES
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {latest.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.id}`}
                    className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative overflow-hidden">
                      {article.image ? (
                        <img
                          src={article.image}
                          alt={article.title}
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
                        {article.title}
                      </h3>
                      {article.category_ta ? (
                        <span className="inline-flex w-fit rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          {article.category_ta}
                        </span>
                      ) : null}
                      <div className="mt-auto pt-3 text-xs text-gray-400 text-right">
                        {new Date(article.created_at).toLocaleDateString("en-US", {
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
        </>
      )}
    </main>
  );
}
