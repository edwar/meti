"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Download, DollarSign, TrendingUp, ArrowDownRight } from "lucide-react";

export default function PaymentsPage() {
  // TODO: Fetch real data from API
  const transactions: any[] = [];
  const totalEarnings = 0;
  const totalFees = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Pagos
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Historial de transacciones y facturación
          </p>
        </div>
        <Button variant="secondary" disabled>
          <Download className="w-4 h-4 mr-2" />
          Descargar reporte
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Ingresos brutos</p>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                  $0
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--success-light)]">
                <TrendingUp className="w-5 h-5 text-[var(--success)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Fee plataforma</p>
                <p className="text-2xl font-heading font-bold text-[var(--error)]">
                  $0
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--error-light)]">
                <ArrowDownRight className="w-5 h-5 text-[var(--error)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Neto a recibir</p>
                <p className="text-2xl font-heading font-bold text-[var(--primary)]">
                  $0
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--primary-light)]">
                <DollarSign className="w-5 h-5 text-[var(--primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={DollarSign}
            title="Sin transacciones"
            description="Cuando los clientes paguen tus asesorías, los pagos aparecerán aquí."
          />
        </CardContent>
      </Card>
    </div>
  );
}
