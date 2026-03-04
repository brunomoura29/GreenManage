<template>
  <div class="min-h-full pb-24">

    <!-- Cabeçalho -->
    <div class="px-6 md:px-8 pt-8 pb-6 flex items-center gap-4">
      <button
        type="button"
        @click="$emit('voltar')"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {{ isNovo ? 'Nova Medição' : 'Editar Medição' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Preencha os dados abaixo para registrar a medição.
        </p>
      </div>
    </div>

    <form @submit.prevent="salvarMedicao" class="px-6 md:px-8 space-y-8">

      <!-- ── Dados Gerais ─────────────────────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Dados Gerais
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">

          <!-- Período da medição (date range) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CalendarDays class="w-4 h-4 text-primary-500" /> Período Início
            </label>
            <input
              v-model="form.periodoInicio"
              type="datetime-local"
              required
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CalendarDays class="w-4 h-4 text-primary-500" /> Período Fim
            </label>
            <input
              v-model="form.periodoFim"
              type="datetime-local"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
            />
          </div>

          <!-- Tipo de medição -->
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <BaseDropdown
              v-model="form.tipoMedicao"
              :options="MEASUREMENT_TYPES"
              label="Tipo de Medição"
              placeholder="Selecione o tipo de medição"
            />
          </div>

          <!-- Campo condicional: Dosagem de Cloro -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="form.tipoMedicao === 'Níveis das Valas de Infiltração'" class="sm:col-span-2">
              <div class="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                    <Droplets class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-white">Dosagem de Cloro</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      {{ form.dosagem_de_cloro ? 'Realizada' : 'Não realizada' }}
                    </p>
                  </div>
                </div>
                <!-- Toggle -->
                <button
                  type="button"
                  @click="form.dosagem_de_cloro = !form.dosagem_de_cloro"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  :class="form.dosagem_de_cloro ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'"
                  role="switch"
                  :aria-checked="form.dosagem_de_cloro"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.dosagem_de_cloro ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </Transition>

          <!-- Campos condicionais: Qualidade do Efluente Final Descartado -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="normalize(form.tipoMedicao) === normalize('Qualidade do Efluente Final Descartado')" class="sm:col-span-2 flex items-end gap-3">

              <!-- Toggle: Lagoa de tratamento encheu -->
              <div class="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                    <Waves class="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-white">Lagoa de Tratamento Encheu</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      {{ form.lagoa_tratamento_encheu ? 'Sim' : 'Não' }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="form.lagoa_tratamento_encheu = !form.lagoa_tratamento_encheu"
                  class="ml-4 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  :class="form.lagoa_tratamento_encheu ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'"
                  role="switch"
                  :aria-checked="form.lagoa_tratamento_encheu"
                >
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.lagoa_tratamento_encheu ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Input: Sólidos Sedimentáveis -->
              <div class="flex-1 flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FlaskConical class="w-4 h-4 text-primary-500" /> Sólidos Sedimentáveis
                </label>
                <input
                  v-model="form.solidos_sedimentaveis"
                  type="number"
                  step="any"
                  placeholder="Informe o valor"
                  class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
                />
              </div>

            </div>
          </Transition>

          <!-- Campos condicionais: Tratamento do SKID -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="normalize(form.tipoMedicao) === normalize('Tratamento do SKID')" class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">

              <!-- Lagoas baixadas: col-span-2 -->
              <div class="col-span-1 sm:col-span-2 flex flex-col gap-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Waves class="w-4 h-4 text-teal-500" /> Lagoas baixadas
                </label>
                <div class="flex gap-2">
                  <div class="flex-1">
                    <BaseDropdown
                      v-model="lagoadParaAdicionar"
                      :options="opcoesLagoasBaixadas"
                      placeholder="Selecione uma lagoa"
                      :searchable="true"
                    />
                  </div>
                  <button
                    type="button"
                    @click="adicionarLagoa"
                    :disabled="!lagoadParaAdicionar"
                    class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    <Plus class="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
                <!-- chips das lagoas selecionadas -->
                <div v-if="lagoasSelecionadas.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="lagoa in lagoasSelecionadas"
                    :key="lagoa.uniqueId"
                    class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700"
                  >
                    {{ lagoa.nome }}
                    <button type="button" @click="removerLagoa(lagoa.uniqueId)" class="hover:text-teal-900 dark:hover:text-teal-100 transition-colors">
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>
              </div>

              <!-- Toggle: Retrolavagem dos filtros -->
              <div class="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Filter class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-white">Retrolavagem dos Filtros</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ form.retrolavagem_filtros ? 'Realizado' : 'Não realizado' }}</p>
                  </div>
                </div>
                <button type="button" @click="form.retrolavagem_filtros = !form.retrolavagem_filtros"
                  class="ml-4 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  :class="form.retrolavagem_filtros ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'"
                  role="switch" :aria-checked="form.retrolavagem_filtros">
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.retrolavagem_filtros ? 'translate-x-5' : 'translate-x-0'" />
                </button>
              </div>

              <!-- Toggle: Equipamentos funcionando -->
              <div class="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <Settings class="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-white">Equipamentos Funcionando</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ form.equipamentos_funcionando ? 'Sim, todos' : 'Não' }}</p>
                  </div>
                </div>
                <button type="button" @click="form.equipamentos_funcionando = !form.equipamentos_funcionando"
                  class="ml-4 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  :class="form.equipamentos_funcionando ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'"
                  role="switch" :aria-checked="form.equipamentos_funcionando">
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.equipamentos_funcionando ? 'translate-x-5' : 'translate-x-0'" />
                </button>
              </div>

              <!-- Toggle: Limpeza do flotador -->
              <div class="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                    <Droplets class="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-white">Limpeza do Flotador</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ form.limpeza_flotador ? 'Realizada' : 'Não realizada' }}</p>
                  </div>
                </div>
                <button type="button" @click="form.limpeza_flotador = !form.limpeza_flotador"
                  class="ml-4 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  :class="form.limpeza_flotador ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'"
                  role="switch" :aria-checked="form.limpeza_flotador">
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.limpeza_flotador ? 'translate-x-5' : 'translate-x-0'" />
                </button>
              </div>

              <!-- Toggle: Preparado Polímero -->
              <div class="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <FlaskConical class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-800 dark:text-white">Preparado Polímero</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ form.preparado_polimero ? 'Sim' : 'Não' }}</p>
                  </div>
                </div>
                <button type="button" @click="form.preparado_polimero = !form.preparado_polimero"
                  class="ml-4 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  :class="form.preparado_polimero ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'"
                  role="switch" :aria-checked="form.preparado_polimero">
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="form.preparado_polimero ? 'translate-x-5' : 'translate-x-0'" />
                </button>
              </div>

            </div>
          </Transition>

          <!-- Observações -->
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
            <textarea
              v-model="form.observacao"
              rows="3"
              placeholder="Adicione observações relevantes..."
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition resize-none"
            />
          </div>

        </div>
      </section>

      <!-- ── Indicadores ───────────────────────────────────────────────── -->
      <section>
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Indicadores
            <span
              v-if="indicadoresSelecionados.length > 0"
              class="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
            >
              {{ indicadoresSelecionados.length }}
            </span>
          </h2>
        </div>

        <!-- Aviso quando nenhum tipo selecionado -->
        <div
          v-if="!form.tipoMedicao"
          class="max-w-xl flex items-center gap-2 px-4 py-3 mb-6 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm"
        >
          <Activity class="w-4 h-4 shrink-0" />
          Selecione um <strong class="mx-1">Tipo de Medição</strong> acima para ver os indicadores disponíveis.
        </div>

        <!-- Dropdown para adicionar indicador -->
        <div v-else class="flex gap-3 max-w-xl mb-6">
          <div class="flex-1">
            <BaseDropdown
              v-model="indicadorParaAdicionar"
              :options="opcoesIndicadores"
              placeholder="Selecione um indicador para adicionar"
              :searchable="true"
            />
          </div>
          <button
            type="button"
            @click="adicionarIndicador"
            :disabled="!indicadorParaAdicionar"
            class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus class="w-4 h-4" />
            Adicionar
          </button>
        </div>

        <!-- Lista de indicadores adicionados -->
        <div v-if="indicadoresSelecionados.length > 0" class="space-y-4 max-w-3xl">
          <CadastroListaIndicadores
            v-for="ind in indicadoresSelecionados"
            :key="ind.uniqueId"
            :ref="el => setRef(el, ind.uniqueId)"
            :nome-indicador="ind.nome"
            :indicador-unique-id="ind.uniqueId"
            :operadores="operadores"
            :medicao-id="!isNovo ? (medicao?.medicao_unique_id ?? null) : null"
            @remover="removerIndicador(ind.uniqueId)"
          />
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="max-w-3xl flex flex-col items-center gap-2 py-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
        >
          <Activity class="w-8 h-8" />
          <p class="text-sm">Nenhum indicador adicionado ainda.</p>
          <p class="text-xs">Use o dropdown acima para adicionar indicadores.</p>
        </div>
      </section>

      <!-- ── Rodapé fixo ─────────────────────────────────────────────────── -->
      <BaseFooterActions
        :salvando="salvando"
        :label-salvar="isNovo ? 'Salvar Medição' : 'Atualizar Medição'"
        @cancelar="$emit('voltar')"
      />

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ArrowLeft, CalendarDays, Plus, Activity, Droplets, Waves, FlaskConical, Filter, Settings, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useIndicadores, MEASUREMENT_TYPES } from '~/composables/useIndicadores'
import { useOperadores } from '~/composables/useOperadores'
import { useMedicoes } from '~/composables/useMedicoes'
import { useRegistroIndicadores } from '~/composables/useRegistroIndicadores'
import { useRegistroValorMedicao } from '~/composables/useRegistroValorMedicao'
import { useLagoasBaixadas } from '~/composables/useLagoasBaixadas'
import type { ViewMedicoesCompleta } from '~/types/viewMedicoesCompleta'

const props = defineProps<{
  isNovo: boolean
  medicao?: ViewMedicoesCompleta | null
}>()

const emit = defineEmits<{ salvo: []; voltar: [] }>()

// ── Composables ────────────────────────────────────────────────────────────
const { indicadores, fetchIndicadores } = useIndicadores()
const { operadores, fetchOperadores } = useOperadores()
const { createMedicao, updateMedicao } = useMedicoes()
const { createRegistroIndicador, deleteRegistrosByMedicao: deleteIndicsByMedicao } = useRegistroIndicadores()
const { createRegistroValor, deleteRegistrosByMedicao: deleteValoresByMedicao } = useRegistroValorMedicao()
const { createLagoaBaixada, deleteLagoasByMedicao } = useLagoasBaixadas()
const supabase = useSupabaseClient()
const salvando = ref(false)

// helper: YYYY-MM-DDTHH:MM para datetime-local
function dataHoje(hora: string) {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}T${hora}`
}

// ── Formulário ─────────────────────────────────────────────────────────────
const form = ref({
  periodoInicio: dataHoje('06:00'),
  periodoFim: dataHoje('18:00'),
  tipoMedicao: '',
  observacao: '',
  dosagem_de_cloro: false,
  lagoa_tratamento_encheu: false,
  solidos_sedimentaveis: '' as string | number,
  retrolavagem_filtros: false,
  equipamentos_funcionando: false,
  limpeza_flotador: false,
  preparado_polimero: false
})

// ── Indicadores ────────────────────────────────────────────────────────────
interface IndicadorSelecionado {
  uniqueId: string
  nome: string
}

const indicadoresSelecionados = ref<IndicadorSelecionado[]>([])
const indicadorParaAdicionar = ref('')
const refsIndicadores = new Map<string, any>()

// Normaliza string: remove acentos e converte para minúsculas
function normalize(str?: string | null) {
  return (str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const opcoesIndicadores = computed(() => {
  if (!form.value.tipoMedicao) return []
  const tipoNorm = normalize(form.value.tipoMedicao)
  return indicadores.value
    .filter(i => normalize(i.measurement_type) === tipoNorm)
    .filter(i => !indicadoresSelecionados.value.some(s => s.uniqueId === (i.unique_id || i.id)))
    .map(i => ({ label: i.name || '', value: i.unique_id || i.id }))
})

// Flag que impede o watch de limpar os indicadores durante o preenchimento da edição
const isPopulating = ref(false)

// Limpa indicadores ao trocar o tipo de medição
watch(() => form.value.tipoMedicao, () => {
  if (isPopulating.value) return
  indicadoresSelecionados.value = []
  indicadorParaAdicionar.value = ''
  refsIndicadores.clear()
  lagoasSelecionadas.value = []
  lagoadParaAdicionar.value = ''
})

// ── Lagoas baixadas (SKID) ──────────────────────────────────────────────────
const lagoasSelecionadas = ref<IndicadorSelecionado[]>([])
const lagoadParaAdicionar = ref('')

const opcoesLagoasBaixadas = computed(() => {
  const tipoNorm = normalize('Níveis das Lagoas')
  return indicadores.value
    .filter(i => normalize(i.measurement_type) === tipoNorm)
    .filter(i => !lagoasSelecionadas.value.some(s => s.uniqueId === (i.unique_id || i.id)))
    .map(i => ({ label: i.name || '', value: i.unique_id || i.id }))
})

function adicionarLagoa() {
  if (!lagoadParaAdicionar.value) return
  const ind = indicadores.value.find(i => (i.unique_id || i.id) === lagoadParaAdicionar.value)
  if (!ind) return
  lagoasSelecionadas.value.push({ uniqueId: ind.unique_id || ind.id, nome: ind.name || '' })
  lagoadParaAdicionar.value = ''
}

function removerLagoa(uniqueId: string) {
  lagoasSelecionadas.value = lagoasSelecionadas.value.filter(l => l.uniqueId !== uniqueId)
}

function setRef(el: any, id: string) {
  if (el) refsIndicadores.set(id, el)
  else refsIndicadores.delete(id)
}

function adicionarIndicador() {
  if (!indicadorParaAdicionar.value) return
  const ind = indicadores.value.find(i => (i.unique_id || i.id) === indicadorParaAdicionar.value)
  if (!ind) return
  indicadoresSelecionados.value.push({
    uniqueId: ind.unique_id || ind.id,
    nome: ind.name || ''
  })
  indicadorParaAdicionar.value = ''
}

function removerIndicador(uniqueId: string) {
  indicadoresSelecionados.value = indicadoresSelecionados.value.filter(i => i.uniqueId !== uniqueId)
  refsIndicadores.delete(uniqueId)
}

// ── Carregar dados ──────────────────────────────────────────────────────────
async function populateForm() {
  const m = props.medicao
  if (!m) return

  isPopulating.value = true

  // Período
  const inicio = m.periodo_medicao?.[0] ?? m.data ?? ''
  const fim    = m.periodo_medicao?.[1] ?? ''
  form.value.periodoInicio = inicio ? inicio.slice(0, 16) : dataHoje('06:00')
  form.value.periodoFim    = fim    ? fim.slice(0, 16)    : ''

  // Tipo e campos gerais — encontra o valor exato de MEASUREMENT_TYPES para o dropdown exibir corretamente
  const tipoNorm = normalize(m.nome_tipo_medicao)
  form.value.tipoMedicao = MEASUREMENT_TYPES.find(t => normalize(t) === tipoNorm) ?? m.nome_tipo_medicao ?? ''
  form.value.observacao  = m.observation ?? ''

  // Campos booleanos
  form.value.dosagem_de_cloro         = m.dosagem_de_cloro            ?? false
  form.value.lagoa_tratamento_encheu  = m.lagoa_tratamento_encheu     ?? false
  form.value.solidos_sedimentaveis    = m.solidos_sedimentaveis       ?? ''
  form.value.retrolavagem_filtros     = m.retrolavagem_dos_filtros    ?? false
  form.value.equipamentos_funcionando = m.equipamentos_funcionando    ?? false
  form.value.limpeza_flotador         = m.limpeza_flotador            ?? false
  form.value.preparado_polimero       = m.preparado_polimero          ?? false

  // Aguarda o watch disparar (e ser ignorado pela flag) antes de popular as listas
  await nextTick()

  // Reconstruir indicadores selecionados a partir dos nomes salvos
  if (m.nomes_indicadores?.length) {
    const tipoNorm = normalize(m.nome_tipo_medicao)
    indicadoresSelecionados.value = indicadores.value
      .filter(i => normalize(i.measurement_type) === tipoNorm)
      .filter(i => m.nomes_indicadores!.includes(i.name ?? ''))
      .map(i => ({ uniqueId: i.unique_id || i.id, nome: i.name || '' }))
  }

  // Reconstruir lagoas baixadas (apenas para SKID)
  if (m.lista_lagoas_baixadas?.length) {
    const lagoaNorm = normalize('Níveis das Lagoas')
    lagoasSelecionadas.value = indicadores.value
      .filter(i => normalize(i.measurement_type) === lagoaNorm)
      .filter(i => m.lista_lagoas_baixadas!.includes(i.name ?? ''))
      .map(i => ({ uniqueId: i.unique_id || i.id, nome: i.name || '' }))
  }

  // Libera o watch novamente
  await nextTick()
  isPopulating.value = false
}

onMounted(async () => {
  await Promise.all([fetchIndicadores(), fetchOperadores()])
  if (!props.isNovo) {
    populateForm()
  }
})

// ── Salvar ───────────────────────────────────────────────────────────
const isTratamentoSKID = () =>
  normalize(form.value.tipoMedicao) === normalize('Tratamento do SKID')

async function salvarMedicao() {
  if (salvando.value) return
  salvando.value = true

  try {
    // ─────────────────────────────────────────────────────
    // 1. Prep payload da medição
    // ─────────────────────────────────────────────────────
    const periodoRange = form.value.periodoInicio
      ? [form.value.periodoInicio, form.value.periodoFim || form.value.periodoInicio]
      : null

    const tipoNorm = normalize(form.value.tipoMedicao)

    // Busca o uid do usuário logado para satisfazer a política RLS
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const payload = {
      date:             form.value.periodoInicio || null,
      date_range:       periodoRange,
      measurement_type: form.value.tipoMedicao  || null,
      observation:      form.value.observacao   || null,
      // Booleanos condicionais por tipo
      dosagem_de_cloro:          tipoNorm === normalize('Níveis das Valas de Infiltração')
                                   ? form.value.dosagem_de_cloro : null,
      lagoa_tratamento_encheu:   tipoNorm === normalize('Qualidade do Efluente Final Descartado')
                                   ? form.value.lagoa_tratamento_encheu : null,
      solidos_sedimentaveis:     tipoNorm === normalize('Qualidade do Efluente Final Descartado')
                                   ? (form.value.solidos_sedimentaveis != null && form.value.solidos_sedimentaveis !== ''
                                       ? String(form.value.solidos_sedimentaveis) : null) : null,
      retrolavagem_dos_filtros:  isTratamentoSKID() ? form.value.retrolavagem_filtros     : null,
      equipamentos_funcionando:  isTratamentoSKID() ? form.value.equipamentos_funcionando  : null,
      limpeza_flotador:          isTratamentoSKID() ? form.value.limpeza_flotador          : null,
      preparado_polimero:        isTratamentoSKID() ? form.value.preparado_polimero        : null,
    }

    // ─────────────────────────────────────────────────────
    // 2. Criar ou atualizar a medição
    // ─────────────────────────────────────────────────────
    let medicaoUniqueId: string | null = null

    if (props.isNovo) {
      const uniqueId = `med_${Date.now()}`
      const result = await createMedicao({ ...payload, unique_id: uniqueId, user_id: userId })
      if (!result.success) {
        toast.error('Erro ao criar medição', { description: (result as any).error })
        return
      }
      medicaoUniqueId = (result as any)?.data?.unique_id ?? uniqueId
    } else if (props.medicao) {
      const result = await updateMedicao(props.medicao.medicao_id, payload)
      if (!result.success) {
        toast.error('Erro ao atualizar medição', { description: (result as any).error })
        return
      }
      medicaoUniqueId = props.medicao.medicao_unique_id ?? null
    }

    if (!medicaoUniqueId) {
      toast.error('Erro interno', { description: 'Não foi possível obter o ID da medição.' })
      return
    }

    // ─────────────────────────────────────────────────────
    // 3. Se edição: apaga registros antigos
    // ─────────────────────────────────────────────────────
    if (!props.isNovo) {
      await Promise.all([
        deleteIndicsByMedicao(medicaoUniqueId),
        deleteValoresByMedicao(medicaoUniqueId),
        deleteLagoasByMedicao(medicaoUniqueId),
      ])
    }

    // ─────────────────────────────────────────────────────
    // 4. Salvar indicadores + turnos
    // ─────────────────────────────────────────────────────
    for (const ind of indicadoresSelecionados.value) {
      // 4a. Cria registro_indicadores
      await createRegistroIndicador({
        unique_id:        `ri_${Date.now()}_${ind.uniqueId}`,
        measurement:      medicaoUniqueId,
        indicator:        ind.uniqueId,
        measurement_type: form.value.tipoMedicao || null,
        user_id:          userId,
      })

      // 4b. Coleta os turnos do componente filho
      const ref = refsIndicadores.get(ind.uniqueId)
      const turnos: any[] = ref?.turnos ?? []

      for (const turno of turnos) {
        let photoUrl: string | null = null

        // Upload da foto se houver arquivo novo
        if (turno.fotoFile) {
          const ext = turno.fotoNome.split('.').pop()
          const path = `medicoes/${medicaoUniqueId}/${ind.uniqueId}_${Date.now()}.${ext}`
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('medicoes')
            .upload(path, turno.fotoFile, { upsert: true })
          if (!uploadErr && uploadData) {
            const { data: urlData } = supabase.storage.from('medicoes').getPublicUrl(uploadData.path)
            photoUrl = urlData.publicUrl ?? null
          }
        } else if (turno.preview && !turno.fotoFile) {
          // Foto já existia (URL mantida)
          photoUrl = turno.preview || null
        }

        const turnoRange = turno.periodoInicio
          ? [turno.periodoInicio, turno.periodoFim || turno.periodoInicio]
          : null

        await createRegistroValor({
          unique_id:   `rv_${Date.now()}_${ind.uniqueId}`,
          measurement: medicaoUniqueId,
          indicator:   ind.uniqueId,
          value:       turno.valor ?? null,
          operator:    turno.operador   || null,
          date_range:  turnoRange,
          photos:      photoUrl,
          user_id:     userId,
        })
      }
    }

    // ─────────────────────────────────────────────────────
    // 5. Salvar Lagoas Baixadas (somente Tratamento do SKID)
    // ─────────────────────────────────────────────────────
    if (isTratamentoSKID() && lagoasSelecionadas.value.length > 0) {
      for (const lagoa of lagoasSelecionadas.value) {
        await createLagoaBaixada({
          unique_id:   `lb_${Date.now()}_${lagoa.uniqueId}`,
          measurement: medicaoUniqueId,
          name:        lagoa.nome,
          user_id:     userId,
        })
      }
    }

    toast.success(props.isNovo ? 'Medição criada!' : 'Medição atualizada!', {
      description: 'Todos os dados foram salvos com sucesso.'
    })
    emit('salvo')
    emit('voltar')

  } catch (error: any) {
    toast.error('Erro inesperado', { description: error.message })
  } finally {
    salvando.value = false
  }
}
</script>
