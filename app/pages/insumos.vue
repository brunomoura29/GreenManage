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
              Estoque / Insumos
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os insumos químicos em estoque.
            </p>
          </div>

          <button
            @click="view = 'cadastrar'"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Novo Insumo
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar insumo..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Tabela -->
        <div class="px-6 md:px-8 pb-8">
          <InsumosListaInsumo
            :insumos="insumosFiltrados"
            :loading="loading"
            v-model:current-page="paginaAtual"
            :items-per-page="itensPorPagina"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>

      </div>

      <!-- ── Cadastrar / Editar ─────────────── -->
      <div v-else-if="view === 'cadastrar'" key="cadastrar">
        <CadastrarInsumos
          :is-novo="insumoEditando === null"
          :insumo="insumoEditando"
          @voltar="voltarParaLista"
        />
      </div>

    </Transition>
  </div>

  <!-- Modal de Confirmação de Exclusão -->
  <BaseModalConfirm
    :show="exibindoModalExcluir"
    title="Excluir Insumo"
    :message="`Tem certeza que deseja excluir este insumo? Esta ação não pode ser desfeita.`"
    confirm-text="Excluir"
    variant="danger"
    :loading="excluindo"
    @confirm="confirmDelete"
    @cancel="exibindoModalExcluir = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Insumo } from '~/types/insumo'

const {
  insumos,
  loading,
  fetchInsumos,
  deleteInsumo,
} = useInsumos()

const search = ref('')
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

const view = ref<'lista' | 'cadastrar'>('lista')
const insumoEditando = ref<Insumo | null>(null)

// Estados para exclusão
const exibindoModalExcluir = ref(false)
const insumoParaExcluir = ref<Insumo | null>(null)
const excluindo = ref(false)

// Filtro por busca
const insumosFiltrados = computed(() => {
  if (!search.value) return insumos.value
  const q = search.value.toLowerCase()
  return insumos.value.filter(i =>
    i.name?.toLowerCase().includes(q) ||
    i.measurement_unit?.toLowerCase().includes(q)
  )
})

watch(search, () => { paginaAtual.value = 1 })

onMounted(async () => {
  await fetchInsumos()
})

function handleEdit(insumo: Insumo) {
  insumoEditando.value = { ...insumo }
  view.value = 'cadastrar'
}

function handleDelete(insumo: Insumo) {
  insumoParaExcluir.value = insumo
  exibindoModalExcluir.value = true
}

async function voltarParaLista() {
  insumoEditando.value = null
  await fetchInsumos()
  view.value = 'lista'
}

async function confirmDelete() {
  if (!insumoParaExcluir.value) return

  excluindo.value = true
  const result = await deleteInsumo(insumoParaExcluir.value.id)
  excluindo.value = false

  if (result.success) {
    toast.success('Insumo excluído com sucesso!')
    exibindoModalExcluir.value = false
    insumoParaExcluir.value = null
    await fetchInsumos()
  } else {
    toast.error('Erro ao excluir insumo', {
      description: (result as any).error || 'Ocorreu um problema ao tentar excluir o registro.'
    })
  }
}
</script>
