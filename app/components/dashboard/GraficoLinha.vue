<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
      <div>
        <h3 class="font-bold text-slate-900 dark:text-white">Volume Recebido</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {{ granularidade === 'dia' ? 'Dia a dia' : 'Mês a mês' }} · m³
          <span v-if="limitado" class="text-amber-500"> · limite de 365 dias aplicado</span>
        </p>
      </div>
    </div>

    <!-- Chart -->
    <div class="relative h-64">
      <div v-if="carregando" class="absolute inset-0 flex items-center justify-center">
        <Loader2 class="w-6 h-6 text-primary animate-spin" />
      </div>
      <div
        v-else-if="chartData.labels.length === 0"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500"
      >
        <BarChart2 class="w-8 h-8" />
        <span class="text-sm">Nenhum dado para o período selecionado</span>
      </div>
      <Line v-else :data="chartData" :options="chartOptions" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Loader2, BarChart2 } from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const { fetchVolumeGrafico } = useTransacoesListaDetalhe()
const { datasAtual, refreshKey, aplicarKey, clienteId, tipoResiduoId, transportadoraId } = useDashboardFiltros()

const carregando = ref(true)
const granularidade = ref<'dia' | 'mes'>('dia')
const limitado = ref(false)
const labels = ref<string[]>([])
const dados = ref<number[]>([])

async function carregar() {
  carregando.value = true
  const { inicio, fim } = datasAtual.value
  const filtros = { clienteId: clienteId.value, tipoResiduoId: tipoResiduoId.value, transportadoraId: transportadoraId.value }

  const diffDias = Math.ceil((new Date(fim).getTime() - new Date(inicio).getTime()) / 86_400_000) + 1
  limitado.value = diffDias > 365

  const resultado = await fetchVolumeGrafico(inicio, fim, filtros)
  granularidade.value = resultado.granularidade
  labels.value = resultado.labels
  dados.value = resultado.dados
  carregando.value = false
}

onMounted(carregar)
watch([datasAtual, refreshKey, aplicarKey], carregar)

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Volume (m³)',
      data: dados.value,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderWidth: 2.5,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: granularidade.value === 'dia' && labels.value.length > 20 ? 2 : 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#94a3b8',
      bodyColor: '#f1f5f9',
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: any) =>
          ` ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: '#94a3b8',
        font: { size: 11 },
        maxTicksLimit: granularidade.value === 'dia' ? 15 : 12,
        maxRotation: 0,
      },
    },
    y: {
      border: { display: false, dash: [4, 4] },
      grid: { color: 'rgba(148, 163, 184, 0.15)' },
      ticks: {
        color: '#94a3b8',
        font: { size: 11 },
        callback: (value: any) => `${value} m³`,
      },
    },
  },
}))
</script>
