import type { Contato } from '~/composables/useContatos'

interface ResiduoEnriquecido {
    unique_id: string | null
    date: string | null
    nome_residue_type: string | null
    description_resiudo: string | null
    nome_transportadora: string | null
    volume_in_m3: number | null
    ph: number | null
    temperature: number | null
    conductivity: number | null
    destiny_place: string | null
    nome_local: string | null
    operador_que_recebeu: string | null
    nome_operador: string | null
}

interface TransacaoEstoqueCompleto {
    unique_id: string
    nome_insumo: string | null
    stock_before: number | null
    stock_after: number | null
    stock_difference: number | null
    cost_of_difference: number | null
    type: string | null
    date: string | null
}

interface RegistroMedicaoRaw {
    measurement: string | null
    operator: string | null
    value: string | number | null
    date_range: string[] | null
    indicator: string | null
}

interface IndicadorRaw {
    unique_id: string
    name: string | null
    measurement_type: string | null
}

export interface RegistroMedicaoFormatado {
    id_medicao: string
    turnos: string
    operador: string
    valor_medicao: number | null
    name: string
    measurement_type: string
    indicator: string
}

export interface FiltrosMedicoes {
    data: string
    tipoIndicador?: string | null
}

export interface FiltrosResiduos {
    dataInicio: string
    dataFim: string
    transportadoraId?: string | null
    clienteId?: string | null
    tipoResiduoId?: string | null
}

export interface FiltrosEstoque {
    dataInicio: string
    dataFim: string
    insumoId?: string | null
}

export interface FiltrosRelatorio {
    medicoes: FiltrosMedicoes
    residuos: FiltrosResiduos
    estoque: FiltrosEstoque
    contatosIds?: string[]
}

// ── Helpers de formatação ────────────────────────────────────────────────────

function formatarData(iso: string | null | undefined): string {
    if (!iso) return ''
    const d = new Date(iso)
    return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

function formatarTurno(iso: string | null | undefined): string {
    if (!iso) return ''
    const d = new Date(iso)
    const dd  = String(d.getUTCDate()).padStart(2, '0')
    const mm  = String(d.getUTCMonth() + 1).padStart(2, '0')
    const yy  = String(d.getUTCFullYear()).slice(2)
    const hh  = String(d.getUTCHours()).padStart(2, '0')
    const min = String(d.getUTCMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yy}, ${hh}:${min}\n\n\n`
}

function formatarNumero(n: number | null | undefined): string {
    if (n == null) return '0,00'
    return n.toFixed(2).replace('.', ',')
}

function formatarMoeda(n: number | null | undefined): string {
    if (n == null) return 'R$0,00'
    return `R$${n.toFixed(2).replace('.', ',')}`
}

// ── Composable ───────────────────────────────────────────────────────────────

export const useRelatorioOperacional = () => {
    const supabase = useSupabaseClient() as any

    async function montarRelatorio(filtros: FiltrosRelatorio): Promise<object> {
        const [medicoes, residuos, transacoes, contatosData] = await Promise.all([
            _fetchMedicoes(filtros.medicoes),
            _fetchResiduos(filtros.residuos),
            _fetchEstoque(filtros.estoque),
            _fetchContatos(filtros.contatosIds),
        ])

        return [{
            body: {
                medicoes,

                'periodo-medicoes': formatarData(filtros.medicoes.data + 'T00:00:00'),
                'periodo-residuos': {
                    de:  formatarData(filtros.residuos.dataInicio + 'T00:00:00'),
                    ate: formatarData(filtros.residuos.dataFim    + 'T00:00:00'),
                },
                'periodo-estoque': {
                    de:  formatarData(filtros.estoque.dataInicio + 'T00:00:00'),
                    ate: formatarData(filtros.estoque.dataFim    + 'T00:00:00'),
                },

                residuos: residuos.map((r) => ({
                    'descricao': r.nome_residue_type ?? r.description_resiudo ?? '',
                    'transportador': r.nome_transportadora ?? '',
                    'volume': formatarNumero(r.volume_in_m3),
                    'ph': formatarNumero(r.ph),
                    'temperatura': formatarNumero(r.temperature),
                    'condutividade': formatarNumero(r.conductivity),
                    'lagoa-de-destinacao': r.nome_local ?? r.destiny_place ?? '',
                    'operador': r.nome_operador ?? r.operador_que_recebeu ?? '',
                    'residue-unique_id': r.unique_id ?? '',
                    'data': formatarData(r.date),
                })),

                transacoes: transacoes.map((t) => ({
                    'insumo': t.nome_insumo ?? '',
                    'estoque-antes': formatarNumero(t.stock_before),
                    'total-movimentado': formatarNumero(t.stock_difference),
                    'estoque-depois': formatarNumero(t.stock_after),
                    'custo-caso-consumo': formatarMoeda(t.cost_of_difference),
                    'tipo-de-transacao': t.type ?? '',
                    'unique_id': t.unique_id,
                })),

                'data-da-operacao': formatarData(filtros.medicoes.data + 'T00:00:00'),

                contatos: contatosData.map((c) => ({
                    nome: c.nome,
                    telefone: c.telefone,
                })),
            },
        }]
    }

    async function fetchTiposIndicador(): Promise<string[]> {
        const { data, error } = await supabase
            .from('medicoes')
            .select('measurement_type')
            .not('measurement_type', 'is', null)

        if (error || !data) return []
        return [...new Set((data as { measurement_type: string }[]).map(d => d.measurement_type))]
            .filter(Boolean)
            .sort()
    }

    // ── Queries privadas ─────────────────────────────────────────────────────

    async function _fetchMedicoes(f: FiltrosMedicoes): Promise<RegistroMedicaoFormatado[]> {
        // 1. Busca medições do dia (com filtro de tipo opcional)
        let medicaoQuery = supabase
            .from('medicoes')
            .select('unique_id')
            .gte('date', `${f.data}T00:00:00`)
            .lte('date', `${f.data}T23:59:59`)

        if (f.tipoIndicador) medicaoQuery = medicaoQuery.eq('measurement_type', f.tipoIndicador)

        const { data: medicoesList } = await medicaoQuery
        if (!medicoesList?.length) return []

        const medicaoIds = (medicoesList as { unique_id: string }[]).map(m => m.unique_id).filter(Boolean)

        // 2. Busca os registros de valores para essas medições
        const { data: registros } = await supabase
            .from('registro_valor_medicao')
            .select('measurement, operator, value, date_range, indicator')
            .in('measurement', medicaoIds)
            .order('date_range', { ascending: true })

        if (!registros?.length) return []

        const rows = registros as RegistroMedicaoRaw[]

        // 3. Busca os indicadores referenciados
        const indicadorIds = [...new Set(rows.map(r => r.indicator).filter(Boolean))] as string[]
        const { data: indicadoresList } = await supabase
            .from('indicadores')
            .select('unique_id, name, measurement_type')
            .in('unique_id', indicadorIds)

        const indicadorMap = new Map<string, IndicadorRaw>(
            (indicadoresList as IndicadorRaw[] ?? []).map(i => [i.unique_id, i])
        )

        // 4. Formata o resultado
        return rows.map((r) => {
            const ind = r.indicator ? indicadorMap.get(r.indicator) : undefined
            const turnoStart = r.date_range?.[0] ?? null
            const valor = r.value != null ? Number(r.value) : null

            return {
                id_medicao:       r.measurement ?? '',
                turnos:           formatarTurno(turnoStart),
                operador:         r.operator ?? '',
                valor_medicao:    Number.isNaN(valor) ? null : valor,
                name:             ind?.name ?? '',
                measurement_type: ind?.measurement_type ?? '',
                indicator:        r.indicator ?? '',
            }
        })
    }

    async function _fetchResiduos(f: FiltrosResiduos): Promise<ResiduoEnriquecido[]> {
        let query = supabase
            .from('view_transacoes_detalhe_completo')
            .select('unique_id, date, nome_residue_type, description_resiudo, nome_transportadora, volume_in_m3, ph, temperature, conductivity, destiny_place, operador_que_recebeu')
            .gte('date', `${f.dataInicio}T00:00:00`)
            .lte('date', `${f.dataFim}T23:59:59`)
            .eq('transaction_type', 'Entrada')
            .order('date', { ascending: true })

        if (f.transportadoraId) query = query.eq('carrier', f.transportadoraId)
        if (f.clienteId)        query = query.eq('cliente_id', f.clienteId)
        if (f.tipoResiduoId)    query = query.eq('residue_type', f.tipoResiduoId)

        const { data, error } = await query
        if (error || !data) return []

        const rows = data as ResiduoEnriquecido[]

        // Resolve nomes de locais e operadores
        const localIds    = [...new Set(rows.map(r => r.destiny_place).filter(Boolean))] as string[]
        const operadorIds = [...new Set(rows.map(r => r.operador_que_recebeu).filter(Boolean))] as string[]

        const [locaisRes, operadoresRes] = await Promise.all([
            localIds.length    ? supabase.from('locais').select('unique_id, name').in('unique_id', localIds)       : { data: [] },
            operadorIds.length ? supabase.from('operadores').select('unique_id, name').in('unique_id', operadorIds) : { data: [] },
        ])

        const localMap    = new Map<string, string>((locaisRes.data    ?? []).map((l: any) => [l.unique_id, l.name]))
        const operadorMap = new Map<string, string>((operadoresRes.data ?? []).map((o: any) => [o.unique_id, o.name]))

        return rows.map(r => ({
            ...r,
            nome_local:     r.destiny_place         ? (localMap.get(r.destiny_place)         ?? r.destiny_place)         : null,
            nome_operador:  r.operador_que_recebeu   ? (operadorMap.get(r.operador_que_recebeu) ?? r.operador_que_recebeu) : null,
        }))
    }

    async function _fetchEstoque(f: FiltrosEstoque): Promise<TransacaoEstoqueCompleto[]> {
        let query = supabase
            .from('view_transacoes_estoque_completo')
            .select('unique_id, nome_insumo, stock_before, stock_after, stock_difference, cost_of_difference, type, date')
            .gte('date', f.dataInicio)
            .lte('date', f.dataFim)
            .order('creation_date', { ascending: true })

        if (f.insumoId) query = query.eq('insumo_id', f.insumoId)

        const { data, error } = await query
        if (error || !data) return []
        return data as TransacaoEstoqueCompleto[]
    }

    async function _fetchContatos(ids?: string[]): Promise<Contato[]> {
        let query = supabase
            .from('contatos')
            .select('nome, telefone')
            .order('nome', { ascending: true })

        if (ids && ids.length > 0) query = query.in('unique_id', ids)

        const { data, error } = await query
        if (error || !data) return []
        return data as Contato[]
    }

    return { montarRelatorio, fetchTiposIndicador }
}
