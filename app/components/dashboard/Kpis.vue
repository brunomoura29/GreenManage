<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <DashboardCardKpi
      v-for="(kpi, index) in kpis"
      :key="index"
      :label="kpi.label"
      :value="kpi.value"
      :icon="kpi.icon"
      :trend="kpi.trend"
      :trend-up="kpi.trendUp"
      :variant="kpi.variant as any"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { FileText, Scale, AlertTriangle, FlaskConical } from 'lucide-vue-next'

const { calcularKpiManifestos, calcularKpiVolume } = useTransacoesListaDetalhe()
const { datasAtual, datasAnterior, refreshKey, aplicarKey, clienteId, tipoResiduoId, transportadoraId } = useDashboardFiltros()
const { calcularCustoQuimicos } = useEstoqueQuimicos()

const custoQuimicos = computed(() => {
  const { inicio, fim } = datasAtual.value
  return calcularCustoQuimicos(inicio, fim)
})

const manifestosKpi = ref<{ atual: number; variacao: string; trendUp: boolean } | null>(null)
const volumeKpi = ref<{ atual: number; variacao: string; trendUp: boolean } | null>(null)

async function carregar() {
  const { inicio, fim } = datasAtual.value
  const { inicio: inicioAnt, fim: fimAnt } = datasAnterior.value
  const filtros = { clienteId: clienteId.value, tipoResiduoId: tipoResiduoId.value, transportadoraId: transportadoraId.value }

  const [manifestos, volume] = await Promise.all([
    calcularKpiManifestos(inicio, fim, inicioAnt, fimAnt, filtros),
    calcularKpiVolume(inicio, fim, inicioAnt, fimAnt, filtros),
  ])

  manifestosKpi.value = { atual: manifestos.atual, variacao: manifestos.variacao, trendUp: manifestos.trendUp }
  volumeKpi.value = { atual: volume.atual, variacao: volume.variacao, trendUp: volume.trendUp }
}

onMounted(carregar)
watch([datasAtual, refreshKey, aplicarKey], carregar)

const kpis = computed(() => [
  {
    label: 'Manifestos Emitidos',
    value: manifestosKpi.value === null ? '...' : String(manifestosKpi.value.atual),
    icon: FileText,
    trend: manifestosKpi.value?.variacao,
    trendUp: manifestosKpi.value?.trendUp ?? true,
    variant: 'primary',
  },
  {
    label: 'Volume Total (m³)',
    value: volumeKpi.value === null ? '...' : volumeKpi.value.atual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    icon: Scale,
    trend: volumeKpi.value?.variacao,
    trendUp: volumeKpi.value?.trendUp ?? true,
    variant: 'secondary',
  },
  { label: 'Pendências SINIR', value: '3', icon: AlertTriangle, trend: '-2', trendUp: false, variant: 'danger' },
  {
    label: 'Custo Químicos (mês)',
    value: custoQuimicos.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    icon: FlaskConical,
    variant: 'warning',
  },
])
</script>
