// ─── Tipos da tabela `empresas` ───────────────────────────────────────────────

export interface Empresa {
    id: string
    unique_id: string
    user_id: string | null
    cnpj: string
    nome: string
    data_criacao: string | null
    cpf_cnpj: string | null
    senha: string | null
    unidade: string | null
    credencial_externa: string | null
}

export type EmpresaInsert = Omit<Empresa, 'id' | 'data_criacao'>
export type EmpresaUpdate = Partial<EmpresaInsert>
