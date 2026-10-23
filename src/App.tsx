import { useEffect, useState } from "react";
import Lenis from "lenis";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import HeroCinematic from "./components/HeroCinematic";
import TradeHero from "./sections/TradeHero";
import Marquee from "./components/Marquee";
import Stats from "./components/Stats";
import Divisions from "./components/Divisions";
import Stores from "./sections/Stores";
import About from "./components/About";
import Process from "./components/Process";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ChatBot from "./chatbot/ChatBot";
import AdminApp from "./admin/AdminApp";

function MainSite() {
  return (
    <div className="min-h-screen bg-ink text-steel">
      <Navbar />
      <main>
        <HeroCinematic />
        <TradeHero />
        <Marquee />
        <Stats />
        <Divisions />
        <Stores />
        <About />
        <Process />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash);
  const isAdmin = route.startsWith("#/admin");

  /* routing */
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  /* lenis smooth scroll + safe anchors */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#" || id.startsWith("#/")) return; // route hashes handled by browser
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -70, duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [isAdmin]);

  return (
    <>
      <Cursor />
      {isAdmin ? <AdminApp /> : <MainSite />}
    </>
  );
}
