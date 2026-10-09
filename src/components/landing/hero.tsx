"use client";

import Link from "next/link";
import { Search, ArrowRight, Video, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Horario de ejemplo (datos sintéticos, solo ilustran la agenda)
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"];
const HOURS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00"];

type Slot = "free" | "busy" | "booked" | "lunch";
const GRID: Slot[][] = [
  ["free", "booked", "free", "busy", "free"],
  ["busy", "free", "free", "free", "booked"],
  ["free", "free", "booked", "free", "free"],
  ["lunch", "lunch", "lunch", "lunch", "lunch"],
  ["free", "busy", "free", "booked", "free"],
  ["booked", "free", "free", "free", "busy"],
];

function SlotCell({ kind }: { kind: Slot }) {
  if (kind === "booked")
    return (
      <div className="h-9 rounded-md border-l-2 border-[var(--primary)] bg-[var(--primary-light)] px-1.5 flex items-center">
        <Video className="w-3 h-3 text-[var(--primary)]" aria-hidden />
      </div>
    );
  if (kind === "busy")
    return <div className="h-9 rounded-md hatch border border-[var(--border-light)]" />;
  if (kind === "lunch")
    return <div className="h-9 rounded-md hatch border border-dashed border-[var(--border)] opacity-60" />;
  return (
    <div className="h-9 rounded-md border border-[var(--border)] bg-[var(--surface-raised)]/60 hover:border-[var(--accent)] transition-colors" />
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div className="absolute inset-0 bg-grid" aria-hidden />
      <div
        className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 65%)" }}
        aria-hidden
      />
      <div
        className="absolute -bottom-48 right-0 h-[30rem] w-[30rem] rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)" }}
        aria-hidden
      />

      <div className="container-meti relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        {/* Copy */}
        <div className="min-w-0">
          <p className="eyebrow mb-5 animate-fade-in-up">Asesorías por videollamada</p>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.02] mb-6 animate-fade-in-up">
            Tu próximo asesor,{" "}
            <span className="text-[var(--primary)] whitespace-nowrap">a un click</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mb-10 animate-fade-in-up stagger-1">
            Meti conecta personas con asesores profesionales por videollamada.
            Legal, finanzas, salud, tecnología y más. Agenda al instante, paga de forma segura con Mercado Pago.
          </p>

          <div className="max-w-xl mb-10 animate-fade-in-up stagger-2">
            <div className="relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl focus-within:border-[var(--primary)] transition-colors">
              <Search className="absolute left-4 w-5 h-5 text-[var(--text-muted)]" aria-hidden />
              <input
                type="text"
                aria-label="Buscar asesoría"
                placeholder="¿Qué tipo de asesoría necesitas?"
                className="flex-1 min-w-0 h-12 pl-12 pr-3 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none text-base"
              />
              <Button size="lg" className="rounded-lg px-6" asChild>
                <Link href="/services">
                  Buscar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          <dl className="flex flex-wrap gap-x-10 gap-y-4 animate-fade-in-up stagger-3 border-t border-[var(--border)] pt-6 max-w-xl">
            {[
              ["500+", "Asesores activos", false],
              ["10,000+", "Asesorías realizadas", false],
              ["4.9★", "Calificación promedio", true],
            ].map(([value, label, accent]) => (
              <div key={label as string}>
                <dd className={`text-3xl font-heading font-bold tabular ${accent ? "text-[var(--accent)]" : ""}`}>
                  {value}
                </dd>
                <dt className="text-sm text-[var(--text-muted)]">{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Agenda de ejemplo */}
        <div className="relative min-w-0 pb-24 animate-fade-in-right" aria-hidden>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-heading font-semibold">Semana de agenda</p>
                <p className="text-xs text-[var(--text-muted)]">Ejemplo ilustrativo</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-light)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                Disponible
              </span>
            </div>

            <div className="grid grid-cols-[2.75rem_repeat(5,1fr)] gap-1.5 text-xs">
              <div />
              {DAYS.map((d) => (
                <div key={d} className="text-center font-mono uppercase tracking-wider text-[var(--text-muted)] pb-1">
                  {d}
                </div>
              ))}
              {HOURS.map((h, row) => (
                <div key={h} className="contents">
                  <div className="font-mono text-[var(--text-muted)] self-center tabular">{h}</div>
                  {GRID[row].map((kind, col) => (
                    <SlotCell key={col} kind={kind} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta flotante de reserva */}
          <div className="absolute bottom-0 left-2 sm:-left-8 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-4 shadow-xl animate-float">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--on-primary)]">
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">Consultoría estratégica</p>
                <p className="text-xs text-[var(--text-muted)] tabular">Mar 10:00 · 60 min</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Lock className="w-3 h-3" /> Pago seguro con Mercado Pago
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
