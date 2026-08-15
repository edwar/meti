"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
  useAdvisorServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/lib/hooks";
import { Plus, Briefcase, Clock, DollarSign, Edit, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export default function ServicesPage() {
  const dialog = useDialog();
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useAdvisorServices();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const services = data?.services || [];
  const isActive = data?.isActive ?? true;

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await dialog.showConfirm(
      "Eliminar servicio",
      `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`,
      "warning"
    );

    if (confirmed) {
      setDeletingId(id);
      deleteService.mutate(id, {
        onSuccess: () => {
          dialog.showAlert("Éxito", "Servicio eliminado correctamente", "success");
        },
        onError: () => {
          dialog.showAlert("Error", "Error al eliminar servicio", "error");
        },
        onSettled: () => {
          setDeletingId(null);
        },
      });
    }
  };

  const handleToggleActive = (service: any) => {
    updateService.mutate(
      { id: service.id, isActive: !service.isActive },
      {
        onSuccess: () => {
          dialog.showAlert(
            "Éxito",
            `Servicio ${service.isActive ? "desactivado" : "activado"} correctamente`,
            "success"
          );
        },
        onError: () => {
          dialog.showAlert("Error", "Error al cambiar estado del servicio", "error");
        },
      }
    );
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Mis Servicios
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Gestiona los servicios que ofreces a tus clientes
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={!isActive}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo servicio
        </Button>
      </div>

      {/* Advisor inactive warning */}
      {!isActive && (
        <Card className="border-[var(--warning)] bg-[var(--warning-light)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0" />
              <p className="text-sm text-[var(--text-primary)]">
                <strong>Su cuenta de asesor está pendiente de aprobación.</strong> No podrás crear servicios ni recibir clientes hasta que un administrador verifique tu perfil y documentos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={Briefcase}
              title={isActive ? "No tienes servicios creados" : "Servicios no disponibles"}
              description={isActive
                ? "Crea tu primer servicio para que los clientes puedan agendar asesorías contigo."
                : "Necesitas ser aprobado por un administrador antes de crear servicios."
              }
              action={isActive ? {
                label: "Crear primer servicio",
                onClick: () => setShowModal(true),
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service: any) => (
            <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-heading font-semibold text-lg text-[var(--text-primary)]">
                        {service.name}
                      </h3>
                      <Badge variant={service.isActive ? "success" : "outline"}>
                        {service.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-sm text-[var(--text-muted)] mb-3">
                        {service.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Clock className="w-4 h-4" />
                        {formatDuration(service.durationMin)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(service.priceCents)} tu ganancia
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(service)}
                    >
                      {service.isActive ? (
                        <Eye className="w-4 h-4 text-[var(--success)]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingService(service);
                        setShowModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(service.id, service.name)}
                      disabled={deletingId === service.id}
                      className="text-[var(--error)] hover:text-[var(--error)]"
                    >
                      {deletingId === service.id ? (
                        <div className="w-4 h-4 border-2 border-[var(--error)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">
                      Precio final para el cliente
                    </span>
                    <span className="font-heading font-bold text-[var(--text-primary)]">
                      {formatCurrency(Math.round(service.priceCents * 1.15))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setShowModal(false);
            setEditingService(null);
          }}
          onSubmit={(data) => {
            if (editingService) {
              updateService.mutate(data, {
                onSuccess: () => {
                  dialog.showAlert("Éxito", "Servicio actualizado correctamente", "success");
                  setShowModal(false);
                  setEditingService(null);
                },
                onError: (err: any) => {
                  dialog.showAlert("Error", err.message || "Error al actualizar el servicio", "error");
                },
              });
            } else {
              createService.mutate(data, {
                onSuccess: () => {
                  dialog.showAlert("Éxito", "Servicio creado correctamente", "success");
                  setShowModal(false);
                  setEditingService(null);
                },
                onError: (err: any) => {
                  dialog.showAlert("Error", err.message || "Error al crear el servicio", "error");
                },
              });
            }
          }}
          isLoading={createService.isPending || updateService.isPending}
        />
      )}
      <AlertDialog state={dialog} />
    </div>
  );
}

function ServiceModal({
  service,
  onClose,
  onSubmit,
  isLoading,
}: {
  service: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(service?.name || "");
  const [description, setDescription] = useState(service?.description || "");
  const [duration, setDuration] = useState(service?.durationMin || 60);
  const [price, setPrice] = useState(service ? service.priceCents / 100 : 50);
  const [rescheduleHours, setRescheduleHours] = useState(service?.rescheduleHoursMin || 24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      durationMin: duration,
      priceCents: price * 100,
      rescheduleHoursMin: rescheduleHours,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <h2 className="font-heading text-xl font-bold mb-4">
            {service ? "Editar servicio" : "Nuevo servicio"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Nombre del servicio *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Consulta General"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Descripción
              </label>
              <textarea
                className="w-full h-20 px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe qué incluye este servicio..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Duración (minutos) *
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={15}
                  max={480}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  Tu ganancia ($) *
                </label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={100}
                  required
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--background)] text-sm">
              <span className="text-[var(--text-muted)]">Precio final cliente: </span>
              <span className="font-bold text-[var(--primary)]">
                {formatCurrency(Math.round(price * 100 * 1.15))}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Reagenda mínima (horas antes)
              </label>
              <Input
                type="number"
                value={rescheduleHours}
                onChange={(e) => setRescheduleHours(Number(e.target.value))}
                min={0}
                max={168}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : service ? "Guardar cambios" : "Crear servicio"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
