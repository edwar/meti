"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Send, FileText } from "lucide-react";

export default function InvoicesPage() {
  const [periodFilter, setPeriodFilter] = useState("all");

  // TODO: Fetch real data from API
  const invoices: any[] = [];
  const totalPending = 0;
  const totalSent = 0;
  const totalPaid = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Facturación
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Gestiona las facturas de fees para asesores
          </p>
        </div>
        <Button disabled>
          <Send className="w-4 h-4 mr-2" />
          Enviar facturas pendientes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Pendientes</p>
                <p className="text-2xl font-heading font-bold text-[var(--warning)]">
                  $0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Enviadas</p>
                <p className="text-2xl font-heading font-bold text-[var(--primary)]">
                  $0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Pagadas</p>
                <p className="text-2xl font-heading font-bold text-[var(--success)]">
                  $0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices */}
      <Card>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="Sin facturas"
            description="Las facturas mensuales de fees se generarán cuando haya asesorías completadas."
          />
        </CardContent>
      </Card>
    </div>
  );
}
