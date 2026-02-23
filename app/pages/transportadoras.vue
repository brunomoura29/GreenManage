<template>
  <div class="min-h-full">
    <!-- Header -->
    <div class="px-6 md:px-8 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          Cadastros / Transportadoras
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gerencie as transportadoras e suas informações aqui.
        </p>
      </div>

      <!-- Botão nova transportadora -->
      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-600 active:scale-95 transition-all shadow-soft shrink-0"
      >
        <Plus class="w-4 h-4" />
        Nova Transportadora
      </button>
    </div>

    <!-- Barra de pesquisa -->
    <div class="px-6 md:px-8 pb-4">
      <div class="relative max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar nome ou CNPJ..."
          class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
        />
      </div>
    </div>

    <!-- Tabela / Lista -->
    <div class="px-6 md:px-8 pb-8">
      <ListaTransportadoras
        :transportadoras="transportadorasFiltrados"
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
const transportadoras = ref([
  { id: '1', nome: 'Transportes TransLog', cnpj: '12.345.678/0001-90', email: 'contato@translog.com.br' },
  { id: '2', nome: 'Logística Verde S.A.', cnpj: '98.765.432/0001-10', email: 'atendimento@logverde.com' },
  { id: '3', nome: 'EcoExpress Transportadora', cnpj: '45.678.912/0001-11', email: 'ecoexpress@suporte.com' },
  { id: '4', nome: 'FastRoute Log', cnpj: '11.222.333/0001-44', email: 'gerencia@fastroute.com' },
  { id: '5', nome: 'Global Freight BR', cnpj: '55.444.333/0001-88', email: 'global@freight.com.br' },
])

const loading = ref(false)
const search = ref('')
const paginaAtual = ref(1)
const itensPorPagina = ref(10)

// Filtragem local
const transportadorasFiltrados = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return transportadoras.value
  return transportadoras.value.filter((t) =>
    [t.nome, t.cnpj, t.email].some(f => f?.toLowerCase().includes(q))
  )
})

// Resetar página ao buscar
watch(search, () => {
  paginaAtual.value = 1
})

function handleEdit(transportadora: any) {
  toast.info(`Editar transportadora: ${transportadora.nome}`)
}

function handleDelete(transportadora: any) {
  toast.error(`Excluir transportadora: ${transportadora.nome}`)
}
</script>
