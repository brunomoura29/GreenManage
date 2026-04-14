export type TransacaoEstoqueTipo = 'Entrada' | 'Consumo' | 'Ajuste'
export type TransacaoEstoqueTurno = 'manha' | 'noite'
export type TransacaoEstoqueSalvo = 'yes' | 'no'

export interface TransacaoEstoque {
    id: string
    unique_id: string
    insumo: string                   // FK -> insumos(unique_id)
    stock_movement: string           // FK -> movimento_estoque(unique_id)
    cost_of_difference: number
    saved: TransacaoEstoqueSalvo
    stock_before: number
    stock_after: number
    stock_difference: number
    qtd_registro: number
    time_of_day: TransacaoEstoqueTurno
    type: TransacaoEstoqueTipo
    creation_date: string
    modified_date: string
    user_id: string
}

export type TransacaoEstoqueInsert = Omit<TransacaoEstoque, 'id' | 'creation_date' | 'modified_date'>
export type TransacaoEstoqueUpdate = Partial<Omit<TransacaoEstoqueInsert, 'unique_id' | 'insumo' | 'stock_movement' | 'user_id'>>
