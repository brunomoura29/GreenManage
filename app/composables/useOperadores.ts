import { ref, computed } from 'vue'
import type { Operador, OperadorInsert, OperadorUpdate } from '~/types/operador'

export const useOperadores = () => {
    const supabase = useSupabaseClient() as any

    const operadores = ref<Operador[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const search = ref('')

    // ── Filtragem Local ───────────────────────────────────────────────────────

    const operadoresFiltrados = computed(() => {
        const q = search.value.trim().toLowerCase()
        if (!q) return operadores.value
        return operadores.value.filter((o) =>
            o.name?.toLowerCase().includes(q) ||
            o.cpf?.toLowerCase().includes(q)
        )
    })

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

    async function fetchOperadores() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('operadores')
            .select('*')
            .order('name', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        operadores.value = (data as Operador[]) ?? []
        return { success: true, data: operadores.value, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createOperador(payload: OperadorInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('operadores')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as Operador
        operadores.value.push(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateOperador(id: string, payload: OperadorUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('operadores')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as Operador
        const index = operadores.value.findIndex((o) => o.id === id)
        if (index !== -1) operadores.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteOperador(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('operadores')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        operadores.value = operadores.value.filter((o) => o.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        operadores,
        operadoresFiltrados,
        loading,
        error,
        search,
        fetchOperadores,
        createOperador,
        updateOperador,
        deleteOperador
    }
}
