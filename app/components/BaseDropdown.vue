<template>
  <div class="relative w-full" ref="dropdownRef">
    <label v-if="label" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
      {{ label }}
    </label>
    
    <button
      type="button"
      @click="!disabled && toggleDropdown()"
      class="relative w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm pl-4 pr-10 py-2 text-left cursor-default focus:outline-none focus:border-primary-400 focus:ring-0 focus:shadow-[0_0_5px_rgba(1,87,60,0.15)] dark:focus:shadow-[0_0_10px_rgba(74,222,128,0.3)] sm:text-sm"
      :class="{ 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900': disabled }"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :disabled="disabled"
    >
      <span class="block truncate" :class="!selectedLabel ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDown class="h-5 w-5 text-slate-400" aria-hidden="true" />
      </span>
    </button>

    <!-- Painel de opções: abre para baixo ou para cima conforme espaço -->
    <div
      v-if="isOpen"
      class="absolute z-[100] top-full mt-1 w-full bg-white dark:bg-slate-800 shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm slide-down-fade custom-scrollbar"
    >
      <!-- Search Input -->
      <div v-if="searchable" class="sticky top-0 z-[60] bg-white dark:bg-slate-800 p-2 border-b border-slate-100 dark:border-slate-700">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            v-model="searchQuery"
            class="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900 dark:text-slate-100 placeholder-slate-400"
            placeholder="Pesquisar..."
            @click.stop
          />
        </div>
      </div>

      <!-- Options List -->
      <ul tabindex="-1" role="listbox" aria-labelledby="listbox-label">
        <li
          v-for="option in filteredOptions"
          :key="getOptionValue(option)"
          @click="selectOption(option)"
          class="text-slate-900 dark:text-slate-100 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          :class="{ 'bg-primary-50 dark:bg-primary-900/20': isSelected(option) }"
          role="option"
        >
          <span class="font-normal block truncate" :class="{ 'font-semibold': isSelected(option) }">
            {{ getOptionLabel(option) }}
          </span>

          <span
            v-if="isSelected(option)"
            class="text-primary-600 absolute inset-y-0 right-0 flex items-center pr-4"
          >
            <Check class="h-5 w-5" aria-hidden="true" />
          </span>
        </li>
        <li v-if="filteredOptions.length === 0" class="text-slate-500 p-3 text-center text-sm">
          Nenhum resultado encontrado.
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Check, Search } from 'lucide-vue-next';

interface Option {
  label: string;
  value: any;
  [key: string]: any;
}

interface Props {
  modelValue: any;
  options: (Option | string)[];
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecione uma opção',
  searchable: false,
  disabled: false,
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.searchable) {
    searchQuery.value = '';
  }
};

const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

const getOptionLabel = (option: Option | string) => {
  return typeof option === 'string' ? option : option.label;
};

const getOptionValue = (option: Option | string) => {
  return typeof option === 'string' ? option : option.value;
};

const isSelected = (option: Option | string) => {
  return props.modelValue === getOptionValue(option);
};

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => getOptionValue(opt) === props.modelValue);
  return selected ? getOptionLabel(selected) : '';
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options;
  }
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option => 
    getOptionLabel(option).toLowerCase().includes(query)
  );
});

const selectOption = (option: Option | string) => {
  emit('update:modelValue', getOptionValue(option));
  isOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.slide-down-fade {
  animation: slideDownFade 0.2s ease-out;
}

@keyframes slideDownFade {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Scrollbar elegante ──────────────────────────── */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent; /* thumb | track */
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 99px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 99px;
  border: 1px solid transparent;
  background-clip: padding-box;
  transition: background-color 0.2s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #01573c; /* primary */
}

/* Dark mode */
:global(.dark) .custom-scrollbar {
  scrollbar-color: #334155 transparent;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #334155;
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #4ade80;
}
</style>
