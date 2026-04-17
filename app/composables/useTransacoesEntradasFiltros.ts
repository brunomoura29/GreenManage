import type { TransacaoListaEntrada } from '~/types/transacaoListaEntrada'

const filtroDataInicio = ref('')
const filtroDataFim = ref('')

export const useTransacoesEntradasFiltros = () => {
  const temFiltroAtivo = computed(() => !!filtroDataInicio.value || !!filtroDataFim.value)

  function filtrarEntradas(entradas: TransacaoListaEntrada[]): TransacaoListaEntrada[] {
    return entradas.filter(e => {
      const data = e.date?.substring(0, 10) ?? ''
      if (filtroDataInicio.value && data < filtroDataInicio.value) return false
      if (filtroDataFim.value && data > filtroDataFim.value) return false
      return true
    })
  }

  function limparFiltros() {
    filtroDataInicio.value = ''
    filtroDataFim.value = ''
  }

  return {
    filtroDataInicio,
    filtroDataFim,
    temFiltroAtivo,
    filtrarEntradas,
    limparFiltros,
  }
}
