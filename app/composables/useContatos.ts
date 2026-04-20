export interface Contato {
    id: string
    unique_id: string
    nome: string
    telefone: string
    company: string | null
    user_id: string | null
    creation_date: string | null
    modified_date: string | null
}

export type ContatoInsert = Omit<Contato, 'id' | 'creation_date' | 'modified_date'>
export type ContatoUpdate = Partial<Omit<ContatoInsert, 'unique_id'>>

export const useContatos = () => {
    const supabase = useSupabaseClient() as any

    const contatos = ref<Contato[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    function setLoading(value: boolean) {
        loading.value = value
        if (value) error.value = null
    }

    function handleError(err: { message: string } | null, fallback = 'Erro desconhecido') {
        error.value = err?.message ?? fallback
        return { success: false, data: null, error: error.value }
    }

    async function fetchContatos() {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('contatos')
            .select('*')
            .order('nome', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        contatos.value = (data as Contato[]) ?? []
        return { success: true, data: contatos.value, error: null }
    }

    async function createContato(payload: ContatoInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('contatos')
            .insert({ ...payload, creation_date: now, modified_date: now })
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const created = data as Contato
        contatos.value.push(created)
        contatos.value.sort((a, b) => a.nome.localeCompare(b.nome))
        return { success: true, data: created, error: null }
    }

    async function updateContato(id: string, payload: ContatoUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('contatos')
            .update({ ...payload, modified_date: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        const updated = data as Contato
        const index = contatos.value.findIndex((c) => c.id === id)
        if (index !== -1) contatos.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    async function deleteContato(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('contatos')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        contatos.value = contatos.value.filter((c) => c.id !== id)
        return { success: true, data: null, error: null }
    }

    return {
        contatos,
        loading,
        error,
        fetchContatos,
        createContato,
        updateContato,
        deleteContato,
    }
}
