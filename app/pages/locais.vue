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
              Cadastros / Locais
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os locais e suas informações aqui.
            </p>
          </div>

          <!-- Botão novo local -->
          <button
            @click="handleNovo"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Novo Local
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar pelo nome do local..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Page Content -->
        <div class="px-6 md:px-8 pb-8">
          <ListaLocais
            :locais="locaisFiltrados"
            :loading="loading"
            v-model:current-page="currentPage"
            :items-per-page="itemsPerPage"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- View: Cadastro/Edição -->
      <div v-else key="cadastro">
        <CadastroLocais
          :is-novo="view === 'novo'"
          :local="selectedLocal"
          @voltar="handleVoltar"
          @salvo="fetchLocais"
        />
      </div>
    </Transition>

    <!-- Modal de Confirmação de Exclusão -->
    <BaseModalConfirm
      :show="showModalExcluir"
      title="Excluir Local"
      :message="`Tem certeza que deseja excluir o local ${localParaExcluir?.name}? Essa ação não poderá ser desfeita.`"
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
import { useLocais } from '~/composables/useLocais'
import type { Local } from '~/types/local'

const { locais, loading, fetchLocais, deleteLocal } = useLocais()

const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Navegação interna
const view = ref<'lista' | 'novo' | 'editar'>('lista')
const selectedLocal = ref<Local | null>(null)

// Estado para Exclusão
const showModalExcluir = ref(false)
const localParaExcluir = ref<Local | null>(null)
const excluindo = ref(false)

// Carregar dados ao montar
onMounted(async () => {
  await fetchLocais()
})

// Filtragem local
const locaisFiltrados = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return locais.value
  return locais.value.filter((l) =>
    l.name?.toLowerCase().includes(q)
  )
})

// Resetar página ao buscar
watch(search, () => {
  currentPage.value = 1
})

const handleNovo = () => {
  selectedLocal.value = null
  view.value = 'novo'
}

const handleEdit = (local: Local) => {
  selectedLocal.value = { ...local }
  view.value = 'editar'
}

const handleVoltar = () => {
  view.value = 'lista'
  selectedLocal.value = null
}

const handleDelete = (local: Local) => {
  localParaExcluir.value = local
  showModalExcluir.value = true
}

function cancelarExclusao() {
  showModalExcluir.value = false
  localParaExcluir.value = null
}

const confirmarExclusao = async () => {
  if (!localParaExcluir.value) return
  
  excluindo.value = true
  
  try {
    const result = await deleteLocal(localParaExcluir.value.id)
    if (result.success) {
      toast.success('Local excluído!', {
        description: `O local ${localParaExcluir.value.name} foi removido.`
      })
      await fetchLocais()
      cancelarExclusao()
    } else {
      toast.error('Erro ao excluir local', { 
        description: result.error || 'Não foi possível completar a ação.' 
      })
    }
  } catch (error: any) {
    toast.error('Erro inesperado', { description: error.message })
  } finally {
    excluindo.value = false
  }
}
</script>
