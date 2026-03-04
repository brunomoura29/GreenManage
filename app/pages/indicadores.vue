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
      <!-- View: Lista -->
      <div v-if="view === 'lista'" key="lista">
        <!-- Page Header -->
        <div class="px-6 md:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Medições / Indicadores
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os indicadores e seus valores aqui.
            </p>
          </div>

          <!-- Botão novo indicador -->
          <button
            @click="handleNovo"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Novo Indicador
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar pelo nome do indicador..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Page Content -->
        <div class="px-6 md:px-8 pb-8">
          <ListaIndicadores
            :indicadores="indicadoresFiltrados"
            :loading="loading"
            v-model:current-page="currentPage"
            :items-per-page="itemsPerPage"
            :search="search"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- View: Cadastro/Edição -->
      <div v-else key="cadastro">
        <CadastroIndicadores
          :is-novo="view === 'novo'"
          :indicador="selectedIndicador"
          @voltar="handleVoltar"
          @salvo="fetchIndicadores"
        />
      </div>
    </Transition>

    <!-- Modal de Confirmação de Exclusão -->
    <BaseModalConfirm
      :show="showModalExcluir"
      title="Excluir Indicador"
      :message="`Tem certeza que deseja excluir o indicador ${indicadorParaExcluir?.name}? Essa ação não poderá ser desfeita.`"
      confirm-text="Excluir"
      variant="danger"
      :loading="excluindo"
      @confirm="confirmarExclusao"
      @cancel="cancelarExclusao"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useIndicadores } from '~/composables/useIndicadores'

const {
  indicadores,
  indicadoresFiltrados,
  loading,
  search,
  fetchIndicadores,
  deleteIndicador
} = useIndicadores()

const currentPage = ref(1)
const itemsPerPage = ref(10)

// Navegação interna
const view = ref<'lista' | 'novo' | 'editar'>('lista')
const selectedIndicador = ref<any | null>(null)

// Estado para Exclusão
const showModalExcluir = ref(false)
const indicadorParaExcluir = ref<any | null>(null)
const excluindo = ref(false)

// Carregar dados ao montar
onMounted(async () => {
  await fetchIndicadores()
})

// Resetar página ao buscar
watch(search, () => {
  currentPage.value = 1
})

const handleNovo = () => {
  selectedIndicador.value = null
  view.value = 'novo'
}

const handleEdit = (item: any) => {
  selectedIndicador.value = { ...item }
  view.value = 'editar'
}

const handleVoltar = () => {
  view.value = 'lista'
  selectedIndicador.value = null
}

const handleDelete = (item: any) => {
  indicadorParaExcluir.value = item
  showModalExcluir.value = true
}

function cancelarExclusao() {
  showModalExcluir.value = false
  indicadorParaExcluir.value = null
}

const confirmarExclusao = async () => {
  if (!indicadorParaExcluir.value) return
  
  excluindo.value = true
  
  try {
    const result = await deleteIndicador(indicadorParaExcluir.value.id)
    if (result.success) {
      toast.success('Indicador excluído!', {
        description: `O indicador ${indicadorParaExcluir.value.name} foi removido.`
      })
      await fetchIndicadores()
      cancelarExclusao()
    } else {
      toast.error('Erro ao excluir indicador', { 
        description: 'Não foi possível completar a ação.' 
      })
    }
  } catch (error: any) {
    toast.error('Erro inesperado', { description: error.message })
  } finally {
    excluindo.value = false
  }
}
</script>
