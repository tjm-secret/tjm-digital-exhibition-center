# 線上展覽網站 (Online Exhibition Website)

基於 Vue 3 + Vite + TypeScript 技術棧的沉浸式線上展覽網站。提供類似實體展覽的瀏覽體驗，使用者可以透過滑動手勢或底部導覽列在不同展覽場景間切換，每個場景包含大型展示圖片、多語言語音導覽和文字介紹。

## 🚀 專案概述

線上展覽網站是一個現代化的數位展覽平台，專為提供沉浸式的藝術品瀏覽體驗而設計。系統採用響應式設計，完美支援桌面、平板和手機裝置，讓觀眾能夠隨時隨地欣賞展覽內容。

### 主要特色

- 🎨 **沉浸式體驗**: 大型展示圖片配合多語言語音導覽
- 📱 **響應式設計**: 完美適配各種螢幕尺寸和裝置
- 🎵 **多語言支援**: 支援中文、英文、日文等多種語言語音導覽
- 👆 **直觀操作**: 支援滑動手勢和點擊導覽
- ⚡ **高效能**: 圖片延遲載入和智慧預載機制
- 🔧 **彈性部署**: 支援靜態檔案、API 和混合載入模式

## 🛠 技術棧

- **前端框架**: Vue 3 with Composition API
- **建置工具**: Vite (快速開發和建置)
- **程式語言**: TypeScript (完整型別安全)
- **樣式框架**: Tailwind CSS (響應式設計)
- **滑動組件**: Swiper.js (專業的觸控滑動支援)
- **音訊處理**: Howler.js (跨瀏覽器音訊播放)
- **圖片最佳化**: Intersection Observer API (延遲載入)
- **測試框架**: Vitest + Vue Test Utils (單元測試和屬性測試)

## 📋 系統需求

- **Node.js**: 20.19.0+ 或 22.12.0+
- **npm**: 8.0+ 或 **yarn**: 1.22+
- **現代瀏覽器**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+

## ⚡ 快速開始

### 1. 安裝依賴

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 2. 啟動開發伺服器

```bash
# 啟動開發環境 (支援熱重載)
npm run dev

# 開發伺服器將在 http://localhost:5173 啟動
```

### 3. 建置生產版本

```bash
# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

### 4. 執行測試

```bash
# 執行所有測試
npm run test:unit

# 執行型別檢查
npm run type-check

# 執行程式碼檢查和格式化
npm run lint
npm run format
```
## 📁 專案結構

```
線上展覽網站/
├── public/                          # 靜態資源
│   ├── assets/
│   │   └── exhibitions/             # 展覽資源目錄
│   │       └── sample/              # 範例展覽
│   │           ├── config.json      # 展覽配置檔案
│   │           ├── images/          # 圖片資源
│   │           │   ├── scene-1.svg
│   │           │   └── scene-2.svg
│   │           └── audio/           # 音訊資源
│   │               ├── scene-1-zh.mp3
│   │               └── scene-2-zh.mp3
│   └── favicon.ico
├── src/                             # 原始碼
│   ├── components/                  # Vue 組件
│   │   └── exhibition/              # 展覽相關組件
│   │       ├── ExhibitionApp.vue    # 主要展覽應用
│   │       ├── SceneComponent.vue   # 場景展示組件
│   │       ├── AudioGuideComponent.vue # 語音導覽組件
│   │       ├── NavigationComponent.vue # 底部導覽列
│   │       ├── LanguageSwitcher.vue # 語言切換器
│   │       ├── ResponsiveLayout.vue # 響應式佈局
│   │       └── TouchOptimizedButton.vue # 觸控優化按鈕
│   ├── composables/                 # Vue Composables
│   │   ├── useExhibition.ts         # 展覽狀態管理
│   │   ├── useAudioGuide.ts         # 語音導覽邏輯
│   │   └── useImageLoader.ts        # 圖片載入邏輯
│   ├── services/                    # 服務層
│   │   ├── ResourceManager.ts       # 資源管理器
│   │   ├── AudioManager.ts          # 音訊管理器
│   │   ├── ImageLoader.ts           # 圖片載入器
│   │   └── SwiperController.ts      # 滑動控制器
│   ├── types/                       # TypeScript 型別定義
│   │   ├── index.ts                 # 核心資料模型
│   │   ├── components.ts            # 組件介面
│   │   └── resources.ts             # 資源載入介面
│   ├── config/                      # 配置檔案
│   │   └── exhibition.ts            # 展覽系統配置
│   ├── assets/                      # 樣式資源
│   │   ├── base.css                 # 基礎樣式
│   │   ├── main.css                 # 主要樣式
│   │   └── swiper-boundary.css      # Swiper 邊界樣式
│   └── main.ts                      # 應用程式入口點
├── dist/                            # 建置輸出目錄
├── node_modules/                    # 依賴套件
├── .kiro/                           # Kiro 規格文件
│   └── specs/
│       └── online-exhibition/
│           ├── requirements.md      # 需求文件
│           ├── design.md           # 設計文件
│           └── tasks.md            # 實作任務
├── package.json                     # 專案配置
├── vite.config.ts                  # Vite 建置配置
├── vitest.config.ts                # 測試配置
├── tailwind.config.js              # Tailwind CSS 配置
├── tsconfig.json                   # TypeScript 配置
└── README.md                       # 專案說明文件
```
## 🗂 靜態資源組織結構

### 展覽資源目錄結構

```
public/assets/exhibitions/
├── exhibition-1/                    # 展覽 ID 作為資料夾名稱
│   ├── config.json                  # 展覽配置檔案 (必需)
│   ├── images/                      # 圖片資源目錄
│   │   ├── scene-1.jpg             # 場景主圖片
│   │   ├── scene-1-thumb.jpg       # 場景縮圖 (可選)
│   │   ├── scene-2.jpg
│   │   └── scene-2-thumb.jpg
│   └── audio/                       # 音訊資源目錄
│       ├── scene-1-zh.mp3          # 中文語音導覽
│       ├── scene-1-en.mp3          # 英文語音導覽
│       ├── scene-1-ja.mp3          # 日文語音導覽
│       ├── scene-2-zh.mp3
│       ├── scene-2-en.mp3
│       └── scene-2-ja.mp3
├── exhibition-2/
│   └── ...
└── sample/                          # 範例展覽 (已提供)
    ├── config.json
    ├── images/
    └── audio/
```

### 檔案命名規範

#### 圖片檔案
- **主圖片**: `scene-{場景編號}.{副檔名}`
- **縮圖**: `scene-{場景編號}-thumb.{副檔名}`
- **支援格式**: JPG, PNG, WebP, SVG
- **建議解析度**: 1920x1080 (主圖片), 300x200 (縮圖)
- **建議檔案大小**: < 2MB (主圖片), < 100KB (縮圖)

#### 音訊檔案
- **命名格式**: `scene-{場景編號}-{語言代碼}.{副檔名}`
- **語言代碼**: zh (中文), en (英文), ja (日文)
- **支援格式**: MP3, OGG, WAV
- **建議品質**: 128kbps MP3 或同等品質
- **建議長度**: 30-120 秒

### config.json 配置檔案格式

```json
{
  "id": "exhibition-id",
  "title": "展覽標題",
  "description": "展覽描述",
  "scenes": [
    {
      "id": "scene-1",
      "title": "場景標題",
      "description": {
        "zh": "中文描述",
        "en": "English description",
        "ja": "日本語の説明"
      },
      "image": {
        "url": "scene-1.jpg",
        "alt": "圖片替代文字",
        "width": 1920,
        "height": 1080,
        "thumbnail": "scene-1-thumb.jpg"
      },
      "audio": {
        "zh": {
          "url": "scene-1-zh.mp3",
          "duration": 30,
          "format": "mp3",
          "size": 480000
        }
      },
      "order": 1,
      "metadata": {
        "artist": "藝術家姓名",
        "year": "創作年份",
        "medium": "創作媒材",
        "dimensions": "作品尺寸"
      }
    }
  ],
  "defaultLanguage": "zh",
  "availableLanguages": ["zh", "en", "ja"],
  "resourceConfig": {
    "mode": "static",
    "staticPath": "/assets/exhibitions/",
    "fallbackStrategy": "none"
  },
  "settings": {
    "autoplay": false,
    "showThumbnails": true,
    "enableKeyboard": true,
    "preloadCount": 2
  }
}
```
## ⚙️ 資源載入模式配置

系統支援三種彈性的資源載入模式，可根據展覽規模和基礎設施需求選擇最適合的部署策略。

### 1. 靜態檔案模式 (Static Mode)

**適用場景**: 小型展覽、CDN 部署、離線展示
**優點**: 部署簡單、載入快速、無需後端支援
**缺點**: 內容更新需要重新部署

```typescript
// 配置範例
const staticConfig = {
  mode: 'static',
  staticPath: '/assets/exhibitions/',
  fallbackStrategy: 'none'
}
```

**部署步驟**:
1. 將展覽資源放置在 `public/assets/exhibitions/` 目錄
2. 建置專案: `npm run build`
3. 將 `dist/` 目錄部署到靜態網站託管服務

### 2. API 模式 (API Mode)

**適用場景**: 動態內容管理、大型展覽、需要即時更新
**優點**: 內容可即時更新、支援動態配置
**缺點**: 需要後端 API 支援

```typescript
// 配置範例
const apiConfig = {
  mode: 'api',
  apiEndpoint: '/api/exhibitions',
  fallbackStrategy: 'static'
}
```

**API 端點規格**:
- `GET /api/exhibitions/{exhibitionId}`: 取得展覽配置
- `GET /api/exhibitions/{exhibitionId}/scenes`: 取得場景列表
- `GET /api/media/{type}/{filename}`: 取得媒體檔案

### 3. 混合模式 (Hybrid Mode)

**適用場景**: 配置動態管理 + CDN 媒體加速
**優點**: 結合 API 靈活性和 CDN 效能
**缺點**: 配置較複雜

```typescript
// 配置範例
const hybridConfig = {
  mode: 'hybrid',
  apiEndpoint: '/api/exhibitions',
  cdnBaseUrl: 'https://cdn.example.com/exhibitions/',
  fallbackStrategy: 'static'
}
```

### 模式比較表

| 特性 | 靜態模式 | API 模式 | 混合模式 |
|------|----------|----------|----------|
| 部署複雜度 | 低 | 中 | 高 |
| 內容更新 | 需重新部署 | 即時更新 | 即時更新 |
| 效能 | 高 | 中 | 高 |
| 後端需求 | 無 | 完整 API | 輕量 API |
| CDN 支援 | 是 | 可選 | 是 |
| 離線支援 | 是 | 否 | 部分 |

## 🔧 本機開發指南

### 開發環境設定

1. **複製專案**
```bash
git clone <repository-url>
cd online-exhibition-website
```

2. **安裝依賴**
```bash
npm install
```

3. **設定環境變數** (可選)
```bash
# 建立 .env.local 檔案
VITE_API_BASE_URL=http://localhost:3000/api
VITE_CDN_BASE_URL=https://your-cdn.com
```

4. **啟動開發伺服器**
```bash
npm run dev
```

### 開發工具推薦

- **IDE**: Visual Studio Code
- **擴充套件**:
  - Vue Language Features (Volar)
  - TypeScript Vue Plugin (Volar)
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

### 熱重載功能

Vite 提供極快的熱重載功能：
- **Vue 組件**: 保持狀態的熱重載
- **CSS 樣式**: 即時更新無需重新載入
- **TypeScript**: 快速型別檢查和編譯

### 除錯技巧

1. **Vue DevTools**: 安裝 Vue DevTools 瀏覽器擴充套件
2. **Console 除錯**: 使用 `console.log()` 和 `debugger` 語句
3. **網路面板**: 檢查資源載入狀況
4. **效能面板**: 分析載入效能和記憶體使用
## 🏗 建置和打包

### 建置指令

```bash
# 完整建置 (包含型別檢查)
npm run build

# 僅建置 (跳過型別檢查，適用於 CI/CD)
npm run build-only

# 預覽建置結果
npm run preview
```

### 建置選項和最佳化

#### Vite 建置配置 (vite.config.ts)

```typescript
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // 自訂建置選項
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          swiper: ['swiper'],
          howler: ['howler']
        }
      }
    }
  }
})
```

#### 建置最佳化設定

- **程式碼分割**: 自動分割 vendor 和應用程式碼
- **資源最佳化**: 自動壓縮圖片和 CSS
- **Tree Shaking**: 移除未使用的程式碼
- **Gzip 壓縮**: 建議在伺服器端啟用

### 輸出檔案結構

```
dist/
├── index.html                       # 主要 HTML 檔案
├── assets/                          # 靜態資源
│   ├── index-{hash}.js             # 主要 JavaScript 檔案
│   ├── index-{hash}.css            # 主要 CSS 檔案
│   ├── vendor-{hash}.js            # 第三方套件
│   ├── swiper-{hash}.js            # Swiper.js 套件
│   └── howler-{hash}.js            # Howler.js 套件
└── assets/exhibitions/              # 展覽資源 (如果使用靜態模式)
    └── sample/
        ├── config.json
        ├── images/
        └── audio/
```

### 建置故障排除

#### 常見問題和解決方案

1. **記憶體不足錯誤**
```bash
# 增加 Node.js 記憶體限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

2. **TypeScript 編譯錯誤**
```bash
# 單獨執行型別檢查
npm run type-check
```

3. **資源路徑問題**
```bash
# 檢查 Vite 配置中的 base 設定
export default defineConfig({
  base: '/your-app-path/', // 如果部署在子路徑
})
```

## 🚀 部署指南

### 1. 靜態網站託管

#### Netlify 部署

1. **連接 Git 儲存庫**
2. **設定建置指令**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **環境變數設定** (如需要):
   - `VITE_API_BASE_URL`
   - `VITE_CDN_BASE_URL`

#### Vercel 部署

1. **安裝 Vercel CLI**:
```bash
npm i -g vercel
```

2. **部署**:
```bash
vercel --prod
```

3. **vercel.json 配置**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### GitHub Pages 部署

1. **設定 GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```
### 2. CDN 部署設定

#### 使用 AWS CloudFront

1. **建立 S3 Bucket**
2. **上傳建置檔案到 S3**
3. **設定 CloudFront 分發**
4. **配置快取策略**:
   - HTML 檔案: 短期快取 (1 小時)
   - 靜態資源: 長期快取 (1 年)

#### 使用 Cloudflare

1. **設定 DNS**
2. **啟用 CDN 和快取**
3. **配置頁面規則**:
   - `*.js`, `*.css`: 快取所有內容
   - `*.html`: 快取 2 小時

### 3. 伺服器部署

#### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/exhibition;
    index index.html;

    # 處理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 靜態資源快取
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 壓縮設定
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Apache 配置

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/exhibition

    # 處理 SPA 路由
    <Directory /var/www/exhibition>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 靜態資源快取
    <LocationMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
</VirtualHost>
```

### 4. Docker 容器化部署

#### Dockerfile

```dockerfile
# 建置階段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生產階段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  exhibition:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### 環境變數配置

#### 開發環境 (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_CDN_BASE_URL=http://localhost:3000/cdn
VITE_DEBUG=true
```

#### 生產環境 (.env.production)
```bash
VITE_API_BASE_URL=https://api.your-domain.com
VITE_CDN_BASE_URL=https://cdn.your-domain.com
VITE_DEBUG=false
```

## 🧪 測試指南

### 測試架構

系統採用雙重測試策略，結合單元測試和屬性測試（Property-Based Testing）：

- **單元測試**: 驗證具體範例和邊界條件
- **屬性測試**: 驗證通用正確性屬性
- **整合測試**: 驗證組件間互動
- **端對端測試**: 驗證完整使用者流程

### 執行測試

```bash
# 執行所有測試
npm run test:unit

# 執行測試並顯示覆蓋率
npm run test:unit -- --coverage

# 監視模式 (開發時使用)
npm run test:unit -- --watch

# 執行特定測試檔案
npm run test:unit -- src/components/exhibition/__tests__/SceneComponent.property.spec.ts
```
### 單元測試

使用 **Vitest** 和 **Vue Test Utils** 進行組件測試：

```typescript
// 範例: 組件單元測試
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SceneComponent from '../SceneComponent.vue'

describe('SceneComponent', () => {
  it('should render scene image correctly', () => {
    const scene = {
      id: 'test-scene',
      title: 'Test Scene',
      image: { url: 'test.jpg', alt: 'Test Image' }
    }
    
    const wrapper = mount(SceneComponent, {
      props: { scene }
    })
    
    expect(wrapper.find('img').attributes('src')).toBe('test.jpg')
    expect(wrapper.find('img').attributes('alt')).toBe('Test Image')
  })
})
```

### 屬性測試 (Property-Based Testing)

使用 **fast-check** 進行屬性測試，驗證系統在大量隨機輸入下的正確性：

```typescript
// 範例: 屬性測試
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { ResourceManager } from '../ResourceManager'

describe('ResourceManager Properties', () => {
  it('Property 30: Resource Loading Fallback', () => {
    fc.assert(fc.property(
      fc.record({
        mode: fc.constantFrom('static', 'api', 'hybrid'),
        fallbackStrategy: fc.constantFrom('static', 'api', 'none')
      }),
      (config) => {
        const manager = new ResourceManager(config)
        // 測試當主要載入失敗時，應該嘗試 fallback 策略
        // 驗證 fallback 邏輯的正確性
      }
    ), { numRuns: 100 })
  })
})
```

### 測試覆蓋率

目標測試覆蓋率：
- **語句覆蓋率**: > 80%
- **分支覆蓋率**: > 75%
- **函數覆蓋率**: > 85%
- **行覆蓋率**: > 80%

### E2E 測試設定

雖然目前專案主要使用單元測試和屬性測試，但可以使用 **Playwright** 進行端對端測試：

```bash
# 安裝 Playwright (可選)
npm install -D @playwright/test

# 執行 E2E 測試
npx playwright test
```

### 效能測試

使用 **Lighthouse CI** 進行效能測試：

```bash
# 安裝 Lighthouse CI
npm install -D @lhci/cli

# 執行效能測試
lhci autorun
```

## 📚 展覽內容製作指南

### JSON 配置檔案詳細說明

#### 基本結構

```json
{
  "id": "unique-exhibition-id",           // 展覽唯一識別碼
  "title": "展覽標題",                    // 展覽名稱
  "description": "展覽描述文字",           // 展覽簡介
  "scenes": [...],                        // 場景陣列
  "defaultLanguage": "zh",                // 預設語言
  "availableLanguages": ["zh", "en"],     // 可用語言列表
  "resourceConfig": {...},                // 資源載入配置
  "settings": {...}                       // 展覽設定
}
```

#### 場景 (Scene) 配置

```json
{
  "id": "scene-1",                        // 場景唯一識別碼
  "title": "場景標題",                    // 場景名稱
  "description": {                        // 多語言描述
    "zh": "中文描述",
    "en": "English description"
  },
  "image": {                              // 圖片配置
    "url": "scene-1.jpg",                // 圖片檔案名稱
    "alt": "圖片替代文字",               // 無障礙替代文字
    "width": 1920,                       // 圖片寬度
    "height": 1080,                      // 圖片高度
    "thumbnail": "scene-1-thumb.jpg"     // 縮圖檔案名稱 (可選)
  },
  "audio": {                              // 多語言音訊配置
    "zh": {
      "url": "scene-1-zh.mp3",           // 音訊檔案名稱
      "duration": 30,                     // 音訊長度 (秒)
      "format": "mp3",                    // 音訊格式
      "size": 480000                      // 檔案大小 (bytes)
    }
  },
  "order": 1,                             // 場景順序
  "metadata": {                           // 作品資訊 (可選)
    "artist": "藝術家姓名",
    "year": "創作年份",
    "medium": "創作媒材",
    "dimensions": "作品尺寸"
  }
}
```
### 圖片規格建議

#### 主要展示圖片
- **解析度**: 1920x1080 (Full HD) 或更高
- **長寬比**: 16:9 (推薦) 或 4:3
- **檔案格式**: JPG (照片), PNG (插圖), WebP (現代瀏覽器)
- **檔案大小**: < 2MB (建議 < 1MB)
- **色彩空間**: sRGB
- **品質設定**: JPG 85-90%

#### 縮圖圖片
- **解析度**: 300x200 或 400x300
- **檔案格式**: JPG 或 WebP
- **檔案大小**: < 100KB
- **品質設定**: JPG 70-80%

#### 圖片最佳化建議
1. **使用適當的壓縮**: 平衡品質和檔案大小
2. **提供多種格式**: WebP (現代瀏覽器) + JPG (相容性)
3. **響應式圖片**: 提供不同解析度版本
4. **延遲載入**: 系統自動處理，無需額外設定

### 音訊檔案規格建議

#### 語音導覽音訊
- **檔案格式**: MP3 (主要), OGG (備用)
- **位元率**: 128kbps (語音) 或 192kbps (音樂)
- **取樣率**: 44.1kHz
- **聲道**: 單聲道 (語音) 或立體聲 (音樂)
- **檔案大小**: < 5MB
- **長度**: 30-120 秒 (建議 60 秒內)

#### 音訊製作建議
1. **清晰發音**: 確保語音清晰易懂
2. **背景音樂**: 音量適中，不干擾語音
3. **音量標準化**: 統一所有音訊檔案的音量
4. **格式相容性**: 提供 MP3 確保最大相容性

### 多語言內容組織

#### 語言代碼標準
- `zh`: 中文 (繁體或簡體)
- `en`: 英文
- `ja`: 日文
- `ko`: 韓文
- `fr`: 法文
- `de`: 德文
- `es`: 西班牙文

#### 內容翻譯建議
1. **專業翻譯**: 使用專業翻譯服務
2. **文化適應**: 考慮不同文化背景
3. **長度控制**: 不同語言的內容長度可能差異很大
4. **一致性**: 確保所有語言版本的資訊一致

### 內容最佳化建議

#### 效能最佳化
1. **檔案壓縮**: 使用適當的壓縮設定
2. **CDN 使用**: 將媒體檔案放在 CDN 上
3. **快取策略**: 設定適當的快取標頭
4. **預載策略**: 系統會自動預載相鄰場景

#### 使用者體驗最佳化
1. **載入順序**: 重要內容優先載入
2. **錯誤處理**: 提供備用內容
3. **無障礙設計**: 提供替代文字和字幕
4. **行動裝置**: 確保在小螢幕上的可讀性

## 🔌 API 整合 (API 模式使用)

### API 端點規格

#### 取得展覽配置
```http
GET /api/exhibitions/{exhibitionId}
```

**回應格式**:
```json
{
  "id": "exhibition-id",
  "title": "展覽標題",
  "scenes": [...],
  "defaultLanguage": "zh",
  "availableLanguages": ["zh", "en"]
}
```

#### 取得場景列表
```http
GET /api/exhibitions/{exhibitionId}/scenes
```

#### 取得媒體檔案
```http
GET /api/media/{type}/{filename}
```
- `type`: `images` 或 `audio`
- `filename`: 檔案名稱

### 資料格式要求

#### 展覽配置 API 回應
- **Content-Type**: `application/json`
- **編碼**: UTF-8
- **快取**: 建議設定適當的 Cache-Control 標頭

#### 媒體檔案 API 回應
- **Content-Type**: 根據檔案類型設定
- **Content-Length**: 必須提供檔案大小
- **Accept-Ranges**: 支援範圍請求 (可選)

### 認證和授權

如果 API 需要認證，建議使用：
- **JWT Token**: 在 Authorization 標頭中傳送
- **API Key**: 在查詢參數或標頭中傳送

```typescript
// API 客戶端配置範例
const apiClient = {
  baseURL: 'https://api.your-domain.com',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json'
  }
}
```

### 錯誤處理

#### HTTP 狀態碼
- `200`: 成功
- `404`: 展覽或資源不存在
- `500`: 伺服器錯誤

#### 錯誤回應格式
```json
{
  "error": {
    "code": "EXHIBITION_NOT_FOUND",
    "message": "Exhibition not found",
    "details": "Exhibition with ID 'invalid-id' does not exist"
  }
}
```
## 🎨 客製化和擴展

### 主題客製化

#### 修改 Tailwind CSS 配置

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // 自定義品牌色彩
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        },
        exhibition: {
          background: '#1a1a1a',
          text: '#ffffff',
          accent: '#ff6b35'
        }
      },
      fontFamily: {
        // 自定義字體
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif']
      },
      spacing: {
        // 自定義間距
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  }
}
```

#### 自定義 CSS 變數

```css
/* src/assets/base.css */
:root {
  /* 展覽主題色彩 */
  --exhibition-primary: #2c3e50;
  --exhibition-secondary: #3498db;
  --exhibition-accent: #e74c3c;
  
  /* 字體大小 */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  
  /* 間距 */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
}
```

### 新增語言支援

#### 1. 更新語言配置

```typescript
// src/config/exhibition.ts
export const SUPPORTED_LANGUAGES = {
  zh: { name: '中文', flag: '🇹🇼' },
  en: { name: 'English', flag: '🇺🇸' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },    // 新增韓文
  fr: { name: 'Français', flag: '🇫🇷' }   // 新增法文
}
```

#### 2. 更新組件

```vue
<!-- LanguageSwitcher.vue -->
<template>
  <select v-model="currentLanguage" @change="switchLanguage">
    <option 
      v-for="(lang, code) in SUPPORTED_LANGUAGES" 
      :key="code" 
      :value="code"
    >
      {{ lang.flag }} {{ lang.name }}
    </option>
  </select>
</template>
```

#### 3. 準備多語言內容

確保所有展覽配置檔案包含新語言的內容：

```json
{
  "description": {
    "zh": "中文描述",
    "en": "English description",
    "ko": "한국어 설명",
    "fr": "Description en français"
  },
  "audio": {
    "zh": { "url": "scene-1-zh.mp3" },
    "en": { "url": "scene-1-en.mp3" },
    "ko": { "url": "scene-1-ko.mp3" },
    "fr": { "url": "scene-1-fr.mp3" }
  }
}
```

### 自定義組件開發

#### 建立新組件

```vue
<!-- src/components/exhibition/CustomComponent.vue -->
<template>
  <div class="custom-component">
    <!-- 組件內容 -->
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Scene } from '@/types'

// 定義 Props
interface Props {
  scene: Scene
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false
})

// 定義 Events
const emit = defineEmits<{
  sceneChange: [sceneId: string]
  loadComplete: [scene: Scene]
}>()
</script>
```

#### 註冊組件

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import CustomComponent from '@/components/exhibition/CustomComponent.vue'

const app = createApp(App)
app.component('CustomComponent', CustomComponent)
app.mount('#app')
```

### 插件系統使用

#### 建立插件

```typescript
// src/plugins/analytics.ts
import type { App } from 'vue'

export interface AnalyticsPlugin {
  trackEvent(event: string, data?: any): void
  trackPageView(path: string): void
}

export default {
  install(app: App, options: { apiKey: string }) {
    const analytics: AnalyticsPlugin = {
      trackEvent(event: string, data?: any) {
        // 實作事件追蹤
        console.log('Track event:', event, data)
      },
      trackPageView(path: string) {
        // 實作頁面瀏覽追蹤
        console.log('Track page view:', path)
      }
    }
    
    app.config.globalProperties.$analytics = analytics
    app.provide('analytics', analytics)
  }
}
```

#### 使用插件

```typescript
// src/main.ts
import analyticsPlugin from '@/plugins/analytics'

app.use(analyticsPlugin, { apiKey: 'your-api-key' })
```

## 🔧 故障排除

### 常見問題和解決方案

#### 1. 開發環境問題

**問題**: `npm run dev` 啟動失敗
```bash
# 解決方案
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**問題**: TypeScript 編譯錯誤
```bash
# 檢查 TypeScript 配置
npm run type-check

# 清除 TypeScript 快取
rm -rf node_modules/.vite
```

**問題**: Tailwind CSS 樣式未載入
```bash
# 檢查 Tailwind 配置
npx tailwindcss -i ./src/assets/main.css -o ./dist/output.css --watch
```
#### 2. 建置和部署問題

**問題**: 建置記憶體不足
```bash
# 增加 Node.js 記憶體限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**問題**: 靜態資源路徑錯誤
```typescript
// vite.config.ts - 設定正確的 base path
export default defineConfig({
  base: '/your-app-path/', // 根據部署路徑調整
})
```

**問題**: SPA 路由在生產環境不工作
```nginx
# Nginx 配置 - 處理 SPA 路由
location / {
    try_files $uri $uri/ /index.html;
}
```

#### 3. 效能問題診斷

**問題**: 圖片載入緩慢
- 檢查圖片檔案大小 (建議 < 2MB)
- 確認延遲載入功能正常運作
- 考慮使用 WebP 格式

**問題**: 音訊播放延遲
- 檢查音訊檔案大小 (建議 < 5MB)
- 確認 Howler.js 預載設定
- 檢查網路連線品質

**問題**: 滑動手勢不靈敏
- 檢查 Swiper.js 配置
- 確認觸控事件沒有被其他元素攔截
- 調整滑動靈敏度設定

#### 4. 瀏覽器相容性問題

**問題**: Internet Explorer 不支援
- 系統需要現代瀏覽器支援
- 建議升級到 Chrome, Firefox, Safari 或 Edge

**問題**: 行動裝置音訊自動播放被阻擋
```typescript
// 需要使用者互動才能播放音訊
const playAudio = async () => {
  try {
    await audioElement.play()
  } catch (error) {
    // 顯示播放按鈕讓使用者手動播放
    showPlayButton()
  }
}
```

**問題**: iOS Safari 滑動衝突
```css
/* 禁用 iOS 的彈性滾動 */
body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}
```

#### 5. 行動裝置問題

**問題**: 觸控按鈕太小
- 確保按鈕最小尺寸 44x44px
- 使用 TouchOptimizedButton 組件

**問題**: 橫向/直向切換問題
- 檢查響應式斷點設定
- 測試 orientation change 事件處理

**問題**: 鍵盤彈出影響佈局
```css
/* 處理行動裝置鍵盤彈出 */
@media (max-height: 500px) {
  .exhibition-container {
    height: 100vh;
  }
}
```

### 除錯工具和技巧

#### 1. Vue DevTools
- 安裝 Vue DevTools 瀏覽器擴充套件
- 檢查組件狀態和 props
- 監控事件和效能

#### 2. 網路面板除錯
- 檢查資源載入狀況
- 監控 API 請求和回應
- 分析載入時間和檔案大小

#### 3. Console 除錯
```typescript
// 開發環境除錯
if (import.meta.env.DEV) {
  console.log('Debug info:', debugData)
}

// 使用 debugger 中斷點
debugger; // 只在開發環境使用
```

#### 4. 效能分析
```typescript
// 測量函數執行時間
console.time('loadScene')
await loadScene(sceneId)
console.timeEnd('loadScene')

// 監控記憶體使用
console.log('Memory usage:', performance.memory)
```

## 🤝 貢獻指南

### 開發流程

1. **Fork 專案**
2. **建立功能分支**: `git checkout -b feature/new-feature`
3. **提交變更**: `git commit -m 'Add new feature'`
4. **推送分支**: `git push origin feature/new-feature`
5. **建立 Pull Request**

### 程式碼規範

#### TypeScript 規範
- 使用嚴格的 TypeScript 設定
- 所有函數和變數都要有型別註解
- 使用 interface 定義資料結構

#### Vue 組件規範
- 使用 Composition API
- Props 和 Events 要有型別定義
- 組件名稱使用 PascalCase

#### CSS 規範
- 優先使用 Tailwind CSS 類別
- 自定義樣式使用 CSS 變數
- 遵循 BEM 命名規範 (如需要)

#### 提交訊息規範
```
type(scope): description

feat(audio): add multi-language support
fix(swiper): resolve touch gesture issue
docs(readme): update deployment guide
test(scene): add property-based tests
```

### 提交 PR 的要求

1. **程式碼品質**
   - 通過所有測試
   - 符合 ESLint 規範
   - 型別檢查無錯誤

2. **測試覆蓋率**
   - 新功能必須包含測試
   - 維持整體覆蓋率 > 80%

3. **文件更新**
   - 更新相關文件
   - 新增功能說明

### 問題回報格式

```markdown
## 問題描述
簡要描述遇到的問題

## 重現步驟
1. 執行 xxx
2. 點擊 xxx
3. 看到錯誤

## 預期行為
描述預期應該發生什麼

## 實際行為
描述實際發生了什麼

## 環境資訊
- OS: macOS 14.0
- Browser: Chrome 120.0
- Node.js: 20.10.0
- npm: 10.2.0

## 額外資訊
其他相關資訊或截圖
```

## 📄 授權和致謝

### 開源授權

本專案採用 **MIT License** 授權，詳細內容請參閱 [LICENSE](LICENSE) 檔案。

### 第三方套件致謝

- **Vue.js**: 漸進式 JavaScript 框架
- **Vite**: 下一代前端建置工具
- **TypeScript**: JavaScript 的型別超集
- **Tailwind CSS**: 實用優先的 CSS 框架
- **Swiper.js**: 現代觸控滑動組件
- **Howler.js**: 現代網頁音訊庫
- **Vitest**: 由 Vite 驅動的測試框架
- **fast-check**: TypeScript/JavaScript 屬性測試庫

### 貢獻者

感謝所有為這個專案做出貢獻的開發者：

- **TJM Dev Team** - 初始開發和維護

### 聯絡資訊

如有任何問題或建議，歡迎透過以下方式聯絡：

- **GitHub Issues**: [專案 Issues 頁面]
- **Email**: [聯絡信箱]
- **文件**: [線上文件連結]

---

## 🚀 開始使用

現在您已經了解了線上展覽網站的完整功能和使用方法，可以開始建立您自己的數位展覽了！

1. **複製專案並安裝依賴**
2. **準備您的展覽內容** (圖片、音訊、配置檔案)
3. **選擇適合的資源載入模式**
4. **客製化主題和樣式**
5. **測試和部署**

祝您建立出精彩的線上展覽體驗！ 🎨✨