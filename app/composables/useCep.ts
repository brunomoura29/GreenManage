/**
 * useCep – Composable para busca de endereço por CEP
 *
 * Utiliza a API pública ViaCEP (https://viacep.com.br)
 *
 * Funções disponíveis:
 *   buscarCep(cep) -> busca o endereço e retorna os dados
 *
 * Estado reativo:
 *   endereco -> dados do endereço encontrado
 *   loading  -> busca em andamento
 *   error    -> última mensagem de erro
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface EnderecoViaCep {
    cep: string
    logradouro: string
    complemento: string
    bairro: string
    localidade: string   // cidade
    uf: string
    ibge: string
    gia: string
    ddd: string
    siafi: string
}

// ─── Composable ───────────────────────────────────────────────────────────────

export const useCep = () => {
    const endereco = ref<EnderecoViaCep | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function buscarCep(cep: string) {
        // Remove formatação: pontos, hífens e espaços
        const cepLimpo = cep.replace(/\D/g, '')

        if (cepLimpo.length !== 8) {
            error.value = 'CEP inválido. Informe 8 dígitos.'
            return { success: false, data: null, error: error.value }
        }

        loading.value = true
        error.value = null
        endereco.value = null

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)

            if (!response.ok) {
                throw new Error('Falha ao conectar com o serviço de CEP.')
            }

            const data = await response.json()

            // ViaCEP retorna { erro: true } quando o CEP não existe
            if (data.erro) {
                error.value = 'CEP não encontrado.'
                return { success: false, data: null, error: error.value }
            }

            endereco.value = data as EnderecoViaCep
            return { success: true, data: endereco.value, error: null }

        } catch (err: any) {
            error.value = err?.message ?? 'Erro ao buscar CEP.'
            return { success: false, data: null, error: error.value }
        } finally {
            loading.value = false
        }
    }

    function limpar() {
        endereco.value = null
        error.value = null
    }

    return {
        // estado
        endereco,
        loading,
        error,
        // funções
        buscarCep,
        limpar,
    }
}
