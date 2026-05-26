import { Link, useLocation, useSearchParams } from "react-router-dom";

import { TAMIL_NEWS_CATEGORIES } from "../constants/tamilCategories";

export default function Header() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";
  const isHome = location.pathname === "/";
  const homeAllActive = isHome && !activeCategory;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              NEWSCHORIN
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-5 shrink-0">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors whitespace-nowrap ${
                homeAllActive
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Home
            </Link>
            <Link
              to="/admin"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Admin
            </Link>
          </nav>

          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors shrink-0"
            aria-label="Search"
          >
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        <div className="border-t border-gray-100 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <Link
              to="/"
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                homeAllActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              அனைத்தும்
            </Link>
            {TAMIL_NEWS_CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <Link
                  key={cat}
                  to={`/?category=${encodeURIComponent(cat)}`}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
