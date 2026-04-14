<template>
  <div class="min-h-full">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-4 opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-4 opacity-0"
      mode="out-in"
    >
      <!-- ── Lista ──────────────────────── -->
      <div v-if="view === 'lista'" key="lista">

        <!-- Header -->
        <div class="px-6 md:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Estoque / Movimentações
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie as movimentações de estoque de insumos.
            </p>
          </div>

          <button
            @click="exibindoModalCriar = true"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Nova Movimentação
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar movimentação..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Tabela -->
        <div class="px-6 md:px-8 pb-8">
          <EstoqueListaMovimentacoesEstoque
            :movimentos="movimentosFiltrados"
            :loading="loading"
            v-model:current-page="paginaAtual"
            :items-per-page="itensPorPagina"
            @ver-movimento="handleVerMovimento"
            @delete="handleDelete"
          />
        </div>

      </div>

      <!-- ── Ver / Lançar transações de um movimento ───────────────────── -->
      <div v-else-if="view === 'ver-movimento'" key="ver-movimento">
        <EstoqueListaTransacoesEstoque
          :is-novo="false"
          :movimento="movimentoSelecionado"
          :movimento-id="movimentoSelecionado?.unique_id"
          :movimento-date="movimentoSelecionado?.date"
          :movimento-shift="movimentoSelecionado?.shift"
          :movimento-type="movimentoSelecionado?.type"
          @voltar="voltarParaLista"
          @salvo="onSalvo"
        />
      </div>

      <!-- ── Nova Movimentação (criação via form) ───────────────────────── -->
      <div v-else-if="view === 'nova-movimentacao'" key="nova-movimentacao">
        <EstoqueListaTransacoesEstoque
          :is-novo="true"
          :movimento-type="novaMovimentacaoType ?? undefined"
          :movimento-date="novaMovimentacaoDate ?? undefined"
          :movimento-shift="novaMovimentacaoShift ?? undefined"
          @voltar="voltarParaLista"
          @salvo="onSalvo"
        />
      </div>

    </Transition>
  </div>

  <!-- Modal selecionar tipo de movimentação -->
  <EstoqueModalNovaMovimentacao
    :show="exibindoModalCriar"
    @fechar="exibindoModalCriar = false"
    @confirmar="onModalConfirmado"
  />

  <!-- Modal de Confirmação de Exclusão -->
  <BaseModalConfirm
    :show="exibindoModalExcluir"
    title="Excluir Movimentação"
    :message="`Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.`"
    confirm-text="Excluir"
    variant="danger"
    :loading="excluindo"
    @confirm="confirmDelete"
    @cancel="exibindoModalExcluir = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { MovimentoEstoque, MovimentoEstoqueTipo, MovimentoEstoqueTurno } from '~/types/movimentoEstoque'

const {
  movimentos,
  loading,
  fetchMovimentos,
  deleteMovimento,
} = useMovimentoEstoque()

const search = ref('')
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

const view = ref<'lista' | 'ver-movimento' | 'nova-movimentacao'>('lista')
const movimentoSelecionado = ref<MovimentoEstoque | null>(null)

// Dados selecionados no modal para nova movimentação
const novaMovimentacaoType  = ref<MovimentoEstoqueTipo | null>(null)
const novaMovimentacaoDate  = ref<string | null>(null)
const novaMovimentacaoShift = ref<MovimentoEstoqueTurno | null>(null)

// Estado modal criar
const exibindoModalCriar = ref(false)

// Estados para exclusão
const exibindoModalExcluir = ref(false)
const movimentoParaExcluir = ref<MovimentoEstoque | null>(null)
const excluindo = ref(false)

const movimentosFiltrados = computed(() => {
  if (!search.value) return movimentos.value
  const q = search.value.toLowerCase()
  return movimentos.value.filter(m =>
    m.type?.toLowerCase().includes(q) ||
    m.shift?.toLowerCase().includes(q) ||
    m.date?.toLowerCase().includes(q)
  )
})

watch(search, () => { paginaAtual.value = 1 })

onMounted(async () => {
  await fetchMovimentos()
})

function onModalConfirmado(payload: { type: MovimentoEstoqueTipo; date: string; shift: MovimentoEstoqueTurno }) {
  novaMovimentacaoType.value  = payload.type
  novaMovimentacaoDate.value  = payload.date
  novaMovimentacaoShift.value = payload.shift
  view.value = 'nova-movimentacao'
}

function handleVerMovimento(movimento: MovimentoEstoque) {
  movimentoSelecionado.value = { ...movimento }
  view.value = 'ver-movimento'
}

function handleDelete(movimento: MovimentoEstoque) {
  movimentoParaExcluir.value = movimento
  exibindoModalExcluir.value = true
}

async function voltarParaLista() {
  movimentoSelecionado.value = null
  novaMovimentacaoType.value  = null
  novaMovimentacaoDate.value  = null
  novaMovimentacaoShift.value = null
  await fetchMovimentos()
  view.value = 'lista'
}

async function onSalvo() {
  await fetchMovimentos()
  view.value = 'lista'
  movimentoSelecionado.value = null
}

async function confirmDelete() {
  if (!movimentoParaExcluir.value) return

  excluindo.value = true
  const result = await deleteMovimento(movimentoParaExcluir.value.id)
  excluindo.value = false

  if (result.success) {
    toast.success('Movimentação excluída com sucesso!')
    exibindoModalExcluir.value = false
    movimentoParaExcluir.value = null
    await fetchMovimentos()
  } else {
    toast.error('Erro ao excluir movimentação', {
      description: (result as any).error || 'Ocorreu um problema ao tentar excluir o registro.'
    })
  }
}
</script>
