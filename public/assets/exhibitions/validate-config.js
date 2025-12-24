/**
 * 展覽配置檔案驗證工具
 * 
 * 使用方法:
 * 1. 在瀏覽器開發者工具中載入此檔案
 * 2. 呼叫 validateExhibitionConfig(configObject) 驗證配置
 * 
 * 範例:
 * const config = { ... }; // 您的展覽配置
 * const result = validateExhibitionConfig(config);
 * console.log(result);
 */

/**
 * 驗證展覽配置檔案
 * @param {Object} config - 展覽配置物件
 * @returns {Object} 驗證結果
 */
function validateExhibitionConfig(config) {
  const errors = [];
  const warnings = [];
  
  // 基本必要欄位檢查
  const requiredFields = ['id', 'title', 'scenes', 'defaultLanguage', 'availableLanguages', 'resourceConfig'];
  
  requiredFields.forEach(field => {
    if (!config[field]) {
      errors.push(`缺少必要欄位: ${field}`);
    }
  });
  
  // ID 格式檢查
  if (config.id && !/^[a-z0-9-]+$/.test(config.id)) {
    errors.push('展覽 ID 只能包含小寫字母、數字和連字號');
  }
  
  // 場景陣列檢查
  if (config.scenes) {
    if (!Array.isArray(config.scenes)) {
      errors.push('scenes 必須是陣列');
    } else if (config.scenes.length === 0) {
      errors.push('至少需要一個場景');
    } else {
      config.scenes.forEach((scene, index) => {
        validateScene(scene, index, errors, warnings);
      });
    }
  }
  
  // 語言設定檢查
  if (config.defaultLanguage && config.availableLanguages) {
    if (!config.availableLanguages.includes(config.defaultLanguage)) {
      errors.push('預設語言必須包含在可用語言列表中');
    }
  }
  
  // 資源配置檢查
  if (config.resourceConfig) {
    validateResourceConfig(config.resourceConfig, errors, warnings);
  }
  
  // 設定檢查
  if (config.settings) {
    validateSettings(config.settings, warnings);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalScenes: config.scenes ? config.scenes.length : 0,
      languages: config.availableLanguages ? config.availableLanguages.length : 0,
      resourceMode: config.resourceConfig ? config.resourceConfig.mode : 'unknown'
    }
  };
}

/**
 * 驗證單一場景配置
 */
function validateScene(scene, index, errors, warnings) {
  const scenePrefix = `場景 ${index + 1}`;
  
  // 必要欄位
  const requiredSceneFields = ['id', 'title', 'description', 'image', 'order'];
  requiredSceneFields.forEach(field => {
    if (!scene[field]) {
      errors.push(`${scenePrefix}: 缺少必要欄位 ${field}`);
    }
  });
  
  // ID 唯一性檢查 (簡化版)
  if (scene.id && !/^[a-z0-9-]+$/.test(scene.id)) {
    errors.push(`${scenePrefix}: 場景 ID 格式不正確`);
  }
  
  // 圖片配置檢查
  if (scene.image) {
    if (!scene.image.url) {
      errors.push(`${scenePrefix}: 圖片缺少 URL`);
    }
    if (!scene.image.alt) {
      warnings.push(`${scenePrefix}: 建議提供圖片替代文字 (alt)`);
    }
    if (!scene.image.width || !scene.image.height) {
      warnings.push(`${scenePrefix}: 建議提供圖片尺寸資訊`);
    }
  }
  
  // 多語言描述檢查
  if (scene.description && typeof scene.description === 'object') {
    const languages = Object.keys(scene.description);
    if (languages.length === 0) {
      errors.push(`${scenePrefix}: 描述不能為空`);
    }
  }
  
  // 音訊配置檢查
  if (scene.audio) {
    const audioLanguages = Object.keys(scene.audio);
    if (audioLanguages.length === 0) {
      warnings.push(`${scenePrefix}: 沒有提供音訊檔案`);
    } else {
      audioLanguages.forEach(lang => {
        const audio = scene.audio[lang];
        if (!audio.url) {
          errors.push(`${scenePrefix}: ${lang} 語言音訊缺少 URL`);
        }
        if (!audio.duration) {
          warnings.push(`${scenePrefix}: ${lang} 語言音訊建議提供時長資訊`);
        }
        if (audio.duration && audio.duration > 300) {
          warnings.push(`${scenePrefix}: ${lang} 語言音訊時長超過 5 分鐘，可能影響使用者體驗`);
        }
      });
    }
  }
  
  // 順序檢查
  if (scene.order && typeof scene.order !== 'number') {
    errors.push(`${scenePrefix}: order 必須是數字`);
  }
}

/**
 * 驗證資源配置
 */
function validateResourceConfig(resourceConfig, errors, warnings) {
  const validModes = ['static', 'api', 'hybrid'];
  
  if (!resourceConfig.mode) {
    errors.push('資源配置缺少 mode 欄位');
  } else if (!validModes.includes(resourceConfig.mode)) {
    errors.push(`無效的資源載入模式: ${resourceConfig.mode}`);
  }
  
  // 根據模式檢查對應配置
  switch (resourceConfig.mode) {
    case 'static':
      if (!resourceConfig.staticPath) {
        errors.push('靜態模式需要 staticPath 配置');
      }
      break;
      
    case 'api':
      if (!resourceConfig.apiEndpoint) {
        errors.push('API 模式需要 apiEndpoint 配置');
      }
      break;
      
    case 'hybrid':
      if (!resourceConfig.apiEndpoint) {
        errors.push('混合模式需要 apiEndpoint 配置');
      }
      if (!resourceConfig.cdnBaseUrl) {
        warnings.push('混合模式建議配置 cdnBaseUrl 以獲得最佳效能');
      }
      break;
  }
  
  // 備援策略檢查
  const validFallbackStrategies = ['static', 'api', 'none'];
  if (resourceConfig.fallbackStrategy && !validFallbackStrategies.includes(resourceConfig.fallbackStrategy)) {
    warnings.push(`無效的備援策略: ${resourceConfig.fallbackStrategy}`);
  }
}

/**
 * 驗證展覽設定
 */
function validateSettings(settings, warnings) {
  // 預載數量檢查
  if (settings.preloadCount && (settings.preloadCount < 0 || settings.preloadCount > 5)) {
    warnings.push('建議預載數量設定在 0-5 之間');
  }
  
  // 布林值檢查
  const booleanFields = ['autoplay', 'showThumbnails', 'enableKeyboard'];
  booleanFields.forEach(field => {
    if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
      warnings.push(`${field} 應該是布林值 (true/false)`);
    }
  });
}

/**
 * 驗證 JSON 格式
 */
function validateJSON(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    return validateExhibitionConfig(config);
  } catch (error) {
    return {
      isValid: false,
      errors: [`JSON 格式錯誤: ${error.message}`],
      warnings: [],
      summary: null
    };
  }
}

/**
 * 生成驗證報告
 */
function generateValidationReport(result) {
  let report = '=== 展覽配置驗證報告 ===\n\n';
  
  if (result.isValid) {
    report += '✅ 配置檔案驗證通過！\n\n';
  } else {
    report += '❌ 配置檔案存在錯誤，請修正後重新驗證。\n\n';
  }
  
  if (result.summary) {
    report += '📊 配置摘要:\n';
    report += `- 場景數量: ${result.summary.totalScenes}\n`;
    report += `- 支援語言: ${result.summary.languages}\n`;
    report += `- 載入模式: ${result.summary.resourceMode}\n\n`;
  }
  
  if (result.errors.length > 0) {
    report += '🚨 錯誤 (必須修正):\n';
    result.errors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    report += '\n';
  }
  
  if (result.warnings.length > 0) {
    report += '⚠️  警告 (建議修正):\n';
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning}\n`;
    });
    report += '\n';
  }
  
  if (result.isValid && result.warnings.length === 0) {
    report += '🎉 恭喜！您的配置檔案完美無缺！';
  }
  
  return report;
}

// 使用範例
console.log('展覽配置驗證工具已載入！');
console.log('使用方法:');
console.log('1. validateExhibitionConfig(configObject) - 驗證配置物件');
console.log('2. validateJSON(jsonString) - 驗證 JSON 字串');
console.log('3. generateValidationReport(result) - 生成詳細報告');

// 匯出函數 (如果在 Node.js 環境中使用)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateExhibitionConfig,
    validateJSON,
    generateValidationReport
  };
}