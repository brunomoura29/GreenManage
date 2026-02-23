<template>
  <div class="w-full">

    <!-- ── Tabela (desktop / tablet) ─────────────────────────────────────── -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-card">
      <table class="w-full text-sm text-left">
        <!-- Cabeçalho -->
        <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-4 py-3 w-10"></th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Placa
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Tipo
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Modelo
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
            <td colspan="5" class="px-4 py-3">
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="veiculos.length === 0">
            <td colspan="5" class="px-4 py-10 text-center">
              <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                <Truck class="w-8 h-8" />
                <span class="text-sm">Nenhum veículo encontrado</span>
              </div>
            </td>
          </tr>

          <!-- Linhas -->
          <tr
            v-else
            v-for="veiculo in paginatedVeiculos"
            :key="veiculo.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <!-- Ícone -->
            <td class="px-4 py-3">
              <div class="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <Truck class="w-4 h-4 text-primary-700 dark:text-primary-400" />
              </div>
            </td>

            <!-- Placa -->
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs uppercase font-bold tracking-widest whitespace-nowrap">
              <span class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                {{ veiculo.plate || '—' }}
              </span>
            </td>

            <!-- Tipo -->
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {{ veiculo.vehicle_type || '—' }}
            </td>

            <!-- Modelo -->
            <td class="px-4 py-3">
              <div class="min-w-0">
                <p class="font-medium text-slate-900 dark:text-white truncate">
                  {{ veiculo.model || '—' }}
                </p>
              </div>
            </td>

            <!-- Ações -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click="$emit('edit', veiculo)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
                  title="Editar"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  @click="$emit('delete', veiculo)"
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
          <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
            <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="veiculos.length === 0"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-slate-400">
        <Truck class="w-8 h-8" />
        <span class="text-sm">Nenhum veículo encontrado</span>
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="veiculo in paginatedVeiculos"
        :key="'m-' + veiculo.id"
        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-soft"
      >
        <div class="flex items-start justify-between gap-2">
          <!-- Info -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Truck class="w-5 h-5 text-primary-700 dark:text-primary-400" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900 dark:text-white truncate">
                {{ veiculo.plate || '—' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate uppercase mt-0.5">
                {{ veiculo.vehicle_type || '—' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ veiculo.model || '—' }}
              </p>
            </div>
          </div>
          <!-- Ações -->
          <div class="flex items-center gap-1 shrink-0">
            <button
              @click="$emit('edit', veiculo)"
              class="p-2 text-slate-400 hover:text-primary-600 transition-colors"
              title="Editar"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="$emit('delete', veiculo)"
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
    <div v-if="!loading && veiculos.length > 0" class="mt-2">
      <BasePagination
        :current-page="currentPage"
        :total-items="veiculos.length"
        :items-per-page="itemsPerPage"
        label="veículos"
        @change-page="$emit('update:currentPage', $event)"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2, Truck } from 'lucide-vue-next'
import type { Veiculo } from '~/types/veiculo'

const props = defineProps<{
  veiculos: Veiculo[]
  loading?: boolean
  currentPage: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  edit: [veiculo: Veiculo]
  delete: [veiculo: Veiculo]
  'update:currentPage': [page: number]
}>()

const paginatedVeiculos = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.veiculos.slice(start, end)
})
</script>
