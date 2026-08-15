"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { authClient } from "@/lib/auth-client";
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  LogIn,
} from "lucide-react";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialog = useDialog();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [advisorHasMP, setAdvisorHasMP] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const advisorId = searchParams.get("advisorId");
  const advisorName = searchParams.get("advisorName") || "Asesor";
  const serviceId = searchParams.get("serviceId");
  const serviceName = searchParams.get("serviceName") || "Servicio";
  const servicePrice = Number(searchParams.get("servicePrice") || "0");
  const duration = Number(searchParams.get("duration") || "60");
  const date = searchParams.get("date") || "Por definir";
  const time = searchParams.get("time") || "Por definir";

  const serviceFee = Math.round(servicePrice * 0.15);
  const serviceTotal = servicePrice + serviceFee;

  useEffect(() => {
    // Consume el booking pendiente guardado antes del login (lo deja /redirect sin borrar)
    localStorage.removeItem("meti-pending-booking");
    checkLoginStatus();
    if (advisorId) {
      checkAdvisorMP(advisorId);
    }
  }, [advisorId]);

  const checkLoginStatus = async () => {
    try {
      const { data } = await authClient.getSession();
      setIsLoggedIn(!!data);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const checkAdvisorMP = async (id: string) => {
    try {
      const res = await fetch(`/api/advisors/${id}/mercadopago`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAdvisorHasMP(data.isConnected);
      } else {
        setAdvisorHasMP(false);
      }
    } catch (error) {
      setAdvisorHasMP(false);
    }
  };

  const handleLogin = () => {
    // Save booking data to localStorage before going to login
    const bookingData = {
      advisorId,
      advisorName,
      serviceId,
      serviceName,
      servicePrice: String(servicePrice),
      duration: String(duration),
      date,
      time,
    };
    localStorage.setItem("meti-pending-booking", JSON.stringify(bookingData));
    // Redirect to login - will come back to checkout after login
    router.push("/login");
  };

  const handlePayment = async () => {
    // If not logged in, go to login
    if (isLoggedIn === false) {
      handleLogin();
      return;
    }

    // Wait for login check
    if (isLoggedIn === null) return;

    if (!advisorHasMP) {
      dialog.showAlert(
        "Pago no disponible",
        "Este asesor aún no ha configurado su cuenta de Mercado Pago.",
        "warning"
      );
      return;
    }

    setIsProcessing(true);
    
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          advisorId,
          serviceId,
          scheduledAt: new Date(`${date}T${time}`).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error creating appointment");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsComplete(true);
      localStorage.removeItem("meti-pending-booking");
    } catch (error) {
      console.error("Error:", error);
      dialog.showAlert("Error", "Error al crear la cita. Intenta de nuevo.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // No data state
  if (!advisorId || !serviceId) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-[var(--text-muted)] mb-4">No hay datos de reserva</p>
            <Button onClick={() => router.push("/services")}>
              Explorar servicios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isComplete) {
    return (
      <>
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[var(--success)]" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                ¡Reserva confirmada!
              </h1>
              <p className="text-[var(--text-muted)] mb-6">
                Recibirás un correo con los detalles de tu asesoría y el enlace de videollamada.
              </p>
              <Button className="w-full" onClick={() => router.push("/dashboard")}>
                Ir a mi panel
              </Button>
            </CardContent>
          </Card>
        </div>
        <AlertDialog state={dialog} />
      </>
    );
  }

  // Main checkout view
  return (
    <>
      <div className="min-h-screen bg-[var(--background)]">
        <header className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-lg border-b border-[var(--border)]">
          <div className="container-meti flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="ml-4 font-heading font-semibold text-[var(--text-primary)]">
              Checkout
            </h1>
          </div>
        </header>

        <div className="container-meti py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Login Required */}
              {isLoggedIn === false && (
                <Card className="border-[var(--primary)]">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                        <LogIn className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-[var(--text-primary)] text-lg">
                          Inicia sesión para continuar
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          Necesitas una cuenta para realizar esta compra
                        </p>
                      </div>
                      <Button onClick={handleLogin} size="lg">
                        Iniciar sesión
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Método de pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {advisorHasMP === false ? (
                    <div className="p-4 rounded-lg border-2 border-[var(--warning)] bg-[var(--warning-light)]">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            Pago no disponible
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            Este asesor aún no ha configurado su cuenta de Mercado Pago.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg border-2 border-[var(--primary)] bg-[var(--primary-light)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">Mercado Pago</p>
                          <p className="text-sm text-[var(--text-muted)]">Tarjeta de crédito, débito o dinero en cuenta</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <Shield className="w-4 h-4" />
                    Pago seguro con Mercado Pago
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--warning-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">⚠️</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-[var(--text-primary)] mb-1">Política de cancelación</p>
                      <ul className="text-[var(--text-muted)] space-y-1">
                        <li>• Reagendar gratis con 24h de anticipación</li>
                        <li>• Cancelar sin reagendar = sin devolución</li>
                        <li>• No presentarse = sin devolución</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <p className="font-medium text-[var(--text-primary)]">{advisorName}</p>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-primary)]">{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-primary)]">{time} • {duration} min</span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4">
                    <div className="flex justify-between font-heading font-bold text-lg">
                      <span className="text-[var(--text-primary)]">{serviceName}</span>
                      <span className="text-[var(--primary)]">{formatCurrency(serviceTotal)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Incluye todos los costos</p>
                  </div>

                  <Button
                    className="w-full h-12 text-base mt-4"
                    onClick={handlePayment}
                    disabled={isProcessing || advisorHasMP === false}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Procesando...
                      </div>
                    ) : isLoggedIn === false ? (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Iniciar sesión para pagar
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pagar {formatCurrency(serviceTotal)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog state={dialog} />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <CheckoutContent />
    </Suspense>
  );
}
