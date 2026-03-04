import { ref, computed } from 'vue'
import type { ViewMedicoesCompleta } from '~/types/viewMedicoesCompleta'

export function useViewMedicoesCompleta() {
    const supabase = useSupabaseClient<any>()
    const medicoes = ref<ViewMedicoesCompleta[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const search = ref('')

    const setLoading = (val: boolean) => (loading.value = val)
    const setError = (val: string | null) => (error.value = val)

    const handleError = (err: any) => {
        const message = err.message || 'Ocorreu um erro na operação'
        setError(message)
        return { success: false, error: message }
    }

    // ── Fetch todos ─────────────────────────────────────────────────────────
    async function fetchMedicoes() {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('view_medicoes_completa')
            .select('*')
            .order('data', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        medicoes.value = (data as ViewMedicoesCompleta[]) ?? []
        return { success: true, data: medicoes.value }
    }

    // ── Fetch por ID ────────────────────────────────────────────────────────
    async function fetchMedicaoById(medicaoId: string) {
        const { data, error: err } = await supabase
            .from('view_medicoes_completa')
            .select('*')
            .eq('medicao_id', medicaoId)
            .single()

        if (err) return handleError(err)
        return { success: true, data: data as ViewMedicoesCompleta }
    }

    // ── Filtro local ────────────────────────────────────────────────────────
    const medicoesFiltradas = computed(() => {
        const q = search.value.toLowerCase().trim()
        if (!q) return medicoes.value

        return medicoes.value.filter(m =>
            m.nome_tipo_medicao?.toLowerCase().includes(q) ||
            m.nome_operador?.toLowerCase().includes(q) ||
            m.observation?.toLowerCase().includes(q)
        )
    })

    return {
        medicoes,
        medicoesFiltradas,
        loading,
        error,
        search,
        fetchMedicoes,
        fetchMedicaoById
    }
}
