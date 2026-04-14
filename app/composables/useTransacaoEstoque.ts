import type { TransacaoEstoque, TransacaoEstoqueInsert, TransacaoEstoqueUpdate } from '~/types/transacaoEstoque'

export const useTransacaoEstoque = () => {
    const supabase = useSupabaseClient() as any

    const transacoes = ref<TransacaoEstoque[]>([])
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

    // ── READ – listar todas ───────────────────────────────────────────────────

    async function fetchTransacoes() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('transacao_estoque')
            .select('*')
            .order('creation_date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        transacoes.value = (data as TransacaoEstoque[]) ?? []
        return { success: true, data: transacoes.value, error: null }
    }

    // ── READ – listar por movimento (stock_movement) ──────────────────────────

    async function fetchTransacoesByMovimento(stockMovementUniqueId: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('transacao_estoque')
            .select('*')
            .eq('stock_movement', stockMovementUniqueId)
            .order('creation_date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        transacoes.value = (data as TransacaoEstoque[]) ?? []
        return { success: true, data: transacoes.value, error: null }
    }

    // ── READ – listar por insumo ──────────────────────────────────────────────

    async function fetchTransacoesByInsumo(insumoUniqueId: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('transacao_estoque')
            .select('*')
            .eq('insumo', insumoUniqueId)
            .order('creation_date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        transacoes.value = (data as TransacaoEstoque[]) ?? []
        return { success: true, data: transacoes.value, error: null }
    }

    // ── READ – buscar por ID ──────────────────────────────────────────────────

    async function fetchTransacaoById(id: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('transacao_estoque')
            .select('*')
            .eq('id', id)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as TransacaoEstoque, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createTransacao(payload: TransacaoEstoqueInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('transacao_estoque')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as TransacaoEstoque
        transacoes.value.unshift(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateTransacao(id: string, payload: TransacaoEstoqueUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('transacao_estoque')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as TransacaoEstoque
        const index = transacoes.value.findIndex((t) => t.id === id)
        if (index !== -1) transacoes.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteTransacao(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('transacao_estoque')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        transacoes.value = transacoes.value.filter((t) => t.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        transacoes,
        loading,
        error,
        fetchTransacoes,
        fetchTransacoesByMovimento,
        fetchTransacoesByInsumo,
        fetchTransacaoById,
        createTransacao,
        updateTransacao,
        deleteTransacao,
    }
}
