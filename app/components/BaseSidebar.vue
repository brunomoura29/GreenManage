<template>
  <div class="flex h-screen bg-background-light dark:bg-background-dark max-w-min">
    <!-- Sidebar Pai -->
    <aside 
      class="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-20 overflow-x-hidden"
      :class="[isParentCollapsed ? 'w-20' : 'w-[220px]']"
      @mouseenter="handleParentHover"
    >
      <!-- Header -->
      <div 
        class="flex items-center h-16 border-b border-slate-100 dark:border-slate-800 shrink-0 transition-all duration-300"
        :class="[isParentCollapsed ? 'justify-center px-2' : 'px-4']"
      >
        <div class="flex items-center overflow-hidden" :class="[isParentCollapsed ? 'gap-0 justify-center' : 'gap-3']">
          <div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shrink-0 text-white font-bold text-xl">
            GM
          </div>
          <div 
            class="flex flex-col transition-opacity duration-200 whitespace-nowrap"
            :class="[isParentCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto']"
          >
            <span class="font-bold text-slate-900 dark:text-white leading-tight">GreenManage</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">Gestão Ambiental</span>
          </div>
        </div>
      </div>

      <!-- Body (Menu) -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
        <button
          v-for="item in menuItems"
          :key="item.label"
          @click="handleParentClick(item)"
          class="w-full flex items-center rounded-lg transition-colors group relative"
          :class="[
            isParentActive(item)
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
            isParentCollapsed ? 'justify-center py-3 px-0' : 'gap-3 px-3 py-3'
          ]"
        >
          <!-- Icon -->
          <component 
            :is="item.icon" 
            class="w-6 h-6 shrink-0 transition-colors"
          :class="[isParentActive(item) ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300']"
          />
          
          <!-- Label -->
          <span 
            class="font-medium text-sm whitespace-nowrap transition-all duration-300 overflow-hidden"
            :class="[isParentCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100']"
          >
            {{ item.label }}
          </span>

          <!-- Tooltip (only when collapsed) -->
          <div 
            v-if="isParentCollapsed"
            class="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap"
          >
            {{ item.label }}
          </div>
        </button>
      </nav>

      <!-- Footer (User) -->
      <div 
        class="border-t border-slate-100 dark:border-slate-800 shrink-0 transition-all duration-300 relative"
        :class="[isParentCollapsed ? 'p-2 justify-center flex' : 'p-4']"
      >
        <!-- Popup de Perfil -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="showProfileMenu"
            class="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <!-- Ações -->
            <div class="p-2">
              <button
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <User class="w-4 h-4 text-slate-400" />
                <span>Meu Perfil</span>
              </button>

              <div class="my-1.5 border-t border-slate-100 dark:border-slate-700" />

              <button
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut class="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        </Transition>

        <!-- Overlay para fechar ao clicar fora -->
        <div
          v-if="showProfileMenu"
          class="fixed inset-0 z-40"
          @click="showProfileMenu = false"
        />

        <div class="flex items-center w-full overflow-hidden relative z-50" :class="[isParentCollapsed ? 'gap-0 justify-center' : 'gap-3']">
           <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="User" />
           </div>
            <div 
             class="flex flex-col transition-opacity duration-200 whitespace-nowrap min-w-0 flex-1"
             :class="[isParentCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100']"
           >
             <span class="font-medium text-sm text-slate-900 dark:text-white">Administrador</span>
             <span class="text-xs text-slate-500 dark:text-slate-400">admin@green.com</span>
           </div>
           <!-- Botão três pontinhos -->
           <button
             v-if="!isParentCollapsed"
             @click="showProfileMenu = !showProfileMenu"
             class="ml-auto shrink-0 p-1 rounded-md transition-colors"
             :class="showProfileMenu 
               ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30' 
               : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'"
             title="Opções"
           >
             <MoreHorizontal class="w-4 h-4" />
           </button>
        </div>
      </div>
    </aside>

    <!-- Sidebar Filho -->
    <aside 
      v-if="showChildrenSidebar"
      class="flex flex-col h-full bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out z-10 overflow-x-hidden relative"
      :class="[isChildCollapsed ? 'w-16' : 'w-[175px]']"
      @mouseenter="isChildCollapsed = false"
      @mouseleave="isChildCollapsed = true"
    >
      <!-- Header do filho -->
      <div class="flex items-center h-16 border-b border-slate-200/50 dark:border-slate-700/50 shrink-0 overflow-hidden"
        :class="[isChildCollapsed ? 'justify-center px-2' : 'px-6']"
      >
        <h2 
          class="font-semibold text-slate-800 dark:text-white whitespace-nowrap transition-all duration-200 overflow-hidden"
          :class="[isChildCollapsed ? 'text-xs opacity-0 w-0 hidden' : 'text-base opacity-100']"
        >
          {{ activeParent }}
        </h2>
        <!-- Ícone da seção quando colapsado -->
        <component
          v-if="isChildCollapsed"
          :is="activeParentIcon"
          class="w-5 h-5 text-slate-500 dark:text-slate-400"
        />
      </div>

      <!-- Itens do filho -->
      <div class="flex-1 py-4 space-y-1" :class="[isChildCollapsed ? 'px-2 overflow-hidden' : 'px-3 overflow-y-auto']">
        <div v-for="(child, index) in activeChildren" :key="index">
          <!-- Item com rota -->
          <NuxtLink 
            v-if="typeof child === 'object' && child.path"
            :to="child.path"
            class="flex items-center rounded-lg transition-colors group relative"
            :class="[
              isChildCollapsed ? 'justify-center py-3 px-0 w-full' : 'gap-3 px-3 py-2.5 w-full',
              route.path === child.path
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700'
            ]"
          >
            <component 
              :is="child.icon" 
              v-if="child.icon" 
              class="w-4 h-4 shrink-0 transition-colors"
              :class="[
                route.path === child.path
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'
              ]"
            />
            <span 
              class="text-sm font-medium whitespace-nowrap transition-all duration-200 overflow-hidden"
              :class="[isChildCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 truncate']"
            >
              {{ child.label }}
            </span>

            <!-- Tooltip quando colapsado -->
            <div 
              v-if="isChildCollapsed"
              class="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg"
            >
              {{ child.label }}
            </div>
          </NuxtLink>

          <!-- Fallback sem rota -->
          <button 
            v-else
            class="flex items-center rounded-lg transition-colors group relative text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-700"
            :class="[isChildCollapsed ? 'justify-center py-3 px-0 w-full' : 'gap-3 px-3 py-2.5 w-full']"
          >
            <component 
              :is="typeof child === 'object' && child.icon ? child.icon : null" 
              v-if="typeof child === 'object' && child.icon"
              class="w-4 h-4 shrink-0 text-slate-400 group-hover:text-primary-500"
            />
            <span 
              class="text-sm font-medium whitespace-nowrap transition-all duration-200 overflow-hidden"
              :class="[isChildCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 truncate']"
            >
              {{ typeof child === 'string' ? child : child.label }}
            </span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Ruler, 
  Recycle, 
  CloudSun, 
  Package, 
  FileText,
  Users, Truck, Briefcase, MapPin, Wrench, Activity, TrendingUp, 
  ArrowRight, ArrowRightLeft, ArrowLeft, Layers, FileSymlink, 
  Container, Replace, ClipboardList, FileSpreadsheet,
  MoreHorizontal, LogOut, User
} from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

const route = useRoute();
const router = useRouter();

// Definição dos itens
const menuItems = [
  { 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/',
    children: [] 
  },
  { 
    label: 'Cadastros', 
    icon: FolderPlus, 
    children: [
      { label: 'Clientes', path: '/clientes', icon: Users }, 
      { label: 'Veículos', path: '/veiculos', icon: Truck },
      { label: 'Motoristas', path: '/motoristas', icon: Briefcase },
      { label: 'Transportadoras', path: '/transportadoras', icon: Truck },
      { label: 'Locais', path: '/locais', icon: MapPin },
      { label: 'Operadores', path: '/operadores', icon: Wrench }
    ] 
  },
  { 
    label: 'Medições', 
    icon: Ruler, 
    children: [
      { label: 'Medições', path: '/medicoes', icon: Activity },
      { label: 'Indicadores', path: '/indicadores', icon: TrendingUp }
    ] 
  },
  { 
    label: 'Resíduos', 
    icon: Recycle, 
    children: [
      { label: 'Entradas', path: '/transacao_entradas', icon: ArrowRight },
      { label: 'Transições Internas', path: '/residuos/transicoes', icon: ArrowRightLeft }, 
      { label: 'Saídas', path: '/residuos/saidas', icon: ArrowLeft }, 
      { label: 'Tipos de Resíduos', path: '/residuos/tipos', icon: Layers }, 
      { label: 'Documentos', path: '/residuos/documentos', icon: FileSymlink }
    ] 
  },
  { 
    label: 'Climáticas', 
    icon: CloudSun, 
    children: [] 
  },
  { 
    label: 'Estoque', 
    icon: Package, 
    children: [
      { label: 'Químicos', path: '/estoque/quimicos', icon: Container }, 
      { label: 'Movimentações', path: '/estoque/movimentacoes', icon: Replace }
    ] 
  },
  { 
    label: 'Relatórios', 
    icon: FileText, 
    children: [
      { label: 'Movimentações', path: '/relatorios/movimentacoes', icon: ClipboardList }, 
      { label: 'ORD', path: '/relatorios/ord', icon: FileSpreadsheet }
    ] 
  }
];

// Estado
const activeParent = ref<string>('');
const isParentCollapsed = ref(false);
const isChildCollapsed = ref(false);
const showProfileMenu = ref(false);

const { logout } = useAuth();

async function handleLogout() {
  showProfileMenu.value = false;
  await logout();
}

// Verifica se um item pai está ativo com base na rota atual
function isParentActive(item: any): boolean {
  if (item.children && item.children.length > 0) {
    // Ativo se algum filho corresponde à rota atual
    return item.children.some((child: any) => 
      typeof child === 'object' && child.path && route.path === child.path
    );
  }
  // Para itens sem filhos (ex: Dashboard), compara o path diretamente
  return item.path ? route.path === item.path : false;
}

// Sincroniza o activeParent com a rota atual (para sidebar filho funcionar)
watch(() => route.path, (newPath) => {
  const matched = menuItems.find(item => {
    if (item.children && item.children.length > 0) {
      return item.children.some((child: any) => typeof child === 'object' && child.path === newPath);
    }
    return item.path === newPath;
  });
  if (matched) {
    activeParent.value = matched.label;
    if (matched.children.length > 0) {
      isParentCollapsed.value = true;
      isChildCollapsed.value = true; // já na página = filho colapsado
    } else {
      isParentCollapsed.value = false;
    }
  }
}, { immediate: true });

// Itens do filho ativo
const activeChildren = computed(() => {
  const activeItem = menuItems.find(item => item.label === activeParent.value);
  return activeItem ? activeItem.children : [];
});

// Ícone do pai ativo (para exibir no header do filho quando colapsado)
const activeParentIcon = computed(() => {
  const activeItem = menuItems.find(item => item.label === activeParent.value);
  return activeItem?.icon ?? null;
});

// O sidebar filho é exibido se o pai está colapsado e a seção ativa tem filhos
const showChildrenSidebar = computed(() => {
  const activeItem = menuItems.find(item => item.label === activeParent.value);
  return isParentCollapsed.value && activeItem && activeItem.children.length > 0;
});

function handleParentClick(item: any) {
  activeParent.value = item.label;
  
  if (item.children.length > 0) {
    // Tem filhos: colapsa o pai, exibe o filho expandido
    isParentCollapsed.value = true;
    isChildCollapsed.value = false; // abre expandido para escolha
  } else {
    // Sem filhos: expande o pai, fecha o filho e navega
    isParentCollapsed.value = false;
    if (item.path) {
      router.push(item.path);
    }
  }
}

function handleParentHover() {
  // Ao passar no pai, expande o pai e fecha o filho
  if (isParentCollapsed.value) {
    isParentCollapsed.value = false;
  }
}

// Quando um item filho é clicado: o sidebar filho colapsa para ícones apenas
// O @click no NuxtLink que navega também recolhe o filho
// usamos o route para detectar a página ativa
</script>
