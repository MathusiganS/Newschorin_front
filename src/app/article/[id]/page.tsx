import { Suspense } from "react";

import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import ArticlePage from "@/views/ArticlePage";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-[Inter,sans-serif]">
      <Suspense>
        <Header />
        <ArticlePage />
      </Suspense>
      <Footer />
    </div>
  );
}
