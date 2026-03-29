import type { Empresa, EmpresaInsert, EmpresaUpdate } from '~/types/empresa'

export const useEmpresas = () => {
    const supabase = useSupabaseClient() as any

    const empresa = ref<Empresa | null>(null)
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

    // ── READ – buscar empresa do usuário logado ────────────────────────────────

    async function fetchEmpresaDoUsuario() {
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return handleError(null, 'Usuário não autenticado')
        }

        const { data, error: err } = await supabase
            .from('empresas')
            .select('*')
            .eq('user_id', user.id)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        empresa.value = data as Empresa
        return { success: true, data: empresa.value, error: null }
    }

    // ── READ – buscar por unique_id ────────────────────────────────────────────

    async function fetchEmpresaByUniqueId(uniqueId: string) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('empresas')
            .select('*')
            .eq('unique_id', uniqueId)
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data: data as Empresa, error: null }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    async function createEmpresa(payload: EmpresaInsert) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('empresas')
            .insert(payload)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        empresa.value = data as Empresa
        return { success: true, data: empresa.value, error: null }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    async function updateEmpresa(id: string, payload: EmpresaUpdate) {
        setLoading(true)

        const { data, error: err } = await supabase
            .from('empresas')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        empresa.value = data as Empresa
        return { success: true, data: empresa.value, error: null }
    }

    // ── HELPER – retorna o unique_id da empresa do usuário logado ─────────────
    // Use para popular o campo `company` em outros composables

    async function getCompanyId(): Promise<string | null> {
        if (empresa.value) return empresa.value.unique_id

        const result = await fetchEmpresaDoUsuario()
        return result?.success ? (result.data as Empresa).unique_id : null
    }

    return {
        empresa,
        loading,
        error,
        fetchEmpresaDoUsuario,
        fetchEmpresaByUniqueId,
        createEmpresa,
        updateEmpresa,
        getCompanyId,
    }
}
