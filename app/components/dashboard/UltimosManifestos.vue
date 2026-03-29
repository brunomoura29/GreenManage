<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 p-6">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div>
        <h3 class="font-bold text-slate-900 dark:text-white">Últimos Manifestos Emitidos</h3>
        <p class="text-xs text-slate-500 mt-1">Acompanhamento de emissões e recebimentos</p>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="busca"
            type="text"
            placeholder="Buscar manifestos..."
            class="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 bg-slate-50 dark:bg-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-sm"
          />
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
          <tr
            v-for="mtr in manifestosFiltrados"
            :key="mtr.id"
            class="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors"
          >
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
              <span class="inline-flex items-center text-slate-700 dark:text-slate-300">{{ mtr.residuo }}</span>
            </td>
            <td class="py-4 font-bold text-slate-900 dark:text-white">{{ mtr.peso }}</td>
            <td class="py-4">
              <div class="flex items-center gap-2">
                <span class="relative flex h-2.5 w-2.5" v-if="mtr.status === 'Recebido'">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  :class="statusColors[mtr.status]"
                >
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

    <div class="flex justify-between items-center mt-6 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
      <span>Mostrando <strong class="text-slate-700 dark:text-slate-300">{{ manifestosFiltrados.length }}</strong> de <strong class="text-slate-700 dark:text-slate-300">{{ manifestos.length }}</strong> manifestos</span>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors">Anterior</button>
        <div class="flex gap-1">
          <button class="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-md shadow-sm font-medium">1</button>
        </div>
        <button class="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Próximo</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Filter, Eye, FileText } from 'lucide-vue-next'

const busca = ref('')

const manifestos = [
  { id: 'MTR-10293', data: '23/02/2026', gerador: 'Indústrias Químicas Alpha', unidade: 'Planta Sorocaba', residuo: 'Lodo Galvânico', peso: '2.500 kg', status: 'Recebido' },
  { id: 'MTR-10292', data: '23/02/2026', gerador: 'Auto Peças Brasil', unidade: 'Matriz SP', residuo: 'Óleo Usado', peso: '450 l', status: 'Em Transporte' },
  { id: 'MTR-10291', data: '23/02/2026', gerador: 'Construções Norte', unidade: 'Obra 52', residuo: 'RCD Classe A', peso: '5.000 kg', status: 'Recebido' },
  { id: 'MTR-10290', data: '22/02/2026', gerador: 'Hospital São Lucas', unidade: 'Central', residuo: 'Infectante A1', peso: '120 kg', status: 'Pendente' },
  { id: 'MTR-10289', data: '22/02/2026', gerador: 'Gráfica Express', unidade: 'Loja 1', residuo: 'Estopas Contaminadas', peso: '50 kg', status: 'Recebido' },
]

const manifestosFiltrados = computed(() => {
  const q = busca.value.toLowerCase()
  if (!q) return manifestos
  return manifestos.filter(m =>
    m.id.toLowerCase().includes(q) ||
    m.gerador.toLowerCase().includes(q) ||
    m.residuo.toLowerCase().includes(q)
  )
})

const statusColors: Record<string, string> = {
  'Recebido': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  'Em Transporte': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  'Pendente': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
}
</script>
