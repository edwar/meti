"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  LayoutContextProvider,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { ChatPanel } from "@/components/video/chat-panel";
import { VideoOff, Circle, Square } from "lucide-react";

interface VideoCallProps {
  appointmentId: string;
  userRole: "advisor" | "client";
  userName: string;
  userId: string;
}

export function VideoCall({ appointmentId, userRole, userName, userId }: VideoCallProps) {
  const [token, setToken] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

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

  const toggleRecording = useCallback(async () => {
    setRecordingError(null);
    try {
      const method = isRecording ? "DELETE" : "POST";
      const res = await fetch("/api/livekit/recording", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appointmentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cambiar la grabación");
      }
      setIsRecording(!isRecording);
    } catch (err: any) {
      setRecordingError(err.message);
    }
  }, [appointmentId, isRecording]);

  // Detener grabación al salir de la página
  useEffect(() => {
    return () => {
      if (isRecording) {
        fetch("/api/livekit/recording", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ appointmentId }),
        }).catch(() => {});
      }
    };
  }, [appointmentId, isRecording]);

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
    <div className="relative h-[calc(100vh-8rem)]">
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

          {/* Botón de grabación */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {recordingError && (
              <span className="text-xs bg-[var(--error-light)] text-[var(--error)] px-2 py-1 rounded">
                {recordingError}
              </span>
            )}
            <Button
              size="sm"
              variant={isRecording ? "destructive" : "default"}
              onClick={toggleRecording}
              className="shadow-lg"
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-1" /> Detener
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 mr-1 text-red-300" /> Grabar
                </>
              )}
            </Button>
          </div>

          <ChatPanel
            appointmentId={appointmentId}
            currentUserId={userId}
            currentUserRole={userRole}
          />
        </LayoutContextProvider>
      </LiveKitRoom>
    </div>
  );
}
