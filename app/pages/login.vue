<template>
  <!-- Left: Form -->
  <div class="w-full lg:w-[480px] flex items-center justify-center bg-white dark:bg-slate-900 px-8 py-12 shrink-0">
    <div class="w-full max-w-sm">
      <FormLogin />
    </div>
  </div>

  <!-- Right: Info Panel -->
  <div class="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary-700 via-primary-600 to-emerald-500 overflow-hidden flex-col items-center justify-center p-16 text-white">
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-white/30 blur-3xl"></div>
      <div class="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-emerald-300/30 blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-md text-center">
      <!-- Logo grande -->
      <div class="flex items-center justify-center gap-3 mb-10">
        <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-extrabold text-2xl shadow-xl">
          GM
        </div>
        <span class="text-2xl font-extrabold tracking-tight">GreenManage</span>
      </div>

      <h2 class="text-4xl font-extrabold leading-tight mb-4">
        Gestão Ambiental<br />
        <span class="text-emerald-200">inteligente e eficiente</span>
      </h2>
      <p class="text-white/70 text-lg mb-12 leading-relaxed">
        Controle seus resíduos, manifestos e indicadores ambientais em um só lugar.
      </p>

      <!-- Feature list -->
      <div class="space-y-4 text-left">
        <div v-for="feature in features" :key="feature.label" class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
            <component :is="feature.icon" class="w-4 h-4 text-white" />
          </div>
          <div>
            <p class="font-semibold text-sm">{{ feature.label }}</p>
            <p class="text-white/60 text-xs leading-relaxed mt-0.5">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Badges inferiores -->
    <div class="absolute bottom-8 left-0 right-0 flex justify-center gap-6 opacity-60 text-xs font-medium">
      <span>✓ Conforme SINIR</span>
      <span>✓ ISO 14001</span>
      <span>✓ MTR Digital</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, BarChart2, ShieldCheck, Truck } from 'lucide-vue-next';

definePageMeta({
  layout: 'auth',
});

// Se já estiver logado, redireciona para o início
const session = useSupabaseSession();
watch(session, (s) => {
  if (s) navigateTo('/');
}, { immediate: true });

const features = [
  {
    icon: FileText,
    label: 'Emissão de MTR',
    description: 'Gere e gerencie manifestos de transporte de resíduos com conformidade total ao SINIR.',
  },
  {
    icon: BarChart2,
    label: 'Dashboards e Relatórios',
    description: 'Acompanhe indicadores de desempenho ambiental em tempo real.',
  },
  {
    icon: Truck,
    label: 'Controle de Transporte',
    description: 'Monitore transportadoras, veículos e motoristas em todas as etapas.',
  },
  {
    icon: ShieldCheck,
    label: 'Conformidade Garantida',
    description: 'Fique em dia com as exigências legais e auditorias ambientais.',
  },
];
</script>
