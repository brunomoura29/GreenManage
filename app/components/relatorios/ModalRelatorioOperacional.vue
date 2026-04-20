<template>
  <BaseModal :show="show && fase === 'form'" title="Relatório Operacional" max-width="xl" @close="$emit('fechar')">

    <!-- Área scrollável -->
    <div class="max-h-[62vh] overflow-y-auto -mx-6 px-6 space-y-4 pb-2">

      <!-- ── Contatos ───────────────────────────────────────────────────── -->
      <section class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <Users class="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Contatos que receberão</span>
        </div>
        <div class="p-4">
          <div v-if="loadingDados" class="text-sm text-slate-400">Carregando...</div>
          <div v-else-if="contatos.length === 0" class="text-sm text-slate-400 italic">Nenhum contato cadastrado.</div>
          <div v-else class="flex flex-col gap-2">
            <label v-for="c in contatos" :key="c.unique_id" class="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                :value="c.unique_id"
                v-model="contatosSelecionados"
                class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/40"
              />
              <span class="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {{ c.nome }}
                <span class="text-xs text-slate-400 ml-1">{{ c.telefone }}</span>
              </span>
            </label>
          </div>
        </div>
      </section>

      <!-- ── Medições ───────────────────────────────────────────────────── -->
      <section class="rounded-xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800">
          <Activity class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Medições</span>
          <span class="ml-auto text-xs text-emerald-600 dark:text-emerald-500">Data específica</span>
        </div>
        <div class="p-4 grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Data</label>
            <input v-model="filtros.medicoes.data" type="date" class="input-date" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Tipo de indicador</label>
            <select v-model="filtros.medicoes.tipoIndicador" class="input-select">
              <option value="">Todos</option>
              <option v-for="t in tiposIndicador" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- ── Entrada de Resíduos ────────────────────────────────────────── -->
      <section class="rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800">
          <Truck class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span class="text-sm font-semibold text-blue-700 dark:text-blue-400">Entrada de Resíduos</span>
          <span class="ml-auto text-xs text-blue-600 dark:text-blue-500">Intervalo de datas</span>
        </div>
        <div class="p-4 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-400">De</label>
              <input v-model="filtros.residuos.dataInicio" type="date" class="input-date" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Até</label>
              <input v-model="filtros.residuos.dataFim" type="date" class="input-date" />
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Transportador</label>
              <select v-model="filtros.residuos.transportadoraId" class="input-select">
                <option value="">Todos</option>
                <option v-for="t in transportadoras" :key="t.unique_id!" :value="t.unique_id">
                  {{ t.nome_fantasia || t.razao_social }}
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Cliente (Gerador)</label>
              <select v-model="filtros.residuos.clienteId" class="input-select">
                <option value="">Todos</option>
                <option v-for="c in clientes" :key="c.unique_id" :value="c.unique_id">
                  {{ c.nome_fantasia || c.razao_social }}
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Tipo de Resíduo</label>
              <select v-model="filtros.residuos.tipoResiduoId" class="input-select">
                <option value="">Todos</option>
                <option v-for="t in tiposResiduos" :key="t.unique_id!" :value="t.unique_id">
                  {{ t.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Movimentação de Estoque ─────────────────────────────────────── -->
      <section class="rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800">
          <Package class="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span class="text-sm font-semibold text-amber-700 dark:text-amber-400">Movimentação de Estoque</span>
          <span class="ml-auto text-xs text-amber-600 dark:text-amber-500">Intervalo de datas</span>
        </div>
        <div class="p-4 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-400">De</label>
              <input v-model="filtros.estoque.dataInicio" type="date" class="input-date" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Até</label>
              <input v-model="filtros.estoque.dataFim" type="date" class="input-date" />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Insumo</label>
            <select v-model="filtros.estoque.insumoId" class="input-select">
              <option value="">Todos</option>
              <option v-for="i in insumos" :key="i.unique_id!" :value="i.unique_id">
                {{ i.name }}
              </option>
            </select>
          </div>
        </div>
      </section>

    </div>

    <!-- Footer -->
    <div class="flex items-center justify-end gap-3 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
      <button
        type="button"
        @click="$emit('fechar')"
        class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        @click="gerar"
        :disabled="gerando"
        class="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Loader2 v-if="gerando" class="w-4 h-4 animate-spin" />
        <Send v-else class="w-4 h-4" />
        Enviar relatório
      </button>
    </div>

  </BaseModal>

  <!-- ── Overlay de envio ──────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="fase === 'enviando' || fase === 'sucesso'" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center gap-6">

            <!-- Ícone animado -->
            <div class="relative flex items-center justify-center">
              <div v-if="fase === 'enviando'" class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <div class="absolute w-20 h-20 rounded-full border-2 border-primary/30 animate-ping" />
                <div class="absolute w-20 h-20 rounded-full border-2 border-primary/20 animate-ping" style="animation-delay: 0.3s" />
                <Send class="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <CheckCircle2 class="w-10 h-10 text-emerald-500" />
              </div>
            </div>

            <!-- Título -->
            <div class="text-center space-y-1">
              <p class="text-base font-bold text-slate-900 dark:text-white">
                {{ fase === 'enviando' ? 'Enviando relatório...' : 'Relatório enviado!' }}
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ fase === 'enviando' ? 'Transmitindo informações para os contatos' : 'Os contatos foram notificados com sucesso' }}
              </p>
            </div>

            <!-- Passos -->
            <div class="w-full space-y-2.5">
              <div
                v-for="(passo, i) in passos"
                :key="i"
                class="flex items-center gap-3 transition-all duration-500"
                :class="passo.visivel ? 'opacity-100' : 'opacity-0'"
              >
                <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 v-if="passo.concluido" class="w-5 h-5 text-emerald-500" />
                  <Loader2 v-else class="w-5 h-5 text-primary animate-spin" />
                </div>
                <span class="text-sm" :class="passo.concluido ? 'text-slate-700 dark:text-slate-300' : 'text-primary font-medium'">
                  {{ passo.label }}
                </span>
              </div>
            </div>

            <!-- Botão fechar (só no sucesso) -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
            >
              <button
                v-if="fase === 'sucesso'"
                @click="fecharTudo"
                class="w-full px-5 py-2.5 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft"
              >
                Fechar
              </button>
            </Transition>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Users, Activity, Truck, Package, Loader2, Send, CheckCircle2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useRelatorioOperacional } from '~/composables/useRelatorioOperacional'
import { useContatos } from '~/composables/useContatos'
import { useTransportadoras } from '~/composables/useTransportadoras'
import { useClientes } from '~/composables/useClientes'
import { useTiposResiduos } from '~/composables/useTiposResiduos'
import { useInsumos } from '~/composables/useInsumos'

const WEBHOOK_URL = 'https://n8n-n8n-start.gab7lw.easypanel.host/webhook/bb8010de-45f0-483d-8435-10d1720ab226'

const PASSOS_CONFIG = [
  { label: 'Relatório montado',           delay: 0 },
  { label: 'Conectando ao servidor...',   delay: 2000 },
  { label: 'Processando informações...',  delay: 5000 },
  { label: 'Notificando os contatos...',  delay: 8000 },
]

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  fechar: []
  gerado: [payload: object]
}>()

const { montarRelatorio, fetchTiposIndicador } = useRelatorioOperacional()
const { contatos, fetchContatos } = useContatos()
const { transportadoras, fetchTransportadoras } = useTransportadoras()
const { clientes, fetchClientes } = useClientes()
const { tiposResiduos, fetchTiposResiduos } = useTiposResiduos()
const { insumos, fetchInsumos } = useInsumos()

type Fase = 'form' | 'enviando' | 'sucesso'
const fase = ref<Fase>('form')
const gerando = ref(false)
const loadingDados = ref(false)
const tiposIndicador = ref<string[]>([])
const contatosSelecionados = ref<string[]>([])

const passos = ref(PASSOS_CONFIG.map(p => ({ ...p, visivel: false, concluido: false })))

function hoje(): string {
  return new Date().toISOString().split('T')[0]!
}

const filtros = reactive({
  medicoes:  { data: hoje(), tipoIndicador: '' },
  residuos:  { dataInicio: hoje(), dataFim: hoje(), transportadoraId: '', clienteId: '', tipoResiduoId: '' },
  estoque:   { dataInicio: hoje(), dataFim: hoje(), insumoId: '' },
})

watch(() => props.show, async (val) => {
  if (!val) return
  resetar()
  loadingDados.value = true
  await Promise.all([
    fetchContatos(),
    fetchTransportadoras(),
    fetchClientes(),
    fetchTiposResiduos(),
    fetchInsumos(),
    fetchTiposIndicador().then(tipos => { tiposIndicador.value = tipos }),
  ])
  loadingDados.value = false
})

function resetar() {
  const d = hoje()
  fase.value = 'form'
  filtros.medicoes.data = d
  filtros.medicoes.tipoIndicador = ''
  filtros.residuos.dataInicio = d
  filtros.residuos.dataFim = d
  filtros.residuos.transportadoraId = ''
  filtros.residuos.clienteId = ''
  filtros.residuos.tipoResiduoId = ''
  filtros.estoque.dataInicio = d
  filtros.estoque.dataFim = d
  filtros.estoque.insumoId = ''
  contatosSelecionados.value = []
  passos.value = PASSOS_CONFIG.map(p => ({ ...p, visivel: false, concluido: false }))
}

function fecharTudo() {
  resetar()
  emit('fechar')
}

function iniciarPassos() {
  // Mostra e conclui cada passo progressivamente
  PASSOS_CONFIG.forEach((p, i) => {
    setTimeout(() => {
      passos.value[i]!.visivel = true
    }, p.delay)

    const proximoDelay = PASSOS_CONFIG[i + 1]?.delay ?? 10000
    setTimeout(() => {
      passos.value[i]!.concluido = true
    }, proximoDelay - 200)
  })
}

async function gerar() {
  if (gerando.value) return
  gerando.value = true

  try {
    const payload = await montarRelatorio({
      medicoes: {
        data: filtros.medicoes.data,
        tipoIndicador: filtros.medicoes.tipoIndicador || null,
      },
      residuos: {
        dataInicio: filtros.residuos.dataInicio,
        dataFim: filtros.residuos.dataFim,
        transportadoraId: filtros.residuos.transportadoraId || null,
        clienteId: filtros.residuos.clienteId || null,
        tipoResiduoId: filtros.residuos.tipoResiduoId || null,
      },
      estoque: {
        dataInicio: filtros.estoque.dataInicio,
        dataFim: filtros.estoque.dataFim,
        insumoId: filtros.estoque.insumoId || null,
      },
      contatosIds: contatosSelecionados.value,
    })

    // Inicia overlay de envio
    fase.value = 'enviando'
    iniciarPassos()

    // POST para o webhook + aguarda mínimo de 10s
    const [res] = await Promise.allSettled([
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      new Promise(resolve => setTimeout(resolve, 10000)),
    ])

    if (res.status === 'rejected') throw new Error('Falha ao enviar para o webhook')

    fase.value = 'sucesso'
    emit('gerado', payload)

  } catch (err: any) {
    fase.value = 'form'
    toast.error('Erro ao enviar relatório', { description: err?.message ?? 'Tente novamente.' })
  } finally {
    gerando.value = false
  }
}
</script>

<style scoped>
.input-date,
.input-select {
  @apply w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition;
}
</style>
