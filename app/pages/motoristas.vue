<template>
  <div class="min-h-full">
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Dados Mockados Temporários
const motoristas = ref([
  { id: '1', nome: 'João Silva', cpf: '123.456.789-00', cnh: '123456789', telefone: '(11) 98888-7777', email: 'joao.silva@email.com' },
  { id: '2', nome: 'Maria Oliveira', cpf: '234.567.890-11', cnh: '987654321', telefone: '(21) 97777-6666', email: 'maria.o@email.com' },
  { id: '3', nome: 'Carlos Santos', cpf: '345.678.901-22', cnh: '456789123', telefone: '(31) 96666-5555', email: 'carlos.santos@email.com' },
  { id: '4', nome: 'Ana Souza', cpf: '456.789.012-33', cnh: '654321987', telefone: '(41) 95555-4444', email: 'ana.souza@email.com' },
  { id: '5', nome: 'Roberto Lima', cpf: '567.890.123-44', cnh: '321987654', telefone: '(51) 94444-3333', email: 'roberto.l@email.com' },
])

const loading = ref(false)
const search = ref('')
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

// Filtragem local
const motoristasFiltrados = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return motoristas.value
  return motoristas.value.filter((m) =>
    [m.nome, m.cpf, m.cnh, m.telefone].some(f => f?.toLowerCase().includes(q))
  )
})

// Resetar página ao buscar
watch(search, () => {
  paginaAtual.value = 1
})

function handleEdit(motorista: any) {
  toast.info(`Editar motorista: ${motorista.nome}`)
}

function handleDelete(motorista: any) {
  toast.error(`Excluir motorista: ${motorista.nome}`)
}
</script>
