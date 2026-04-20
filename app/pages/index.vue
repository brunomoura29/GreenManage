<template>
  <div class="min-h-full">
    <!-- Page Header -->
    <div class="px-6 md:px-8 pt-8 pb-2">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão geral dos serviços realizados</p>
        </div>
        <button
          @click="modalRelatorio = true"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
        >
          <FileJson class="w-4 h-4" />
          Relatório Operacional
        </button>
      </div>
    </div>

    <ClientOnly>
      <RelatoriosModalRelatorioOperacional
        :show="modalRelatorio"
        @fechar="modalRelatorio = false"
        @gerado="onRelatorioGerado"
      />
    </ClientOnly>

    <!-- Main Content -->
    <div class="p-6 md:p-8 space-y-8">

      <!-- Filtros -->
      <DashboardFiltros />

      <!-- KPIs -->
      <DashboardKpis />

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardGraficoLinha class="lg:col-span-2" />
        <DashboardClassificacaoResiduos />
      </div>

      <!-- Estoque Químicos -->
      <DashboardKIPEstoqueQuimicos />

      <!-- Tabela Registro Medições -->
      <DashboardKIPTabelaRegistroMedicoes />

      <!-- Últimos Manifestos -->
      <DashboardUltimosManifestos />

      <!-- Help Floating Button -->
      <div class="fixed bottom-8 right-8 z-30">
        <button class="bg-slate-900 dark:bg-emerald-600 text-white p-3.5 rounded-full shadow-xl hover:scale-105 hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all flex items-center justify-center group">
          <HelpCircle class="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span class="absolute right-full mr-3 px-3 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Suporte e Ajuda</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { HelpCircle, FileJson } from 'lucide-vue-next'

const modalRelatorio = ref(false)

function onRelatorioGerado(payload: object) {
  console.log('[Relatório Operacional]', payload)
}
</script>
