<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">

    <!-- Header com botão de filtros no canto direito -->
    <div class="flex items-start justify-between mb-4 gap-4">
      <div>
        <h3 class="font-bold text-slate-900 dark:text-white">Registros de Medições por Turno</h3>
        <p class="text-xs text-slate-500 mt-1">Visualização de indicadores por turno e data</p>
      </div>

      <!-- Botão discreto de filtros -->
      <div class="relative shrink-0">
        <button
          @click="filtrosAbertos = !filtrosAbertos"
          class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
          :class="filtrosAbertos
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-600'"
          title="Filtros"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
          <span>Filtros</span>
          <!-- Badge de filtros ativos -->
          <span
            v-if="filtrosAtivos > 0"
            class="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold bg-emerald-600 text-white"
          >{{ filtrosAtivos }}</span>
        </button>

        <!-- Painel dropdown -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out origin-top-right"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in origin-top-right"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="filtrosAbertos"
            class="absolute right-0 top-full mt-2 z-20 w-[680px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden"
          >
            <!-- Grid de campos compacto -->
            <div class="px-4 py-3 flex flex-wrap gap-3 items-end">

              <!-- Tipo -->
              <div class="flex flex-col gap-1 min-w-[160px] flex-1">
                <label class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Activity class="w-3 h-3" /> Tipo
                </label>
                <div class="relative">
                  <select
                    v-model="tipoSelecionado"
                    class="w-full appearance-none px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition pr-7"
                  >
                    <option v-for="tipo in TIPOS_ALVO" :key="tipo" :value="tipo">{{ tipo }}</option>
                  </select>
                  <ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <!-- Separador -->
              <div class="h-px w-full sm:h-6 sm:w-px bg-slate-200 dark:bg-slate-700 self-center hidden sm:block" />

              <!-- Dia -->
              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays class="w-3 h-3" /> Dia
                </label>
                <div class="flex items-center gap-0.5">
                  <button
                    @click="navegarDia(-1)"
                    class="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors"
                    title="Dia anterior"
                  >
                    <ChevronLeft class="w-3.5 h-3.5" />
                  </button>
                  <input
                    v-model="dataFiltro"
                    type="date"
                    @change="periodoInicio = ''; periodoFim = ''"
                    class="w-32 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                  />
                  <button
                    @click="navegarDia(1)"
                    :disabled="dataFiltro === hoje"
                    class="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Próximo dia"
                  >
                    <ChevronRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Separador -->
              <div class="h-px w-full sm:h-6 sm:w-px bg-slate-200 dark:bg-slate-700 self-center hidden sm:block" />

              <!-- Período -->
              <div class="flex flex-col gap-1">
                <label class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays class="w-3 h-3" /> Período
                </label>
                <div class="flex items-center gap-1.5">
                  <input
                    v-model="periodoInicio"
                    type="date"
                    :max="periodoFim || hoje"
                    @change="dataFiltro = ''"
                    class="w-32 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                  />
                  <span class="text-[10px] text-slate-400 font-medium">até</span>
                  <input
                    v-model="periodoFim"
                    type="date"
                    :min="periodoInicio"
                    :max="hoje"
                    @change="dataFiltro = ''"
                    class="w-32 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

            </div>

            <!-- Rodapé com tags ativas + limpar -->
            <div v-if="filtrosAtivos > 0" class="px-5 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-wrap items-center gap-2">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Ativos:</span>
              <span
                v-if="dataFiltro"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <CalendarDays class="w-3 h-3" />
                Dia: {{ formatData(dataFiltro) }}
                <button @click="dataFiltro = ''" class="ml-0.5 hover:text-emerald-900"><X class="w-3 h-3" /></button>
              </span>
              <span
                v-if="periodoInicio"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <CalendarDays class="w-3 h-3" />
                De: {{ formatData(periodoInicio) }}
                <button @click="periodoInicio = ''" class="ml-0.5 hover:text-emerald-900"><X class="w-3 h-3" /></button>
              </span>
              <span
                v-if="periodoFim"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <CalendarDays class="w-3 h-3" />
                Até: {{ formatData(periodoFim) }}
                <button @click="periodoFim = ''" class="ml-0.5 hover:text-emerald-900"><X class="w-3 h-3" /></button>
              </span>
              <button
                @click="limparFiltros"
                class="ml-auto inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <X class="w-3.5 h-3.5" /> Limpar tudo
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
      <span class="text-sm text-slate-500">Carregando dados...</span>
    </div>

    <!-- Tabela -->
    <div v-else-if="colunas.length > 0 && linhas.length > 0" class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <th class="py-4 pl-6 whitespace-nowrap min-w-[160px]">Turno</th>
            <th
              v-for="col in colunas"
              :key="col.uniqueId"
              class="py-4 px-3 whitespace-nowrap text-center"
            >
              {{ col.nome }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
          <tr
            v-for="linha in linhas"
            :key="linha.turnoKey"
            class="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
          >
            <!-- Turno -->
            <td class="py-4 pl-6 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="text-base" :title="linha.horaInicio + ' → ' + linha.horaFim">
                  {{ linha.turnoLabel === 'Manhã' ? '🌅' : '🌙' }}
                </span>
                <div>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ linha.turnoLabel }}</span>
                  <!-- Mostra a data quando filtrando por período -->
                  <div v-if="periodoInicio && periodoFim" class="text-[10px] text-slate-400 mt-0.5">
                    {{ linha.dataFormatada }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Valores por indicador -->
            <td
              v-for="col in colunas"
              :key="col.uniqueId"
              class="py-4 px-3 text-center"
            >
              <template v-if="linha.valores[col.uniqueId] !== undefined">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                  {{ formatarValor(linha.valores[col.uniqueId] as number, col.unidade) }}
                </span>
              </template>
              <template v-else>
                <span class="text-slate-300 dark:text-slate-600 text-xs">—</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sem data selecionada -->
    <div
      v-else-if="!loading && !dataFiltro"
      class="flex flex-col items-center gap-3 py-12 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
    >
      <span class="text-3xl">📅</span>
      <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Selecione uma data e um tipo para visualizar os registros</p>
      <p class="text-xs text-slate-400">Use os filtros acima para filtrar por data e tipo de medição</p>
    </div>

    <!-- Sem resultados -->
    <div
      v-else-if="!loading"
      class="flex flex-col items-center gap-2 py-12 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
    >
      <component :is="ActivityIcon" class="w-8 h-8" />
      <p class="text-sm">Nenhum registro encontrado para os filtros selecionados.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Activity as ActivityIcon, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, CalendarDays, X, Activity } from 'lucide-vue-next'
import { useFuncoesKPIDash, TIPOS_ALVO_KPI, formatarValor, formatData } from '~/composables/useFuncoesKPIDash'

const {
  hoje,
  loading,
  tipoSelecionado,
  dataFiltro,
  periodoInicio,
  periodoFim,
  filtrosAbertos,
  filtrosAtivos,
  colunas,
  linhas,
  navegarDia,
  limparFiltros,
} = useFuncoesKPIDash()

// Alias local para o template
const TIPOS_ALVO = TIPOS_ALVO_KPI
</script>

