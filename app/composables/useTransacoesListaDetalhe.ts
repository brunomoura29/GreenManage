import type { TransacaoListaDetalhe, TransacaoListaDetalheInsert, TransacaoListaDetalheUpdate } from '~/types/transacaoListaDetalhe'

export const useTransacoesListaDetalhe = () => {
    const supabase = useSupabaseClient() as any

    const detalhes = ref<TransacaoListaDetalhe[]>([])
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

    async function fetchDetalhes() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('view_transacoes_detalhe_completo')
            .select('*')
            .order('date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        detalhes.value = (data as TransacaoListaDetalhe[]) ?? []
        return { success: true, data: detalhes.value, error: null }
    }

    // ── READ – buscar por residue_operation (unique_id da entrada) ────────────

    async function fetchDetalhesByEntrada(residueOperation: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('view_transacoes_detalhe_completo')
            .select('*')
            .eq('residue_operation', residueOperation)
            .order('date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        detalhes.value = (data as TransacaoListaDetalhe[]) ?? []
        return { success: true, data: detalhes.value, error: null }
    }

    // ── READ – contar por residue_operation ───────────────────────────────────

    async function fetchContagemByEntrada(residueOperation: string): Promise<number> {
        const { count } = await supabase
            .from('transacoes_lista_detalhe')
            .select('*', { count: 'exact', head: true })
            .eq('residue_operation', residueOperation)

        return count ?? 0
    }

    // ── READ – buscar por unique_id ───────────────────────────────────────────

    async function fetchDetalheByUniqueId(uniqueId: string) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .select('*')
            .eq('unique_id', uniqueId)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as TransacaoListaDetalhe, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createDetalhe(payload: TransacaoListaDetalheInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as TransacaoListaDetalhe
        detalhes.value.unshift(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateDetalhe(id: string, payload: TransacaoListaDetalheUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as TransacaoListaDetalhe
        const index = detalhes.value.findIndex((d) => d.id === id)
        if (index !== -1) detalhes.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteDetalhe(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        detalhes.value = detalhes.value.filter((d) => d.id !== id)
        return { success: true, data: null, error: null }
    }

    // ── DELETE – remover todos os detalhes de uma entrada ─────────────────────

    async function deleteDetalhesByEntrada(residueOperation: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('transacoes_lista_detalhe')
            .delete()
            .eq('residue_operation', residueOperation)

        setLoading(false)
        if (err) return handleError(err)

        detalhes.value = detalhes.value.filter((d) => d.residue_operation !== residueOperation)
        return { success: true, data: null, error: null }
    }

    return {
        detalhes,
        loading,
        error,
        fetchDetalhes,
        fetchDetalhesByEntrada,
        fetchContagemByEntrada,
        fetchDetalheByUniqueId,
        createDetalhe,
        updateDetalhe,
        deleteDetalhe,
        deleteDetalhesByEntrada,
    }
}
