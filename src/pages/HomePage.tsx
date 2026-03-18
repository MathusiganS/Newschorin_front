import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  created_at: string;
}

export default function HomePage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-500">Loading news...</div>
      </main>
    );
  }

  if (articles.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-gray-500">No news articles found.</div>
      </main>
    );
  }

  const featured = articles[0];
  const latest = articles.slice(1);

  return (
    <main className="flex-1">
      {/* Hero / Featured Article */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <Link to={`/article/${featured.id}`} className="block group">
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
              <span className="inline-block w-fit px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded uppercase tracking-wider">
                Breaking
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                {featured.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium text-gray-700">Tamilwin</span>
                <span>&middot;</span>
                <span>
                  {new Date(featured.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Latest Stories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 md:pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            LATEST STORIES
          </h2>
          <a
            href="#"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            View All &rarr;
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {latest.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Card Image */}
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 text-white text-xs font-semibold rounded uppercase tracking-wider bg-blue-600">
                  NEWS
                </span>
              </div>

              {/* Card Content */}
              <div className="flex flex-col gap-3 p-5 flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <div className="mt-auto pt-3 text-xs text-gray-400">
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
    </main>
  );
}
