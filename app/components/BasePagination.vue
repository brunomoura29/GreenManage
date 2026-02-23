<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none">
    <!-- Resumo dos registros -->
    <div class="text-sm text-slate-500 whitespace-nowrap">
      Mostrando 
      <span class="font-bold text-slate-700 dark:text-slate-300">{{ (rangeStart + 1) }}</span>
      -
      <span class="font-bold text-slate-700 dark:text-slate-300">{{ rangeEnd }}</span>
      de 
      <span class="font-bold text-slate-700 dark:text-slate-300">{{ totalItems.toLocaleString('pt-BR') }}</span> 
      {{ label || 'registros' }}
    </div>

    <!-- Controles de Navegação -->
    <div class="flex items-center gap-1.5">
      <!-- Botão Anterior -->
      <button
        type="button"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Anterior
      </button>

      <!-- Páginas Numéricas -->
      <div class="flex items-center gap-1.5">
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="typeof page === 'number'"
            type="button"
            @click="goToPage(page)"
            :class="[
              'w-10 h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all',
              currentPage === page 
                ? 'bg-[#009366] text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
            ]"
          >
            {{ page }}
          </button>
          <span v-else class="w-8 text-center text-slate-400">...</span>
        </template>
      </div>

      <!-- Botão Próximo -->
      <button
        type="button"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Próximo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'registros'
})

const emit = defineEmits<{
  (e: 'changePage', page: number): void
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage)))

const rangeStart = computed(() => (props.currentPage - 1) * props.itemsPerPage)
const rangeEnd = computed(() => Math.min(props.totalItems, props.currentPage * props.itemsPerPage))

// Lógica para exibir números de página com reticências se houver muitas
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  
  const pages: (number | string)[] = []
  
  // Sempre mostra a primeira
  pages.push(1)
  
  if (current > 4) pages.push('...')
  
  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  if (current < total - 3) pages.push('...')
  
  // Sempre mostra a última
  if (total > 1) {
    pages.push(total)
  }
  
  return pages
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('changePage', page)
  }
}
</script>
