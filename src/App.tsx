import { useState, useCallback, useEffect, useRef } from "react";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { Navbar } from "./components/ui-custom/Navbar";
import { Monitor } from "./components/ui-custom/Monitor";
import { StatsCards } from "./components/ui-custom/StatsCards";
import { SettingsPanel } from "./components/ui-custom/SettingsPanel";
import { TrendChart } from "./components/ui-custom/TrendChart";
import { EyeCareTips } from "./components/ui-custom/EyeCareTips";
import { AlertModal } from "./components/ui-custom/AlertModal";
import { DailyReport } from "./components/ui-custom/DailyReport";
import { BlinkIcon } from "./components/ui-custom/BlinkIcon";
import { useBlinkStats } from "./hooks/useBlinkStats";
import { useAudioAlert } from "./hooks/useAudioAlert";
import { useUserManagement } from "./hooks/useUserManagement";
import { initI18n, t } from "./i18n";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "./App.css";

// Initialize i18n
initI18n();

function AppContent() {
  // Settings state with persistence
  const [sensitivity, setSensitivity] = useState(() => {
    return parseFloat(localStorage.getItem("blinkguard-sensitivity") || "0.25");
  });
  const [earThreshold, setEarThreshold] = useState(() => {
    return parseFloat(localStorage.getItem("blinkguard-ear-threshold") || "0.25");
  });
  const [debugMode, setDebugMode] = useState(() => {
    return localStorage.getItem("blinkguard-debug-mode") === "true";
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem("blinkguard-sound-enabled");
    return stored === null ? false : stored === "true";
  });
  const [blinkSoundEnabled, setBlinkSoundEnabled] = useState(() => {
    const stored = localStorage.getItem("blinkguard-blink-sound-enabled");
    return stored === null ? false : stored === "true";
  });
  const [recognitionEnabled, setRecognitionEnabledState] = useState(() => {
    return localStorage.getItem("blinkguard-recognition-enabled") === "true";
  });
  const [alertInterval, setAlertInterval] = useState(() => {
    return parseInt(localStorage.getItem("blinkguard-alert-interval") || "20", 10);
  });
  const [blinkVolume, setBlinkVolume] = useState(() => {
    return parseFloat(localStorage.getItem("blinkguard-blink-volume") || "0.85");
  });
  const [layoutMode, setLayoutMode] = useState<"grid" | "stacked">(() => {
    return (localStorage.getItem("blinkguard-layout-mode") as "grid" | "stacked") || "grid";
  });
  const [showReport, setShowReport] = useState(false);
  const [autoExportPDF, setAutoExportPDF] = useState(false);

  // Mesh style state
  const [meshStyle, setMeshStyle] = useState(() => {
    const saved = localStorage.getItem("blinkguard-mesh-style");
    if (saved) return JSON.parse(saved);
    return {
      preset: "neon",
      showLines: false
    };
  });

  // Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    title: "",
    description: "",
    onConfirm: () => { },
  });

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialogConfig({ title, description, onConfirm });
    setConfirmDialogOpen(true);
  };

  // Persistence effects
  useEffect(() => {
    localStorage.setItem("blinkguard-sensitivity", sensitivity.toString());
  }, [sensitivity]);

  useEffect(() => {
    localStorage.setItem("blinkguard-ear-threshold", earThreshold.toString());
  }, [earThreshold]);

  useEffect(() => {
    localStorage.setItem("blinkguard-debug-mode", debugMode.toString());
  }, [debugMode]);

  useEffect(() => {
    localStorage.setItem("blinkguard-sound-enabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("blinkguard-blink-sound-enabled", blinkSoundEnabled.toString());
  }, [blinkSoundEnabled]);

  useEffect(() => {
    localStorage.setItem("blinkguard-recognition-enabled", recognitionEnabled.toString());
  }, [recognitionEnabled]);

  useEffect(() => {
    localStorage.setItem("blinkguard-alert-interval", alertInterval.toString());
  }, [alertInterval]);

  useEffect(() => {
    localStorage.setItem("blinkguard-blink-volume", blinkVolume.toString());
  }, [blinkVolume]);

  useEffect(() => {
    localStorage.setItem("blinkguard-layout-mode", layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem("blinkguard-mesh-style", JSON.stringify(meshStyle));
  }, [meshStyle]);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"blink" | "fatigue">("blink");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio alert
  const {
    setEnabled: setAudioEnabled,
    playAlert,
    playBlinkSound,
  } = useAudioAlert({
    enabled: soundEnabled,
    volume: blinkVolume,
  });

  // User management
  const {
    users,
    currentUser,
    registerUser: registerUserBase,
    deleteUser,
    switchUser,
    recognizeUser,
    setRecognitionEnabled,
  } = useUserManagement();

  // Blink stats
  const handleAlert = useCallback(() => {
    setAlertType("fatigue");
    setShowAlert(true);
    if (soundEnabled) {
      playAlert();
    }
  }, [soundEnabled, playAlert]);

  const {
    stats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    recordBlink,
    resetSession,
  } = useBlinkStats({
    alertInterval,
    onAlert: handleAlert,
  });

  // Handle blink detection
  const handleBlink = useCallback(() => {
    recordBlink();
    // Explicitly check blinkSoundEnabled before playing sound
    if (blinkSoundEnabled && soundEnabled) {
      playBlinkSound();
    }
  }, [recordBlink, blinkSoundEnabled, soundEnabled, playBlinkSound]);

  // Handle face detection
  const handleFaceDetected = useCallback((detected: boolean) => {
    if (detected && recognitionEnabled && monitorRef.current?.faceData?.faceDescriptor) {
      recognizeUser(monitorRef.current.faceData.faceDescriptor);
    }
  }, [recognitionEnabled, recognizeUser]);

  // Use a ref to access monitor data without re-renders
  const monitorRef = useRef<any>(null);

  // Handle monitoring start/stop
  const handleStartMonitoring = useCallback(() => {
    startMonitoring();
  }, [startMonitoring]);

  const handleStopMonitoring = useCallback(() => {
    stopMonitoring();
    resetSession();
  }, [stopMonitoring, resetSession]);

  // Toggle monitoring (for keyboard shortcut)
  const toggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      handleStopMonitoring();
    } else {
      handleStartMonitoring();
    }
  }, [isMonitoring, handleStartMonitoring, handleStopMonitoring]);

  // Sync sound enabled state
  useEffect(() => {
    setAudioEnabled(soundEnabled);
  }, [soundEnabled, setAudioEnabled]);

  // Sync recognition enabled state
  useEffect(() => {
    setRecognitionEnabled(recognitionEnabled);
  }, [recognitionEnabled, setRecognitionEnabled]);

  const handleRecognitionChange = useCallback(
    (enabled: boolean) => {
      setRecognitionEnabledState(enabled);
    },
    []
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to toggle monitoring
      if (
        e.code === "Space" &&
        !e.repeat &&
        !(e.target instanceof HTMLInputElement)
      ) {
        e.preventDefault();
        toggleMonitoring();
      }
      // R to show report
      if (e.code === "KeyR" && e.ctrlKey) {
        e.preventDefault();
        setShowReport(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleMonitoring]);

  // Export data
  const exportData = useCallback(() => {
    const data = {
      totalBlinks: stats.totalBlinks,
      blinkHistory: stats.blinkHistory,
      users: users,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blinkguard-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  }, [stats, users]);

  // Import data
  const importData = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          if (data.totalBlinks !== undefined) {
            localStorage.setItem(
              "blinkguard-total-blinks",
              data.totalBlinks.toString(),
            );
          }
          if (data.users) {
            localStorage.setItem(
              "blinkguard-users",
              JSON.stringify(data.users),
            );
          }

          toast.success("Data imported successfully. Please refresh the page.");
        } catch (err) {
          toast.error("Failed to import data");
        }
      };
      reader.readAsText(file);

      // Reset input
      event.target.value = "";
    },
    [],
  );

  // Clear data
  const clearData = useCallback(() => {
    showConfirm(
      t("settings.clearData") || "Clear Data",
      t("settings.clearDataConfirm") || "Are you sure you want to clear all data? This cannot be undone.",
      () => {
        localStorage.removeItem("blinkguard-total-blinks");
        localStorage.removeItem("blinkguard-users");
        localStorage.removeItem("blinkguard-current-user");
        localStorage.removeItem("blinkguard-blink-history");
        toast.success("All data cleared. Please refresh the page.");
        setTimeout(() => window.location.reload(), 1500);
      }
    );
  }, [showConfirm]);

  // Reset settings
  const handleResetSettings = useCallback(() => {
    showConfirm(
      t("settings.resetSettings") || "Reset Settings",
      t("settings.resetConfirm") || "Are you sure you want to reset all settings to defaults?",
      () => {
        setSensitivity(0.25);
        setEarThreshold(0.25);
        setDebugMode(false);
        setSoundEnabled(true);
        setBlinkSoundEnabled(false);
        setRecognitionEnabledState(false);
        setAlertInterval(20);
        setBlinkVolume(0.85);
        setMeshStyle({
          preset: "neon",
          showLines: false
        });
        setLayoutMode("grid");
        toast.success(t("settings.resetSuccess") || "Settings reset to defaults");
      }
    );
  }, [showConfirm]);

  // Register user
  const handleRegisterUser = useCallback(
    (name: string) => {
      const descriptor = monitorRef.current?.faceData?.faceDescriptor;
      registerUserBase(name, descriptor);
      toast.success(`User "${name}" registered successfully`);
    },
    [registerUserBase],
  );

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <section
            className="text-center space-y-4"
            style={{ animation: "fadeIn 0.6s ease-out" }}
          >
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient"
              style={{ animation: "scaleIn 0.5s ease-out 0.2s both" }}
            >
              {t("app.name")}
            </h1>
            <p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              style={{ animation: "fadeIn 0.5s ease-out 0.4s both" }}
            >
              {t("app.description")}
            </p>
          </section>

          {layoutMode === "stacked" ? (
            <div className="space-y-8">
              {/* Stacked Layout: Monitor at top */}
              <div className="w-full" style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
                <Monitor
                  isMonitoring={isMonitoring}
                  onStart={handleStartMonitoring}
                  onStop={handleStopMonitoring}
                  onBlink={handleBlink}
                  onFaceDetected={handleFaceDetected}
                  showDebugInfo={debugMode}
                  earThreshold={earThreshold}
                  alertInterval={alertInterval}
                  meshStyle={meshStyle}
                  ref={monitorRef}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <StatsCards stats={stats} />
                  <TrendChart stats={stats} />
                </div>
                <div className="lg:col-span-1">
                  <SettingsPanel
                    sensitivity={sensitivity}
                    onSensitivityChange={setSensitivity}
                    earThreshold={earThreshold}
                    onEarThresholdChange={setEarThreshold}
                    debugMode={debugMode}
                    onDebugModeChange={setDebugMode}
                    soundEnabled={soundEnabled}
                    onSoundEnabledChange={setSoundEnabled}
                    blinkSoundEnabled={blinkSoundEnabled}
                    onBlinkSoundEnabledChange={setBlinkSoundEnabled}
                    recognitionEnabled={recognitionEnabled}
                    onRecognitionEnabledChange={handleRecognitionChange}
                    alertInterval={alertInterval}
                    onAlertIntervalChange={setAlertInterval}
                    blinkVolume={blinkVolume}
                    onBlinkVolumeChange={setBlinkVolume}
                    users={users}
                    currentUser={currentUser}
                    onRegisterUser={handleRegisterUser}
                    onDeleteUser={deleteUser}
                    onSwitchUser={switchUser}
                    onExportData={exportData}
                    onImportData={() => fileInputRef.current?.click()}
                    onClearData={clearData}
                    onResetSettings={handleResetSettings}
                    meshStyle={meshStyle}
                    onMeshStyleChange={setMeshStyle}
                    onShowReport={() => setShowReport(true)}
                    onExportPDF={() => {
                      setAutoExportPDF(true);
                      setShowReport(true);
                    }}
                    layoutMode={layoutMode}
                    onLayoutModeChange={setLayoutMode}
                  />
                  <div className="mt-6">
                    <EyeCareTips />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* GRID LAYOUT (Default) */}
              <StatsCards stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monitor - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                  <Monitor
                    isMonitoring={isMonitoring}
                    onStart={handleStartMonitoring}
                    onStop={handleStopMonitoring}
                    onBlink={handleBlink}
                    onFaceDetected={handleFaceDetected}
                    showDebugInfo={debugMode}
                    earThreshold={earThreshold}
                    alertInterval={alertInterval}
                    meshStyle={meshStyle}
                    ref={monitorRef}
                  />
                  <TrendChart stats={stats} />
                </div>

                {/* Settings Panel */}
                <div className="lg:col-span-1 space-y-6">
                  <SettingsPanel
                    sensitivity={sensitivity}
                    onSensitivityChange={setSensitivity}
                    earThreshold={earThreshold}
                    onEarThresholdChange={setEarThreshold}
                    debugMode={debugMode}
                    onDebugModeChange={setDebugMode}
                    soundEnabled={soundEnabled}
                    onSoundEnabledChange={setSoundEnabled}
                    blinkSoundEnabled={blinkSoundEnabled}
                    onBlinkSoundEnabledChange={setBlinkSoundEnabled}
                    recognitionEnabled={recognitionEnabled}
                    onRecognitionEnabledChange={handleRecognitionChange}
                    alertInterval={alertInterval}
                    onAlertIntervalChange={setAlertInterval}
                    blinkVolume={blinkVolume}
                    onBlinkVolumeChange={setBlinkVolume}
                    users={users}
                    currentUser={currentUser}
                    onRegisterUser={handleRegisterUser}
                    onDeleteUser={deleteUser}
                    onSwitchUser={switchUser}
                    onExportData={exportData}
                    onImportData={() => fileInputRef.current?.click()}
                    onClearData={clearData}
                    onResetSettings={handleResetSettings}
                    meshStyle={meshStyle}
                    onMeshStyleChange={setMeshStyle}
                    onShowReport={() => setShowReport(true)}
                    onExportPDF={() => {
                      setAutoExportPDF(true);
                      setShowReport(true);
                    }}
                    layoutMode={layoutMode}
                    onLayoutModeChange={setLayoutMode}
                  />
                  <EyeCareTips />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importData}
        className="hidden"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertType}
        blinkRate={stats.blinkRate}
      />

      {/* Daily Report Modal */}
      {showReport && (
        <DailyReport
          stats={stats}
          onClose={() => {
            setShowReport(false);
            setAutoExportPDF(false);
          }}
          autoExport={autoExportPDF}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialogConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialogConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialogConfig.onConfirm}>
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer
        className="py-12 px-4 border-t border-border/40 bg-background/50 backdrop-blur-md"
        style={{ animation: "fadeIn 0.5s ease-out 0.6s both" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 opacity-80 group hover:opacity-100 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
              <BlinkIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-foreground">{t("app.name")}</span>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-medium">{t("app.footerMadeWith")}</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed italic">
              {t("app.footerShortcuts")}
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-6 font-mono tracking-widest uppercase">
              {t("app.footerCopyright")}
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" defaultColor="indigo">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
