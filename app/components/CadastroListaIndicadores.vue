<template>
  <div class="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">

    <!-- Cabeçalho do indicador -->
    <div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
          <TrendingUp class="w-3.5 h-3.5 text-primary-700 dark:text-primary-400" />
        </div>
        <span class="text-sm font-semibold text-slate-800 dark:text-white">{{ nomeIndicador }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="turnos.length < 2"
          type="button"
          @click="adicionarTurno"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
        >
          <Plus class="w-3.5 h-3.5" />
          Inserir Turno
        </button>
        <button
          type="button"
          @click="$emit('remover')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Remover indicador"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Lista de turnos -->
    <div class="p-4 space-y-3">

      <!-- Skeleton de carregamento -->
      <template v-if="loading">
        <div
          v-for="i in 2"
          :key="`sk-${i}`"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 overflow-hidden"
        >
          <!-- Header do turno skeleton -->
          <div class="flex items-center justify-between">
            <div class="h-3 w-16 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer" />
            <div class="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700 skeleton-shimmer" />
          </div>
          <!-- Grid de campos skeleton -->
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <div class="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer" />
              <div class="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800 skeleton-shimmer" />
            </div>
            <div class="flex flex-col gap-1.5">
              <div class="h-3 w-20 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer" />
              <div class="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800 skeleton-shimmer" />
            </div>
            <div class="flex flex-col gap-1.5">
              <div class="h-3 w-12 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer" />
              <div class="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800 skeleton-shimmer" />
            </div>
            <div class="flex flex-col gap-1.5">
              <div class="h-3 w-18 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer" />
              <div class="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800 skeleton-shimmer" />
            </div>
          </div>
        </div>
      </template>

      <!-- Estado vazio -->
      <div v-else-if="turnos.length === 0" class="text-center py-4 text-sm text-slate-400 dark:text-slate-500">
        Nenhum turno adicionado. Clique em "Inserir Turno" para começar.
      </div>

      <!-- Turno -->
      <div
        v-for="(turno, index) in turnos"
        :key="index"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Turno {{ index + 1 }}
          </span>
          <button
            type="button"
            @click="removerTurno(index)"
            class="p-1 rounded text-slate-300 hover:text-red-500 transition-colors"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <!-- Período início -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CalendarDays class="w-3.5 h-3.5" /> Período Início
            </label>
            <input
              v-model="turno.periodoInicio"
              type="datetime-local"
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
            />
          </div>

          <!-- Período fim -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CalendarDays class="w-3.5 h-3.5" /> Período Fim
            </label>
            <input
              v-model="turno.periodoFim"
              type="datetime-local"
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
            />
          </div>

          <!-- Valor -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Valor</label>
            <input
              v-model.number="turno.valor"
              type="number"
              step="any"
              placeholder="0.00"
              class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition"
            />
          </div>

          <!-- Operador -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-400">Operador</label>
            <BaseDropdown
              v-model="turno.operador"
              :options="opcoesOperadores"
              placeholder="Selecione o operador"
              :searchable="true"
            />
          </div>

          <!-- Foto -->
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <ImageIcon class="w-3.5 h-3.5" /> Foto
            </label>
            <div class="relative">
              <input
                type="file"
                :id="`foto-${index}`"
                accept="image/*"
                class="sr-only"
                @change="handleFoto($event, index)"
              />
              <label
                :for="`foto-${index}`"
                class="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary cursor-pointer transition-colors"
              >
                <Upload class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ turno.fotoNome || 'Clique para selecionar uma imagem' }}</span>
              </label>
              <button
                v-if="turno.fotoNome"
                type="button"
                @click="turno.fotoNome = ''; turno.fotoFile = null"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
            <!-- Preview da imagem -->
            <img
              v-if="turno.preview"
              :src="turno.preview"
              class="mt-1 h-24 w-auto rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              alt="Preview"
            />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TrendingUp, Plus, Trash2, X, CalendarDays, Upload, Image as ImageIcon } from 'lucide-vue-next'
import type { Operador } from '~/types/operador'
import { useRegistroValorMedicao } from '~/composables/useRegistroValorMedicao'

interface Turno {
  periodoInicio: string
  periodoFim: string
  valor: number | null
  operador: string
  fotoFile: File | null
  fotoNome: string
  preview: string
}

const props = defineProps<{
  nomeIndicador: string
  indicadorUniqueId: string
  operadores: Operador[]
  medicaoId?: string | null
}>()

defineEmits<{ remover: [] }>()

const { fetchRegistrosByIndicador } = useRegistroValorMedicao()
const turnos = ref<Turno[]>([])

const opcoesOperadores = computed(() =>
  props.operadores.map(o => ({ label: o.name || '', value: o.unique_id || o.id }))
)

function formatData(data: Date, hora: string) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}T${hora}`
}

function dataHoje(hora: string) {
  return formatData(new Date(), hora)
}

function dataAmanha(hora: string) {
  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  return formatData(amanha, hora)
}

function adicionarTurno() {
  if (turnos.value.length >= 2) return

  const ehNoturno = turnos.value.length === 1

  turnos.value.push({
    periodoInicio: ehNoturno ? dataHoje('18:00') : dataHoje('06:00'),
    periodoFim:    ehNoturno ? dataAmanha('06:00') : dataHoje('18:00'),
    valor: null,
    operador: '',
    fotoFile: null,
    fotoNome: '',
    preview: ''
  })
}

function removerTurno(index: number) {
  turnos.value.splice(index, 1)
}

function handleFoto(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const turno = turnos.value[index]
  if (!file || !turno) return
  turno.fotoFile = file
  turno.fotoNome = file.name
  turno.preview = URL.createObjectURL(file)
}

// Carrega turnos existentes ao editar
const loading = ref(false)

onMounted(async () => {
  if (!props.medicaoId) return
  loading.value = true
  const result = await fetchRegistrosByIndicador(props.indicadorUniqueId, props.medicaoId) as any
  loading.value = false
  if (!result?.success || !result.data?.length) return

  turnos.value = (result.data as any[]).map(r => ({
    periodoInicio: r.date_range?.[0]?.slice(0, 16) ?? dataHoje('06:00'),
    periodoFim:    r.date_range?.[1]?.slice(0, 16) ?? dataHoje('18:00'),
    valor:         r.value ?? null,
    operador:      r.operator ?? '',
    fotoFile:      null,
    fotoNome:      r.photos ? r.photos.split('/').pop() ?? '' : '',
    preview:       r.photos ?? ''
  }))
})

// Expõe os turnos para o pai poder coletar no submit
defineExpose({ turnos, indicadorUniqueId: props.indicadorUniqueId })
</script>

<style scoped>
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s ease-in-out infinite;
}
:global(.dark) .skeleton-shimmer::after {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.07) 50%,
    transparent 100%
  );
}
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
