"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { VideoCall } from "@/components/video/video-call";
import { WaitingRoom } from "@/components/video/waiting-room";
import { LoadingPage } from "@/components/ui/loading";
import { Logo } from "@/components/ui/logo";

export default function CallPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          router.push("/login");
          return;
        }
        setUser(data.user);

        // Si la cita ya está en progreso, entrar directamente a la llamada
        try {
          const res = await fetch(`/api/appointments/${appointmentId}`, { credentials: "include" });
          if (res.ok) {
            const { appointment } = await res.json();
            if (appointment?.status === "IN_PROGRESS") {
              setInCall(true);
            }
          }
        } catch {}
      } catch (error) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router, appointmentId]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  const userRole = (user as any).role === "ADVISOR" ? "advisor" : "client";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="container-meti flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Logo className="h-9 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            {user.image && (
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        </div>
      </header>

      <main className="container-meti py-8">
        {inCall ? (
          <VideoCall
            appointmentId={appointmentId}
            userRole={userRole as "advisor" | "client"}
            userName={user.name}
            userId={user.id}
          />
        ) : (
          <WaitingRoom
            appointmentId={appointmentId}
            userRole={userRole as "advisor" | "client"}
            onJoin={() => setInCall(true)}
          />
        )}
      </main>
    </div>
  );
}
