<template>
  <div class="w-full">

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-4 opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-4 opacity-0"
      mode="out-in"
    >

      <div key="insumos">

        <!-- ── Tabela (desktop) ──────────────────────────────────────────────── -->
        <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-card">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Nome</th>
                <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Unidade</th>
                <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Estoque Atual</th>
                <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Valor Unitário</th>
                <th class="px-4 py-3 w-20 text-center font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">

              <!-- Loading skeleton -->
              <tr v-if="loading" v-for="n in 4" :key="'sk-' + n">
                <td colspan="5" class="px-4 py-3">
                  <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-else-if="insumos.length === 0">
                <td colspan="5" class="px-4 py-10 text-center">
                  <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                    <FlaskConical class="w-8 h-8" />
                    <span class="text-sm">Nenhum insumo encontrado</span>
                  </div>
                </td>
              </tr>

              <!-- Linhas -->
              <tr
                v-else
                v-for="item in paginatedInsumos"
                :key="item.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <!-- Nome -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <FlaskConical class="w-4 h-4 text-primary-700 dark:text-primary-400" />
                    </div>
                    <span class="font-medium text-slate-900 dark:text-white truncate">
                      {{ item.name || '—' }}
                    </span>
                  </div>
                </td>

                <!-- Unidade -->
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {{ item.measurement_unit || '—' }}
                </td>

                <!-- Estoque Atual -->
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="estoqueClass(item.current_stock)"
                  >
                    <Package class="w-3 h-3" />
                    {{ formatNumero(item.current_stock) }}
                  </span>
                </td>

                <!-- Valor Unitário -->
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {{ formatMoeda(item.unit_value) }}
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

        <!-- ── Cards (mobile) ───────────────────────────────────────────────── -->
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
          <div v-else-if="insumos.length === 0"
            class="rounded-xl border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-slate-400">
            <FlaskConical class="w-8 h-8" />
            <span class="text-sm">Nenhum insumo encontrado</span>
          </div>

          <!-- Cards -->
          <div
            v-else
            v-for="item in paginatedInsumos"
            :key="'m-' + item.id"
            class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-soft"
          >
            <div class="flex items-start justify-between gap-2">
              <!-- Info -->
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <FlaskConical class="w-5 h-5 text-primary-700 dark:text-primary-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900 dark:text-white truncate">
                    {{ item.name || '—' }}
                  </p>
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span class="text-xs text-slate-500 dark:text-slate-400">
                      {{ item.measurement_unit || '—' }}
                    </span>
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      :class="estoqueClass(item.current_stock)"
                    >
                      <Package class="w-3 h-3" />
                      {{ formatNumero(item.current_stock) }}
                    </span>
                    <span v-if="item.unit_value" class="text-xs text-slate-500 dark:text-slate-400">
                      {{ formatMoeda(item.unit_value) }}
                    </span>
                  </div>
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

        <!-- Paginação -->
        <div v-if="!loading && insumos.length > 0" class="mt-2">
          <BasePagination
            :current-page="currentPage"
            :total-items="insumos.length"
            :items-per-page="itemsPerPage"
            label="insumos"
            @change-page="$emit('update:currentPage', $event)"
          />
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2, FlaskConical, Package } from 'lucide-vue-next'
import type { Insumo } from '~/types/insumo'

const props = defineProps<{
  insumos: Insumo[]
  loading?: boolean
  currentPage: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  edit: [item: Insumo]
  delete: [item: Insumo]
  'update:currentPage': [page: number]
}>()

const paginatedInsumos = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.insumos.slice(start, end)
})

function estoqueClass(stock: number | null | undefined): string {
  const val = Number(stock ?? 0)
  if (val <= 0) return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (val < 10) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
}

function formatNumero(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  if (isNaN(n)) return '0'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatMoeda(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  if (isNaN(n) || n === 0) return '—'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>
