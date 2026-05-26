import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ArticlePage from "./pages/ArticlePage";
import AdminPage from "./pages/AdminPage";

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const routes = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/article/:id" element={<ArticlePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );

  if (isAdmin) {
    return routes;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-[Inter,sans-serif]">
      <Header />
      {routes}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
