"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  OTHER_TAMIL_CATEGORIES,
  PRIMARY_TAMIL_CATEGORIES,
} from "../constants/tamilCategories";

const NAV_ITEMS = [
  { label: "அரசியல்", category: "அரசியல்" },
  { label: "தொழில்நுட்பம்", category: "தொழில்நுட்பம்" },
  { label: "வணிகம்", category: "வணிகம்" },
  { label: "கல்வி", category: "கல்வி" },
  { label: "மதம் & கலாச்சாரம்", category: "மதம் & கலாச்சாரம்" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get("category") ?? "";
  const activeSearch = searchParams?.get("search") ?? "";
  const [searchText, setSearchText] = useState(activeSearch);
  const otherActive = OTHER_TAMIL_CATEGORIES.includes(
    activeCategory as (typeof OTHER_TAMIL_CATEGORIES)[number]
  );

  useEffect(() => {
    queueMicrotask(() => {
      setSearchText(activeSearch);
    });
  }, [activeSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchText.trim();
      if (nextSearch === activeSearch) return;

      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (nextSearch) params.set("search", nextSearch);
      else params.delete("search");

      const targetPath = nextSearch ? "/latest" : pathname || "/";
      const query = params.toString();
      router.replace(query ? `${targetPath}?${query}` : targetPath, {
        scroll: false,
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [activeSearch, pathname, router, searchParams, searchText]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#cfd4da] bg-white">
      <div className="flex min-h-[66px] w-full flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-5 md:flex-nowrap md:gap-6 md:py-0">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center md:ml-6 xl:ml-24"
          aria-label="NewsChorin home"
        >
          <img
            src="/images/Logo.jpg"
            alt="NewsChorin"
            className="h-9 w-auto max-w-[150px] object-contain sm:h-11 sm:max-w-[190px] md:h-14"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8">
          <Link
            href="/"
            className={`text-[13px] font-black leading-none transition-colors hover:text-[#bb0112] ${
              activeCategory ? "text-[#3f465c]" : "text-[#bb0112]"
            }`}
          >
            முகப்பு
          </Link>

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.category}
              href={`/?category=${encodeURIComponent(item.category)}`}
              className={`text-[13px] font-black leading-none transition-colors hover:text-[#bb0112] ${
                activeCategory === item.category
                  ? "text-[#bb0112]"
                  : "text-[#3f465c]"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <details className="group relative">
            <summary
              className={`flex cursor-pointer list-none items-center gap-1 text-[13px] font-black leading-none transition-colors marker:hidden hover:text-[#bb0112] ${
                otherActive ? "text-[#bb0112]" : "text-[#3f465c]"
              }`}
            >
              மற்றவை
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 transition-transform group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>

            <div className="absolute right-0 top-7 z-50 grid w-64 gap-1 border border-[#cfd4da] bg-white p-2 shadow-2xl">
              {OTHER_TAMIL_CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/?category=${encodeURIComponent(category)}`}
                  className={`border-l-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                    activeCategory === category
                      ? "border-[#bb0112] bg-[#f0f4f8] text-black"
                      : "border-transparent text-[#45464d] hover:border-[#bb0112] hover:bg-[#f6fafe] hover:text-black"
                  }`}
                >
                  {category}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3 md:mr-6 md:flex-none xl:mr-24">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 border border-[#cfd4da] px-3 text-[#3f465c] transition-colors focus-within:border-black sm:max-w-[260px] md:h-9 md:w-auto md:flex-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-[17px] w-[17px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.606 10.606Z"
              />
            </svg>
            <span className="sr-only">Search news</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-black outline-none placeholder:text-[#76777d] md:w-36 md:flex-none"
              type="search"
            />
          </label>
          <Link
            href="/admin"
            className="hidden"
          >
            உள்நுழை
          </Link>
          <button className="hidden">
            சந்தா
          </button>
        </div>
      </div>

      <div className="border-t border-[#e3e7eb] px-3 py-2 lg:hidden">
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="shrink-0 rounded border border-[#e3e7eb] px-3 py-2 text-xs font-bold text-[#3f465c]">
            முகப்பு
          </Link>
          {PRIMARY_TAMIL_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/?category=${encodeURIComponent(category)}`}
              className="shrink-0 rounded border border-[#e3e7eb] px-3 py-2 text-xs font-bold text-[#3f465c]"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
