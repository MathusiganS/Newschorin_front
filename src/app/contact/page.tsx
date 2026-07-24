import type { Metadata } from "next";
import { Suspense } from "react";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import ContactPage from "../../views/ContactPage";

export const metadata: Metadata = {
  title: "தொடர்புகளுக்கு | அகரம் செய்திகள்",
  description:
    "செய்தித் தகவல்கள், கருத்துகள் மற்றும் பொதுவான விசாரணைகளுக்கு அகரம் செய்திகளைத் தொடர்புகொள்ளுங்கள்.",
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-[Inter,sans-serif]">
      <Suspense>
        <Header />
      </Suspense>
      <ContactPage />
      <Footer />
    </div>
  );
}
