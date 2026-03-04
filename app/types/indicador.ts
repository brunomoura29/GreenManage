export interface Indicador {
    id: string
    actual_value_in_number?: number | null
    company?: string | null
    history?: string | null
    measurement_type?: string | null
    measurement_unit?: string | null
    name?: string | null
    creation_date?: string | null
    modified_date?: string | null
    creator?: string | null
    unique_id?: string | null
    user_id?: string | null
}

export type IndicadorInsert = Omit<Indicador, 'id' | 'creation_date' | 'modified_date'>
export type IndicadorUpdate = Partial<IndicadorInsert>
