/**
 * useAuth – Composable de autenticação via Supabase
 *
 * Funções disponíveis:
 *   login(email, password)   -> signInWithPassword
 *   register(email, password) -> signUp
 *   logout()                 -> signOut
 *   resetPassword(email)     -> resetPasswordForEmail
 *
 * Estado reativo global:
 *   user    -> JWT claims (useSupabaseUser)
 *   session -> sessão atual (useSupabaseSession)
 *   loading -> operação em andamento
 *   error   -> última mensagem de erro
 */
export const useAuth = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const session = useSupabaseSession()

    const loading = ref(false)
    const error = ref<string | null>(null)

    // ─── Login com email/senha ─────────────────────────────────────────────────
    async function login(email: string, password: string) {
        loading.value = true
        error.value = null

        const { error: err } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        loading.value = false

        if (err) {
            error.value = err.message
            return { success: false, error: err.message }
        }

        await navigateTo('/')
        return { success: true }
    }

    // ─── Cadastro com email/senha ──────────────────────────────────────────────
    async function register(email: string, password: string) {
        loading.value = true
        error.value = null

        const { error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/confirm`,
            },
        })

        loading.value = false

        if (err) {
            error.value = err.message
            return { success: false, error: err.message }
        }

        return { success: true }
    }

    // ─── Logout ────────────────────────────────────────────────────────────────
    async function logout() {
        loading.value = true
        error.value = null

        const { error: err } = await supabase.auth.signOut()

        loading.value = false

        if (err) {
            error.value = err.message
            return { success: false, error: err.message }
        }

        await navigateTo('/login')
        return { success: true }
    }

    // ─── Solicitar reset de senha por email ────────────────────────────────────
    async function resetPassword(email: string) {
        loading.value = true
        error.value = null

        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/senha/atualizar`,
        })

        loading.value = false

        if (err) {
            error.value = err.message
            return { success: false, error: err.message }
        }

        return { success: true }
    }

    // ─── Atualizar senha (após reset) ─────────────────────────────────────────
    async function updatePassword(newPassword: string) {
        loading.value = true
        error.value = null

        const { error: err } = await supabase.auth.updateUser({
            password: newPassword,
        })

        loading.value = false

        if (err) {
            error.value = err.message
            return { success: false, error: err.message }
        }

        return { success: true }
    }

    return {
        user,
        session,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        updatePassword,
    }
}
