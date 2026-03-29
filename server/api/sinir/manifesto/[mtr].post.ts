// ─── Proxy server-side para a API SINIR ──────────────────────────────────────
// Rota: POST /api/sinir/manifesto/:mtr
// Body: { cpf_cnpj, senha, unidade }
//
// Fluxo:
//   1. Autentica na API SINIR com as credenciais da empresa
//   2. Usa o token retornado para buscar o manifesto pelo número MTR
//   3. Retorna o array de SinirManifestoResponse

const SINIR_AUTH_URL = 'https://admin.sinir.gov.br/api/autenticar'
const SINIR_MTR_BASE_URL = 'https://admin.sinir.gov.br/apiws/rest'
const SINIR_API_KEY = 'bearer MzgzOTQsNjYzMzgxLGJhOTNjZDI1LWZkZTktNDZiZS1iODE5LWU2MmRkNTc1YzhiMg=='

export default defineEventHandler(async (event) => {
    const mtr = getRouterParam(event, 'mtr')
    if (!mtr) throw createError({ statusCode: 400, message: 'Número do MTR não informado' })

    const body = await readBody(event)
    const { cpf_cnpj, senha, unidade } = body ?? {}

    if (!cpf_cnpj || !senha || !unidade) {
        throw createError({ statusCode: 400, message: 'Credenciais da empresa incompletas (cpf_cnpj, senha, unidade)' })
    }

    // 1 – Obter token
    const tokenRes = await $fetch<{ mensagem: string; objetoResposta: string; erro: boolean }>(
        SINIR_AUTH_URL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': SINIR_API_KEY,
            },
            body: { cpfCnpj: cpf_cnpj, senha, unidade },
        }
    ).catch((err) => {
        throw createError({ statusCode: 502, message: `Erro ao autenticar no SINIR: ${err?.message ?? err}` })
    })

    if (tokenRes.erro || !tokenRes.objetoResposta) {
        throw createError({ statusCode: 401, message: tokenRes.mensagem ?? 'Falha na autenticação SINIR' })
    }

    // 2 – Buscar manifesto (retorna objeto único, não array)
    const manifestoRes = await $fetch<{ mensagem: string | null; objetoResposta: any; totalRecords: number; erro: boolean }>(
        `${SINIR_MTR_BASE_URL}/retornaManifesto/${mtr}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': tokenRes.objetoResposta,
            },
        }
    ).catch((err) => {
        throw createError({ statusCode: 502, message: `Erro ao buscar manifesto no SINIR: ${err?.message ?? err}` })
    })

    if (manifestoRes.erro) {
        throw createError({ statusCode: 404, message: manifestoRes.mensagem ?? 'MTR não encontrado' })
    }

    return manifestoRes
})
