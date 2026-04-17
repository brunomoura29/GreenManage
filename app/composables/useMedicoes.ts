import { ref, computed } from 'vue'
import type { Medicao, MedicaoInsert, MedicaoUpdate } from '~/types/medicao'

export function useMedicoes() {
    const supabase = useSupabaseClient<any>()
    const medicoes = ref<Medicao[]>([])
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

    // ── Fetch ──────────────────────────────────────────────────────────────
    async function fetchMedicoes() {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('medicoes')
            .select('*')
            .order('date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        medicoes.value = (data as Medicao[]) ?? []
        return { success: true, data: medicoes.value }
    }

    // ── Fetch por unique_id ─────────────────────────────────────────────────
    async function fetchMedicaoByUniqueId(uniqueId: string) {
        const { data, error: err } = await supabase
            .from('medicoes')
            .select('*')
            .eq('unique_id', uniqueId)
            .single()

        if (err) return handleError(err)
        return { success: true, data: data as Medicao }
    }

    // ── Create ─────────────────────────────────────────────────────────────
    async function createMedicao(payload: MedicaoInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('medicoes')
            .insert([{
                ...payload,
                creation_date: now,
                modified_date: now
            }])
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as Medicao }
    }

    // ── Update ─────────────────────────────────────────────────────────────
    async function updateMedicao(id: string, payload: MedicaoUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('medicoes')
            .update({
                ...payload,
                modified_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as Medicao }
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    async function deleteMedicao(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('medicoes')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        return { success: true }
    }

    // ── Fetch última data de medição ───────────────────────────────────────
    async function fetchUltimaMedicaoData(): Promise<string | null> {
        const { data, error: err } = await supabase
            .from('medicoes')
            .select('date')
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (err || !data) return null
        return (data as any).date ?? null
    }

    // ── Filtro local ────────────────────────────────────────────────────────
    const medicoesFiltradas = computed(() => {
        const q = search.value.toLowerCase().trim()
        if (!q) return medicoes.value

        return medicoes.value.filter(m =>
            m.measurement_type?.toLowerCase().includes(q) ||
            m.operator?.toLowerCase().includes(q) ||
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
        fetchMedicaoByUniqueId,
        fetchUltimaMedicaoData,
        createMedicao,
        updateMedicao,
        deleteMedicao
    }
}
