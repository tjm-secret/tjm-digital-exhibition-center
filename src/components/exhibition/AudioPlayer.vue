<template>
  <div class="audio-player bg-zinc-900/50 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
    <div class="flex items-center space-x-4">
      <!-- Play/Pause Button -->
      <button 
        @click="togglePlay"
        class="w-12 h-12 flex items-center justify-center rounded-full bg-gold text-black hover:bg-gold-light transition-colors shadow-[0_0_15px_rgba(207,181,59,0.3)] flex-shrink-0"
        :aria-label="isPlaying ? '暫停語音導覽' : '播放語音導覽'"
      >
        <transition name="scale" mode="out-in">
          <svg v-if="isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
          <svg v-else class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
             <path d="M8 5v14l11-7z"/>
          </svg>
        </transition>
      </button>

      <!-- Progress Bar & Time -->
      <div class="flex-1 min-w-0 flex flex-col justify-center">
         <!-- Title for small screens or inside player context if needed -->
         <div v-if="title" class="text-xs text-gold/80 mb-1 truncate block md:hidden">
            {{ title }}
         </div>

         <div class="relative h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group" @click="handleSeek">
            <!-- Progress Track -->
            <div 
              class="absolute top-0 left-0 h-full bg-gold transition-all duration-100 ease-linear group-hover:bg-gold-light"
              :style="{ width: `${progress}%` }"
            ></div>
         </div>
         
         <div class="flex justify-between text-xs text-gray-400 mt-1 font-mono">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
         </div>
      </div>
      
       <!-- Volume/Mute Toggle (Optional, keeping simple for now) -->
       <button @click="toggleMute" class="text-gray-400 hover:text-white transition-colors p-2">
          <svg v-if="isMuted" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9l4 4m0-4l-4 4" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
       </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isPlaying: boolean
  currentTime: number
  duration: number
  isMuted?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isMuted: false
})

interface Emits {
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'seek', time: number): void
  (e: 'toggleContent'): void // Reusing existing prop name or logic if needed, but here focusing on player
  (e: 'toggleMute'): void
}

const emit = defineEmits<Emits>()

const progress = computed(() => {
  if (!props.duration) return 0
  return Math.min(100, (props.currentTime / props.duration) * 100)
})

const togglePlay = () => {
  if (props.isPlaying) {
    emit('pause')
  } else {
    emit('play')
  }
}

const toggleMute = () => {
  emit('toggleMute')
}

const handleSeek = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percentage = x / rect.width
  const seekTime = percentage * props.duration
  emit('seek', seekTime)
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
