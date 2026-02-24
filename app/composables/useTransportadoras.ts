import type { Transportadora } from '~/types/transportadora'

export const useTransportadoras = () => {
    const supabase = useSupabaseClient()

    const transportadoras = ref<Transportadora[]>([])
    const loading = ref(false)

    async function fetchTransportadoras() {
        loading.value = true
        const { data, error } = await supabase
            .from('transportadoras')
            .select('*')
            .order('nome', { ascending: true })

        loading.value = false
        if (!error && data) {
            transportadoras.value = data
        }
    }

    return {
        transportadoras,
        loading,
        fetchTransportadoras
    }
}
