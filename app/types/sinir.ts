// ─── Tipos da API SINIR ───────────────────────────────────────────────────────

export interface SinirEstado {
  estCodigo: number
  estAbreviacao: string
}

export interface SinirParceiro {
  parCodigo: number | null
  parDescricao: string
  parCnpj: string | null
}

export interface SinirSituacaoManifesto {
  simCodigo: number
  simDescricao: string
  simOrdem: number
  simDataRecebimento?: string
}

export interface SinirResiduo {
  resCodigo: number
  resCodigoIbama: string
  resDescricao: string
}

export interface SinirUnidade {
  uniCodigo: number
  uniDescricao: string
  uniSigla: string
}

export interface SinirTratamento {
  traCodigo: number
  traDescricao: string
}

export interface SinirTipoEstado {
  tieCodigo: number
  tieDescricao: string
}

export interface SinirTipoAcondicionamento {
  tiaCodigo: number
  tiaDescricao: string
}

export interface SinirClasse {
  claCodigo: number
  claDescricao: string
  claResolucao?: string
}

export interface SinirGrupoEmbalagem {
  greCodigo: number
  greDescricao: string
}

export interface SinirManifestoResiduo {
  residuo: SinirResiduo
  unidade: SinirUnidade
  tratamento: SinirTratamento
  tipoEstado: SinirTipoEstado
  tipoAcondicionamento: SinirTipoAcondicionamento
  classe: SinirClasse
  grupoEmbalagem: SinirGrupoEmbalagem
  marQuantidade: number
  marQuantidadeRecebida: number | null
  marDensidade: number | null
  marJustificativa: string | null
  marObservacao: string | null
  marNumeroONU: string | null
  marClasseRisco: string | null
  marNomeEmbarque: string | null
  marDescricaoInterna?: string | null
  marCodigoInterno?: string | null
}

export interface SinirManifesto {
  manNumero: string
  manData: number
  manResponsavel: string
  manDataExpedicao: number
  manNomeMotorista: string | null
  manPlacaVeiculo: string | null
  manObservacao: string
  manJustificativaCancelamento: string | null
  estado: SinirEstado
  parceiroGerador: SinirParceiro
  parceiroTransportador: SinirParceiro
  parceiroDestinador: SinirParceiro
  parceiroArmazenadorTemporario: SinirParceiro
  situacaoManifesto: SinirSituacaoManifesto
  listaManifestoResiduo: SinirManifestoResiduo[]
  manNumeroEstadual: string | null
  cdfNumero: string | null
  dataRecebimentoAT?: string
}

export interface SinirManifestoResponse {
  mensagem: string | null
  objetoResposta: SinirManifesto
  totalRecords?: number
  erro: boolean
}

export interface SinirCredenciais {
  cpf_cnpj: string
  senha: string
  unidade: string
}
