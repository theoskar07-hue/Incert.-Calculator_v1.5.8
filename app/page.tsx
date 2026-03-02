'use client'

import { useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────
   CSS idéntico al docs/styles.css
───────────────────────────────────────────────────────────── */
const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:#f4f6f9; --surface:#ffffff; --border:#dde2ea;
  --primary:#2563eb; --primary-lt:#eff4ff; --primary-dim:#93b4fa;
  --text:#1a2233; --muted:#64748b;
  --success-bg:#d1fae5; --success-fg:#065f46;
  --danger-bg:#fee2e2;  --danger-fg:#991b1b;
  --radius:6px; --shadow:0 1px 4px rgba(0,0,0,.08);
  --font:'Inter',system-ui,sans-serif;
  --mono:'JetBrains Mono','Fira Mono',monospace;
}
body { background:var(--bg); color:var(--text); font-family:var(--font); font-size:14px; line-height:1.5; min-height:100vh; display:flex; flex-direction:column; }
.app-main { flex:1; }
.app-footer { text-align:center; font-size:11px; color:var(--muted); padding:13px 24px; background:var(--surface); border-top:2px solid var(--primary-lt); margin-top:40px; letter-spacing:0.03em; position:sticky; bottom:0; z-index:90; display:flex; align-items:center; justify-content:center; gap:8px; }
.app-footer::before,.app-footer::after { content:''; display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--primary); opacity:0.5; flex-shrink:0; }

/* Header */
.app-header { background:var(--surface); border-bottom:1px solid var(--border); padding:0 24px; height:54px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow:var(--shadow); }
.header-brand { display:flex; align-items:center; gap:10px; color:var(--primary); }
.header-title { font-size:15px; font-weight:700; color:var(--primary); line-height:1.2; }
.header-sub { font-size:11px; color:var(--muted); }
.header-actions { display:flex; align-items:center; gap:8px; }
.export-group { display:flex; align-items:center; gap:6px; border-right:1px solid var(--border); padding-right:10px; margin-right:2px; }

/* Main */
.app-main { max-width:1700px; margin:0 auto; padding:20px 16px; display:flex; flex-direction:column; gap:16px; }

/* Buttons */
.btn { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:var(--radius); border:1px solid transparent; font-size:13px; font-weight:500; cursor:pointer; transition:background .15s,border-color .15s,opacity .15s; white-space:nowrap; font-family:var(--font); line-height:1.4; }
.btn:disabled { opacity:.4; cursor:not-allowed; }
.btn-primary { background:var(--primary); color:#fff; border-color:var(--primary); }
.btn-primary:hover:not(:disabled) { background:#1d4ed8; }
.btn-outline { background:#fff; color:var(--text); border-color:var(--border); }
.btn-outline:hover:not(:disabled) { background:var(--bg); }
.btn-ghost { background:transparent; color:var(--muted); border-color:transparent; }
.btn-ghost:hover:not(:disabled) { background:var(--bg); color:var(--text); }
.btn-sm { padding:4px 10px; font-size:12px; }
.btn-xs { padding:2px 7px; font-size:11px; }
.btn-icon { padding:4px 6px; }
.btn-danger { color:#dc2626; }
.btn-danger:hover:not(:disabled) { background:var(--danger-bg); }

/* Equipo */
.equipo-card { background:var(--surface); border:1px solid var(--border); border-radius:8px; box-shadow:var(--shadow); overflow:hidden; }
.equipo-header { display:flex; align-items:center; gap:10px; padding:10px 16px; background:var(--bg); border-bottom:1px solid var(--border); cursor:pointer; user-select:none; }
.equipo-header:hover { background:#edf0f5; }
.equipo-title { font-size:14px; font-weight:600; flex:1; display:flex; align-items:center; gap:10px; min-width:0; }
.equipo-body { display:none; }
.equipo-body.open { display:block; }
.equipo-fields { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; padding:16px; border-bottom:1px solid var(--border); }
.field-group { display:flex; flex-direction:column; gap:4px; }
.field-label { font-size:11px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; }
.field-input,.field-select,.field-textarea { border:1px solid var(--border); border-radius:var(--radius); padding:6px 10px; font-size:13px; font-family:var(--font); color:var(--text); background:var(--surface); outline:none; transition:border-color .15s,box-shadow .15s; }
.field-input:focus,.field-select:focus { border-color:var(--primary); box-shadow:0 0 0 2px rgba(37,99,235,.12); }

/* Magnitud */
.magnitudes-wrapper { padding:12px 12px 4px 12px; display:flex; flex-direction:column; gap:8px; background:var(--surface); }
.magnitud-section { border:1px solid #c7d8fa; border-radius:6px; overflow:hidden; margin-bottom:4px; }
.magnitud-header { display:flex; align-items:center; gap:8px; padding:7px 14px; background:#eef3fd; border-bottom:1px solid #c7d8fa; cursor:pointer; user-select:none; border-left:3px solid var(--primary); }
.magnitud-header:hover { background:#e0eafc; }
.magnitud-name-input { border:none; background:transparent; font-size:13px; font-weight:600; color:var(--text); flex:1; outline:none; padding:2px 4px; border-radius:4px; min-width:0; }
.magnitud-name-input:focus { background:var(--surface); box-shadow:0 0 0 2px rgba(37,99,235,.15); }
.magnitud-body { display:none; }
.magnitud-body.open { display:block; }
.magnitud-footer { display:flex; align-items:center; justify-content:flex-end; gap:8px; padding:8px 16px; border-top:1px solid var(--border); background:#fafbfc; }

/* Tabla */
.tabla-wrapper { overflow-x:auto; width:100%; }
.tabla-puntos { width:max-content; min-width:100%; border-collapse:collapse; font-size:12px; }
.tabla-puntos th { background:#f1f5f9; color:var(--muted); font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.04em; padding:6px 8px; text-align:center; border-bottom:2px solid var(--border); border-right:1px solid var(--border); white-space:nowrap; }
.tabla-puntos th:last-child { border-right:none; }
.tabla-puntos th.col-highlight { color:var(--primary); background:var(--primary-lt); font-weight:700; }
.tabla-puntos td { padding:4px 6px; border-bottom:1px solid var(--border); border-right:1px solid #eef0f3; vertical-align:middle; text-align:center; }
.tabla-puntos td:last-child { border-right:none; }
.tabla-puntos tr:hover td { background:#f8fafc; }
.cell-input { width:100%; min-width:72px; border:1px solid transparent; border-radius:4px; padding:3px 6px; font-size:12px; font-family:var(--mono); text-align:right; background:transparent; outline:none; color:var(--text); transition:border-color .12s,background .12s; }
.cell-input:focus { border-color:var(--primary); background:#fff; box-shadow:0 0 0 2px rgba(37,99,235,.1); }
.cell-input:disabled { opacity:.3; cursor:not-allowed; }
.cell-input.scope { min-width:80px; }
.cell-select { width:100%; min-width:80px; border:1px solid transparent; border-radius:4px; padding:3px 4px; font-size:12px; background:transparent; outline:none; color:var(--text); cursor:pointer; font-family:var(--font); }
.cell-select:focus { border-color:var(--primary); background:#fff; }
.cell-result { font-family:var(--mono); font-size:12px; color:var(--text); white-space:nowrap; }
.cell-result.highlight { font-weight:700; color:var(--primary); background:var(--primary-lt); }

/* Badges */
.badge-ok   { background:var(--success-bg); color:var(--success-fg); padding:2px 8px; border-radius:20px; font-size:11px; font-weight:700; display:inline-block; }
.badge-nook { background:var(--danger-bg);  color:var(--danger-fg);  padding:2px 8px; border-radius:20px; font-size:11px; font-weight:700; display:inline-block; }
.badge-wait { background:#f1f5f9; color:var(--muted); padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; display:inline-block; }
.tag        { font-size:11px; padding:2px 8px; border-radius:20px; font-weight:600; }
.tag-trazable { background:#dbeafe; color:#1e40af; }
.tag-anab     { background:#f0fdf4; color:#166534; }
.tag-ema      { background:#fef9c3; color:#854d0e; }
.pts-count    { font-size:11px; color:var(--muted); }
.chevron      { transition:transform .2s; display:inline-block; font-style:normal; font-size:10px; }
.delete-row-btn { background:none; border:none; cursor:pointer; color:var(--muted); padding:2px 5px; border-radius:4px; font-size:13px; line-height:1; transition:color .12s,background .12s; }
.delete-row-btn:hover { color:#dc2626; background:var(--danger-bg); }

/* Varianzas */
.varianzas-toggle { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--muted); cursor:pointer; user-select:none; padding:4px 0; }
.varianzas-toggle:hover { color:var(--primary); }
.varianzas-panel { display:none; grid-template-columns:1fr 1fr; gap:6px; padding:8px; background:#f8fafc; border-top:1px solid var(--border); }
.varianza-item { display:flex; flex-direction:column; gap:3px; }
.varianza-label { font-size:10px; color:var(--muted); font-weight:600; }
.tol-mini-input { width:68px; border:1px solid var(--border); border-radius:4px; padding:2px 5px; font-size:11px; font-family:var(--mono); text-align:right; outline:none; background:var(--surface); }
.tol-mini-input:focus { border-color:var(--primary); box-shadow:0 0 0 2px rgba(37,99,235,.1); }

/* Empty */
.empty-state { text-align:center; padding:72px 20px; color:var(--muted); }
.empty-state svg { opacity:.25; margin-bottom:16px; }
.empty-state h2 { font-size:18px; font-weight:600; margin-bottom:6px; color:var(--text); }
.empty-state p { font-size:14px; max-width:400px; margin:0 auto 20px; line-height:1.6; }

/* Formulas */
.formulas-banner { background:var(--surface); border:1px solid var(--border); border-radius:8px; overflow:hidden; }
.formulas-summary { padding:10px 16px; cursor:pointer; font-size:12px; font-weight:600; color:var(--primary); background:var(--primary-lt); border-bottom:1px solid #c7d8fa; list-style:none; display:flex; align-items:center; gap:6px; user-select:none; }
.formulas-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:12px; padding:16px; font-size:12px; }
.formula-item { background:#f8fafc; border:1px solid var(--border); border-radius:6px; padding:10px 12px; }
.formula-title { font-weight:700; margin-bottom:4px; color:#1e40af; font-size:11px; text-transform:uppercase; letter-spacing:.03em; }
.formula-code { font-family:var(--mono); font-size:12px; }
.formula-note { color:var(--muted); font-size:10px; margin-top:3px; }

@media print {
  .app-header,.header-actions,.btn,.delete-row-btn,.magnitud-footer,.varianzas-toggle,.formulas-banner { display:none !important; }
  body { background:#fff; font-size:11px; }
  .equipo-card { box-shadow:none; border:1px solid #ccc; }
  .tabla-puntos { font-size:9px; }
  .equipo-body,.magnitud-body { display:block !important; }
}
`

/* ─────────────────────────────────────────────────────────────
   JS idéntico al docs/app.js (inlined)
───────────────────────────────────────────────────────────── */
const JS = `
'use strict';
const NUM_LECTURAS = { Trazable:3, ANAB:5, EMA:5 };
const GRUPOS_UNIDADES = [
  { grupo:'Voltaje',       unidades:['mV','V','kV'] },
  { grupo:'Corriente',     unidades:['µA','mA','A'] },
  { grupo:'Resistencia',   unidades:['mΩ','Ω','kΩ','MΩ','GΩ'] },
  { grupo:'Presión',       unidades:['Pa','kPa','MPa','bar','mbar','PSI','mmHg','inH2O','inWC','cmH2O'] },
  { grupo:'Temperatura',   unidades:['°C','°F','K'] },
  { grupo:'Humedad',       unidades:['%RH'] },
  { grupo:'Fuerza/Torque', unidades:['N','kN','lb.f','kgf','gf','in.lb','N·m'] },
  { grupo:'Masa',          unidades:['mg','g','kg','lb','oz','t'] },
  { grupo:'Volumen',       unidades:['µL','mL','L'] },
  { grupo:'Longitud',      unidades:['µm','mm','cm','m','in'] },
  { grupo:'Frecuencia',    unidades:['Hz','kHz','MHz'] },
  { grupo:'Tiempo',        unidades:['ms','s','min','h'] },
  { grupo:'Velocidad',     unidades:['rpm','m/s','km/h'] },
  { grupo:'Flujo',         unidades:['L/min','L/h','m³/h','GPM','SCFM'] },
  { grupo:'Otro',          unidades:['%','ppm','ppb','dB','lux','cd'] },
];
const VARIANZAS_KEYS = [
  { key:'resolucion',    label:'Resolución (÷√12)',   div:Math.sqrt(12) },
  { key:'excentricidad', label:'Excentricidad (÷√3)', div:Math.sqrt(3)  },
  { key:'deriva',        label:'Deriva (÷√3)',         div:Math.sqrt(3)  },
  { key:'rr',            label:'R&R (÷√3)',            div:Math.sqrt(3)  },
  { key:'sensibilidad',  label:'Sensibilidad (÷√3)',   div:Math.sqrt(3)  },
  { key:'temperatura',   label:'Temperatura (÷√3)',    div:Math.sqrt(3)  },
  { key:'densidad',      label:'Densidad (÷√3)',       div:Math.sqrt(3)  },
  { key:'flotabilidad',  label:'Flotabilidad (÷√3)',   div:Math.sqrt(3)  },
];
let state = { equipos:[] };
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2); }
function nuevoEquipo(){ return { id:uid(), fechaCreacion:new Date().toLocaleString('es-MX'), descripcion:'', tipoCalibracion:'Trazable', resolucion:'', notas:'', magnitudes:[] }; }
function nuevaMagnitud(){ return { id:uid(), nombre:'', puntos:[] }; }
function nuevoPunto(){ return { id:uid(), nominal:'', unidad:'', rdg:['','','','',''], incertScope:'', varianzas:{}, notas:'', promedio:null, repetibilidad:null, incertExpandida:null, incResultado:null, tolerancia:null, desviacion:null, resultado:null }; }
function cargar(){ try{ const r=localStorage.getItem('incert_equipos_v4'); if(r) state.equipos=JSON.parse(r); }catch(_){ state.equipos=[]; } }
function guardar(){ try{ localStorage.setItem('incert_equipos_v4',JSON.stringify(state.equipos)); }catch(_){} }
function cifrasSig(num,sig){ sig=sig||2; if(!isFinite(num)||num===0) return 0; const exp=Math.floor(Math.log10(Math.abs(num))); const factor=Math.pow(10,sig-1-exp); return Math.round(num*factor)/factor; }
function fmtSig(num){ if(num===null||num===undefined||!isFinite(num)) return '—'; return cifrasSig(num,2).toString(); }
function fmt4(num){ if(num===null||num===undefined||!isFinite(num)) return '—'; return parseFloat(num).toFixed(4); }
function esc(s){ return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function calcVarianzasExtra(v){ return VARIANZAS_KEYS.reduce((sum,vk)=>{ const val=parseFloat((v||{})[vk.key]); if(!isNaN(val)&&val>0){ const u=val/vk.div; return sum+u*u; } return sum; },0); }
function calcularPunto(p,tipo){
  const n=NUM_LECTURAS[tipo];
  const lecturas=p.rdg.slice(0,n).map(r=>parseFloat(r)).filter(r=>!isNaN(r));
  if(lecturas.length<n) return null;
  if(p.nominal===''||p.nominal===null||isNaN(parseFloat(p.nominal))) return null;
  const nom=parseFloat(p.nominal);
  const prom=lecturas.reduce((a,b)=>a+b,0)/n;
  const varianza=lecturas.reduce((s,v)=>s+Math.pow(v-prom,2),0)/(n-1);
  const s=Math.sqrt(varianza);
  const uA=s/Math.sqrt(n);
  const scopeVal=parseFloat(p.incertScope);
  const uScope=(!isNaN(scopeVal)&&scopeVal>0)?scopeVal/2:0;
  const varExtra=calcVarianzasExtra(p.varianzas);
  const uc=Math.sqrt(uA*uA+uScope*uScope+varExtra);
  const uExpFinal=cifrasSig(uc*2,2);
  const desv=nom-prom;
  const incResultado=(!isNaN(scopeVal)&&scopeVal>0)?(uExpFinal<=scopeVal?'OK':'NO OK'):null;
  return { promedio:prom, repetibilidad:cifrasSig(s,2), incertExpandida:uExpFinal, incResultado, desviacion:desv, resultado:null };
}
function getOpenIds(){
  const eqs=[],mags=[];
  document.querySelectorAll('.equipo-body.open').forEach(el=>eqs.push(el.id.replace('body-eq-','')));
  document.querySelectorAll('.magnitud-body.open').forEach(el=>mags.push(el.id.replace('body-mag-','')));
  return {eqs,mags};
}
function render(openHint){
  const container=document.getElementById('equipos-container');
  const exportGroup=document.getElementById('export-group');
  const open=openHint||getOpenIds();
  if(state.equipos.length===0){
    if(exportGroup) exportGroup.style.display='none';
    container.innerHTML='<div class="empty-state"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg><h2>Sin equipos registrados</h2><p>Agrega un equipo para comenzar a calcular la incertidumbre de medición.</p><button class="btn btn-primary" onclick="agregarEquipo()">+ Agregar primer equipo</button></div>';
    return;
  }
  if(exportGroup) exportGroup.style.display='flex';
  container.innerHTML=state.equipos.map(renderEquipo).join('');
  open.eqs.forEach(id=>{ const b=document.getElementById('body-eq-'+id),c=document.getElementById('chv-eq-'+id); if(b){ b.classList.add('open'); if(c) c.style.transform='rotate(90deg)'; } });
  open.mags.forEach(id=>{ const b=document.getElementById('body-mag-'+id),c=document.getElementById('chv-mag-'+id); if(b){ b.classList.add('open'); if(c) c.style.transform='rotate(90deg)'; } });
}
function renderEquipo(eq){
  const tagClass=eq.tipoCalibracion==='Trazable'?'tag-trazable':eq.tipoCalibracion==='ANAB'?'tag-anab':'tag-ema';
  const totalPts=eq.magnitudes.reduce((s,m)=>s+m.puntos.length,0);
  return '<div class="equipo-card" data-equipo="'+eq.id+'"><div class="equipo-header" onclick="toggleEquipo(\''+eq.id+'\')"><span class="chevron" id="chv-eq-'+eq.id+'">&#9654;</span><div class="equipo-title"><span>'+(esc(eq.descripcion)||'<span style="color:#94a3b8;font-weight:400">Equipo sin nombre</span>')+'</span><span class="tag '+tagClass+'">'+eq.tipoCalibracion+'</span><span class="pts-count">'+totalPts+' punto'+(totalPts!==1?'s':'')+'</span></div><div style="display:flex;gap:6px;align-items:center" onclick="event.stopPropagation()"><button class="btn btn-sm btn-outline" onclick="agregarMagnitud(\''+eq.id+'\')">+ Magnitud</button><button class="btn btn-sm btn-ghost btn-icon btn-danger" onclick="eliminarEquipo(\''+eq.id+'\')" title="Eliminar equipo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button></div></div>'
    +'<div class="equipo-body" id="body-eq-'+eq.id+'">'
    +'<div class="equipo-fields">'
    +'<div class="field-group"><label class="field-label">Descripcion del equipo</label><input class="field-input" value="'+esc(eq.descripcion)+'" placeholder="Ej: Multimetro Fluke 87V" oninput="updateEquipoField(\''+eq.id+'\',\'descripcion\',this.value)"></div>'
    +'<div class="field-group"><label class="field-label">Tipo de calibracion</label><select class="field-select" onchange="updateEquipoField(\''+eq.id+'\',\'tipoCalibracion\',this.value)">'+['Trazable','ANAB','EMA'].map(t=>'<option value="'+t+'" '+(eq.tipoCalibracion===t?'selected':'')+'>'+t+'</option>').join('')+'</select></div>'
    +'<div class="field-group"><label class="field-label">Resolucion</label><input class="field-input" value="'+esc(eq.resolucion)+'" placeholder="Ej: 0.001" oninput="updateEquipoField(\''+eq.id+'\',\'resolucion\',this.value)"></div>'
    +'<div class="field-group" style="grid-column:span 2"><label class="field-label">Notas del equipo</label><input class="field-input" value="'+esc(eq.notas)+'" placeholder="Observaciones generales..." oninput="updateEquipoField(\''+eq.id+'\',\'notas\',this.value)"></div>'
    +'</div>'
    +'<div class="magnitudes-wrapper">'
    +(eq.magnitudes.length===0?'<div style="padding:12px;text-align:center;color:#94a3b8;font-size:13px">Sin magnitudes. Usa el boton <strong>+ Magnitud</strong> para agregar una.</div>'
      :eq.magnitudes.map(m=>renderMagnitud(m,eq.id,eq.tipoCalibracion)).join(''))
    +'</div></div></div>';
}
function renderMagnitud(mag,eqId,tipo){
  const n=NUM_LECTURAS[tipo];
  const rdgHeaders=Array.from({length:5},(_,i)=>'<th'+(i>=n?' style="opacity:.35"':'')+'>Rdg '+(i+1)+'</th>').join('');
  const rows=mag.puntos.map((p,idx)=>renderPuntoRow(p,idx+1,eqId,mag.id,tipo)).join('');
  const emptyRow=mag.puntos.length===0?'<tr><td colspan="12" style="text-align:center;color:#94a3b8;padding:18px;font-size:12px">Sin puntos. Usa el boton <strong>+ Agregar punto</strong> para comenzar.</td></tr>':'';
  return '<div class="magnitud-section" data-magnitud="'+mag.id+'">'
    +'<div class="magnitud-header" onclick="toggleMagnitud(\''+mag.id+'\')">'
    +'<span class="chevron" id="chv-mag-'+mag.id+'">&#9654;</span>'
    +'<input class="magnitud-name-input" value="'+esc(mag.nombre)+'" placeholder="Nombre del parametro / magnitud  (Ej: Voltaje DC)" oninput="updateMagnitudField(\''+eqId+'\',\''+mag.id+'\',\'nombre\',this.value)" onclick="event.stopPropagation()" onfocus="event.stopPropagation()">'
    +'<span class="pts-count">'+mag.puntos.length+' pt'+(mag.puntos.length!==1?'s':'')+'</span>'
    +'<button class="btn btn-xs btn-ghost btn-icon btn-danger" onclick="event.stopPropagation();eliminarMagnitud(\''+eqId+'\',\''+mag.id+'\')" title="Eliminar magnitud"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>'
    +'</div>'
    +'<div class="magnitud-body" id="body-mag-'+mag.id+'">'
    +'<div class="tabla-wrapper"><table class="tabla-puntos"><thead><tr>'
    +'<th style="width:30px">#</th><th>Nominal</th><th>Unidad</th>'+rdgHeaders
    +'<th>uSCOPE</th><th>Promedio</th><th class="col-highlight">Repet.</th><th class="col-highlight">Inc. Exp.</th><th>Inc. Result.</th><th style="min-width:110px">Varianzas Extra</th><th style="min-width:90px">Notas</th><th></th>'
    +'</tr></thead><tbody id="tbody-'+mag.id+'">'+rows+emptyRow+'</tbody></table></div>'
    +'<div class="magnitud-footer"><button class="btn btn-sm btn-outline" onclick="agregarPunto(\''+eqId+'\',\''+mag.id+'\')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Agregar punto</button></div>'
    +'</div></div>';
}
function renderPuntoRow(p,idx,eqId,magId,tipo){
  const n=NUM_LECTURAS[tipo];
  const rdgInputs=Array.from({length:5},(_,i)=>{
    const dis=i>=n?'disabled':''; const val=p.rdg[i]!==null&&p.rdg[i]!==''?esc(String(p.rdg[i])):'';
    return '<td><input class="cell-input" type="number" step="any" value="'+val+'" '+dis+' oninput="updateRdg(\''+eqId+'\',\''+magId+'\',\''+p.id+'\','+i+',this.value)"></td>';
  }).join('');
  const irBadge=p.incResultado==='OK'?'<span class="badge-ok">OK</span>':p.incResultado==='NO OK'?'<span class="badge-nook">NO OK</span>':'<span class="badge-wait">&mdash;</span>';
  const varInputs=VARIANZAS_KEYS.map(vk=>{
    const val=((p.varianzas||{})[vk.key])||'';
    return '<div class="varianza-item"><span class="varianza-label">'+vk.label+'</span><input class="tol-mini-input" style="width:100%" type="number" step="any" value="'+esc(String(val))+'" placeholder="0" oninput="updateVarianza(\''+eqId+'\',\''+magId+'\',\''+p.id+'\',\''+vk.key+'\',this.value)"></div>';
  }).join('');
  const varCell='<td><div class="varianzas-toggle" onclick="toggleVarianzas(\'var-'+p.id+'\',this)"><span id="var-chv-'+p.id+'">&#9654;</span> Varianzas</div><div class="varianzas-panel" id="var-'+p.id+'">'+varInputs+'</div></td>';
  const unidadOpts=GRUPOS_UNIDADES.map(g=>'<optgroup label="'+esc(g.grupo)+'">'+g.unidades.map(u=>'<option value="'+esc(u)+'" '+(p.unidad===u?'selected':'')+'>'+esc(u)+'</option>').join('')+'</optgroup>').join('');
  return '<tr data-punto="'+p.id+'">'
    +'<td style="color:#94a3b8;font-size:11px;font-weight:600">'+idx+'</td>'
    +'<td><input class="cell-input" type="number" step="any" value="'+esc(String(p.nominal??''))+'" placeholder="Nominal" oninput="updatePuntoField(\''+eqId+'\',\''+magId+'\',\''+p.id+'\',\'nominal\',this.value)"></td>'
    +'<td><select class="cell-select" onchange="updatePuntoField(\''+eqId+'\',\''+magId+'\',\''+p.id+'\',\'unidad\',this.value)"><option value="">—</option>'+unidadOpts+'</select></td>'
    +rdgInputs
    +'<td><input class="cell-input scope" type="number" step="any" value="'+esc(String(p.incertScope??''))+'" placeholder="uSCOPE" oninput="updatePuntoField(\''+eqId+'\',\''+magId+'\',\''+p.id+'\',\'incertScope\',this.value)"></td>'
    +'<td class="cell-result">'+fmt4(p.promedio)+'</td>'
    +'<td class="cell-result col-highlight highlight">'+fmtSig(p.repetibilidad)+'</td>'
    +'<td class="cell-result col-highlight highlight">'+(p.incertExpandida!==null?'&plusmn;'+fmtSig(p.incertExpandida):'&mdash;')+'</td>'
    +'<td>'+irBadge+'</td>'
    +varCell
    +'<td><input class="cell-input" type="text" style="min-width:80px" value="'+esc(p.notas||'')+'" placeholder="Notas" oninput="updatePuntoField(\''+eqId+'\',\''+magId+'\',\''+p.id+'\',\'notas\',this.value)"></td>'
    +'<td><button class="delete-row-btn" onclick="eliminarPunto(\''+eqId+'\',\''+magId+'\',\''+p.id+'\')" title="Eliminar fila">&times;</button></td>'
    +'</tr>';
}
function agregarEquipo(){ const open=getOpenIds(); const eq=nuevoEquipo(); state.equipos.unshift(eq); open.eqs.push(eq.id); guardar(); render(open); }
function eliminarEquipo(id){ if(!confirm('¿Eliminar este equipo y todos sus datos?')) return; state.equipos=state.equipos.filter(e=>e.id!==id); guardar(); render(); }
function toggleEquipo(id,forceOpen){ const body=document.getElementById('body-eq-'+id); const chv=document.getElementById('chv-eq-'+id); if(!body) return; const open=forceOpen!==undefined?forceOpen:!body.classList.contains('open'); body.classList.toggle('open',open); if(chv) chv.style.transform=open?'rotate(90deg)':''; }
function updateEquipoField(id,key,value){ const eq=state.equipos.find(e=>e.id===id); if(!eq) return; eq[key]=value; if(key==='tipoCalibracion'){ guardar(); render(); return; } if(key==='descripcion'){ const el=document.querySelector('[data-equipo="'+id+'"] .equipo-title > span:first-child'); if(el) el.innerHTML=value?esc(value):'<span style="color:#94a3b8;font-weight:400">Equipo sin nombre</span>'; } guardar(); }
function agregarMagnitud(eqId){ const eq=state.equipos.find(e=>e.id===eqId); if(!eq) return; const open=getOpenIds(); if(!open.eqs.includes(eqId)) open.eqs.push(eqId); const mag=nuevaMagnitud(); eq.magnitudes.push(mag); open.mags.push(mag.id); guardar(); render(open); }
function eliminarMagnitud(eqId,magId){ if(!confirm('¿Eliminar esta magnitud y todos sus puntos?')) return; const eq=state.equipos.find(e=>e.id===eqId); if(!eq) return; eq.magnitudes=eq.magnitudes.filter(m=>m.id!==magId); guardar(); render(); }
function toggleMagnitud(id,forceOpen){ const body=document.getElementById('body-mag-'+id); const chv=document.getElementById('chv-mag-'+id); if(!body) return; const open=forceOpen!==undefined?forceOpen:!body.classList.contains('open'); body.classList.toggle('open',open); if(chv) chv.style.transform=open?'rotate(90deg)':''; }
function updateMagnitudField(eqId,magId,key,value){ const eq=state.equipos.find(e=>e.id===eqId); if(!eq) return; const mag=eq.magnitudes.find(m=>m.id===magId); if(!mag) return; mag[key]=value; guardar(); }
function agregarPunto(eqId,magId){ const eq=state.equipos.find(e=>e.id===eqId); if(!eq) return; const mag=eq.magnitudes.find(m=>m.id===magId); if(!mag) return; const open=getOpenIds(); if(!open.eqs.includes(eqId)) open.eqs.push(eqId); if(!open.mags.includes(magId)) open.mags.push(magId); mag.puntos.push(nuevoPunto()); guardar(); render(open); }
function eliminarPunto(eqId,magId,puntoId){ const eq=state.equipos.find(e=>e.id===eqId); if(!eq) return; const mag=eq.magnitudes.find(m=>m.id===magId); if(!mag) return; mag.puntos=mag.puntos.filter(p=>p.id!==puntoId); guardar(); render(); }
function updatePuntoField(eqId,magId,puntoId,key,value){ const eq=state.equipos.find(e=>e.id===eqId); if(!eq) return; const mag=eq.magnitudes.find(m=>m.id===magId); if(!mag) return; const p=mag.puntos.find(pt=>pt.id===puntoId); if(!p) return; p[key]=value; recalcularPunto(p,eq.tipoCalibracion); guardar(); actualizarCeldasResultado(p); }
function updateRdg(eqId,magId,puntoId,idx,value){ const eq=state.equipos.find(e=>e.id===eqId); if(!eq) return; const mag=eq.magnitudes.find(m=>m.id===magId); if(!mag) return; const p=mag.puntos.find(pt=>pt.id===puntoId); if(!p) return; p.rdg[idx]=value; recalcularPunto(p,eq.tipoCalibracion); guardar(); actualizarCeldasResultado(p); }
function updateVarianza(eqId,magId,puntoId,vkey,value){ const eq=state.equipos.find(e=>e.id===eqId); if(!eq) return; const mag=eq.magnitudes.find(m=>m.id===magId); if(!mag) return; const p=mag.puntos.find(pt=>pt.id===puntoId); if(!p) return; if(!p.varianzas) p.varianzas={}; p.varianzas[vkey]=value; recalcularPunto(p,eq.tipoCalibracion); guardar(); actualizarCeldasResultado(p); }
function recalcularPunto(p,tipo){ const res=calcularPunto(p,tipo); if(res){ p.promedio=res.promedio; p.repetibilidad=res.repetibilidad; p.incertExpandida=res.incertExpandida; p.incResultado=res.incResultado; p.tolerancia=res.tolerancia; p.desviacion=res.desviacion; p.resultado=res.resultado; } else { p.promedio=p.repetibilidad=p.incertExpandida=p.incResultado=p.tolerancia=p.desviacion=p.resultado=null; } }
function actualizarCeldasResultado(p){ const tr=document.querySelector('[data-punto="'+p.id+'"]'); if(!tr) return; const cells=tr.querySelectorAll('.cell-result'); if(cells[0]) cells[0].textContent=fmt4(p.promedio); if(cells[1]) cells[1].textContent=fmtSig(p.repetibilidad); if(cells[2]) cells[2].innerHTML=p.incertExpandida!==null?'&plusmn;'+fmtSig(p.incertExpandida):'&mdash;'; const badge=tr.querySelector('.badge-ok,.badge-nook,.badge-wait'); if(badge){ if(p.incResultado==='OK'){ badge.className='badge-ok'; badge.textContent='OK'; } else if(p.incResultado==='NO OK'){ badge.className='badge-nook'; badge.textContent='NO OK'; } else { badge.className='badge-wait'; badge.innerHTML='&mdash;'; } } }
function toggleVarianzas(id,toggle){ const panel=document.getElementById(id); const chv=toggle?toggle.querySelector('span'):null; if(!panel) return; const open=!panel.classList.contains('open'); if(open){ panel.style.display='grid'; panel.classList.add('open'); } else { panel.style.display='none'; panel.classList.remove('open'); } if(chv) chv.style.transform=open?'rotate(90deg)':''; }
function exportarCSV(){ const cols=['Equipo','Tipo','Magnitud','Nominal','Unidad','Rdg1','Rdg2','Rdg3','Rdg4','Rdg5','Promedio','Repetibilidad','Inc.Exp.','uScope','Inc.Result.','Notas']; const rows=[cols]; state.equipos.forEach(eq=>{ eq.magnitudes.forEach(mag=>{ mag.puntos.forEach(p=>{ rows.push([eq.descripcion,eq.tipoCalibracion,mag.nombre,p.nominal,p.unidad,p.rdg[0],p.rdg[1],p.rdg[2],p.rdg[3],p.rdg[4],fmt4(p.promedio),fmtSig(p.repetibilidad),fmtSig(p.incertExpandida),p.incertScope,p.incResultado||'—',p.notas||'']); }); }); }); const csv=rows.map(r=>r.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(',')).join('\\n'); descargar(csv,'incertidumbre.csv','text/csv;charset=utf-8;'); }
function exportarXLS(){ if(typeof XLSX==='undefined'){alert('La librería de Excel aún está cargando. Intenta de nuevo.');return;} const toNum=v=>{const n=parseFloat(v);return(!isNaN(n)&&v!==''&&v!==null&&v!==undefined&&v!=='—')?n:(v??'');}; const headers=['Equipo','Tipo Calibración','Magnitud','Nominal','Resolución','Unidad','Rdg1','Rdg2','Rdg3','Rdg4','Rdg5','Promedio','Repetibilidad','Inc. Exp.','uScope','Inc. Result.','Notas']; const data=[headers]; state.equipos.forEach(eq=>{ eq.magnitudes.forEach(mag=>{ mag.puntos.forEach(p=>{ data.push([eq.descripcion||'',eq.tipoCalibracion,mag.nombre||'',toNum(p.nominal),p.resolucion||'',p.unidad||'',toNum(p.rdg[0]),toNum(p.rdg[1]),toNum(p.rdg[2]),toNum(p.rdg[3]),toNum(p.rdg[4]),toNum(p.promedio),p.repetibilidad!==null?toNum(fmtSig(p.repetibilidad)):'',p.incertExpandida!==null?toNum(fmtSig(p.incertExpandida)):'',toNum(p.incertScope),p.incResultado||'—',p.notas||'']); }); }); }); const ws=XLSX.utils.aoa_to_sheet(data); const range=XLSX.utils.decode_range(ws['!ref']); for(let C=range.s.c;C<=range.e.c;C++){const addr=XLSX.utils.encode_cell({r:0,c:C});if(!ws[addr])continue;ws[addr].s={font:{bold:true,color:{rgb:'FFFFFF'}},fill:{fgColor:{rgb:'2563EB'}},alignment:{horizontal:'center'}};} ws['!cols']=headers.map((h,ci)=>{let max=h.length;data.slice(1).forEach(row=>{const val=String(row[ci]??'');if(val.length>max)max=val.length;});return{wch:Math.min(max+2,30)};}); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Incertidumbre'); XLSX.writeFile(wb,'incertidumbre.xlsx'); }
function exportarPDF(){ let html='<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte de Incertidumbre</title><style>body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:20px}h1{font-size:15px;color:#1d4ed8;margin-bottom:4px}h2{font-size:13px;margin:18px 0 4px;color:#1e3a8a;border-bottom:1px solid #ddd;padding-bottom:3px}h3{font-size:11px;margin:10px 0 3px;color:#374151}p.meta{font-size:10px;color:#64748b;margin-bottom:14px}.info{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}.info-item{border:1px solid #ddd;padding:5px 8px;border-radius:4px}.info-label{font-size:9px;color:#6b7280;font-weight:700;text-transform:uppercase}.info-value{font-size:11px;font-weight:600}table{border-collapse:collapse;width:100%;margin-bottom:14px;font-size:10px}th{background:#1d4ed8;color:#fff;padding:4px 6px;text-align:center;white-space:nowrap}th.hl{background:#1e3a8a}td{border:1px solid #ddd;padding:3px 6px;text-align:center}tr:nth-child(even) td{background:#f8fafc}.ok{background:#d1fae5!important;color:#065f46;font-weight:700}.nook{background:#fee2e2!important;color:#991b1b;font-weight:700}.hl{background:#eff4ff!important;color:#1d4ed8;font-weight:700}@page{size:A3 landscape;margin:12mm}</style></head><body><h1>Reporte de Incertidumbre de Medición</h1><p class="meta">Generado el '+new Date().toLocaleString('es-MX')+'</p>'; state.equipos.forEach(eq=>{ html+='<h2>'+(esc(eq.descripcion)||'Equipo sin nombre')+' <span style="font-weight:400;font-size:10px;color:#6b7280">('+eq.tipoCalibracion+')</span></h2><div class="info"><div class="info-item"><div class="info-label">Tipo</div><div class="info-value">'+eq.tipoCalibracion+'</div></div><div class="info-item"><div class="info-label">Resolución</div><div class="info-value">'+(esc(eq.resolucion)||'—')+'</div></div><div class="info-item"><div class="info-label">Fecha</div><div class="info-value">'+esc(eq.fechaCreacion)+'</div></div><div class="info-item"><div class="info-label">Notas</div><div class="info-value">'+(esc(eq.notas)||'—')+'</div></div></div>'; eq.magnitudes.forEach(mag=>{ const n=NUM_LECTURAS[eq.tipoCalibracion]; let rdgTh=''; for(let i=1;i<=n;i++) rdgTh+='<th>Rdg '+i+'</th>'; html+='<h3>Magnitud: '+(esc(mag.nombre)||'Sin nombre')+'</h3><table><thead><tr><th>#</th><th>Nominal</th><th>Unidad</th>'+rdgTh+'<th>Promedio</th><th>uScope</th><th class="hl">Repet.</th><th class="hl">Inc. Exp.</th><th>Inc. Result.</th><th>Notas</th></tr></thead><tbody>'; mag.puntos.forEach((p,idx)=>{ const irClass=p.incResultado==='OK'?'ok':p.incResultado==='NO OK'?'nook':''; let rdgTd=''; for(let i=0;i<n;i++) rdgTd+='<td>'+(p.rdg[i]!==''&&p.rdg[i]!==null?esc(String(p.rdg[i])):'—')+'</td>'; html+='<tr><td>'+(idx+1)+'</td><td>'+esc(String(p.nominal??'—'))+'</td><td>'+esc(p.unidad)+'</td>'+rdgTd+'<td>'+fmt4(p.promedio)+'</td><td>'+(esc(p.incertScope)||'—')+'</td><td class="hl">'+fmtSig(p.repetibilidad)+'</td><td class="hl">'+(p.incertExpandida!==null?'±'+fmtSig(p.incertExpandida):'—')+'</td><td class="'+irClass+'">'+(esc(p.incResultado)||'—')+'</td><td>'+esc(p.notas||'')+'</td></tr>'; }); html+='</tbody></table>'; }); }); html+='</body></html>'; const win=window.open('','_blank','width=1200,height=800'); if(!win){ alert('Permite las ventanas emergentes para exportar el PDF.'); return; } win.document.write(html); win.document.close(); win.onload=()=>{ win.focus(); win.print(); }; }
function descargar(contenido,nombre,tipo){ const blob=new Blob([contenido],{type:tipo}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=nombre; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href); }
function limpiarTodo(){ if(!confirm('¿Eliminar TODOS los equipos y datos? Esta accion no se puede deshacer.')) return; state.equipos=[]; guardar(); render(); }
cargar(); render();
`

export default function Page() {
  useEffect(() => {
    // Cargar SheetJS primero, luego inyectar la app
    const loadApp = () => {
      const existing = document.getElementById('incert-app-script')
      if (existing) existing.remove()
      const script = document.createElement('script')
      script.id = 'incert-app-script'
      script.textContent = JS
      document.body.appendChild(script)
    }

    if (typeof (window as any).XLSX !== 'undefined') {
      loadApp()
    } else {
      const sheetjs = document.createElement('script')
      sheetjs.id = 'sheetjs-cdn'
      sheetjs.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'
      sheetjs.onload = loadApp
      document.head.appendChild(sheetjs)
    }

    return () => {
      const s = document.getElementById('incert-app-script')
      if (s) s.remove()
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <div>
            <div className="header-title">Calculadora de Incertidumbre</div>
            <div className="header-sub">GUM · Trazable · ANAB · EMA</div>
          </div>
        </div>
        <div className="header-actions">
          <div className="export-group" id="export-group" style={{ display: 'none' }}>
            <button className="btn btn-outline btn-sm" onClick={() => (window as any).exportarCSV()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              CSV
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => (window as any).exportarXLS()} title="Exportar a Excel (.xlsx)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              XLSX
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => (window as any).exportarPDF()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              PDF
            </button>
            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => (window as any).limpiarTodo()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              Limpiar todo
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => (window as any).agregarEquipo()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar equipo
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="app-main">
        <details className="formulas-banner">
          <summary className="formulas-summary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Fórmulas utilizadas (clic para expandir)
          </summary>
          <div className="formulas-grid">
            <div className="formula-item">
              <div className="formula-title">Promedio</div>
              <div className="formula-code">x̄ = Σ(Rdgᵢ) / n</div>
            </div>
            <div className="formula-item">
              <div className="formula-title">Repetibilidad (Desv. Est. Muestral)</div>
              <div className="formula-code">{'s = √[ Σ(Rdgᵢ − x̄)² / (n−1) ]'}</div>
              <div className="formula-note">Mostrada con 2 cifras significativas</div>
            </div>
            <div className="formula-item" style={{ borderColor: '#93c5fd', background: '#eff4ff' }}>
              <div className="formula-title">Incertidumbre Expandida (k=2)</div>
              <div className="formula-code">{'U = √( (s/√n)² + (uScope/2)² + varExtra ) × 2'}</div>
              <div className="formula-note">Mostrada con 2 cifras significativas</div>
            </div>
            <div className="formula-item">
              <div className="formula-title">Inc. Resultado</div>
              <div className="formula-code">{'OK  si  Inc. Exp. ≤ uScope'}</div>
            </div>
            <div className="formula-item">
              <div className="formula-title">Varianzas Extra</div>
              <div className="formula-code">{'Resolución: val / √12\nResto: val / √3'}</div>
            </div>
          </div>
        </details>

        <div id="equipos-container" />
      </main>

      <footer className="app-footer">
        Developed for Test Solutions SA. de C.V. by TheOskar &mdash; &copy; Copyright 2026
      </footer>
    </>
  )
}
