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

      <!-- ── Tabela de Entradas ── -->
      <div v-if="!entradaSelecionada" key="entradas">

        <!-- Tabela (desktop) -->
        <div class="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-card">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Data</th>
                <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Qtd Registros</th>
                <th class="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Total Recebido</th>
                <th class="px-4 py-3 w-20 text-center font-semibold text-slate-500 dark:text-slate-400 text-xs tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              <!-- Loading skeleton -->
              <tr v-if="loading" v-for="n in 4" :key="'sk-' + n">
                <td colspan="3" class="px-4 py-3">
                  <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full" />
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-else-if="transacoes.length === 0">
                <td colspan="3" class="px-4 py-10 text-center">
                  <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                    <ArrowDownToLine class="w-8 h-8" />
                    <span class="text-sm">Nenhuma transação de entrada encontrada</span>
                  </div>
                </td>
              </tr>

              <!-- Linhas -->
              <tr
                v-else
                v-for="item in paginatedTransacoes"
                :key="item.unique_id ?? item.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <CalendarDays class="w-4 h-4 text-primary-700 dark:text-primary-400" />
                    </div>
                    <span class="font-medium text-slate-900 dark:text-white">{{ formatData(item.date) }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    <ClipboardList class="w-3 h-3" />
                    {{ item.qtd_registros ?? 0 }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="parseFloat(String(item.total_recebido ?? 0)) > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Droplets class="w-3 h-3" />
                    {{ formatVolume(item.total_recebido) }} m³
                  </span>
                  <span v-else class="text-xs text-slate-400 dark:text-slate-500">—</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      @click="abrirDetalhes(item)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
                      title="Ver registros"
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

        <!-- Cards (mobile) -->
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
          <div v-else-if="transacoes.length === 0"
            class="rounded-xl border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900 flex flex-col items-center gap-2 text-slate-400">
            <ArrowDownToLine class="w-8 h-8" />
            <span class="text-sm">Nenhuma transação de entrada encontrada</span>
          </div>
          <div
            v-for="item in paginatedTransacoes"
            :key="'t-' + item.unique_id"
            class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-soft"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <CalendarDays class="w-5 h-5 text-primary-700 dark:text-primary-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-900 dark:text-white truncate">{{ formatData(item.date) }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <p class="text-xs font-semibold text-primary-600 dark:text-primary-400">{{ item.qtd_registros ?? 0 }} registro(s)</p>
                    <span v-if="parseFloat(String(item.total_recebido ?? 0)) > 0" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      · {{ formatVolume(item.total_recebido) }} m³
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button @click="abrirDetalhes(item)" class="p-2 text-slate-400 hover:text-primary-600 transition-colors" title="Ver registros">
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
        <div v-if="!loading && transacoes.length > 0" class="mt-2 text-right">
          <BasePagination
            :current-page="currentPage"
            :total-items="transacoes.length"
            :items-per-page="itemsPerPage"
            label="transações"
            @change-page="$emit('update:currentPage', $event)"
          />
        </div>

      </div>

      <!-- ── Tabela de Detalhes ── -->
      <div v-else key="detalhes">

        <!-- Header com voltar -->
        <div class="flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <button
              @click="fecharDetalhes"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft class="w-4 h-4" />
              Voltar
            </button>
            <div class="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Registros de <span class="text-primary-600 dark:text-primary-400 font-semibold">{{ formatData(entradaSelecionada.date) }}</span>
            </span>
          </div>

          <button
            @click="$emit('add-detalhe', entradaSelecionada)"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <FilePlus class="w-4 h-4" />
            Adicionar Detalhe
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loadingDetalhes" class="space-y-2">
          <div v-for="n in 4" :key="n" class="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-full" />
        </div>

        <!-- Tabela de detalhes -->
        <ResiduosListaTransacaoDetalhe
          v-else
          :detalhes="detalhes"
          :current-page="paginaDetalhes"
          :items-per-page="10"
          @update:current-page="paginaDetalhes = $event"
          @edit="$emit('edit-detalhe', $event)"
          @delete="$emit('deleteDetalhe', $event)"
        />

      </div>

    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Trash2, CalendarDays, ArrowDownToLine, ClipboardList, Eye, ArrowLeft, FilePlus, Droplets } from 'lucide-vue-next'
import type { TransacaoListaEntrada } from '~/types/transacaoListaEntrada'
import type { TransacaoListaDetalhe } from '~/types/transacaoListaDetalhe'

const props = defineProps<{
  transacoes: TransacaoListaEntrada[]
  loading?: boolean
  currentPage: number
  itemsPerPage: number
  reabrirEntrada?: TransacaoListaEntrada | null
}>()

const emit = defineEmits<{
  delete: [item: TransacaoListaEntrada]
  'edit-detalhe': [item: TransacaoListaDetalhe]
  deleteDetalhe: [item: TransacaoListaDetalhe]
  'add-detalhe': [item: TransacaoListaEntrada]
  'update:currentPage': [page: number]
  'entrada-ativa': [ativa: boolean]
}>()

const { detalhes, loading: loadingDetalhes, fetchDetalhesByEntrada } = useTransacoesListaDetalhe()

const entradaSelecionada = ref<TransacaoListaEntrada | null>(null)
const paginaDetalhes = ref(1)

// Reabre automaticamente a entrada quando voltando do formulário de detalhe
watch(() => props.reabrirEntrada, (entrada) => {
  if (entrada) abrirDetalhes(entrada)
}, { immediate: true })

const paginatedTransacoes = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.transacoes.slice(start, end)
})

async function abrirDetalhes(item: TransacaoListaEntrada) {
  if (!item.unique_id) return
  entradaSelecionada.value = item
  paginaDetalhes.value = 1
  emit('entrada-ativa', true)
  await fetchDetalhesByEntrada(item.unique_id)
}

function fecharDetalhes() {
  entradaSelecionada.value = null
  emit('entrada-ativa', false)
}

function formatVolume(value: number | string | null | undefined): string {
  const n = parseFloat(String(value ?? '0'))
  if (isNaN(n)) return '0,00'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatData(date: string | null | undefined): string {
  if (!date) return '—'
  const dateOnly = date.substring(0, 10)
  const [year, month, day] = dateOnly.split('-')
  if (!year || !month || !day) return date
  return `${day}/${month}/${year}`
}
</script>
