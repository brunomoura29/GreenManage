export interface Transportadora {
    id: string
    cnpj: string | null
    codigo_sinir: string | null
    company: string | null
    drivers: string | null
    email: string | null
    nome_fantasia: string | null
    phone: string | null
    razao_social: string | null
    type: string | null
    creation_date: string | null
    modified_date: string | null
    Creator: string | null
    unique_id: string | null
    user_id: string | null
    contato: string | null
}

export type TransportadoraInsert = Omit<Transportadora, 'id' | 'creation_date' | 'modified_date'>
export type TransportadoraUpdate = Partial<TransportadoraInsert>
