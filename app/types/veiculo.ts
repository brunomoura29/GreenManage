// ─── Tipos da tabela `veiculos` ───────────────────────────────────────────────

export interface Veiculo {
    id: string
    capacity_in_cubic_meters: number | null
    company: string | null
    model: string | null
    plate: string | null
    vehicle_list: string | null
    vehicle_type: string | null
    creation_date: string | null
    modified_date: string | null
    creator: string | null
    unique_id: string
    user_id: string | null
}

/** Payload para INSERT – exclui campos gerenciados automaticamente */
export type VeiculoInsert = Omit<Veiculo, 'id' | 'creation_date' | 'modified_date'>

/** Payload para UPDATE – todos os campos opcionais, exceto unique_id */
export type VeiculoUpdate = Partial<Omit<VeiculoInsert, 'unique_id'>>
