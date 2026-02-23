<template>
  <div class="min-h-full">
    <!-- Page Header -->
    <div class="px-6 md:px-8 pt-8 pb-2">
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Cadastros / Operadores</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os operadores e suas informações aqui.</p>
      </div>
    </div>

    <!-- Page Content -->
    <div class="p-6 md:p-8">
      <ListaOperadores
        :operadores="operadoresMock"
        :loading="loading"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        @edit="handleEdit"
        @delete="handleDelete"
        @update:current-page="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const operadoresMock = ref([
  { id: '1', nome: 'João Silva', cpf: '123.456.789-00' },
  { id: '2', nome: 'Maria Oliveira', cpf: '987.654.321-11' },
  { id: '3', nome: 'Carlos Souza', cpf: '456.789.123-22' },
])

const handleEdit = (operador: any) => {
  console.log('Editar operador:', operador)
}

const handleDelete = (operador: any) => {
  console.log('Excluir operador:', operador)
}
</script>
