import { ref } from 'vue'
import type { RegistroValorMedicao, RegistroValorMedicaoInsert, RegistroValorMedicaoUpdate } from '~/types/registroValorMedicao'

export function useRegistroValorMedicao() {
    const supabase = useSupabaseClient<any>()
    const registros = ref<RegistroValorMedicao[]>([])
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
            .from('registro_valor_medicao')
            .select('*')
            .order('creation_date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        registros.value = (data as RegistroValorMedicao[]) ?? []
        return { success: true, data: registros.value }
    }

    // ── Fetch por medicao ───────────────────────────────────────────────────
    async function fetchRegistrosByMedicao(medicaoUniqueId: string) {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('registro_valor_medicao')
            .select('*')
            .eq('measurement', medicaoUniqueId)
            .order('creation_date', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: (data as RegistroValorMedicao[]) ?? [] }
    }

    // ── Fetch por indicator + medicao ───────────────────────────────────────
    async function fetchRegistrosByIndicador(indicadorUniqueId: string, medicaoId: string) {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('registro_valor_medicao')
            .select('*')
            .eq('indicator', indicadorUniqueId)
            .eq('measurement', medicaoId)
            .order('creation_date', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: (data as RegistroValorMedicao[]) ?? [] }
    }

    // ── Fetch por registro_indicador (indicator_value) ──────────────────────
    async function fetchRegistrosByIndicadorValue(indicadorValueUniqueId: string) {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('registro_valor_medicao')
            .select('*')
            .eq('indicator_value', indicadorValueUniqueId)
            .order('creation_date', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: (data as RegistroValorMedicao[]) ?? [] }
    }

    // ── Create ─────────────────────────────────────────────────────────────
    async function createRegistroValor(payload: RegistroValorMedicaoInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('registro_valor_medicao')
            .insert([{
                ...payload,
                creation_date: now,
                modified_date: now
            }])
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as RegistroValorMedicao }
    }

    // ── Update ─────────────────────────────────────────────────────────────
    async function updateRegistroValor(id: string, payload: RegistroValorMedicaoUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('registro_valor_medicao')
            .update({
                ...payload,
                modified_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as RegistroValorMedicao }
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    async function deleteRegistroValor(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('registro_valor_medicao')
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
            .from('registro_valor_medicao')
            .delete()
            .eq('measurement', medicaoUniqueId)

        setLoading(false)
        if (err) return handleError(err)

        return { success: true }
    }

    // ── Delete por indicator_value ──────────────────────────────────────────
    async function deleteRegistrosByIndicadorValue(indicadorValueUniqueId: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('registro_valor_medicao')
            .delete()
            .eq('indicator_value', indicadorValueUniqueId)

        setLoading(false)
        if (err) return handleError(err)

        return { success: true }
    }

    return {
        registros,
        loading,
        error,
        fetchRegistros,
        fetchRegistrosByMedicao,
        fetchRegistrosByIndicador,
        fetchRegistrosByIndicadorValue,
        createRegistroValor,
        updateRegistroValor,
        deleteRegistroValor,
        deleteRegistrosByMedicao,
        deleteRegistrosByIndicadorValue
    }
}
