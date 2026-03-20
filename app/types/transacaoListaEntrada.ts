export interface TransacaoListaEntrada {
    id: string
    unique_id: string | null
    user_id: string | null
    company: string | null
    date: string | null
    date_text: string | null
    transaction_type: 'Entrada' | 'Saida' | 'Movimentacao interna' | null
    total_recebido: number | null
    volume_descartado_vala: number | null
    blend_destinado: number | null
    creator: string | null
    creation_date: string | null
    modified_date: string | null
    qtd_registros?: number | null
}

export type TransacaoListaEntradaInsert = Omit<TransacaoListaEntrada, 'id' | 'creation_date' | 'modified_date'>
export type TransacaoListaEntradaUpdate = Partial<TransacaoListaEntradaInsert>
