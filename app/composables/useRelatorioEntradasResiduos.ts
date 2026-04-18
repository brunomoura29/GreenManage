import type { RelatorioEntradasResiduos } from '~/types/relatorioEntradasResiduos'

const VIEW = 'viwes_relatorio_entradas_residuos'
const POR_PAGINA = 10

export const useRelatorioEntradasResiduos = () => {
  const supabase = useSupabaseClient() as any

  const registros   = ref<RelatorioEntradasResiduos[]>([])
  const total       = ref(0)
  const pagina      = ref(1)
  const loading     = ref(false)
  const error       = ref<string | null>(null)

  // ── Filtros ───────────────────────────────────────────────────────────────

  const filtros = ref({
    dataInicio:    null as string | null,
    dataFim:       null as string | null,
    transportadora: null as string | null,
    cliente:       null as string | null,
    classe:        null as string | null,
  })

  // ── Helpers ───────────────────────────────────────────────────────────────

  function _buildQuery(countOnly = false) {
    let q = supabase
      .from(VIEW)
      .select('*', { count: 'exact', head: countOnly })
      .order('data_recebida', { ascending: false, nullsFirst: false })

    const f = filtros.value
    if (f.dataInicio) q = q.gte('data_recebida', f.dataInicio)
    if (f.dataFim)    q = q.lte('data_recebida', f.dataFim + 'T23:59:59')
    if (f.transportadora) q = q.ilike('transportadora', `%${f.transportadora}%`)
    if (f.cliente)    q = q.ilike('cliente', `%${f.cliente}%`)
    if (f.classe)     q = q.eq('classe', f.classe)

    return q
  }

  // ── Busca paginada ────────────────────────────────────────────────────────

  async function fetchPagina(p = 1) {
    loading.value = true
    error.value   = null
    pagina.value  = p

    const from = (p - 1) * POR_PAGINA
    const to   = from + POR_PAGINA - 1

    const { data, count, error: err } = await _buildQuery().range(from, to)

    loading.value = false

    if (err) {
      error.value = err.message
      return
    }

    registros.value = (data as RelatorioEntradasResiduos[]) ?? []
    total.value     = count ?? 0
  }

  // ── Aplicar filtros (reset para pág. 1) ──────────────────────────────────

  async function aplicarFiltros(novosFiltros?: Partial<typeof filtros.value>) {
    if (novosFiltros) Object.assign(filtros.value, novosFiltros)
    await fetchPagina(1)
  }

  async function limparFiltros() {
    filtros.value = { dataInicio: null, dataFim: null, transportadora: null, cliente: null, classe: null }
    await fetchPagina(1)
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / POR_PAGINA)))

  const temAnterior  = computed(() => pagina.value > 1)
  const temProxima   = computed(() => pagina.value < totalPaginas.value)

  async function irPara(p: number) {
    if (p < 1 || p > totalPaginas.value) return
    await fetchPagina(p)
  }

  // ── Pendências SINIR ──────────────────────────────────────────────────────

  async function contarPendenciasSinir(
    inicio: string,
    fim: string,
    filtros?: { clienteId?: string | null; transportadoraId?: string | null },
  ): Promise<number> {
    let q = supabase
      .from(VIEW)
      .select('id', { count: 'exact', head: true })
      .is('mtr_sinir', null)
      .gte('data_recebida', inicio)
      .lte('data_recebida', fim + 'T23:59:59')

    if (filtros?.clienteId) q = q.ilike('cliente', `%${filtros.clienteId}%`)
    if (filtros?.transportadoraId) q = q.ilike('transportadora', `%${filtros.transportadoraId}%`)

    const { count, error: err } = await q
    if (err) throw new Error(err.message)
    return count ?? 0
  }

  // ── Exportação (todos os registros filtrados, sem paginação) ──────────────

  const loadingExport = ref(false)

  async function exportarTodos(): Promise<RelatorioEntradasResiduos[]> {
    loadingExport.value = true
    const { data, error: err } = await _buildQuery()
    loadingExport.value = false
    if (err) throw new Error(err.message)
    return (data as RelatorioEntradasResiduos[]) ?? []
  }

  return {
    registros,
    total,
    pagina,
    totalPaginas,
    temAnterior,
    temProxima,
    loading,
    loadingExport,
    error,
    filtros,
    fetchPagina,
    aplicarFiltros,
    limparFiltros,
    irPara,
    exportarTodos,
    contarPendenciasSinir,
    POR_PAGINA,
  }
}
