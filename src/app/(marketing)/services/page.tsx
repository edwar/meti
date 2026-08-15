"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { RatingStars } from "@/components/ui/rating-stars";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Briefcase,
} from "lucide-react";

interface Advisor {
  id: string;
  name: string;
  image: string | null;
  speciality: string | null;
  bio: string | null;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  minPrice: number;
  minPriceWithFee: number;
  categories: string[];
  appointmentCount: number;
}

const categories = [
  { name: "Todos", slug: "" },
  { name: "Legal", slug: "legal" },
  { name: "Finanzas", slug: "finanzas" },
  { name: "Salud", slug: "salud" },
  { name: "Tecnología", slug: "tecnologia" },
  { name: "Educación", slug: "educacion" },
  { name: "Negocios", slug: "negocios" },
  { name: "Diseño", slug: "diseno" },
  { name: "Marketing", slug: "marketing" },
];

function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function ServicesPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "price" | "reviews">("rating");

  useEffect(() => {
    fetchAdvisors();
  }, [selectedCategory]);

  const fetchAdvisors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/services?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAdvisors(data.advisors || []);
      }
    } catch (error) {
      console.error("Error fetching advisors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAdvisors();
  };

  const sortedAdvisors = [...advisors].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price") return a.minPrice - b.minPrice;
    if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
    return 0;
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-white py-12">
        <div className="container-meti">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Encuentra tu asesor ideal
            </h1>
            <p className="text-white/80 mb-8">
              Explora profesionales expertos en diferentes áreas y agenda tu asesoría
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad o rubro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-14 pl-12 pr-4 bg-white rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleSearch}
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-meti py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-4">
                  Filtros
                </h3>

                {/* Categories */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--text-muted)] mb-2">
                    Categorías
                  </p>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedCategory === cat.slug
                          ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                          : "text-[var(--text-secondary)] hover:bg-[var(--background)]"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-[var(--text-muted)] mb-2">
                    Ordenar por
                  </p>
                  <Select
                    value={sortBy}
                    onChange={(value) => setSortBy(value as any)}
                    options={[
                      { value: "rating", label: "Mejor calificados" },
                      { value: "price", label: "Menor precio" },
                      { value: "reviews", label: "Más reseñas" },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)]">
                {sortedAdvisors.length} asesores encontrados
              </h2>
            </div>

            {sortedAdvisors.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <EmptyState
                    icon={Briefcase}
                    title="No se encontraron asesores"
                    description="Intenta con otros filtros o términos de búsqueda."
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedAdvisors.map((advisor) => (
                  <Link key={advisor.id} href={`/advisor/${advisor.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                          {advisor.image ? (
                            <img
                              src={advisor.image}
                              alt={advisor.name}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                              <span className="text-xl font-bold text-[var(--primary)]">
                                {advisor.name?.charAt(0) || "?"}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                                {advisor.name}
                              </h3>
                              {advisor.isVerified && (
                                <VerifiedBadge isVerified={true} size="sm" />
                              )}
                            </div>
                            <p className="text-sm text-[var(--text-muted)] truncate">
                              {advisor.speciality || "Profesional"}
                            </p>
                          </div>
                        </div>

                        {/* Bio preview */}
                        {advisor.bio && (
                          <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
                            {advisor.bio}
                          </p>
                        )}

                        {/* Categories */}
                        {advisor.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {advisor.categories.slice(0, 3).map((cat) => (
                              <Badge key={cat} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {advisor.categories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{advisor.categories.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                          <RatingStars
                            rating={advisor.rating}
                            size="sm"
                            showValue
                            reviewCount={advisor.reviewCount}
                          />
                          {advisor.minPriceWithFee > 0 && (
                            <span className="text-sm font-heading font-bold text-[var(--primary)]">
                              Desde {formatPrice(advisor.minPriceWithFee)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
