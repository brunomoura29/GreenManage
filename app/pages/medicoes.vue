<template>
  <div class="min-h-full">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-4 opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-4 opacity-0"
      mode="out-in"
    >
      <!-- ── Lista ──────────────────────── -->
      <div v-if="view === 'lista'" key="lista">

        <!-- Header -->
        <div class="px-6 md:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Medições / Medições
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie as medições e seus registros aqui.
            </p>
          </div>

          <!-- Botão nova medição -->
          <button
            @click="view = 'cadastrar'"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Nova Medição
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar medição..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Filtros avançados -->
        <FiltrosMedicoes @update:filtros="filtros = $event" />

        <!-- Tabela -->
        <div class="px-6 md:px-8 pb-8">
          <ListaMedicoes
            :medicoes="medicoesFiltradosCompleto"
            :loading="loading"
            v-model:current-page="paginaAtual"
            :items-per-page="itensPorPagina"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>

      </div>

      <!-- ── Cadastrar / Editar ──────────── -->
      <div v-else key="cadastrar">
        <CadastroMedicoes
          :is-novo="!medicaoEditando"
          :medicao="medicaoEditando"
          @salvo="onSalvo"
          @voltar="voltarParaLista"
        />
      </div>
    </Transition>
  </div>

  <!-- Modal de Confirmação de Exclusão -->
  <BaseModalConfirm
    :show="exibindoModalExcluir"
    title="Excluir Medição"
    :message="`Tem certeza que deseja excluir a medição de '${medicaoParaExcluir?.data ? new Date(medicaoParaExcluir.data).toLocaleDateString('pt-BR') : '—'}'? Esta ação não pode ser desfeita.`"
    confirm-text="Excluir"
    variant="danger"
    :loading="excluindo"
    @confirm="confirmDelete"
    @cancel="exibindoModalExcluir = false"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Plus, Search, ArrowLeft } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { ViewMedicoesCompleta } from '~/types/viewMedicoesCompleta'

const {
  medicoes,
  medicoesFiltradas,
  loading,
  search,
  fetchMedicoes
} = useViewMedicoesCompleta()

// Paginação
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

const view = ref<'lista' | 'cadastrar'>('lista')
const medicaoEditando = ref<ViewMedicoesCompleta | null>(null)

// Estados para Exclusão
const exibindoModalExcluir = ref(false)
const medicaoParaExcluir = ref<ViewMedicoesCompleta | null>(null)
const excluindo = ref(false)

const { deleteMedicao } = useMedicoes()

// Resetar página ao buscar
watch(search, () => {
  paginaAtual.value = 1
})

// Carrega dados ao montar
onMounted(async () => {
  await fetchMedicoes()
})

// ── Filtros avançados ──────────────────────────────────────────────────────
const filtros = ref({ dataInicio: '', dataFim: '', tipo: '' })

const medicoesFiltradosCompleto = computed(() => {
  return medicoesFiltradas.value.filter(m => {
    // Filtro por tipo
    if (filtros.value.tipo && m.nome_tipo_medicao !== filtros.value.tipo) return false

    // Filtro por data — compara só os 10 primeiros chars (YYYY-MM-DD), sem timezone
    if (m.data) {
      const dataStr = m.data.substring(0, 10)   // "2026-02-15"
      if (filtros.value.dataInicio && dataStr < filtros.value.dataInicio) return false
      if (filtros.value.dataFim && dataStr > filtros.value.dataFim) return false
    }

    return true
  })
})

// Resetar página ao mudar filtros
watch(filtros, () => { paginaAtual.value = 1 }, { deep: true })

function handleEdit(medicao: ViewMedicoesCompleta) {
  medicaoEditando.value = { ...medicao }
  view.value = 'cadastrar'
}

function handleDelete(medicao: ViewMedicoesCompleta) {
  medicaoParaExcluir.value = medicao
  exibindoModalExcluir.value = true
}

async function confirmDelete() {
  if (!medicaoParaExcluir.value) return

  excluindo.value = true
  const result = await deleteMedicao(medicaoParaExcluir.value.medicao_id)
  excluindo.value = false

  if (result.success) {
    toast.success('Medição excluída com sucesso!')
    exibindoModalExcluir.value = false
    medicaoParaExcluir.value = null
    await fetchMedicoes()
  } else {
    toast.error('Erro ao excluir medição', {
      description: (result as any).error || 'Ocorreu um problema ao tentar excluir o registro.'
    })
  }
}

async function onSalvo() {
  await fetchMedicoes()
}

function voltarParaLista() {
  medicaoEditando.value = null
  view.value = 'lista'
}
</script>
