import type { TransacaoListaDetalhe } from '~/types/transacaoListaDetalhe'

const filtroMtr = ref('')
const filtroMtrTransportadora = ref('')
const filtroClienteId = ref<string | null>(null)
const filtroTransportadoraId = ref<string | null>(null)

export const useTransacoesDetalhesFiltros = () => {
    const totalFiltrosAtivos = computed(() =>
        [
            filtroMtr.value,
            filtroMtrTransportadora.value,
            filtroClienteId.value,
            filtroTransportadoraId.value,
        ].filter(Boolean).length
    )

    function filtrarDetalhes(detalhes: TransacaoListaDetalhe[]): TransacaoListaDetalhe[] {
        return detalhes.filter(d => {
            if (filtroMtr.value) {
                const q = filtroMtr.value.toLowerCase()
                if (!d.mtr?.toLowerCase().includes(q)) return false
            }

            if (filtroMtrTransportadora.value) {
                const q = filtroMtrTransportadora.value.toLowerCase()
                const mtrs = Array.isArray(d.mtrs_transportadora)
                    ? d.mtrs_transportadora
                    : typeof d.mtrs_transportadora === 'string'
                        ? JSON.parse(d.mtrs_transportadora)
                        : []
                const encontrou = (mtrs as string[]).some(m => m?.toLowerCase().includes(q))
                if (!encontrou) return false
            }

            if (filtroClienteId.value) {
                if (d.cliente_id !== filtroClienteId.value) return false
            }

            if (filtroTransportadoraId.value) {
                if (d.carrier !== filtroTransportadoraId.value) return false
            }

            return true
        })
    }

    function limparFiltros() {
        filtroMtr.value = ''
        filtroMtrTransportadora.value = ''
        filtroClienteId.value = null
        filtroTransportadoraId.value = null
    }

    return {
        filtroMtr,
        filtroMtrTransportadora,
        filtroClienteId,
        filtroTransportadoraId,
        totalFiltrosAtivos,
        filtrarDetalhes,
        limparFiltros,
    }
}
