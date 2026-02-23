/**
 * useClientes – Composable CRUD para a tabela `clientes`
 *
 * Funções disponíveis:
 *   fetchClientes()              -> lista todos os clientes da empresa
 *   fetchClienteById(id)         -> busca um cliente pelo UUID da tabela
 *   fetchClienteByUniqueId(uid)  -> busca pelo unique_id
 *   createCliente(payload)       -> insere um novo cliente
 *   updateCliente(id, payload)   -> atualiza campos de um cliente
 *   deleteCliente(id)            -> remove um cliente pelo ID
 *
 * Estado reativo:
 *   clientes -> lista reativa de clientes
 *   loading  -> operação em andamento
 *   error    -> última mensagem de erro
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

import type { Cliente, ClienteInsert, ClienteUpdate } from '~/types/cliente'
export type { Cliente, ClienteInsert, ClienteUpdate }

// ─── Composable ───────────────────────────────────────────────────────────────

export const useClientes = () => {
    const supabase = useSupabaseClient() as any

    const clientes = ref<Cliente[]>([])
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

    async function fetchClientes() {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('clientes')
            .select('*')
            .order('razao_social', { ascending: true })

        setLoading(false)

        if (err) return handleError(err)

        clientes.value = (data as Cliente[]) ?? []
        return { success: true, data: clientes.value, error: null }
    }

    // ── READ – buscar por ID ──────────────────────────────────────────────────

    async function fetchClienteById(id: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single()

        setLoading(false)

        if (err) return handleError(err)
        return { success: true, data: data as Cliente, error: null }
    }

    // ── READ – buscar por unique_id ───────────────────────────────────────────

    async function fetchClienteByUniqueId(uid: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('clientes')
            .select('*')
            .eq('unique_id', uid)
            .single()

        setLoading(false)

        if (err) return handleError(err)
        return { success: true, data: data as Cliente, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createCliente(payload: ClienteInsert) {
        setLoading(true)

        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('clientes')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const created = data as Cliente
        clientes.value.push(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateCliente(id: string, payload: ClienteUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('clientes')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const updated = data as Cliente
        const index = clientes.value.findIndex((c) => c.id === id)
        if (index !== -1) clientes.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteCliente(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id)

        setLoading(false)

        if (err) return handleError(err)

        clientes.value = clientes.value.filter((c) => c.id !== id)
        return { success: true, data: null, error: null }
    }

    // ─────────────────────────────────────────────────────────────────────────

    return {
        // estado
        clientes,
        loading,
        error,
        // funções
        fetchClientes,
        fetchClienteById,
        fetchClienteByUniqueId,
        createCliente,
        updateCliente,
        deleteCliente,
    }
}
