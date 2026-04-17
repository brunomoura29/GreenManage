<template>
  <div class="space-y-4">

    <!-- ── Barra de ações ──────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-3">
      <!-- Resumo dos filtros ativos -->
      <div class="flex items-center gap-2 flex-wrap">
        <span v-if="filtrosAtivos.length === 0" class="text-xs text-slate-400 dark:text-slate-500">
          Sem filtros ativos — exibindo todos os registros
        </span>
        <template v-else>
          <span
            v-for="f in filtrosAtivos"
            :key="f.key"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {{ f.label }}
            <button @click="removerFiltro(f.key)" class="hover:text-primary-700 transition-colors">
              <X class="w-3 h-3" />
            </button>
          </span>
        </template>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
          {{ total }} registro{{ total !== 1 ? 's' : '' }}
        </span>

        <!-- Exportar -->
        <div class="flex items-center gap-1">
          <button
            @click="handleExportar('txt')"
            :disabled="loadingExport || total === 0"
            title="Exportar TXT"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loadingExport" class="w-4 h-4 animate-spin" />
            <FileDown v-else class="w-4 h-4" />
            TXT
          </button>
          <button
            @click="handleExportar('xlsx')"
            :disabled="loadingExport || total === 0"
            title="Exportar XLSX"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loadingExport" class="w-4 h-4 animate-spin" />
            <FileDown v-else class="w-4 h-4" />
            XLSX
          </button>
        </div>

        <button
          @click="filtrosVisiveis = !filtrosVisiveis"
          class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition"
          :class="filtrosVisiveis
            ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
        >
          <SlidersHorizontal class="w-4 h-4" />
          Filtros
          <span v-if="filtrosAtivos.length > 0" class="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {{ filtrosAtivos.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Painel de filtros (colapsável) ─────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="filtrosVisiveis" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

          <!-- Data início -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Data recebida (de)</label>
            <input
              v-model="filtroLocal.dataInicio"
              type="date"
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <!-- Data fim -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Data recebida (até)</label>
            <input
              v-model="filtroLocal.dataFim"
              type="date"
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <!-- Classe -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Classe</label>
            <select
              v-model="filtroLocal.classe"
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            >
              <option :value="null">Todas</option>
              <option value="Classe I">Classe I</option>
              <option value="Classe II">Classe II</option>
            </select>
          </div>

          <!-- Transportadora – dropdown busca -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Transportadora</label>
            <div class="relative" ref="refTransportadora">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  v-model="transportadoraBusca"
                  type="text"
                  placeholder="Buscar transportadora..."
                  @focus="transportadoraAberta = true"
                  @input="filtrarTransportadoras"
                  class="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <button
                  v-if="filtroLocal.transportadoraId"
                  type="button"
                  @click="limparTransportadora"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <div
                v-if="transportadoraAberta && transportadorasFiltradas.length > 0"
                class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
              >
                <button
                  v-for="t in transportadorasFiltradas"
                  :key="t.id"
                  type="button"
                  @click="selecionarTransportadora(t)"
                  class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Building2 class="w-4 h-4 text-slate-400 shrink-0" />
                  <span class="font-medium text-slate-900 dark:text-white truncate">{{ t.nome_fantasia ?? t.razao_social }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Cliente / Gerador – dropdown busca -->
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400">Cliente / Gerador</label>
            <div class="relative" ref="refCliente">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  v-model="clienteBusca"
                  type="text"
                  placeholder="Buscar cliente..."
                  @focus="clienteAberto = true"
                  @input="filtrarClientes"
                  class="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <button
                  v-if="filtroLocal.clienteId"
                  type="button"
                  @click="limparCliente"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <div
                v-if="clienteAberto && clientesFiltrados.length > 0"
                class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
              >
                <button
                  v-for="c in clientesFiltrados"
                  :key="c.id"
                  type="button"
                  @click="selecionarCliente(c)"
                  class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Users class="w-4 h-4 text-slate-400 shrink-0" />
                  <span class="font-medium text-slate-900 dark:text-white truncate">{{ c.nome_fantasia ?? c.razao_social }}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Botões -->
        <div class="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            @click="aplicar"
            :disabled="loading"
            class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 transition disabled:opacity-60"
          >
            <Search class="w-4 h-4" />
            Filtrar
          </button>
          <button
            @click="limpar"
            :disabled="loading"
            class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60"
          >
            <X class="w-4 h-4" />
            Limpar tudo
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── Tabela ───────────────────────────────────────────────────────────── -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loader2 class="w-6 h-6 text-primary animate-spin" />
      </div>

      <div v-else-if="registros.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <ClipboardList class="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Nenhum registro encontrado</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Ajuste os filtros ou registre novas entradas</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Dt. Recebida</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Dt. Coletada</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Descarga</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">MTR SINIR</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">MTRs Transportadora</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">NF</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Placa</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Motorista</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Transportadora</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Cliente / Gerador</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Cód. SINIR</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap max-w-[180px]">Descrição</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Tipo Efluente</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Classe</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Qtd. m³</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="row in registros"
              :key="row.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ formatData(row.data_recebida) }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ formatData(row.data_coletada) }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ row.descarga ?? '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span v-if="row.mtr_sinir" class="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  {{ row.mtr_sinir }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <template v-if="row.mtrs_transportadora && row.mtrs_transportadora.length > 0">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="mtr in row.mtrs_transportadora"
                      :key="mtr"
                      class="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300"
                    >{{ mtr }}</span>
                  </div>
                </template>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ row.nota_fiscal ?? '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span v-if="row.placa_do_carro" class="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  {{ row.placa_do_carro }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ row.motorista ?? '—' }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ row.transportadora ?? '—' }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ row.cliente ?? '—' }}</td>
              <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{{ row.codigo_sinir ?? '—' }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[180px] truncate" :title="row.descricao_residuo ?? ''">
                {{ row.descricao_residuo ?? '—' }}
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ row.tipo_de_efluente ?? '—' }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span
                  v-if="row.classe"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="row.classe === 'Classe I'
                    ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400'
                    : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'"
                >
                  {{ row.classe }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-4 py-3 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">
                {{ row.qtd != null ? Number(row.qtd).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—' }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <td colspan="14" class="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 text-right font-medium">
                Total da página:
              </td>
              <td class="px-4 py-2.5 text-right text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                {{ totalPagina.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} m³
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ── Paginação ────────────────────────────────────────────────────────── -->
    <div v-if="!loading && registros.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Exibindo
        <span class="font-medium text-slate-700 dark:text-slate-300">{{ inicioRegistro }}–{{ fimRegistro }}</span>
        de
        <span class="font-medium text-slate-700 dark:text-slate-300">{{ total }}</span>
        registros
      </p>

      <div class="flex items-center gap-1">
        <button @click="irPara(1)" :disabled="!temAnterior || loading"
          class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <ChevronsLeft class="w-4 h-4" />
        </button>
        <button @click="irPara(pagina - 1)" :disabled="!temAnterior || loading"
          class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <ChevronLeft class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-1">
          <button
            v-for="p in paginasVisiveis"
            :key="p"
            @click="typeof p === 'number' && irPara(p)"
            :disabled="loading || p === '...'"
            class="min-w-[32px] h-8 px-2 text-sm rounded-lg border transition"
            :class="p === pagina
              ? 'border-primary bg-primary text-white font-medium'
              : p === '...'
                ? 'border-transparent text-slate-400 cursor-default'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
          >
            {{ p }}
          </button>
        </div>

        <button @click="irPara(pagina + 1)" :disabled="!temProxima || loading"
          class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <ChevronRight class="w-4 h-4" />
        </button>
        <button @click="irPara(totalPaginas)" :disabled="!temProxima || loading"
          class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <ChevronsRight class="w-4 h-4" />
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Search, X, Loader2, ClipboardList, SlidersHorizontal,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Building2, Users, FileDown,
} from 'lucide-vue-next'
import { useRelatorioEntradasResiduos } from '~/composables/useRelatorioEntradasResiduos'
import { useExportacaoRelatorio } from '~/composables/useExportacaoRelatorio'
import { useTransportadoras } from '~/composables/useTransportadoras'
import { useClientes } from '~/composables/useClientes'
import type { Transportadora } from '~/types/transportadora'
import type { Cliente } from '~/types/cliente'

const {
  registros, total, pagina, totalPaginas,
  temAnterior, temProxima, loading, loadingExport,
  fetchPagina, aplicarFiltros, limparFiltros, irPara,
  exportarTodos, POR_PAGINA,
} = useRelatorioEntradasResiduos()

const { exportarTxt, exportarXlsx } = useExportacaoRelatorio()

async function handleExportar(formato: 'txt' | 'xlsx') {
  const dados = await exportarTodos()
  if (formato === 'txt') exportarTxt(dados)
  else exportarXlsx(dados)
}

const { transportadoras, fetchTransportadoras } = useTransportadoras()
const { clientes, fetchClientes } = useClientes()

// ── Filtro local (form) ────────────────────────────────────────────────────

const filtrosVisiveis = ref(false)

const filtroLocal = ref({
  dataInicio:        null as string | null,
  dataFim:           null as string | null,
  classe:            null as string | null,
  transportadoraId:  null as string | null,
  transportadoraNome: null as string | null,
  clienteId:         null as string | null,
  clienteNome:       null as string | null,
})

// ── Dropdown – Transportadora ─────────────────────────────────────────────

const transportadoraBusca     = ref('')
const transportadoraAberta    = ref(false)
const transportadorasFiltradas = ref<Transportadora[]>([])
const refTransportadora       = ref<HTMLElement | null>(null)

function filtrarTransportadoras() {
  const q = transportadoraBusca.value.toLowerCase()
  transportadorasFiltradas.value = q.length < 1
    ? transportadoras.value.slice(0, 8)
    : transportadoras.value.filter(t =>
        t.nome_fantasia?.toLowerCase().includes(q) ||
        t.razao_social?.toLowerCase().includes(q)
      ).slice(0, 8)
}

function selecionarTransportadora(t: Transportadora) {
  filtroLocal.value.transportadoraId   = t.unique_id ?? null
  filtroLocal.value.transportadoraNome = t.nome_fantasia ?? t.razao_social ?? ''
  transportadoraBusca.value  = t.nome_fantasia ?? t.razao_social ?? ''
  transportadoraAberta.value = false
}

function limparTransportadora() {
  filtroLocal.value.transportadoraId   = null
  filtroLocal.value.transportadoraNome = null
  transportadoraBusca.value = ''
}

// ── Dropdown – Cliente ────────────────────────────────────────────────────

const clienteBusca    = ref('')
const clienteAberto   = ref(false)
const clientesFiltrados = ref<Cliente[]>([])
const refCliente      = ref<HTMLElement | null>(null)

function filtrarClientes() {
  const q = clienteBusca.value.toLowerCase()
  clientesFiltrados.value = q.length < 1
    ? clientes.value.slice(0, 8)
    : clientes.value.filter(c =>
        c.nome_fantasia?.toLowerCase().includes(q) ||
        c.razao_social?.toLowerCase().includes(q) ||
        c.document?.includes(q)
      ).slice(0, 8)
}

function selecionarCliente(c: Cliente) {
  filtroLocal.value.clienteId   = c.unique_id ?? null
  filtroLocal.value.clienteNome = c.nome_fantasia ?? c.razao_social ?? ''
  clienteBusca.value  = c.nome_fantasia ?? c.razao_social ?? ''
  clienteAberto.value = false
}

function limparCliente() {
  filtroLocal.value.clienteId   = null
  filtroLocal.value.clienteNome = null
  clienteBusca.value = ''
}

// ── Fechar dropdowns ao clicar fora ──────────────────────────────────────

function fecharDropdowns(e: MouseEvent) {
  const target = e.target as Node
  if (!refTransportadora.value?.contains(target)) transportadoraAberta.value = false
  if (!refCliente.value?.contains(target))        clienteAberto.value        = false
}

// ── Aplicar / limpar filtros ──────────────────────────────────────────────

async function aplicar() {
  await aplicarFiltros({
    dataInicio:    filtroLocal.value.dataInicio,
    dataFim:       filtroLocal.value.dataFim,
    classe:        filtroLocal.value.classe,
    transportadora: filtroLocal.value.transportadoraNome,
    cliente:       filtroLocal.value.clienteNome,
  })
  filtrosVisiveis.value = false
}

async function limpar() {
  filtroLocal.value = {
    dataInicio: null, dataFim: null, classe: null,
    transportadoraId: null, transportadoraNome: null,
    clienteId: null, clienteNome: null,
  }
  transportadoraBusca.value = ''
  clienteBusca.value = ''
  await limparFiltros()
  filtrosVisiveis.value = false
}

function removerFiltro(key: string) {
  if (key === 'dataInicio')    filtroLocal.value.dataInicio = null
  if (key === 'dataFim')       filtroLocal.value.dataFim = null
  if (key === 'classe')        filtroLocal.value.classe = null
  if (key === 'transportadora') { limparTransportadora() }
  if (key === 'cliente')       { limparCliente() }
  aplicar()
}

// ── Filtros ativos (badges) ───────────────────────────────────────────────

const filtrosAtivos = computed(() => {
  const f = filtroLocal.value
  const ativos: { key: string; label: string }[] = []
  if (f.dataInicio)        ativos.push({ key: 'dataInicio',    label: `De: ${formatData(f.dataInicio)}` })
  if (f.dataFim)           ativos.push({ key: 'dataFim',       label: `Até: ${formatData(f.dataFim)}` })
  if (f.classe)            ativos.push({ key: 'classe',        label: f.classe })
  if (f.transportadoraNome) ativos.push({ key: 'transportadora', label: f.transportadoraNome })
  if (f.clienteNome)       ativos.push({ key: 'cliente',       label: f.clienteNome })
  return ativos
})

// ── Computed helpers ───────────────────────────────────────────────────────

const inicioRegistro = computed(() => Math.min((pagina.value - 1) * POR_PAGINA + 1, total.value))
const fimRegistro    = computed(() => Math.min(pagina.value * POR_PAGINA, total.value))

const totalPagina = computed(() =>
  registros.value.reduce((acc, r) => acc + (Number(r.qtd) || 0), 0)
)

const paginasVisiveis = computed<(number | '...')[]>(() => {
  const t = totalPaginas.value
  const p = pagina.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (p > 3) pages.push('...')
  for (let i = Math.max(2, p - 1); i <= Math.min(t - 1, p + 1); i++) pages.push(i)
  if (p < t - 2) pages.push('...')
  pages.push(t)
  return pages
})

function formatData(iso: string | null): string {
  if (!iso) return '—'
  const d = iso.substring(0, 10)
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return iso
  return `${day}/${m}/${y}`
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(async () => {
  document.addEventListener('mousedown', fecharDropdowns)
  await Promise.all([fetchTransportadoras(), fetchClientes(), fetchPagina(1)])
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', fecharDropdowns)
})
</script>
