"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Shield, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Zap,
    text: "Configura tus propios precios y horarios",
  },
  {
    icon: Shield,
    text: "Cobra directamente con tu Mercado Pago",
  },
  {
    icon: Video,
    text: "Videollamada y chat integrados",
  },
  {
    icon: Clock,
    text: "Sin límite de asesorías diarias",
  },
  {
    icon: CheckCircle,
    text: "Promociones cuando tú lo decidas",
  },
];

export function CTAAdvisor() {
  return (
    <section
      id="para-asesores"
      className="py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-[var(--on-primary)] overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container-meti relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              ¿Eres profesional? Ofrece tus asesorías con Meti
            </h2>
            <p className="text-lg text-[var(--on-primary)]/85 mb-8">
              Únete a nuestra plataforma y llega a clientes que buscan tu
              experiencia. Tú defines tus precios, horarios y condiciones. Nosotros
              nos encargamos de la tecnología.
            </p>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 animate-fade-in-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-black/15 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[var(--on-primary)]">{benefit.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--surface-raised)] shadow-lg"
                asChild
              >
                <Link href="/register">
                  Comenzar ahora
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="border-[var(--on-primary)] text-[var(--on-primary)] hover:bg-black/10 hover:text-[var(--on-primary)]"
                asChild
              >
                <Link href="#como-funciona">Saber más</Link>
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="relative bg-black/15 rounded-2xl p-8 border border-black/10 animate-fade-in-right">
              {/* Mock advisor card */}
              <div className="bg-[var(--surface)] rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--primary)]">JP</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-[var(--text-primary)]">
                      Juan Pérez
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      Legal Corporativo
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Ganancia por asesoría</span>
                  <span className="font-heading font-bold text-[var(--primary)]">
                    $50,000
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-[var(--text-muted)]">Fee plataforma</span>
                  <span className="text-[var(--text-secondary)]">$7,500</span>
                </div>
                <div className="border-t border-[var(--border)] mt-4 pt-4 flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">
                    Total cliente
                  </span>
                  <span className="font-heading font-bold text-lg text-[var(--text-primary)]">
                    $57,500
                  </span>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-[var(--accent)] text-[var(--on-accent)] px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-float">
                100% Online
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[var(--background)] text-[var(--text-primary)] px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                Pago seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
