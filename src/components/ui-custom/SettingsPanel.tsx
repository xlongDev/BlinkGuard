import { useState } from "react";
import { t } from "@/i18n";
import {
  Settings,
  Sliders,
  Eye,
  Volume2,
  UserPlus,
  Bug,
  Check,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  BarChart3,
  Clock,
  Users,
  ChevronDown,
} from "lucide-react";
import { BlinkIcon } from "./BlinkIcon";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { User } from "@/hooks/useUserManagement";

interface SettingsPanelProps {
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
  earThreshold: number;
  onEarThresholdChange: (value: number) => void;
  debugMode: boolean;
  onDebugModeChange: (enabled: boolean) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
  blinkSoundEnabled: boolean;
  onBlinkSoundEnabledChange: (enabled: boolean) => void;
  recognitionEnabled: boolean;
  onRecognitionEnabledChange: (enabled: boolean) => void;
  alertInterval: number;
  onAlertIntervalChange: (value: number) => void;
  blinkVolume: number;
  onBlinkVolumeChange: (value: number) => void;
  users: User[];
  currentUser: User | null;
  onRegisterUser: (name: string) => void;
  onDeleteUser: (userId: string) => void;
  onSwitchUser: (userId: string) => void;
  onExportData: () => void;
  onImportData: () => void;
  onClearData: () => void;
  onShowReport: () => void;
  onExportPDF: () => void;
  onResetSettings: () => void;
  meshStyle: {
    preset: string;
    dotSize: number;
    lineWidth: number;
    baseColor: string;
    noseColor: string;
    lipsColor: string;
    eyeColor?: string;
    blinkColor?: string;
    eyeDotSize?: number;
    eyeDotCount?: number;
    mouthDotSize?: number;
    mouthDotCount?: number;
    showLines: boolean;
  };
  onMeshStyleChange: (style: any) => void;
  layoutMode: "grid" | "stacked";
  onLayoutModeChange: (mode: "grid" | "stacked") => void;
}

export function SettingsPanel({
  sensitivity,
  onSensitivityChange,
  earThreshold,
  onEarThresholdChange,
  debugMode,
  onDebugModeChange,
  soundEnabled,
  onSoundEnabledChange,
  blinkSoundEnabled,
  onBlinkSoundEnabledChange,
  recognitionEnabled,
  onRecognitionEnabledChange,
  alertInterval,
  onAlertIntervalChange,
  blinkVolume,
  onBlinkVolumeChange,
  users,
  currentUser,
  onRegisterUser,
  onDeleteUser,
  onSwitchUser,
  onExportData,
  onImportData,
  onClearData,
  onShowReport,
  onExportPDF,
  onResetSettings,
  meshStyle,
  onMeshStyleChange,
}: SettingsPanelProps) {
  const [newUserName, setNewUserName] = useState("");
  const [showRegistered, setShowRegistered] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "detection" | "users" | "data"
  >("detection");

  const [isMeshSettingsOpen, setIsMeshSettingsOpen] = useState(false);

  const presets = {
    neon: {
      preset: "neon", dotSize: 1.0, lineWidth: 1.2,
      baseColor: "rgba(45, 212, 191, 0.45)", noseColor: "rgba(224, 242, 254, 0.6)", lipsColor: "rgba(254, 226, 226, 0.6)",
      eyeColor: "rgba(250, 204, 21, 0.9)", blinkColor: "rgba(255, 69, 0, 0.95)",
      eyeDotSize: 1.5, eyeDotCount: 16, mouthDotSize: 1.3, mouthDotCount: 20, showLines: false
    },
    cyber: {
      preset: "cyber", dotSize: 1.2, lineWidth: 1.8,
      baseColor: "rgba(99, 102, 241, 0.45)", noseColor: "rgba(232, 121, 249, 0.7)", lipsColor: "rgba(244, 63, 94, 0.7)",
      eyeColor: "rgba(232, 121, 249, 0.9)", blinkColor: "rgba(244, 63, 94, 0.95)",
      eyeDotSize: 1.3, eyeDotCount: 16, mouthDotSize: 1.2, mouthDotCount: 20, showLines: true
    },
    minimal: {
      preset: "minimal", dotSize: 0.8, lineWidth: 1.0,
      baseColor: "rgba(255, 255, 255, 0.3)", noseColor: "rgba(255, 255, 255, 0.4)", lipsColor: "rgba(255, 255, 255, 0.4)",
      eyeColor: "rgba(255, 255, 255, 0.6)", blinkColor: "rgba(255, 255, 255, 0.8)",
      eyeDotSize: 1.2, eyeDotCount: 12, mouthDotSize: 1.0, mouthDotCount: 15, showLines: false
    },
    stealth: {
      preset: "stealth", dotSize: 1.0, lineWidth: 1.2,
      baseColor: "rgba(15, 23, 42, 0.3)", noseColor: "rgba(51, 65, 85, 0.4)", lipsColor: "rgba(51, 65, 85, 0.4)",
      eyeColor: "rgba(71, 85, 105, 0.6)", blinkColor: "rgba(100, 116, 139, 0.8)",
      eyeDotSize: 1.5, eyeDotCount: 12, mouthDotSize: 1.2, mouthDotCount: 15, showLines: true
    }
  };

  const handlePresetChange = (presetName: string) => {
    if (presetName === 'custom') return;
    onMeshStyleChange(presets[presetName as keyof typeof presets]);
  };

  const handleRegister = () => {
    if (newUserName.trim()) {
      onRegisterUser(newUserName.trim());
      setNewUserName("");
      setShowRegistered(true);
      setTimeout(() => setShowRegistered(false), 2000);
    }
  };

  const detectionItems = [
    {
      id: "sensitivity",
      icon: Sliders,
      title: t("settings.sensitivity"),
      description: t("settings.sensitivityDesc"),
      type: "slider" as const,
      value: sensitivity,
      onChange: onSensitivityChange,
      min: 0.1,
      max: 0.5,
      step: 0.01,
      displayValue: `${Math.round((1 - (sensitivity - 0.1) / 0.4) * 100)}%`,
    },
    {
      id: "ear",
      icon: Eye,
      title: t("settings.earBaseline"),
      description: t("settings.earDesc"),
      type: "slider" as const,
      value: earThreshold,
      onChange: onEarThresholdChange,
      min: 0.15,
      max: 0.35,
      step: 0.01,
      displayValue: earThreshold.toFixed(2),
    },
    {
      id: "alertInterval",
      icon: Clock,
      title: t("settings.alertInterval"),
      description: t("settings.alertIntervalDesc"),
      type: "slider" as const,
      value: alertInterval,
      onChange: onAlertIntervalChange,
      min: 5,
      max: 60,
      step: 5,
      displayValue: `${alertInterval}s`,
    },
    {
      id: "debug",
      icon: Bug,
      title: t("settings.debugMode"),
      description: t("settings.debugDesc"),
      type: "switch" as const,
      value: debugMode,
      onChange: onDebugModeChange,
    },
    {
      id: "sound",
      icon: Volume2,
      title: t("settings.soundAlert"),
      description: t("settings.soundDesc"),
      type: "switch" as const,
      value: soundEnabled,
      onChange: onSoundEnabledChange,
    },
    {
      id: "blinkSound",
      icon: Volume2,
      title: t("settings.blinkSound"),
      description: t("settings.blinkSoundDesc"),
      type: "switch" as const,
      value: blinkSoundEnabled,
      onChange: onBlinkSoundEnabledChange,
    },
    {
      id: "blinkVolume",
      icon: Volume2,
      title: t("settings.blinkVolume"),
      description: t("settings.blinkVolumeDesc"),
      type: "slider" as const,
      value: blinkVolume,
      onChange: onBlinkVolumeChange,
      min: 0,
      max: 1,
      step: 0.05,
      displayValue: `${Math.round(blinkVolume * 100)}%`,
    },
    {
      id: "recognition",
      icon: UserPlus,
      title: t("settings.userRecognition"),
      description: t("settings.recognitionDesc"),
      type: "switch" as const,
      value: recognitionEnabled,
      onChange: onRecognitionEnabledChange,
    },
  ];

  return (
    <div
      className="glass-card"
      style={{
        animation: "slideInRight 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.2s both",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">{t("settings.title")}</h2>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-border/50">
        {[
          {
            id: "detection",
            label: t("settings.tab.detection"),
            icon: Sliders,
          },
          { id: "users", label: t("settings.tab.users"), icon: Users },
          { id: "data", label: t("settings.tab.data"), icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeSection === tab.id
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Detection Settings */}
        {activeSection === "detection" && (
          <div className="space-y-6">
            {detectionItems.map((item, index) => (
              <div
                key={item.id}
                className="space-y-2"
                style={{
                  animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-sm">{item.title}</span>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {item.type === "switch" ? (
                    <Switch
                      checked={item.value as boolean}
                      onCheckedChange={
                        item.onChange as (checked: boolean) => void
                      }
                    />
                  ) : (
                    <span className="text-sm font-medium text-primary">
                      {item.displayValue}
                    </span>
                  )}
                </div>

                {item.type === "slider" && (
                  <div className="px-2">
                    <Slider
                      value={[item.value as number]}
                      onValueChange={(value) =>
                        (item.onChange as (v: number) => void)(value[0])
                      }
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Mesh Style Customization (Only for debug item and when on) */}
                {item.id === "debug" && debugMode && (
                  <div
                    className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4"
                    style={{ animation: "fadeIn 0.4s ease-out" }}
                  >
                    {/* Collapsible Header */}
                    <div
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => setIsMeshSettingsOpen(!isMeshSettingsOpen)}
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <Sliders className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t("settings.meshStyle")}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isMeshSettingsOpen ? 'rotate-180' : ''}`} />
                    </div>

                    <div className={`space-y-4 transition-all duration-300 ease-in-out overflow-hidden ${isMeshSettingsOpen ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                      {/* Preset Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("settings.meshPreset")}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.keys(presets).map((p) => (
                            <button
                              key={p}
                              onClick={() => handlePresetChange(p)}
                              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${meshStyle.preset === p
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background/50 border-border hover:border-primary/50"
                                }`}
                            >
                              {t(`settings.presets.${p}`)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mesh Dot Size */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.meshDotSize") || "Mesh Dot Size"}</label>
                          <span className="text-[10px] font-mono opacity-50">{(meshStyle.dotSize || 1.1).toFixed(1)}</span>
                        </div>
                        <Slider
                          value={[meshStyle.dotSize || 1.1]}
                          min={0.5}
                          max={3}
                          step={0.1}
                          onValueChange={([v]) => onMeshStyleChange({ ...meshStyle, dotSize: v, preset: 'custom' })}
                        />
                      </div>

                      {/* Eye Dot Size & Count */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.eyeDotSize") || "Eye Dot Size"}</label>
                            <span className="text-[10px] font-mono opacity-50">{(meshStyle.eyeDotSize || 2.0).toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[meshStyle.eyeDotSize || 2.0]}
                            min={0.5}
                            max={5}
                            step={0.1}
                            onValueChange={([v]) => onMeshStyleChange({ ...meshStyle, eyeDotSize: v, preset: 'custom' })}
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.eyeDotCount") || "Eye Dot Count"}</label>
                            <span className="text-[10px] font-mono opacity-50">{meshStyle.eyeDotCount || 16}</span>
                          </div>
                          <Slider
                            value={[meshStyle.eyeDotCount || 16]}
                            min={4}
                            max={16}
                            step={1}
                            onValueChange={([v]) => onMeshStyleChange({ ...meshStyle, eyeDotCount: v, preset: 'custom' })}
                          />
                        </div>
                      </div>

                      {/* Mouth Dot Size & Count */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.mouthDotSize") || "Mouth Dot Size"}</label>
                            <span className="text-[10px] font-mono opacity-50">{(meshStyle.mouthDotSize || 1.3).toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[meshStyle.mouthDotSize || 1.3]}
                            min={0.5}
                            max={5}
                            step={0.1}
                            onValueChange={([v]) => onMeshStyleChange({ ...meshStyle, mouthDotSize: v, preset: 'custom' })}
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.mouthDotCount") || "Mouth Dot Count"}</label>
                            <span className="text-[10px] font-mono opacity-50">{meshStyle.mouthDotCount || 20}</span>
                          </div>
                          <Slider
                            value={[meshStyle.mouthDotCount || 20]}
                            min={5}
                            max={40}
                            step={1}
                            onValueChange={([v]) => onMeshStyleChange({ ...meshStyle, mouthDotCount: v, preset: 'custom' })}
                          />
                        </div>
                      </div>

                      {/* Color Customization */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.meshEyeColor")}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {["rgba(250, 204, 21, 0.9)", "rgba(45, 212, 191, 0.9)", "rgba(99, 102, 241, 0.9)", "rgba(244, 63, 94, 0.9)", "rgba(255, 255, 255, 0.9)"].map(color => (
                              <button
                                key={color}
                                className={`h-5 w-5 rounded-full border border-white/10 transition-transform hover:scale-110 ${meshStyle.eyeColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => onMeshStyleChange({ ...meshStyle, eyeColor: color, preset: 'custom' })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.meshBlinkColor")}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {["rgba(255, 69, 0, 0.95)", "rgba(34, 197, 94, 0.95)", "rgba(168, 85, 247, 0.95)", "rgba(255, 255, 255, 0.95)", "rgba(239, 68, 68, 0.95)"].map(color => (
                              <button
                                key={color}
                                className={`h-5 w-5 rounded-full border border-white/10 transition-transform hover:scale-110 ${meshStyle.blinkColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => onMeshStyleChange({ ...meshStyle, blinkColor: color, preset: 'custom' })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.meshNoseColor") || "Nose Color"}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {["rgba(224, 242, 254, 0.6)", "rgba(99, 102, 241, 0.8)", "rgba(232, 121, 249, 0.7)", "rgba(255, 255, 255, 0.5)", "rgba(51, 65, 85, 0.4)"].map(color => (
                              <button
                                key={color}
                                className={`h-5 w-5 rounded-full border border-white/10 transition-transform hover:scale-110 ${meshStyle.noseColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => onMeshStyleChange({ ...meshStyle, noseColor: color, preset: 'custom' })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.meshLipsColor") || "Lips Color"}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {["rgba(254, 226, 226, 0.6)", "rgba(244, 63, 94, 0.85)", "rgba(244, 63, 94, 0.7)", "rgba(255, 255, 255, 0.5)", "rgba(51, 65, 85, 0.4)"].map(color => (
                              <button
                                key={color}
                                className={`h-5 w-5 rounded-full border border-white/10 transition-transform hover:scale-110 ${meshStyle.lipsColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => onMeshStyleChange({ ...meshStyle, lipsColor: color, preset: 'custom' })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t("settings.meshGridColor") || "Grid Color"}</label>
                        <div className="flex flex-wrap gap-1.5">
                          {["rgba(45, 212, 191, 0.45)", "rgba(99, 102, 241, 0.5)", "rgba(255, 255, 255, 0.3)", "rgba(15, 23, 42, 0.3)", "rgba(34, 197, 94, 0.45)"].map(color => (
                            <button
                              key={color}
                              className={`h-5 w-5 rounded-full border border-white/10 transition-transform hover:scale-110 ${meshStyle.baseColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => onMeshStyleChange({ ...meshStyle, baseColor: color, preset: 'custom' })}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Show Lines Toggle */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-medium text-muted-foreground">{t("settings.showMeshLines")}</span>
                        <Switch
                          checked={meshStyle.showLines}
                          onCheckedChange={(checked) => onMeshStyleChange({ ...meshStyle, showLines: checked, preset: 'custom' })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

          </div>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <div className="space-y-4">
            {/* Register New User */}
            <div style={{ animation: "fadeIn 0.4s ease-out" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-sm">
                  {t("settings.registerUser")}
                </span>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder={t("settings.enterName")}
                  className="glass-input flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
                <Button
                  onClick={handleRegister}
                  disabled={!newUserName.trim() || showRegistered}
                  className="glass-button px-4"
                >
                  {showRegistered ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    t("settings.register")
                  )}
                </Button>
              </div>
            </div>

            {/* Registered Users */}
            {users.length > 0 && (
              <div
                className="space-y-2"
                style={{ animation: "fadeIn 0.4s ease-out 0.1s both" }}
              >
                <span className="text-sm text-muted-foreground">
                  {t("settings.registeredUsers")}
                </span>
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${currentUser?.id === user.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/50 hover:bg-secondary"
                        }`}
                      style={{
                        animation: `slideInRight 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-sm">
                            {user.name}
                          </span>
                          {currentUser?.id === user.id && (
                            <span className="ml-2 text-xs text-primary">
                              ({t("settings.active")})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => onSwitchUser(user.id)}
                            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title={t("settings.switchUserTitle")}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                          title={t("settings.deleteUserTitle")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Management Section */}
        {activeSection === "data" && (
          <div className="space-y-4">
            {/* Daily Report Button */}
            <button
              onClick={onShowReport}
              className="w-full glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors"
              style={{ animation: "fadeIn 0.4s ease-out" }}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <BlinkIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <span className="font-medium text-sm block">
                  {t("report.title")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("settings.viewReportDesc")}
                </span>
              </div>
            </button>

            {/* Export/Import */}
            <div
              className="space-y-2"
              style={{ animation: "fadeIn 0.4s ease-out 0.1s both" }}
            >
              <span className="text-sm text-muted-foreground">
                {t("settings.dataManagement")}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onExportData}
                  className="glass-card p-3 flex flex-col items-center gap-2 hover:bg-primary/5 transition-colors"
                >
                  <Download className="h-5 w-5 text-primary" />
                  <span className="text-sm">{t("settings.exportData")}</span>
                </button>
                <button
                  onClick={onImportData}
                  className="glass-card p-3 flex flex-col items-center gap-2 hover:bg-primary/5 transition-colors"
                >
                  <Upload className="h-5 w-5 text-primary" />
                  <span className="text-sm">{t("settings.importData")}</span>
                </button>
              </div>

              <button
                onClick={onExportPDF}
                className="w-full glass-card p-3 mt-2 flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
              >
                <Download className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t("report.exportPDF")}</span>
              </button>
            </div>

            {/* Clear & Reset Data */}
            <div className="space-y-2 pt-2">
              <button
                onClick={onResetSettings}
                className="w-full glass-card p-3 flex items-center gap-3 hover:bg-primary/5 transition-colors border-primary/20"
                style={{ animation: "fadeIn 0.4s ease-out 0.2s both" }}
              >
                <Sliders className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <span className="text-sm font-medium block">{t("settings.resetSettings")}</span>
                  <span className="text-[10px] text-muted-foreground">{t("settings.resetSettingsDesc")}</span>
                </div>
              </button>

              <button
                onClick={onClearData}
                className="w-full glass-card p-3 flex items-center gap-3 hover:bg-rose-500/10 transition-colors border-rose-500/20"
                style={{ animation: "fadeIn 0.4s ease-out 0.3s both" }}
              >
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <span className="text-sm text-rose-500">
                  {t("settings.clearData")}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
