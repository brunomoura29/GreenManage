<template>
  <div class="min-h-full">
    <div class="px-6 md:px-8 pt-8 pb-6 flex items-center gap-4">
      <button
        @click="$emit('voltar')"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {{ isNovo ? 'Novo Indicador' : 'Editar Indicador' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Preencha os dados abaixo para gerenciar este indicador.
        </p>
      </div>
    </div>

    <form @submit.prevent="salvarIndicador" class="px-6 md:px-8 pb-10 space-y-8">
      <section class="max-w-2xl">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Dados Gerais
        </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Indicador</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ex: Emissão de Carbono"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/40 focus:border-primary transition outline-none"
                required
              />
            </div>
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <BaseDropdown
                v-model="form.measurement_type"
                :options="MEASUREMENT_TYPES"
                label="Tipo de Medição (Categoria)"
                placeholder="Selecione o tipo de medição"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Valor Atual</label>
              <input
                v-model.number="form.actual_value_in_number"
                type="number"
                step="any"
                placeholder="0.00"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/40 focus:border-primary transition outline-none"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <BaseDropdown
                v-model="form.measurement_unit"
                :options="MEASUREMENT_UNITS"
                label="Unidade de Medida"
                placeholder="Selecione a unidade"
              />
            </div>
          </div>
      </section>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="$emit('voltar')"
          class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="salvando"
          class="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 transition-all shadow-soft disabled:opacity-50 flex items-center gap-2"
        >
          <Loader2 v-if="salvando" class="w-4 h-4 animate-spin" />
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Indicador } from '~/types/indicador'
import { useIndicadores, MEASUREMENT_TYPES, MEASUREMENT_UNITS } from '~/composables/useIndicadores'

const props = defineProps<{
  isNovo: boolean
  indicador?: Indicador | null
}>()

const emit = defineEmits<{ salvo: []; voltar: [] }>()

const { createIndicador, updateIndicador } = useIndicadores()
const supabase = useSupabaseClient()
const salvando = ref(false)

const form = ref({
  name: '',
  measurement_type: '',
  actual_value_in_number: null as number | null,
  measurement_unit: '',
  company: null as string | null,
  creator: null as string | null,
})

watch(() => props.indicador, (val) => {
  if (val) {
    form.value = { 
      name: val.name || '', 
      measurement_type: val.measurement_type || '',
      actual_value_in_number: val.actual_value_in_number ?? null,
      measurement_unit: val.measurement_unit || '',
      company: val.company || null,
      creator: val.creator || null,
    }
  }
}, { immediate: true })

async function salvarIndicador() {
  if (salvando.value) return
  salvando.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const payload = {
      ...form.value,
      user_id: userId,
    }

    if (!props.isNovo && props.indicador) {
      const result = await updateIndicador(props.indicador.id, payload)
      if (result.success) {
        toast.success('Indicador atualizado!', {
          description: `O indicador ${form.value.name} foi atualizado com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        const errorMsg = (result as { error: string }).error || 'Tente novamente.'
        toast.error('Erro ao atualizar', { description: errorMsg })
      }
    } else {
      const uniqueId = `ind_${Date.now()}`
      const result = await createIndicador({
        ...payload,
        unique_id: uniqueId,
      })
      if (result.success) {
        toast.success('Indicador cadastrado!', {
          description: `O indicador ${form.value.name} foi adicionado com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        const errorMsg = (result as { error: string }).error || 'Tente novamente.'
        toast.error('Erro ao cadastrar', { description: errorMsg })
      }
    }
  } catch (error: any) {
    toast.error('Erro inesperado', { description: error.message })
  } finally {
    salvando.value = false
  }
}
</script>
