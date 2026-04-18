import type { TransacaoListaEntrada } from '~/types/transacaoListaEntrada'
import type { TransacaoListaDetalhe } from '~/types/transacaoListaDetalhe'

const ativo = ref(false)
const carregando = ref(false)
const operacoesPendentes = ref(new Set<string>())
const contagemPendencias = ref(new Map<string, number>())

export const useFiltroPendenciaSinir = () => {
  const supabase = useSupabaseClient() as any
  const { filtroDataInicio, filtroDataFim } = useTransacoesEntradasFiltros()

  async function carregar() {
    carregando.value = true

    let query = supabase
      .from('view_transacoes_detalhe_completo')
      .select('residue_operation, mtr')

    if (filtroDataInicio.value) query = query.gte('date', filtroDataInicio.value)
    if (filtroDataFim.value)    query = query.lte('date', filtroDataFim.value)

    const { data, error } = await query
    carregando.value = false
    if (error) throw new Error(error.message)

    const pendentes = (data ?? []).filter((r: any) => !r.mtr && r.residue_operation)
    operacoesPendentes.value = new Set(pendentes.map((r: any) => r.residue_operation))
    const contagem = new Map<string, number>()
    for (const r of pendentes) {
      contagem.set(r.residue_operation, (contagem.get(r.residue_operation) ?? 0) + 1)
    }
    contagemPendencias.value = contagem
  }

  async function toggle() {
    if (ativo.value) {
      ativo.value = false
      operacoesPendentes.value = new Set()
      contagemPendencias.value = new Map()
    } else {
      await carregar()
      ativo.value = true
    }
  }

  function filtrarEntradas(entradas: TransacaoListaEntrada[]): TransacaoListaEntrada[] {
    if (!ativo.value) return entradas
    return entradas.filter(e => e.unique_id && operacoesPendentes.value.has(e.unique_id))
  }

  function filtrarDetalhes(detalhes: TransacaoListaDetalhe[]): TransacaoListaDetalhe[] {
    if (!ativo.value) return detalhes
    return detalhes.filter(d => !d.mtr)
  }

  return { ativo, carregando, carregar, toggle, contagemPendencias, filtrarEntradas, filtrarDetalhes }
}
