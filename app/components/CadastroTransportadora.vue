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
          {{ modoEdicao ? 'Editar Transportadora' : 'Nova Transportadora' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ modoEdicao ? 'Atualize os dados da transportadora.' : 'Preencha os dados para cadastrar uma nova transportadora.' }}
        </p>
      </div>
    </div>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <form class="px-6 md:px-8 pb-10 space-y-8" @submit.prevent="salvarTransportadora">

      <!-- ── Seção: Dados Cadastrais ──────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Dados Cadastrais
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Razão Social -->
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Razão Social <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.razao_social"
              type="text"
              placeholder="Ex: Transportes Logísticos LTDA"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              required
            />
          </div>

          <!-- Nome Fantasia -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome Fantasia <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nome_fantasia"
              type="text"
              placeholder="Ex: TransLog"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              required
            />
          </div>

          <!-- CNPJ -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              CNPJ <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.cnpj"
              type="text"
              placeholder="00.000.000/0000-00"
              @input="mascaraCNPJ"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              required
            />
          </div>

          <!-- Código SINIR -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Código SINIR
            </label>
            <input
              v-model="form.codigo_sinir"
              type="text"
              placeholder="Ex: 12345"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <!-- Tipo -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tipo
            </label>
            <div class="relative">
              <select
                v-model="form.type"
                class="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              >
                <option value="">Selecione...</option>
                <option value="Rodoviário">Rodoviário</option>
                <option value="Transportadora">Transportadora</option>
                <option value="Aéreo">Aéreo</option>
                <option value="Marítimo">Marítimo</option>
                <option value="Ferroviário">Ferroviário</option>
                <option value="Outros">Outros</option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      <!-- ── Seção: Contato ──────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Contato
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Nome do Contato -->
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome do Contato
            </label>
            <input
              v-model="form.contato"
              type="text"
              placeholder="Ex: Sr. Carlos (Gerente)"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <!-- E-mail -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              E-mail
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="contato@empresa.com"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <!-- Telefone -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Telefone
            </label>
            <input
              v-model="form.phone"
              type="text"
              placeholder="(00) 00000-0000"
              @input="mascaraTelefone"
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
          {{ salvando ? 'Salvando...' : 'Salvar Transportadora' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, Loader2, ChevronDown } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Transportadora } from '~/types/transportadora'
import { useTransportadoras } from '~/composables/useTransportadoras'

const props = defineProps<{
  isNovo: boolean                 // true → modo criação | false → modo edição
  transportadora?: Transportadora | null // dados da transportadora (quando isNovo = false)
}>()

const emit = defineEmits<{ voltar: []; salvo: [] }>()

const modoEdicao = computed(() => !props.isNovo)
const { createTransportadora, updateTransportadora } = useTransportadoras()
const supabase = useSupabaseClient()

const salvando = ref(false)

const form = ref({
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  codigo_sinir: '',
  email: '',
  phone: '',
  type: '',
  contato: '',
  company: null as string | null,
  drivers: null as string | null,
  Creator: null as string | null,
})

// Pré-preenche o form em modo edição
watch(() => props.transportadora, (t) => {
  if (!t) return
  form.value = {
    razao_social: t.razao_social ?? '',
    nome_fantasia: t.nome_fantasia ?? '',
    cnpj: t.cnpj ?? '',
    codigo_sinir: t.codigo_sinir ?? '',
    email: t.email ?? '',
    phone: t.phone ?? '',
    type: t.type ?? '',
    contato: t.contato ?? '',
    company: t.company ?? null,
    drivers: t.drivers ?? null,
    Creator: t.Creator ?? null,
  }
}, { immediate: true })

function mascaraCNPJ() {
  let v = form.value.cnpj?.replace(/\D/g, '') || ''
  if (v.length > 14) v = v.slice(0, 14)
  if (v.length > 12) {
    v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  } else if (v.length > 8) {
    v = v.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3')
  } else if (v.length > 5) {
    v = v.replace(/^(\d{2})(\d{3})/, '$1.$2')
  }
  form.value.cnpj = v
}

function mascaraTelefone() {
  let v = form.value.phone?.replace(/\D/g, '') || ''
  if (v.length > 11) v = v.slice(0, 11)
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
  }
  form.value.phone = v
}

async function salvarTransportadora() {
  if (salvando.value) return
  salvando.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const payload = {
      ...form.value,
      user_id: userId,
    }

    if (modoEdicao.value && props.transportadora) {
      const result = await updateTransportadora(props.transportadora.id, payload)
      if (result.success) {
        toast.success('Transportadora atualizada!', {
          description: `A transportadora ${form.value.nome_fantasia} foi atualizada com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        toast.error('Erro ao atualizar transportadora', { description: result.error || 'Tente novamente.' })
      }
    } else {
      const uniqueId = `transp_${Date.now()}`
      const result = await createTransportadora({
        ...payload,
        unique_id: uniqueId,
      })
      if (result.success) {
        toast.success('Transportadora cadastrada!', {
          description: `A transportadora ${form.value.nome_fantasia} foi adicionada com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        toast.error('Erro ao cadastrar transportadora', { description: result.error || 'Tente novamente.' })
      }
    }
  } catch (error: any) {
    toast.error('Ocorreu um erro inesperado', { description: error.message || 'Falha na comunicação com o servidor.' })
  } finally {
    salvando.value = false
  }
}
</script>
