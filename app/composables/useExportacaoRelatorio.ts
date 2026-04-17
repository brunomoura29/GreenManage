import * as XLSX from 'xlsx'
import type { RelatorioEntradasResiduos } from '~/types/relatorioEntradasResiduos'

const COLUNAS: { key: keyof RelatorioEntradasResiduos; header: string }[] = [
  { key: 'data_recebida',      header: 'Dt. Recebida' },
  { key: 'data_coletada',      header: 'Dt. Coletada' },
  { key: 'descarga',           header: 'Descarga' },
  { key: 'mtr_sinir',          header: 'MTR SINIR' },
  { key: 'mtrs_transportadora', header: 'MTRs Transportadora' },
  { key: 'nota_fiscal',        header: 'NF' },
  { key: 'placa_do_carro',     header: 'Placa' },
  { key: 'motorista',          header: 'Motorista' },
  { key: 'transportadora',     header: 'Transportadora' },
  { key: 'cliente',            header: 'Cliente / Gerador' },
  { key: 'codigo_sinir',       header: 'Cód. SINIR' },
  { key: 'descricao_residuo',  header: 'Descrição' },
  { key: 'tipo_de_efluente',   header: 'Tipo Efluente' },
  { key: 'classe',             header: 'Classe' },
  { key: 'qtd',                header: 'Qtd. m³' },
]

function formatData(iso: string | null): string {
  if (!iso) return ''
  const d = iso.substring(0, 10)
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return iso
  return `${day}/${m}/${y}`
}

function valorCelula(row: RelatorioEntradasResiduos, key: keyof RelatorioEntradasResiduos): string {
  const v = row[key]
  if (v == null) return ''
  if (key === 'data_recebida' || key === 'data_coletada') return formatData(v as string)
  if (Array.isArray(v)) return (v as string[]).join(', ')
  if (key === 'qtd') return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return String(v)
}

function baixarArquivo(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.click()
  URL.revokeObjectURL(url)
}

function nomeArquivo(ext: 'txt' | 'xlsx') {
  const agora = new Date()
  const d = agora.toISOString().substring(0, 10)
  return `relatorio_entradas_${d}.${ext}`
}

export function useExportacaoRelatorio() {
  function exportarTxt(dados: RelatorioEntradasResiduos[]) {
    const sep = '\t'
    const linhas: string[] = []

    linhas.push(COLUNAS.map(c => c.header).join(sep))

    for (const row of dados) {
      linhas.push(COLUNAS.map(c => valorCelula(row, c.key)).join(sep))
    }

    const blob = new Blob([linhas.join('\n')], { type: 'text/plain;charset=utf-8' })
    baixarArquivo(blob, nomeArquivo('txt'))
  }

  function exportarXlsx(dados: RelatorioEntradasResiduos[]) {
    const rows = dados.map(row =>
      Object.fromEntries(COLUNAS.map(c => [c.header, valorCelula(row, c.key)]))
    )

    const ws = XLSX.utils.json_to_sheet(rows, { header: COLUNAS.map(c => c.header) })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Entradas')

    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    baixarArquivo(blob, nomeArquivo('xlsx'))
  }

  return { exportarTxt, exportarXlsx }
}
