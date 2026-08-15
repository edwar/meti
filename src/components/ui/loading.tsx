import { cn } from "@/lib/utils";

interface LoadingPageProps {
  fullScreen?: boolean;
  className?: string;
}

export function LoadingPage({ fullScreen = false, className }: LoadingPageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "min-h-screen",
        !fullScreen && "py-12",
        className
      )}
    >
      <div className="loading-spinner" />
      <p className="text-sm text-[var(--text-muted)] animate-pulse">
        Cargando...
      </p>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full skeleton" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 skeleton" />
          <div className="h-3 w-48 skeleton" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-3/4 skeleton" />
      </div>
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
