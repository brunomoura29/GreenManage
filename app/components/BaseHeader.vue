<template>
  <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center px-6 md:px-8 shrink-0 relative z-10">
    <div class="w-full flex justify-end items-center">
      <div class="flex items-center gap-3">
        <button 
          @click="toggleDarkMode"
          class="p-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors relative"
          title="Alternar Tema"
        >
          <Sun v-if="isDark" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>
        <button class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors relative">
          <Bell class="w-5 h-5" />
          <span class="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-slate-50 dark:border-slate-900"></span>
        </button>
        <BaseButton icon="Plus" size="sm" variant="primary" class="shadow-lg shadow-primary-500/20" @click="handleNovoManifesto">Novo Manifesto</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon, Bell } from 'lucide-vue-next';

const { abrirModal } = useModalNovaEntrada()
const router = useRouter()

async function handleNovoManifesto() {
  await router.push('/transacao_entradas')
  abrirModal()
}

// Dark Mode Logic
const isDark = ref(false);

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

// Initialize Theme
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }
});
</script>
