import Link from "next/link";

import { PRIMARY_TAMIL_CATEGORIES } from "../constants/tamilCategories";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white">
      <div className="grid w-full border-b border-white/10 md:grid-cols-12">
        <div className="border-white/10 p-10 md:col-span-4 md:border-r lg:p-12">
          <Link
            href="/"
            className="mb-7 inline-flex items-center"
            aria-label="NewsChorin home"
          >
            <img
              src="/images/Logo.jpg"
              alt="NewsChorin"
              className="h-12 w-auto max-w-[190px] rounded bg-white object-contain p-1"
            />
          </Link>
          <p className="max-w-sm text-[15px] font-medium leading-6 text-white/70">
            நம்பகமான செய்திகள், ஆழமான பகுப்பாய்வு, மக்களுக்கு தேவையான
            முக்கிய தகவல்கள்.
          </p>
          <div className="mt-8 hidden gap-4 text-white" aria-hidden="true">
            <span className="text-lg font-black">◎</span>
            <span className="text-lg font-black">▣</span>
            <span className="text-lg font-black">⌯</span>
            <span className="text-lg font-black">@</span>
          </div>
        </div>

        <div className="border-white/10 p-10 md:col-span-2 md:border-r lg:p-12">
          <h4 className="mb-7 text-sm font-black text-white">பிரிவுகள்</h4>
          <ul className="grid gap-4 text-sm font-semibold text-white/55">
            {PRIMARY_TAMIL_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={`/?category=${encodeURIComponent(category)}`}
                  className="transition-colors hover:text-white"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="hidden" aria-hidden="true">
            <li className="hover:text-white">அரசியல்</li>
            <li className="hover:text-white">தொழில்நுட்பம்</li>
            <li className="hover:text-white">வணிகம்</li>
            <li className="hover:text-white">கல்வி</li>
            <li className="hover:text-white">சர்வதேசம்</li>
          </ul>
        </div>

        <div className="border-white/10 p-10 md:col-span-2 md:border-r lg:p-12">
          <h4 className="mb-7 text-sm font-black text-white">நிறுவனம்</h4>
          <ul className="grid gap-4 text-sm font-semibold text-white/55">
            <li>
              <Link
                href="/about"
                className="transition-colors hover:text-white"
              >
                எங்களை பற்றி
              </Link>
            </li>
            <li className="hover:text-white">தொடர்பு</li>
            <li className="hidden" aria-hidden="true">
              நெறிமுறை
            </li>
            <li className="hidden" aria-hidden="true">
              வேலை வாய்ப்பு
            </li>
          </ul>
        </div>

        <div className="flex flex-col justify-between p-10 md:col-span-4 lg:p-12">
          <div className="hidden" aria-hidden="true">
            <h4 className="mb-7 text-sm font-black text-white">சட்டம்</h4>
            <ul className="grid gap-4 text-sm font-semibold text-white/55">
              <li className="hover:text-white">தனியுரிமை கொள்கை</li>
              <li className="hover:text-white">சேவை விதிமுறைகள்</li>
              <li className="hover:text-white">குக்கீ கொள்கை</li>
            </ul>
          </div>
          <p className="mt-12 border-t border-white/10 pt-8 text-[11px] font-black uppercase tracking-[0.16em] text-white/35">
            © 2026 The Akaram News Portal. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
