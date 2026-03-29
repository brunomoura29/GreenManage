import type { TransacaoListaDetalhe, TransacaoListaDetalheInsert, TransacaoListaDetalheUpdate } from '~/types/transacaoListaDetalhe'

export const useTransacoesListaDetalhe = () => {
    const supabase = useSupabaseClient() as any

    const detalhes = ref<TransacaoListaDetalhe[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // ── Helpers internos ──────────────────────────────────────────────────────

    function setLoading(value: boolean) {
        loading.value = value
        if (value) error.value = null
    }

    function handleError(err: { message: string } | null, fallback = 'Erro desconhecido') {
        error.value = err?.message ?? fallback
        return { success: false, data: null, error: error.value }
    }

    // ── READ – listar todos ───────────────────────────────────────────────────

    async function fetchDetalhes() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('view_transacoes_detalhe_completo')
            .select('*')
            .order('date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        detalhes.value = (data as TransacaoListaDetalhe[]) ?? []
        return { success: true, data: detalhes.value, error: null }
    }

    // ── READ – buscar por residue_operation (unique_id da entrada) ────────────

    async function fetchDetalhesByEntrada(residueOperation: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('view_transacoes_detalhe_completo')
            .select('*')
            .eq('residue_operation', residueOperation)
            .order('date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        detalhes.value = (data as TransacaoListaDetalhe[]) ?? []
        return { success: true, data: detalhes.value, error: null }
    }

    // ── READ – contar por residue_operation ───────────────────────────────────

    async function fetchContagemByEntrada(residueOperation: string): Promise<number> {
        const { count } = await supabase
            .from('transacoes_lista_detalhe')
            .select('*', { count: 'exact', head: true })
            .eq('residue_operation', residueOperation)

        return count ?? 0
    }

    // ── READ – buscar por unique_id ───────────────────────────────────────────

    async function fetchDetalheByUniqueId(uniqueId: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .select('*')
            .eq('unique_id', uniqueId)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as TransacaoListaDetalhe, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createDetalhe(payload: TransacaoListaDetalheInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as TransacaoListaDetalhe
        detalhes.value.unshift(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateDetalhe(id: string, payload: TransacaoListaDetalheUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as TransacaoListaDetalhe
        const index = detalhes.value.findIndex((d) => d.id === id)
        if (index !== -1) detalhes.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteDetalhe(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        detalhes.value = detalhes.value.filter((d) => d.id !== id)
        return { success: true, data: null, error: null }
    }

    // ── CÁLCULOS / KPIs ───────────────────────────────────────────────────────

    type FiltrosDashboard = {
        clienteId?: string | null
        tipoResiduoId?: string | null
        transportadoraId?: string | null
    }

    function _aplicarFiltros(query: any, f?: FiltrosDashboard) {
        if (f?.clienteId)       query = query.eq('cliente_id', f.clienteId)
        if (f?.tipoResiduoId)   query = query.eq('residue_type', f.tipoResiduoId)
        if (f?.transportadoraId) query = query.eq('carrier', f.transportadoraId)
        return query
    }

    async function _countManifestosPorPeriodo(inicio: string, fim: string, filtros?: FiltrosDashboard): Promise<number> {
        let query = supabase
            .from('view_transacoes_detalhe_completo')
            .select('mtr')
            .gte('date', inicio)
            .lte('date', fim)
            .not('mtr', 'is', null)

        query = _aplicarFiltros(query, filtros)

        const { data, error: err } = await query
        if (err || !data) return 0
        return new Set((data as { mtr: string }[]).map(d => d.mtr)).size
    }

    async function countManifestosMesAtual(): Promise<number> {
        const now = new Date()
        const inicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!
        const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]!
        return _countManifestosPorPeriodo(inicio, fim)
    }

    async function _somarVolumePorPeriodo(inicio: string, fim: string, filtros?: FiltrosDashboard): Promise<number> {
        let query = supabase
            .from('view_transacoes_detalhe_completo')
            .select('volume_in_m3')
            .gte('date', inicio)
            .lte('date', fim)
            .not('volume_in_m3', 'is', null)

        query = _aplicarFiltros(query, filtros)

        const { data, error: err } = await query
        if (err || !data) return 0
        return (data as { volume_in_m3: number }[]).reduce((acc, d) => acc + (d.volume_in_m3 ?? 0), 0)
    }

    function _formatVariacao(atual: number, anterior: number): string {
        if (anterior === 0) return atual > 0 ? '+100%' : '0%'
        const pct = (atual - anterior) / anterior * 100
        return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%'
    }

    async function calcularKpiManifestos(
        inicio: string, fim: string,
        inicioAnt: string, fimAnt: string,
        filtros?: FiltrosDashboard,
    ): Promise<{ atual: number; anterior: number; variacao: string; trendUp: boolean }> {
        const [atual, anterior] = await Promise.all([
            _countManifestosPorPeriodo(inicio, fim, filtros),
            _countManifestosPorPeriodo(inicioAnt, fimAnt, filtros),
        ])
        return { atual, anterior, variacao: _formatVariacao(atual, anterior), trendUp: atual >= anterior }
    }

    async function calcularKpiVolume(
        inicio: string, fim: string,
        inicioAnt: string, fimAnt: string,
        filtros?: FiltrosDashboard,
    ): Promise<{ atual: number; anterior: number; variacao: string; trendUp: boolean }> {
        const [atual, anterior] = await Promise.all([
            _somarVolumePorPeriodo(inicio, fim, filtros),
            _somarVolumePorPeriodo(inicioAnt, fimAnt, filtros),
        ])
        return { atual, anterior, variacao: _formatVariacao(atual, anterior), trendUp: atual >= anterior }
    }

    async function fetchVolumeGrafico(inicio: string, fim: string, filtros?: FiltrosDashboard): Promise<{
        labels: string[]
        dados: number[]
        granularidade: 'dia' | 'mes'
    }> {
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        const inicioDate = new Date(inicio)
        const fimDate = new Date(fim)

        // Não exibe datas futuras sem dados
        const fimCapado = fimDate > hoje ? hoje : fimDate

        const diffDias = Math.ceil((fimCapado.getTime() - inicioDate.getTime()) / 86_400_000) + 1

        // Limita a 365 dias
        const fimEfetivo = diffDias > 365
            ? new Date(inicioDate.getTime() + 364 * 86_400_000).toISOString().split('T')[0]!
            : fimCapado.toISOString().split('T')[0]!

        const granularidade: 'dia' | 'mes' = diffDias > 31 ? 'mes' : 'dia'

        let query = supabase
            .from('view_transacoes_detalhe_completo')
            .select('date, volume_in_m3')
            .gte('date', inicio)
            .lte('date', fimEfetivo)
            .not('volume_in_m3', 'is', null)
            .order('date', { ascending: true })

        query = _aplicarFiltros(query, filtros)

        const { data, error: err } = await query

        if (err || !data) return { labels: [], dados: [], granularidade }

        const rows = data as { date: string; volume_in_m3: number }[]

        if (granularidade === 'dia') {
            const map = new Map<string, number>()
            const d = new Date(inicio)
            const f = new Date(fimEfetivo)
            while (d <= f) {
                map.set(d.toISOString().split('T')[0]!, 0)
                d.setDate(d.getDate() + 1)
            }
            for (const row of rows) {
                const key = row.date.substring(0, 10)
                map.set(key, (map.get(key) ?? 0) + row.volume_in_m3)
            }
            const labels = [...map.keys()].map(k => {
                const [, m, d2] = k.split('-')
                return `${d2}/${m}`
            })
            return { labels, dados: [...map.values()], granularidade }
        } else {
            const map = new Map<string, number>()
            const d = new Date(inicioDate.getFullYear(), inicioDate.getMonth(), 1)
            const fM = new Date(new Date(fimEfetivo).getFullYear(), new Date(fimEfetivo).getMonth(), 1)
            while (d <= fM) {
                map.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0)
                d.setMonth(d.getMonth() + 1)
            }
            for (const row of rows) {
                const key = row.date.substring(0, 7)
                map.set(key, (map.get(key) ?? 0) + row.volume_in_m3)
            }
            const labels = [...map.keys()].map(k => {
                const [y, m] = k.split('-')
                return new Date(parseInt(y!), parseInt(m!) - 1, 1)
                    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
            })
            return { labels, dados: [...map.values()], granularidade }
        }
    }

    const PALETTE = [
        '#059669', '#10b981', '#34d399', '#6ee7b7',
        '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4',
        '#047857', '#065f46', '#94a3b8',
    ]

    async function fetchClassificacaoResiduos(
        inicio: string,
        fim: string,
        filtros?: FiltrosDashboard,
    ): Promise<{
        itens: { label: string; volume: number; pct: string; color: string }[]
        total: number
        gradiente: string
    }> {
        let query = supabase
            .from('view_transacoes_detalhe_completo')
            .select('nome_residue_type, volume_in_m3')
            .gte('date', inicio)
            .lte('date', fim)
            .not('volume_in_m3', 'is', null)

        query = _aplicarFiltros(query, filtros)

        const { data, error: err } = await query
        if (err || !data) return { itens: [], total: 0, gradiente: '' }

        const rows = data as { nome_residue_type: string | null; volume_in_m3: number }[]

        // Agrupa volume por nome do tipo de resíduo
        const mapa = new Map<string, number>()
        for (const row of rows) {
            const key = row.nome_residue_type ?? 'Sem tipo'
            mapa.set(key, (mapa.get(key) ?? 0) + row.volume_in_m3)
        }

        const total = [...mapa.values()].reduce((a, b) => a + b, 0)

        // Ordena por volume decrescente
        const sorted = [...mapa.entries()].sort((a, b) => b[1] - a[1])

        const itens = sorted.map(([label, volume], i) => ({
            label,
            color: PALETTE[i % PALETTE.length]!,
            volume,
            pct: total > 0 ? Math.round((volume / total) * 100) + '%' : '0%',
        }))

        // Gera conic-gradient dinâmico
        let acum = 0
        const stops = itens.map(i => {
            const pctNum = total > 0 ? Math.round((i.volume / total) * 100) : 0
            const ini = acum
            acum += pctNum
            return `${i.color} ${ini}% ${acum}%`
        })
        const gradiente = stops.length ? `conic-gradient(${stops.join(', ')})` : ''

        return { itens, total, gradiente }
    }

    async function fetchVolumePorMes(meses = 12): Promise<{ label: string; valor: number }[]> {
        const now = new Date()
        const resultado: { label: string; valor: number }[] = []

        for (let i = meses - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const inicio = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]!
            const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]!
            const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

            const valor = await _somarVolumePorPeriodo(inicio, fim)
            resultado.push({ label, valor })
        }

        return resultado
    }

    async function calcularVariacaoVolume(): Promise<{
        atual: number
        anterior: number
        variacao: string
        trendUp: boolean
    }> {
        const now = new Date()

        const inicioAtual = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!
        const fimAtual = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]!

        const inicioAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]!
        const fimAnterior = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]!

        const [atual, anterior] = await Promise.all([
            _somarVolumePorPeriodo(inicioAtual, fimAtual),
            _somarVolumePorPeriodo(inicioAnterior, fimAnterior),
        ])

        const trendUp = atual >= anterior

        let variacao: string
        if (anterior === 0) {
            variacao = atual > 0 ? '+100%' : '0%'
        } else {
            const pct = ((atual - anterior) / anterior) * 100
            variacao = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%'
        }

        return { atual, anterior, variacao, trendUp }
    }

    async function calcularVariacaoManifestos(): Promise<{
        atual: number
        anterior: number
        variacao: string
        trendUp: boolean
    }> {
        const now = new Date()

        const inicioAtual = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!
        const fimAtual = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]!

        const inicioAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]!
        const fimAnterior = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]!

        const [atual, anterior] = await Promise.all([
            _countManifestosPorPeriodo(inicioAtual, fimAtual),
            _countManifestosPorPeriodo(inicioAnterior, fimAnterior),
        ])

        const trendUp = atual >= anterior

        let variacao: string
        if (anterior === 0) {
            variacao = atual > 0 ? '+100%' : '0%'
        } else {
            const pct = ((atual - anterior) / anterior) * 100
            variacao = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%'
        }

        return { atual, anterior, variacao, trendUp }
    }

    // ── DELETE – remover todos os detalhes de uma entrada ─────────────────────

    async function deleteDetalhesByEntrada(residueOperation: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .delete()
            .eq('residue_operation', residueOperation)

        setLoading(false)
        if (err) return handleError(err)

        detalhes.value = detalhes.value.filter((d) => d.residue_operation !== residueOperation)
        return { success: true, data: null, error: null }
    }

    return {
        detalhes,
        loading,
        error,
        fetchDetalhes,
        fetchDetalhesByEntrada,
        fetchContagemByEntrada,
        fetchDetalheByUniqueId,
        createDetalhe,
        updateDetalhe,
        deleteDetalhe,
        deleteDetalhesByEntrada,
        countManifestosMesAtual,
        calcularVariacaoManifestos,
        calcularVariacaoVolume,
        calcularKpiManifestos,
        calcularKpiVolume,
        fetchVolumeGrafico,
        fetchVolumePorMes,
        fetchClassificacaoResiduos,
    }
}
