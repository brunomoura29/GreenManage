import { ref } from 'vue'
import type { RegistroIndicador, RegistroIndicadorInsert, RegistroIndicadorUpdate } from '~/types/registroIndicador'

export function useRegistroIndicadores() {
    const supabase = useSupabaseClient<any>()
    const registros = ref<RegistroIndicador[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const setLoading = (val: boolean) => (loading.value = val)
    const setError = (val: string | null) => (error.value = val)

    const handleError = (err: any) => {
        const message = err.message || 'Ocorreu um erro na operação'
        setError(message)
        return { success: false, error: message }
    }

    // ── Fetch todos ─────────────────────────────────────────────────────────
    async function fetchRegistros() {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('registro_indicadores')
            .select('*')
            .order('creation_date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        registros.value = (data as RegistroIndicador[]) ?? []
        return { success: true, data: registros.value }
    }

    // ── Fetch por medicao (unique_id da medição) ────────────────────────────
    async function fetchRegistrosByMedicao(medicaoUniqueId: string) {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('registro_indicadores')
            .select('*')
            .eq('measurement', medicaoUniqueId)
            .order('creation_date', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: (data as RegistroIndicador[]) ?? [] }
    }

    // ── Create ─────────────────────────────────────────────────────────────
    async function createRegistroIndicador(payload: RegistroIndicadorInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('registro_indicadores')
            .insert([{
                ...payload,
                creation_date: now,
                modified_date: now
            }])
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as RegistroIndicador }
    }

    // ── Update ─────────────────────────────────────────────────────────────
    async function updateRegistroIndicador(id: string, payload: RegistroIndicadorUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('registro_indicadores')
            .update({
                ...payload,
                modified_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as RegistroIndicador }
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    async function deleteRegistroIndicador(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('registro_indicadores')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        return { success: true }
    }

    // ── Delete todos de uma medição ─────────────────────────────────────────
    async function deleteRegistrosByMedicao(medicaoUniqueId: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('registro_indicadores')
            .delete()
            .eq('measurement', medicaoUniqueId)

        setLoading(false)
        if (err) return handleError(err)

        return { success: true }
    }

    // ── Contagem por medição ────────────────────────────────────────────────
    // Retorna { [medicaoUniqueId]: count } para exibir na coluna Qtd Indicadores
    async function fetchContagemPorMedicao(medicaoUniqueIds?: string[]): Promise<Record<string, number>> {
        let query = supabase
            .from('registro_indicadores')
            .select('measurement')

        // Se houver IDs, filtra apenas os relevantes
        if (medicaoUniqueIds && medicaoUniqueIds.length > 0) {
            query = query.in('measurement', medicaoUniqueIds)
        }

        const { data, error: err } = await query

        if (err || !data) return {}

        return (data as { measurement: string | null }[]).reduce(
            (acc: Record<string, number>, row) => {
                if (row.measurement) {
                    acc[row.measurement] = (acc[row.measurement] ?? 0) + 1
                }
                return acc
            },
            {}
        )
    }

    return {
        registros,
        loading,
        error,
        fetchRegistros,
        fetchRegistrosByMedicao,
        fetchContagemPorMedicao,
        createRegistroIndicador,
        updateRegistroIndicador,
        deleteRegistroIndicador,
        deleteRegistrosByMedicao
    }
}
