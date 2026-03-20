<template>
  <div class="w-full">

    <!-- ── Tabela (desktop / tablet) ─────────────────────────────────────── -->
    <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-card">
      <table class="w-full text-sm text-left">
        <!-- Cabeçalho -->
        <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Descarga
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Volume (m³)
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Cliente
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              NF
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              MTR
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              Transportadora
            </th>
            <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">
              MTR(s) Transportadora
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
            <td colspan="8" class="px-4 py-3">
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="detalhes.length === 0">
            <td colspan="8" class="px-4 py-10 text-center">
              <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                <ClipboardList class="w-8 h-8" />
                <span class="text-sm">Nenhum registro encontrado</span>
              </div>
            </td>
          </tr>

          <!-- Linhas -->
          <tr
            v-else
            v-for="item in paginatedDetalhes"
            :key="item.unique_id ?? item.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <!-- Descarga -->
            <td class="px-4 py-3">
              <span class="font-medium text-slate-900 dark:text-white">
                {{ item.discharge_number || '—' }}
              </span>
            </td>

            <!-- Volume -->
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {{ item.volume_in_m3 != null ? item.volume_in_m3.toLocaleString('pt-BR') : '—' }}
              </span>
            </td>

            <!-- Cliente -->
            <td class="px-4 py-3">
              <span class="text-sm text-slate-700 dark:text-slate-300">
                {{ item.nome_cliente || '—' }}
              </span>
            </td>

            <!-- NF -->
            <td class="px-4 py-3">
              <span class="text-sm text-slate-700 dark:text-slate-300">
                {{ item.nota_fiscal || '—' }}
              </span>
            </td>

            <!-- MTR -->
            <td class="px-4 py-3">
              <span class="text-sm text-slate-700 dark:text-slate-300">
                {{ item.mtr || '—' }}
              </span>
            </td>

            <!-- Transportadora -->
            <td class="px-4 py-3">
              <span class="text-sm text-slate-700 dark:text-slate-300">
                {{ item.nome_transportadora || '—' }}
              </span>
            </td>

            <!-- MTR(s) Transportadora -->
            <td class="px-4 py-3">
              <button
                @click="abrirModalMtrs(item)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                title="Ver MTR(s)"
              >
                <FileText class="w-3 h-3" />
                {{ parseMtrs(item.mtrs_transportadora).length }} MTR(s)
              </button>
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
      <div v-else-if="detalhes.length === 0"
        class="rounded-xl border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-slate-400">
        <ClipboardList class="w-8 h-8" />
        <span class="text-sm">Nenhum registro encontrado</span>
      </div>

      <!-- Cards -->
      <div
        v-for="item in paginatedDetalhes"
        :key="'d-' + item.unique_id"
        class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-soft"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <ClipboardList class="w-5 h-5 text-primary-700 dark:text-primary-400" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900 dark:text-white truncate">
                {{ item.discharge_number || '—' }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                {{ item.carrier || '—' }}
              </p>
              <p class="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                {{ item.volume_in_m3 != null ? item.volume_in_m3.toLocaleString('pt-BR') + ' m³' : '—' }}
              </p>
            </div>
          </div>
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

    <!-- Modal MTR(s) Transportadora -->
    <BaseModal
      :show="showModalMtrs"
      title="MTR(s) Transportadora"
      max-width="sm"
      @close="showModalMtrs = false"
    >
      <div v-if="mtrsAtivos.length === 0" class="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
        Nenhum MTR cadastrado
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="(mtr, i) in mtrsAtivos"
          :key="i"
          class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
        >
          <FileText class="w-4 h-4 text-blue-500 shrink-0" />
          {{ mtr }}
        </li>
      </ul>
    </BaseModal>

    <!-- Paginação -->
    <div v-if="!loading && detalhes.length > 0" class="mt-2 text-right">
      <BasePagination
        :current-page="currentPage"
        :total-items="detalhes.length"
        :items-per-page="itemsPerPage"
        label="registros"
        @change-page="$emit('update:currentPage', $event)"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Pencil, Trash2, ClipboardList, FileText } from 'lucide-vue-next'
import type { TransacaoListaDetalhe } from '~/types/transacaoListaDetalhe'

const props = defineProps<{
  detalhes: TransacaoListaDetalhe[]
  loading?: boolean
  currentPage: number
  itemsPerPage: number
}>()

const emit = defineEmits<{
  edit: [item: TransacaoListaDetalhe]
  delete: [item: TransacaoListaDetalhe]
  'update:currentPage': [page: number]
}>()

const paginatedDetalhes = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.detalhes.slice(start, end)
})

// ── Modal MTRs ────────────────────────────────────────────────────────────────
const showModalMtrs = ref(false)
const mtrsAtivos = ref<string[]>([])

function parseMtrs(mtrs: any): string[] {
  if (!mtrs) return []
  if (Array.isArray(mtrs)) return mtrs.map(String)
  if (typeof mtrs === 'string') {
    try { return JSON.parse(mtrs) } catch { return [mtrs] }
  }
  return []
}

function abrirModalMtrs(item: TransacaoListaDetalhe) {
  mtrsAtivos.value = parseMtrs(item.mtrs_transportadora)
  showModalMtrs.value = true
}
</script>
