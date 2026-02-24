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
              Cadastros / Clientes
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerencie os clientes e suas informações aqui.
            </p>
          </div>

          <!-- Botão novo cliente -->
          <button
            @click="view = 'cadastrar'"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
          >
            <UserPlus class="w-4 h-4" />
            Novo Cliente
          </button>
        </div>

        <!-- Barra de pesquisa -->
        <div class="px-6 md:px-8 pb-4">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="search"
              type="text"
              placeholder="Buscar cliente..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <!-- Tabela -->
        <div class="px-6 md:px-8 pb-8">
          <!-- Spinner de carregamento ao abrir edição -->
          <div v-if="carregandoEdicao" class="flex items-center justify-center py-16 text-slate-400 gap-3">
            <svg class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <span class="text-sm">Carregando dados do cliente...</span>
          </div>
          <ListaClientes
            v-else
            :clientes="clientesFiltrados"
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
        <CadastrarCliente
          :isNovo="clienteEditando === null"
          :cliente="clienteEditando"
          :enderecoInicial="enderecoEditando"
          :enderecoIdInicial="enderecoIdEditando"
          @voltar="voltarParaLista"
        />
      </div>
    </Transition>
  </div>

  <!-- Modal de Confirmação de Exclusão -->
  <BaseModalConfirm
    :show="exibindoModalExcluir"
    title="Excluir Cliente"
    :message="`Tem certeza que deseja excluir o cliente '${clienteParaExcluir?.razao_social}'? Esta ação não pode ser desfeita.`"
    confirm-text="Excluir"
    variant="danger"
    :loading="excluindo"
    @confirm="confirmDelete"
    @cancel="exibindoModalExcluir = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UserPlus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Cliente } from '~/types/cliente'

const { clientes, loading, fetchClientes, deleteCliente } = useClientes()
const { fetchEnderecosByClient, deleteEnderecosByClient } = useEnderecos()

const view = ref<'lista' | 'cadastrar'>('lista')
const clienteEditando = ref<Cliente | null>(null)
const enderecoEditando = ref<any>(null)
const enderecoIdEditando = ref<string | null>(null)
const carregandoEdicao = ref(false)
const search = ref('')

// Estados para Exclusão
const exibindoModalExcluir = ref(false)
const clienteParaExcluir = ref<Cliente | null>(null)
const excluindo = ref(false)

const paginaAtual = ref(1)
const itensPorPagina = ref(10)

// ── Filtragem local por nome, email ou documento ──────────────────────────
const clientesFiltrados = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return clientes.value
  return clientes.value.filter((c) =>
    [c.razao_social, c.nome_fantasia, c.email, c.document, c.phone_number]
      .some((field) => field?.toLowerCase().includes(q))
  )
})

// Resetar página ao buscar
watch(search, () => {
  paginaAtual.value = 1
})

// ── Ações ─────────────────────────────────────────────────────────────────

async function handleEdit(cliente: Cliente) {
  carregandoEdicao.value = true

  // Busca o endereço ANTES de exibir o formulário
  enderecoEditando.value = null
  enderecoIdEditando.value = null

  if (cliente.unique_id) {
    const result = await fetchEnderecosByClient(cliente.unique_id)
    const end = result.data?.[0]
    if (end) {
      enderecoEditando.value = end
      enderecoIdEditando.value = end.id
    }
  }

  clienteEditando.value = cliente
  carregandoEdicao.value = false
  view.value = 'cadastrar'
}

function handleDelete(cliente: Cliente) {
  clienteParaExcluir.value = cliente
  exibindoModalExcluir.value = true
}

async function confirmDelete() {
  if (!clienteParaExcluir.value) return

  excluindo.value = true
  
  // 1) Deleta os endereços vinculados primeiro (Cascade manual)
  if (clienteParaExcluir.value.unique_id) {
    await deleteEnderecosByClient(clienteParaExcluir.value.unique_id)
  }

  // 2) Deleta o cliente
  const result = await deleteCliente(clienteParaExcluir.value.id)
  excluindo.value = false

  if (result.success) {
    toast.success('Cliente e endereços excluídos com sucesso!')
    exibindoModalExcluir.value = false
    clienteParaExcluir.value = null
  } else {
    toast.error('Erro ao excluir cliente', {
      description: result.error || 'Ocorreu um problema ao tentar excluir o registro.'
    })
  }
}

async function voltarParaLista() {
  clienteEditando.value = null    // limpa o cliente em edição
  await fetchClientes()
  view.value = 'lista'
}

// ── Carrega dados ao montar ───────────────────────────────────────────────
onMounted(() => {
  fetchClientes()
})
</script>
