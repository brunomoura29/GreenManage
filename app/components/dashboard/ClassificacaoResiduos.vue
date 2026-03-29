<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col">
    <h3 class="font-bold text-slate-900 dark:text-white mb-2">Classificação de Resíduos</h3>
    <p class="text-xs text-slate-500 mb-4">Distribuição por tipo · m³</p>

    <!-- Loading -->
    <div v-if="carregando" class="flex-1 flex items-center justify-center">
      <Loader2 class="w-6 h-6 text-primary animate-spin" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="itens.length === 0"
      class="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500"
    >
      <PieChart class="w-8 h-8" />
      <span class="text-sm">Nenhum dado para o período</span>
    </div>

    <!-- Chart -->
    <div v-else class="flex-1 flex flex-col items-center">

      <!-- Donut via Chart.js -->
      <div class="relative w-48 h-48">
        <Doughnut :data="chartData" :options="chartOptions" />
        <!-- Centro com total -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Total</span>
          <span class="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {{ total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
          <span class="text-[10px] text-slate-400">m³</span>
        </div>
      </div>

      <!-- Legenda -->
      <div class="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 w-full px-1">
        <div v-for="item in itens" :key="item.label" class="flex items-center justify-between gap-1">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-2 h-2 shrink-0 rounded-full" :style="{ backgroundColor: item.color }"></span>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ item.label }}</span>
          </div>
          <span class="text-[10px] font-semibold text-slate-700 dark:text-slate-300 shrink-0">{{ item.pct }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Loader2, PieChart } from 'lucide-vue-next'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip)

const { fetchClassificacaoResiduos } = useTransacoesListaDetalhe()
const { datasAtual, refreshKey, aplicarKey, clienteId, tipoResiduoId, transportadoraId } = useDashboardFiltros()

const carregando = ref(true)
const itens = ref<{ label: string; volume: number; pct: string; color: string }[]>([])
const total = ref(0)

async function carregar() {
  carregando.value = true
  const { inicio, fim } = datasAtual.value
  const filtros = { clienteId: clienteId.value, tipoResiduoId: tipoResiduoId.value, transportadoraId: transportadoraId.value }

  const resultado = await fetchClassificacaoResiduos(inicio, fim, filtros)
  itens.value = resultado.itens
  total.value = resultado.total
  carregando.value = false
}

onMounted(carregar)
watch([datasAtual, refreshKey, aplicarKey], carregar)

const chartData = computed(() => ({
  labels: itens.value.map(i => i.label),
  datasets: [
    {
      data: itens.value.map(i => i.volume),
      backgroundColor: itens.value.map(i => i.color),
      borderWidth: 0,
      hoverBorderWidth: 0,
      hoverOffset: 6,
      hoverBackgroundColor: itens.value.map(i => i.color),
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgb(15, 23, 42)',
      titleColor: '#94a3b8',
      bodyColor: '#f1f5f9',
      padding: 12,
      cornerRadius: 8,
      animation: { duration: 0 },
      callbacks: {
        label: (ctx: any) => {
          const vol = ctx.parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          const pct = itens.value[ctx.dataIndex]?.pct ?? ''
          return ` ${vol} m³  (${pct})`
        },
      },
    },
  },
}))
</script>
