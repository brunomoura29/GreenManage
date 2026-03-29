<template>
  <BaseModal
    :show="show"
    title="Criar operação diária"
    max-width="sm"
    @close="$emit('fechar')"
  >
    <form @submit.prevent="criar" class="space-y-5">

      <!-- Data da operação -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
          Data da operação <span class="text-red-500">*</span>
        </label>
        <input
          v-model="dataOperacao"
          type="date"
          required
          class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
        />
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
          type="submit"
          :disabled="criando"
          class="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Loader2 v-if="criando" class="w-4 h-4 animate-spin" />
          Criar
        </button>
      </div>

    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useTransacoesListaEntrada } from '~/composables/useTransacoesListaEntrada'
import { useEmpresas } from '~/composables/useEmpresas'
import type { TransacaoListaEntrada } from '~/types/transacaoListaEntrada'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ fechar: []; criado: [transacao: TransacaoListaEntrada] }>()

const { createTransacao } = useTransacoesListaEntrada()
const { getCompanyId } = useEmpresas()
const supabase = useSupabaseClient()

const dataOperacao = ref('')
const criando = ref(false)

// Reseta o campo ao abrir
watch(() => props.show, (val) => {
  if (val) dataOperacao.value = new Date().toISOString().split('T')[0]
})

async function criar() {
  if (criando.value || !dataOperacao.value) return
  criando.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null
    const company = await getCompanyId()

    const result = await createTransacao({
      unique_id: `entrada_${Date.now()}`,
      user_id: userId,
      company,
      date: dataOperacao.value,
      date_text: dataOperacao.value,
      transaction_type: 'Entrada',
      total_recebido: null,
      volume_descartado_vala: null,
      blend_destinado: null,
      creator: userId,
    })

    if (result?.success && result.data) {
      toast.success('Operação criada!', {
        description: `Entrada do dia ${dataOperacao.value} criada com sucesso.`,
      })
      emit('criado', result.data as TransacaoListaEntrada)
      emit('fechar')
    } else {
      toast.error('Erro ao criar operação', { description: result?.error ?? 'Tente novamente.' })
    }
  } catch (err: any) {
    toast.error('Erro inesperado', { description: err.message ?? 'Falha na comunicação com o servidor.' })
  } finally {
    criando.value = false
  }
}
</script>
