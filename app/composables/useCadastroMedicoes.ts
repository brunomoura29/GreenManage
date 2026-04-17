import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { toast } from 'vue-sonner'
import { useIndicadores, MEASUREMENT_TYPES } from '~/composables/useIndicadores'
import { useOperadores } from '~/composables/useOperadores'
import { useMedicoes } from '~/composables/useMedicoes'
import { useRegistroIndicadores } from '~/composables/useRegistroIndicadores'
import { useRegistroValorMedicao } from '~/composables/useRegistroValorMedicao'
import { useLagoasBaixadas } from '~/composables/useLagoasBaixadas'
import { useEmpresas } from '~/composables/useEmpresas'
import type { ViewMedicoesCompleta } from '~/types/viewMedicoesCompleta'

interface IndicadorSelecionado {
  uniqueId: string
  nome: string
}

// Normaliza string: remove acentos e converte para minúsculas
function normalize(str?: string | null) {
  return (str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function dataHoje(hora: string) {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}T${hora}`
}

export function formatarData(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function calcularProximaDataMedicao(ultimaData: string): { inicio: string; fim: string } {
  const parts = ultimaData.substring(0, 10).split('-')
  const base = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  base.setDate(base.getDate() + 1)
  const fim = new Date(base)
  fim.setDate(fim.getDate() + 1)
  return { inicio: `${formatarData(base)}T06:00`, fim: `${formatarData(fim)}T18:00` }
}

export function useCadastroMedicoes(
  props: { isNovo: boolean; medicao?: ViewMedicoesCompleta | null; periodoInicioDefault?: string; periodoFimDefault?: string },
  emit: { (event: 'salvo'): void; (event: 'voltar'): void }
) {
  // ── Composables ────────────────────────────────────────────────────────────
  const { indicadores, fetchIndicadores } = useIndicadores()
  const { operadores, fetchOperadores } = useOperadores()
  const { createMedicao, updateMedicao, fetchUltimaMedicaoData } = useMedicoes()
  const { createRegistroIndicador, deleteRegistrosByMedicao: deleteIndicsByMedicao } = useRegistroIndicadores()
  const { createRegistroValor, deleteRegistrosByMedicao: deleteValoresByMedicao } = useRegistroValorMedicao()
  const { createLagoaBaixada, deleteLagoasByMedicao } = useLagoasBaixadas()
  const { getCompanyId } = useEmpresas()
  const supabase = useSupabaseClient()
  const salvando = ref(false)

  // ── Formulário ─────────────────────────────────────────────────────────────
  const form = ref({
    periodoInicio: props.periodoInicioDefault || dataHoje('06:00'),
    periodoFim:    props.periodoFimDefault    || dataHoje('18:00'),
    tipoMedicao: '',
    observacao: '',
    dosagem_de_cloro: false,
    lagoa_tratamento_encheu: false,
    solidos_sedimentaveis: '' as string | number,
    retrolavagem_filtros: false,
    equipamentos_funcionando: false,
    limpeza_flotador: false,
    preparado_polimero: false,
  })

  // ── Computed de tipo (evita expor normalize() ao template) ─────────────────
  const isNiveisValas = computed(() =>
    form.value.tipoMedicao === 'Níveis das Valas de Infiltração'
  )
  const isQualidadeEfluente = computed(() =>
    normalize(form.value.tipoMedicao) === normalize('Qualidade do Efluente Final Descartado')
  )
  const isTratamentoSKID = computed(() =>
    normalize(form.value.tipoMedicao) === normalize('Tratamento do SKID')
  )
  const isNiveisLagoas = computed(() =>
    normalize(form.value.tipoMedicao) === normalize('Níveis das Lagoas')
  )

  // ── Indicadores ────────────────────────────────────────────────────────────
  const indicadoresSelecionados = ref<IndicadorSelecionado[]>([])
  const indicadorParaAdicionar = ref('')
  const refsIndicadores = new Map<string, any>()
  const isPopulating = ref(false)

  const opcoesIndicadores = computed(() => {
    if (!form.value.tipoMedicao) return []
    const tipoNorm = normalize(form.value.tipoMedicao)
    return indicadores.value
      .filter(i => normalize(i.measurement_type) === tipoNorm)
      .filter(i => !indicadoresSelecionados.value.some(s => s.uniqueId === (i.unique_id || i.id)))
      .map(i => ({ label: i.name || '', value: i.unique_id || i.id }))
  })

  watch(() => form.value.tipoMedicao, () => {
    if (isPopulating.value) return
    indicadoresSelecionados.value = []
    indicadorParaAdicionar.value = ''
    refsIndicadores.clear()
    lagoasSelecionadas.value = []
    lagoadParaAdicionar.value = ''
  })

  function setRef(el: any, id: string) {
    if (el) refsIndicadores.set(id, el)
    else refsIndicadores.delete(id)
  }

  function adicionarIndicador() {
    if (!indicadorParaAdicionar.value) return
    const ind = indicadores.value.find(i => (i.unique_id || i.id) === indicadorParaAdicionar.value)
    if (!ind) return
    indicadoresSelecionados.value.push({ uniqueId: ind.unique_id || ind.id, nome: ind.name || '' })
    indicadorParaAdicionar.value = ''
  }

  function removerIndicador(uniqueId: string) {
    indicadoresSelecionados.value = indicadoresSelecionados.value.filter(i => i.uniqueId !== uniqueId)
    refsIndicadores.delete(uniqueId)
  }

  // ── Adicionar todas as lagoas (exclusivo Níveis das Lagoas) ────────────────
  const mostrarConfirmarTodasLagoas = ref(false)

  function adicionarTodasLagoas() {
    const tipoNorm = normalize('Níveis das Lagoas')
    const restantes = indicadores.value
      .filter(i => normalize(i.measurement_type) === tipoNorm)
      .filter(i => !indicadoresSelecionados.value.some(s => s.uniqueId === (i.unique_id || i.id)))
    for (const ind of restantes) {
      indicadoresSelecionados.value.push({ uniqueId: ind.unique_id || ind.id, nome: ind.name || '' })
    }
    mostrarConfirmarTodasLagoas.value = false
  }

  // ── Lagoas baixadas (Tratamento do SKID) ───────────────────────────────────
  const lagoasSelecionadas = ref<IndicadorSelecionado[]>([])
  const lagoadParaAdicionar = ref('')

  const opcoesLagoasBaixadas = computed(() => {
    const tipoNorm = normalize('Níveis das Lagoas')
    return indicadores.value
      .filter(i => normalize(i.measurement_type) === tipoNorm)
      .filter(i => !lagoasSelecionadas.value.some(s => s.uniqueId === (i.unique_id || i.id)))
      .map(i => ({ label: i.name || '', value: i.unique_id || i.id }))
  })

  function adicionarLagoa() {
    if (!lagoadParaAdicionar.value) return
    const ind = indicadores.value.find(i => (i.unique_id || i.id) === lagoadParaAdicionar.value)
    if (!ind) return
    lagoasSelecionadas.value.push({ uniqueId: ind.unique_id || ind.id, nome: ind.name || '' })
    lagoadParaAdicionar.value = ''
  }

  function removerLagoa(uniqueId: string) {
    lagoasSelecionadas.value = lagoasSelecionadas.value.filter(l => l.uniqueId !== uniqueId)
  }

  // ── Populate (modo edição) ─────────────────────────────────────────────────
  async function populateForm() {
    const m = props.medicao
    if (!m) return

    isPopulating.value = true

    const inicio = m.periodo_medicao?.[0] ?? m.data ?? ''
    const fim    = m.periodo_medicao?.[1] ?? ''
    form.value.periodoInicio = inicio ? inicio.slice(0, 16) : dataHoje('06:00')
    form.value.periodoFim    = fim    ? fim.slice(0, 16)    : ''

    const tipoNorm = normalize(m.nome_tipo_medicao)
    form.value.tipoMedicao = MEASUREMENT_TYPES.find(t => normalize(t) === tipoNorm) ?? m.nome_tipo_medicao ?? ''
    form.value.observacao  = m.observation ?? ''

    form.value.dosagem_de_cloro         = m.dosagem_de_cloro            ?? false
    form.value.lagoa_tratamento_encheu  = m.lagoa_tratamento_encheu     ?? false
    form.value.solidos_sedimentaveis    = m.solidos_sedimentaveis       ?? ''
    form.value.retrolavagem_filtros     = m.retrolavagem_dos_filtros    ?? false
    form.value.equipamentos_funcionando = m.equipamentos_funcionando    ?? false
    form.value.limpeza_flotador         = m.limpeza_flotador            ?? false
    form.value.preparado_polimero       = m.preparado_polimero          ?? false

    await nextTick()

    if (m.nomes_indicadores?.length) {
      const norm = normalize(m.nome_tipo_medicao)
      indicadoresSelecionados.value = indicadores.value
        .filter(i => normalize(i.measurement_type) === norm)
        .filter(i => m.nomes_indicadores!.includes(i.name ?? ''))
        .map(i => ({ uniqueId: i.unique_id || i.id, nome: i.name || '' }))
    }

    if (m.lista_lagoas_baixadas?.length) {
      const lagoaNorm = normalize('Níveis das Lagoas')
      lagoasSelecionadas.value = indicadores.value
        .filter(i => normalize(i.measurement_type) === lagoaNorm)
        .filter(i => m.lista_lagoas_baixadas!.includes(i.name ?? ''))
        .map(i => ({ uniqueId: i.unique_id || i.id, nome: i.name || '' }))
    }

    await nextTick()
    isPopulating.value = false
  }

  onMounted(async () => {
    await Promise.all([fetchIndicadores(), fetchOperadores()])
    if (!props.isNovo) {
      populateForm()
    } else if (!props.periodoInicioDefault) {
      const ultimaData = await fetchUltimaMedicaoData()
      if (ultimaData) {
        const { inicio, fim } = calcularProximaDataMedicao(ultimaData)
        form.value.periodoInicio = inicio
        form.value.periodoFim    = fim
      }
    }
  })

  // ── Salvar (orquestração completa) ─────────────────────────────────────────
  async function salvarMedicao() {
    if (salvando.value) return
    salvando.value = true

    try {
      const periodoRange = form.value.periodoInicio
        ? [form.value.periodoInicio, form.value.periodoFim || form.value.periodoInicio]
        : null

      const tipoNorm = normalize(form.value.tipoMedicao)
      const { data: { user } } = await supabase.auth.getUser()
      const userId    = user?.id ?? null
      const companyId = await getCompanyId()

      const payload = {
        company:          companyId,
        date:             form.value.periodoInicio || null,
        date_range:       periodoRange,
        measurement_type: form.value.tipoMedicao  || null,
        observation:      form.value.observacao   || null,
        dosagem_de_cloro:
          tipoNorm === normalize('Níveis das Valas de Infiltração') ? form.value.dosagem_de_cloro : null,
        lagoa_tratamento_encheu:
          tipoNorm === normalize('Qualidade do Efluente Final Descartado') ? form.value.lagoa_tratamento_encheu : null,
        solidos_sedimentaveis:
          tipoNorm === normalize('Qualidade do Efluente Final Descartado')
            ? (form.value.solidos_sedimentaveis != null && form.value.solidos_sedimentaveis !== ''
                ? String(form.value.solidos_sedimentaveis) : null)
            : null,
        retrolavagem_dos_filtros:  isTratamentoSKID.value ? form.value.retrolavagem_filtros     : null,
        equipamentos_funcionando:  isTratamentoSKID.value ? form.value.equipamentos_funcionando  : null,
        limpeza_flotador:          isTratamentoSKID.value ? form.value.limpeza_flotador          : null,
        preparado_polimero:        isTratamentoSKID.value ? form.value.preparado_polimero        : null,
      }

      // 1. Criar ou atualizar a medição
      let medicaoUniqueId: string | null = null

      if (props.isNovo) {
        const uniqueId = `med_${Date.now()}`
        const result = await createMedicao({ ...payload, unique_id: uniqueId, user_id: userId })
        if (!result.success) {
          toast.error('Erro ao criar medição', { description: (result as any).error })
          return
        }
        medicaoUniqueId = (result as any)?.data?.unique_id ?? uniqueId
      } else if (props.medicao) {
        const result = await updateMedicao(props.medicao.medicao_id, payload)
        if (!result.success) {
          toast.error('Erro ao atualizar medição', { description: (result as any).error })
          return
        }
        medicaoUniqueId = props.medicao.medicao_unique_id ?? null
      }

      if (!medicaoUniqueId) {
        toast.error('Erro interno', { description: 'Não foi possível obter o ID da medição.' })
        return
      }

      // 2. Se edição: apaga registros filhos antigos
      if (!props.isNovo) {
        await Promise.all([
          deleteIndicsByMedicao(medicaoUniqueId),
          deleteValoresByMedicao(medicaoUniqueId),
          deleteLagoasByMedicao(medicaoUniqueId),
        ])
      }

      // 3. Salvar indicadores + turnos
      for (const ind of indicadoresSelecionados.value) {
        const riUniqueId = `ri_${Date.now()}_${ind.uniqueId}`
        const riResult = await createRegistroIndicador({
          unique_id:        riUniqueId,
          measurement:      medicaoUniqueId,
          indicator:        ind.uniqueId,
          measurement_type: form.value.tipoMedicao || null,
          user_id:          userId,
        })
        const registroIndicadorUniqueId: string = (riResult as any)?.data?.unique_id ?? riUniqueId

        const indRef = refsIndicadores.get(ind.uniqueId)
        const turnos: any[] = indRef?.turnos ?? []

        for (const turno of turnos) {
          let photoUrl: string | null = null

          if (turno.fotoFile) {
            const ext = turno.fotoNome.split('.').pop()
            const path = `medicoes/${medicaoUniqueId}/${ind.uniqueId}_${Date.now()}.${ext}`
            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('medicoes')
              .upload(path, turno.fotoFile, { upsert: true })
            if (!uploadErr && uploadData) {
              const { data: urlData } = supabase.storage.from('medicoes').getPublicUrl(uploadData.path)
              photoUrl = urlData.publicUrl ?? null
            }
          } else if (turno.preview && !turno.fotoFile) {
            photoUrl = turno.preview || null
          }

          await createRegistroValor({
            unique_id:       `rv_${Date.now()}_${ind.uniqueId}`,
            measurement:     medicaoUniqueId,
            indicator:       ind.uniqueId,
            indicator_value: registroIndicadorUniqueId,
            value:           turno.valor   ?? null,
            operator:        turno.operador || null,
            date_range:      turno.periodoInicio
              ? [turno.periodoInicio, turno.periodoFim || turno.periodoInicio]
              : null,
            photos:          photoUrl,
            user_id:         userId,
          })
        }
      }

      // 4. Salvar lagoas baixadas (somente Tratamento do SKID)
      if (isTratamentoSKID.value && lagoasSelecionadas.value.length > 0) {
        for (const lagoa of lagoasSelecionadas.value) {
          await createLagoaBaixada({
            unique_id:   `lb_${Date.now()}_${lagoa.uniqueId}`,
            measurement: medicaoUniqueId,
            name:        lagoa.nome,
            user_id:     userId,
          })
        }
      }

      toast.success(props.isNovo ? 'Medição criada!' : 'Medição atualizada!', {
        description: 'Todos os dados foram salvos com sucesso.',
      })
      emit('salvo')
      emit('voltar')

    } catch (err: any) {
      toast.error('Erro inesperado', { description: err.message })
    } finally {
      salvando.value = false
    }
  }

  return {
    form,
    salvando,
    operadores,
    // tipo helpers
    isNiveisValas,
    isQualidadeEfluente,
    isTratamentoSKID,
    isNiveisLagoas,
    // indicadores
    indicadoresSelecionados,
    indicadorParaAdicionar,
    opcoesIndicadores,
    setRef,
    adicionarIndicador,
    removerIndicador,
    // todas as lagoas
    mostrarConfirmarTodasLagoas,
    adicionarTodasLagoas,
    // lagoas baixadas (SKID)
    lagoasSelecionadas,
    lagoadParaAdicionar,
    opcoesLagoasBaixadas,
    adicionarLagoa,
    removerLagoa,
    // ações
    salvarMedicao,
  }
}
