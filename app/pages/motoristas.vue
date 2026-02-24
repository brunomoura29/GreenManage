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
              Cadastros / Motoristas
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os motoristas e suas informações aqui.
            </p>
          </div>

          <!-- Botão novo motorista -->
          <button
            @click="irParaNovo"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <Plus class="w-4 h-4" />
            Novo Motorista
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar nome, CPF ou CNH..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Tabela / Lista -->
        <div class="px-6 md:px-8 pb-8">
          <ListaMotoristas
            :motoristas="motoristasFiltrados"
            :loading="loading"
            v-model:current-page="paginaAtual"
            :items-per-page="itensPorPagina"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- View: Cadastro -->
      <div v-else key="cadastro">
        <CadastroMotorista
          :is-novo="isNovo"
          :motorista="motoristaSelecionado"
          @voltar="voltarParaLista"
          @salvo="fetchMotoristas"
        />
      </div>
    </Transition>

    <!-- Modal de Confirmação de Exclusão -->
    <BaseModalConfirm
      :show="showDeleteModal"
      title="Excluir Motorista"
      :message="`Deseja realmente excluir o motorista ${motoristaParaExcluir?.name}? essa ação não poderá ser desfeita.`"
      confirm-text="Excluir Motorista"
      variant="danger"
      :loading="excluindo"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useMotoristas } from '~/composables/useMotoristas'
import type { Motorista } from '~/types/motorista'

const { motoristas, loading, fetchMotoristas, deleteMotorista } = useMotoristas()

const search = ref('')
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

// Controle de visualização
const view = ref<'lista' | 'cadastro'>('lista')
const isNovo = ref(true)
const motoristaSelecionado = ref<Motorista | null>(null)

// Controle do Modal de Exclusão
const showDeleteModal = ref(false)
const motoristaParaExcluir = ref<Motorista | null>(null)
const excluindo = ref(false)

function irParaNovo() {
  isNovo.value = true
  motoristaSelecionado.value = null
  view.value = 'cadastro'
}

function handleEdit(motorista: Motorista) {
  isNovo.value = false
  motoristaSelecionado.value = motorista
  view.value = 'cadastro'
}

function voltarParaLista() {
  view.value = 'lista'
  motoristaSelecionado.value = null
}

function handleDelete(motorista: Motorista) {
  motoristaParaExcluir.value = motorista
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!motoristaParaExcluir.value) return
  
  excluindo.value = true
  const result = await deleteMotorista(motoristaParaExcluir.value.id)
  excluindo.value = false
  
  if (result.success) {
    toast.success('Motorista excluído com sucesso!')
    showDeleteModal.value = false
    motoristaParaExcluir.value = null
  } else {
    toast.error('Erro ao excluir motorista', { description: result.error || 'Tente novamente.' })
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  motoristaParaExcluir.value = null
}

// Carregar dados ao montar
onMounted(() => {
  fetchMotoristas()
})

// Filtragem local
const motoristasFiltrados = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return motoristas.value
  return motoristas.value.filter((m) =>
    [m.name, m.cpf, m.transportadora].some(f => f?.toLowerCase().includes(q))
  )
})

// Resetar página ao buscar
watch(search, () => {
  paginaAtual.value = 1
})
</script>
