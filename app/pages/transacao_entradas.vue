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
              Transações / Entradas
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie as transações de entrada de resíduos aqui.
            </p>
          </div>

          <!-- Nova Entrada → oculto quando há entrada selecionada -->
          <button
            v-if="!entradaAtiva"
            @click="exibindoModalCriar = true"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Nova Entrada
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar transação..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Tabela -->
        <div class="px-6 md:px-8 pb-8">
          <ResiduosListaTransacaoEntradas
            :transacoes="transacoesFiltradas"
            :loading="loading"
            v-model:current-page="paginaAtual"
            :items-per-page="itensPorPagina"
            :reabrir-entrada="entradaParaReabrir"
            @edit="handleEdit"
            @delete="handleDelete"
            @add-detalhe="handleAddDetalhe"
            @edit-detalhe="handleEditDetalhe"
            @deleteDetalhe="fetchTransacoes"
            @entrada-ativa="entradaAtiva = $event"
          />
        </div>

      </div>

      <!-- ── Nova Entrada (Resíduo completo) ──────────── -->
      <div v-else-if="view === 'nova-entrada'" key="nova-entrada">
        <ResiduosFormNovaEntradaResiduo
          :is-novo="true"
          @voltar="voltarParaLista"
          @salvo="onSalvo"
        />
      </div>

      <!-- ── Novo Detalhe (em entrada existente) ──────── -->
      <div v-else-if="view === 'novo-detalhe'" key="novo-detalhe">
        <ResiduosFormNovaEntradaResiduo
          :is-novo="true"
          :entrada-id="transacaoEditando?.unique_id"
          :entrada-date="transacaoEditando?.date"
          @voltar="voltarParaDetalhes"
          @salvo="onSalvoDetalhe"
        />
      </div>

      <!-- ── Editar Detalhe ────────────────────────────── -->
      <div v-else-if="view === 'editar-detalhe'" key="editar-detalhe">
        <ResiduosFormNovaEntradaResiduo
          :is-novo="false"
          :detalhe="detalheEditando"
          :entrada-date="transacaoEditando?.date"
          @voltar="voltarParaDetalhes"
          @salvo="onSalvoDetalhe"
        />
      </div>

    </Transition>
  </div>

  <!-- Modal Criar Operação Diária -->
  <ResiduosModalCriarOperacaoDiaria
    :show="exibindoModalCriar"
    @fechar="exibindoModalCriar = false"
    @criado="onEntradaCriada"
  />

  <!-- Modal de Confirmação de Exclusão -->
  <BaseModalConfirm
    :show="exibindoModalExcluir"
    title="Excluir Transação"
    :message="`Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.`"
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
import type { TransacaoListaEntrada } from '~/types/transacaoListaEntrada'
import type { TransacaoListaDetalhe } from '~/types/transacaoListaDetalhe'

const {
  transacoes,
  loading,
  fetchTransacoes,
  deleteTransacao,
} = useTransacoesListaEntrada()

const { abrir: abrirModalGlobal, fecharModal: fecharModalGlobal } = useModalNovaEntrada()

watch(abrirModalGlobal, (val) => {
  if (val) {
    exibindoModalCriar.value = true
    fecharModalGlobal()
  }
})

const search = ref('')
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

const view = ref<'lista' | 'nova-entrada' | 'novo-detalhe' | 'editar-detalhe'>('lista')
const transacaoEditando = ref<TransacaoListaEntrada | null>(null)
const detalheEditando = ref<TransacaoListaDetalhe | null>(null)

// Estado modal criar
const exibindoModalCriar = ref(false)
const entradaAtiva = ref(false)
const entradaParaReabrir = ref<TransacaoListaEntrada | null>(null)

// Estados para Exclusão
const exibindoModalExcluir = ref(false)
const transacaoParaExcluir = ref<TransacaoListaEntrada | null>(null)
const excluindo = ref(false)

// Filtro por busca
const transacoesFiltradas = computed(() => {
  if (!search.value) return transacoes.value
  const q = search.value.toLowerCase()
  return transacoes.value.filter(t =>
    t.date_text?.toLowerCase().includes(q) ||
    t.transaction_type?.toLowerCase().includes(q) ||
    t.company?.toLowerCase().includes(q)
  )
})

watch(search, () => { paginaAtual.value = 1 })

onMounted(async () => {
  await fetchTransacoes()
})

async function onEntradaCriada(_transacao: TransacaoListaEntrada) {
  await fetchTransacoes()
}

function handleEditDetalhe(detalhe: TransacaoListaDetalhe) {
  detalheEditando.value = { ...detalhe }
  transacaoEditando.value = transacoes.value.find(t => t.unique_id === detalhe.residue_operation) ?? null
  view.value = 'editar-detalhe'
}

function handleAddDetalhe(transacao: TransacaoListaEntrada) {
  transacaoEditando.value = { ...transacao }
  view.value = 'novo-detalhe'
}

function handleEdit(transacao: TransacaoListaEntrada) {
  transacaoEditando.value = { ...transacao }
  view.value = 'nova-entrada'
}

function handleDelete(transacao: TransacaoListaEntrada) {
  transacaoParaExcluir.value = transacao
  exibindoModalExcluir.value = true
}

async function confirmDelete() {
  if (!transacaoParaExcluir.value) return

  excluindo.value = true
  const result = await deleteTransacao(transacaoParaExcluir.value.id)
  excluindo.value = false

  if (result.success) {
    toast.success('Transação excluída com sucesso!')
    exibindoModalExcluir.value = false
    transacaoParaExcluir.value = null
    await fetchTransacoes()
  } else {
    toast.error('Erro ao excluir transação', {
      description: (result as any).error || 'Ocorreu um problema ao tentar excluir o registro.'
    })
  }
}

async function onSalvo() {
  await fetchTransacoes()
  view.value = 'lista'
}

function voltarParaLista() {
  transacaoEditando.value = null
  entradaParaReabrir.value = null
  view.value = 'lista'
}

function voltarParaDetalhes() {
  entradaParaReabrir.value = transacaoEditando.value
  view.value = 'lista'
}

async function onSalvoDetalhe() {
  entradaParaReabrir.value = transacaoEditando.value
  await fetchTransacoes()
  view.value = 'lista'
}

</script>
