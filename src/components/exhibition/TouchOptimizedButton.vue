<template>
  <button
    :class="[
      'touch-optimized-button',
      'relative overflow-hidden',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
      // 確保觸控友好的最小尺寸 (44px x 44px)
      sizeClasses,
      // 觸控回饋效果
      'active:scale-95',
      // 自定義樣式
      buttonClasses,
      // 禁用狀態
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="disabled"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
    v-bind="$attrs"
  >
    <!-- 觸控回饋漣漪效果 -->
    <div
      v-if="showRipple"
      :class="[
        'absolute inset-0 pointer-events-none',
        'bg-white bg-opacity-30 rounded-full',
        'animate-ping'
      ]"
      :style="rippleStyle"
    ></div>
    
    <!-- 按鈕內容 -->
    <div class="relative z-10 flex items-center justify-center h-full w-full">
      <slot />
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  /** 按鈕尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 按鈕變體 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否為圓形按鈕 */
  rounded?: boolean
  /** 自定義類別 */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'primary',
  disabled: false,
  rounded: false,
  class: ''
})

// Emits
interface Emits {
  (e: 'click', event: MouseEvent): void
  (e: 'touch-start', event: TouchEvent): void
  (e: 'touch-end', event: TouchEvent): void
}

const emit = defineEmits<Emits>()

// 響應式狀態
const showRipple = ref(false)
const rippleStyle = ref({})
const touchStartTime = ref(0)

// 計算屬性
const sizeClasses = computed(() => {
  const sizes = {
    small: 'min-w-[44px] min-h-[44px] px-3 py-2 text-sm',
    medium: 'min-w-[48px] min-h-[48px] px-4 py-3 text-base',
    large: 'min-w-[56px] min-h-[56px] px-6 py-4 text-lg'
  }
  
  const roundedSizes = {
    small: 'w-11 h-11',
    medium: 'w-12 h-12',
    large: 'w-14 h-14'
  }
  
  if (props.rounded) {
    return `${roundedSizes[props.size]} rounded-full`
  }
  
  return `${sizes[props.size]} rounded-lg`
})

const buttonClasses = computed(() => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 border border-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-md hover:shadow-lg'
  }
  
  return `${variants[props.variant]} ${props.class}`
})

// 方法
const handleClick = (event: MouseEvent) => {
  if (props.disabled) return
  emit('click', event)
}

const handleTouchStart = (event: TouchEvent) => {
  if (props.disabled) return
  
  touchStartTime.value = Date.now()
  
  // 創建漣漪效果
  const touch = event.touches[0]
  if (!touch) return

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  
  rippleStyle.value = {
    left: `${x - 10}px`,
    top: `${y - 10}px`,
    width: '20px',
    height: '20px'
  }
  
  showRipple.value = true
  
  // 自動隱藏漣漪效果
  setTimeout(() => {
    showRipple.value = false
  }, 600)
  
  emit('touch-start', event)
}

const handleTouchEnd = (event: TouchEvent) => {
  if (props.disabled) return
  
  const touchDuration = Date.now() - touchStartTime.value
  
  // 如果觸控時間太短，可能是意外觸碰
  if (touchDuration < 50) {
    return
  }
  
  emit('touch-end', event)
}

const handleTouchCancel = () => {
  showRipple.value = false
}
</script>

<style scoped>
.touch-optimized-button {
  /* 確保按鈕有足夠的觸控區域 */
  min-width: 44px;
  min-height: 44px;
  
  /* 防止文字選取 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  /* 防止觸控時的高亮效果 */
  -webkit-tap-highlight-color: transparent;
  
  /* 改善觸控回應 */
  touch-action: manipulation;
}

/* 觸控裝置特定樣式 */
@media (hover: none) and (pointer: coarse) {
  .touch-optimized-button {
    /* 在觸控裝置上增加間距 */
    margin: 2px;
  }
  
  .touch-optimized-button:hover {
    /* 禁用觸控裝置上的 hover 效果 */
    transform: none;
  }
}

/* 高解析度螢幕優化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .touch-optimized-button {
    /* 在高解析度螢幕上微調邊框 */
    border-width: 0.5px;
  }
}

/* 動畫優化 */
.touch-optimized-button {
  will-change: transform;
}

/* 無障礙優化 */
.touch-optimized-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 減少動畫的使用者偏好 */
@media (prefers-reduced-motion: reduce) {
  .touch-optimized-button {
    transition: none;
  }
  
  .touch-optimized-button .animate-ping {
    animation: none;
  }
}
</style>