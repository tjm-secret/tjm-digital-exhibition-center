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
            class="absolute right-0 top-full mt-2 w-32 overflow-hidden z-50 rounded-lg backdrop-blur-md bg-black/90 border border-white/10 shadow-xl"
          >
            <button
              v-for="code in availableLanguages"
              :key="code"
              @click="selectLanguage(code)"
              class="w-full px-4 py-2 text-left text-sm font-serif transition-colors hover:bg-gold/10"
              :class="selectedLanguage === code ? 'text-gold' : 'text-gray-400 hover:text-gold/80'"
            >
              {{ getLanguageDisplayName(code) }}
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'




// Props
interface Props {
  modelValue?: string
  availableLanguages?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'zh',
  availableLanguages: () => ['zh', 'en', 'ja', 'ko']
})

// Emits
interface Emits {
  (e: 'update:modelValue', lang: string): void
  (e: 'languageChanged', lang: string): void
}

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const selectedLanguage = ref(props.modelValue)

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