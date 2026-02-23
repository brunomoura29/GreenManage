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
          {{ modoEdicao ? 'Editar Veículo' : 'Novo Veículo' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ modoEdicao ? 'Atualize os dados do veículo.' : 'Preencha os dados para cadastrar um novo veículo.' }}
        </p>
      </div>
    </div>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <form class="px-6 md:px-8 pb-10 space-y-8" @submit.prevent="salvarVeiculo">

      <!-- ── Seção: Identificação ──────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Identificação
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Placa -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Placa <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.plate"
              type="text"
              placeholder="AAA-0000 ou AAA0A00"
              maxlength="8"
              @input="mascaraPlaca"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition uppercase"
              required
            />
          </div>

          <!-- Tipo de Veículo -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tipo de Veículo <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <select
                v-model="form.vehicle_type"
                class="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                required
              >
                <option value="">Selecione...</option>
                <option value="Caminhão Leve">Caminhão Leve</option>
                <option value="Caminhão Pesado">Caminhão Pesado</option>
                <option value="Carreta">Carreta</option>
                <option value="Toco">Toco</option>
                <option value="Rodotrem">Rodotrem</option>
                <option value="Utilitário">Utilitário</option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <!-- Modelo -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Modelo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.model"
              type="text"
              placeholder="Ex: Mercedes-Benz Accelo 1016"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              required
            />
          </div>

          <!-- Capacidade -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Capacidade (m³)
            </label>
            <input
              v-model.number="form.capacity_in_cubic_meters"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
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
          {{ salvando ? 'Salvando...' : 'Salvar Veículo' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, ChevronDown, Loader2, Truck } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Veiculo } from '~/types/veiculo'
import { useVeiculos } from '~/composables/useVeiculos'

const props = defineProps<{
  isNovo: boolean             // true → modo criação | false → modo edição
  veiculo?: Veiculo | null    // dados do veículo (quando isNovo = false)
}>()

const emit = defineEmits<{ voltar: []; salvo: [] }>()

const modoEdicao = computed(() => !props.isNovo)
const { createVeiculo, updateVeiculo } = useVeiculos()
const supabase = useSupabaseClient()

const salvando = ref(false)

const form = ref({
  plate: '',
  model: '',
  vehicle_type: '',
  capacity_in_cubic_meters: null as number | null,
  company: null as string | null,
})

// Pré-preenche o form em modo edição
watch(() => props.veiculo, (v) => {
  if (!v) return
  form.value = {
    plate: v.plate ?? '',
    model: v.model ?? '',
    vehicle_type: v.vehicle_type ?? '',
    capacity_in_cubic_meters: v.capacity_in_cubic_meters,
    company: v.company,
  }
}, { immediate: true })

function mascaraPlaca() {
  let v = form.value.plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (v.length > 3) {
    // Se for placa antiga (AAA-0000) ou Mercosul (AAA0A00)
    // Mantemos sem o hífen no v-model para o banco, mas se quiser visual, podemos adicionar
    // Por enquanto, apenas limitamos e formatamos básico
    v = v.slice(0, 7)
  }
  form.value.plate = v
}

async function salvarVeiculo() {
  if (salvando.value) return
  salvando.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const payload = {
      ...form.value,
      user_id: userId,
    }

    if (modoEdicao.value && props.veiculo) {
      const result = await updateVeiculo(props.veiculo.id, payload)
      if (result.success) {
        toast.success('Veículo atualizado!', {
          description: `O veículo de placa ${form.value.plate} foi atualizado com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        toast.error('Erro ao atualizar veículo', { description: result.error || 'Tente novamente.' })
      }
    } else {
      const uniqueId = `veic_${Date.now()}`
      const result = await createVeiculo({
        ...payload,
        unique_id: uniqueId,
        vehicle_list: null,
        creator: null,
      })
      if (result.success) {
        toast.success('Veículo cadastrado!', {
          description: `O veículo de placa ${form.value.plate} foi adicionado com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        toast.error('Erro ao cadastrar veículo', { description: result.error || 'Tente novamente.' })
      }
    }
  } catch (error: any) {
    toast.error('Ocorreu um erro inesperado', { description: error.message || 'Falha na comunicação com o servidor.' })
  } finally {
    salvando.value = false
  }
}
</script>
