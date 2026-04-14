<template>
  <div class="w-full">

    <!-- ── Tabela (desktop) ──────────────────────────────────────────────── -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-card">
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Data</th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Período</th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Tipo</th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Custo Total</th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Qtd Movim.</th>
            <th class="px-4 py-3 w-24 text-center font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">

          <!-- Loading skeleton -->
          <tr v-if="loading" v-for="n in 4" :key="'sk-' + n">
            <td colspan="6" class="px-4 py-3">
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="movimentos.length === 0">
            <td colspan="6" class="px-4 py-10 text-center">
              <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                <PackageOpen class="w-8 h-8" />
                <span class="text-sm">Nenhuma movimentação encontrada</span>
              </div>
            </td>
          </tr>

          <!-- Linhas -->
          <tr
            v-else
            v-for="item in paginatedMovimentos"
            :key="item.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <!-- Data -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <CalendarDays class="w-4 h-4 text-primary-700 dark:text-primary-400" />
                </div>
                <span class="font-medium text-slate-900 dark:text-white">{{ formatData(item.date) }}</span>
              </div>
            </td>

            <!-- Período -->
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="item.shift === 'manha'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'"
              >
                <Sun v-if="item.shift === 'manha'" class="w-3 h-3" />
                <Moon v-else class="w-3 h-3" />
                {{ item.shift === 'manha' ? 'Manhã' : 'Noite' }}
              </span>
            </td>

            <!-- Tipo -->
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" :class="tipoClass(item.type)">
                <component :is="tipoIcon(item.type)" class="w-3 h-3" />
                {{ item.type }}
              </span>
            </td>

            <!-- Custo Total -->
            <td class="px-4 py-3">
              <span v-if="item.custo_total > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <DollarSign class="w-3 h-3" />
                {{ formatMoeda(item.custo_total) }}
              </span>
              <span v-else class="text-xs text-slate-400 dark:text-slate-500">—</span>
            </td>

            <!-- Qtd Movimentações -->
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                <ClipboardList class="w-3 h-3" />
                {{ contagemPorMovimento[item.unique_id] ?? '—' }}
              </span>
            </td>

            <!-- Ações -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click="$emit('ver-movimento', item)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
                  title="Ver / lançar transações"
                >
                  <Eye class="w-4 h-4" />
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

      <div v-else-if="movimentos.length === 0"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-slate-400">
        <PackageOpen class="w-8 h-8" />
        <span class="text-sm">Nenhuma movimentação encontrada</span>
      </div>

      <div
        v-for="item in paginatedMovimentos"
        :key="'m-' + item.id"
        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-soft"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <CalendarDays class="w-5 h-5 text-primary-700 dark:text-primary-400" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900 dark:text-white truncate">{{ formatData(item.date) }}</p>
              <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="item.shift === 'manha'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'">
                  {{ item.shift === 'manha' ? 'Manhã' : 'Noite' }}
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" :class="tipoClass(item.type)">
                  {{ item.type }}
                </span>
                <span v-if="item.custo_total > 0" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {{ formatMoeda(item.custo_total) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button @click="$emit('ver-movimento', item)" class="p-2 text-slate-400 hover:text-primary-600 transition-colors" title="Ver transações">
              <Eye class="w-4 h-4" />
            </button>
            <button @click="$emit('delete', item)" class="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Excluir">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginação -->
    <div v-if="!loading && movimentos.length > 0" class="mt-2">
      <BasePagination
        :current-page="currentPage"
        :total-items="movimentos.length"
        :items-per-page="itemsPerPage"
        label="movimentações"
        @change-page="$emit('update:currentPage', $event)"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Eye, Trash2, CalendarDays, PackageOpen, ClipboardList,
  DollarSign, Sun, Moon, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal
} from 'lucide-vue-next'
import type { MovimentoEstoque } from '~/types/movimentoEstoque'

const props = defineProps<{
  movimentos: MovimentoEstoque[]
  loading?: boolean
  currentPage: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  'ver-movimento': [item: MovimentoEstoque]
  delete: [item: MovimentoEstoque]
  'update:currentPage': [page: number]
}>()

const supabase = useSupabaseClient() as any
const contagemPorMovimento = ref<Record<string, number>>({})

async function carregarContagens(movimentos: MovimentoEstoque[]) {
  if (movimentos.length === 0) return

  const ids = movimentos.map(m => m.unique_id)

  const { data } = await supabase
    .from('transacao_estoque')
    .select('stock_movement')
    .in('stock_movement', ids)

  if (!data) return

  const contagem: Record<string, number> = {}
  for (const row of data) {
    contagem[row.stock_movement] = (contagem[row.stock_movement] ?? 0) + 1
  }
  contagemPorMovimento.value = contagem
}

watch(() => props.movimentos, (val) => {
  carregarContagens(val)
}, { immediate: true })

const paginatedMovimentos = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  return props.movimentos.slice(start, start + props.itemsPerPage)
})

function formatData(date: string | null | undefined): string {
  if (!date) return '—'
  const [year, month, day] = date.substring(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function formatMoeda(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  return isNaN(n) ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function tipoClass(type: string): string {
  if (type === 'Entrada') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (type === 'Consumo') return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
}

function tipoIcon(type: string) {
  if (type === 'Entrada') return ArrowDownToLine
  if (type === 'Consumo') return ArrowUpFromLine
  return SlidersHorizontal
}
</script>
