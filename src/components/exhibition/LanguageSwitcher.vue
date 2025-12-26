<template>
  <div class="language-switcher relative z-50">
    <div class="flex items-center gap-2">
      <span class="text-xs text-zinc-500 font-serif tracking-widest uppercase mb-1 block md:hidden">{{ $t('language.select') }}</span>
      
      <div class="relative">
        <button 
          @click="isOpen = !isOpen"
          class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 hover:border-gold/80 bg-black/20 text-gold text-sm font-serif transition-all duration-300 hover:bg-gold/10"
        >
          <span>{{ getLanguageDisplayName(selectedLanguage) }}</span>
          <svg 
            class="w-3 h-3 transition-transform duration-300" 
            :class="{ 'rotate-180': isOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div 
            v-if="isOpen"
            class="absolute top-full left-0 mt-2 w-32 py-1 bg-dark-surface border border-gold/20 rounded-lg shadow-xl backdrop-blur-md overflow-hidden"
          >
            <button
              v-for="language in availableLanguages"
              :key="language"
              @click="selectLanguage(language)"
              class="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-gold hover:bg-white/5 transition-colors font-serif"
              :class="{ 'text-gold bg-white/5': selectedLanguage === language }"
            >
              {{ getLanguageDisplayName(language) }}
            </button>
          </div>
        </transition>
      </div>

      <!-- Overlay to close dropdown when clicking outside -->
      <div 
        v-if="isOpen" 
        @click="isOpen = false"
        class="fixed inset-0 z-[-1]"
      ></div>
    </div>
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
const isOpen = ref(false)

// 語言顯示名稱映射
const languageNames: Record<string, string> = {
  zh: '繁體中文',
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

const selectLanguage = (language: string) => {
  selectedLanguage.value = language
  isOpen.value = false
  handleLanguageChange()
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
  position: relative;
}
</style>