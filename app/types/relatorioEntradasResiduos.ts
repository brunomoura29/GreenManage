export interface RelatorioEntradasResiduos {
  id: string
  unique_id: string | null
  user_id: string | null
  company: string | null
  residue_operation: string | null

  // Documento
  data_coletada: string | null
  data_recebida: string | null
  descarga: string | null
  mtr_sinir: string | null
  mtrs_transportadora: string[] | null
  nota_fiscal: string | null

  // Veículo e motorista
  placa_do_carro: string | null
  motorista: string | null

  // Resíduo
  codigo_sinir: string | null
  descricao_residuo: string | null
  classe: string | null
  qtd: number | null

  // Relações nominais
  cliente: string | null
  tipo_de_efluente: string | null
  transportadora: string | null
}
