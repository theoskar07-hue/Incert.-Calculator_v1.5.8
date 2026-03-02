'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, PlusCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import MagnitudSection from '@/components/MagnitudSection'
import type { Equipo, Magnitud, TipoCalibracion } from '@/lib/tipos'
import { nuevaMagnitud, NUM_LECTURAS } from '@/lib/tipos'

interface Props {
  equipo: Equipo
  onUpdate: (e: Equipo) => void
  onDelete: () => void
}

const TIPOS: TipoCalibracion[] = ['Trazable', 'ANAB', 'EMA']

const TIPO_COLOR: Record<TipoCalibracion, string> = {
  Trazable: 'bg-blue-100 text-blue-800 border-blue-300',
  ANAB:     'bg-amber-100 text-amber-800 border-amber-300',
  EMA:      'bg-indigo-100 text-indigo-800 border-indigo-300',
}

export default function EquipoForm({ equipo, onUpdate, onDelete }: Props) {
  const [abierto, setAbierto] = useState(true)

  function set<K extends keyof Equipo>(key: K, val: Equipo[K]) {
    onUpdate({
      ...equipo,
      [key]: val,
      fechaModificacion: new Date().toLocaleString('es-MX'),
    })
  }

  function addMagnitud() {
    const mag = nuevaMagnitud()
    set('magnitudes', [...equipo.magnitudes, mag])
  }

  function updateMagnitud(id: string, m: Magnitud) {
    set('magnitudes', equipo.magnitudes.map(x => x.id === id ? m : x))
  }

  function deleteMagnitud(id: string) {
    set('magnitudes', equipo.magnitudes.filter(x => x.id !== id))
  }

  // Estadísticas globales
  const todosPuntos = equipo.magnitudes.flatMap(m => m.puntos)
  const calculados = todosPuntos.filter(p => p.resultado !== null)
  const pasados   = todosPuntos.filter(p => p.resultado === 'PASA').length
  const fallidos  = todosPuntos.filter(p => p.resultado === 'FALLA').length

  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
      {/* ── Header del equipo ── */}
      <div className="flex items-center gap-3 px-5 py-4 bg-card border-b border-border">
        <button
          type="button"
          onClick={() => setAbierto(p => !p)}
          className="text-muted-foreground hover:text-foreground"
        >
          {abierto ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm truncate">
              {equipo.descripcion || 'Nuevo equipo'}
            </h3>
            <Badge variant="outline" className={`text-xs ${TIPO_COLOR[equipo.tipoCalibracion]}`}>
              {equipo.tipoCalibracion} · {NUM_LECTURAS[equipo.tipoCalibracion]} lecturas
            </Badge>

          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {equipo.magnitudes.length} magnitud(es) · Mod: {equipo.fechaModificacion}
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Body ── */}
      {abierto && (
        <div className="p-5 space-y-5 bg-background">
          {/* Datos del equipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Descripción del equipo</Label>
              <Input
                placeholder="Ej: Multímetro Fluke 87V"
                value={equipo.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tipo de calibración</Label>
              <Select
                value={equipo.tipoCalibracion}
                onValueChange={v => set('tipoCalibracion', v as TipoCalibracion)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => (
                    <SelectItem key={t} value={t} className="text-sm">
                      {t} — {NUM_LECTURAS[t]} lecturas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Resolución del equipo</Label>
              <Input
                placeholder="Ej: 0.01"
                value={equipo.resolucion}
                onChange={e => set('resolucion', e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Notas generales</Label>
              <Input
                placeholder="Observaciones del equipo"
                value={equipo.notas}
                onChange={e => set('notas', e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Magnitudes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Magnitudes / Parámetros</h4>
              <Button size="sm" variant="outline" onClick={addMagnitud} className="h-8 text-xs gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                Nueva magnitud
              </Button>
            </div>

            {equipo.magnitudes.length === 0 && (
              <div className="text-center py-8 border border-dashed border-border rounded-lg text-sm text-muted-foreground">
                Sin magnitudes. Haz clic en{' '}
                <button
                  type="button"
                  onClick={addMagnitud}
                  className="text-primary underline underline-offset-2"
                >
                  Nueva magnitud
                </button>{' '}
                para agregar una.
              </div>
            )}

            {equipo.magnitudes.map(m => (
              <MagnitudSection
                key={m.id}
                magnitud={m}
                tipo={equipo.tipoCalibracion}
                onUpdate={updated => updateMagnitud(m.id, updated)}
                onDelete={() => deleteMagnitud(m.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
