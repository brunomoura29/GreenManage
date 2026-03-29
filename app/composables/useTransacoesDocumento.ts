/**
 * useTransacoesDocumento – Composable CRUD para a tabela `transacoes_documento`
 */

import type { TransacaoDocumento, TransacaoDocumentoInsert, TransacaoDocumentoUpdate } from '~/types/transacaoDocumento'
export type { TransacaoDocumento, TransacaoDocumentoInsert, TransacaoDocumentoUpdate }

export const useTransacoesDocumento = () => {
    const supabase = useSupabaseClient() as any

    const documentos = ref<TransacaoDocumento[]>([])
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

    // ── READ – listar por empresa ─────────────────────────────────────────────

    async function fetchDocumentos() {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('transacoes_documento')
            .select('*')
            .order('collection_date', { ascending: false })

        setLoading(false)
        if (err) return handleError(err)

        documentos.value = (data as TransacaoDocumento[]) ?? []
        return { success: true, data: documentos.value, error: null }
    }

    // ── READ – buscar por unique_id ───────────────────────────────────────────

    async function fetchDocumentoByUniqueId(uniqueId: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('transacoes_documento')
            .select('*')
            .eq('unique_id', uniqueId)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as TransacaoDocumento, error: null }
    }

    // ── READ – buscar pelo detalhe vinculado (residue = detalhe.unique_id) ────

    async function fetchDocumentoByDetalheId(detalheUniqueId: string) {
        const { data, error: err } = await supabase
            .from('transacoes_documento')
            .select('*')
            .eq('residue', detalheUniqueId)
            .maybeSingle()

        if (err) return handleError(err)
        return { success: true, data: data as TransacaoDocumento | null, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createDocumento(payload: TransacaoDocumentoInsert) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('transacoes_documento')
            .insert(payload)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as TransacaoDocumento
        documentos.value.unshift(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateDocumento(id: string, payload: TransacaoDocumentoUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('transacoes_documento')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as TransacaoDocumento
        const index = documentos.value.findIndex((d) => d.id === id)
        if (index !== -1) documentos.value[index] = updated
        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteDocumento(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('transacoes_documento')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        documentos.value = documentos.value.filter((d) => d.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        documentos,
        loading,
        error,
        fetchDocumentos,
        fetchDocumentoByUniqueId,
        fetchDocumentoByDetalheId,
        createDocumento,
        updateDocumento,
        deleteDocumento,
    }
}
