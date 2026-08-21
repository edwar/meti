"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDialog } from "@/hooks/use-dialog";
import {
  Plus,
  Calendar,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  User,
  Video,
  Settings,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  getHours,
  getMinutes,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";

interface BlockedTime {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
}

interface Appointment {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: string;
  client: { name: string; email: string };
  service: { name: string; durationMin: number };
}

interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
  gapMinutes: number;
}

type ViewMode = "month" | "week" | "day" | "agenda";

const defaultSchedule: DaySchedule[] = [
  { dayOfWeek: 1, dayName: "Lunes", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 2, dayName: "Martes", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 3, dayName: "Miércoles", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 4, dayName: "Jueves", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 5, dayName: "Viernes", isActive: false, startTime: "09:00", endTime: "17:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 6, dayName: "Sábado", isActive: false, startTime: "09:00", endTime: "13:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
  { dayOfWeek: 0, dayName: "Domingo", isActive: false, startTime: "09:00", endTime: "13:00", lunchStart: "", lunchEnd: "", gapMinutes: 15 },
];

export default function SchedulePage() {
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState<"schedule" | "calendar">("calendar");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Schedule state
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule);
  const [hasScheduleChanges, setHasScheduleChanges] = useState(false);

  // Calendar state
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockStartDate, setBlockStartDate] = useState("");
  const [blockEndDate, setBlockEndDate] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "calendar") {
      fetchAppointments();
    }
  }, [activeTab, currentDate, viewMode]);

  const loadData = async () => {
    try {
      const [scheduleRes, blockedRes] = await Promise.all([
        fetch("/api/advisor/schedule", { credentials: "include" }),
        fetch("/api/advisor/blocked-times", { credentials: "include" }),
      ]);

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        if (scheduleData.schedules?.length > 0) {
          setSchedule(
            defaultSchedule.map((day) => {
              const dbDay = scheduleData.schedules.find((s: any) => s.dayOfWeek === day.dayOfWeek);
              if (dbDay) {
                return {
                  ...day,
                  isActive: dbDay.isActive,
                  startTime: dbDay.startTime,
                  endTime: dbDay.endTime,
                  lunchStart: dbDay.lunchStart || "",
                  lunchEnd: dbDay.lunchEnd || "",
                  gapMinutes: dbDay.gapMinutes,
                };
              }
              return day;
            })
          );
        }
      }

      if (blockedRes.ok) {
        const blockedData = await blockedRes.json();
        setBlockedTimes(blockedData.blockedTimes || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      let startDate: Date;
      let endDate: Date;

      if (viewMode === "month") {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else if (viewMode === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
      } else if (viewMode === "agenda") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = addWeeks(startDate, 2);
      } else {
        startDate = startOfDay(currentDate);
        endDate = new Date(currentDate.setHours(23, 59, 59, 999));
      }

      const res = await fetch(
        `/api/advisor/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Schedule handlers
  const handleToggleDay = (dayOfWeek: number) => {
    setSchedule(
      schedule.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, isActive: !d.isActive } : d
      )
    );
    setHasScheduleChanges(true);
  };

  const handleTimeChange = (dayOfWeek: number, field: keyof DaySchedule, value: string) => {
    setSchedule(
      schedule.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    );
    setHasScheduleChanges(true);
  };

  const handleSaveSchedule = async () => {
    try {
      const res = await fetch("/api/advisor/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schedules: schedule }),
      });

      if (res.ok) {
        setHasScheduleChanges(false);
        dialog.showAlert("Éxito", "Horarios guardados correctamente", "success");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión", "error");
    }
  };

  // Blocked time handlers
  const handleCreateBlock = async () => {
    if (!blockTitle.trim()) {
      dialog.showAlert("Campo requerido", "El título es requerido", "warning");
      return;
    }

    try {
      const res = await fetch("/api/advisor/blocked-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: blockTitle,
          startDate: new Date(blockStartDate).toISOString(),
          endDate: new Date(blockEndDate).toISOString(),
          isAllDay: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBlockedTimes([...blockedTimes, data.blockedTime]);
        setShowBlockModal(false);
        setBlockTitle("");
        setBlockStartDate("");
        setBlockEndDate("");
        dialog.showAlert("Éxito", "Horario bloqueado", "success");
      }
    } catch (error) {
      dialog.showAlert("Error", "Error de conexión", "error");
    }
  };

  const handleDeleteBlock = async (id: string) => {
    const confirmed = await dialog.showConfirm(
      "Eliminar bloqueo",
      "¿Estás seguro de eliminar este bloqueo?",
      "warning"
    );

    if (confirmed) {
      try {
        await fetch(`/api/advisor/blocked-times?id=${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setBlockedTimes(blockedTimes.filter((bt) => bt.id !== id));
        dialog.showAlert("Éxito", "Bloqueo eliminado", "success");
      } catch (error) {
        dialog.showAlert("Error", "Error al eliminar", "error");
      }
    }
  };

  // Calendar helpers
  const calendarDays = (() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calStart, end: calEnd });
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    } else if (viewMode === "agenda") {
      const agendaStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: agendaStart, end: addWeeks(agendaStart, 2) });
    } else {
      return [currentDate];
    }
  })();

  const getItemsForDay = (date: Date) => {
    const dayBlocked = blockedTimes.filter((bt) => {
      const start = new Date(bt.startDate);
      const end = new Date(bt.endDate);
      return isWithinInterval(date, { start: startOfDay(start), end: startOfDay(end) }) ||
        isSameDay(date, start) || isSameDay(date, end);
    });

    const dayAppointments = appointments.filter((apt) => {
      return isSameDay(new Date(apt.scheduledAt), date);
    });

    return { blocked: dayBlocked, appointments: dayAppointments };
  };

  const dayHours = Array.from({ length: 15 }, (_, i) => i + 7);

  if (isLoading) return <LoadingPage label="Cargando tu agenda" />;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Mi Agenda
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Gestiona tu horario, citas y bloqueos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab("schedule")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "schedule"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Horario semanal
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "calendar"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Calendario
          </button>
        </div>

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleSaveSchedule} disabled={!hasScheduleChanges}>
                <Save className="w-4 h-4 mr-2" />
                Guardar horarios
              </Button>
            </div>

            {schedule.map((day) => (
              <Card key={day.dayOfWeek} className={!day.isActive ? "opacity-60" : ""}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center justify-between md:w-40">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleDay(day.dayOfWeek)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            day.isActive ? "bg-[var(--success)]" : "bg-[var(--border)]"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                              day.isActive ? "left-7" : "left-1"
                            )}
                          />
                        </button>
                        <span className="font-medium text-[var(--text-primary)]">
                          {day.dayName}
                        </span>
                      </div>
                    </div>

                    {day.isActive ? (
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">Inicio</label>
                          <Input type="time" value={day.startTime} onChange={(e) => handleTimeChange(day.dayOfWeek, "startTime", e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">Fin</label>
                          <Input type="time" value={day.endTime} onChange={(e) => handleTimeChange(day.dayOfWeek, "endTime", e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">Almuerzo inicio</label>
                          <Input type="time" value={day.lunchStart} onChange={(e) => handleTimeChange(day.dayOfWeek, "lunchStart", e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-muted)] mb-1">Almuerzo fin</label>
                          <Input type="time" value={day.lunchEnd} onChange={(e) => handleTimeChange(day.dayOfWeek, "lunchEnd", e.target.value)} className="h-9 text-sm" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 text-sm text-[var(--text-muted)] italic">No disponible</div>
                    )}
                  </div>

                  {day.isActive && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">Brecha:</span>
                        <Input type="number" value={day.gapMinutes} onChange={(e) => handleTimeChange(day.dayOfWeek, "gapMinutes", e.target.value)} className="w-16 h-8 text-sm text-center" min={0} max={60} />
                        <span className="text-sm text-[var(--text-muted)]">min</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-4">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(viewMode === "month" ? subMonths(currentDate, 1) : viewMode === "week" ? subWeeks(currentDate, 1) : subDays(currentDate, 1))}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoy
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(viewMode === "month" ? addMonths(currentDate, 1) : viewMode === "week" ? addWeeks(currentDate, 1) : addDays(currentDate, 1))}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <h2 className="text-lg font-heading font-semibold ml-2">
                  {viewMode === "month" && format(currentDate, "MMMM yyyy", { locale: es })}
                  {viewMode === "week" && `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "d 'de' MMM")} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d 'de' MMM, yyyy", { locale: es })}`}
                  {viewMode === "day" && format(currentDate, "d 'de' MMMM, yyyy", { locale: es })}
                  {viewMode === "agenda" && `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "d MMM")} - ${format(addWeeks(startOfWeek(currentDate, { weekStartsOn: 0 }), 2), "d MMM, yyyy", { locale: es })}`}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-[var(--border)]">
                  {(["month", "week", "day", "agenda"] as ViewMode[]).map((mode) => (
                    <Button key={mode} variant={viewMode === mode ? "default" : "ghost"} size="sm" onClick={() => setViewMode(mode)} className={cn("rounded-none", mode === "month" && "rounded-l-lg", mode === "agenda" && "rounded-r-lg", viewMode === mode && "bg-[var(--secondary)] text-white")}>
                      {mode === "month" ? "Mes" : mode === "week" ? "Semana" : mode === "day" ? "Día" : "Agenda"}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => setShowBlockModal(true)} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
                  <Plus className="w-4 h-4 mr-1" />
                  Bloquear
                </Button>
              </div>
            </div>

            {/* Month View */}
            {viewMode === "month" && (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-7 border-b border-[var(--border)]">
                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-[var(--text-muted)] py-3 border-r last:border-r-0 border-[var(--border)]">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const { blocked, appointments: apts } = getItemsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isCurrentDay = isToday(day);

                      return (
                        <div key={idx} onClick={() => { setCurrentDate(day); setViewMode("day"); }} className={cn("min-h-[100px] p-2 border-r border-b border-[var(--border)] last:border-r-0 cursor-pointer hover:bg-[var(--background)] transition-colors", !isCurrentMonth && "opacity-40", isCurrentDay && "bg-[var(--primary-light)]")}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-sm font-medium", isCurrentDay && "bg-[var(--primary)] text-white w-6 h-6 rounded-full flex items-center justify-center")}>
                              {format(day, "d")}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {blocked.slice(0, 1).map((bt) => (
                              <div key={bt.id} className="text-[10px] px-1 py-0.5 rounded bg-[var(--error)] text-white truncate">
                                {bt.title}
                              </div>
                            ))}
                            {apts.slice(0, 2).map((apt) => (
                              <Link key={apt.id} href={`/call/${apt.id}`} className={cn("block text-[10px] px-1 py-0.5 rounded truncate hover:opacity-80 transition-opacity", apt.status === "CONFIRMED" && "bg-[var(--primary)] text-white", apt.status === "PENDING" && "bg-[var(--warning)] text-white", apt.status === "COMPLETED" && "bg-[var(--success)] text-white")}>
                                {format(new Date(apt.scheduledAt), "HH:mm")} {apt.client.name}
                              </Link>
                            ))}
                            {(blocked.length + apts.length) > 3 && (
                              <div className="text-[10px] text-[var(--text-muted)] pl-1">+{(blocked.length + apts.length) - 3} más</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Week View */}
            {viewMode === "week" && (
              <Card className="overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-8 border-b border-[var(--border)]">
                      <div className="w-16" />
                      {calendarDays.map((day, idx) => (
                        <div key={idx} className={cn("text-center py-3 border-r last:border-r-0 border-[var(--border)]", isToday(day) && "bg-[var(--primary-light)]")}>
                          <div className="text-xs text-[var(--text-muted)]">{format(day, "EEE", { locale: es })}</div>
                          <div className={cn("text-lg font-semibold mt-0.5", isToday(day) && "text-[var(--primary)]")}>{format(day, "d")}</div>
                        </div>
                      ))}
                    </div>

                    <div className="relative">
                      {dayHours.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b border-[var(--border)]">
                          <div className="w-16 text-xs text-[var(--text-muted)] py-3 px-2 border-r border-[var(--border)]">
                            {hour.toString().padStart(2, "0")}:00
                          </div>
                          {calendarDays.map((day, dayIdx) => {
                            const { appointments: apts } = getItemsForDay(day);
                            const hourApts = apts.filter((apt) => getHours(new Date(apt.scheduledAt)) === hour);

                            return (
                              <div key={dayIdx} className="relative min-h-[48px] border-r last:border-r-0 border-[var(--border)] p-0.5">
                                {hourApts.map((apt) => {
                                  const aptStart = new Date(apt.scheduledAt);
                                  const topOffset = (getMinutes(aptStart) / 60) * 48;

                                    return (
                                      <Link key={apt.id} href={`/call/${apt.id}`} className={cn("block absolute inset-x-0.5 rounded text-xs px-1.5 py-1 overflow-hidden hover:opacity-80 transition-opacity", apt.status === "CONFIRMED" && "bg-[var(--primary)] text-white", apt.status === "PENDING" && "bg-[var(--warning)] text-white", apt.status === "COMPLETED" && "bg-[var(--success)] text-white")} style={{ top: `${topOffset}px`, height: `${(apt.durationMin / 60) * 48}px` }}>
                                        <div className="font-medium truncate">{apt.client.name}</div>
                                      </Link>
                                    );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Day View */}
            {viewMode === "day" && (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-b border-[var(--border)] p-4">
                    <div className="text-sm text-[var(--text-muted)]">{format(currentDate, "EEEE", { locale: es })}</div>
                    <div className="text-2xl font-bold">{format(currentDate, "d 'de' MMMM", { locale: es })}</div>
                  </div>

                  <div className="divide-y divide-[var(--border)]">
                    {dayHours.map((hour) => {
                      const { appointments: apts } = getItemsForDay(currentDate);
                      const hourApts = apts.filter((apt) => getHours(new Date(apt.scheduledAt)) === hour);

                      return (
                        <div key={hour} className="flex">
                          <div className="w-20 text-sm text-[var(--text-muted)] py-4 px-4 border-r border-[var(--border)]">
                            {hour.toString().padStart(2, "0")}:00
                          </div>
                          <div className="flex-1 min-h-[64px] pl-4 py-2 relative">
                            {hourApts.map((apt) => {
                              const aptStart = new Date(apt.scheduledAt);
                              const topOffset = (getMinutes(aptStart) / 60) * 64;

                              return (
                                <div key={apt.id} className={cn("absolute left-0 right-0 rounded-lg border-l-4 p-3 mx-2", apt.status === "CONFIRMED" && "bg-[var(--primary-light)] border-[var(--primary)]", apt.status === "PENDING" && "bg-[var(--warning-light)] border-[var(--warning)]", apt.status === "COMPLETED" && "bg-[var(--success-light)] border-[var(--success)]")} style={{ top: `${topOffset}px` }}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-[var(--text-primary)]">{apt.client.name}</div>
                                      <div className="text-sm text-[var(--text-muted)]">{apt.service.name} • {format(aptStart, "HH:mm")} - {format(new Date(aptStart.getTime() + apt.durationMin * 60000), "HH:mm")}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={apt.status === "CONFIRMED" ? "default" : apt.status === "PENDING" ? "warning" : "success"}>
                                        {apt.status === "CONFIRMED" ? "Confirmada" : apt.status === "PENDING" ? "Pendiente" : "Completada"}
                                      </Badge>
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
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agenda View */}
            {viewMode === "agenda" && (
              <Card className="overflow-hidden">
                <CardContent className="p-0 divide-y divide-[var(--border)]">
                  {(() => {
                    const hasEvents = calendarDays.some((day) => {
                      const { blocked, appointments: apts } = getItemsForDay(day);
                      return blocked.length > 0 || apts.length > 0;
                    });
                    return !hasEvents ? (
                      <div className="p-8">
                        <EmptyState icon={Calendar} title="Sin eventos" description="No hay citas ni bloqueos en este período." />
                      </div>
                    ) : (
                      calendarDays.map((day) => {
                        const { blocked, appointments: apts } = getItemsForDay(day);
                        if (blocked.length === 0 && apts.length === 0) return null;

                        return (
                          <div key={day.toISOString()}>
                            <div className="px-4 py-2 bg-[var(--background)] border-b border-[var(--border)]">
                              <div className="text-sm font-semibold text-[var(--text-primary)]">{format(day, "d 'de' MMMM", { locale: es }).toUpperCase()}</div>
                              <div className="text-xs text-[var(--text-muted)]">{format(day, "EEEE", { locale: es })}</div>
                            </div>

                            <div className="divide-y divide-[var(--border)]">
                              {blocked.map((bt) => (
                                <div key={bt.id} className="px-4 py-3 bg-[var(--error-light)] border-l-4 border-[var(--error)]">
                                  <div className="font-medium text-[var(--text-primary)]">{bt.title}</div>
                                  <div className="text-sm text-[var(--text-muted)]">{bt.isAllDay ? "Todo el día" : `${format(new Date(bt.startDate), "HH:mm")} - ${format(new Date(bt.endDate), "HH:mm")}`}</div>
                                </div>
                              ))}

                              {apts.map((apt) => (
                                <div key={apt.id} className={cn("px-4 py-3 border-l-4", apt.status === "CONFIRMED" && "bg-[var(--primary-light)] border-[var(--primary)]", apt.status === "PENDING" && "bg-[var(--warning-light)] border-[var(--warning)]", apt.status === "COMPLETED" && "bg-[var(--success-light)] border-[var(--success)]")}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-[var(--text-primary)]">{apt.client.name}</div>
                                      <div className="text-sm text-[var(--text-muted)]">{apt.service.name} • {format(new Date(apt.scheduledAt), "HH:mm")} - {format(new Date(new Date(apt.scheduledAt).getTime() + apt.durationMin * 60000), "HH:mm")}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={apt.status === "CONFIRMED" ? "default" : apt.status === "PENDING" ? "warning" : "success"}>
                                        {apt.status === "CONFIRMED" ? "Confirmada" : apt.status === "PENDING" ? "Pendiente" : "Completada"}
                                      </Badge>
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
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Bloquear horario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Título *</label>
                <Input value={blockTitle} onChange={(e) => setBlockTitle(e.target.value)} placeholder="Ej: Vacaciones, Día personal..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Inicio *</label>
                  <Input type="datetime-local" value={blockStartDate} onChange={(e) => setBlockStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fin *</label>
                  <Input type="datetime-local" value={blockEndDate} onChange={(e) => setBlockEndDate(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => { setShowBlockModal(false); setBlockTitle(""); setBlockStartDate(""); setBlockEndDate(""); }}>Cancelar</Button>
                <Button onClick={handleCreateBlock}>Bloquear</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog state={dialog} />
    </>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
