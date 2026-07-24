import type { Metadata } from "next";
import { Suspense } from "react";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import AboutPage from "../../views/AboutPage";

export const metadata: Metadata = {
  title: "எங்களைப் பற்றி | அகரம் செய்திகள்",
  description:
    "அகரம் செய்திகளின் நோக்கம், மதிப்புகள் மற்றும் நம்பகமான செய்திப் பயணம் பற்றி அறியுங்கள்.",
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-[Inter,sans-serif]">
      <Suspense>
        <Header />
      </Suspense>
      <AboutPage />
      <Footer />
    </div>
  );
}
