<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
      {{ label }}
    </label>
    <div class="relative rounded-md shadow-sm">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="icon" class="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :class="[
          'block w-full rounded-lg sm:text-sm py-3 shadow-sm focus:outline-none',
          icon ? 'pl-10' : 'pl-4',
          error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-400 focus:ring-0 focus:shadow-[0_0_5px_rgba(239,68,68,0.2)] dark:focus:shadow-[0_0_10px_rgba(248,113,113,0.3)]'
            : 'border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-400 focus:ring-0 focus:shadow-[0_0_5px_rgba(1,87,60,0.15)] dark:focus:shadow-[0_0_10px_rgba(74,222,128,0.3)] dark:bg-slate-800'
        ]"
        v-bind="$attrs"
      />
      <div v-if="error" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <AlertCircle class="h-5 w-5 text-red-500" aria-hidden="true" />
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600" id="email-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next';

interface Props {
  modelValue: string | number;
  label?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  icon?: any;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
});

defineEmits(['update:modelValue']);
</script>
