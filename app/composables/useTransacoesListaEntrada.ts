import type { TransacaoListaEntrada, TransacaoListaEntradaInsert, TransacaoListaEntradaUpdate } from '~/types/transacaoListaEntrada'

export const useTransacoesListaEntrada = () => {
    const supabase = useSupabaseClient() as any

    const transacoes = ref<TransacaoListaEntrada[]>([])
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

    async function fetchTransacoes() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('view_transacoes_entrada_resumo')
            .select('*')
            .order('date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        transacoes.value = (data as TransacaoListaEntrada[]) ?? []
        return { success: true, data: transacoes.value, error: null }
    }

    // ── READ – buscar por unique_id ───────────────────────────────────────────

    async function fetchTransacaoByUniqueId(uniqueId: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('transacoes_lista_entrada')
            .select('*')
            .eq('unique_id', uniqueId)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as TransacaoListaEntrada, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createTransacao(payload: TransacaoListaEntradaInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('transacoes_lista_entrada')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as TransacaoListaEntrada
        transacoes.value.unshift(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateTransacao(id: string, payload: TransacaoListaEntradaUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('transacoes_lista_entrada')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as TransacaoListaEntrada
        const index = transacoes.value.findIndex((t) => t.id === id)
        if (index !== -1) transacoes.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteTransacao(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('transacoes_lista_entrada')
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
        fetchTransacaoByUniqueId,
        createTransacao,
        updateTransacao,
        deleteTransacao,
    }
}
