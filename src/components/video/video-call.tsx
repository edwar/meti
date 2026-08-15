"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LiveKitRoom,
  VideoConference,
  Chat,
  ControlBar,
  LayoutContextProvider,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import {
  Video,
  VideoOff,
} from "lucide-react";

interface VideoCallProps {
  appointmentId: string;
  userRole: "advisor" | "client";
  userName: string;
}

export function VideoCall({ appointmentId, userRole, userName }: VideoCallProps) {
  const [token, setToken] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ appointmentId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to get token");
        }

        const data = await res.json();
        setToken(data.token);
        setRoomUrl(data.url);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getToken();
  }, [appointmentId]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--error-light)] flex items-center justify-center mx-auto mb-4">
            <VideoOff className="w-8 h-8 text-[var(--error)]" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">
            Error al conectar
          </h2>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </CardContent>
      </Card>
    );
  }

  if (!token || !roomUrl) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <LiveKitRoom
        token={token}
        serverUrl={roomUrl}
        connect={true}
        video={true}
        audio={true}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <LayoutContextProvider>
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
              <VideoConference />
            </div>
            <RoomAudioRenderer />
          </div>
        </LayoutContextProvider>
      </LiveKitRoom>
    </div>
  );
}
