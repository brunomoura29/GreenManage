export type MovimentoEstoqueTipo = 'Entrada' | 'Consumo' | 'Ajuste'
export type MovimentoEstoqueTurno = 'manha' | 'noite'

export interface MovimentoEstoque {
    id: string
    unique_id: string
    company: string
    custo_total: number
    date: string
    shift: MovimentoEstoqueTurno
    type: MovimentoEstoqueTipo
    creation_date: string
    modified_date: string
    user_id: string
}

export type MovimentoEstoqueInsert = Omit<MovimentoEstoque, 'id' | 'creation_date' | 'modified_date'>
export type MovimentoEstoqueUpdate = Partial<Omit<MovimentoEstoqueInsert, 'unique_id' | 'company' | 'user_id'>>
