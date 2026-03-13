# BlinkGuard - Smart Eye Protection 👁️✨

[English](./README.md#english) | [中文](./README.md#中文)

---

## 中文

BlinkGuard 是一款基于 AI 的智能护眼应用。它利用 MediaPipe 技术实时检测用户的眨眼频率和用眼习惯，并在检测到用眼疲劳（如眨眼频率过低）时及时发出提醒，帮助用户养成良好的用眼习惯，预防干眼症和视力下降。

### ✨ 核心功能

-   **智能眨眼检测**：基于 MediaPipe Face Mesh 的高精度 AI 算法，实时捕捉每一次眨眼。
-   **疲劳提醒**：当用户长时间未眨眼或用眼过度时，系统会发出视觉和听觉警告。
-   **个性化设置**：
    -   可调节的敏感度和判定阈值。
    -   多种网格（Mesh）预设：Neon, Cyber, Minimal, Stealth。
    -   支持自定义点位大小、颜色及显示模式。
-   **数据统计与分析**：
    -   实时记录总眨眼次数和当前眨眼频率。
    -   生成趋势图表，分析每日用眼压力。
    -   支持导出报告及 PDF 预览。
-   **用户识别**：支持注册多个用户，并能根据人脸特征自动识别。
-   **护眼小贴士**：内置科学的用眼建议和护眼方法。

### 🛠️ 技术栈

-   **核心框架**：React 19 + Vite
-   **AI 技术**：MediaPipe Face Mesh (姿态 & 面部识别)
-   **UI & 样式**：Tailwind CSS + shadcn/ui
-   **图标库**：Lucide React
-   **国际化**：自定义 i18n 方案 (支持中英文切换)
-   **数据存储**：LocalStorage (本地持久化)

### 🚀 快速启动

1.  **克隆仓库**
    ```bash
    git clone https://github.com/xlongDev/BlinkGuard.git
    cd BlinkGuard
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```

4.  **构建生产版本**
    ```bash
    npm run build
    ```

---

## English

BlinkGuard is an AI-powered smart eye protection application. It utilizes MediaPipe technology to monitor user blinking frequency and eye habits in real-time. It provides timely alerts when digital eye strain is detected (e.g., low blinking rate), helping users develop healthy vision habits and prevent dry eyes or vision decline.

### ✨ Key Features

-   **Smart Blink Detection**: High-precision AI algorithm based on MediaPipe Face Mesh to capture every blink in real-time.
-   **Fatigue Alerts**: Triggers visual and auditory warnings when low blink rate or prolonged eye usage is detected.
-   **Personalized Settings**:
    -   Adjustable detection sensitivity and EAR (Eye Aspect Ratio) thresholds.
    -   Multiple Mesh Style Presets: Neon, Cyber, Minimal, Stealth.
    -   Customizable dot size, colors, and line visibility.
-   **Stats & Analytics**:
    -   Real-time tracking of total blinks and current blink rate.
    -   Trend charts for analyzing daily eye usage patterns.
    -   Data export and PDF report generation.
-   **User Recognition**: Register multiple users with AI face identification.
-   **Eye Care Tips**: Built-in scientific suggestions for eye health.

### 🛠️ Tech Stack

-   **Frontend**: React 19 + Vite
-   **AI Engine**: MediaPipe Face Mesh
-   **Styling**: Tailwind CSS + shadcn/ui
-   **Icons**: Lucide React
-   **i18n**: Custom internationalization (Chinese & English)
-   **Storage**: LocalStorage for persistent data

### 🚀 Getting Started

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/xlongDev/BlinkGuard.git
    cd BlinkGuard
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

### 📄 License

This project is licensed under the [MIT License](LICENSE).
