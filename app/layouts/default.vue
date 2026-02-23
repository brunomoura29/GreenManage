<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
    <!-- Sidebar -->
    <BaseSidebar />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Global Top Header -->
      <BaseHeader />

      <!-- Page Content Scrollable Area -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth code-scrollbar relative z-0">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Nenhum script complexo necessário aqui por enquanto
</script>

<style>
/* Custom Scrollbar para área de conteúdo */
.code-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.code-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.code-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1; /* slate-300 */
  border-radius: 9999px; /* rounded-full */
}
.dark .code-scrollbar::-webkit-scrollbar-thumb {
  background-color: #334155; /* slate-700 */
}
.code-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8; /* slate-400 */
}
.dark .code-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #475569; /* slate-600 */
}
</style>
