<template>
  <div class="min-h-full">
    <!-- Page Header -->
    <div class="px-6 md:px-8 pt-8 pb-2">
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Cadastros / Locais</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os locais e suas informações aqui.</p>
      </div>
    </div>

    <!-- Page Content -->
    <div class="p-6 md:p-8">
      <ListaLocais
        :locais="locaisMock"
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

const locaisMock = ref([
  { id: '1', nome: 'Armazém Central', imagem: null },
  { id: '2', nome: 'Filial Norte', imagem: null },
  { id: '3', nome: 'Depósito Oeste', imagem: null },
  { id: '4', nome: 'Sede Administrativa', imagem: null },
])

const handleEdit = (local: any) => {
  console.log('Editar local:', local)
}

const handleDelete = (local: any) => {
  console.log('Excluir local:', local)
}
</script>
