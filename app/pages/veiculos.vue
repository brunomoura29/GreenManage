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
        <!-- Header -->
        <div class="px-6 md:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Cadastros / Veículos
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os veículos e suas informações aqui.
            </p>
          </div>

          <!-- Botão novo veículo -->
          <button
            @click="handleNovo"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Novo Veículo
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar pela placa ou modelo..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Tabela / Lista -->
        <div class="px-6 md:px-8 pb-8">
          <ListaVeiculos
            :veiculos="veiculosFiltrados"
            :loading="loading"
            v-model:current-page="paginaAtual"
            :items-per-page="itensPorPagina"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- View: Cadastro/Edição -->
      <div v-else key="cadastro">
        <CadastrarVeiculo
          :is-novo="view === 'novo'"
          :veiculo="selectedVeiculo"
          @voltar="handleVoltar"
          @salvo="fetchVeiculos"
        />
      </div>
    </Transition>

    <!-- Modal de Confirmação de Exclusão -->
    <BaseModalConfirm
      :show="showModalExcluir"
      title="Excluir Veículo"
      :message="`Tem certeza que deseja excluir o veículo de placa ${veiculoParaExcluir?.plate}? Essa ação não poderá ser desfeita.`"
      confirm-text="Excluir"
      variant="danger"
      :loading="excluindo"
      @confirm="confirmarExclusao"
      @cancel="cancelarExclusao"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useVeiculos } from '~/composables/useVeiculos'

const { veiculos, loading, fetchVeiculos } = useVeiculos()

const search = ref('')
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

// Navegação interna
const view = ref<'lista' | 'novo' | 'editar'>('lista')
const selectedVeiculo = ref<any>(null)

// Estado para Exclusão
const showModalExcluir = ref(false)
const veiculoParaExcluir = ref<any>(null)
const excluindo = ref(false)

// Carregar dados ao montar
onMounted(async () => {
  await fetchVeiculos()
})

// Filtragem local
const veiculosFiltrados = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return veiculos.value
  return veiculos.value.filter((v) =>
    [v.plate, v.model, v.vehicle_type].some(f => f?.toLowerCase().includes(q))
  )
})

// Resetar página ao buscar
watch(search, () => {
  paginaAtual.value = 1
})

function handleNovo() {
  selectedVeiculo.value = null
  view.value = 'novo'
}

function handleEdit(veiculo: any) {
  selectedVeiculo.value = veiculo
  view.value = 'editar'
}

function handleVoltar() {
  view.value = 'lista'
  selectedVeiculo.value = null
}

function handleDelete(veiculo: any) {
  veiculoParaExcluir.value = veiculo
  showModalExcluir.value = true
}

function cancelarExclusao() {
  showModalExcluir.value = false
  veiculoParaExcluir.value = null
}

async function confirmarExclusao() {
  if (!veiculoParaExcluir.value) return
  
  excluindo.value = true
  const { deleteVeiculo } = useVeiculos()
  
  try {
    const result = await deleteVeiculo(veiculoParaExcluir.value.id)
    if (result.success) {
      toast.success('Veículo excluído!', {
        description: `O veículo de placa ${veiculoParaExcluir.value.plate} foi removido.`
      })
      await fetchVeiculos()
      cancelarExclusao()
    } else {
      toast.error('Erro ao excluir veículo', { 
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
