/**
 * useMotoristas – Composable CRUD para a tabela `motoristas`
 */

import type { Motorista, MotoristaInsert, MotoristaUpdate } from '~/types/motorista'
export type { Motorista, MotoristaInsert, MotoristaUpdate }

export const useMotoristas = () => {
    const supabase = useSupabaseClient() as any

    const motoristas = ref<Motorista[]>([])
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

    async function fetchMotoristas() {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('motoristas')
            .select('*')
            .order('name', { ascending: true })

        setLoading(false)

        if (err) return handleError(err)

        motoristas.value = (data as Motorista[]) ?? []
        return { success: true, data: motoristas.value, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createMotorista(payload: MotoristaInsert) {
        setLoading(true)

        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('motoristas')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const created = data as Motorista
        motoristas.value.push(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateMotorista(id: string, payload: MotoristaUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('motoristas')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const updated = data as Motorista
        const index = motoristas.value.findIndex((m) => m.id === id)
        if (index !== -1) motoristas.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteMotorista(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('motoristas')
            .delete()
            .eq('id', id)

        setLoading(false)

        if (err) return handleError(err)

        motoristas.value = motoristas.value.filter((m) => m.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        motoristas,
        loading,
        error,
        fetchMotoristas,
        createMotorista,
        updateMotorista,
        deleteMotorista,
    }
}
