<template>
  <div class="min-h-full">

    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="px-6 md:px-8 pt-8 pb-6 flex items-center gap-4">
      <button
        @click="$emit('voltar')"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Voltar para lista"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          {{ modoEdicao ? 'Editar Operador' : 'Novo Operador' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ modoEdicao ? 'Atualize os dados do operador.' : 'Preencha os dados para cadastrar um novo operador.' }}
        </p>
      </div>
    </div>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <form class="px-6 md:px-8 pb-10 space-y-8" @submit.prevent="salvarOperador">

      <!-- ── Seção: Dados Principais ──────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Dados Principais
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Nome Completo -->
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome Completo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ex: João da Silva"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              required
            />
          </div>

          <!-- CPF -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              CPF <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.cpf"
              type="text"
              placeholder="000.000.000-00"
              @input="mascaraCPF"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              required
            />
          </div>

        </div>
      </section>

      <!-- ── Ações ─────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="$emit('voltar')"
          class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="salvando"
          class="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Loader2 v-if="salvando" class="w-4 h-4 animate-spin" />
          {{ salvando ? 'Salvando...' : 'Salvar Operador' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Operador } from '~/types/operador'
import { useOperadores } from '~/composables/useOperadores'

const props = defineProps<{
  isNovo: boolean             // true → modo criação | false → modo edição
  operador?: Operador | null   // dados do operador (quando isNovo = false)
}>()

const emit = defineEmits<{ voltar: []; salvo: [] }>()

const modoEdicao = computed(() => !props.isNovo)
const { createOperador, updateOperador } = useOperadores()
const supabase = useSupabaseClient()

const salvando = ref(false)

const form = ref({
  name: '',
  cpf: '',
  company: null as string | null,
  creator: null as string | null,
})

// Pré-preenche o form em modo edição
watch(() => props.operador, (o) => {
  if (!o) return
  form.value = {
    name: o.name ?? '',
    cpf: o.cpf ?? '',
    company: o.company ?? null,
    creator: o.creator ?? null,
  }
}, { immediate: true })

function mascaraCPF() {
  let v = form.value.cpf?.replace(/\D/g, '') || ''
  if (v.length > 11) v = v.slice(0, 11)
  if (v.length > 9) {
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (v.length > 6) {
    v = v.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3')
  } else if (v.length > 3) {
    v = v.replace(/(\d{3})(\d{3})/, '$1.$2')
  }
  form.value.cpf = v
}

async function salvarOperador() {
  if (salvando.value) return
  salvando.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const payload = {
      ...form.value,
      user_id: userId,
    }

    if (modoEdicao.value && props.operador) {
      const result = await updateOperador(props.operador.id, payload)
      if (result.success) {
        toast.success('Operador atualizado!', {
          description: `O operador ${form.value.name} foi atualizado com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        toast.error('Erro ao atualizar operador', { description: result.error || 'Tente novamente.' })
      }
    } else {
      const uniqueId = `ope_${Date.now()}`
      const result = await createOperador({
        ...payload,
        unique_id: uniqueId,
      })
      if (result.success) {
        toast.success('Operador cadastrado!', {
          description: `O operador ${form.value.name} foi adicionado com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        toast.error('Erro ao cadastrar operador', { description: result.error || 'Tente novamente.' })
      }
    }
  } catch (error: any) {
    toast.error('Ocorreu um erro inesperado', { description: error.message || 'Falha na comunicação com o servidor.' })
  } finally {
    salvando.value = false
  }
}
</script>
