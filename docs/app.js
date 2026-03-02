/* ============================================================
   CALCULADORA DE INCERTIDUMBRE — app.js
   Vanilla JS · Sin dependencias · GitHub Pages ready
   ============================================================ */
'use strict';

// ─── CONSTANTES ───────────────────────────────────────────────
const NUM_LECTURAS = { Trazable: 3, ANAB: 5, EMA: 5 };

const GRUPOS_UNIDADES = [
  { grupo: 'Voltaje',       unidades: ['mV', 'V', 'kV'] },
  { grupo: 'Corriente',     unidades: ['µA', 'mA', 'A'] },
  { grupo: 'Resistencia',   unidades: ['mΩ', 'Ω', 'kΩ', 'MΩ', 'GΩ'] },
  { grupo: 'Capacitancia',  unidades: ['pF','nF', 'µF', 'mF', 'F'] },
  { grupo: 'Presión',       unidades: ['Pa', 'kPa', 'MPa', 'bar', 'mbar', 'PSI', 'mmHg', 'inH2O', 'inWC', 'cmH2O'] },
  { grupo: 'Temperatura',   unidades: ['°C', '°F', 'K'] },
  { grupo: 'Humedad',       unidades: ['%RH'] },
  { grupo: 'Fuerza/Torque', unidades: ['N', 'kN', 'lb.f', 'kgf', 'gf', 'in.lb', 'N·m'] },
  { grupo: 'Masa',          unidades: ['mg', 'g', 'kg', 'lb', 'oz', 't'] },
  { grupo: 'Volumen',       unidades: ['µL', 'mL', 'L'] },
  { grupo: 'Longitud',      unidades: ['µm', 'mm', 'cm', 'm', 'in'] },
  { grupo: 'Frecuencia',    unidades: ['Hz', 'kHz', 'MHz'] },
  { grupo: 'Tiempo',        unidades: ['ms', 's', 'min', 'h'] },
  { grupo: 'Velocidad',     unidades: ['rpm', 'm/s', 'km/h'] },
  { grupo: 'Flujo',         unidades: ['L/min', 'LPM', 'L/h', 'm³/h', 'GPM', 'SCFM'] },
  { grupo: 'Otro',          unidades: ['%', 'ppm', 'ppb', 'dB', 'lux', 'cd'] },
];

const VARIANZAS_KEYS = [
  { key: 'resolucion',    label: 'Resolución (÷√12)',   div: Math.sqrt(12) },
  { key: 'excentricidad', label: 'Excentricidad (÷√3)', div: Math.sqrt(3)  },
  { key: 'deriva',        label: 'Deriva (÷√3)',         div: Math.sqrt(3)  },
  { key: 'rr',            label: 'R&R (÷√3)',            div: Math.sqrt(3)  },
  { key: 'sensibilidad',  label: 'Sensibilidad (÷√3)',   div: Math.sqrt(3)  },
  { key: 'temperatura',   label: 'Temperatura (÷√3)',    div: Math.sqrt(3)  },
  { key: 'densidad',      label: 'Densidad (÷√3)',       div: Math.sqrt(3)  },
  { key: 'flotabilidad',  label: 'Flotabilidad (÷√3)',   div: Math.sqrt(3)  },
  { key: 'labmaster',     label: 'Labmaster (sin ÷)',    div: 1             },
];

// ─── ESTADO GLOBAL ────────────────────────────────────────────
let state = { equipos: [] };

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function nuevoEquipo() {
  return {
    id: uid(),
    fechaCreacion: new Date().toLocaleString('es-MX'),
    descripcion: '',
    tipoCalibracion: 'Trazable',
    notas: '',
    magnitudes: [],
  };
}

function nuevaMagnitud() {
  return { id: uid(), nombre: '', puntos: [] };
}

function nuevoPunto() {
  return {
    id: uid(),
    nominal: '', unidad: '', resolucion: '',
    rdg: ['', '', '', '', ''],
    incertScope: '',
    varianzas: {},
    notas: '',
    // calculados
    promedio: null, repetibilidad: null, incertExpandida: null,
    incResultado: null, tolerancia: null, desviacion: null, resultado: null,
  };
}

// Calcula el step y decimales a partir de la resolucion ingresada
// Ej: "0.001" → step=0.001, decimals=3 | "0.1" → step=0.1, decimals=1 | "1" → step=1, decimals=0
function resolFromStr(resStr) {
  const val = parseFloat(resStr);
  if (!resStr || isNaN(val) || val <= 0) return { step: 'any', decimals: null };
  const str = resStr.trim();
  const dotIdx = str.indexOf('.');
  const decimals = dotIdx >= 0 ? str.length - dotIdx - 1 : 0;
  return { step: val, decimals };
}

// ─── PERSISTENCIA ─────────────────────────────────────────────
function cargar() {
  try {
    const raw = localStorage.getItem('incert_equipos_v4');
    if (raw) state.equipos = JSON.parse(raw);
  } catch (_) { state.equipos = []; }
}

function guardar() {
  try { localStorage.setItem('incert_equipos_v4', JSON.stringify(state.equipos)); } catch (_) {}
}

// ─── UTILIDADES DE FORMATO ────────────────────────────────────
function cifrasSig(num, sig) {
  sig = sig || 2;
  if (!isFinite(num) || num === 0) return 0;
  const exp = Math.floor(Math.log10(Math.abs(num)));
  const factor = Math.pow(10, sig - 1 - exp);
  return Math.round(num * factor) / factor;
}

// Formatea a 2 cifras significativas SIN notación científica
// Ej: 0.000082 → "0.000082", 1.2345 → "1.2", 0.0000001234 → "0.00000012"
function fmtSig(num) {
  if (num === null || num === undefined || !isFinite(num)) return '—';
  if (num === 0) return '0';
  const val = cifrasSig(num, 2);
  // Convertir a string fijo sin notación científica
  const exp = Math.floor(Math.log10(Math.abs(val)));
  if (exp >= 0) {
    // Número >= 1: usar decimales suficientes (máx 2 después del sig)
    return val.toFixed(Math.max(0, 1 - exp));
  } else {
    // Número < 1: usar toFixed con suficientes decimales
    return val.toFixed(Math.abs(exp) + 1);
  }
}

// Formatea el promedio respetando los decimales de la resolución
function fmtPromedio(num, decimals) {
  if (num === null || num === undefined || !isFinite(num)) return '—';
  if (decimals !== null && decimals !== undefined) {
    return parseFloat(num).toFixed(decimals);
  }
  return parseFloat(num).toFixed(4);
}

function fmt4(num) {
  if (num === null || num === undefined || !isFinite(num)) return '—';
  return parseFloat(num).toFixed(4);
}

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── FÓRMULAS ─────────────────────────────────────────────────
function calcTolerancia(p) {
  const nom = parseFloat(p.nominal);
  if (isNaN(nom)) return null;
  const abs = Math.abs(nom);
  switch (p.tolModo) {
    case 'manual': {
      const v = parseFloat(p.tolValor);
      return isNaN(v) || v <= 0 ? null : v;
    }
    case 'pct_rdg': {
      const pr = parseFloat(p.tolPctRdg);
      return isNaN(pr) || pr <= 0 ? null : (abs * pr) / 100;
    }
    case 'pct_fs': {
      const pf = parseFloat(p.tolPctFs), fs = parseFloat(p.tolFs);
      return isNaN(pf) || isNaN(fs) || pf <= 0 || fs <= 0 ? null : (fs * pf) / 100;
    }
    case 'combinada': {
      const pr  = parseFloat(p.tolPctRdg) || 0;
      const pf  = parseFloat(p.tolPctFs)  || 0;
      const fs  = parseFloat(p.tolFs)     || 0;
      const dig = parseFloat(p.tolDig)    || 0;
      const res = parseFloat(p.tolResDig) || 0;
      return (abs * pr) / 100 + (fs * pf) / 100 + dig * res;
    }
    default: return null;
  }
}

function calcVarianzasExtra(v) {
  return VARIANZAS_KEYS.reduce((sum, vk) => {
    const val = parseFloat((v || {})[vk.key]);
    if (!isNaN(val) && val > 0) {
      const u = val / vk.div;
      return sum + u * u;
    }
    return sum;
  }, 0);
}

function calcularPunto(p, tipo) {
  const n = NUM_LECTURAS[tipo];
  const lecturas = p.rdg.slice(0, n).map(r => parseFloat(r)).filter(r => !isNaN(r));
  if (lecturas.length < n) return null;
  if (p.nominal === '' || p.nominal === null || isNaN(parseFloat(p.nominal))) return null;

  const nom  = parseFloat(p.nominal);
  const promRaw = lecturas.reduce((a, b) => a + b, 0) / n;

  // Redondear promedio según resolución del punto
  const { decimals: resDecimals } = resolFromStr(p.resolucion);
  const prom = resDecimals !== null
    ? parseFloat(promRaw.toFixed(resDecimals))
    : promRaw;

  // Desviación estándar muestral (Repetibilidad)
  const varianza = lecturas.reduce((s, v) => s + Math.pow(v - prom, 2), 0) / (n - 1);
  const s = Math.sqrt(varianza);

  // Componente Tipo A: s/√n
  const uA = s / Math.sqrt(n);

  // Componente Tipo B: uScope del certificado (ya expandida k=2) → dividir entre 2
  const scopeVal = parseFloat(p.incertScope);
  const uScope   = (!isNaN(scopeVal) && scopeVal > 0) ? scopeVal / 2 : 0;

  // Varianzas extra
  const varExtra = calcVarianzasExtra(p.varianzas);

  // Incertidumbre combinada
  const uc = Math.sqrt(uA * uA + uScope * uScope + varExtra);

  // Incertidumbre expandida k=2 — 2 cifras significativas
  const uExpFinal = cifrasSig(uc * 2, 2);

  // Tolerancia y desviación
  const tol  = calcTolerancia(p);
  const desv = nom - prom;

  // Inc. Resultado: Inc. Exp. >= uScope → OK (la incertidumbre calculada valida el scope)
  const incResultado = (!isNaN(scopeVal) && scopeVal > 0)
    ? (uExpFinal >= scopeVal ? 'OK' : 'NO OK')
    : null;

  return {
    promedio:        prom,
    resDecimals:     resDecimals,
    repetibilidad:   cifrasSig(s, 2),
    incertExpandida: uExpFinal,
    incResultado,
    tolerancia:      tol,
    desviacion:      desv,
    resultado:       tol !== null ? (Math.abs(desv) <= tol ? 'PASA' : 'FALLA') : null,
  };
}

// ─── EXPORTAR CSV ─────────────────────────────────────────────
function exportarCSV() {
  const cols = ['Equipo','Tipo','Magnitud','Nominal','Resolución','Unidad',
    'Rdg1','Rdg2','Rdg3','Rdg4','Rdg5',
    'Promedio','Repetibilidad','Inc.Exp.','uScope','Inc.Result.',
    'Tolerancia','Desviación','Resultado','Notas'];
  const rows = [cols];
  state.equipos.forEach(eq => {
    eq.magnitudes.forEach(mag => {
      mag.puntos.forEach(p => {
        rows.push([
          eq.descripcion, eq.tipoCalibracion, mag.nombre,
          p.nominal, p.resolucion || '', p.unidad,
          p.rdg[0], p.rdg[1], p.rdg[2], p.rdg[3], p.rdg[4],
          fmt4(p.promedio), fmtSig(p.repetibilidad), fmtSig(p.incertExpandida),
          p.incertScope, p.incResultado || '—',
          fmt4(p.tolerancia), fmt4(p.desviacion), p.resultado || '—',
          p.notas || '',
        ]);
      });
    });
  });
  const csv = rows.map(r =>
    r.map(c => `"${String(c ?? '').replace(/"/g,'""')}"`).join(',')
  ).join('\n');
  descargar(csv, 'incertidumbre.csv', 'text/csv;charset=utf-8;');
}

// ─── EXPORTAR XLS ─────────────────────────────────────────────
function exportarXLS() {
  if (typeof XLSX === 'undefined') {
    alert('La librería de Excel aún está cargando. Intenta de nuevo en un momento.');
    return;
  }

  const toNum = v => {
    const n = parseFloat(v);
    return (!isNaN(n) && v !== '' && v !== null && v !== undefined && v !== '—') ? n : (v ?? '');
  };

  const headers = ['Equipo','Tipo Calibración','Magnitud','Nominal','Resolución','Unidad',
    'Rdg1','Rdg2','Rdg3','Rdg4','Rdg5',
    'Promedio','Repetibilidad','Inc. Exp.','uScope','Inc. Result.',
    'Notas'];

  const data = [headers];

  state.equipos.forEach(eq => {
    eq.magnitudes.forEach(mag => {
      mag.puntos.forEach(p => {
        data.push([
          eq.descripcion   || '',
          eq.tipoCalibracion,
          mag.nombre       || '',
          toNum(p.nominal),
          p.resolucion     || '',
          p.unidad         || '',
          toNum(p.rdg[0]), toNum(p.rdg[1]), toNum(p.rdg[2]),
          toNum(p.rdg[3]), toNum(p.rdg[4]),
          toNum(p.promedio),
          p.repetibilidad  !== null ? toNum(fmtSig(p.repetibilidad))  : '',
          p.incertExpandida!== null ? toNum(fmtSig(p.incertExpandida)): '',
          toNum(p.incertScope),
          p.incResultado   || '—',
          p.notas          || '',
        ]);
      });
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Estilo del encabezado: negrita y fondo azul
  const headerRange = XLSX.utils.decode_range(ws['!ref']);
  for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2563EB' } },
      alignment: { horizontal: 'center' },
    };
  }

  // Anchos de columna automáticos basados en contenido
  const colWidths = headers.map((h, ci) => {
    let max = h.length;
    data.slice(1).forEach(row => {
      const val = String(row[ci] ?? '');
      if (val.length > max) max = val.length;
    });
    return { wch: Math.min(max + 2, 30) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Incertidumbre');
  XLSX.writeFile(wb, 'incertidumbre.xlsx');
}

// ─── EXPORTAR PDF ─────────────────────────────────────────────
function exportarPDF() {
  let html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Reporte de Incertidumbre</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:20px}
  h1{font-size:15px;color:#1d4ed8;margin-bottom:4px}
  h2{font-size:13px;margin:18px 0 4px;color:#1e3a8a;border-bottom:1px solid #ddd;padding-bottom:3px}
  h3{font-size:11px;margin:10px 0 3px;color:#374151}
  p.meta{font-size:10px;color:#64748b;margin-bottom:14px}
  .info{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
  .info-item{border:1px solid #ddd;padding:5px 8px;border-radius:4px}
  .info-label{font-size:9px;color:#6b7280;font-weight:700;text-transform:uppercase}
  .info-value{font-size:11px;font-weight:600}
  table{border-collapse:collapse;width:100%;margin-bottom:14px;font-size:10px}
  th{background:#1d4ed8;color:#fff;padding:4px 6px;text-align:center;white-space:nowrap}
  th.hl{background:#1e3a8a}
  td{border:1px solid #ddd;padding:3px 6px;text-align:center}
  tr:nth-child(even) td{background:#f8fafc}
  .ok{background:#d1fae5!important;color:#065f46;font-weight:700}
  .nook{background:#fee2e2!important;color:#991b1b;font-weight:700}
  .hl{background:#eff4ff!important;color:#1d4ed8;font-weight:700}
  @page{size:A3 landscape;margin:12mm}
</style></head><body>
<h1>Reporte de Incertidumbre de Medición</h1>
<p class="meta">Generado el ${new Date().toLocaleString('es-MX')}</p>`;

  state.equipos.forEach(eq => {
    html += `<h2>${esc(eq.descripcion) || 'Equipo sin nombre'} <span style="font-weight:400;font-size:10px;color:#6b7280">(${eq.tipoCalibracion})</span></h2>
<div class="info">
  <div class="info-item"><div class="info-label">Tipo de calibración</div><div class="info-value">${eq.tipoCalibracion}</div></div>
  <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${esc(eq.fechaCreacion)}</div></div>
  <div class="info-item"><div class="info-label">Notas</div><div class="info-value">${esc(eq.notas) || '—'}</div></div>
</div>`;

    eq.magnitudes.forEach(mag => {
      const n = NUM_LECTURAS[eq.tipoCalibracion];
      let rdgTh = '';
      for (let i = 1; i <= n; i++) rdgTh += `<th>Rdg ${i}</th>`;
      html += `<h3>Magnitud: ${esc(mag.nombre) || 'Sin nombre'}</h3>
<table><thead><tr>
<th>#</th><th>Nominal</th><th>Resolución</th><th>Unidad</th>${rdgTh}
<th>Promedio</th><th>uScope</th><th class="hl">Repet.</th><th class="hl">Inc. Exp.</th><th>Inc. Result.</th><th>Notas</th>
</tr></thead><tbody>`;

      mag.puntos.forEach((p, idx) => {
        const irClass = p.incResultado === 'OK' ? 'ok' : p.incResultado === 'NO OK' ? 'nook' : '';
        let rdgTd = '';
        for (let i = 0; i < n; i++) rdgTd += `<td>${p.rdg[i] !== '' && p.rdg[i] !== null ? esc(String(p.rdg[i])) : '—'}</td>`;
        html += `<tr>
<td>${idx + 1}</td><td>${esc(String(p.nominal ?? '—'))}</td><td>${esc(p.resolucion || '—')}</td><td>${esc(p.unidad)}</td>${rdgTd}
<td>${fmt4(p.promedio)}</td><td>${esc(p.incertScope) || '—'}</td>
<td class="hl">${fmtSig(p.repetibilidad)}</td>
<td class="hl">${p.incertExpandida !== null ? '±' + fmtSig(p.incertExpandida) : '—'}</td>
<td class="${irClass}">${esc(p.incResultado) || '—'}</td>
<td>${esc(p.notas || '')}</td></tr>`;
      });
      html += `</tbody></table>`;
    });
  });

  html += `</body></html>`;
  const win = window.open('', '_blank', 'width=1200,height=800');
  if (!win) { alert('Permite las ventanas emergentes para exportar el PDF.'); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
}

function descargar(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// ─── RENDER PRINCIPAL ─────────────────────────────────────────
function getOpenIds() {
  // Guarda qué equipos y magnitudes están abiertos antes de re-renderizar
  const eqs = [], mags = [];
  document.querySelectorAll('.equipo-body.open').forEach(el => eqs.push(el.id.replace('body-eq-', '')));
  document.querySelectorAll('.magnitud-body.open').forEach(el => mags.push(el.id.replace('body-mag-', '')));
  return { eqs, mags };
}

function render(openHint) {
  const container = document.getElementById('equipos-container');
  const exportGroup = document.getElementById('export-group');

  // Captura el estado abierto ANTES de limpiar el DOM
  const open = openHint || getOpenIds();

  if (state.equipos.length === 0) {
    if (exportGroup) exportGroup.style.display = 'none';
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <h2>Sin equipos registrados</h2>
        <p>Agrega un equipo para comenzar a calcular la incertidumbre de medición.</p>
        <button class="btn btn-primary" onclick="agregarEquipo()">
          + Agregar primer equipo
        </button>
      </div>`;
    return;
  }
  if (exportGroup) exportGroup.style.display = 'flex';
  container.innerHTML = state.equipos.map(renderEquipo).join('');

  // Restaura el estado abierto
  open.eqs.forEach(id => {
    const body = document.getElementById(`body-eq-${id}`);
    const chv  = document.getElementById(`chv-eq-${id}`);
    if (body) { body.classList.add('open'); if (chv) chv.style.transform = 'rotate(90deg)'; }
  });
  open.mags.forEach(id => {
    const body = document.getElementById(`body-mag-${id}`);
    const chv  = document.getElementById(`chv-mag-${id}`);
    if (body) { body.classList.add('open'); if (chv) chv.style.transform = 'rotate(90deg)'; }
  });
}

// ─── RENDER EQUIPO ────────────────────────────────────────────
function renderEquipo(eq) {
  const tagClass = eq.tipoCalibracion === 'Trazable' ? 'tag-trazable'
                 : eq.tipoCalibracion === 'ANAB'     ? 'tag-anab'
                 : 'tag-ema';
  const totalPts = eq.magnitudes.reduce((s, m) => s + m.puntos.length, 0);

  return `
<div class="equipo-card" data-equipo="${eq.id}">
  <div class="equipo-header" onclick="toggleEquipo('${eq.id}')">
    <span class="chevron" id="chv-eq-${eq.id}">&#9654;</span>
    <div class="equipo-title">
      <span>${esc(eq.descripcion) || '<span style="color:#94a3b8;font-weight:400">Equipo sin nombre</span>'}</span>
      <span class="tag ${tagClass}">${eq.tipoCalibracion}</span>
      <span class="pts-count">${totalPts} punto${totalPts !== 1 ? 's' : ''}</span>
    </div>
    <div style="display:flex;gap:6px;align-items:center" onclick="event.stopPropagation()">
      <button class="btn btn-sm btn-outline" onclick="agregarMagnitud('${eq.id}')">+ Magnitud</button>
      <button class="btn btn-sm btn-ghost btn-icon btn-danger" onclick="eliminarEquipo('${eq.id}')" title="Eliminar equipo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
      </button>
    </div>
  </div>
  <div class="equipo-body" id="body-eq-${eq.id}">
    <div class="equipo-fields">
      <div class="field-group">
        <label class="field-label">Descripcion del equipo</label>
        <input class="field-input" value="${esc(eq.descripcion)}" placeholder="Ej: Multimetro Fluke 87V"
          oninput="updateEquipoField('${eq.id}','descripcion',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Tipo de calibracion</label>
        <select class="field-select" onchange="updateEquipoField('${eq.id}','tipoCalibracion',this.value)">
          ${['Trazable','ANAB','EMA'].map(t =>
            `<option value="${t}" ${eq.tipoCalibracion === t ? 'selected' : ''}>${t}</option>`
          ).join('')}
        </select>
      </div>
      <div class="field-group" style="grid-column:span 2">
        <label class="field-label">Notas del equipo</label>
        <input class="field-input" value="${esc(eq.notas)}" placeholder="Observaciones generales..."
          oninput="updateEquipoField('${eq.id}','notas',this.value)">
      </div>
    </div>
    <div class="magnitudes-wrapper">
      ${eq.magnitudes.length === 0
        ? `<div style="padding:12px;text-align:center;color:#94a3b8;font-size:13px">
            Sin magnitudes. Usa el boton <strong>+ Magnitud</strong> para agregar una.
          </div>`
        : eq.magnitudes.map(m => renderMagnitud(m, eq.id, eq.tipoCalibracion)).join('')}
    </div>
  </div>
</div>`;
}

// ─── RENDER MAGNITUD ──────────────────────────────────────────
function renderMagnitud(mag, eqId, tipo) {
  const n = NUM_LECTURAS[tipo];
  const totalPts = mag.puntos.length;

  const rdgHeaders = Array.from({ length: 5 }, (_, i) => {
    const dim = i >= n ? ' style="opacity:.35"' : '';
    return `<th${dim}>Rdg ${i + 1}</th>`;
  }).join('');

  const rows = mag.puntos.map((p, idx) =>
    renderPuntoRow(p, idx + 1, eqId, mag.id, tipo)
  ).join('');

  const emptyRow = totalPts === 0
    ? `<tr><td colspan="16" style="text-align:center;color:#94a3b8;padding:18px;font-size:12px">
        Sin puntos. Usa el boton <strong>+ Agregar punto</strong> para comenzar.
       </td></tr>`
    : '';

  return `
<div class="magnitud-section" data-magnitud="${mag.id}">
  <div class="magnitud-header" onclick="toggleMagnitud('${mag.id}')">
    <span class="chevron" id="chv-mag-${mag.id}">&#9654;</span>
    <input class="magnitud-name-input"
      value="${esc(mag.nombre)}"
      placeholder="Nombre del parametro / magnitud  (Ej: Voltaje DC)"
      oninput="updateMagnitudField('${eqId}','${mag.id}','nombre',this.value)"
      onclick="event.stopPropagation()"
      onfocus="event.stopPropagation()">
    <span class="pts-count">${totalPts} pt${totalPts !== 1 ? 's' : ''}</span>
    <button class="btn btn-xs btn-ghost btn-icon btn-danger"
      onclick="event.stopPropagation();eliminarMagnitud('${eqId}','${mag.id}')"
      title="Eliminar magnitud">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
    </button>
  </div>
  <div class="magnitud-body" id="body-mag-${mag.id}">
    <div class="tabla-wrapper">
      <table class="tabla-puntos">
        <thead><tr>
          <th style="width:30px">#</th>
          <th>Nominal</th>
          <th>Resolución</th>
          <th>Unidad</th>
          ${rdgHeaders}
          <th>uSCOPE</th>
          <th>Promedio</th>
          <th class="col-highlight">Repet.</th>
          <th class="col-highlight">Inc. Exp.</th>
          <th>Inc. Result.</th>
          <th style="min-width:110px">Varianzas Extra</th>
          <th style="min-width:90px">Notas</th>
          <th></th>
        </tr></thead>
        <tbody id="tbody-${mag.id}">${rows}${emptyRow}</tbody>
      </table>
    </div>
    <div class="magnitud-footer">
      <button class="btn btn-sm btn-outline" onclick="agregarPunto('${eqId}','${mag.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar punto
      </button>
    </div>
  </div>
</div>`;
}

// ─── RENDER FILA DE PUNTO ─────────────────────────────────────
function renderPuntoRow(p, idx, eqId, magId, tipo) {
  const n = NUM_LECTURAS[tipo];
  const { step, decimals } = resolFromStr(p.resolucion);
  const stepAttr = step === 'any' ? 'any' : step;

  const rdgInputs = Array.from({ length: 5 }, (_, i) => {
    const dis = i >= n ? 'disabled' : '';
    const val = p.rdg[i] !== null && p.rdg[i] !== '' ? esc(String(p.rdg[i])) : '';
    // title muestra el formato esperado según resolución
    const hint = decimals !== null
      ? `title="Formato: ${decimals > 0 ? '0.' + '0'.repeat(decimals) : '0'} (${decimals} decimal${decimals !== 1 ? 'es' : ''})"` : '';
    return `<td><input class="cell-input" type="number" step="${stepAttr}" value="${val}" ${dis} ${hint}
      oninput="updateRdg('${eqId}','${magId}','${p.id}',${i},this.value,'${stepAttr}',${decimals ?? 'null'})"></td>`;
  }).join('');

  const irBadge = p.incResultado === 'OK'    ? `<span class="badge-ok">OK</span>`
                : p.incResultado === 'NO OK' ? `<span class="badge-nook">NO OK</span>`
                : `<span class="badge-wait">&mdash;</span>`;

  // Varianzas extra (colapsable)
  const varInputs = VARIANZAS_KEYS.map(vk => {
    const val = ((p.varianzas || {})[vk.key]) || '';
    return `<div class="varianza-item">
      <span class="varianza-label">${vk.label}</span>
      <input class="tol-mini-input" style="width:100%" type="number" step="any"
        value="${esc(String(val))}" placeholder="0"
        oninput="updateVarianza('${eqId}','${magId}','${p.id}','${vk.key}',this.value)">
    </div>`;
  }).join('');

  const varCell = `<td>
    <div class="varianzas-toggle" onclick="toggleVarianzas('var-${p.id}',this)">
      <span id="var-chv-${p.id}">&#9654;</span> Varianzas
    </div>
    <div class="varianzas-panel" id="var-${p.id}">
      ${varInputs}
    </div>
  </td>`;

  // Unidad select
  const unidadOpts = GRUPOS_UNIDADES.map(g =>
    `<optgroup label="${esc(g.grupo)}">${g.unidades.map(u =>
      `<option value="${esc(u)}" ${p.unidad === u ? 'selected' : ''}>${esc(u)}</option>`
    ).join('')}</optgroup>`
  ).join('');

  return `<tr data-punto="${p.id}">
    <td style="color:#94a3b8;font-size:11px;font-weight:600">${idx}</td>
    <td><input class="cell-input" type="number" step="any"
      value="${esc(String(p.nominal ?? ''))}" placeholder="Nominal"
      oninput="updatePuntoField('${eqId}','${magId}','${p.id}','nominal',this.value)"></td>
    <td><input class="cell-input" type="text" style="width:72px"
      value="${esc(p.resolucion ?? '')}" placeholder="0.001"
      title="Resolución del equipo para este punto. Define los decimales permitidos en las lecturas."
      oninput="updatePuntoField('${eqId}','${magId}','${p.id}','resolucion',this.value)"></td>
    <td>
      <select class="cell-select"
        onchange="updatePuntoField('${eqId}','${magId}','${p.id}','unidad',this.value)">
        <option value="">—</option>${unidadOpts}
      </select>
    </td>
    ${rdgInputs}
    <td><input class="cell-input scope" type="number" step="any"
      value="${esc(String(p.incertScope ?? ''))}" placeholder="uSCOPE"
      title="Incertidumbre expandida del certificado (k=2). Se divide entre 2 en el calculo."
      oninput="updatePuntoField('${eqId}','${magId}','${p.id}','incertScope',this.value)"></td>
    <td class="cell-result">${fmtPromedio(p.promedio, p.resDecimals ?? null)}</td>
    <td class="cell-result col-highlight highlight">${fmtSig(p.repetibilidad)}</td>
    <td class="cell-result col-highlight highlight">${p.incertExpandida !== null ? '&plusmn;' + fmtSig(p.incertExpandida) : '&mdash;'}</td>
    <td>${irBadge}</td>
    ${varCell}
    <td><input class="cell-input" type="text" style="min-width:80px"
      value="${esc(p.notas || '')}" placeholder="Notas"
      oninput="updatePuntoField('${eqId}','${magId}','${p.id}','notas',this.value)"></td>
    <td>
      <button class="delete-row-btn"
        onclick="eliminarPunto('${eqId}','${magId}','${p.id}')"
        title="Eliminar fila">&times;</button>
    </td>
  </tr>`;
}

// ─── ACCIONES ─────────────────────────────────────────────────
function agregarEquipo() {
  const open = getOpenIds();
  const eq = nuevoEquipo();
  state.equipos.unshift(eq);
  open.eqs.push(eq.id);
  guardar();
  render(open);
}

function eliminarEquipo(id) {
  if (!confirm('¿Eliminar este equipo y todos sus datos?')) return;
  state.equipos = state.equipos.filter(e => e.id !== id);
  guardar(); render();
}

function toggleEquipo(id, forceOpen) {
  const body = document.getElementById(`body-eq-${id}`);
  const chv  = document.getElementById(`chv-eq-${id}`);
  if (!body) return;
  const open = forceOpen !== undefined ? forceOpen : !body.classList.contains('open');
  body.classList.toggle('open', open);
  if (chv) chv.style.transform = open ? 'rotate(90deg)' : '';
}

function updateEquipoField(id, key, value) {
  const eq = state.equipos.find(e => e.id === id);
  if (!eq) return;
  eq[key] = value;
  if (key === 'tipoCalibracion') { guardar(); render(); return; }  // render() captura open state automáticamente
  if (key === 'descripcion') {
    const titleEl = document.querySelector(`[data-equipo="${id}"] .equipo-title > span:first-child`);
    if (titleEl) titleEl.innerHTML = value ? esc(value) : '<span style="color:#94a3b8;font-weight:400">Equipo sin nombre</span>';
  }
  guardar();
}

function agregarMagnitud(eqId) {
  const eq = state.equipos.find(e => e.id === eqId);
  if (!eq) return;
  const open = getOpenIds();
  // Asegurar que el equipo padre quede abierto
  if (!open.eqs.includes(eqId)) open.eqs.push(eqId);
  const mag = nuevaMagnitud();
  eq.magnitudes.push(mag);
  open.mags.push(mag.id);
  guardar();
  render(open);
}

function eliminarMagnitud(eqId, magId) {
  if (!confirm('¿Eliminar esta magnitud y todos sus puntos?')) return;
  const eq = state.equipos.find(e => e.id === eqId);
  if (!eq) return;
  eq.magnitudes = eq.magnitudes.filter(m => m.id !== magId);
  guardar(); render();
}

function toggleMagnitud(id, forceOpen) {
  const body = document.getElementById(`body-mag-${id}`);
  const chv  = document.getElementById(`chv-mag-${id}`);
  if (!body) return;
  const open = forceOpen !== undefined ? forceOpen : !body.classList.contains('open');
  body.classList.toggle('open', open);
  if (chv) chv.style.transform = open ? 'rotate(90deg)' : '';
}

function updateMagnitudField(eqId, magId, key, value) {
  const eq = state.equipos.find(e => e.id === eqId); if (!eq) return;
  const mag = eq.magnitudes.find(m => m.id === magId); if (!mag) return;
  mag[key] = value;
  guardar();
}

function agregarPunto(eqId, magId) {
  const eq = state.equipos.find(e => e.id === eqId); if (!eq) return;
  const mag = eq.magnitudes.find(m => m.id === magId); if (!mag) return;
  const open = getOpenIds();
  // Asegurar que equipo y magnitud padre queden abiertos
  if (!open.eqs.includes(eqId)) open.eqs.push(eqId);
  if (!open.mags.includes(magId)) open.mags.push(magId);
  mag.puntos.push(nuevoPunto());
  guardar();
  render(open);
}

function eliminarPunto(eqId, magId, puntoId) {
  const eq = state.equipos.find(e => e.id === eqId); if (!eq) return;
  const mag = eq.magnitudes.find(m => m.id === magId); if (!mag) return;
  mag.puntos = mag.puntos.filter(p => p.id !== puntoId);
  guardar(); render();
}

function updatePuntoField(eqId, magId, puntoId, key, value) {
  const eq = state.equipos.find(e => e.id === eqId); if (!eq) return;
  const mag = eq.magnitudes.find(m => m.id === magId); if (!mag) return;
  const p = mag.puntos.find(pt => pt.id === puntoId); if (!p) return;
  p[key] = value;
  recalcularPunto(p, eq.tipoCalibracion);
  guardar();
  actualizarCeldasResultado(p);
}

function updateRdg(eqId, magId, puntoId, idx, value, stepAttr, decimals) {
  const eq = state.equipos.find(e => e.id === eqId); if (!eq) return;
  const mag = eq.magnitudes.find(m => m.id === magId); if (!mag) return;
  const p = mag.puntos.find(pt => pt.id === puntoId); if (!p) return;

  // Si hay resolución definida, limitar los decimales permitidos
  if (decimals !== null && decimals !== undefined && value !== '') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      // Truncar/redondear al número de decimales de la resolución
      const factor = Math.pow(10, decimals);
      const rounded = Math.round(num * factor) / factor;
      value = rounded.toFixed(decimals);
      // Actualizar el input en el DOM para mostrar el valor corregido
      const tr = document.querySelector(`[data-punto="${puntoId}"]`);
      if (tr) {
        const inputs = tr.querySelectorAll('td input[type="number"]:not(.scope):not([placeholder="Nominal"])');
        // inputs[0] es resolucion (text, no number), los Rdg son los siguientes inputs number
        const rdgInputs = tr.querySelectorAll('td input[type="number"].cell-input:not([placeholder="Nominal"]):not(.scope)');
        if (rdgInputs[idx]) rdgInputs[idx].value = value;
      }
    }
  }

  p.rdg[idx] = value;
  recalcularPunto(p, eq.tipoCalibracion);
  guardar();
  actualizarCeldasResultado(p);
}

function updateVarianza(eqId, magId, puntoId, vkey, value) {
  const eq = state.equipos.find(e => e.id === eqId); if (!eq) return;
  const mag = eq.magnitudes.find(m => m.id === magId); if (!mag) return;
  const p = mag.puntos.find(pt => pt.id === puntoId); if (!p) return;
  if (!p.varianzas) p.varianzas = {};
  p.varianzas[vkey] = value;
  recalcularPunto(p, eq.tipoCalibracion);
  guardar();
  actualizarCeldasResultado(p);
}

function recalcularPunto(p, tipo) {
  const res = calcularPunto(p, tipo);
  if (!res) return;
  p.promedio        = res.promedio;
  p.resDecimals     = res.resDecimals;
  p.repetibilidad   = res.repetibilidad;
  p.incertExpandida = res.incertExpandida;
  p.incResultado    = res.incResultado;
  p.tolerancia      = res.tolerancia;
  p.desviacion      = res.desviacion;
  p.resultado       = res.resultado;
}
}

// Actualiza solo las celdas de resultado sin re-renderizar la tabla completa
function actualizarCeldasResultado(p) {
  const tr = document.querySelector(`[data-punto="${p.id}"]`);
  if (!tr) return;
  const cells = tr.querySelectorAll('.cell-result');
  if (cells[0]) cells[0].textContent = fmtPromedio(p.promedio, p.resDecimals ?? null);
  if (cells[1]) cells[1].textContent = fmtSig(p.repetibilidad);
  if (cells[2]) cells[2].innerHTML   = p.incertExpandida !== null
    ? '&plusmn;' + fmtSig(p.incertExpandida) : '&mdash;';

  const badge = tr.querySelector('.badge-ok, .badge-nook, .badge-wait');
  if (badge) {
    if (p.incResultado === 'OK') {
      badge.className = 'badge-ok'; badge.textContent = 'OK';
    } else if (p.incResultado === 'NO OK') {
      badge.className = 'badge-nook'; badge.textContent = 'NO OK';
    } else {
      badge.className = 'badge-wait'; badge.innerHTML = '&mdash;';
    }
  }

  // Actualizar tolerancia calculada
  const tolResult = tr.querySelector('.tol-result');
  if (tolResult) {
    tolResult.innerHTML = p.tolerancia !== null
      ? `= &plusmn;${p.tolerancia.toFixed(4)}` : '';
  }
}

function toggleVarianzas(id, toggle) {
  const panel = document.getElementById(id);
  const chv   = toggle ? toggle.querySelector('span') : null;
  if (!panel) return;
  const open = !panel.classList.contains('open');
  if (open) {
    panel.style.display = 'grid';
    panel.classList.add('open');
  } else {
    panel.style.display = 'none';
    panel.classList.remove('open');
  }
  if (chv) chv.style.transform = open ? 'rotate(90deg)' : '';
}

function limpiarTodo() {
  if (!confirm('¿Eliminar TODOS los equipos y datos? Esta accion no se puede deshacer.')) return;
  state.equipos = [];
  guardar(); render();
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargar();
  render();
});
