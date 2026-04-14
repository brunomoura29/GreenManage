import type { Insumo, InsumoInsert, InsumoUpdate } from '~/types/insumo'

export const useInsumos = () => {
    const supabase = useSupabaseClient() as any

    const insumos = ref<Insumo[]>([])
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

    async function fetchInsumos() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('insumos')
            .select('*')
            .order('name', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        insumos.value = (data as Insumo[]) ?? []
        return { success: true, data: insumos.value, error: null }
    }

    // ── READ – buscar por ID ──────────────────────────────────────────────────

    async function fetchInsumoById(id: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('insumos')
            .select('*')
            .eq('id', id)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as Insumo, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createInsumo(payload: InsumoInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('insumos')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as Insumo
        insumos.value.push(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateInsumo(id: string, payload: InsumoUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('insumos')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as Insumo
        const index = insumos.value.findIndex((i) => i.id === id)
        if (index !== -1) insumos.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteInsumo(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('insumos')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        insumos.value = insumos.value.filter((i) => i.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        insumos,
        loading,
        error,
        fetchInsumos,
        fetchInsumoById,
        createInsumo,
        updateInsumo,
        deleteInsumo,
    }
}
