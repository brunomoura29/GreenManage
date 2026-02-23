// ─── Tipos da tabela `enderecos` ──────────────────────────────────────────────

export interface Endereco {
    id: string
    address_city: string | null
    address_complement: string | null
    address_country: string | null
    address_neighborhood: string | null
    address_number: string | null
    address_state: string | null
    address_street: string | null
    address_zipcode: string | null
    client: string | null          // FK → clientes.unique_id
    creation_date: string | null
    modified_date: string | null
    creator: string | null
    unique_id: string | null
    user_id: string | null
}

/** Payload para INSERT – exclui campos gerenciados automaticamente */
export type EnderecoInsert = Omit<Endereco, 'id' | 'creation_date' | 'modified_date'>

/** Payload para UPDATE – todos os campos opcionais */
export type EnderecoUpdate = Partial<EnderecoInsert>
