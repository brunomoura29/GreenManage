export interface Operador {
    id: string
    company: string | null
    cpf: string | null
    name: string | null
    creation_date: string | null
    modified_date: string | null
    creator: string | null
    unique_id: string | null
    user_id: string | null
}

export type OperadorInsert = Omit<Operador, 'id' | 'creation_date' | 'modified_date'>
export type OperadorUpdate = Partial<OperadorInsert>
