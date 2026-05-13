import type { FormatMatch } from '@/types/domain'

export interface FormatError {
  code: 'NOT_ENOUGH_PLAYERS' | 'TMAX_TOO_SMALL' | 'WOMEN_CONSTRAINT'
  message: string
  details?: Record<string, number>
}

export type FormatResult =
  | { ok: true; format: FormatMatch }
  | { ok: false; error: FormatError }

/**
 * Calcule le format optimal (doublettes/triplettes) pour N joueurs et Tmax terrains.
 * Formule : b (triplettes) = (N_eff - 4 × T_cible) / 2,  a (doublettes) = T_cible - b
 */
export function calculerFormat(N: number, Tmax: number): FormatResult {
  if (N < 4) {
    return { ok: false, error: { code: 'NOT_ENOUGH_PLAYERS', message: `Minimum 4 joueurs requis (fourni: ${N})` } }
  }
  if (Tmax < 1) {
    return { ok: false, error: { code: 'TMAX_TOO_SMALL', message: 'Nombre de terrains doit être ≥ 1' } }
  }

  const bye  = N % 2 !== 0
  const Neff = bye ? N - 1 : N
  const Tmin = Math.ceil(Neff / 6)
  const Tnat = Math.floor(Neff / 4)
  const Tcible = Math.min(Tmax, Tnat)

  if (Tcible < Tmin) {
    return {
      ok: false,
      error: {
        code: 'TMAX_TOO_SMALL',
        message: `T_max trop petit pour ${N} joueurs (min: ${Tmin}, fourni: ${Tmax})`,
        details: { Tmin, Tmax, Neff },
      },
    }
  }

  const triplettes = (Neff - 4 * Tcible) / 2
  const doublettes = Tcible - triplettes

  return { ok: true, format: { doublettes, triplettes, terrains: Tcible, bye } }
}
