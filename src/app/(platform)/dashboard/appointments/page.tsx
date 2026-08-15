"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { Calendar, Clock, Video, Star } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
  totalCents: number;
  service: { name: string };
  advisor: { user: { name: string; image: string | null } };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/client/appointments", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.scheduledAt);
    const now = new Date();
    if (filter === "upcoming") return aptDate >= now;
    if (filter === "past") return aptDate < now;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">Confirmada</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="default">En progreso</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Completada</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(cents);
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Mis Citas
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Administra tus asesorías programadas
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todas
        </Button>
        <Button
          variant={filter === "upcoming" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("upcoming")}
        >
          Próximas
        </Button>
        <Button
          variant={filter === "past" ? "default" : "secondary"}
          size="sm"
          onClick={() => setFilter("past")}
        >
          Pasadas
        </Button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Calendar}
              title="No tienes citas"
              description="Explora nuestros asesores y agenda tu primera asesoría."
              action={{
                label: "Explorar asesores",
                onClick: () => window.location.href = "/services",
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      {apt.advisor.user.image ? (
                        <img
                          src={apt.advisor.user.image}
                          alt={apt.advisor.user.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <span className="font-medium text-[var(--primary)]">
                          {apt.advisor.user.name?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {apt.service.name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        con {apt.advisor.user.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(apt.scheduledAt), "d MMM yyyy", { locale: es })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Clock className="w-4 h-4" />
                      {format(new Date(apt.scheduledAt), "HH:mm")} • {apt.durationMin} min
                    </div>
                    <div className="font-medium text-[var(--text-primary)]">
                      {formatCurrency(apt.totalCents)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(apt.status)}
                    {(apt.status === "CONFIRMED" || apt.status === "IN_PROGRESS") && (
                      <Button size="sm" asChild>
                        <Link href={`/call/${apt.id}`}>
                          <Video className="w-4 h-4 mr-1" />
                          Unirse
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
