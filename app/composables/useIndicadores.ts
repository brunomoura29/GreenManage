import { ref, computed } from 'vue'
import type { Indicador, IndicadorInsert, IndicadorUpdate } from '~/types/indicador'

export const MEASUREMENT_TYPES = [
    'Estoque dos Leitos e Blends',
    'Níveis das Valas de Infiltração',
    'Níveis das Lagoas',
    'Condição climática',
    'Qualidade do Efluente Final Descartado',
    'Tratamento do SKID',
    'Nível do IBC'
]

export const MEASUREMENT_UNITS = [
    'Metros cúbicos',
    'Percentual',
    'Quantidade',
    'Intervalo de tempo (s)',
    'Quilograma',
    'Litros'
]

export function useIndicadores() {
    const supabase = useSupabaseClient<any>()
    const indicadores = ref<Indicador[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const search = ref('')

    const setLoading = (val: boolean) => (loading.value = val)
    const setError = (val: string | null) => (error.value = val)

    const handleError = (err: any) => {
        const message = err.message || 'Ocorreu um erro na operação'
        setError(message)
        return { success: false, error: message }
    }

    async function fetchIndicadores() {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
            .from('indicadores')
            .select('*')
            .order('name', { ascending: true })

        setLoading(false)
        if (err) return handleError(err)

        indicadores.value = (data as Indicador[]) ?? []
        return { success: true, data: indicadores.value }
    }

    async function createIndicador(payload: IndicadorInsert) {
        setLoading(true)
        const now = new Date().toISOString()

        const { data, error: err } = await supabase
            .from('indicadores')
            .insert([{
                ...payload,
                creation_date: now,
                modified_date: now
            }])
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data }
    }

    async function updateIndicador(id: string, payload: IndicadorUpdate) {
        setLoading(true)
        const { data, error: err } = await supabase
            .from('indicadores')
            .update({
                ...payload,
                modified_date: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (err) return handleError(err)

        return { success: true, data }
    }

    async function deleteIndicador(id: string) {
        setLoading(true)
        const { error: err } = await supabase
            .from('indicadores')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (err) return handleError(err)

        return { success: true }
    }

    const indicadoresFiltrados = computed(() => {
        const q = search.value.toLowerCase().trim()
        if (!q) return indicadores.value

        return indicadores.value.filter(i =>
            i.name?.toLowerCase().includes(q) ||
            i.measurement_type?.toLowerCase().includes(q) ||
            i.measurement_unit?.toLowerCase().includes(q)
        )
    })

    return {
        indicadores,
        indicadoresFiltrados,
        loading,
        error,
        search,
        fetchIndicadores,
        createIndicador,
        updateIndicador,
        deleteIndicador
    }
}
