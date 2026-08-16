"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import { useAdvisorProfile, useUpdateProfile } from "@/lib/hooks";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import {
  Save,
  Video,
  Pencil,
  FileText,
  Upload,
  CheckCircle,
  Clock,
} from "lucide-react";
import "lite-youtube-embed/src/lite-yt-embed.css";

export default function ProfilePage() {
  const dialog = useDialog();
  const { data, isLoading } = useAdvisorProfile();
  const updateProfile = useUpdateProfile();

  const [bio, setBio] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documentType, setDocumentType] = useState("CERTIFICATE");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [bookingLeadHours, setBookingLeadHours] = useState(24);

  useEffect(() => {
    if (data?.profile) {
      setBio(data.profile.bio || "");
      setVideoUrl(data.profile.videoUrl || "");
      setBookingLeadHours(data.profile.bookingLeadHours || 0);
      setSelectedCategoryIds((data.profile.categories || []).map((c: any) => c.id));
      fetchDocuments();
      fetchCategories();
    }
  }, [data]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setHasChanges(true);
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/advisor/documents", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const res = await fetch("/api/advisor/documents", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        await fetchDocuments();
        dialog.showAlert("Éxito", "Documento subido correctamente", "success");
      } else {
        const data = await res.json();
        dialog.showAlert("Error", data.error || "Error al subir documento", "error");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    updateProfile.mutate(
      { bio, videoUrl: videoUrl || undefined, categoryIds: selectedCategoryIds, bookingLeadHours },
      {
        onSuccess: () => {
          setHasChanges(false);
          dialog.showAlert("Éxito", "Perfil actualizado correctamente", "success");
        },
        onError: () => {
          dialog.showAlert("Error", "Error al actualizar perfil", "error");
        },
      }
    );
  };

  if (isLoading) return <LoadingPage />;

  const profile = data?.profile;
  const stats = data?.stats;

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">Error al cargar el perfil</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
              Mi Perfil
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Configura tu información pública para atraer clientes
            </p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || updateProfile.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {updateProfile.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Identidad, Bio, Stats y Agendado */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {profile.user.image ? (
                    <img
                      src={profile.user.image}
                      alt={profile.user.name}
                      className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-[var(--primary)]">
                        {profile.user.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">
                        {profile.user.name}
                      </h2>
                      <VerifiedBadge
                        isVerified={profile.isVerified}
                        verificationStatus={profile.verificationStatus}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <RatingStars rating={stats?.rating || 0} showValue size="sm" />
                      <span className="text-sm text-[var(--text-muted)]">
                        {stats?.reviewCount || 0} reseñas
                      </span>
                    </div>
                    {profile.categories && profile.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {profile.categories.map((cat: any) => (
                          <Badge key={cat.id} variant="secondary" className="text-xs">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="w-5 h-5" />
                  Biografía
                </CardTitle>
                <CardDescription>
                  Cuéntale a los clientes sobre tu experiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-40 px-4 py-3 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 resize-none"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Ej: Soy un profesional con X años de experiencia..."
                />
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-[var(--background)]">
                    <div className="text-2xl font-heading font-bold text-[var(--primary)]">
                      {stats?.reviewCount || 0}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Reseñas</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--background)]">
                    <div className="text-2xl font-heading font-bold text-[var(--accent)]">
                      {stats?.rating || 0}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Rating</div>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--background)]">
                    <div className="text-2xl font-heading font-bold text-[var(--success)]">
                      {profile.categories?.length || 0}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">Rubros</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Anticipación mínima */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                Configuración de agendado
              </CardTitle>
              <CardDescription>
                Define con cuánta anticipación mínima los clientes pueden reservar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={168}
                  value={bookingLeadHours}
                  onChange={(e) => {
                    setBookingLeadHours(Math.max(0, Number(e.target.value)));
                    setHasChanges(true);
                  }}
                  className="w-24 text-center"
                />
                <span className="text-sm text-[var(--text-muted)]">horas de anticipación</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-3">
                Ejemplo: si defines 6, los clientes no podrán reservar para las próximas 6 horas.
                Con 0, pueden agendar cualquier horario disponible del día.
              </p>
            </CardContent>
          </Card>



          {/* Right Column - Rubros, Documentos y Video */}
          <div className="space-y-6">
            {/* Rubros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[var(--accent)]" />
                  Rubros de experticia
                </CardTitle>
                <CardDescription>
                  Selecciona las áreas en las que ofreces asesorías
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">Cargando rubros...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategoryIds.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${isSelected
                              ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50"
                            }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedCategoryIds.length === 0 && (
                  <p className="text-xs text-[var(--warning)] mt-3">
                    Selecciona al menos un rubro para que los clientes te encuentren por área.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentos de verificación
                </CardTitle>
                <CardDescription>
                  Sube certificados o licencias para verificar tu experiencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={documentType}
                  onChange={(value) => setDocumentType(value)}
                  options={[
                    { value: "CERTIFICATE", label: "Certificado profesional" },
                    { value: "LICENSE", label: "Licencia profesional" },
                    { value: "DEGREE", label: "Título universitario" },
                    { value: "RESUME", label: "Hoja de vida / CV" },
                    { value: "OTHER", label: "Otro documento" },
                  ]}
                />

                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--primary)] transition-colors">
                  <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-muted)] mb-2">
                    Arrastra un archivo o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    PDF, JPEG o PNG (máx. 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="doc-upload"
                    onChange={handleUploadDocument}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => document.getElementById("doc-upload")?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Subiendo..." : "Seleccionar archivo"}
                  </Button>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Documentos ({documents.length})
                    </p>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)]"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[var(--text-muted)]" />
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            doc.manualStatus === "APPROVED"
                              ? "success"
                              : doc.manualStatus === "REJECTED"
                                ? "destructive"
                                : doc.aiStatus === "COMPLETED"
                                  ? "warning"
                                  : "outline"
                          }
                        >
                          {doc.manualStatus === "APPROVED"
                            ? "Aprobado"
                            : doc.manualStatus === "REJECTED"
                              ? "Rechazado"
                              : doc.aiStatus === "COMPLETED"
                                ? "Pendiente"
                                : "Analizando"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            

            {/* Video */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video de presentación
                </CardTitle>
                <CardDescription>
                  Un video corto aumenta las reservas un 300%
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videoUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden bg-[var(--background)]">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video de presentación"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoUrl("");
                          setHasChanges(true);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:border-[var(--primary)] transition-colors cursor-pointer">
                      <Video className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                      <p className="font-medium text-[var(--text-primary)] mb-1">
                        Sube tu video de presentación
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Pega una URL de YouTube
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        URL del video de YouTube
                      </label>
                      <Input
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          setHasChanges(true);
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog state={dialog} />
    </>
  );
}

function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}
