import { Suspense } from "react";

import Footer from "../../components/Footer";
import Header from "../../components/Header";
import LatestPage from "@/views/LatestPage";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-[Inter,sans-serif]">
      <Suspense>
        <Header />
        <LatestPage />
      </Suspense>
      <Footer />
    </div>
  );
}
