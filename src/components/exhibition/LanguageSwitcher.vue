<template>
  <div class="language-switcher">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ $t('language.select') }}
    </label>
    <select
      v-model="selectedLanguage"
      @change="handleLanguageChange"
      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      <option
        v-for="language in availableLanguages"
        :key="language"
        :value="language"
      >
        {{ getLanguageDisplayName(language) }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  availableLanguages: string[]
  defaultLanguage?: string
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'languageChanged', language: string): void
}

const props = withDefaults(defineProps<Props>(), {
  defaultLanguage: 'zh',
  modelValue: ''
})

const emit = defineEmits<Emits>()

const selectedLanguage = ref<string>(props.modelValue || props.defaultLanguage)

// 語言顯示名稱映射
const languageNames: Record<string, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español'
}

const getLanguageDisplayName = (languageCode: string): string => {
  return languageNames[languageCode] || languageCode.toUpperCase()
}

const handleLanguageChange = () => {
  emit('update:modelValue', selectedLanguage.value)
  emit('languageChanged', selectedLanguage.value)
  
  // 保存語言選擇到 localStorage
  localStorage.setItem('exhibition-language', selectedLanguage.value)
}

// 監聽 props 變化
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== selectedLanguage.value) {
    selectedLanguage.value = newValue
  }
})

// 組件掛載時從 localStorage 恢復語言設定
onMounted(() => {
  const savedLanguage = localStorage.getItem('exhibition-language')
  if (savedLanguage && props.availableLanguages.includes(savedLanguage)) {
    selectedLanguage.value = savedLanguage
    emit('update:modelValue', savedLanguage)
    emit('languageChanged', savedLanguage)
  }
})

// 提供 $t 函數的簡單實現
const $t = (key: string): string => {
  const translations: Record<string, Record<string, string>> = {
    zh: {
      'language.select': '選擇語言'
    },
    en: {
      'language.select': 'Select Language'
    },
    ja: {
      'language.select': '言語を選択'
    }
  }
  
  return translations[selectedLanguage.value]?.[key] || key
}
</script>

<style scoped>
.language-switcher {
  @apply mb-4;
}

.language-switcher select {
  transition: all 0.2s ease-in-out;
}

.language-switcher select:hover {
  @apply border-gray-400;
}

.language-switcher select:focus {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}
</style>