/**
 * useUsuarios – Composable CRUD para a tabela `usuarios`
 *
 * Funções disponíveis:
 *   fetchUsuarios()              -> lista todos os usuários da empresa
 *   fetchUsuarioById(id)         -> busca um usuário pelo ID (uuid)
 *   fetchUsuarioByUserId(userId) -> busca pelo auth.users id (user_id)
 *   createUsuario(payload)       -> insere um novo registro
 *   updateUsuario(id, payload)   -> atualiza campos de um registro
 *   deleteUsuario(id)            -> remove um registro pelo ID
 *
 * Estado reativo:
 *   usuarios -> lista reativa de usuários
 *   loading  -> operação em andamento
 *   error    -> última mensagem de erro
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Usuario {
    id: string
    company: string | null
    name: string | null
    token_sinir: string | null
    user_info: string | null
    creation_date: string | null
    modified_date: string | null
    email: string | null
    unique_id: string | null
    user_id: string | null
}

export type UsuarioInsert = Omit<Usuario, 'id' | 'creation_date' | 'modified_date'>
export type UsuarioUpdate = Partial<UsuarioInsert>

// ─── Composable ───────────────────────────────────────────────────────────────

export const useUsuarios = () => {
    const supabase = useSupabaseClient() as any

    const usuarios = ref<Usuario[]>([])
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

    async function fetchUsuarios() {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('usuarios')
            .select('*')
            .order('name', { ascending: true })

        setLoading(false)

        if (err) return handleError(err)

        usuarios.value = (data as Usuario[]) ?? []
        return { success: true, data: usuarios.value, error: null }
    }

    // ── READ – buscar por ID ──────────────────────────────────────────────────

    async function fetchUsuarioById(id: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single()

        setLoading(false)

        if (err) return handleError(err)
        return { success: true, data: data as Usuario, error: null }
    }

    // ── READ – buscar pelo auth user_id ──────────────────────────────────────

    async function fetchUsuarioByUserId(userId: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('usuarios')
            .select('*')
            .eq('user_id', userId)
            .single()

        setLoading(false)

        if (err) return handleError(err)
        return { success: true, data: data as Usuario, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createUsuario(payload: UsuarioInsert) {
        setLoading(true)

        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('usuarios')
            .insert({
                ...payload,
                creation_date: now,
                modified_date: now,
            })
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const created = data as Usuario
        usuarios.value.push(created)
        return { success: true, data: created, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateUsuario(id: string, payload: UsuarioUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('usuarios')
            .update({
                ...payload,
                modified_date: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)

        if (err) return handleError(err)

        const updated = data as Usuario
        const index = usuarios.value.findIndex((u) => u.id === id)
        if (index !== -1) usuarios.value[index] = updated

        return { success: true, data: updated, error: null }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    async function deleteUsuario(id: string) {
        setLoading(true)

        const { error: err } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id)

        setLoading(false)

        if (err) return handleError(err)

        usuarios.value = usuarios.value.filter((u) => u.id !== id)
        return { success: true, data: null, error: null }
    }

    // ─────────────────────────────────────────────────────────────────────────

    return {
        // estado
        usuarios,
        loading,
        error,
        // funções
        fetchUsuarios,
        fetchUsuarioById,
        fetchUsuarioByUserId,
        createUsuario,
        updateUsuario,
        deleteUsuario,
    }
}
