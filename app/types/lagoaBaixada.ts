export interface LagoaBaixada {
    id: string
    company?: string | null
    measurement?: string | null     // FK → medicoes.unique_id
    indicators?: string | null      // FK → indicadores.unique_id
    name?: string | null
    photos?: string | null
    creation_date?: string | null
    modified_date?: string | null
    creator?: string | null
    unique_id?: string | null
    user_id?: string | null
}

export type LagoaBaixadaInsert = Omit<LagoaBaixada, 'id' | 'creation_date' | 'modified_date'>
export type LagoaBaixadaUpdate = Partial<LagoaBaixadaInsert>
