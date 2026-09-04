/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useEffect, useState } from "react";
import { Video, Mic, Sparkles } from "lucide-react";

interface CameraTelemetryOverlayProps {
  sessionId: string;
  deviceId: string;
  width: number;
  height: number;
  fps: number;
  micActive: boolean;
  onMetricsUpdate?: (metrics: {
    confidence: number;
    clarity: number;
    speakingPace: number;
    completeness: number;
    communication: number;
  }) => void;
  onPermissionStatus: (status: boolean) => void;
}

export function CameraTelemetryOverlay({
  sessionId,
  deviceId,
  width,
  height,
  fps,
  micActive,
  onMetricsUpdate,
  onPermissionStatus
}: CameraTelemetryOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Initialize webcam stream cleanly
  useEffect(() => {
    async function startCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId }, width: { ideal: width }, height: { ideal: height } }
            : { facingMode: "user", width: { ideal: width }, height: { ideal: height } },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => console.warn("Video play error:", err));
            setHasPermission(true);
            onPermissionStatus(true);
          };
        }
      } catch (err) {
        console.warn("[CAMERA] Webcam stream note:", err);
        setHasPermission(false);
        onPermissionStatus(false);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [deviceId, width, height]);

  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/80 flex items-center justify-center">
      {/* Live Video Feed */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-500 ${hasPermission ? "opacity-100" : "opacity-0 absolute"}`}
        playsInline
        muted
        autoPlay
      />

      {/* Fallback preview when webcam is denied/blocked or loading */}
      {!hasPermission && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-zinc-400 space-y-3 p-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Video className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-200 block">Candidate Camera Preview</span>
            <span className="text-[10px] text-zinc-500 font-mono block">
              {hasPermission === false ? "Camera offline or permission pending" : "Connecting video feed..."}
            </span>
          </div>
        </div>
      )}

      {/* Clean Status Overlay */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <div className="px-2.5 py-1 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-lg text-[10px] font-mono font-medium text-zinc-200 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span>Candidate Feed</span>
        </div>
      </div>

      {/* Mic status indicator */}
      <div className="absolute bottom-3 right-3 z-10">
        <div className={`p-2 rounded-xl backdrop-blur-md border text-xs flex items-center justify-center shadow-md transition-all ${
          micActive 
            ? "bg-indigo-600/80 border-indigo-400 text-white" 
            : "bg-zinc-900/90 border-zinc-700 text-zinc-400"
        }`}>
          <Mic className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
