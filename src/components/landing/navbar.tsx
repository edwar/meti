"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isServicesActive = pathname === "/services" || pathname.startsWith("/advisor/");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-meti flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo-wordmark.svg" alt="Meti" className="h-9 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/services"
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              isServicesActive
                ? "text-[var(--primary)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
            )}
          >
            Explorar asesores
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container-meti py-4 space-y-3">
          <Link
            href="/services"
            className={cn(
              "block py-2 text-sm font-medium transition-colors",
              isServicesActive
                ? "text-[var(--primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            Explorar asesores
          </Link>
          <div className="pt-3 border-t border-[var(--border)] space-y-2">
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
