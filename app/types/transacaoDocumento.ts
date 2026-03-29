// ─── Tipos da tabela `transacoes_documento` ──────────────────────────────────

export interface TransacaoDocumento {
    id: string
    unique_id: string | null
    user_id: string | null
    company: string | null
    carrier: string | null         // FK → transportadoras.unique_id
    driver: string | null          // FK → motoristas.unique_id
    generator: string | null       // FK → clientes.unique_id
    residue: string | null         // FK → transacoes_lista_detalhe.unique_id
    residue_type: string | null    // FK → tipo_residuos.unique_id
    vehicle: string | null         // FK → veiculos.unique_id
    residue_class_code: 'Classe I' | 'Classe II' | null
    collection_date: string | null
    receipt_date: string | null
    discharge_number: string | null
    manifest_number: string | null  // MTR principal
    nota_fiscal: string | null
    residue_description: string | null
    volume: number | null
    mtrs_transportadora: string[] | null  // JSONB
    mtr_transportadora_old: any | null    // JSONB legado
    creation_date: string | null
    modified_date: string | null
}

export type TransacaoDocumentoInsert = Omit<TransacaoDocumento, 'id' | 'creation_date' | 'modified_date'>
export type TransacaoDocumentoUpdate = Partial<Omit<TransacaoDocumentoInsert, 'unique_id'>>
