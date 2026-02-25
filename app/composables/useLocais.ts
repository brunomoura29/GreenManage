import type { Local, LocalInsert, LocalUpdate } from '~/types/local'

export const useLocais = () => {
    const supabase = useSupabaseClient() as any

    const locais = ref<Local[]>([])
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

    async function fetchLocais() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('locais')
            .select('*')
            .order('name', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        locais.value = (data as Local[]) ?? []
        return { success: true, data: locais.value, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createLocal(payload: LocalInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('locais')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as Local
        locais.value.push(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateLocal(id: string, payload: LocalUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('locais')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as Local
        const index = locais.value.findIndex((l) => l.id === id)
        if (index !== -1) locais.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteLocal(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('locais')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        locais.value = locais.value.filter((l) => l.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        locais,
        loading,
        error,
        fetchLocais,
        createLocal,
        updateLocal,
        deleteLocal
    }
}
