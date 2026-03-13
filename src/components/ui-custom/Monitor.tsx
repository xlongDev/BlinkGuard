import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Play, Pause, VideoOff, Eye, Loader2 } from "lucide-react";
import { t } from "@/i18n";
import { useFaceDetection } from "@/hooks/useFaceDetection";

interface MonitorProps {
  isMonitoring: boolean;
  onStart: () => void;
  onStop: () => void;
  onBlink: () => void;
  onFaceDetected: (detected: boolean) => void;
  showDebugInfo: boolean;
  earThreshold: number;
  alertInterval: number;
  meshStyle: any;
}

export const Monitor = forwardRef<any, MonitorProps>(({
  isMonitoring,
  onStart,
  onStop,
  onBlink,
  onFaceDetected,
  showDebugInfo,
  earThreshold,
  alertInterval,
  meshStyle,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showBlinkAnimation, setShowBlinkAnimation] = useState(false);
  const [shouldStartCamera, setShouldStartCamera] = useState(false);

  const { isLoading, error, faceData, startCamera, stopCamera } =
    useFaceDetection(videoRef, canvasRef, {
      onBlink: () => {
        onBlink();
        setShowBlinkAnimation(true);
        setTimeout(() => setShowBlinkAnimation(false), 600);
      },
      onFaceDetected,
      earThreshold,
      alertInterval,
      meshStyle,
    });

  // Expose faceData to parent via ref
  useImperativeHandle(ref, () => ({
    faceData,
    startCamera,
    stopCamera
  }), [faceData, startCamera, stopCamera]);

  const handleStart = useCallback(() => {
    onStart();
    setShouldStartCamera(true);
  }, [onStart]);

  const handleStop = useCallback(() => {
    stopCamera();
    onStop();
  }, [stopCamera, onStop]);

  useEffect(() => {
    if (!shouldStartCamera) return;

    let cancelled = false;

    const tryStart = async () => {
      for (let i = 0; i < 20; i++) {
        if (cancelled) return;
        if (videoRef.current) break;
        await new Promise((r) => requestAnimationFrame(r));
      }

      if (cancelled) return;

      try {
        await startCamera();
      } catch (e) {
        // startCamera handles its own errors
      } finally {
        if (!cancelled) setShouldStartCamera(false);
      }
    };

    tryStart();

    return () => {
      cancelled = true;
    };
  }, [shouldStartCamera, startCamera]);

  return (
    <div
      className="glass-card overflow-hidden"
      style={{
        perspective: "1000px",
        animation: "flipIn 1s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <VideoOff className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">{t("monitor.title")}</h2>
            <p className="text-xs text-muted-foreground">
              {isMonitoring
                ? t("monitor.status.monitoring")
                : t("monitor.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isMonitoring && (
            <div
              className="status-badge status-badge-active"
              style={{ animation: "fadeInZoom 0.3s ease-out" }}
            >
              <span className="recording-pulse" />
              <span className="text-xs">{t("monitor.status.monitoring")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {!isMonitoring ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div
              className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 flex items-center justify-center"
              style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}
            >
              <VideoOff className="h-10 w-10 text-indigo-400" />
            </div>
            <p className="text-slate-400 text-sm">{t("monitor.cameraOff")}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              playsInline
              muted
            />
            {showDebugInfo && (
              <canvas
                ref={canvasRef}
                className="face-mesh-canvas"
                style={{ transform: "scaleX(-1)" }}
              />
            )}

            {/* Blink Animation */}
            {showBlinkAnimation && (
              <div
                className="absolute top-4 right-4 pointer-events-none"
                style={{
                  animation: "blinkPop 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
                }}
              >
                <div className="relative">
                  <Eye className="h-12 w-12 text-emerald-400 drop-shadow-lg" />
                  <div
                    className="absolute inset-0 rounded-full bg-emerald-400/30"
                    style={{ animation: "ripple 0.6s ease-out" }}
                  />
                </div>
              </div>
            )}

            {/* Debug Info Overlay - Optimized Transparency */}
            {showDebugInfo && faceData && (
              <div
                className="absolute top-4 left-4 z-20 glass-card bg-transparent border-none p-3 flex flex-col gap-1 pointer-events-none text-xs font-mono"
                style={{ animation: "slideInLeft 0.3s ease-out" }}
              >
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold">EAR:</span>
                  <span className={faceData.averageEyeOpenness < earThreshold ? "text-rose-400" : "text-emerald-400"}>
                    {faceData.averageEyeOpenness.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold">Base:</span>
                  <span className="text-indigo-400">{earThreshold.toFixed(3)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground uppercase tracking-wider font-bold">Face:</span>
                  <span className={faceData.faceDetected ? "text-emerald-400" : "text-rose-400"}>
                    {faceData.faceDetected ? t("monitor.debug.detected") : t("monitor.debug.none")}
                  </span>
                </div>
              </div>
            )}

            {/* No Face Warning */}
            {isMonitoring && faceData && !faceData.faceDetected && (
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
                style={{ animation: "slideUp 0.3s ease-out" }}
              >
                <div className="glass-card px-4 py-2 bg-rose-500/20 border-rose-500/30">
                  <span className="text-sm text-rose-200">
                    {t("monitor.status.noFace")}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-30"
            style={{ animation: "fadeIn 0.2s ease-out" }}
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
            <p className="text-sm text-slate-300">{t("common.loading")}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-40"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <div className="text-center p-6">
              <div className="h-16 w-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <VideoOff className="h-8 w-8 text-rose-400" />
              </div>
              <p className="text-rose-200 text-sm mb-2">{error}</p>
              <p className="text-slate-400 text-xs">
                {t("monitor.permissionError")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex justify-center">
        <button
          onClick={isMonitoring ? handleStop : handleStart}
          disabled={isLoading}
          className={`glass-button flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isMonitoring ? "bg-gradient-to-r from-rose-500 to-rose-600" : ""
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t("common.loading")}</span>
            </>
          ) : isMonitoring ? (
            <>
              <Pause className="h-5 w-5" />
              <span>{t("monitor.stop")}</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>{t("monitor.start")}</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes flipIn {
          from {
            opacity: 0;
            transform: rotateX(90deg);
          }
          to {
            opacity: 1;
            transform: rotateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInZoom {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes blinkPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        @keyframes ripple {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
});
