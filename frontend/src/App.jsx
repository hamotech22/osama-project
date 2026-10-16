import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import AOS from "aos";
// ✏️ تعديل: استيراد Toaster
import { Toaster } from "react-hot-toast";

import Footer from "./components/footer/Footer";
import Loading from "./components/loading/Loading";
import Navbar from "./components/navbar/Navbar";
import About from "./pages/about/About";
import BlogList from "./pages/blog/BlogList";
import BlogPost from "./pages/blog/BlogDetail";
import ContactUs from "./pages/contact/ContactUs";
import Home from "./pages/home/Home";
import CTA from "./pages/cta/CTA";
import ProjectsList from "./pages/projects/ProjectsList";
import ProjectDetail from "./pages/projects/ProjectDetail";
import Services from "./pages/services/Services";
// import ServiceDetail from "./pages/services/ServiceDetail";
import Testimonials from "./pages/testimonials/Testimonials";
import NotFound from "./pages/notFound/NotFound";
import ScrollToTop from "./components/scrollToTop/ScrollToTop";
import BackToTop from "./components/backToTop/BackToTop";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 500,
      once: true,
      offset: 10,
      easing: "ease-out-cubic",
    });

    const timer = setTimeout(() => {
      setLoading(false);
      AOS.refresh();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {/* ✏️ تعديل: مكان عرض التوستات (مرة واحدة بس في المشروع) */}
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "inherit" } }} />

      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/portfolio" element={<ProjectsList />} />
        <Route path="/services" element={<Services />} />
        {/* <Route path="/services/:slug" element={<ServiceDetail />} /> */}
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/cta" element={<CTA />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <BackToTop />
      <Footer />
    </>
  );
}