export interface ViewMedicoesCompleta {
    medicao_id: string               // m.id (PK da tabela medicoes)
    medicao_unique_id?: string | null  // m.unique_id (FK usada nas tabelas relacionadas)
    user_id?: string | null
    data?: string | null
    nome_tipo_medicao?: string | null
    periodo_medicao?: string[] | null
    dosagem_de_cloro?: boolean | null
    equipamentos_funcionando?: boolean | null
    extra_fields?: Record<string, any> | null
    lagoa_tratamento_encheu?: boolean | null
    limpeza_flotador?: boolean | null
    observation?: string | null
    operator?: string | null
    preparado_polimero?: boolean | null
    retrolavagem_dos_filtros?: boolean | null
    solidos_sedimentaveis?: string | null
    nome_operador?: string | null
    qtd_indicadores?: number | null
    nomes_indicadores?: string[] | null
    registros_valores?: { valor: number | null; foto: string | null }[] | null
    lista_lagoas_baixadas?: string[] | null
}
