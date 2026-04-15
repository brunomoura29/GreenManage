<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">

    <!-- Header -->
    <div class="flex items-start justify-between mb-4 gap-4">
      <div>
        <h3 class="font-bold text-slate-900 dark:text-white">Movimentações de Estoque Químico</h3>
        <!-- Contexto ativo: período e turno -->
        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
          <span class="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <CalendarDays class="w-3.5 h-3.5 text-slate-400" />
            {{ labelPeriodo }}
          </span>
          <span class="text-slate-300 dark:text-slate-600 text-xs">·</span>
          <span class="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock class="w-3.5 h-3.5 text-slate-400" />
            {{ labelTurno }}
          </span>
        </div>
      </div>

      <!-- Toggle Volume / Financeiro + Filtros -->
      <div class="flex items-center gap-2 shrink-0">

        <!-- Toggle pill -->
        <div class="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-0.5">
          <button
            @click="visao = 'volume'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            :class="visao === 'volume'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            <Boxes class="w-3.5 h-3.5" />
            Volume
          </button>
          <button
            @click="visao = 'financeiro'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            :class="visao === 'financeiro'
              ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            <CircleDollarSign class="w-3.5 h-3.5" />
            Financeiro
          </button>
        </div>

        <!-- Botão de filtros -->
        <div class="relative">
          <button
            @click="filtrosAbertos = !filtrosAbertos"
            class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
            :class="filtrosAbertos
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-600'"
          >
            <SlidersHorizontal class="w-3.5 h-3.5" />
            <span>Filtros</span>
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
              class="absolute right-0 top-full mt-2 z-20 w-[700px] max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden"
            >
              <div class="px-4 py-3 flex flex-wrap gap-3 items-end">

                <!-- Turno -->
                <div class="flex flex-col gap-1 min-w-[130px] flex-1">
                  <label class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock class="w-3 h-3" /> Turno
                  </label>
                  <div class="relative">
                    <select
                      v-model="turnoFiltro"
                      class="w-full appearance-none px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition pr-7"
                    >
                      <option value="">Todos os turnos</option>
                      <option value="manha">Manhã</option>
                      <option value="noite">Noite</option>
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
                    >
                      <ChevronLeft class="w-3.5 h-3.5" />
                    </button>
                    <input
                      v-model="dataFiltro"
                      type="date"
                      :max="hoje"
                      @change="periodoInicio = ''; periodoFim = ''"
                      class="w-32 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                    <button
                      @click="navegarDia(1)"
                      :disabled="dataFiltro === hoje"
                      class="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                      @change="dataFiltro = hoje"
                      class="w-32 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                    <span class="text-[10px] text-slate-400 font-medium">até</span>
                    <input
                      v-model="periodoFim"
                      type="date"
                      :min="periodoInicio"
                      :max="hoje"
                      @change="dataFiltro = hoje"
                      class="w-32 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

              </div>

              <!-- Rodapé tags ativas -->
              <div v-if="filtrosAtivos > 0" class="px-5 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-wrap items-center gap-2">
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Ativos:</span>
                <span
                  v-if="dataFiltro !== hoje && !periodoInicio"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <CalendarDays class="w-3 h-3" />
                  Dia: {{ formatData(dataFiltro) }}
                  <button @click="dataFiltro = hoje" class="ml-0.5 hover:text-emerald-900"><X class="w-3 h-3" /></button>
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
                <span
                  v-if="turnoFiltro"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <Clock class="w-3 h-3" />
                  Turno: {{ labelTurno }}
                  <button @click="turnoFiltro = ''" class="ml-0.5 hover:text-emerald-900"><X class="w-3 h-3" /></button>
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
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
      <span class="text-sm text-slate-500">Carregando dados...</span>
    </div>

    <!-- Tabela -->
    <div v-else-if="linhas.length > 0" class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <th class="py-4 pl-6 whitespace-nowrap min-w-[180px]">Produto Químico</th>
            <th class="py-4 px-4 whitespace-nowrap text-center text-slate-500 dark:text-slate-400">
              <div class="flex items-center justify-center gap-1">
                <Package class="w-3.5 h-3.5" />
                {{ visao === 'financeiro' ? 'Valor Anterior' : 'Saldo Anterior' }}
              </div>
            </th>
            <th class="py-4 px-4 whitespace-nowrap text-center text-emerald-600 dark:text-emerald-400">
              <div class="flex items-center justify-center gap-1">
                <ArrowDownCircle class="w-3.5 h-3.5" />
                Entrada
              </div>
            </th>
            <th class="py-4 px-4 whitespace-nowrap text-center text-amber-600 dark:text-amber-400">
              <div class="flex items-center justify-center gap-1">
                <ArrowUpCircle class="w-3.5 h-3.5" />
                Consumo
              </div>
            </th>
            <th class="py-4 px-4 whitespace-nowrap text-center text-blue-600 dark:text-blue-400">
              <div class="flex items-center justify-center gap-1">
                <RefreshCw class="w-3.5 h-3.5" />
                Ajuste
              </div>
            </th>
            <th class="py-4 px-4 pr-6 whitespace-nowrap text-center text-slate-700 dark:text-slate-300">
              <div class="flex items-center justify-center gap-1">
                <Package class="w-3.5 h-3.5" />
                {{ visao === 'financeiro' ? 'Valor em Estoque' : 'Saldo Atual' }}
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
          <tr
            v-for="linha in linhas"
            :key="linha.insumoId"
            class="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
          >
            <!-- Produto -->
            <td class="py-4 pl-6 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <FlaskConical class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ linha.nome }}</span>
                  <div v-if="linha.unidade && visao === 'volume'" class="text-[10px] text-slate-400 mt-0.5">{{ linha.unidade }}</div>
                  <div v-if="visao === 'financeiro'" class="text-[10px] text-slate-400 mt-0.5">R$</div>
                </div>
              </div>
            </td>

            <!-- Saldo Anterior -->
            <td class="py-4 px-4 text-center">
              <template v-if="visao === 'volume'">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-700/40 dark:text-slate-400 dark:border-slate-600">
                  {{ formatarQtd(linha.saldoAnterior, linha.unidade) }}
                </span>
              </template>
              <template v-else>
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-700/40 dark:text-slate-400 dark:border-slate-600">
                  {{ formatarReais(linha.valorAnterior) }}
                </span>
              </template>
            </td>

            <!-- Entrada -->
            <td class="py-4 px-4 text-center">
              <template v-if="visao === 'volume'">
                <span v-if="linha.entrada > 0" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                  +{{ formatarQtd(linha.entrada, linha.unidade) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
              </template>
              <template v-else>
                <span v-if="linha.custoEntrada > 0" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                  +{{ formatarReais(linha.custoEntrada) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
              </template>
            </td>

            <!-- Consumo -->
            <td class="py-4 px-4 text-center">
              <template v-if="visao === 'volume'">
                <span v-if="linha.consumo > 0" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                  -{{ formatarQtd(linha.consumo, linha.unidade) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
              </template>
              <template v-else>
                <span v-if="linha.custoConsumo > 0" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                  -{{ formatarReais(linha.custoConsumo) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
              </template>
            </td>

            <!-- Ajuste -->
            <td class="py-4 px-4 text-center">
              <template v-if="visao === 'volume'">
                <span
                  v-if="linha.ajuste !== 0"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="linha.ajuste > 0
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'"
                >
                  {{ linha.ajuste > 0 ? '+' : '' }}{{ formatarQtd(linha.ajuste, linha.unidade) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
              </template>
              <template v-else>
                <span
                  v-if="linha.custoAjuste !== 0"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="linha.custoAjuste > 0
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'"
                >
                  {{ linha.custoAjuste > 0 ? '+' : '' }}{{ formatarReais(linha.custoAjuste) }}
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
              </template>
            </td>

            <!-- Saldo / Valor em estoque -->
            <td class="py-4 px-4 pr-6 text-center">
              <template v-if="visao === 'volume'">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="linha.saldoAtual > 0
                    ? 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:border-slate-600'
                    : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'"
                >
                  {{ formatarQtd(linha.saldoAtual, linha.unidade) }}
                </span>
              </template>
              <template v-else>
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="linha.valorEstoqueAtual > 0
                    ? 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:border-slate-600'
                    : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'"
                >
                  {{ formatarReais(linha.valorEstoqueAtual) }}
                </span>
              </template>
            </td>
          </tr>
        </tbody>

        <!-- Totais -->
        <tfoot>
          <tr class="bg-slate-50 dark:bg-slate-800/80 border-t-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
            <td class="py-3 pl-6">{{ periodoInicio && periodoFim ? 'Total do período' : 'Total do dia' }}</td>
            <td class="py-3 px-4 text-center text-slate-500 dark:text-slate-400">
              {{ visao === 'financeiro' ? formatarReais(totalSaldoAnterior) : formatarQtd(totalSaldoAnterior, '') }}
            </td>
            <td class="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400">
              <span v-if="totalEntrada > 0">+{{ visao === 'financeiro' ? formatarReais(totalEntrada) : totalEntrada.toFixed(2) }}</span>
              <span v-else class="text-slate-300 dark:text-slate-600 font-normal">—</span>
            </td>
            <td class="py-3 px-4 text-center text-amber-600 dark:text-amber-400">
              <span v-if="totalConsumo > 0">-{{ visao === 'financeiro' ? formatarReais(totalConsumo) : totalConsumo.toFixed(2) }}</span>
              <span v-else class="text-slate-300 dark:text-slate-600 font-normal">—</span>
            </td>
            <td class="py-3 px-4 text-center text-blue-600 dark:text-blue-400">
              <span v-if="totalAjuste !== 0">{{ totalAjuste > 0 ? '+' : '' }}{{ visao === 'financeiro' ? formatarReais(totalAjuste) : totalAjuste.toFixed(2) }}</span>
              <span v-else class="text-slate-300 dark:text-slate-600 font-normal">—</span>
            </td>
            <td class="py-3 px-4 pr-6 text-center text-slate-700 dark:text-slate-200">
              {{ visao === 'financeiro' ? formatarReais(totalSaldo) : formatarQtd(totalSaldo, '') }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Sem resultados -->
    <div
      v-else
      class="flex flex-col items-center gap-3 py-12 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
    >
      <FlaskConical class="w-8 h-8" />
      <p class="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhuma movimentação encontrada</p>
      <p class="text-xs text-slate-400">{{ labelPeriodo }} {{ turnoFiltro ? '· ' + labelTurno : '' }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  SlidersHorizontal, CalendarDays, ChevronLeft, ChevronRight, ChevronDown,
  X, Clock, ArrowDownCircle, ArrowUpCircle, RefreshCw, Package,
  FlaskConical, Boxes, CircleDollarSign
} from 'lucide-vue-next'
import { useEstoqueQuimicos } from '~/composables/useEstoqueQuimicos'

const {
  hoje,
  loading,
  visao,
  dataFiltro,
  periodoInicio,
  periodoFim,
  turnoFiltro,
  filtrosAbertos,
  filtrosAtivos,
  labelPeriodo,
  labelTurno,
  linhas,
  totalSaldoAnterior,
  totalEntrada,
  totalConsumo,
  totalAjuste,
  totalSaldo,
  navegarDia,
  limparFiltros,
  formatData,
} = useEstoqueQuimicos()

function formatarQtd(valor: number, unidade: string): string {
  const num = Number.isInteger(valor) ? valor : valor.toFixed(2)
  return unidade ? `${num} ${unidade}` : String(num)
}

function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>
