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
          {{ modoEdicao ? 'Editar Cliente' : 'Novo Cliente' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ modoEdicao ? 'Atualize os dados do cliente.' : 'Preencha os dados para cadastrar um novo cliente.' }}
        </p>
      </div>
    </div>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <form class="px-6 md:px-8 pb-10 space-y-8" @submit.prevent="salvarCliente">

      <!-- ── Seção: Tipo e Identificação ──────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Identificação
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Tipo de cliente -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tipo de cliente <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <select
                v-model="tipoCliente"
                class="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              >
                <option value="">Selecione...</option>
                <option value="cpf">Pessoa Física (CPF)</option>
                <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
              </select>
              <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <!-- CPF -->
          <div v-if="tipoCliente === 'cpf'" class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              CPF <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.document"
              type="text"
              placeholder="000.000.000-00"
              maxlength="14"
              @input="mascaraCpf"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <!-- CNPJ -->
          <div v-if="tipoCliente === 'cnpj'" class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              CNPJ <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.document"
              type="text"
              placeholder="00.000.000/0000-00"
              maxlength="18"
              @input="mascaraCnpj"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Campos exclusivos para CNPJ -->
        <div v-if="tipoCliente === 'cnpj'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Razão Social <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.razao_social"
              type="text"
              placeholder="Razão Social da empresa"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome Fantasia
            </label>
            <input
              v-model="form.nome_fantasia"
              type="text"
              placeholder="Nome fantasia"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Código SINIR
            </label>
            <input
              v-model="form.codigo_sinir"
              type="text"
              placeholder="Código SINIR"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>
      </section>

      <!-- ── Seção: Dados Gerais ────────────────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Dados Gerais
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.razao_social"
              v-if="tipoCliente !== 'cnpj'"
              type="text"
              placeholder="Nome completo"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            <!-- Em modo CNPJ, o nome é a razão social (já preenchida acima) -->
            <input
              v-else
              :value="form.razao_social"
              type="text"
              disabled
              placeholder="Preenchido pela Razão Social"
              class="input opacity-60 cursor-not-allowed"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@exemplo.com"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome do Contato
            </label>
            <input
              v-model="form.contacts"
              type="text"
              placeholder="Nome da pessoa de contato"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Telefone
            </label>
            <input
              v-model="form.phone_number"
              type="tel"
              placeholder="00 00000-0000"
              maxlength="12"
              @input="mascaraTelefone"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

        </div>
      </section>

      <!-- ── Seção: Endereço ──────────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Endereço
        </h2>
        <div class="flex flex-col gap-4">

          <!-- Linha 1: CEP -->
          <div class="grid grid-cols-4 gap-4">
            <div class="flex flex-col gap-1.5 col-span-1">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">CEP</label>
              <div class="relative">
                <input
                  v-model="endereco.cep"
                  type="text"
                  placeholder="00000-000"
                  maxlength="9"
                  @blur="onCepBlur"
                  @input="formatarCep"
                  class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition pr-9"
                  :class="{
                    'border-red-400 focus:ring-red-400/40': cepError,
                    'border-green-400 focus:ring-green-400/40': cepSuccess
                  }"
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 v-if="loadingCep" class="w-4 h-4 text-slate-400 animate-spin" />
                  <CheckCircle2 v-else-if="cepSuccess" class="w-4 h-4 text-green-500" />
                  <XCircle v-else-if="cepError" class="w-4 h-4 text-red-400" />
                </div>
              </div>
              <p v-if="cepError" class="text-xs text-red-500">{{ cepError }}</p>
            </div>
          </div>

          <!-- Linha 2: Rua + Número -->
          <div class="grid grid-cols-4 gap-4">
            <div class="flex flex-col gap-1.5 col-span-3">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Rua / Logradouro</label>
              <input
                v-model="endereco.rua"
                type="text"
                placeholder="Nome da rua, avenida, etc."
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
            <div class="flex flex-col gap-1.5 col-span-1">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Número</label>
              <input
                v-model="endereco.numero"
                type="text"
                placeholder="Nº"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
          </div>

          <!-- Linha 3: Bairro + Complemento -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Bairro</label>
              <input
                v-model="endereco.bairro"
                type="text"
                placeholder="Bairro"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Complemento</label>
              <input
                v-model="endereco.complemento"
                type="text"
                placeholder="Apto, sala, bloco..."
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
          </div>

          <!-- Linha 4: Cidade + UF -->
          <div class="grid grid-cols-4 gap-4">
            <div class="flex flex-col gap-1.5 col-span-3">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Cidade</label>
              <input
                v-model="endereco.cidade"
                type="text"
                placeholder="Cidade"
                class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
            <div class="flex flex-col gap-1.5 col-span-1">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">UF</label>
              <div class="relative">
                <select
                  v-model="endereco.uf"
                  class="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                >
                  <option value="">UF</option>
                  <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
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
          {{ salvando ? 'Salvando...' : 'Salvar Cliente' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeft, ChevronDown, Loader2, CheckCircle2, XCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Cliente } from '~/types/cliente'
import type { Endereco } from '~/types/endereco'

const props = defineProps<{
  isNovo: boolean             // true → modo criação | false → modo edição
  cliente?: Cliente | null    // dados do cliente (quando isNovo = false)
  enderecoInicial?: Endereco | null  // endereço já buscado (quando isNovo = false)
  enderecoIdInicial?: string | null  // id do endereço (para UPDATE)
}>()
const emit = defineEmits<{ voltar: [] }>()

const modoEdicao = computed(() => !props.isNovo)

const { createCliente, updateCliente } = useClientes()
const { createEndereco, updateEndereco } = useEnderecos()
const supabase = useSupabaseClient()

const salvando = ref(false)

// ─── CEP ────────────────────────────────────────────────────────────────────
const { buscarCep, loading: loadingCep } = useCep()
const cepError = ref<string | null>(null)
const cepSuccess = ref(false)

function formatarCep() {
  // Aplica máscara 00000-000 em tempo real
  let v = endereco.value.cep.replace(/\D/g, '').slice(0, 8)
  if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5)
  endereco.value.cep = v
  // Limpa status ao digitar
  cepError.value = null
  cepSuccess.value = false
}

async function onCepBlur() {
  const digits = endereco.value.cep.replace(/\D/g, '')
  if (digits.length !== 8) return

  const result = await buscarCep(digits)

  if (!result.success || !result.data) {
    cepError.value = result.error ?? 'CEP não encontrado.'
    cepSuccess.value = false
    return
  }

  // Preenche os campos automaticamente
  endereco.value.rua = result.data.logradouro
  endereco.value.bairro = result.data.bairro
  endereco.value.cidade = result.data.localidade
  endereco.value.uf = result.data.uf
  // complemento do viacep (se houver)
  if (result.data.complemento) {
    endereco.value.complemento = result.data.complemento
  }

  cepError.value = null
  cepSuccess.value = true
}

// ─── Tipo selecionado ─────────────────────────────────────────────────────────────────
const tipoCliente = ref<'cpf' | 'cnpj' | ''>('')

// ─── Dados do formulário ──────────────────────────────────────────────────────
const form = ref({
  document: '',
  razao_social: '',
  nome_fantasia: '',
  codigo_sinir: '',
  email: '',
  contacts: '',
  phone_number: '',
})

const endereco = ref({
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
})

// ─── Lista de UFs ─────────────────────────────────────────────────────────────
const ufs = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

// ─── Pré-preenche o form em modo edição (dados já chegam prontos via props) ───
watch(() => props.cliente, (c) => {
  if (!c) return

  tipoCliente.value = c.nature === 'Jurídica' ? 'cnpj' : c.nature === 'Física' ? 'cpf' : ''
  form.value = {
    document:      c.document      ?? '',
    razao_social:  c.razao_social  ?? '',
    nome_fantasia: c.nome_fantasia ?? '',
    codigo_sinir:  c.codigo_sinir  ?? '',
    email:         c.email         ?? '',
    contacts:      c.contacts      ?? '',
    phone_number:  c.phone_number  ?? '',
  }
}, { immediate: true })

watch(() => props.enderecoInicial, (end) => {
  if (!end) return
  endereco.value = {
    cep:         end.address_zipcode      ?? '',
    rua:         end.address_street       ?? '',
    numero:      end.address_number       ?? '',
    complemento: end.address_complement   ?? '',
    bairro:      end.address_neighborhood ?? '',
    cidade:      end.address_city         ?? '',
    uf:          end.address_state        ?? '',
  }
}, { immediate: true })

// ID do endereço existente (para UPDATE) — recebido como prop
const enderecoId = computed(() => props.enderecoIdInicial ?? null)

// ─── Máscaras ───────────────────────────────────────────────────────────────────────

function mascaraCpf() {
  let v = form.value.document.replace(/\D/g, '').slice(0, 11)
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  form.value.document = v
}

function mascaraCnpj() {
  let v = form.value.document.replace(/\D/g, '').slice(0, 14)
  v = v.replace(/(\d{2})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d)/, '$1/$2')
  v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  form.value.document = v
}

function mascaraTelefone() {
  let v = form.value.phone_number.replace(/\D/g, '').slice(0, 11)
  if (v.length <= 10) {
    // Fixo: 00 0000-0000
    v = v.replace(/(\d{2})(\d)/, '$1 $2')
    v = v.replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  } else {
    // Móvel: 00 00000-0000
    v = v.replace(/(\d{2})(\d)/, '$1 $2')
    v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2')
  }
  form.value.phone_number = v
}

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function resetForm() {
  tipoCliente.value = ''
  form.value = { document: '', razao_social: '', nome_fantasia: '', codigo_sinir: '', email: '', contacts: '', phone_number: '' }
  endereco.value = { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }
  cepError.value = null
  cepSuccess.value = false
}

async function salvarCliente() {
  if (salvando.value) return
  salvando.value = true

  const { data: { user } } = await (supabase as any).auth.getUser()
  const userId = user?.id ?? null

  // ── Payload de dados do cliente (compartilhado entre create e update) ──────
  const clientePayload = {
    document:         form.value.document     || null,
    razao_social:     form.value.razao_social || null,
    nome_fantasia:    form.value.nome_fantasia || null,
    codigo_sinir:     form.value.codigo_sinir || null,
    email:            form.value.email        || null,
    contacts:         form.value.contacts     || null,
    phone_number:     form.value.phone_number || null,
    nature:           tipoCliente.value === 'cnpj' ? 'Jurídica' : tipoCliente.value === 'cpf' ? 'Física' : null,
  }

  // ── Payload do endereço ───────────────────────────────────────────────────
  const temEndereco = !!(endereco.value.rua || endereco.value.cidade || endereco.value.cep)

  const endPayload = {
    address_zipcode:      endereco.value.cep         || null,
    address_street:       endereco.value.rua         || null,
    address_number:       endereco.value.numero      || null,
    address_complement:   endereco.value.complemento || null,
    address_neighborhood: endereco.value.bairro      || null,
    address_city:         endereco.value.cidade      || null,
    address_state:        endereco.value.uf          || null,
    address_country:      'Brasil',
    user_id:              userId,
    creator:              null,
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODO EDIÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  if (modoEdicao.value && props.cliente) {
    const updResult = await updateCliente(props.cliente.id, clientePayload)

    if (!updResult.success) {
      salvando.value = false
      toast.error('Erro ao atualizar cliente', { description: updResult.error ?? 'Tente novamente.' })
      return
    }

    // Atualiza ou cria o endereço
    if (temEndereco) {
      if (enderecoId.value) {
        // Já existe → UPDATE
        await updateEndereco(enderecoId.value, endPayload)
      } else {
        // Não tinha endereço → CREATE vinculado ao cliente existente
        await createEndereco({
          ...endPayload,
          client:    props.cliente.unique_id ?? null,
          unique_id: `end_${Date.now()}`,
        })
      }
    }

    salvando.value = false
    toast.success('Cliente atualizado!', {
      description: `${form.value.razao_social || 'Cliente'} foi atualizado com sucesso.`,
    })
    resetForm()
    emit('voltar')
    return
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODO CRIAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  const uniqueId = `cli_${Date.now()}`

  const crResult = await createCliente({
    ...clientePayload,
    unique_id:        uniqueId,
    user_id:          userId,
    date_of_birth:    null,
    gender:           null,
    address:          null,
    client_list:      null,
    image:            null,
    mtrs:             null,
    user_responsible: null,
    creator:          null,
    company:          null,
  })

  if (!crResult.success) {
    salvando.value = false
    toast.error('Erro ao salvar cliente', { description: crResult.error ?? 'Tente novamente.' })
    return
  }

  if (temEndereco) {
    const endResult = await createEndereco({
      ...endPayload,
      client:    uniqueId,
      unique_id: `end_${Date.now()}`,
    })

    if (!endResult.success) {
      salvando.value = false
      toast.warning('Cliente salvo, mas houve um erro ao salvar o endereço.', {
        description: endResult.error ?? 'Verifique e tente adicionar o endereço depois.',
      })
      resetForm()
      emit('voltar')
      return
    }
  }

  salvando.value = false
  toast.success('Cliente cadastrado!', {
    description: `${form.value.razao_social || 'Cliente'} foi adicionado com sucesso.`,
  })
  resetForm()
  emit('voltar')
}
</script>


