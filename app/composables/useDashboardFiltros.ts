import { ref, computed } from 'vue'

export type PeriodoDashboard = 'hoje' | 'semana' | 'mes' | 'ano' | 'intervalo'

// Estado compartilhado entre todos os componentes do dashboard (module-level singleton)
const periodo = ref<PeriodoDashboard>('mes')
const intervaloInicio = ref('')
const intervaloFim = ref('')
const clienteId = ref<string | null>(null)
const tipoResiduoId = ref<string | null>(null)
const transportadoraId = ref<string | null>(null)
const ultimaAtualizacao = ref(new Date())
const refreshKey = ref(0)
const aplicarKey = ref(0)

export const useDashboardFiltros = () => {
    const periodoOpcoes: { valor: PeriodoDashboard; label: string }[] = [
        { valor: 'hoje', label: 'Hoje' },
        { valor: 'semana', label: 'Esta Semana' },
        { valor: 'mes', label: 'Este Mês' },
        { valor: 'ano', label: 'Este Ano' },
        { valor: 'intervalo', label: 'Intervalo' },
    ]

    const periodoLabel = computed(() =>
        periodoOpcoes.find(o => o.valor === periodo.value)?.label ?? 'Este Mês'
    )

    const datasAtual = computed(() => {
        const now = new Date()
        switch (periodo.value) {
            case 'hoje': {
                const d = now.toISOString().split('T')[0]!
                return { inicio: d, fim: d }
            }
            case 'semana': {
                const day = now.getDay()
                const seg = new Date(now)
                seg.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
                return {
                    inicio: seg.toISOString().split('T')[0]!,
                    fim: now.toISOString().split('T')[0]!,
                }
            }
            case 'mes': {
                return {
                    inicio: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]!,
                    fim: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]!,
                }
            }
            case 'ano': {
                return { inicio: `${now.getFullYear()}-01-01`, fim: `${now.getFullYear()}-12-31` }
            }
            case 'intervalo': {
                const hoje = now.toISOString().split('T')[0]!
                return {
                    inicio: intervaloInicio.value || hoje,
                    fim: intervaloFim.value || hoje,
                }
            }
        }
    })

    const datasAnterior = computed(() => {
        const { inicio, fim } = datasAtual.value
        const now = new Date()
        switch (periodo.value) {
            case 'hoje': {
                const d = new Date(inicio); d.setDate(d.getDate() - 1)
                const s = d.toISOString().split('T')[0]!
                return { inicio: s, fim: s }
            }
            case 'semana': {
                const i = new Date(inicio); i.setDate(i.getDate() - 7)
                const f = new Date(fim); f.setDate(f.getDate() - 7)
                return { inicio: i.toISOString().split('T')[0]!, fim: f.toISOString().split('T')[0]! }
            }
            case 'mes': {
                const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                return {
                    inicio: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]!,
                    fim: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]!,
                }
            }
            case 'ano': {
                const y = now.getFullYear() - 1
                return { inicio: `${y}-01-01`, fim: `${y}-12-31` }
            }
            case 'intervalo': {
                const i = new Date(inicio)
                const f = new Date(fim)
                const durMs = f.getTime() - i.getTime() + 86400000
                const antFim = new Date(i.getTime() - 86400000)
                const antIni = new Date(antFim.getTime() - durMs + 86400000)
                return {
                    inicio: antIni.toISOString().split('T')[0]!,
                    fim: antFim.toISOString().split('T')[0]!,
                }
            }
        }
    })

    function atualizar() {
        ultimaAtualizacao.value = new Date()
        refreshKey.value++
    }

    function aplicarFiltros() {
        aplicarKey.value++
    }

    function limparFiltros() {
        clienteId.value = null
        tipoResiduoId.value = null
        transportadoraId.value = null
        aplicarKey.value++
    }

    return {
        periodo,
        periodoLabel,
        periodoOpcoes,
        intervaloInicio,
        intervaloFim,
        clienteId,
        tipoResiduoId,
        transportadoraId,
        datasAtual,
        datasAnterior,
        ultimaAtualizacao,
        refreshKey,
        aplicarKey,
        atualizar,
        aplicarFiltros,
        limparFiltros,
    }
}
