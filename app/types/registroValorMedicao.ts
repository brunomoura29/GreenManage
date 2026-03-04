export interface RegistroValorMedicao {
    id: string
    company?: string | null
    date_range?: string[] | null
    indicator?: string | null           // FK → indicadores.unique_id
    indicator_value?: string | null     // FK → registro_indicadores.unique_id
    measurement?: string | null         // FK → medicoes.unique_id
    operator?: string | null
    photos?: string | null
    value?: number | null
    creation_date?: string | null
    modified_date?: string | null
    creator?: string | null
    unique_id?: string | null
    user_id?: string | null
}

export type RegistroValorMedicaoInsert = Omit<RegistroValorMedicao, 'id' | 'creation_date' | 'modified_date'>
export type RegistroValorMedicaoUpdate = Partial<RegistroValorMedicaoInsert>
