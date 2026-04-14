import type { MovimentoEstoque, MovimentoEstoqueInsert, MovimentoEstoqueUpdate } from '~/types/movimentoEstoque'

export const useMovimentoEstoque = () => {
    const supabase = useSupabaseClient() as any

    const movimentos = ref<MovimentoEstoque[]>([])
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

    async function fetchMovimentos() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('movimento_estoque')
            .select('*')
            .order('date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        movimentos.value = (data as MovimentoEstoque[]) ?? []
        return { success: true, data: movimentos.value, error: null }
    }

    // ── READ – listar por empresa ─────────────────────────────────────────────

    async function fetchMovimentosByCompany(companyUniqueId: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('movimento_estoque')
            .select('*')
            .eq('company', companyUniqueId)
            .order('date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        movimentos.value = (data as MovimentoEstoque[]) ?? []
        return { success: true, data: movimentos.value, error: null }
    }

    // ── READ – buscar por ID ──────────────────────────────────────────────────

    async function fetchMovimentoById(id: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('movimento_estoque')
            .select('*')
            .eq('id', id)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as MovimentoEstoque, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createMovimento(payload: MovimentoEstoqueInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('movimento_estoque')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as MovimentoEstoque
        movimentos.value.unshift(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateMovimento(id: string, payload: MovimentoEstoqueUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('movimento_estoque')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as MovimentoEstoque
        const index = movimentos.value.findIndex((m) => m.id === id)
        if (index !== -1) movimentos.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteMovimento(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('movimento_estoque')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        movimentos.value = movimentos.value.filter((m) => m.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        movimentos,
        loading,
        error,
        fetchMovimentos,
        fetchMovimentosByCompany,
        fetchMovimentoById,
        createMovimento,
        updateMovimento,
        deleteMovimento,
    }
}
