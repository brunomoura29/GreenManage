export interface Medicao {
    id: string
    qtd_indicadores?: number | null
    company?: string | null
    date?: string | null
    date_range?: string[] | null
    dosagem_de_cloro?: boolean | null
    equipamentos_funcionando?: boolean | null
    extra_fields?: Record<string, any> | null
    lagoa_tratamento_encheu?: boolean | null
    limpeza_flotador?: boolean | null
    measurement_type?: string | null
    observation?: string | null
    operator?: string | null
    preparado_polimero?: boolean | null
    retrolavagem_dos_filtros?: boolean | null
    solidos_sedimentaveis?: string | null
    creation_date?: string | null
    modified_date?: string | null
    creator?: string | null
    unique_id?: string | null
    user_id?: string | null
}

export type MedicaoInsert = Omit<Medicao, 'id' | 'creation_date' | 'modified_date'>
export type MedicaoUpdate = Partial<MedicaoInsert>
