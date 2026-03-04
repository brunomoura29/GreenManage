<template>
  <div class="px-6 md:px-8 pb-4">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">

      <!-- Header do painel de filtros -->
      <button
        @click="aberto = !aberto"
        class="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <SlidersHorizontal class="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">Filtros</span>

          <!-- Badge de filtros ativos -->
          <span
            v-if="filtrosAtivos > 0"
            class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-primary-600 text-white"
          >
            {{ filtrosAtivos }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Botão limpar -->
          <button
            v-if="filtrosAtivos > 0"
            @click.stop="limparFiltros"
            class="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <X class="w-3.5 h-3.5" />
            Limpar
          </button>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': aberto }"
          />
        </div>
      </button>

      <!-- Corpo dos filtros (expansível) -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="aberto" class="border-t border-slate-100 dark:border-slate-800 overflow-hidden">
          <div class="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <!-- Filtro: Data inicial -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays class="w-3.5 h-3.5" />
                Data Inicial
              </label>
              <input
                v-model="filtroDataInicio"
                type="date"
                class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            <!-- Filtro: Data final -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays class="w-3.5 h-3.5" />
                Data Final
              </label>
              <input
                v-model="filtroDataFim"
                type="date"
                class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>

            <!-- Filtro: Tipo de medição -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity class="w-3.5 h-3.5" />
                Tipo de Medição
              </label>
              <div class="relative">
                <select
                  v-model="filtroTipo"
                  class="w-full appearance-none px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition pr-8"
                >
                  <option value="">Todos os tipos</option>
                  <option v-for="tipo in tiposMedicao" :key="tipo" :value="tipo">{{ tipo }}</option>
                </select>
                <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

          </div>

          <!-- Rodapé com tags dos filtros ativos -->
          <div v-if="filtrosAtivos > 0" class="px-5 pb-4 flex flex-wrap gap-2">
            <span
              v-if="filtroDataInicio"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
            >
              <CalendarDays class="w-3 h-3" />
              De: {{ formatData(filtroDataInicio) }}
              <button @click="filtroDataInicio = ''" class="ml-1 hover:text-primary-900 dark:hover:text-primary-100">
                <X class="w-3 h-3" />
              </button>
            </span>

            <span
              v-if="filtroDataFim"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
            >
              <CalendarDays class="w-3 h-3" />
              Até: {{ formatData(filtroDataFim) }}
              <button @click="filtroDataFim = ''" class="ml-1 hover:text-primary-900 dark:hover:text-primary-100">
                <X class="w-3 h-3" />
              </button>
            </span>

            <span
              v-if="filtroTipo"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
            >
              <Activity class="w-3 h-3" />
              {{ filtroTipo }}
              <button @click="filtroTipo = ''" class="ml-1 hover:text-primary-900 dark:hover:text-primary-100">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>

        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SlidersHorizontal, CalendarDays, Activity, ChevronDown, X } from 'lucide-vue-next'
import { MEASUREMENT_TYPES } from '~/composables/useIndicadores'

// Estado
const aberto = ref(false)

// Valores dos filtros internos
const filtroDataInicio = ref('')
const filtroDataFim = ref('')
const filtroTipo = ref('')

// Tipos de medição reutilizando a constante do projeto
const tiposMedicao = MEASUREMENT_TYPES

// Conta filtros ativos
const filtrosAtivos = computed(() => {
  let count = 0
  if (filtroDataInicio.value) count++
  if (filtroDataFim.value) count++
  if (filtroTipo.value) count++
  return count
})

// Emite modelo de filtros para o pai
const emit = defineEmits<{
  'update:filtros': [filtros: {
    dataInicio: string
    dataFim: string
    tipo: string
  }]
}>()

// Sempre que algum filtro mudar, emite para o pai
watch([filtroDataInicio, filtroDataFim, filtroTipo], () => {
  emit('update:filtros', {
    dataInicio: filtroDataInicio.value,
    dataFim: filtroDataFim.value,
    tipo: filtroTipo.value
  })
}, { immediate: true })

function limparFiltros() {
  filtroDataInicio.value = ''
  filtroDataFim.value = ''
  filtroTipo.value = ''
}

function formatData(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
</script>
