<template>
  <div class="min-h-full">

    <!-- ── Header ────────────────────────────────────────────────────────── -->
    <div class="px-6 md:px-8 pt-8 pb-6 flex items-center gap-4">
      <button
        @click="$emit('voltar')"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Voltar para lista"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          {{ modoEdicao ? 'Editar Local' : 'Novo Local' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {{ modoEdicao ? 'Atualize os dados do local.' : 'Preencha os dados para cadastrar um novo local.' }}
        </p>
      </div>
    </div>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <form class="px-6 md:px-8 pb-10 space-y-8" @submit.prevent="salvarLocal">

      <!-- ── Seção: Informações Básicas ──────────────────────────────── -->
      <section>
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Informações Básicas
        </h2>
        <div class="grid grid-cols-1 gap-6">

          <!-- Nome do Local -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome do Local <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ex: Tanque de Criação 01"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              required
            />
          </div>

          <!-- Upload de Imagem -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Imagem do Local (Upload gera Link)
            </label>
            
            <div class="flex flex-col sm:flex-row items-start gap-4">
              <!-- Preview -->
              <div class="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative group">
                <img v-if="previewUrl || form.photos" :src="previewUrl || form.photos || ''" class="w-full h-full object-cover" />
                <div v-else class="flex flex-col items-center gap-1 text-slate-400">
                  <Camera class="w-8 h-8" />
                  <span class="text-[10px] uppercase font-bold tracking-wider">Sem foto</span>
                </div>

                <!-- Overlay de Hover para trocar -->
                <div 
                  v-if="previewUrl || form.photos"
                  class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  @click="triggerFileInput"
                >
                  <Upload class="w-6 h-6 text-white" />
                </div>
              </div>

              <!-- Controles de Upload -->
              <div class="flex flex-col gap-2 pt-1">
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  O upload enviará o arquivo para o servidor e salvará apenas o <strong>link (URL)</strong> no banco de dados.
                </p>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="triggerFileInput"
                    class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <Upload class="w-3.5 h-3.5" />
                    {{ previewUrl || form.photos ? 'Trocar foto' : 'Selecionar arquivo' }}
                  </button>
                  <button
                    v-if="previewUrl || form.photos"
                    type="button"
                    @click="removerFoto"
                    class="px-3 py-1.5 text-xs font-medium rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Remover
                  </button>
                </div>
                <!-- Input Oculto -->
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileChange"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- ── Ações ─────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="$emit('voltar')"
          class="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="salvando"
          class="px-5 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 active:scale-95 transition-all shadow-soft disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Loader2 v-if="salvando" class="w-4 h-4 animate-spin" />
          {{ salvando ? 'Salvando...' : 'Salvar Local' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { ArrowLeft, Loader2, Camera, Upload, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Local } from '~/types/local'
import { useLocais } from '~/composables/useLocais'

const props = defineProps<{
  isNovo: boolean                 // true → modo criação | false → modo edição
  local?: Local | null            // dados do local (quando isNovo = false)
}>()

const emit = defineEmits<{ voltar: []; salvo: [] }>()

const modoEdicao = computed(() => !props.isNovo)
const { createLocal, updateLocal } = useLocais()
const supabase = useSupabaseClient()

const salvando = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const form = ref({
  name: '',
  photos: '',
  company: null as string | null,
  creator: null as string | null,
})

// Pré-preenche o form em modo edição
watch(() => props.local, (l) => {
  if (!l) return
  form.value = {
    name: l.name ?? '',
    photos: l.photos ?? '',
    company: l.company ?? null,
    creator: l.creator ?? null,
  }
  previewUrl.value = null
  selectedFile.value = null
}, { immediate: true })

onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // Validar tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande', { description: 'O tamanho máximo permitido é 2MB.' })
      return
    }

    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

function removerFoto() {
  selectedFile.value = null
  previewUrl.value = null
  form.value.photos = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function uploadImagem(): Promise<string | null> {
  // Se não tem arquivo selecionado, retorna o que já estava no form (a URL atual)
  if (!selectedFile.value) return form.value.photos

  try {
    const file = selectedFile.value
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_local.${fileExt}`
    const filePath = `locais/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('imagens')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('imagens')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error: any) {
    console.error('Erro no upload Storage:', error)
    toast.error('Erro ao enviar arquivo para o Storage', { description: error.message })
    return null
  }
}

async function salvarLocal() {
  if (salvando.value) return
  salvando.value = true

  try {
    // 1. Upload da imagem (Storage) para gerar a URL
    const imageUrl = await uploadImagem()
    
    // Se o upload falhou (e tinha arquivo selecionado), paramos aqui
    if (selectedFile.value && !imageUrl) {
        salvando.value = false
        return
    }

    // 2. Preparar payload com a URL (apenas o link vai para o banco)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null

    const payload = {
      ...form.value,
      photos: imageUrl, // Aqui vai apenas o LINK string
      user_id: userId,
    }

    if (modoEdicao.value && props.local) {
      const result = await updateLocal(props.local.id, payload)
      if (result.success) {
        toast.success('Local atualizado!', {
          description: `O local ${form.value.name} foi atualizado com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        toast.error('Erro ao atualizar local', { description: result.error || 'Tente novamente.' })
      }
    } else {
      const uniqueId = `loc_${Date.now()}`
      const result = await createLocal({
        ...payload,
        unique_id: uniqueId,
      })
      if (result.success) {
        toast.success('Local cadastrado!', {
          description: `O local ${form.value.name} foi adicionado com sucesso.`
        })
        emit('salvo')
        emit('voltar')
      } else {
        toast.error('Erro ao cadastrar local', { description: result.error || 'Tente novamente.' })
      }
    }
  } catch (error: any) {
    toast.error('Ocorreu um erro inesperado', { description: error.message || 'Falha na comunicação com o servidor.' })
  } finally {
    salvando.value = false
  }
}
</script>
