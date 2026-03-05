import { ref, computed, onMounted, shallowRef } from 'vue'
import type { Indicador } from '~/types/indicador'
import type { RegistroValorMedicao } from '~/types/registroValorMedicao'

// ── Constantes exportadas ─────────────────────────────────────────────────────
export const TIPOS_ALVO_KPI = [
    'Níveis das Lagoas',
    'Estoque dos Leitos e Blends',
    'Níveis das Valas de Infiltração',
]

// ── Sufixos de unidade para formatação ───────────────────────────────────────
const UNIDADE_SUFIXO: Record<string, string> = {
    'Percentual': '%',
    'Metros cúbicos': 'm³',
    'Litros': 'L',
    'Quilograma': 'kg',
    'Quantidade': 'un',
    'Intervalo de tempo (s)': 's',
}

// ── Helpers puros (sem reatividade) ──────────────────────────────────────────

/** Retorna a data de hoje em formato local YYYY-MM-DD, sem depender de UTC */
export function hojeLocal(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Remove acentos e normaliza string para comparação segura com banco de dados */
export function normalizar(str: string): string {
    return (str ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

/** Formata um valor numérico com o sufixo da unidade de medida */
export function formatarValor(valor: number, unidade: string): string {
    const sufixo = UNIDADE_SUFIXO[unidade] ?? ''
    const num = Number.isInteger(valor) ? valor : valor.toFixed(2)
    return sufixo ? `${num} ${sufixo}` : String(num)
}

/** Formata YYYY-MM-DD → DD/MM/YYYY */
export function formatData(dateStr: string): string {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
}

// ── Tipos internos ───────────────────────────────────────────────────────────
export interface ColunaTurno {
    uniqueId: string
    nome: string
    unidade: string
}

export interface LinhaTurno {
    turnoKey: string
    turnoLabel: string
    dataFormatada: string
    horaInicio: string
    horaFim: string
    valores: Record<string, number>
}

// ── Composable principal ─────────────────────────────────────────────────────
export function useFuncoesKPIDash() {
    const supabase = useSupabaseClient<any>()

    // Estado
    const loading = ref(false)
    const hoje = hojeLocal()

    // Filtros
    const tipoSelecionado = ref(TIPOS_ALVO_KPI[0])
    const dataFiltro = ref('')
    const periodoInicio = ref('')
    const periodoFim = ref('')

    // Painel de filtros
    const filtrosAbertos = ref(false)

    // Cache de dados brutos do Supabase
    const todosIndicadores = shallowRef<Indicador[]>([])
    const todosRegistros = shallowRef<RegistroValorMedicao[]>([])

    // Conjunto normalizado dos tipos alvo para matching no cliente
    const TIPOS_ALVO_NORM = new Set(TIPOS_ALVO_KPI.map(t => normalizar(t)))

    // ── Computeds ──────────────────────────────────────────────────────────────

    /** Conta quantos filtros de data estão ativos */
    const filtrosAtivos = computed(() => {
        let n = 0
        if (dataFiltro.value) n++
        if (periodoInicio.value) n++
        if (periodoFim.value) n++
        return n
    })

    /** Colunas da tabela: indicadores do tipo selecionado */
    const colunas = computed((): ColunaTurno[] => {
        const tipoNorm = normalizar(tipoSelecionado.value ?? '')
        return todosIndicadores.value
            .filter(i => normalizar(i.measurement_type ?? '') === tipoNorm)
            .map(i => ({
                uniqueId: i.unique_id ?? i.id,
                nome: i.name ?? '—',
                unidade: i.measurement_unit ?? '',
            }))
    })

    /** Linhas da tabela: registros agrupados por turno, filtrados por dia ou período */
    const linhas = computed((): LinhaTurno[] => {
        const temDia = !!dataFiltro.value
        const temPeriodo = !!(periodoInicio.value && periodoFim.value)
        if (!temDia && !temPeriodo) return []
        if (!colunas.value.length) return []

        const indicadorIds = new Set(colunas.value.map(c => c.uniqueId))

        const registrosFiltrados = todosRegistros.value.filter(r => {
            if (!r.indicator || !indicadorIds.has(r.indicator)) return false
            if (!r.date_range?.[0]) return false

            const dt = new Date(r.date_range[0] as string)

            if (periodoInicio.value && periodoFim.value) {
                return dt >= new Date(periodoInicio.value + 'T00:00:00') &&
                    dt <= new Date(periodoFim.value + 'T23:59:59')
            }

            if (dataFiltro.value) {
                return dt >= new Date(dataFiltro.value + 'T00:00:00') &&
                    dt <= new Date(dataFiltro.value + 'T23:59:59')
            }

            return false
        })

        const turnosMap = new Map<string, LinhaTurno>()

        for (const reg of registrosFiltrados) {
            const inicio = reg.date_range![0] as string
            const fim = (reg.date_range![1] ?? inicio) as string
            const turnoKey = `${inicio}__${fim}`

            if (!turnosMap.has(turnoKey)) {
                const dtInicio = new Date(inicio)
                const hora = dtInicio.getHours()
                const turnoLabel = hora >= 5 && hora < 18 ? 'Manhã' : 'Noite'

                turnosMap.set(turnoKey, {
                    turnoKey,
                    turnoLabel,
                    dataFormatada: dtInicio.toLocaleDateString('pt-BR'),
                    horaInicio: dtInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    horaFim: new Date(fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    valores: {},
                })
            }

            const turno = turnosMap.get(turnoKey)!
            if (reg.indicator && reg.value !== null && reg.value !== undefined) {
                turno.valores[reg.indicator] = reg.value
            }
        }

        return [...turnosMap.values()].sort((a, b) =>
            b.turnoKey.localeCompare(a.turnoKey)
        )
    })

    // ── Ações ──────────────────────────────────────────────────────────────────

    /** Navega o filtro de dia em +/- 1 dia */
    function navegarDia(delta: number) {
        const base = dataFiltro.value || hoje
        const d = new Date(base + 'T12:00:00')
        d.setDate(d.getDate() + delta)
        const nova = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (delta > 0 && nova > hoje) return
        dataFiltro.value = nova
        periodoInicio.value = ''
        periodoFim.value = ''
    }

    /** Limpa todos os filtros de data */
    function limparFiltros() {
        dataFiltro.value = ''
        periodoInicio.value = ''
        periodoFim.value = ''
    }

    /** Busca indicadores e registros do Supabase */
    async function carregarDados() {
        loading.value = true

        const { data: indData } = await supabase
            .from('indicadores')
            .select('id, unique_id, name, measurement_type, measurement_unit')
            .order('name', { ascending: true })

        todosIndicadores.value = ((indData as Indicador[]) ?? [])
            .filter(i => TIPOS_ALVO_NORM.has(normalizar(i.measurement_type ?? '')))

        const ids = todosIndicadores.value.map(i => i.unique_id ?? i.id).filter(Boolean)

        if (ids.length > 0) {
            const { data: regData } = await supabase
                .from('registro_valor_medicao')
                .select('unique_id, indicator, measurement, date_range, value, operator')
                .in('indicator', ids)
                .order('date_range', { ascending: false })

            todosRegistros.value = (regData as RegistroValorMedicao[]) ?? []
        }

        // Auto-preenche com hoje se houver registros e detecta o tipo com dados
        const hojeInicio = new Date(hoje + 'T00:00:00')
        const hojeFim = new Date(hoje + 'T23:59:59')

        const registrosHoje = todosRegistros.value.filter(r => {
            if (!r.date_range?.[0]) return false
            const dt = new Date(r.date_range[0] as string)
            return dt >= hojeInicio && dt <= hojeFim
        })

        if (registrosHoje.length > 0) {
            dataFiltro.value = hoje

            // Identifica qual tipo tem mais registros hoje e seleciona automaticamente
            // Mapeia indicator → measurement_type via todosIndicadores
            const indMap = new Map(
                todosIndicadores.value.map(i => [i.unique_id ?? i.id, i.measurement_type ?? ''])
            )

            const contagemPorTipo = new Map<string, number>()
            for (const r of registrosHoje) {
                const tipo = indMap.get(r.indicator ?? '') ?? ''
                if (!tipo) continue
                // Encontra o tipo original (com acentos) correspondente
                const tipoOriginal = TIPOS_ALVO_KPI.find(t => normalizar(t) === normalizar(tipo))
                if (tipoOriginal) {
                    contagemPorTipo.set(tipoOriginal, (contagemPorTipo.get(tipoOriginal) ?? 0) + 1)
                }
            }

            // Seleciona o tipo com mais registros hoje
            if (contagemPorTipo.size > 0) {
                const melhor = [...contagemPorTipo.entries()].sort((a, b) => b[1] - a[1])[0]
                if (melhor) tipoSelecionado.value = melhor[0]
            }
        }

        loading.value = false
    }

    onMounted(carregarDados)

    return {
        // Constantes
        TIPOS_ALVO_KPI,
        hoje,
        // Estado reativo
        loading,
        tipoSelecionado,
        dataFiltro,
        periodoInicio,
        periodoFim,
        filtrosAbertos,
        filtrosAtivos,
        // Dados computados
        colunas,
        linhas,
        // Ações
        navegarDia,
        limparFiltros,
        formatarValor,
        formatData,
    }
}
