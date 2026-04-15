<template>
  <div class="relative" ref="refFiltros">
    <button
      type="button"
      @click="filtrosAberto ? filtrosAberto = false : abrirFiltros()"
      class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors"
      :class="filtrosAberto || totalFiltrosAtivos > 0
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
        class="absolute z-30 top-full mt-1 right-0 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg origin-top-right"
      >
        <div class="p-4 space-y-4">

          <!-- MTR Manifesto -->
          <div>
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Nº Manifesto (MTR)</label>
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                v-model="rascunhoMtr"
                type="text"
                placeholder="Buscar por MTR..."
                class="w-full pl-8 pr-7 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                v-if="rascunhoMtr"
                type="button"
                @click="rascunhoMtr = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- MTR Transportadora -->
          <div>
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">MTR Transportadora</label>
            <div class="relative">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                v-model="rascunhoMtrTransportadora"
                type="text"
                placeholder="Buscar por MTR transp...."
                class="w-full pl-8 pr-7 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                v-if="rascunhoMtrTransportadora"
                type="button"
                @click="rascunhoMtrTransportadora = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

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
                v-if="rascunhoClienteId"
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
                  :class="rascunhoClienteId === c.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
                >
                  {{ c.nome }}
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
                v-if="rascunhoTransportadoraId"
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
                  :class="rascunhoTransportadoraId === t.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'"
                >
                  {{ t.nome }}
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
            @click="handleAplicar"
            class="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-vue-next'
import type { TransacaoListaDetalhe } from '~/types/transacaoListaDetalhe'

const props = defineProps<{
  detalhes: TransacaoListaDetalhe[]
}>()

const {
  filtroMtr,
  filtroMtrTransportadora,
  filtroClienteId,
  filtroTransportadoraId,
  totalFiltrosAtivos,
  limparFiltros,
} = useTransacoesDetalhesFiltros()

// ── Estados rascunho (só aplicados ao clicar em "Aplicar") ────────────────────

const rascunhoMtr = ref('')
const rascunhoMtrTransportadora = ref('')
const rascunhoClienteId = ref<string | null>(null)
const rascunhoTransportadoraId = ref<string | null>(null)

// ── Dropdown ──────────────────────────────────────────────────────────────────

const filtrosAberto = ref(false)
const refFiltros = ref<HTMLElement | null>(null)

function abrirFiltros() {
  // Sincroniza rascunho com o estado atual ao abrir
  rascunhoMtr.value = filtroMtr.value
  rascunhoMtrTransportadora.value = filtroMtrTransportadora.value
  rascunhoClienteId.value = filtroClienteId.value
  rascunhoTransportadoraId.value = filtroTransportadoraId.value
  // Atualiza labels dos dropdowns
  const cliente = opcoesClientes.value.find(c => c.id === filtroClienteId.value)
  clienteBusca.value = cliente?.nome ?? ''
  const transp = opcoesTransportadoras.value.find(t => t.id === filtroTransportadoraId.value)
  transportadoraBusca.value = transp?.nome ?? ''
  filtrosAberto.value = true
}

function fecharDropdowns(e: MouseEvent) {
  const t = e.target as Node
  if (!refFiltros.value?.contains(t)) {
    filtrosAberto.value = false
    clienteListaAberta.value = false
    transpListaAberta.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', fecharDropdowns))
onBeforeUnmount(() => document.removeEventListener('mousedown', fecharDropdowns))

// ── Opções derivadas dos detalhes ─────────────────────────────────────────────

interface Opcao { id: string; nome: string }

const opcoesClientes = computed<Opcao[]>(() => {
  const map = new Map<string, string>()
  for (const d of props.detalhes) {
    if (d.cliente_id && d.nome_cliente) map.set(d.cliente_id, d.nome_cliente)
  }
  return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }))
})

const opcoesTransportadoras = computed<Opcao[]>(() => {
  const map = new Map<string, string>()
  for (const d of props.detalhes) {
    if (d.carrier && d.nome_transportadora) map.set(d.carrier, d.nome_transportadora)
  }
  return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }))
})

// ── Cliente ───────────────────────────────────────────────────────────────────

const clienteBusca = ref('')
const clienteListaAberta = ref(false)

const clientesFiltrados = computed(() => {
  const q = clienteBusca.value.toLowerCase()
  return opcoesClientes.value
    .filter(c => !q || c.nome.toLowerCase().includes(q))
    .slice(0, 20)
})

function selecionarCliente(c: Opcao) {
  rascunhoClienteId.value = c.id
  clienteBusca.value = c.nome
  clienteListaAberta.value = false
}

function limparCliente() {
  rascunhoClienteId.value = null
  clienteBusca.value = ''
}

// ── Transportadora ────────────────────────────────────────────────────────────

const transportadoraBusca = ref('')
const transpListaAberta = ref(false)

const transportadorasFiltradas = computed(() => {
  const q = transportadoraBusca.value.toLowerCase()
  return opcoesTransportadoras.value
    .filter(t => !q || t.nome.toLowerCase().includes(q))
    .slice(0, 20)
})

function selecionarTransportadora(t: Opcao) {
  rascunhoTransportadoraId.value = t.id
  transportadoraBusca.value = t.nome
  transpListaAberta.value = false
}

function limparTransportadora() {
  rascunhoTransportadoraId.value = null
  transportadoraBusca.value = ''
}

// ── Aplicar / Limpar ──────────────────────────────────────────────────────────

function handleAplicar() {
  filtroMtr.value = rascunhoMtr.value
  filtroMtrTransportadora.value = rascunhoMtrTransportadora.value
  filtroClienteId.value = rascunhoClienteId.value
  filtroTransportadoraId.value = rascunhoTransportadoraId.value
  filtrosAberto.value = false
}

function handleLimpar() {
  limparFiltros()
  rascunhoMtr.value = ''
  rascunhoMtrTransportadora.value = ''
  rascunhoClienteId.value = null
  rascunhoTransportadoraId.value = null
  clienteBusca.value = ''
  transportadoraBusca.value = ''
  filtrosAberto.value = false
}
</script>

<style scoped>
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
