/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Camera, RefreshCw, AlertTriangle, CheckCircle2, Shield, Settings2 } from "lucide-react";

interface CameraDiagnosticsProps {
  onDeviceSelect: (deviceId: string) => void;
  onResolutionSelect: (width: number, height: number) => void;
  onFpsChange: (fps: number) => void;
  cameraStatus: boolean | null; // true = granted, false = denied, null = unasked
}

export function CameraDiagnostics({
  onDeviceSelect,
  onResolutionSelect,
  onFpsChange,
  cameraStatus
}: CameraDiagnosticsProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [resolution, setResolution] = useState<string>("720p");
  const [targetFps, setTargetFps] = useState<number>(30);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Load available video input devices
  useEffect(() => {
    async function getCameras() {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devs.filter((d) => d.kind === "videoinput");
        setDevices(videoDevs);
        if (videoDevs.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevs[0].deviceId);
          onDeviceSelect(videoDevs[0].deviceId);
        }
      } catch (err) {
        console.warn("Failed to enumerate media cameras:", err);
      }
    }
    if (cameraStatus === true) {
      getCameras();
    }
  }, [cameraStatus]);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    onDeviceSelect(deviceId);
  };

  const handleResolutionChange = (res: string) => {
    setResolution(res);
    if (res === "1080p") {
      onResolutionSelect(1920, 1080);
    } else if (res === "720p") {
      onResolutionSelect(1280, 720);
    } else {
      onResolutionSelect(640, 480);
    }
  };

  const handleFpsChange = (fps: number) => {
    setTargetFps(fps);
    onFpsChange(fps);
  };

  return (
    <div id="camera-settings-panel" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
              Camera Diagnostics
            </h4>
            <span className="text-[9px] text-zinc-400 font-mono">Frame rate optimization</span>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 cursor-pointer transition-all"
          title="Adjust parameters"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Permissions and general state banner */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          {cameraStatus === true ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : cameraStatus === false ? (
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
          )}
          <span className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
            {cameraStatus === true
              ? "VISION ENGINE ONLINE"
              : cameraStatus === false
              ? "CAMERA BLOCKED"
              : "AWAITING MOCK START"}
          </span>
        </div>
        <span className="text-[9px] bg-indigo-500/15 text-indigo-500 px-2 py-0.5 rounded-lg font-mono font-bold">
          30 FPS TARGET
        </span>
      </div>

      {/* Settings Panel Drawer */}
      {showSettings && (
        <div className="space-y-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-850 animate-slideDown">
          {/* Active Camera Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider">
              Select Camera Device
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 outline-none"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
              {devices.length === 0 && <option value="">Default Front Camera</option>}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Resolution selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => handleResolutionChange(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
              </select>
            </div>

            {/* Target FPS selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider">
                FPS Budget
              </label>
              <select
                value={targetFps}
                onChange={(e) => handleFpsChange(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value={30}>30 FPS Standard</option>
                <option value={24}>24 FPS Cinematic</option>
                <option value={15}>15 FPS Eco Mode</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {cameraStatus === false && (
        <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-2xl flex items-start gap-2">
          <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-red-500 block font-mono">RECOVERY ACTIONS</span>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Please click the lock icon in your browser URL bar, toggle camera access to <strong>Allowed</strong>, and reload this workspace.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
