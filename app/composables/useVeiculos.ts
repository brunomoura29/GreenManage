/**
 * useVeiculos – Composable CRUD para a tabela `veiculos`
 *
 * Funções disponíveis:
 *   fetchVeiculos()              -> lista todos os veículos
 *   fetchVeiculoById(id)         -> busca um veículo pelo UUID
 *   fetchVeiculoByUniqueId(uid)  -> busca pelo unique_id
 *   createVeiculo(payload)       -> insere um novo veículo
 *   updateVeiculo(id, payload)   -> atualiza campos de um veículo
 *   deleteVeiculo(id)            -> remove um veículo pelo ID
 */

import type { Veiculo, VeiculoInsert, VeiculoUpdate } from '~/types/veiculo'
export type { Veiculo, VeiculoInsert, VeiculoUpdate }

export const useVeiculos = () => {
    const supabase = useSupabaseClient() as any

    const veiculos = ref<Veiculo[]>([])
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

    async function fetchVeiculos() {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('veiculos')
            .select('*')
            .order('model', { ascending: true })

        setLoading(false)

        if (err) return handleError(err)

        veiculos.value = (data as Veiculo[]) ?? []
        return { success: true, data: veiculos.value, error: null }
    }

    // ── READ – buscar por ID ──────────────────────────────────────────────────

    async function fetchVeiculoById(id: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('veiculos')
            .select('*')
            .eq('id', id)
            .single()

        setLoading(false)

        if (err) return handleError(err)
        return { success: true, data: data as Veiculo, error: null }
    }

    // ── READ – buscar por unique_id ───────────────────────────────────────────

    async function fetchVeiculoByUniqueId(uid: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('veiculos')
            .select('*')
            .eq('unique_id', uid)
            .single()

        setLoading(false)

        if (err) return handleError(err)
        return { success: true, data: data as Veiculo, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createVeiculo(payload: VeiculoInsert) {
        setLoading(true)

        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('veiculos')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const created = data as Veiculo
        veiculos.value.push(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateVeiculo(id: string, payload: VeiculoUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('veiculos')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const updated = data as Veiculo
        const index = veiculos.value.findIndex((v) => v.id === id)
        if (index !== -1) veiculos.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteVeiculo(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('veiculos')
            .delete()
            .eq('id', id)

        setLoading(false)

        if (err) return handleError(err)

        veiculos.value = veiculos.value.filter((v) => v.id !== id)
        return { success: true, data: null, error: null }
    }

    // ─────────────────────────────────────────────────────────────────────────

    return {
        // estado
        veiculos,
        loading,
        error,
        // funções
        fetchVeiculos,
        fetchVeiculoById,
        fetchVeiculoByUniqueId,
        createVeiculo,
        updateVeiculo,
        deleteVeiculo,
    }
}
