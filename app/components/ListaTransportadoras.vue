<template>
  <div class="w-full">

    <!-- ── Tabela (desktop / tablet) ─────────────────────────────────────── -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-card">
      <table class="w-full text-sm text-left">
        <!-- Cabeçalho -->
        <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              Transportadora
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              CNPJ
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              E-mail
            </th>
            <th class="px-4 py-3 w-20 text-center font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
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
          <tr v-else-if="transportadoras.length === 0">
            <td colspan="4" class="px-4 py-10 text-center">
              <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                <Truck class="w-8 h-8" />
                <span class="text-sm">Nenhuma transportadora encontrada</span>
              </div>
            </td>
          </tr>

          <!-- Linhas -->
          <tr
            v-else
            v-for="transportadora in paginatedTransportadoras"
            :key="transportadora.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <!-- Transportadora (Nome/Icon) -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <Truck class="w-4 h-4 text-primary-700 dark:text-primary-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">
                    {{ transportadora.nome || '—' }}
                  </p>
                </div>
              </div>
            </td>

            <!-- CNPJ -->
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {{ transportadora.cnpj || '—' }}
            </td>

            <!-- E-mail -->
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[200px]" :title="transportadora.email || undefined">
              {{ transportadora.email || '—' }}
            </td>

            <!-- Ações -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click="$emit('edit', transportadora)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
                  title="Editar"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  @click="$emit('delete', transportadora)"
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
      <div v-else-if="transportadoras.length === 0"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-slate-400">
        <Truck class="w-8 h-8" />
        <span class="text-sm">Nenhuma transportadora encontrada</span>
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="transportadora in paginatedTransportadoras"
        :key="'m-' + transportadora.id"
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
                {{ transportadora.nome || '—' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ transportadora.cnpj || '—' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {{ transportadora.email || '—' }}
              </p>
            </div>
          </div>
          <!-- Ações -->
          <div class="flex items-center gap-1 shrink-0">
            <button
              @click="$emit('edit', transportadora)"
              class="p-2 text-slate-400 hover:text-primary-600 transition-colors"
              title="Editar"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="$emit('delete', transportadora)"
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
    <div v-if="!loading && transportadoras.length > 0" class="mt-2 text-primary-900/10">
      <BasePagination
        :current-page="currentPage"
        :total-items="transportadoras.length"
        :items-per-page="itemsPerPage"
        label="transportadoras"
        @change-page="$emit('update:currentPage', $event)"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2, Truck } from 'lucide-vue-next'

interface Transportadora {
  id: string
  nome: string | null
  cnpj: string | null
  email: string | null
}

const props = defineProps<{
  transportadoras: Transportadora[]
  loading?: boolean
  currentPage: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  edit: [transportadora: Transportadora]
  delete: [transportadora: Transportadora]
  'update:currentPage': [page: number]
}>()

const paginatedTransportadoras = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.transportadoras.slice(start, end)
})
</script>
