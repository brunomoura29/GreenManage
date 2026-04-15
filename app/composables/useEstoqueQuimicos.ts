import { ref, computed, shallowRef, onMounted } from 'vue'
import type { TransacaoEstoque } from '~/types/transacaoEstoque'
import type { Insumo } from '~/types/insumo'
import { hojeLocal, formatData } from '~/composables/useFuncoesKPIDash'

export type VisaoEstoque = 'volume' | 'financeiro'

export interface LinhaEstoque {
  insumoId: string
  nome: string
  unidade: string
  // volume
  saldoAnterior: number
  entrada: number
  consumo: number
  ajuste: number
  saldoAtual: number
  // financeiro
  valorAnterior: number
  custoEntrada: number
  custoConsumo: number
  custoAjuste: number
  valorEstoqueAtual: number
}

export function useEstoqueQuimicos() {
  const supabase = useSupabaseClient() as any

  const loading = ref(false)
  const hoje = hojeLocal()

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const dataFiltro = ref(hoje)
  const periodoInicio = ref('')
  const periodoFim = ref('')
  const turnoFiltro = ref('')
  const filtrosAbertos = ref(false)
  const visao = ref<VisaoEstoque>('volume')

  // ── Dados brutos ─────────────────────────────────────────────────────────────
  const todasTransacoes = shallowRef<TransacaoEstoque[]>([])
  const todosInsumos = shallowRef<Insumo[]>([])

  // ── Filtros ativos (badge) ───────────────────────────────────────────────────
  const filtrosAtivos = computed(() => {
    let n = 0
    if (dataFiltro.value !== hoje && !periodoInicio.value) n++
    if (periodoInicio.value) n++
    if (periodoFim.value) n++
    if (turnoFiltro.value) n++
    return n
  })

  // ── Labels para o cabeçalho ──────────────────────────────────────────────────
  const labelPeriodo = computed(() => {
    if (periodoInicio.value && periodoFim.value) {
      return `${formatData(periodoInicio.value)} até ${formatData(periodoFim.value)}`
    }
    return formatData(dataFiltro.value)
  })

  const labelTurno = computed(() => {
    if (turnoFiltro.value === 'manha') return 'Manhã'
    if (turnoFiltro.value === 'noite') return 'Noite'
    return 'Todos os turnos'
  })

  // ── Linhas computadas ────────────────────────────────────────────────────────
  const linhas = computed((): LinhaEstoque[] => {
    const inicio = periodoInicio.value && periodoFim.value
      ? new Date(periodoInicio.value + 'T00:00:00')
      : new Date(dataFiltro.value + 'T00:00:00')

    const fim = periodoInicio.value && periodoFim.value
      ? new Date(periodoFim.value + 'T23:59:59')
      : new Date(dataFiltro.value + 'T23:59:59')

    const transacoesFiltradas = todasTransacoes.value.filter(t => {
      const dt = new Date(t.creation_date)
      if (dt < inicio || dt > fim) return false
      if (turnoFiltro.value && t.time_of_day !== turnoFiltro.value) return false
      return true
    })

    if (transacoesFiltradas.length === 0) return []

    // Ordenar ASC para identificar corretamente primeira e última transação por insumo
    const filtradosAsc = [...transacoesFiltradas].sort(
      (a, b) => new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime()
    )

    const insumoMap = new Map<string, Insumo>(
      todosInsumos.value.map(i => [i.unique_id ?? '', i])
    )

    // Primeira e última transação de cada insumo no período (ordem cronológica)
    const primeiraMap = new Map<string, TransacaoEstoque>()
    const ultimaMap = new Map<string, TransacaoEstoque>()

    for (const t of filtradosAsc) {
      if (!primeiraMap.has(t.insumo)) primeiraMap.set(t.insumo, t)
      ultimaMap.set(t.insumo, t)
    }

    // Inicializar grupos com saldo anterior e atual corretos
    const grupos = new Map<string, LinhaEstoque>()

    for (const [insumoId, primeira] of primeiraMap) {
      const ultima = ultimaMap.get(insumoId)!
      const insumo = insumoMap.get(insumoId)
      const unitValue = insumo?.unit_value ?? 0

      // saldoAnterior = stock_before da 1ª transação do período
      // saldoAtual    = stock_after  da última transação do período
      const saldoAnterior = primeira.stock_before
      const saldoAtual = ultima.stock_after

      grupos.set(insumoId, {
        insumoId,
        nome: insumo?.name ?? insumoId,
        unidade: insumo?.measurement_unit ?? '',
        saldoAnterior,
        entrada: 0,
        consumo: 0,
        ajuste: 0,
        saldoAtual,
        valorAnterior: saldoAnterior * unitValue,
        custoEntrada: 0,
        custoConsumo: 0,
        custoAjuste: 0,
        valorEstoqueAtual: saldoAtual * unitValue,
      })
    }

    // Acumular movimentações
    for (const t of filtradosAsc) {
      const linha = grupos.get(t.insumo)!
      const custo = t.cost_of_difference ?? 0

      if (t.type === 'Entrada') {
        linha.entrada += t.qtd_registro
        linha.custoEntrada += custo
      } else if (t.type === 'Consumo') {
        linha.consumo += t.qtd_registro
        linha.custoConsumo += custo   // cost_of_difference já é sempre positivo
      } else if (t.type === 'Ajuste') {
        linha.ajuste += t.stock_difference
        // cost_of_difference é gravado como Math.abs → precisa resgatar direção via stock_difference
        linha.custoAjuste += t.stock_difference >= 0 ? custo : -custo
      }
    }

    return [...grupos.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  })

  // ── Custo filtrado por período (respeita filtros do dashboard) ───────────────
  function calcularCustoQuimicos(inicio: string, fim: string): number {
    if (!inicio || !fim) return 0
    const dtInicio = new Date(inicio.includes('T') ? inicio : inicio + 'T00:00:00')
    const dtFim    = new Date(fim.includes('T')    ? fim    : fim    + 'T23:59:59')

    return todasTransacoes.value
      .filter(t => {
        const dt = new Date(t.creation_date)
        return dt >= dtInicio && dt <= dtFim
      })
      .reduce((soma, t) => soma + Math.abs(t.cost_of_difference ?? 0), 0)
  }

  // ── Totais ───────────────────────────────────────────────────────────────────
  const totalSaldoAnterior = computed(() =>
    visao.value === 'financeiro'
      ? linhas.value.reduce((s, l) => s + l.valorAnterior, 0)
      : linhas.value.reduce((s, l) => s + l.saldoAnterior, 0)
  )

  const totalEntrada = computed(() =>
    visao.value === 'financeiro'
      ? linhas.value.reduce((s, l) => s + l.custoEntrada, 0)
      : linhas.value.reduce((s, l) => s + l.entrada, 0)
  )

  const totalConsumo = computed(() =>
    visao.value === 'financeiro'
      ? linhas.value.reduce((s, l) => s + l.custoConsumo, 0)
      : linhas.value.reduce((s, l) => s + l.consumo, 0)
  )

  const totalAjuste = computed(() =>
    visao.value === 'financeiro'
      ? linhas.value.reduce((s, l) => s + l.custoAjuste, 0)
      : linhas.value.reduce((s, l) => s + l.ajuste, 0)
  )

  const totalSaldo = computed(() =>
    visao.value === 'financeiro'
      ? linhas.value.reduce((s, l) => s + l.valorEstoqueAtual, 0)
      : linhas.value.reduce((s, l) => s + l.saldoAtual, 0)
  )

  // ── Ações ────────────────────────────────────────────────────────────────────
  function navegarDia(delta: number) {
    const d = new Date(dataFiltro.value + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    const nova = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
    if (delta > 0 && nova > hoje) return
    dataFiltro.value = nova
    periodoInicio.value = ''
    periodoFim.value = ''
  }

  function limparFiltros() {
    dataFiltro.value = hoje
    periodoInicio.value = ''
    periodoFim.value = ''
    turnoFiltro.value = ''
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  async function carregarDados() {
    loading.value = true

    const [{ data: insumosData }, { data: transacoesData }] = await Promise.all([
      supabase
        .from('insumos')
        .select('unique_id, name, measurement_unit, current_stock, unit_value')
        .order('name', { ascending: true }),
      supabase
        .from('transacao_estoque')
        .select('*')
        .order('creation_date', { ascending: false }),
    ])

    todosInsumos.value = (insumosData as Insumo[]) ?? []
    todasTransacoes.value = (transacoesData as TransacaoEstoque[]) ?? []

    loading.value = false
  }

  onMounted(carregarDados)

  return {
    // estado
    hoje,
    loading,
    visao,
    dataFiltro,
    periodoInicio,
    periodoFim,
    turnoFiltro,
    filtrosAbertos,
    // computeds
    filtrosAtivos,
    labelPeriodo,
    labelTurno,
    linhas,
    calcularCustoQuimicos,
    totalSaldoAnterior,
    totalEntrada,
    totalConsumo,
    totalAjuste,
    totalSaldo,
    // ações
    navegarDia,
    limparFiltros,
    formatData,
  }
}
