"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge } from "@/components/ui/badge";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
  Save,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Lock,
  Shield,
  Zap,
  Receipt,
} from "lucide-react";

export default function MercadoPagoPage() {
  const dialog = useDialog();
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await fetch("/api/advisor/mercadopago", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.publicKey) {
          setPublicKey(data.publicKey);
          setAccessToken(data.accessToken ? "••••••••••••••••" : "");
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!publicKey || !accessToken) {
      dialog.showAlert(
        "Campos requeridos",
        "Public Key y Access Token son requeridos",
        "warning"
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/advisor/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publicKey, accessToken }),
      });

      if (res.ok) {
        setIsConnected(true);
        setHasChanges(false);
        dialog.showAlert("Éxito", "Credenciales guardadas correctamente", "success");
      } else {
        dialog.showAlert("Error", "Error al guardar credenciales", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Configuración de Pagos
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Conecta tu cuenta de Mercado Pago para recibir pagos directamente
          </p>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Status & How it works */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connection Status */}
            <Card className={isConnected ? "border-[var(--success)]" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isConnected ? "bg-[var(--success-light)]" : "bg-[var(--warning-light)]"
                  )}>
                    {isConnected ? (
                      <CheckCircle className="w-6 h-6 text-[var(--success)]" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-[var(--warning)]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-[var(--text-primary)]">
                      {isConnected ? "Conectada" : "No conectada"}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {isConnected
                        ? "Lista para recibir pagos"
                        : "Configura tus credenciales"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">¿Cómo funciona?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--primary)]">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">
                        Cliente paga
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Usa Checkout PRO de MP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--accent)]">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">
                        Tú recibes tu ganancia
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        El dinero llega a tu cuenta MP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--warning-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--warning)]">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--text-primary)]">
                        Fee mensual
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Recibes factura por el fee de la plataforma
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help link */}
            <div className="text-center">
              <a
                href="https://www.mercadopago.com.ar/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Documentación de MP
              </a>
            </div>
          </div>

          {/* Right Column - Credentials Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Credenciales
                </CardTitle>
                <CardDescription>
                  Estas credenciales se usan para procesar pagos. Son confidenciales.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Public Key
                  </label>
                  <Input
                    type="text"
                    value={publicKey}
                    onChange={(e) => {
                      setPublicKey(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="APP_USR-xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    La encuentras en Tu cuenta → Desarrolladores → Credenciales
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Access Token
                  </label>
                  <PasswordInput
                    value={accessToken}
                    onChange={(e) => {
                      setAccessToken(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="APP_USR-xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Nunca compartas este token. Se usa para crear preferencias de pago.
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar credenciales"}
                  </Button>

                  {isConnected && (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conectado
                    </Badge>
                  )}
                </div>

                {/* Security note */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--accent-light)] mt-4">
                  <Shield className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[var(--text-secondary)]">
                    Tus credenciales se almacenan de forma encriptada. Nunca se muestran completas en la interfaz.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
