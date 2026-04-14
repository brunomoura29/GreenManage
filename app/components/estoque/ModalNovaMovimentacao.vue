<template>
  <BaseModal
    :show="show"
    title="Nova Movimentação de Estoque"
    max-width="sm"
    @close="$emit('fechar')"
  >
    <div class="space-y-5">

      <!-- Tipo de movimentação -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Tipo de movimentação <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opcao in tiposOpcoes"
            :key="opcao.value"
            type="button"
            @click="tipo = opcao.value"
            class="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 transition-all"
            :class="tipo === opcao.value
              ? opcao.classeAtiva
              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'"
          >
            <component :is="opcao.icon" class="w-5 h-5" />
            <span class="text-xs font-semibold">{{ opcao.label }}</span>
          </button>
        </div>
      </div>

      <!-- Data -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Data <span class="text-red-500">*</span>
        </label>
        <input
          v-model="data"
          type="date"
          required
          class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
        />
      </div>

      <!-- Período -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Período do dia <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="shift = 'manha'"
            class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all"
            :class="shift === 'manha'
              ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-500'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'"
          >
            <Sun class="w-4 h-4" />
            <span class="text-sm font-medium">Manhã</span>
          </button>
          <button
            type="button"
            @click="shift = 'noite'"
            class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all"
            :class="shift === 'noite'
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-500'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'"
          >
            <Moon class="w-4 h-4" />
            <span class="text-sm font-medium">Noite</span>
          </button>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          @click="$emit('fechar')"
          class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="!tipo"
          @click="confirmar"
          class="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowRight class="w-4 h-4" />
          Continuar
        </button>
      </div>

    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Sun, Moon, ArrowRight, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-vue-next'
import type { MovimentoEstoqueTipo, MovimentoEstoqueTurno } from '~/types/movimentoEstoque'

const props = defineProps<{ show: boolean }>()

const emit = defineEmits<{
  fechar: []
  confirmar: [payload: { type: MovimentoEstoqueTipo; date: string; shift: MovimentoEstoqueTurno }]
}>()

const tipo = ref<MovimentoEstoqueTipo | null>(null)
const data = ref('')
const shift = ref<MovimentoEstoqueTurno>('manha')

const tiposOpcoes = [
  {
    value: 'Entrada' as MovimentoEstoqueTipo,
    label: 'Entrada',
    icon: ArrowDownToLine,
    classeAtiva: 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500',
  },
  {
    value: 'Consumo' as MovimentoEstoqueTipo,
    label: 'Consumo',
    icon: ArrowUpFromLine,
    classeAtiva: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500',
  },
  {
    value: 'Ajuste' as MovimentoEstoqueTipo,
    label: 'Ajuste',
    icon: SlidersHorizontal,
    classeAtiva: 'border-slate-400 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-500',
  },
]

// Reseta ao abrir
watch(() => props.show, (val) => {
  if (val) {
    tipo.value = null
    data.value = new Date().toISOString().split('T')[0]
    shift.value = 'manha'
  }
})

function confirmar() {
  if (!tipo.value) return
  emit('confirmar', {
    type:  tipo.value,
    date:  data.value,
    shift: shift.value,
  })
  emit('fechar')
}
</script>
