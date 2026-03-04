<template>
  <div class="w-full">

    <!-- ── Tabela (desktop / tablet) ─────────────────────────────────────── -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-card">
      <table class="w-full text-sm text-left">
        <!-- Cabeçalho -->
        <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Data
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Tipo de Medição
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Qtd Indicadores
            </th>
            <th class="px-4 py-3 w-20 text-center font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Ações
            </th>
          </tr>
        </thead>

        <!-- Corpo -->
        <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
          <!-- Loading skeleton -->
          <tr v-if="loading" v-for="n in 4" :key="'sk-' + n">
            <td colspan="4" class="px-4 py-3">
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="medicoes.length === 0">
            <td colspan="4" class="px-4 py-10 text-center">
              <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                <Activity class="w-8 h-8" />
                <span class="text-sm">Nenhuma medição encontrada</span>
              </div>
            </td>
          </tr>

          <!-- Linhas -->
          <tr
            v-else
            v-for="item in paginatedMedicoes"
            :key="item.medicao_id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <!-- Data -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <CalendarDays class="w-4 h-4 text-primary-700 dark:text-primary-400" />
                </div>
                <span class="font-medium text-slate-900 dark:text-white">
                  {{ formatData(item.data) }}
                </span>
              </div>
            </td>

            <!-- Tipo de Medição -->
            <td class="px-4 py-3">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
                {{ item.nome_tipo_medicao || '—' }}
              </span>
            </td>

            <!-- Qtd Indicadores -->
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                <TrendingUp class="w-3 h-3" />
                {{ item.qtd_indicadores ?? 0 }}
              </span>
            </td>

            <!-- Ações -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click="$emit('edit', item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
                  title="Editar"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  @click="$emit('delete', item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  title="Excluir"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Cards (mobile) ─────────────────────────────────────────────────── -->
    <div class="sm:hidden space-y-2 mb-4">
      <!-- Loading skeleton -->
      <div v-if="loading" v-for="n in 3" :key="'msk-' + n"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 animate-pulse">
        <div class="flex gap-3 items-center">
          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
            <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="medicoes.length === 0"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-slate-400">
        <Activity class="w-8 h-8" />
        <span class="text-sm">Nenhuma medição encontrada</span>
      </div>

      <!-- Cards -->
      <div
        v-for="item in paginatedMedicoes"
        :key="'m-' + item.medicao_id"
        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-soft"
      >
        <div class="flex items-center justify-between gap-2">
          <!-- Info -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <CalendarDays class="w-5 h-5 text-primary-700 dark:text-primary-400" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900 dark:text-white truncate">
                {{ formatData(item.data) }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ item.nome_tipo_medicao || '—' }}
              </p>
              <p class="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                {{ item.qtd_indicadores ?? 0 }} indicador(es)
              </p>
            </div>
          </div>
          <!-- Ações -->
          <div class="flex items-center gap-1 shrink-0">
            <button
              @click="$emit('edit', item)"
              class="p-2 text-slate-400 hover:text-primary-600 transition-colors"
              title="Editar"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="$emit('delete', item)"
              class="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Excluir"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginação (integrada) -->
    <div v-if="!loading && medicoes.length > 0" class="mt-2 text-right">
      <BasePagination
        :current-page="currentPage"
        :total-items="medicoes.length"
        :items-per-page="itemsPerPage"
        label="medições"
        @change-page="$emit('update:currentPage', $event)"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2, Activity, CalendarDays, TrendingUp } from 'lucide-vue-next'
import type { ViewMedicoesCompleta } from '~/types/viewMedicoesCompleta'

const props = defineProps<{
  medicoes: ViewMedicoesCompleta[]
  loading?: boolean
  currentPage: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  edit: [item: ViewMedicoesCompleta]
  delete: [item: ViewMedicoesCompleta]
  'update:currentPage': [page: number]
}>()

const paginatedMedicoes = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.medicoes.slice(start, end)
})

function formatData(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>
