import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Home, Search, Menu, X, Facebook, Youtube, ArrowUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navCategories } from "@/lib/news";
import { RadioButton, RadioProvider } from "./radio";
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export function SearchForm({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") || "").trim();
    void navigate({ to: "/", search: { page: 1, q } });
  }
  return (
    <form className={`search-form ${compact ? "compact" : ""}`} role="search" onSubmit={submit}>
      <input
        name="q"
        type="search"
        aria-label="Rechercher des articles"
        placeholder="Rechercher un article…"
      />
      <Button type="submit" aria-label="Rechercher" size="icon">
        <Search />
      </Button>
    </form>
  );
}
export function NewsShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(
      new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Lubumbashi",
      }).format(new Date()),
    );
  }, []);
  return (
    <RadioProvider>
      <header>
        <div className="top-bar">
          <div className="site-container top-inner">
            <span>{date || "Au cœur de l’actualité"}</span>
            <div className="top-right">
              <span>L’information, au plus près de vous.</span>
              <a
                href="https://facebook.com/aupicinfo"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={14} />
              </a>
              <a href="https://x.com/aupicinfo" target="_blank" rel="noreferrer" aria-label="X">
                𝕏
              </a>
              <a
                href="https://www.youtube.com/aupicinfo"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>
        </div>
        <div className="masthead">
          <img src={publicAsset("images/aupic-banner.png")} alt="" className="masthead-image" />
          <div className="masthead-shade" />
          <div className="site-container masthead-inner">
            <Link
              to="/"
              search={{ page: 1, q: "" }}
              className="brand"
              aria-label="Au Pic de l’Info — Accueil"
            >
              <img
                src={publicAsset("images/aupic-logo.png")}
                alt="Au Pic de l’Info"
                className="brand-logo"
                width={150}
                height={150}
              />
            </Link>
            <div className="masthead-radio">
              <span className="live-label">
                <span className="live-dot" /> AUPIC RADIO
              </span>
              <span>L’info s’écoute aussi.</span>
              <RadioButton />
            </div>
          </div>
        </div>
        <nav className="main-nav" aria-label="Navigation principale">
          <div className="site-container nav-inner">
            <Button variant="nav" size="icon" asChild>
              <Link to="/" search={{ page: 1, q: "" }} aria-label="Accueil">
                <Home />
              </Link>
            </Button>
            <div className={`nav-links ${menu ? "open" : ""}`}>
              {navCategories.map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  search={{ page: 1, q: "" }}
                  activeProps={{ className: "nav-active" }}
                  onClick={() => setMenu(false)}
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="nav-tools">
              <Button
                variant="nav"
                size="icon"
                onClick={() => setSearch(!search)}
                aria-label="Ouvrir la recherche"
              >
                {search ? <X /> : <Search />}
              </Button>
              <Button
                variant="nav"
                size="icon"
                className="mobile-menu"
                onClick={() => setMenu(!menu)}
                aria-expanded={menu}
                aria-label="Ouvrir le menu"
              >
                {menu ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
          {search && (
            <div className="site-container nav-search">
              <SearchForm />
            </div>
          )}
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <div className="site-container footer-main">
          <Link
            to="/"
            search={{ page: 1, q: "" }}
            className="footer-brand"
            aria-label="Au Pic de l’Info — Accueil"
          >
            <img
              src={publicAsset("images/aupic-logo.png")}
              alt="Au Pic de l’Info"
              className="footer-logo"
              width={104}
              height={104}
              loading="lazy"
            />
          </Link>
          <div className="footer-nav">
            {navCategories.map((c) => (
              <Link
                key={c.id}
                to="/category/$slug"
                params={{ slug: c.slug }}
                search={{ page: 1, q: "" }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="footer-bottom site-container">
          <span>© {new Date().getUTCFullYear()} Aupic de l’Info.</span>
          <span>
            fierement conçu par{" "}
            <a href="https://oredytech.com" target="_blank" rel="noreferrer">
              Oredy TECHNOLOGIES <ArrowRight size={13} />
            </a>
          </span>
          <Button
            variant="footer"
            size="icon"
            aria-label="Retour en haut"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp />
          </Button>
        </div>
      </footer>
    </RadioProvider>
  );
}
