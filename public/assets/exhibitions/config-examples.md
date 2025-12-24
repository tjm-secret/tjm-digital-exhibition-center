# 展覽配置範例集

本文件提供各種展覽配置的實際範例，涵蓋不同規模和需求的展覽場景。

## 📋 配置範例索引

1. [小型藝術展覽 (靜態模式)](#小型藝術展覽-靜態模式)
2. [大型博物館展覽 (API 模式)](#大型博物館展覽-api-模式)
3. [國際巡迴展覽 (混合模式)](#國際巡迴展覽-混合模式)
4. [多媒體互動展覽](#多媒體互動展覽)
5. [教育主題展覽](#教育主題展覽)
6. [臨時特展配置](#臨時特展配置)

---

## 小型藝術展覽 (靜態模式)

**適用場景**: 個人藝術家作品展、小型畫廊展覽、學生作品展

```json
{
  "id": "artist-solo-exhibition",
  "title": "張藝術家個人作品展",
  "description": "展示張藝術家近年來的創作歷程，包含油畫、水彩和數位藝術作品。",
  "scenes": [
    {
      "id": "early-works",
      "title": "早期作品 (2020-2021)",
      "description": {
        "zh": "藝術家早期的探索性作品，展現對色彩和形式的實驗。",
        "en": "Early exploratory works showing the artist's experimentation with color and form."
      },
      "image": {
        "url": "early-works-collection.jpg",
        "alt": "早期作品合集",
        "width": 1920,
        "height": 1080,
        "thumbnail": "early-works-thumb.jpg"
      },
      "audio": {
        "zh": {
          "url": "early-works-zh.mp3",
          "duration": 35,
          "format": "mp3",
          "size": 560000
        },
        "en": {
          "url": "early-works-en.mp3",
          "duration": 38,
          "format": "mp3",
          "size": 608000
        }
      },
      "order": 1,
      "metadata": {
        "artist": "張藝術家",
        "year": "2020-2021",
        "medium": "油畫、水彩",
        "dimensions": "多件作品"
      }
    }
  ],
  "defaultLanguage": "zh",
  "availableLanguages": ["zh", "en"],
  "resourceConfig": {
    "mode": "static",
    "staticPath": "/assets/exhibitions/",
    "fallbackStrategy": "none"
  },
  "settings": {
    "autoplay": false,
    "showThumbnails": true,
    "enableKeyboard": true,
    "preloadCount": 1
  }
}
```

---

## 大型博物館展覽 (API 模式)

**適用場景**: 國家級博物館、大型文化機構、需要即時內容管理的展覽

```json
{
  "id": "national-museum-ancient-art",
  "title": "古代文明藝術大展",
  "description": "跨越五千年的古代文明藝術珍品，展示人類文明的璀璨成就。",
  "scenes": [
    {
      "id": "mesopotamian-art",
      "title": "美索不達米亞文明",
      "description": {
        "zh": "探索世界最早的文明之一，美索不達米亞的藝術與文化遺產。",
        "en": "Explore the art and cultural heritage of Mesopotamia, one of the world's earliest civilizations.",
        "ja": "世界最古の文明の一つ、メソポタミアの芸術と文化遺産を探求します。",
        "fr": "Explorez l'art et le patrimoine culturel de la Mésopotamie, l'une des premières civilisations du monde."
      },
      "image": {
        "url": "https://museum-api.example.com/media/images/mesopotamian-artifacts.jpg",
        "alt": "美索不達米亞文物",
        "width": 2560,
        "height": 1440,
        "thumbnail": "https://museum-api.example.com/media/thumbnails/mesopotamian-artifacts-thumb.jpg"
      },
      "audio": {
        "zh": {
          "url": "https://museum-api.example.com/media/audio/mesopotamian-zh.mp3",
          "duration": 180,
          "format": "mp3",
          "size": 2880000
        },
        "en": {
          "url": "https://museum-api.example.com/media/audio/mesopotamian-en.mp3",
          "duration": 185,
          "format": "mp3",
          "size": 2960000
        },
        "ja": {
          "url": "https://museum-api.example.com/media/audio/mesopotamian-ja.mp3",
          "duration": 175,
          "format": "mp3",
          "size": 2800000
        },
        "fr": {
          "url": "https://museum-api.example.com/media/audio/mesopotamian-fr.mp3",
          "duration": 190,
          "format": "mp3",
          "size": 3040000
        }
      },
      "order": 1,
      "metadata": {
        "period": "西元前 3500-539 年",
        "region": "美索不達米亞",
        "artifacts": "楔形文字板、雕像、裝飾品",
        "loanSource": "大英博物館、羅浮宮"
      }
    }
  ],
  "defaultLanguage": "zh",
  "availableLanguages": ["zh", "en", "ja", "fr"],
  "resourceConfig": {
    "mode": "api",
    "apiEndpoint": "https://museum-api.example.com/exhibitions",
    "fallbackStrategy": "static"
  },
  "settings": {
    "autoplay": false,
    "showThumbnails": true,
    "enableKeyboard": true,
    "preloadCount": 3
  }
}
```

---

## 國際巡迴展覽 (混合模式)

**適用場景**: 國際巡迴展覽、需要多地區部署、高效能需求

```json
{
  "id": "international-contemporary-art",
  "title": "當代藝術國際巡迴展",
  "description": "匯集全球當代藝術家的精彩作品，展現當代藝術的多元面貌。",
  "scenes": [
    {
      "id": "digital-installations",
      "title": "數位裝置藝術",
      "description": {
        "zh": "當代數位藝術家運用最新科技創造的沉浸式裝置作品。",
        "en": "Immersive installation works created by contemporary digital artists using cutting-edge technology.",
        "ja": "現代のデジタルアーティストが最新技術を使って創造した没入型インスタレーション作品。",
        "ko": "현대 디지털 아티스트들이 최신 기술을 사용하여 창조한 몰입형 설치 작품들.",
        "fr": "Œuvres d'installation immersives créées par des artistes numériques contemporains utilisant une technologie de pointe."
      },
      "image": {
        "url": "digital-installations-main.jpg",
        "alt": "數位裝置藝術展示",
        "width": 3840,
        "height": 2160,
        "thumbnail": "digital-installations-thumb.jpg"
      },
      "audio": {
        "zh": {
          "url": "digital-installations-zh.mp3",
          "duration": 120,
          "format": "mp3",
          "size": 1920000
        },
        "en": {
          "url": "digital-installations-en.mp3",
          "duration": 125,
          "format": "mp3",
          "size": 2000000
        },
        "ja": {
          "url": "digital-installations-ja.mp3",
          "duration": 115,
          "format": "mp3",
          "size": 1840000
        },
        "ko": {
          "url": "digital-installations-ko.mp3",
          "duration": 118,
          "format": "mp3",
          "size": 1888000
        },
        "fr": {
          "url": "digital-installations-fr.mp3",
          "duration": 130,
          "format": "mp3",
          "size": 2080000
        }
      },
      "order": 1,
      "metadata": {
        "curatedBy": "國際當代藝術策展團隊",
        "participatingArtists": "15 位國際藝術家",
        "technology": "VR, AR, 互動感應器",
        "tourStops": "紐約、倫敦、東京、首爾、台北"
      }
    }
  ],
  "defaultLanguage": "en",
  "availableLanguages": ["zh", "en", "ja", "ko", "fr"],
  "resourceConfig": {
    "mode": "hybrid",
    "apiEndpoint": "https://touring-exhibition-api.com/exhibitions",
    "cdnBaseUrl": "https://global-cdn.touring-exhibition.com/media/",
    "fallbackStrategy": "static"
  },
  "settings": {
    "autoplay": false,
    "showThumbnails": true,
    "enableKeyboard": true,
    "preloadCount": 2
  }
}
```

---

## 多媒體互動展覽

**適用場景**: 科技博物館、互動體驗館、教育展覽

```json
{
  "id": "interactive-science-exhibition",
  "title": "科學探索互動展",
  "description": "透過互動多媒體技術，讓觀眾親身體驗科學的奧妙。",
  "scenes": [
    {
      "id": "physics-playground",
      "title": "物理遊樂場",
      "description": {
        "zh": "透過有趣的互動實驗，探索物理學的基本原理和現象。",
        "en": "Explore fundamental physics principles and phenomena through fun interactive experiments."
      },
      "image": {
        "url": "physics-interactive-setup.jpg",
        "alt": "物理互動實驗裝置",
        "width": 1920,
        "height": 1080,
        "thumbnail": "physics-interactive-thumb.jpg"
      },
      "audio": {
        "zh": {
          "url": "physics-playground-zh.mp3",
          "duration": 90,
          "format": "mp3",
          "size": 1440000
        },
        "en": {
          "url": "physics-playground-en.mp3",
          "duration": 95,
          "format": "mp3",
          "size": 1520000
        }
      },
      "order": 1,
      "metadata": {
        "interactiveElements": "觸控螢幕、動作感應、聲音互動",
        "targetAge": "8-18 歲",
        "learningObjectives": "牛頓定律、能量守恆、波動現象",
        "duration": "建議體驗時間 15-20 分鐘"
      }
    }
  ],
  "defaultLanguage": "zh",
  "availableLanguages": ["zh", "en"],
  "resourceConfig": {
    "mode": "static",
    "staticPath": "/assets/exhibitions/",
    "fallbackStrategy": "none"
  },
  "settings": {
    "autoplay": true,
    "showThumbnails": true,
    "enableKeyboard": true,
    "preloadCount": 2
  }
}
```

---

## 教育主題展覽

**適用場景**: 學校教育、線上課程、知識普及

```json
{
  "id": "environmental-education-exhibition",
  "title": "環境保護教育展",
  "description": "透過生動的視覺內容和互動體驗，提升環境保護意識。",
  "scenes": [
    {
      "id": "climate-change-impact",
      "title": "氣候變遷的影響",
      "description": {
        "zh": "了解全球氣候變遷對地球環境和人類生活的深遠影響。",
        "en": "Understand the profound impact of global climate change on Earth's environment and human life."
      },
      "image": {
        "url": "climate-change-visualization.jpg",
        "alt": "氣候變遷視覺化圖表",
        "width": 1920,
        "height": 1080,
        "thumbnail": "climate-change-thumb.jpg"
      },
      "audio": {
        "zh": {
          "url": "climate-change-zh.mp3",
          "duration": 240,
          "format": "mp3",
          "size": 3840000
        },
        "en": {
          "url": "climate-change-en.mp3",
          "duration": 245,
          "format": "mp3",
          "size": 3920000
        }
      },
      "order": 1,
      "metadata": {
        "educationLevel": "中學以上",
        "keyTopics": "溫室效應、海平面上升、極端氣候",
        "dataSource": "IPCC 氣候變遷報告",
        "lastUpdated": "2024-01-15"
      }
    }
  ],
  "defaultLanguage": "zh",
  "availableLanguages": ["zh", "en"],
  "resourceConfig": {
    "mode": "hybrid",
    "apiEndpoint": "https://education-api.example.com/exhibitions",
    "cdnBaseUrl": "https://education-cdn.example.com/media/",
    "fallbackStrategy": "static"
  },
  "settings": {
    "autoplay": false,
    "showThumbnails": true,
    "enableKeyboard": true,
    "preloadCount": 3
  }
}
```

---

## 臨時特展配置

**適用場景**: 限時特展、活動展覽、快速部署需求

```json
{
  "id": "temporary-festival-exhibition",
  "title": "藝術節特展 2024",
  "description": "2024 年度藝術節精選作品展，展期限定三個月。",
  "scenes": [
    {
      "id": "festival-highlights",
      "title": "藝術節亮點作品",
      "description": {
        "zh": "本屆藝術節最受矚目的精選作品，展現當代藝術的創新活力。",
        "en": "The most anticipated selected works from this year's art festival, showcasing the innovative vitality of contemporary art."
      },
      "image": {
        "url": "festival-highlights-collage.jpg",
        "alt": "藝術節亮點作品合集",
        "width": 1920,
        "height": 1080,
        "thumbnail": "festival-highlights-thumb.jpg"
      },
      "audio": {
        "zh": {
          "url": "festival-highlights-zh.mp3",
          "duration": 60,
          "format": "mp3",
          "size": 960000
        },
        "en": {
          "url": "festival-highlights-en.mp3",
          "duration": 65,
          "format": "mp3",
          "size": 1040000
        }
      },
      "order": 1,
      "metadata": {
        "exhibitionPeriod": "2024/03/01 - 2024/05/31",
        "featuredArtists": "12 位本地和國際藝術家",
        "specialEvents": "開幕式、藝術家座談、工作坊",
        "ticketInfo": "免費入場，需預約"
      }
    }
  ],
  "defaultLanguage": "zh",
  "availableLanguages": ["zh", "en"],
  "resourceConfig": {
    "mode": "static",
    "staticPath": "/assets/exhibitions/",
    "fallbackStrategy": "none"
  },
  "settings": {
    "autoplay": false,
    "showThumbnails": false,
    "enableKeyboard": true,
    "preloadCount": 1
  }
}
```

---

## 🔧 配置最佳實踐

### 1. 效能最佳化

```json
{
  "settings": {
    "preloadCount": 2,              // 預載相鄰 2 個場景
    "showThumbnails": true,         // 啟用縮圖可提升導覽體驗
    "enableKeyboard": true          // 啟用鍵盤控制提升可用性
  }
}
```

### 2. 多語言配置

```json
{
  "defaultLanguage": "zh",          // 設定預設語言
  "availableLanguages": ["zh", "en", "ja"], // 按重要性排序
  "description": {
    "zh": "完整的中文描述...",
    "en": "Complete English description...",
    "ja": "完全な日本語の説明..."
  }
}
```

### 3. 媒體檔案最佳化

```json
{
  "image": {
    "url": "high-quality-image.jpg",
    "thumbnail": "optimized-thumb.jpg", // 提供縮圖提升載入速度
    "width": 1920,
    "height": 1080                      // 明確指定尺寸避免佈局跳動
  },
  "audio": {
    "zh": {
      "duration": 60,                   // 建議控制在 60-120 秒
      "format": "mp3",                  // 使用相容性最佳的格式
      "size": 960000                    // 控制檔案大小 < 5MB
    }
  }
}
```

### 4. 錯誤處理和備援

```json
{
  "resourceConfig": {
    "mode": "hybrid",
    "apiEndpoint": "https://primary-api.com",
    "cdnBaseUrl": "https://primary-cdn.com",
    "fallbackStrategy": "static"       // 設定備援策略
  }
}
```

---

這些範例涵蓋了各種不同的展覽需求和技術配置，可以作為建立新展覽時的參考範本。根據實際需求調整配置參數，以達到最佳的使用者體驗和系統效能。