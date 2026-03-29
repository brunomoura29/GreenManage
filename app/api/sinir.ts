// ─── API SINIR – funções client-side ─────────────────────────────────────────
// As chamadas são roteadas pelo proxy em server/api/sinir/ para evitar CORS.

import type { SinirCredenciais, SinirManifestoResponse } from '~/types/sinir'

/**
 * Busca um manifesto MTR na API SINIR.
 *
 * @param mtr         Número do MTR (ex: "231030175321")
 * @param credenciais Credenciais da empresa (cpf_cnpj, senha, unidade)
 * @returns           SinirManifestoResponse (objeto único)
 */
export async function buscarManifestoSinir(
    mtr: string,
    credenciais: SinirCredenciais
): Promise<SinirManifestoResponse> {
    return $fetch<SinirManifestoResponse>(`/api/sinir/manifesto/${mtr}`, {
        method: 'POST',
        body: credenciais,
    })
}
