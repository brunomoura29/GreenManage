<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-sm">
    <!-- Logo -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white font-bold text-xs">GM</div>
        <span class="font-bold text-slate-900 dark:text-white text-sm">Green Manage</span>
      </div>
      <h1 class="text-xl font-bold text-slate-900 dark:text-white">Entrar</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Bem-vindo de volta! Insira seus dados.</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-mail</label>
        <BaseInput
          v-model="email"
          type="email"
          placeholder="Digite um endereço de e-mail"
          :error="errors.email"
        />
      </div>

      <!-- Senha -->
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="block w-full rounded-lg sm:text-sm py-3 pl-4 pr-10 shadow-sm focus:outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-400 focus:ring-0 focus:shadow-[0_0_5px_rgba(1,87,60,0.15)] dark:focus:shadow-[0_0_10px_rgba(74,222,128,0.3)] dark:bg-slate-800"
            :class="errors.password ? 'border-red-300' : ''"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            tabindex="-1"
          >
            <Eye v-if="!showPassword" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
          </button>
        </div>
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
      </div>

      <!-- Lembrar me + Esqueci a Senha -->
      <div class="flex items-center justify-between pt-1">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <!-- Toggle switch -->
          <div
            @click="rememberMe = !rememberMe"
            class="relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer"
            :class="rememberMe ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'"
          >
            <span
              class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              :class="rememberMe ? 'translate-x-4' : 'translate-x-0'"
            />
          </div>
          <span class="text-sm text-slate-600 dark:text-slate-300">Lembrar-me</span>
        </label>

        <NuxtLink
          to="/esqueci-senha"
          class="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          Esqueci a senha
        </NuxtLink>
      </div>

      <!-- Botão Entrar -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 mt-2"
      >
        <span v-if="!loading">Entrar</span>
        <span v-else class="flex items-center justify-center gap-2">
          <Loader2 class="w-4 h-4 animate-spin" /> Entrando...
        </span>
      </button>
    </form>

    <!-- Rodapé -->
    <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
      Não tem uma conta?
      <NuxtLink
        to="/registro"
        class="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
      >
        Inscrever-se
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Eye, EyeOff, Loader2 } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

const { login, loading, error: authError } = useAuth();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(true);

const errors = reactive({
  email: '',
  password: '',
});

async function handleSubmit() {
  errors.email = '';
  errors.password = '';

  if (!email.value) {
    errors.email = 'Informe o e-mail.';
    return;
  }
  if (!password.value) {
    errors.password = 'Informe a senha.';
    return;
  }

  const result = await login(email.value, password.value);

  if (!result.success && authError.value) {
    // Mapeia erros comuns do Supabase para português
    const msg = authError.value.toLowerCase();
    if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
      errors.email = 'E-mail ou senha incorretos.';
    } else if (msg.includes('email')) {
      errors.email = authError.value;
    } else {
      errors.password = authError.value;
    }
  }
}
</script>
