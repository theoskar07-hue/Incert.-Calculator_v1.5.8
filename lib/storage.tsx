import type { Equipo } from './tipos'

const KEY = 'incertidumbre_equipos_v2'

export function cargarEquipos(): Equipo[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Equipo[]) : []
  } catch {
    return []
  }
}

export function guardarEquipos(equipos: Equipo[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(equipos))
  } catch {
    console.error('No se pudo guardar en localStorage')
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers compartidos
// ─────────────────────────────────────────────────────────────
const COLS = [
  'Equipo', 'Tipo Cal.', 'Resolución', 'Magnitud',
  'Nominal', 'Unidad',
  'Rdg1', 'Rdg2', 'Rdg3', 'Rdg4', 'Rdg5',
  'Promedio', 'Repetibilidad', 'Inc. Exp. (k=2)',
  'uScope', 'Inc. Result.',
  'Tolerancia', 'Desviación', 'Resultado', 'Notas',
  'Fecha Mod.',
]

function buildRows(equipos: Equipo[]): string[][] {
  const rows: string[][] = []
  for (const eq of equipos) {
    for (const mag of eq.magnitudes) {
      for (const p of mag.puntos) {
        rows.push([
          eq.descripcion,
          eq.tipoCalibracion,
          eq.resolucion,
          mag.nombre,
          p.nominal?.toString() ?? '',
          p.unidad,
          p.rdg[0]?.toString() ?? '',
          p.rdg[1]?.toString() ?? '',
          p.rdg[2]?.toString() ?? '',
          p.rdg[3]?.toString() ?? '',
          p.rdg[4]?.toString() ?? '',
          p.promedio?.toFixed(4) ?? '',
          p.repetibilidad?.toString() ?? '',
          p.incertExpandida !== null ? `±${p.incertExpandida}` : '',
          p.incertScope?.toString() ?? '',
          p.incResultado ?? '',
          p.tolerancia?.toString() ?? '',
          p.desviacion?.toFixed(4) ?? '',
          p.resultado ?? '',
          p.notas,
          eq.fechaModificacion,
        ])
      }
    }
  }
  return rows
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const datestamp = () => new Date().toISOString().slice(0, 10)

// ─────────────────────────────────────────────────────────────
// Exportar CSV
// ─────────────────────────────────────────────────────────────
export function exportarCSV(equipos: Equipo[]): void {
  const rows = buildRows(equipos)
  const csv = [COLS, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, `calibracion_${datestamp()}.csv`)
}

// ─────────────────────────────────────────────────────────────
// Exportar XLS (XML Spreadsheet 2003 — sin dependencias)
// ─────────────────────────────────────────────────────────────
export function exportarXLS(equipos: Equipo[]): void {
  const rows = buildRows(equipos)
  const esc = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const headerCells = COLS.map(
    c => `<Cell ss:StyleID="header"><Data ss:Type="String">${esc(c)}</Data></Cell>`
  ).join('')

  const dataRows = rows.map(row => {
    const cells = row.map(v => {
      const num = Number(v)
      const isNum = v !== '' && !isNaN(num) && !v.startsWith('±')
      return isNum
        ? `<Cell><Data ss:Type="Number">${esc(v)}</Data></Cell>`
        : `<Cell><Data ss:Type="String">${esc(v)}</Data></Cell>`
    }).join('')
    return `<Row>${cells}</Row>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Calibracion">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  triggerDownload(blob, `calibracion_${datestamp()}.xls`)
}

// ─────────────────────────────────────────────────────────────
// Exportar PDF (generado con HTML + window.print)
// ─────────────────────────────────────────────────────────────
export function exportarPDF(equipos: Equipo[]): void {
  const rows = buildRows(equipos)
  const esc = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const headerHtml = COLS.map(c => `<th>${esc(c)}</th>`).join('')
  const rowsHtml = rows.map(row => {
    const cells = row.map((v, ci) => {
      let cls = ''
      // Inc. Result. column index = 15
      if (ci === 15 && v === 'OK') cls = ' class="ok"'
      if (ci === 15 && v === 'NO OK') cls = ' class="nok"'
      // Resultado column index = 18
      if (ci === 18 && v === 'PASA') cls = ' class="ok"'
      if (ci === 18 && v === 'FALLA') cls = ' class="nok"'
      return `<td${cls}>${esc(v)}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de Calibración — ${datestamp()}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 8pt; color: #111; }
    header { padding: 12px 16px; background: #1E3A8A; color: #fff; margin-bottom: 12px; }
    header h1 { font-size: 13pt; font-weight: 700; }
    header p  { font-size: 8pt; opacity: .8; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 7.5pt; }
    th {
      background: #1E40AF; color: #fff;
      padding: 4px 5px; text-align: left;
      font-weight: 600; white-space: nowrap;
    }
    td { padding: 3px 5px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8fafc; }
    .ok  { background: #d1fae5 !important; color: #065f46; font-weight: 600; text-align: center; }
    .nok { background: #fee2e2 !important; color: #991b1b; font-weight: 600; text-align: center; }
    @media print {
      @page { size: A3 landscape; margin: 10mm; }
      header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      th     { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .ok, .nok { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Reporte de Calibración</h1>
    <p>Generado: ${new Date().toLocaleString('es-MX')} &nbsp;|&nbsp; GUM (ISO/IEC Guide 98-3)</p>
  </header>
  <table>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`

  const win = window.open('', '_blank', 'width=1200,height=800')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    win.focus()
    win.print()
  }
}
