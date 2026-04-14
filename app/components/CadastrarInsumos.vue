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
          {{ modoEdicao ? 'Editar Insumo' : 'Novo Insumo' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ modoEdicao ? 'Atualize os dados do insumo.' : 'Preencha os dados para cadastrar um novo insumo.' }}
        </p>
      </div>
    </div>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <form class="px-6 md:px-8 pb-10 space-y-8" @submit.prevent="salvarInsumo">

      <!-- ── Seção: Identificação ────────────────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Identificação
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Nome -->
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome do Insumo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ex: Cloro granulado, Sulfato de alumínio..."
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <!-- Unidade de Medida -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Unidade de Medida
            </label>
            <div class="relative">
              <select
                v-model="form.measurement_unit"
                class="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              >
                <option value="">Selecione...</option>
                <option value="kg">kg — Quilograma</option>
                <option value="g">g — Grama</option>
                <option value="L">L — Litro</option>
                <option value="mL">mL — Mililitro</option>
                <option value="m³">m³ — Metro Cúbico</option>
                <option value="un">un — Unidade</option>
                <option value="cx">cx — Caixa</option>
                <option value="sc">sc — Saco</option>
                <option value="tambor">tambor</option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <!-- Foto (URL) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Foto (URL)
            </label>
            <input
              v-model="form.photos"
              type="text"
              placeholder="https://..."
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

        </div>
      </section>

      <!-- ── Seção: Estoque e Valores ────────────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Estoque e Valores
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Estoque Atual -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Estoque Atual
            </label>
            <div class="relative">
              <input
                v-model="form.current_stock"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                class="w-full px-3 py-2.5 pr-16 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              <span
                v-if="form.measurement_unit"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 pointer-events-none"
              >
                {{ form.measurement_unit }}
              </span>
            </div>
          </div>

          <!-- Valor Unitário -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Valor Unitário (R$)
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500 pointer-events-none">R$</span>
              <input
                v-model="form.unit_value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
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
          {{ salvando ? 'Salvando...' : 'Salvar Insumo' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, ChevronDown, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Insumo } from '~/types/insumo'

const props = defineProps<{
  isNovo: boolean
  insumo?: Insumo | null
}>()

const emit = defineEmits<{ voltar: [] }>()

const modoEdicao = computed(() => !props.isNovo)

const { createInsumo, updateInsumo } = useInsumos()
const { getCompanyId } = useEmpresas()
const supabase = useSupabaseClient()

const salvando = ref(false)

// ─── Dados do formulário ──────────────────────────────────────────────────────
const form = ref({
  name: '',
  measurement_unit: '',
  photos: '',
  current_stock: null as number | null,
  unit_value: null as number | null,
})

// ─── Pré-preenche o form em modo edição ──────────────────────────────────────
watch(() => props.insumo, (i) => {
  if (!i) return
  form.value = {
    name:             i.name             ?? '',
    measurement_unit: i.measurement_unit ?? '',
    photos:           i.photos           ?? '',
    current_stock:    i.current_stock    ?? null,
    unit_value:       i.unit_value       ?? null,
  }
}, { immediate: true })

// ─── Helpers ─────────────────────────────────────────────────────────────────
function resetForm() {
  form.value = {
    name: '',
    measurement_unit: '',
    photos: '',
    current_stock: null,
    unit_value: null,
  }
}

// ─── Salvar ───────────────────────────────────────────────────────────────────
async function salvarInsumo() {
  if (salvando.value) return

  if (!form.value.name.trim()) {
    toast.error('Informe o nome do insumo.')
    return
  }

  salvando.value = true

  const { data: { user } } = await (supabase as any).auth.getUser()
  const userId = user?.id ?? null
  const companyId = await getCompanyId()

  const payload = {
    name:             form.value.name.trim()       || null,
    measurement_unit: form.value.measurement_unit  || null,
    photos:           form.value.photos.trim()     || null,
    current_stock:    form.value.current_stock     ?? null,
    unit_value:       form.value.unit_value        ?? null,
    user_id:          userId,
    company:          companyId,
    unique_id:        null as string | null,
  }

  // ── EDIÇÃO ──────────────────────────────────────────────────────────────────
  if (modoEdicao.value && props.insumo) {
    const result = await updateInsumo(props.insumo.id, payload)
    salvando.value = false

    if (!result.success) {
      toast.error('Erro ao atualizar insumo', { description: (result as any).error ?? 'Tente novamente.' })
      return
    }

    toast.success('Insumo atualizado!', {
      description: `${form.value.name} foi atualizado com sucesso.`,
    })
    resetForm()
    emit('voltar')
    return
  }

  // ── CRIAÇÃO ─────────────────────────────────────────────────────────────────
  payload.unique_id = `ins_${Date.now()}`

  const result = await createInsumo(payload)
  salvando.value = false

  if (!result.success) {
    toast.error('Erro ao salvar insumo', { description: (result as any).error ?? 'Tente novamente.' })
    return
  }

  toast.success('Insumo cadastrado!', {
    description: `${form.value.name} foi adicionado com sucesso.`,
  })
  resetForm()
  emit('voltar')
}
</script>
