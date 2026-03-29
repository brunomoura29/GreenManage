<template>
  <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="font-bold text-slate-900 dark:text-white">Volume Processado</h3>
        <p class="text-xs text-slate-500">Últimos 7 dias (Toneladas)</p>
      </div>
      <BaseDropdown
        class="!w-36 !py-2 !text-xs"
        inputClass="!py-1"
        placeholder="Período"
        :options="['Esta Semana', 'Este Mês', 'Hoje']"
        v-model="selectedPeriod"
      />
    </div>

    <div class="flex-1 flex items-end justify-between gap-4 h-64 w-full px-2">
      <div
        v-for="(bar, index) in weeklyVolume"
        :key="index"
        class="flex flex-col items-center gap-3 flex-1 group cursor-pointer"
      >
        <div
          class="w-full max-w-[40px] bg-emerald-600 dark:bg-emerald-600 rounded-t-lg transition-all duration-500 hover:bg-emerald-500 dark:hover:bg-emerald-500 relative hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          :style="{ height: `${bar.height}%` }"
        >
          <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-xl pointer-events-none transform translate-y-2 group-hover:translate-y-0">
            {{ bar.value }} t
            <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
          </div>
        </div>
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ bar.day }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedPeriod = ref('Esta Semana')

const weeklyVolume = [
  { day: 'Seg', value: '12.5', height: 45 },
  { day: 'Ter', value: '15.2', height: 55 },
  { day: 'Qua', value: '13.8', height: 50 },
  { day: 'Qui', value: '18.4', height: 65 },
  { day: 'Sex', value: '22.1', height: 80 },
  { day: 'Sáb', value: '10.5', height: 35 },
  { day: 'Dom', value: '5.2', height: 20 },
]
</script>
