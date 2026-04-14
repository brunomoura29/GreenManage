export interface Insumo {
    id: string
    company: string | null
    current_stock: number | null
    measurement_unit: string | null
    name: string | null
    photos: string | null
    unit_value: number | null
    creation_date: string | null
    modified_date: string | null
    user_id: string | null
    unique_id: string | null
}

export type InsumoInsert = Omit<Insumo, 'id' | 'creation_date' | 'modified_date'>
export type InsumoUpdate = Partial<InsumoInsert>
