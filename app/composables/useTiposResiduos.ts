/**
 * useTiposResiduos – Composable CRUD para a tabela `tipo_residuos`
 */

import type { TipoResiduo, TipoResiduoInsert, TipoResiduoUpdate } from '~/types/tipoResiduo'
export type { TipoResiduo, TipoResiduoInsert, TipoResiduoUpdate }

export const useTiposResiduos = () => {
    const supabase = useSupabaseClient() as any

    const tiposResiduos = ref<TipoResiduo[]>([])
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

    // ── READ – listar todos da empresa ────────────────────────────────────────

    async function fetchTiposResiduos() {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('tipo_residuos')
            .select('*')
            .order('name', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        tiposResiduos.value = (data as TipoResiduo[]) ?? []
        return { success: true, data: tiposResiduos.value, error: null }
    }

    // ── READ – buscar por unique_id ───────────────────────────────────────────

    async function fetchTipoResiduoByUniqueId(uniqueId: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('tipo_residuos')
            .select('*')
            .eq('unique_id', uniqueId)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as TipoResiduo, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createTipoResiduo(payload: TipoResiduoInsert) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('tipo_residuos')
            .insert(payload)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as TipoResiduo
        tiposResiduos.value.push(created)
        tiposResiduos.value.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateTipoResiduo(id: string, payload: TipoResiduoUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('tipo_residuos')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as TipoResiduo
        const index = tiposResiduos.value.findIndex((t) => t.id === id)
        if (index !== -1) tiposResiduos.value[index] = updated
        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteTipoResiduo(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('tipo_residuos')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        tiposResiduos.value = tiposResiduos.value.filter((t) => t.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        tiposResiduos,
        loading,
        error,
        fetchTiposResiduos,
        fetchTipoResiduoByUniqueId,
        createTipoResiduo,
        updateTipoResiduo,
        deleteTipoResiduo,
    }
}
