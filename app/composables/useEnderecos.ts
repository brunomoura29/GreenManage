/**
 * useEnderecos – Composable CRUD para a tabela `enderecos`
 *
 * Funções disponíveis:
 *   fetchEnderecos()                  -> lista todos os endereços
 *   fetchEnderecoById(id)             -> busca pelo UUID da tabela
 *   fetchEnderecosByClient(clientUid) -> lista endereços de um cliente
 *   createEndereco(payload)           -> insere um novo endereço
 *   updateEndereco(id, payload)       -> atualiza campos de um endereço
 *   deleteEndereco(id)                -> remove um endereço pelo ID
 *
 * Estado reativo:
 *   enderecos -> lista reativa de endereços
 *   loading   -> operação em andamento
 *   error     -> última mensagem de erro
 */

import type { Endereco, EnderecoInsert, EnderecoUpdate } from '~/types/endereco'
export type { Endereco, EnderecoInsert, EnderecoUpdate }

// ─── Composable ───────────────────────────────────────────────────────────────

export const useEnderecos = () => {
    const supabase = useSupabaseClient() as any

    const enderecos = ref<Endereco[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // ── Helpers ───────────────────────────────────────────────────────────────

    function setLoading(value: boolean) {
        loading.value = value
        if (value) error.value = null
    }

    function handleError(err: { message: string } | null, fallback = 'Erro desconhecido') {
        error.value = err?.message ?? fallback
        return { success: false, data: null, error: error.value }
    }

    // ── READ – listar todos ───────────────────────────────────────────────────

    async function fetchEnderecos() {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('enderecos')
            .select('*')
            .order('address_street', { ascending: true })

        setLoading(false)

        if (err) return handleError(err)

        enderecos.value = (data as Endereco[]) ?? []
        return { success: true, data: enderecos.value, error: null }
    }

    // ── READ – buscar por ID ──────────────────────────────────────────────────

    async function fetchEnderecoById(id: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('enderecos')
            .select('*')
            .eq('id', id)
            .single()

        setLoading(false)

        if (err) return handleError(err)
        return { success: true, data: data as Endereco, error: null }
    }

    // ── READ – listar por cliente ─────────────────────────────────────────────

    async function fetchEnderecosByClient(clientUniqueId: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('enderecos')
            .select('*')
            .eq('client', clientUniqueId)
            .order('address_street', { ascending: true })

        setLoading(false)

        if (err) return handleError(err)

        enderecos.value = (data as Endereco[]) ?? []
        return { success: true, data: enderecos.value, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createEndereco(payload: EnderecoInsert) {
        setLoading(true)

        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('enderecos')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const created = data as Endereco
        enderecos.value.push(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateEndereco(id: string, payload: EnderecoUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('enderecos')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const updated = data as Endereco
        const index = enderecos.value.findIndex((e) => e.id === id)
        if (index !== -1) enderecos.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteEndereco(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('enderecos')
            .delete()
            .eq('id', id)

        setLoading(false)

        if (err) return handleError(err)

        enderecos.value = enderecos.value.filter((e) => e.id !== id)
        return { success: true, data: null, error: null }
    }

    async function deleteEnderecosByClient(clientUniqueId: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('enderecos')
            .delete()
            .eq('client', clientUniqueId)

        setLoading(false)

        if (err) return handleError(err)

        enderecos.value = enderecos.value.filter((e) => e.client !== clientUniqueId)
        return { success: true, data: null, error: null }
    }

    // ─────────────────────────────────────────────────────────────────────────

    return {
        // estado
        enderecos,
        loading,
        error,
        // funções
        fetchEnderecos,
        fetchEnderecoById,
        fetchEnderecosByClient,
        createEndereco,
        updateEndereco,
        deleteEndereco,
        deleteEnderecosByClient,
    }
}
