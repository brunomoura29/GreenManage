<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          @click="$emit('close')"
        />

        <!-- Modal Content -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="show"
            class="relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            :class="maxWidthClass"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                {{ title }}
              </h3>
              <button
                @click="$emit('close')"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Slot -->
            <div class="px-6 py-4">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  show: boolean
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  title: '',
  maxWidth: 'md'
})

defineEmits<{ close: [] }>()

const maxWidthClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}[props.maxWidth]))
</script>
