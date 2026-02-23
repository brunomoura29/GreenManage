<template>
  <div class="w-full">

    <!-- ── Tabela (desktop / tablet) ─────────────────────────────────────── -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-card">
      <table class="w-full text-sm text-left">
        <!-- Cabeçalho -->
        <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Imagem
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Nome do Local
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
            <td colspan="3" class="px-4 py-3">
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="locais.length === 0">
            <td colspan="3" class="px-4 py-10 text-center">
              <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                <MapPin class="w-8 h-8" />
                <span class="text-sm">Nenhum local encontrado</span>
              </div>
            </td>
          </tr>

          <!-- Linhas -->
          <tr
            v-else
            v-for="local in paginatedLocais"
            :key="local.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <!-- Imagem -->
            <td class="px-4 py-3">
              <div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                <img v-if="local.imagem" :src="local.imagem" :alt="local.nome" class="w-full h-full object-cover" />
                <MapPin v-else class="w-6 h-6 text-slate-400" />
              </div>
            </td>

            <!-- Nome -->
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900 dark:text-white">
                {{ local.nome || '—' }}
              </p>
            </td>

            <!-- Ações -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click="$emit('edit', local)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
                  title="Editar"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  @click="$emit('delete', local)"
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
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="locais.length === 0"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-slate-400">
        <MapPin class="w-8 h-8" />
        <span class="text-sm">Nenhum local encontrado</span>
      </div>

      <!-- Cards -->
      <div
        v-else
        v-for="local in paginatedLocais"
        :key="'m-' + local.id"
        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-soft"
      >
        <div class="flex items-center justify-between gap-2">
          <!-- Info -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
              <img v-if="local.imagem" :src="local.imagem" :alt="local.nome" class="w-full h-full object-cover" />
              <MapPin v-else class="w-5 h-5 text-slate-400" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900 dark:text-white truncate">
                {{ local.nome || '—' }}
              </p>
            </div>
          </div>
          <!-- Ações -->
          <div class="flex items-center gap-1 shrink-0">
            <button
              @click="$emit('edit', local)"
              class="p-2 text-slate-400 hover:text-primary-600 transition-colors"
              title="Editar"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="$emit('delete', local)"
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
    <div v-if="!loading && locais.length > 0" class="mt-2">
      <BasePagination
        :current-page="currentPage"
        :total-items="locais.length"
        :items-per-page="itemsPerPage"
        label="locais"
        @change-page="$emit('update:currentPage', $event)"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2, MapPin } from 'lucide-vue-next'

interface Local {
  id: string
  nome: string | null
  imagem: string | null
}

const props = defineProps<{
  locais: Local[]
  loading?: boolean
  currentPage: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  edit: [local: Local]
  delete: [local: Local]
  'update:currentPage': [page: number]
}>()

const paginatedLocais = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.locais.slice(start, end)
})
</script>
