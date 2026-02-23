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
          @click="$emit('cancel')"
        ></div>

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
            class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div class="p-6">
              <!-- Header with Icon -->
              <div class="flex items-center gap-4 mb-4">
                <div 
                  :class="[
                    'p-3 rounded-xl shrink-0',
                    variant === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  ]"
                >
                  <AlertTriangle v-if="variant === 'danger'" class="w-6 h-6" />
                  <AlertCircle v-else class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {{ title }}
                  </h3>
                </div>
              </div>

              <!-- Message -->
              <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
                {{ message }}
              </p>

              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  @click="$emit('cancel')"
                  class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {{ cancelText }}
                </button>
                <button
                  type="button"
                  @click="$emit('confirm')"
                  :disabled="loading"
                  :class="[
                    'flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-soft active:scale-95 transition-all flex items-center justify-center gap-2',
                    variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600',
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  ]"
                >
                  <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                  {{ confirmText }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, AlertCircle, Loader2 } from 'lucide-vue-next'

interface Props {
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Tem certeza?',
  message: 'Essa ação não poderá ser desfeita.',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'danger',
  loading: false
})

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
