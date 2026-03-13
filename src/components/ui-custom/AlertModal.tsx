import { t } from "@/i18n";
import { AlertTriangle, Eye, X } from "lucide-react";
import { useEffect, useState } from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "blink" | "fatigue";
  blinkRate?: number;
}

export function AlertModal({
  isOpen,
  onClose,
  type,
  blinkRate = 0,
}: AlertModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let exitTimer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setIsVisible(true);
      setIsExiting(false);

      // Auto-dismiss after 4 seconds
      timer = setTimeout(() => {
        handleClose();
      }, 4000);
    } else if (isVisible) {
      setIsExiting(true);
      exitTimer = setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 500);
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, [isOpen, isVisible]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 right-0 top-4 z-[9999] flex justify-center pointer-events-none">
      <div
        className={`glass-card max-w-xl w-full mx-4 pointer-events-auto flex items-center gap-4 px-6 py-4 transition-all duration-500 ease-in-out shadow-2xl bg-background/95 dark:bg-background/95 ${isExiting
          ? "opacity-0 -translate-y-[100px] blur-md scale-95"
          : "opacity-100 translate-y-0"
          }`}
        style={{
          animation: isExiting ? "none" : "slideDownModal 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
          backdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        {type === "blink" ? (
          <>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-foreground">{t("alerts.blinkNow")}</div>
              <div className="text-sm text-muted-foreground">
                {t("alerts.reminder")}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-lg font-bold text-rose-500 dark:text-rose-400">
                {t("alerts.fatigueWarning")}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("alerts.lowBlinkRate")}
              </div>
              <div className="text-sm font-bold mt-1 text-foreground">
                {t("alerts.currentRate", { rate: blinkRate.toFixed(1) })}
              </div>
            </div>
          </>
        )}
        <button
          onClick={handleClose}
          className="p-3 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all active:scale-90"
          aria-label="Close alert"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <style>{`
        @keyframes slideDownModal {
          from { opacity: 0; transform: translateY(-100px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
