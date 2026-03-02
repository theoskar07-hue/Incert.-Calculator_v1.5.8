'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, PlusCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PuntoRow from '@/components/PuntoRow'
import type { Magnitud, PuntoCalib, TipoCalibracion } from '@/lib/tipos'
import { nuevoPunto } from '@/lib/tipos'
import { NUM_LECTURAS } from '@/lib/tipos'

interface Props {
  magnitud: Magnitud
  tipo: TipoCalibracion
  onUpdate: (m: Magnitud) => void
  onDelete: () => void
}

export default function MagnitudSection({ magnitud, tipo, onUpdate, onDelete }: Props) {
  const [abierto, setAbierto] = useState(true)
  const n = NUM_LECTURAS[tipo]

  function setNombre(nombre: string) {
    onUpdate({ ...magnitud, nombre })
  }

  function addPunto() {
    onUpdate({ ...magnitud, puntos: [...magnitud.puntos, nuevoPunto(n)] })
  }

  function updatePunto(id: string, p: PuntoCalib) {
    onUpdate({ ...magnitud, puntos: magnitud.puntos.map(x => x.id === id ? p : x) })
  }

  function deletePunto(id: string) {
    onUpdate({ ...magnitud, puntos: magnitud.puntos.filter(x => x.id !== id) })
  }

  const pasados = magnitud.puntos.filter(p => p.resultado === 'PASA').length
  const fallidos = magnitud.puntos.filter(p => p.resultado === 'FALLA').length
  const total = magnitud.puntos.length

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* ── Header de magnitud ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/50">
        <button
          type="button"
          onClick={() => setAbierto(p => !p)}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          {abierto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <Input
          placeholder="Parámetro / Magnitud  (ej: Voltaje DC, Temperatura)"
          value={magnitud.nombre}
          onChange={e => setNombre(e.target.value)}
          className="h-8 text-sm font-medium max-w-xs"
        />

        <div className="flex items-center gap-2 ml-auto">
          {total > 0 && (
            <span className="text-xs text-muted-foreground">{total} pt{total !== 1 ? 's' : ''}</span>
          )}

          <Button size="sm" variant="outline" onClick={addPunto} className="h-8 text-xs gap-1">
            <PlusCircle className="w-3.5 h-3.5" />
            Agregar punto
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Tabla encabezados ── */}
      {abierto && (
        <div className="px-3 pt-0">
          {magnitud.puntos.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground font-medium bg-muted/30 border-b border-border">
              {/* expand + index */}
              <span className="w-4 flex-shrink-0" />
              <span className="w-5 flex-shrink-0" />
              {/* inputs */}
              <span className="w-24 flex-shrink-0">Nominal</span>
              <span className="w-24 flex-shrink-0">Unidad</span>
              <span className="w-20 flex-shrink-0">Rdg 1</span>
              <span className="w-20 flex-shrink-0">Rdg 2</span>
              <span className="w-20 flex-shrink-0">Rdg 3</span>
              <span className={`w-20 flex-shrink-0 ${n < 5 ? 'opacity-30' : ''}`}>Rdg 4</span>
              <span className={`w-20 flex-shrink-0 ${n < 5 ? 'opacity-30' : ''}`}>Rdg 5</span>
              <span className="w-24 flex-shrink-0">uScope</span>
              {/* resultados */}
              <span className="w-24 flex-shrink-0 text-right">Promedio</span>
              <span className="w-20 flex-shrink-0 text-right font-semibold text-primary">Repet.</span>
              <span className="w-24 flex-shrink-0 text-right font-semibold text-primary">Inc. Exp.</span>
              <span className="w-20 flex-shrink-0 text-right">Inc. Result.</span>
              {/* acciones */}
              <span className="w-16 flex-shrink-0" />
            </div>
          )}

          <div className="space-y-1 py-2">
            {magnitud.puntos.map((p, i) => (
              <PuntoRow
                key={p.id}
                punto={p}
                tipo={tipo}
                index={i}
                onUpdate={updated => updatePunto(p.id, updated)}
                onDelete={() => deletePunto(p.id)}
              />
            ))}
          </div>

          {magnitud.puntos.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No hay puntos. Haz clic en{' '}
              <button
                type="button"
                onClick={addPunto}
                className="text-primary underline underline-offset-2"
              >
                Agregar punto
              </button>{' '}
              para comenzar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
