<template>
  <div class="min-h-full">

    <!-- Header -->
    <div class="px-6 md:px-8 pt-8 pb-6">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
        Relatório de Entradas
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
        Visão consolidada das entradas de resíduos por período
      </p>
    </div>

    <!-- Conteúdo — ClientOnly evita hydration mismatch com fetch client-side -->
    <div class="px-6 md:px-8 pb-12">
      <ClientOnly>
        <RelatorioEntradasResiduos />
      </ClientOnly>
    </div>

  </div>
</template>

<script setup lang="ts">
import RelatorioEntradasResiduos from '~/components/relatorios/RelatorioEntradasResiduos.vue'
</script>
