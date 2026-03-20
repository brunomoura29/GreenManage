export interface TransacaoListaDetalhe {
    id: string
    unique_id: string | null
    user_id: string | null
    company: string | null
    carrier: string | null
    destiny_place: string | null
    operador_que_recebeu: string | null
    residue_type: string | null
    blend_destinado_checking: boolean | null
    class_code: 'Classe I' | 'Classe II' | null
    code: string | null
    codigo_sinir: string | null
    date: string | null
    description_resiudo: string | null
    discharge_number: string | null
    observation: string | null
    origin_place: string | null
    residue_operation: string | null
    transaction_type: 'Entrada' | 'Saida' | 'Movimentacao interna' | null
    volume_in_m3: number | null
    conductivity: number | null
    ph: number | null
    temperature: number | null
    creation_date: string | null
    modified_date: string | null
    // Campos vindos da view (transacoes_documento)
    nota_fiscal?: string | null
    mtr?: string | null
    mtrs_transportadora?: any | null
    cliente_id?: string | null
    // Nomes resolvidos via JOIN
    nome_transportadora?: string | null
    nome_residue_type?: string | null
    nome_cliente?: string | null
}

export type TransacaoListaDetalheInsert = Omit<TransacaoListaDetalhe, 'id' | 'creation_date' | 'modified_date'>
export type TransacaoListaDetalheUpdate = Partial<TransacaoListaDetalheInsert>
