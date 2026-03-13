// Simple i18n implementation without external dependencies

export type Language = "zh" | "en";

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  zh: {
    app: {
      name: "BlinkGuard",
      subtitle: "眨眼提醒助手",
      description: "数字时代的正念护眼。实时监测眨眼频率，呵护您的眼部健康。",
      footerMadeWith: "由 xlongDev 制作",
      footerShortcuts: "按 空格 开始/停止监测 • Ctrl+R 打开报告",
      footerCopyright: "© 2026 BlinkGuard. 保留所有权利。",
    },
    nav: {
      github: "GitHub",
    },
    monitor: {
      title: "实时眼部监测",
      subtitle: "请允许摄像头权限以开始监测",
      start: "开始监测",
      stop: "停止监测",
      status: {
        monitoring: "监测中",
        stopped: "未开始",
        noFace: "未检测到人脸",
      },
      cameraOff: "摄像头未启动",
      permissionError: "请检查摄像头权限并重试",
      debug: {
        face: "人脸",
        detected: "已检测",
        none: "无",
      },
    },
    stats: {
      totalBlinks: "眨眼总数",
      sessionBlinks: "本次会话",
      blinkRate: "眨眼频率",
      rateUnit: "次/分钟",
      monitorTime: "监测时长",
      activeTime: "活跃时间",
      eyeStatus: "眼部状态",
      fatigueRisk: "疲劳风险",
      basedOnRate: "基于频率分析",
      normal: "正常",
      low: "偏低",
      high: "偏高",
      unknown: "未知",
      trend: "眨眼频率趋势",
      trendSubtitle: "每30秒间隔的眨眼次数",
      noData: "暂无数据",
      startToSee: "开始监测后将显示趋势图",
    },
    settings: {
      title: "检测设置",
      sensitivity: "眨眼灵敏度",
      sensitivityValue: "灵敏度",
      sensitivityDesc:
        "决定眼睛闭合多少程度才算作一次眨眼。数值越小越灵敏（轻微闭眼即触发），数值越大越迟钝（必须完全闭眼）",
      earBaseline: "EAR 基准线",
      earDesc: "调整睁眼/闭眼的判断阈值。低于此值判定为闭眼状态",
      debugMode: "调试模式",
      debugDesc: "显示人脸关键点网格和调试信息",
      soundAlert: "提示音",
      soundDesc: "长时间不眨眼时播放温和提示音",
      userRecognition: "用户识别",
      recognitionDesc: "自动识别你是谁，不需要手动点击",
      blinkSound: "眨眼提示音",
      blinkSoundDesc: "每次眨眼时播放清脆的提示音",
      blinkVolume: "提示音量",
      blinkVolumeDesc: "调节提示音和眨眼音的大小",
      registerUser: "注册新用户",
      enterName: "输入姓名",
      register: "注册",
      registered: "已注册",
      alertInterval: "提醒间隔",
      alertIntervalDesc: "设置多长时间不眨眼后发出提醒（秒）",
      dataManagement: "数据管理",
      exportData: "导出数据",
      importData: "导入数据",
      clearData: "清空数据",
      resetSettings: "恢复默认设置",
      resetSettingsDesc: "重置所有检测和提示音设置到初始状态",
      resetConfirm: "确定要恢复默认设置吗?人脸识别数据不会被清除。",
      keyboardShortcuts: "键盘快捷键",
      shortcutsDesc: "空格键：开始/停止监测",
      layoutMode: "内容布局",
      layout: {
        grid: "网格布局",
        stacked: "顶部摄像头布局",
      },
      tab: {
        detection: "检测",
        users: "用户",
        data: "数据",
      },
      registeredUsers: "已注册用户",
      active: "当前",
      switchUserTitle: "切换到此用户",
      deleteUserTitle: "删除用户",
      viewReportDesc: "查看每日与每周统计",
      meshStyle: "网格样式设置",
      meshStyleDesc: "自定义面部关键点网格的风格、颜色和粗细",
      meshPreset: "样式预设",
      meshEyeColor: "眼睛颜色",
      meshBlinkColor: "眨眼颜色",
      meshNoseColor: "鼻子颜色",
      meshLipsColor: "嘴唇颜色",
      meshGridColor: "网格颜色",
      meshDotSize: "网格点大小",
      eyeDotSize: "眼睛点大小",
      eyeDotCount: "眼睛点数量",
      mouthDotSize: "嘴巴点大小",
      mouthDotCount: "嘴巴点数量",
      showMeshLines: "显示网格线",
      presets: {
        neon: "默认",
        cyber: "赛博朋克",
        minimal: "极简白",
        aura: "金灿辉煌",
        stealth: "隐身模式",
        custom: "自定义",
      },
    },
    tips: {
      title: "护眼小贴士",
      rule202020: {
        title: "20-20-20 法则",
        desc: "每工作20分钟，眺望20英尺（约6米）外的物体20秒。",
      },
      hydration: {
        title: "保持水分",
        desc: "多喝水有助于维持泪液分泌，防止眼睛干涩。",
      },
      lighting: {
        title: "调整光线",
        desc: "确保环境光线适中，避免屏幕过亮或过暗造成刺眼。",
      },
      rest: {
        title: "适度休息",
        desc: "短暂的休息能有效缓解视疲劳，提高专注力。",
      },
    },
    alerts: {
      blinkNow: "请眨眼! 👀",
      fatigueWarning: "视疲劳警报!",
      lowBlinkRate: "眨眼频率过低!",
      currentRate: "您当前频率为 {rate} 次/分。正常应为 15-20 次。",
      reminder: "请现在有意识地多眨眼。",
      close: "关闭",
    },
    theme: {
      light: "浅色",
      dark: "深色",
      system: "跟随系统",
      mode: "模式",
      color: {
        label: "主题颜色",
        indigo: "靛蓝",
        emerald: "翡翠",
        rose: "玫红",
        amber: "琥珀",
        cyan: "青色",
        violet: "紫罗兰",
        orange: "橙色",
        pink: "粉色",
      },
    },
    report: {
      title: "每日报告",
      today: "今日统计",
      weekly: "本周趋势",
      averageRate: "平均频率",
      totalTime: "总监测时长",
      bestTime: "最佳时段",
      needImprovement: "需要改善",
      healthStatus: "健康状态",
      exportPDF: "导出 PDF 报告",
      healthTip: "健康建议",
      status: {
        excellent: "优秀",
        good: "良好",
        attention: "需要关注",
        noData: "暂无数据",
      },
      pdf: {
        reportTitle: "BlinkGuard 护眼报告",
        signature: "xlongDev 签名",
        certificate: "数字健康认证",
        weeklyTrend: "每周眼部表现",
        adviceTitle: "专业护眼建议",
        footerInfo: "由 BlinkGuard 助手应用生成 • ",
        excellentAdvice: "太棒了!您保持了健康的眨眼频率。请继续保持，呵护眼部水分。",
        goodAdvice: "不错!您的眨眼频率处于良好范围。记得按 20-20-20 法则适时休息。",
        lowAdvice: "警告:您的眨眼频率低于推荐阈值。建议增加休息频率并有意识地多眨眼。",
        highAdvice: "警觉:您的眨眼频率异常偏高。这可能是眼睛过度疲劳或过于集中的信号，建议闭目休息一分钟。",
        noDataAdvice: "我们需要更多数据来分析您的习惯。开始监测以获取个性化建议。",
      },
    },
    common: {
      open: "开启",
      close: "关闭",
      on: "开",
      off: "关",
      save: "保存",
      cancel: "取消",
      confirm: "确认",
      loading: "加载中...",
      success: "成功",
      error: "错误",
    },
  },
  en: {
    app: {
      name: "BlinkGuard",
      subtitle: "Blink Reminder",
      description:
        "Mindful eye care for the digital age. Real-time blink monitoring for your eye health.",
      footerMadeWith: "Made by xlongDev",
      footerShortcuts: "Press Space to start/stop monitoring • Ctrl+R for report",
      footerCopyright: "© 2026 BlinkGuard. All rights reserved.",
    },
    nav: {
      github: "GitHub",
    },
    monitor: {
      title: "Real-time Eye Monitoring",
      subtitle: "Please allow camera permission to start monitoring",
      start: "Start Monitoring",
      stop: "Stop Monitoring",
      status: {
        monitoring: "Monitoring",
        stopped: "Not Started",
        noFace: "No Face Detected",
      },
      cameraOff: "Camera Not Started",
      permissionError: "Please check camera permissions and try again",
      debug: {
        face: "Face",
        detected: "Detected",
        none: "None",
      },
    },
    stats: {
      totalBlinks: "Total Blinks",
      sessionBlinks: "Session",
      blinkRate: "Blink Rate",
      rateUnit: "blinks/min",
      monitorTime: "Monitor Time",
      activeTime: "Active Time",
      eyeStatus: "Eye Status",
      fatigueRisk: "Fatigue Risk",
      basedOnRate: "Based on rate",
      normal: "Normal",
      low: "Low",
      high: "High",
      unknown: "Unknown",
      trend: "Blink Rate Trend",
      trendSubtitle: "Blinks per 30s interval",
      noData: "No Data",
      startToSee: "Trend will appear after monitoring starts",
    },
    settings: {
      title: "Detection Settings",
      sensitivity: "Blink Sensitivity",
      sensitivityValue: "Sensitivity",
      sensitivityDesc:
        "Determines how much eye closure counts as a blink. Lower = more sensitive, Higher = less sensitive",
      earBaseline: "EAR Baseline",
      earDesc: "Adjust threshold for eye open/closed detection",
      debugMode: "Debug Mode",
      debugDesc: "Show face landmark mesh and debug info",
      soundAlert: "Sound Alert",
      soundDesc: "Play gentle sound when not blinking for a while",
      userRecognition: "User Recognition",
      recognitionDesc: "Automatically recognize who you are",
      blinkSound: "Blink Sound",
      blinkSoundDesc: "Play a crisp sound on every blink",
      blinkVolume: "Volume",
      blinkVolumeDesc: "Adjust the volume of alerts and blink sounds",
      registerUser: "Register New User",
      enterName: "Enter name",
      register: "Register",
      registered: "Registered",
      alertInterval: "Alert Interval",
      alertIntervalDesc:
        "Set how long without blinking before alerting (seconds)",
      dataManagement: "Data Management",
      exportData: "Export Data",
      importData: "Import Data",
      clearData: "Clear Data",
      resetSettings: "Reset Settings",
      resetSettingsDesc: "Reset all detection and alert settings to defaults",
      resetConfirm: "Are you sure you want to reset all settings to default values?",
      keyboardShortcuts: "Keyboard Shortcuts",
      shortcutsDesc: "Space: Start/Stop monitoring",
      layoutMode: "Layout Mode",
      layout: {
        grid: "Grid View",
        stacked: "Top Camera View",
      },
      tab: {
        detection: "Detection",
        users: "Users",
        data: "Data",
      },
      registeredUsers: "Registered Users",
      active: "Active",
      switchUserTitle: "Switch to this user",
      deleteUserTitle: "Delete user",
      viewReportDesc: "View your daily and weekly statistics",
      meshStyle: "Mesh Style Settings",
      meshStyleDesc: "Customize face landmark grid style, color and thickness",
      meshPreset: "Style Preset",
      meshEyeColor: "Eye Color",
      meshBlinkColor: "Blink Color",
      meshNoseColor: "Nose Color",
      meshLipsColor: "Lips Color",
      meshGridColor: "Grid Color",
      meshDotSize: "Grid Dot Size",
      eyeDotSize: "Eye Dot Size",
      eyeDotCount: "Eye Dot Count",
      mouthDotSize: "Mouth Dot Size",
      mouthDotCount: "Mouth Dot Count",
      showMeshLines: "Show Grid Lines",
      presets: {
        neon: "Default",
        cyber: "Cyberpunk",
        minimal: "Minimalist",
        aura: "Golden Aura",
        stealth: "Stealth Mode",
        custom: "Custom",
      },
    },
    tips: {
      title: "Eye Care Tips",
      rule202020: {
        title: "20-20-20 Rule",
        desc: "Every 20 minutes, look at something 20 feet away for 20 seconds.",
      },
      hydration: {
        title: "Stay Hydrated",
        desc: "Drinking water helps maintain tear production.",
      },
      lighting: {
        title: "Adjust Lighting",
        desc: "Ensure proper lighting to avoid eye strain.",
      },
      rest: {
        title: "Take Breaks",
        desc: "Short breaks effectively relieve eye fatigue.",
      },
    },
    alerts: {
      blinkNow: "Blink Now! 👀",
      fatigueWarning: "Eye Fatigue Alert!",
      lowBlinkRate: "Low Blink Rate!",
      currentRate: "Your rate is {rate}/min. Normal is 15-20.",
      reminder: "Please blink consciously now.",
      close: "Close",
    },
    theme: {
      light: "Light",
      dark: "Dark",
      system: "System",
      mode: "Mode",
      color: {
        label: "Theme Color",
        indigo: "Indigo",
        emerald: "Emerald",
        rose: "Rose",
        amber: "Amber",
        cyan: "Cyan",
        violet: "Violet",
        orange: "Orange",
        pink: "Pink",
      },
    },
    report: {
      title: "Daily Report",
      today: "Today's Stats",
      weekly: "Weekly Trend",
      averageRate: "Average Rate",
      totalTime: "Total Time",
      bestTime: "Best Time",
      needImprovement: "Needs Improvement",
      healthStatus: "Health Status",
      exportPDF: "Export PDF Report",
      healthTip: "Health Tip",
      status: {
        excellent: "Excellent",
        good: "Good",
        attention: "Needs Attention",
        noData: "No Data",
      },
      pdf: {
        reportTitle: "BlinkGuard Eye Care Report",
        signature: "xlongDev Signature",
        certificate: "Digital Health Certificate",
        weeklyTrend: "Weekly Eye Performance",
        adviceTitle: "Professional Eye Care Advice",
        footerInfo: "Generated by BlinkGuard Assistant App • ",
        excellentAdvice: "Outstanding! You are maintaining a healthy blink rate. Keep up the good work for your eye hydration.",
        goodAdvice: "Great! Your blink rate is within a good range. Remember to take breaks using the 20-20-20 rule.",
        lowAdvice: "Warning: Your blink rate is below the recommended threshold. We advise taking more frequent breaks and practicing conscious blinking.",
        highAdvice: "Attention: Your blink rate is exceptionally high. This could indicate over-focus or eye strain. We recommend closing your eyes for a minute to rest.",
        noDataAdvice: "We need more data to analyze your habits. Start monitoring to get personalized eye health tips.",
      },
    },
    common: {
      open: "Open",
      close: "Close",
      on: "On",
      off: "Off",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      loading: "Loading...",
      success: "Success",
      error: "Error",
    },
  },
};

let currentLanguage: Language = "zh";

const getBrowserLanguage = (): Language => {
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("zh") ? "zh" : "en";
};

export const initI18n = () => {
  const saved = localStorage.getItem("blinkguard-language") as Language;
  currentLanguage = saved || getBrowserLanguage();
};

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem("blinkguard-language", lang);
  window.location.reload();
};

export const getLanguage = (): Language => currentLanguage;

export const t = (
  key: string,
  params?: Record<string, string | number>,
): string => {
  const keys = key.split(".");
  let value: any = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === "object") {
      value = value[k];
    } else {
      return key;
    }
  }

  if (typeof value === "string") {
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() ?? match;
      });
    }
    return value;
  }

  return key;
};
