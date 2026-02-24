// ─── Tipos da tabela `motoristas` ───────────────────────────────────────────────

export interface Motorista {
    id: string
    company: string | null
    cpf: string | null
    name: string | null
    partner_company_driver_list: string | null
    creation_date: string | null
    modified_date: string | null
    unique_id: string | null
    user_id: string | null
    transportadora: string | null
}

/** Payload para INSERT – exclui campos gerenciados automaticamente */
export type MotoristaInsert = Omit<Motorista, 'id' | 'creation_date' | 'modified_date'>

/** Payload para UPDATE – todos os campos opcionais, exceto unique_id */
export type MotoristaUpdate = Partial<Omit<MotoristaInsert, 'unique_id'>>
