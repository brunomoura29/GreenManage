import { ref } from 'vue'
import type { LagoaBaixada, LagoaBaixadaInsert, LagoaBaixadaUpdate } from '~/types/lagoaBaixada'

export function useLagoasBaixadas() {
    const supabase = useSupabaseClient<any>()
    const lagoas = ref<LagoaBaixada[]>([])
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
    async function fetchLagoas() {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('lagoas_baixadas')
            .select('*')
            .order('creation_date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        lagoas.value = (data as LagoaBaixada[]) ?? []
        return { success: true, data: lagoas.value }
    }

    // ── Fetch por medicao ───────────────────────────────────────────────────
    async function fetchLagoasByMedicao(medicaoUniqueId: string) {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('lagoas_baixadas')
            .select('*')
            .eq('measurement', medicaoUniqueId)
            .order('creation_date', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: (data as LagoaBaixada[]) ?? [] }
    }

    // ── Fetch por indicador ─────────────────────────────────────────────────
    async function fetchLagoasByIndicador(indicadorUniqueId: string) {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('lagoas_baixadas')
            .select('*')
            .eq('indicators', indicadorUniqueId)
            .order('creation_date', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: (data as LagoaBaixada[]) ?? [] }
    }

    // ── Create ─────────────────────────────────────────────────────────────
    async function createLagoaBaixada(payload: LagoaBaixadaInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('lagoas_baixadas')
            .insert([{
                ...payload,
                creation_date: now,
                modified_date: now
            }])
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as LagoaBaixada }
    }

    // ── Update ─────────────────────────────────────────────────────────────
    async function updateLagoaBaixada(id: string, payload: LagoaBaixadaUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('lagoas_baixadas')
            .update({
                ...payload,
                modified_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as LagoaBaixada }
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    async function deleteLagoaBaixada(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('lagoas_baixadas')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        return { success: true }
    }

    // ── Delete todos de uma medição ─────────────────────────────────────────
    async function deleteLagoasByMedicao(medicaoUniqueId: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('lagoas_baixadas')
            .delete()
            .eq('measurement', medicaoUniqueId)

        setLoading(false)
        if (err) return handleError(err)

        return { success: true }
    }

    return {
        lagoas,
        loading,
        error,
        fetchLagoas,
        fetchLagoasByMedicao,
        fetchLagoasByIndicador,
        createLagoaBaixada,
        updateLagoaBaixada,
        deleteLagoaBaixada,
        deleteLagoasByMedicao
    }
}
