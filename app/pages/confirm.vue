<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
    <div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
      <Loader2 class="w-6 h-6 animate-spin text-primary-600" />
      <span class="text-sm font-medium">Confirmando autenticação...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

definePageMeta({
  layout: false, // Página sem layout (sem sidebar)
});

const user = useSupabaseUser();

// Aguarda o usuário ser confirmado e redireciona para home
watch(user, () => {
  if (user.value) {
    navigateTo('/');
  }
}, { immediate: true });
</script>
