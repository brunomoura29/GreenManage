<template>
  <div class="min-h-full">

    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="px-6 md:px-8 pt-8 pb-6 flex items-center gap-4">
      <button
        @click="$emit('voltar')"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Voltar"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          Movimentação de {{ tipoLabel.toLowerCase() }} de estoque
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Salve os detalhes da movimentação de estoque aqui.
        </p>
      </div>
    </div>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <form class="px-6 md:px-8 pb-28 pt-2 space-y-0" @submit.prevent="salvar">

      <!-- ── Dados da Movimentação ──────────────────────────────────────── -->
      <div class="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">

        <!-- Data -->
        <div class="flex items-center gap-4 px-5 py-4">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300 w-48 shrink-0">
            Data da medição
          </label>
          <input
            v-model="form.date"
            type="date"
            required
            class="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        <!-- Período -->
        <div class="flex items-center gap-4 px-5 py-4">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300 w-48 shrink-0">
            Período do dia
          </label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Sun v-if="form.shift === 'manha'" class="w-4 h-4 text-amber-500" />
              <Moon v-else class="w-4 h-4 text-indigo-500" />
            </div>
            <select
              v-model="form.shift"
              class="appearance-none pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            >
              <option value="manha">manhã</option>
              <option value="noite">noite</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <!-- Tipo -->
        <div class="flex items-center gap-4 px-5 py-4">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300 w-48 shrink-0">
            Tipo de movimentação
          </label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowDownToLine v-if="form.type === 'Entrada'" class="w-4 h-4 text-emerald-500" />
              <ArrowUpFromLine v-else-if="form.type === 'Consumo'" class="w-4 h-4 text-red-500" />
              <SlidersHorizontal v-else class="w-4 h-4 text-slate-400" />
            </div>
            <select
              v-model="form.type"
              class="appearance-none pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            >
              <option value="Entrada">Entrada</option>
              <option value="Consumo">Consumo</option>
              <option value="Ajuste">Ajuste</option>
            </select>
            <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

      </div>

      <!-- ── Lançamentos dos Estoques ───────────────────────────────────── -->
      <div class="pt-8">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Lançamentos dos estoques</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Selecione os insumos e faça as movimentações dos estoques</p>
          </div>
          <button
            type="button"
            @click="adicionarLinha"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Inserir químico
          </button>
        </div>

        <!-- Busca de insumo global -->
        <div class="relative mb-4" ref="refBusca">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            v-model="buscaInsumo"
            type="text"
            placeholder="Digite aqui para pesquisar um insumo..."
            @focus="buscaAberta = true"
            @input="buscaAberta = true"
            class="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
          <!-- Dropdown de insumos -->
          <div
            v-if="buscaAberta && insumosFiltrados.length > 0"
            class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto"
          >
            <button
              v-for="ins in insumosFiltrados"
              :key="ins.id"
              type="button"
              @click="selecionarInsumo(ins)"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <FlaskConical class="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p class="font-medium text-slate-900 dark:text-white">{{ ins.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Estoque atual: {{ formatNumero(ins.current_stock) }} {{ ins.measurement_unit ?? '' }}
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- Linhas de insumos adicionados -->
        <div class="space-y-3">
          <div
            v-if="linhas.length === 0"
            class="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500"
          >
            <FlaskConical class="w-8 h-8" />
            <span class="text-sm">Nenhum insumo adicionado. Use a busca ou o botão acima.</span>
          </div>

          <div
            v-for="(linha, idx) in linhas"
            :key="linha._key"
            class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
          >
            <div class="flex items-start gap-4">

              <!-- Ícone -->
              <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 mt-1">
                <FlaskConical class="w-5 h-5 text-primary-700 dark:text-primary-400" />
              </div>

              <!-- Info do insumo + saldo -->
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-900 dark:text-white truncate">
                  {{ linha.insumoNome }}
                </p>
                <!-- Saldo anterior → saldo depois -->
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="text-xs text-slate-500 dark:text-slate-400">
                    {{ isNovo ? 'Estoque atual' : 'Saldo anterior' }}:
                    <span class="font-medium text-slate-700 dark:text-slate-300">
                      {{ formatNumero(linha.stockAtual) }} {{ linha.unidade }}
                    </span>
                  </span>
                  <span class="text-slate-300 dark:text-slate-600">→</span>
                  <span class="text-xs font-semibold" :class="previewClass(linha)">
                    {{ previewEstoque(linha) }} {{ linha.unidade }}
                  </span>
                </div>
              </div>

              <!-- Quantidade -->
              <div class="flex flex-col items-center shrink-0 gap-1">
                <label class="text-xs text-slate-500 dark:text-slate-400 self-start">
                  {{ form.type === 'Ajuste' ? 'Novo estoque' : 'Quantidade' }}
                </label>
                <input
                  v-model.number="linha.quantidade"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  class="w-28 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                <span class="text-[10px] text-slate-400 self-start truncate max-w-[112px]" :title="linha.unidade">
                  {{ linha.unidade }}
                </span>
              </div>

              <!-- Botão remover -->
              <div class="flex items-center self-stretch shrink-0">
                <button
                  type="button"
                  @click="removerLinha(idx)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Remover"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- ── Rodapé Fixo ────────────────────────────────────────────────── -->
      <div class="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-end gap-3 px-6 md:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          @click="$emit('voltar')"
          class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="salvando || linhas.length === 0"
          class="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Loader2 v-if="salvando" class="w-4 h-4 animate-spin" />
          {{ salvando ? 'Salvando...' : 'Salvar e aplicar alterações' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  ArrowLeft, Plus, Trash2, Search, FlaskConical, Loader2,
  Sun, Moon, ChevronDown, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { MovimentoEstoque, MovimentoEstoqueTipo, MovimentoEstoqueTurno } from '~/types/movimentoEstoque'
import type { Insumo } from '~/types/insumo'

const props = defineProps<{
  isNovo: boolean
  movimentoId?: string | null
  movimentoDate?: string | null
  movimentoShift?: string | null
  movimentoType?: string | null
  movimento?: MovimentoEstoque | null
}>()

const emit = defineEmits<{
  voltar: []
  salvo: []
}>()

// ── Composables ───────────────────────────────────────────────────────────────
const { insumos, fetchInsumos, updateInsumo } = useInsumos()
const { createMovimento, updateMovimento } = useMovimentoEstoque()
const { createTransacao, updateTransacao, fetchTransacoesByMovimento, transacoes: transacoesExistentes } = useTransacaoEstoque()
const { getCompanyId } = useEmpresas()
const supabase = useSupabaseClient() as any

// ── Estado ────────────────────────────────────────────────────────────────────
const salvando = ref(false)
const buscaInsumo = ref('')
const buscaAberta = ref(false)
const refBusca = ref<HTMLElement | null>(null)

// ── Form principal ────────────────────────────────────────────────────────────
const form = ref({
  date: props.movimentoDate ? props.movimentoDate.substring(0, 10) : new Date().toISOString().substring(0, 10),
  shift: (props.movimentoShift ?? 'manha') as MovimentoEstoqueTurno,
  type:  (props.movimentoType  ?? 'Consumo') as MovimentoEstoqueTipo,
})

// ── Linhas de insumos ─────────────────────────────────────────────────────────
interface LinhaInsumo {
  _key: number
  transacaoId: string | null   // null = linha nova, string = transação existente
  insumoId: string
  insumoUniqueId: string
  insumoNome: string
  unidade: string
  stockAtual: number           // stock_before da transação original (referência fixa)
  unitValue: number
  quantidade: number | null
}

const linhas = ref<LinhaInsumo[]>([])
let keyCounter = 0

// ── Computed ──────────────────────────────────────────────────────────────────
const tipoLabel = computed(() => form.value.type)

const insumosFiltrados = computed(() => {
  const jaAdicionados = new Set(linhas.value.map(l => l.insumoId))
  const q = buscaInsumo.value.toLowerCase()
  return insumos.value.filter(i =>
    !jaAdicionados.has(i.id) &&
    (i.name?.toLowerCase().includes(q) || i.measurement_unit?.toLowerCase().includes(q))
  )
})

// ── Fechar dropdown ao clicar fora ────────────────────────────────────────────
function onClickFora(e: MouseEvent) {
  if (refBusca.value && !refBusca.value.contains(e.target as Node)) {
    buscaAberta.value = false
  }
}
onMounted(async () => {
  await fetchInsumos()
  document.addEventListener('mousedown', onClickFora)

  // Carrega transações existentes quando abrindo um movimento já criado
  if (!props.isNovo && props.movimentoId) {
    await fetchTransacoesByMovimento(props.movimentoId)
    for (const t of transacoesExistentes.value) {
      const insumo = insumos.value.find(i => i.unique_id === t.insumo)
      linhas.value.push({
        _key:           keyCounter++,
        transacaoId:    t.id,
        insumoId:       insumo?.id ?? '',
        insumoUniqueId: t.insumo,
        insumoNome:     insumo?.name ?? t.insumo,
        unidade:        insumo?.measurement_unit ?? '',
        stockAtual:     t.stock_before,
        unitValue:      Number(insumo?.unit_value ?? 0),
        quantidade:     t.qtd_registro,
      })
    }
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickFora)
})

// ── Ações das linhas ──────────────────────────────────────────────────────────
function selecionarInsumo(ins: Insumo) {
  linhas.value.push({
    _key:           keyCounter++,
    transacaoId:    null,
    insumoId:       ins.id,
    insumoUniqueId: ins.unique_id ?? '',
    insumoNome:     ins.name ?? '',
    unidade:        ins.measurement_unit ?? '',
    stockAtual:     Number(ins.current_stock ?? 0),
    unitValue:      Number(ins.unit_value ?? 0),
    quantidade:     null,
  })
  buscaInsumo.value = ''
  buscaAberta.value = false
}

function adicionarLinha() {
  buscaInsumo.value = ''
  buscaAberta.value = true
  setTimeout(() => (refBusca.value?.querySelector('input') as HTMLInputElement)?.focus(), 50)
}

function removerLinha(idx: number) {
  linhas.value.splice(idx, 1)
}

// ── Preview do novo estoque por linha ─────────────────────────────────────────
function calcNovoEstoque(linha: LinhaInsumo): number {
  const qty = Number(linha.quantidade ?? 0)
  if (form.value.type === 'Entrada')  return linha.stockAtual + qty
  if (form.value.type === 'Consumo')  return linha.stockAtual - qty
  return qty // Ajuste = valor absoluto
}

function previewEstoque(linha: LinhaInsumo): string {
  return formatNumero(calcNovoEstoque(linha))
}

function previewClass(linha: LinhaInsumo): string {
  const novo = calcNovoEstoque(linha)
  if (novo < 0) return 'text-red-500 dark:text-red-400'
  if (novo < linha.stockAtual) return 'text-amber-500 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

// ── Salvar ────────────────────────────────────────────────────────────────────
async function salvar() {
  if (salvando.value || linhas.value.length === 0) return

  const invalidas = linhas.value.filter(l => !l.quantidade || l.quantidade <= 0)
  if (invalidas.length > 0) {
    toast.error('Preencha a quantidade de todos os insumos.')
    return
  }

  salvando.value = true

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null
  const companyId = await getCompanyId()

  // 1. Calcula custo total da movimentação
  const custoTotal = linhas.value.reduce((acc, l) => {
    const diff = Math.abs(calcNovoEstoque(l) - l.stockAtual)
    return acc + diff * l.unitValue
  }, 0)

  let movimentoUniqueId: string

  // 2. Cria ou atualiza o movimento_estoque
  if (props.isNovo) {
    movimentoUniqueId = `mov_${Date.now()}`
    const result = await createMovimento({
      unique_id:   movimentoUniqueId,
      company:     companyId ?? '',
      date:        `${form.value.date}T00:00:00`,
      shift:       form.value.shift,
      type:        form.value.type,
      custo_total: custoTotal,
      user_id:     userId,
    })
    if (!result.success) {
      salvando.value = false
      toast.error('Erro ao criar movimentação', { description: (result as any).error })
      return
    }
  } else {
    movimentoUniqueId = props.movimentoId ?? ''
    await updateMovimento(props.movimento!.id, {
      date:        `${form.value.date}T00:00:00`,
      shift:       form.value.shift,
      type:        form.value.type,
      custo_total: custoTotal,
    })
  }

  // 3. Cria ou atualiza transacao_estoque + atualiza current_stock de cada insumo
  for (const linha of linhas.value) {
    const novoEstoque = calcNovoEstoque(linha)
    const diferenca   = novoEstoque - linha.stockAtual
    const custo       = Math.abs(diferenca) * linha.unitValue

    if (linha.transacaoId) {
      // Linha existente → atualiza
      await updateTransacao(linha.transacaoId, {
        stock_after:        novoEstoque,
        stock_difference:   diferenca,
        qtd_registro:       Number(linha.quantidade),
        cost_of_difference: custo,
        time_of_day:        form.value.shift,
        type:               form.value.type,
        saved:              'yes',
      })
    } else {
      // Linha nova → cria
      await createTransacao({
        unique_id:          `txe_${Date.now()}_${linha.insumoId}`,
        insumo:             linha.insumoUniqueId,
        stock_movement:     movimentoUniqueId,
        stock_before:       linha.stockAtual,
        stock_after:        novoEstoque,
        stock_difference:   diferenca,
        qtd_registro:       Number(linha.quantidade),
        cost_of_difference: custo,
        time_of_day:        form.value.shift,
        type:               form.value.type,
        saved:              'yes',
        user_id:            userId,
      })
    }

    await updateInsumo(linha.insumoId, { current_stock: novoEstoque })
  }

  salvando.value = false
  toast.success('Movimentação salva!', {
    description: `${linhas.value.length} insumo(s) atualizados com sucesso.`,
  })
  emit('salvo')
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatNumero(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  if (isNaN(n)) return '0'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
</script>
