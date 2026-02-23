// ─── Tipos da tabela `clientes` ───────────────────────────────────────────────

export interface Cliente {
    id: string
    address: string | null
    client_list: string | null
    codigo_sinir: string | null
    company: string | null
    contacts: string | null
    date_of_birth: string | null
    document: string | null
    email: string | null
    gender: string | null
    image: string | null
    mtrs: number | null
    nature: string | null
    nome_fantasia: string | null
    phone_number: string | null
    razao_social: string | null
    user_responsible: string | null
    creation_date: string | null
    modified_date: string | null
    creator: string | null
    unique_id: string
    user_id: string | null
}

/** Payload para INSERT – exclui campos gerenciados automaticamente */
export type ClienteInsert = Omit<Cliente, 'id' | 'creation_date' | 'modified_date'>

/** Payload para UPDATE – todos os campos opcionais, exceto unique_id */
export type ClienteUpdate = Partial<Omit<ClienteInsert, 'unique_id'>>
