"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get("category") ?? "";
  const otherActive = OTHER_TAMIL_CATEGORIES.includes(
    activeCategory as (typeof OTHER_TAMIL_CATEGORIES)[number]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#cfd4da] bg-white">
      <div className="flex h-[66px] w-full items-center justify-between gap-6 px-5">
        <Link
          href="/"
          className="font-serif text-[26px] font-black uppercase leading-none tracking-normal text-black transition-colors hover:text-[#bb0112]"
        >
          The Chronicle
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
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

        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-[#3f465c] transition-colors hover:text-black"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-[19px] w-[19px]"
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
          </button>
          <Link
            href="/admin"
            className="hidden h-9 items-center border border-[#c6c6cd] px-5 text-[11px] font-black text-black transition-colors hover:border-black sm:flex"
          >
            உள்நுழை
          </Link>
          <button className="h-9 bg-black px-5 text-[11px] font-black text-white transition-colors hover:bg-[#bb0112]">
            சந்தா
          </button>
        </div>
      </div>

      <div className="border-t border-[#e3e7eb] px-4 py-2 md:hidden">
        <div className="flex gap-5 overflow-x-auto">
          <Link href="/" className="shrink-0 text-xs font-bold text-[#3f465c]">
            முகப்பு
          </Link>
          {PRIMARY_TAMIL_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/?category=${encodeURIComponent(category)}`}
              className="shrink-0 text-xs font-bold text-[#3f465c]"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
