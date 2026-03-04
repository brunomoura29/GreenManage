export interface RegistroIndicador {
    id: string
    company?: string | null
    indicator?: string | null       // FK → indicadores.unique_id
    measurement?: string | null     // FK → medicoes.unique_id
    measurement_type?: string | null
    creation_date?: string | null
    modified_date?: string | null
    creator?: string | null
    unique_id?: string | null
    user_id?: string | null
}

export type RegistroIndicadorInsert = Omit<RegistroIndicador, 'id' | 'creation_date' | 'modified_date'>
export type RegistroIndicadorUpdate = Partial<RegistroIndicadorInsert>
