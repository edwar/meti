"use client";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
          Mis Reseñas
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Califica las asesorías que has recibido
        </p>
      </div>

      {/* Reviews List */}
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon={Star}
            title="Sin reseñas"
            description="Después de completar una asesoría, podrás calificar tu experiencia."
          />
        </CardContent>
      </Card>
    </div>
  );
}
