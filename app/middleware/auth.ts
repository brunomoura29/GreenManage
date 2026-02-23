/**
 * Middleware de autenticação.
 * Redireciona para /login se não houver sessão ativa.
 *
 * Uso nas páginas protegidas:
 *   definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(() => {
    const session = useSupabaseSession()

    if (!session.value) {
        return navigateTo('/login')
    }
})
