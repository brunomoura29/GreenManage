// ─── Tipos da tabela `tipo_residuos` ─────────────────────────────────────────

export interface TipoResiduo {
    id: string
    unique_id: string | null
    user_id: string | null
    company: string | null
    name: string | null
    creation_date: string | null
    modified_date: string | null
}

export type TipoResiduoInsert = Omit<TipoResiduo, 'id' | 'creation_date' | 'modified_date'>
export type TipoResiduoUpdate = Partial<Omit<TipoResiduoInsert, 'unique_id'>>
