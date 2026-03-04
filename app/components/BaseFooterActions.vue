<template>
  <div class="fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 py-4">
    <div class="flex items-center justify-end gap-3 max-w-full">
      <slot name="extra" />
      <button
        type="button"
        @click="$emit('cancelar')"
        :disabled="salvando"
        class="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {{ labelCancelar }}
      </button>
      <button
        type="submit"
        :disabled="salvando"
        class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft disabled:opacity-50"
      >
        <svg v-if="salvando" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        {{ salvando ? 'Salvando...' : labelSalvar }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  salvando?: boolean
  labelSalvar?: string
  labelCancelar?: string
}>(), {
  salvando: false,
  labelSalvar: 'Salvar',
  labelCancelar: 'Cancelar'
})

defineEmits<{ cancelar: [] }>()
</script>
