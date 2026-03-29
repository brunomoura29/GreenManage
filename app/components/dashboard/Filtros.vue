<template>
  <div class="flex items-center gap-2 flex-wrap">

    <!-- Filtro de período -->
    <div class="relative" ref="refPeriodo">
      <button
        type="button"
        @click="periodoAberto = !periodoAberto"
        class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors"
        :class="periodoAberto
          ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:text-primary'"
      >
        <CalendarDays class="w-4 h-4" />
        <span>{{ periodoLabel }}</span>
        <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="periodoAberto ? 'rotate-180' : ''" />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-1"
      >
        <div
          v-if="periodoAberto"
          class="absolute z-30 top-full mt-1 left-0 w-52 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg origin-top-left"
        >
          <div class="p-1">
            <button
              v-for="opt in periodoOpcoes"
              :key="opt.valor"
              type="button"
              @click="selecionarPeriodo(opt.valor)"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors text-left"
              :class="periodo === opt.valor
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
            >
              <Check v-if="periodo === opt.valor" class="w-3.5 h-3.5 shrink-0" />
              <span v-else class="w-3.5 shrink-0" />
              {{ opt.label }}
            </button>
          </div>

          <!-- Intervalo personalizado -->
          <div v-if="periodo === 'intervalo'" class="border-t border-slate-100 dark:border-slate-800 p-3 space-y-2.5">
            <div>
              <label class="text-xs text-slate-500 dark:text-slate-400 mb-1 block">De</label>
              <input
                v-model="intervaloInicio"
                type="date"
                class="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label class="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Até</label>
              <input
                v-model="intervaloFim"
                type="date"
                class="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              type="button"
              @click="periodoAberto = false"
              class="w-full px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Filtros (cliente / tipo resíduo / transportadora) -->
    <div class="relative" ref="refFiltros">
      <button
        type="button"
        @click="filtrosAberto = !filtrosAberto"
        class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors"
        :class="filtrosAberto || temFiltrosAtivos
          ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:text-primary'"
      >
        <SlidersHorizontal class="w-4 h-4" />
        <span>Filtros</span>
        <span
          v-if="totalFiltrosAtivos > 0"
          class="flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full bg-primary text-white"
        >
          {{ totalFiltrosAtivos }}
        </span>
        <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="filtrosAberto ? 'rotate-180' : ''" />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-1"
      >
        <div
          v-if="filtrosAberto"
          class="absolute z-30 top-full mt-1 left-0 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg origin-top-left"
        >
          <div class="p-4 space-y-4">

            <!-- Cliente -->
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Cliente</label>
              <div class="relative">
                <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  v-model="clienteBusca"
                  type="text"
                  placeholder="Buscar cliente..."
                  @focus="clienteListaAberta = true"
                  class="w-full pl-8 pr-7 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  v-if="clienteId"
                  type="button"
                  @click="limparCliente"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <div v-if="clienteListaAberta && clientesFiltrados.length > 0" class="mt-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div class="max-h-36 overflow-y-auto scrollbar-green">
                  <button
                    v-for="c in clientesFiltrados"
                    :key="c.id"
                    type="button"
                    @click="selecionarCliente(c)"
                    class="w-full text-left px-3 py-2 text-sm transition-colors"
                    :class="clienteId === c.unique_id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
                  >
                    {{ c.nome_fantasia ?? c.razao_social ?? '—' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Tipo de Resíduo -->
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Tipo de Resíduo</label>
              <div class="relative">
                <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  v-model="tipoResiduoBusca"
                  type="text"
                  placeholder="Buscar tipo de resíduo..."
                  @focus="tipoListaAberta = true"
                  class="w-full pl-8 pr-7 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  v-if="tipoResiduoId"
                  type="button"
                  @click="limparTipo"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <div v-if="tipoListaAberta && tiposFiltrados.length > 0" class="mt-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div class="max-h-36 overflow-y-auto scrollbar-green">
                  <button
                    v-for="t in tiposFiltrados"
                    :key="t.id"
                    type="button"
                    @click="selecionarTipo(t)"
                    class="w-full text-left px-3 py-2 text-sm transition-colors"
                    :class="tipoResiduoId === t.unique_id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
                  >
                    {{ t.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Transportadora -->
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Transportadora</label>
              <div class="relative">
                <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  v-model="transportadoraBusca"
                  type="text"
                  placeholder="Buscar transportadora..."
                  @focus="transpListaAberta = true"
                  class="w-full pl-8 pr-7 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  v-if="transportadoraId"
                  type="button"
                  @click="limparTransportadora"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <div v-if="transpListaAberta && transportadorasFiltradas.length > 0" class="mt-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div class="max-h-36 overflow-y-auto scrollbar-green">
                  <button
                    v-for="t in transportadorasFiltradas"
                    :key="t.id"
                    type="button"
                    @click="selecionarTransportadora(t)"
                    class="w-full text-left px-3 py-2 text-sm transition-colors"
                    :class="transportadoraId === t.unique_id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
                  >
                    {{ t.nome_fantasia ?? '—' }}
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div class="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="handleLimpar"
              class="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Limpar filtros
            </button>
            <button
              type="button"
              @click="handleAplicarFiltros"
              class="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Atualizar -->
    <button
      type="button"
      @click="handleAtualizar"
      class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
    >
      <RefreshCw class="w-4 h-4 transition-transform duration-700" :class="girando ? 'animate-spin' : ''" />
      <span>{{ tempoAtualizado }}</span>
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { CalendarDays, ChevronDown, SlidersHorizontal, RefreshCw, Check, Search, X } from 'lucide-vue-next'
import { useClientes } from '~/composables/useClientes'
import { useTiposResiduos } from '~/composables/useTiposResiduos'
import { useTransportadoras } from '~/composables/useTransportadoras'
import type { Cliente } from '~/types/cliente'
import type { TipoResiduo } from '~/types/tipoResiduo'
import type { Transportadora } from '~/types/transportadora'

const {
  periodo, periodoLabel, periodoOpcoes,
  intervaloInicio, intervaloFim,
  clienteId, tipoResiduoId, transportadoraId,
  ultimaAtualizacao, atualizar, aplicarFiltros, limparFiltros,
} = useDashboardFiltros()

const { clientes, fetchClientes } = useClientes()
const { tiposResiduos, fetchTiposResiduos } = useTiposResiduos()
const { transportadoras, fetchTransportadoras } = useTransportadoras()

onMounted(() => {
  fetchClientes()
  fetchTiposResiduos()
  fetchTransportadoras()
})

// ── Dropdowns de período e painel ─────────────────────────────────────────────

const periodoAberto = ref(false)
const filtrosAberto = ref(false)
const refPeriodo = ref<HTMLElement | null>(null)
const refFiltros = ref<HTMLElement | null>(null)

function fecharDropdowns(e: MouseEvent) {
  const t = e.target as Node
  if (!refPeriodo.value?.contains(t)) periodoAberto.value = false
  if (!refFiltros.value?.contains(t)) {
    filtrosAberto.value = false
    clienteListaAberta.value = false
    tipoListaAberta.value = false
    transpListaAberta.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', fecharDropdowns))
onBeforeUnmount(() => document.removeEventListener('mousedown', fecharDropdowns))

function selecionarPeriodo(valor: typeof periodo.value) {
  periodo.value = valor
  if (valor !== 'intervalo') periodoAberto.value = false
  atualizar()
}

// ── Busca — Cliente ───────────────────────────────────────────────────────────

const clienteBusca = ref('')
const clienteListaAberta = ref(false)

const clientesFiltrados = computed(() => {
  const q = clienteBusca.value.toLowerCase()
  return clientes.value
    .filter(c => !q || (c.nome_fantasia ?? c.razao_social ?? '').toLowerCase().includes(q))
    .slice(0, 20)
})

function selecionarCliente(c: Cliente) {
  clienteId.value = c.unique_id ?? null
  clienteBusca.value = c.nome_fantasia ?? c.razao_social ?? ''
  clienteListaAberta.value = false
}

function limparCliente() {
  clienteId.value = null
  clienteBusca.value = ''
}

// ── Busca — Tipo de Resíduo ───────────────────────────────────────────────────

const tipoResiduoBusca = ref('')
const tipoListaAberta = ref(false)

const tiposFiltrados = computed(() => {
  const q = tipoResiduoBusca.value.toLowerCase()
  return tiposResiduos.value
    .filter(t => !q || t.name?.toLowerCase().includes(q))
    .slice(0, 20)
})

function selecionarTipo(t: TipoResiduo) {
  tipoResiduoId.value = t.unique_id ?? null
  tipoResiduoBusca.value = t.name ?? ''
  tipoListaAberta.value = false
}

function limparTipo() {
  tipoResiduoId.value = null
  tipoResiduoBusca.value = ''
}

// ── Busca — Transportadora ────────────────────────────────────────────────────

const transportadoraBusca = ref('')
const transpListaAberta = ref(false)

const transportadorasFiltradas = computed(() => {
  const q = transportadoraBusca.value.toLowerCase()
  return transportadoras.value
    .filter(t => !q || t.nome_fantasia?.toLowerCase().includes(q))
    .slice(0, 20)
})

function selecionarTransportadora(t: Transportadora) {
  transportadoraId.value = t.unique_id ?? null
  transportadoraBusca.value = t.nome_fantasia ?? ''
  transpListaAberta.value = false
}

function limparTransportadora() {
  transportadoraId.value = null
  transportadoraBusca.value = ''
}

// ── Filtros ativos ─────────────────────────────────────────────────────────────

const totalFiltrosAtivos = computed(() =>
  [clienteId.value, tipoResiduoId.value, transportadoraId.value].filter(Boolean).length
)
const temFiltrosAtivos = computed(() => totalFiltrosAtivos.value > 0)

function handleAplicarFiltros() {
  aplicarFiltros()
  filtrosAberto.value = false
}

function handleLimpar() {
  limparFiltros()
  clienteBusca.value = ''
  tipoResiduoBusca.value = ''
  transportadoraBusca.value = ''
  filtrosAberto.value = false
}

// ── Atualizar ─────────────────────────────────────────────────────────────────

const girando = ref(false)
const agora = ref(new Date())

let tick: ReturnType<typeof setInterval>
onMounted(() => { tick = setInterval(() => { agora.value = new Date() }, 30_000) })
onBeforeUnmount(() => clearInterval(tick))

const tempoAtualizado = computed(() => {
  const diffMs = agora.value.getTime() - ultimaAtualizacao.value.getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return 'atualizado agora'
  if (min === 1) return 'atualizado há 1 min'
  return `atualizado há ${min} min`
})

async function handleAtualizar() {
  girando.value = true
  atualizar()
  await new Promise(r => setTimeout(r, 700))
  girando.value = false
}
</script>

<style>
.scrollbar-green {
  scrollbar-width: thin;
  scrollbar-color: #065f46 transparent;
}
.scrollbar-green::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-green::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-green::-webkit-scrollbar-thumb {
  background-color: #065f46;
  border-radius: 99px;
}
.scrollbar-green::-webkit-scrollbar-thumb:hover {
  background-color: #047857;
}
</style>
