/**
 * Extrai o número da Nota Fiscal a partir do campo manObservacao do SINIR.
 *
 * O campo vem no formato: "NF: 277820" ou "NF:277820" ou "NF 277820"
 * Retorna o número como string, ou null se não encontrado.
 */
export function extrairNFdaObservacao(observacao: string | null | undefined): string | null {
  if (!observacao) return null
  const match = observacao.match(/NF[:\s]+(\S+)/i)
  return match?.[1] ?? null
}
