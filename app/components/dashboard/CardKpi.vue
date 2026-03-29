<template>
  <div class="bg-white dark:bg-slate-800 px-6 pt-6 pb-8 rounded-xl shadow-soft border border-emerald-100/50 dark:border-slate-700 flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

    <!-- Top Row: Icon & Trend -->
    <div class="flex justify-between items-start z-10">
      <!-- Icon Wrapper -->
      <div
        class="p-2.5 rounded-lg transition-colors"
        :class="iconBgClass"
      >
        <component :is="icon" class="w-6 h-6" :class="iconColorClass" />
      </div>

      <!-- Trend Indicator -->
      <div
        v-if="trend"
        class="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-800"
        :class="trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'"
      >
        <ArrowUp v-if="trendUp" class="w-3 h-3 mr-1" />
        <ArrowDown v-else class="w-3 h-3 mr-1" />
        {{ trend }}
      </div>
    </div>

    <!-- Bottom Row: Label & Value -->
    <div class="z-10 mt-4">
       <span class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">{{ label }}</span>
       <h3 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{{ value }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUp, ArrowDown } from 'lucide-vue-next';

interface Props {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
  trendUp?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info';
}

const props = withDefaults(defineProps<Props>(), {
  trendUp: true,
  variant: 'primary' // Default to primary (Green)
});

// Computed classes based on variant using Tailwind colors
const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'primary': return 'bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30';
    case 'secondary': return 'bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30';
    case 'danger': return 'bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30';
    case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30';
    default: return 'bg-slate-50 dark:bg-slate-700 group-hover:bg-slate-100';
  }
});

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'primary': return 'text-emerald-600 dark:text-emerald-400';
    case 'secondary': return 'text-blue-600 dark:text-blue-400';
    case 'danger': return 'text-red-600 dark:text-red-400';
    case 'warning': return 'text-amber-600 dark:text-amber-400';
    default: return 'text-slate-600 dark:text-slate-400';
  }
});
</script>
