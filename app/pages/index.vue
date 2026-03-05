<template>
  <div class="min-h-full">
    <!-- Page Header -->
    <div class="px-6 md:px-8 pt-8 pb-2">
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Dashboard</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão geral dos serviços realizados</p>
      </div>
    </div>

    <!-- Main Content with Padding -->
    <div class="p-6 md:p-8 space-y-8">
      <!-- KPIs Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <CardKpi 
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

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Volume Semanal (Bar Chart) -->
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
            <div v-for="(bar, index) in weeklyVolume" :key="index" class="flex flex-col items-center gap-3 flex-1 group cursor-pointer">
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

      <!-- Resíduos por Classe (Donut Chart) -->
      <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col">
         <h3 class="font-bold text-slate-900 dark:text-white mb-2">Classificação de Resíduos</h3>
         <p class="text-xs text-slate-500 mb-8">Distribuição por periculosidade</p>
         
         <div class="flex-1 flex flex-col items-center justify-center -mt-4">
            <!-- Donut Chart customizado com gradiente verde -->
            <div class="relative w-56 h-56 rounded-full shadow-inner ring-4 ring-slate-50 dark:ring-slate-800" style="background: conic-gradient(#059669 0% 45%, #10b981 45% 70%, #34d399 70% 85%, #6ee7b7 85% 100%);">
               <!-- Inner Circle -->
               <div class="absolute inset-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center flex-col shadow-sm">
                 <span class="text-sm font-medium text-slate-500 uppercase tracking-widest">Total</span>
                 <span class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">842</span>
                 <span class="text-xs text-slate-400 mt-1">Toneladas</span>
               </div>
            </div>

            <!-- Legend Grid -->
            <div class="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 w-full px-2">
               <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                     <span class="w-3 h-3 rounded-full bg-emerald-600 shadow-sm"></span>
                     <span class="text-slate-600 dark:text-slate-300 font-medium">Classe I</span>
                  </div>
                  <span class="font-bold text-slate-900 dark:text-white">45%</span>
               </div>
               <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                     <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span>
                     <span class="text-slate-600 dark:text-slate-300 font-medium">Classe II A</span>
                  </div>
                  <span class="font-bold text-slate-900 dark:text-white">25%</span>
               </div>
               <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                     <span class="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></span>
                     <span class="text-slate-600 dark:text-slate-300 font-medium">Classe II B</span>
                  </div>
                  <span class="font-bold text-slate-900 dark:text-white">15%</span>
               </div>
               <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                     <span class="w-3 h-3 rounded-full bg-emerald-300 shadow-sm"></span>
                     <span class="text-slate-600 dark:text-slate-300 font-medium">Não Per.</span>
                  </div>
                  <span class="font-bold text-slate-900 dark:text-white">15%</span>
               </div>
             </div>
         </div>
      </div>
    </div>

    <!-- Tabela Registro Medições -->
    <KIPTabelaRegistroMedicoes />

    <!-- Últimos Manifestos (Table) -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
       <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white">Últimos Manifestos Emitidos</h3>
            <p class="text-xs text-slate-500 mt-1">Acompanhamento de emissões e recebimentos</p>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-auto">
             <div class="relative w-full sm:w-64">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Buscar manifestos..." class="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 bg-slate-50 dark:bg-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-sm" />
             </div>
             <BaseButton variant="outline" size="sm" class="shrink-0 h-10 px-4 border-slate-200 hover:bg-slate-50 text-slate-600">
               <Filter class="w-4 h-4 mr-2" /> Filtrar
             </BaseButton>
          </div>
       </div>

       <div class="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-700">
          <table class="w-full text-left text-sm">
             <thead>
                <tr class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-widest">
                   <th class="py-4 pl-6">MTR ID</th>
                   <th class="py-4">Emissão</th>
                   <th class="py-4">Gerador</th>
                   <th class="py-4">Resíduo Principal</th>
                   <th class="py-4">Peso</th>
                   <th class="py-4">Status SINIR</th>
                   <th class="py-4 pr-6 text-center">Ações</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
                <tr v-for="mtr in manifestos" :key="mtr.id" class="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                   <td class="py-4 pl-6">
                      <div class="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded w-fit group-hover:text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                         {{ mtr.id }}
                      </div>
                   </td>
                   <td class="py-4 text-slate-600 dark:text-slate-400">{{ mtr.data }}</td>
                   <td class="py-4">
                      <div class="font-medium text-slate-900 dark:text-white">{{ mtr.gerador }}</div>
                      <div class="text-xs text-slate-500 truncate max-w-[150px]">{{ mtr.unidade }}</div>
                   </td>
                   <td class="py-4">
                      <span class="inline-flex items-center text-slate-700 dark:text-slate-300">
                         {{ mtr.residuo }}
                      </span>
                   </td>
                   <td class="py-4 font-bold text-slate-900 dark:text-white">{{ mtr.peso }}</td>
                   <td class="py-4">
                      <div class="flex items-center gap-2">
                         <span class="relative flex h-2.5 w-2.5" v-if="mtr.status === 'Recebido'">
                           <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                         </span>
                         <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" 
                              :class="statusColors[mtr.status]">
                               {{ mtr.status }}
                         </span>
                      </div>
                   </td>
                   <td class="py-4 pr-6 text-center">
                      <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button class="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" title="Visualizar">
                           <Eye class="w-4 h-4" />
                         </button>
                         <button class="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" title="Baixar PDF">
                           <FileText class="w-4 h-4" />
                         </button>
                      </div>
                   </td>
                </tr>
             </tbody>
          </table>
       </div>
       
       <!-- Pagination -->
       <div class="flex justify-between items-center mt-6 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
          <span>Mostrando <strong class="text-slate-700 dark:text-slate-300">1-5</strong> de <strong class="text-slate-700 dark:text-slate-300">1.248</strong> manifestos</span>
          <div class="flex items-center gap-2">
             <button class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">Anterior</button>
             <div class="flex gap-1">
                <button class="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-md shadow-sm font-medium">1</button>
                <button class="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">2</button>
                <button class="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">3</button>
             </div>
             <button class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Próximo</button>
          </div>
       </div>

    </div>

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
import { 
  Bell, 
  ArrowUp, 
  ArrowDown, 
  FileText, // Manifestos
  Scale, // Peso
  AlertTriangle, // Pendencias
  Target, // Acuracidade
  Search, 
  Filter,
  Eye,
  HelpCircle,
  Truck,
  Building2,
  Sun,
  Moon
} from 'lucide-vue-next';

// State
const selectedPeriod = ref('Esta Semana');

// KPI Data Mock (MTR Context)
const kpis = [
  { label: 'Manifestos Emitidos', value: '142', icon: FileText, trend: '12.5%', trendUp: true, variant: 'primary' },
  { label: 'Peso Total (Kg)', value: '84.5t', icon: Scale, trend: '8.2%', trendUp: true, variant: 'secondary' },
  { label: 'Pendências SINIR', value: '3', icon: AlertTriangle, trend: '-2', trendUp: false, variant: 'danger' }, // Down is good for problems
  { label: 'Acuracidade', value: '99.8%', icon: Target, trend: '0.5%', trendUp: true, variant: 'primary' },
];

// Weekly Volume Data (Bar Chart)
const weeklyVolume = [
  { day: 'Seg', value: '12.5', height: 45 },
  { day: 'Ter', value: '15.2', height: 55 },
  { day: 'Qua', value: '13.8', height: 50 },
  { day: 'Qui', value: '18.4', height: 65 },
  { day: 'Sex', value: '22.1', height: 80 },
  { day: 'Sáb', value: '10.5', height: 35 },
  { day: 'Dom', value: '5.2', height: 20 },
];

// Manifestos Data Mock
const manifestos = [
  { id: 'MTR-10293', data: '23/02/2026', gerador: 'Indústrias Químicas Alpha', unidade: 'Planta Sorocaba', residuo: 'Lodo Galvânico', peso: '2.500 kg', status: 'Recebido' },
  { id: 'MTR-10292', data: '23/02/2026', gerador: 'Auto Peças Brasil', unidade: 'Matriz SP', residuo: 'Óleo Usado', peso: '450 l', status: 'Em Transporte' },
  { id: 'MTR-10291', data: '23/02/2026', gerador: 'Construções Norte', unidade: 'Obra 52', residuo: 'RCD Classe A', peso: '5.000 kg', status: 'Recebido' },
  { id: 'MTR-10290', data: '22/02/2026', gerador: 'Hospital São Lucas', unidade: 'Central', residuo: 'Infectante A1', peso: '120 kg', status: 'Pendente' },
  { id: 'MTR-10289', data: '22/02/2026', gerador: 'Gráfica Express', unidade: 'Loja 1', residuo: 'Estopas Contaminadas', peso: '50 kg', status: 'Recebido' },
];

const statusColors: Record<string, string> = {
  'Recebido': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  'Em Transporte': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  'Pendente': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
};

</script>
