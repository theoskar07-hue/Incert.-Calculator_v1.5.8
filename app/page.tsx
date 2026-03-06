'use client'

import { useEffect } from 'react'

export default function Page() {
  useEffect(() => {
    // ── Inyectar SheetJS (si no está ya) ──────────────────────
    const loadApp = () => {
      const existing = document.getElementById('incert-app-script')
      if (existing) existing.remove()

      // Cargar docs/app.js directamente como script
      const script = document.createElement('script')
      script.id = 'incert-app-script'
      script.src = '/app.js'          // servido desde /docs/ via next.config
      script.onload = () => {
        // Inicializar app después de que el script cargue
        const w = window as any
        if (w.cargar && w.render) { w.cargar(); w.render(); }
      }
      document.body.appendChild(script)
    }

    const injectSheetJS = () => {
      if (typeof (window as any).XLSX !== 'undefined') { loadApp(); return; }
      const existing = document.getElementById('sheetjs-cdn')
      if (existing) { loadApp(); return; }
      const s = document.createElement('script')
      s.id = 'sheetjs-cdn'
      s.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'
      s.onload = loadApp
      document.head.appendChild(s)
    }

    // Esperar a que el DOM esté listo
    if (document.readyState === 'complete') {
      injectSheetJS()
    } else {
      window.addEventListener('load', injectSheetJS, { once: true })
    }

    return () => {
      const s = document.getElementById('incert-app-script')
      if (s) s.remove()
    }
  }, [])

  return (
    <>
      {/* ── CSS desde docs/styles.css ─────────────────── */}
      <link rel='stylesheet' href='/styles.css' />

      {/* ── Header ───────────────────────────────────── */}
      <header className='app-header'>
        <div className='header-brand'>
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none'
            stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M2 20h20'/><path d='M6 20V10'/><path d='M10 20V4'/><path d='M14 20V14'/><path d='M18 20V8'/>
          </svg>
          <div>
            <div className='header-title'>Calculadora de Incertidumbre</div>
            <div className='header-sub'>Metrología · Calibración</div>
          </div>
        </div>
        <div className='header-actions'>
          <div className='export-group' id='export-group' style={{ display: 'none' }}>
            <button className='btn btn-outline btn-sm'
              onClick={() => (window as any).exportarCSV?.()}
              title='Exportar a CSV'>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
                <polyline points='14 2 14 8 20 8'/>
              </svg>
              CSV
            </button>
            <button className='btn btn-outline btn-sm'
              onClick={() => (window as any).exportarXLS?.()}
              title='Exportar a Excel (.xlsx)'>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#16a34a' strokeWidth='2'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
                <polyline points='14 2 14 8 20 8'/>
              </svg>
              XLSX
            </button>
            <button className='btn btn-outline btn-sm'
              onClick={() => (window as any).exportarPDF?.()}
              title='Exportar a PDF'>
              <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='#dc2626' strokeWidth='2'>
                <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
                <polyline points='14 2 14 8 20 8'/>
              </svg>
              PDF
            </button>
          </div>
          <button className='btn btn-primary'
            onClick={() => (window as any).agregarEquipo?.()}>
            + Agregar equipo
          </button>
        </div>
      </header>

      {/* ── Fórmulas banner ───────────────────────────── */}
      <main className='app-main'>
        <details className='formulas-banner'>
          <summary className='formulas-summary'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/>
            </svg>
            Fórmulas utilizadas
          </summary>
          <div className='formulas-grid'>
            {[
              { title: 'Promedio', code: 'x̄ = Σxᵢ / n', note: 'Redondeado a decimales de resolución' },
              { title: 'Repetibilidad (s)', code: 's = √[Σ(xᵢ−x̄)² / (n−1)]', note: '2 cifras significativas, sin notación científica' },
              { title: 'Comp. Tipo A (uA)', code: 'uA = s / √n', note: '' },
              { title: 'Comp. Tipo B (uScope)', code: 'uB = U_cert / 2', note: 'Incert. expandida del certificado ÷ 2' },
              { title: 'Inc. Combinada (uc)', code: 'uc = √(uA² + uB² + Σuᵢ²)', note: 'Varianzas extra incluidas' },
              { title: 'Inc. Expandida (U)', code: 'U = 2 · uc', note: '2 cifras significativas · k = 2' },
              { title: 'Inc. Result.', code: 'U ≤ uScope → OK', note: '' },
              { title: 'Labmaster', code: 'u_lm = valor (sin ÷)', note: 'Entra directo a la suma cuadrática' },
            ].map(f => (
              <div key={f.title} className='formula-item'>
                <div className='formula-title'>{f.title}</div>
                <div className='formula-code'>{f.code}</div>
                {f.note && <div className='formula-note'>{f.note}</div>}
              </div>
            ))}
          </div>
        </details>

        <div id='equipos-container' />
      </main>

      <footer className='app-footer'>
        Developed for Test Solutions SA. de C.V. by TheOskar &mdash; &copy; Copyright 2026
      </footer>
    </>
  )
}
