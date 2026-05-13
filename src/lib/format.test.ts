import { describe, it, expect } from 'vitest'
import { calculerFormat } from './format'

describe('calculerFormat', () => {
  it('T1.01 — 4 joueurs, Tmax=10 → 1 doublette', () => {
    const r = calculerFormat(4, 10)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.format).toMatchObject({ doublettes: 1, triplettes: 0, terrains: 1, bye: false })
  })

  it('T1.07 — 12 joueurs, Tmax=10 → 3 doublettes', () => {
    const r = calculerFormat(12, 10)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.format).toMatchObject({ doublettes: 3, triplettes: 0, terrains: 3, bye: false })
  })

  it('T1.13 — 7 joueurs (impair) → bye + 1 triplette', () => {
    const r = calculerFormat(7, 10)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.format.bye).toBe(true)
    expect(r.format.triplettes).toBe(1)
  })

  it('T1.29 — 0 joueurs → erreur NOT_ENOUGH_PLAYERS', () => {
    const r = calculerFormat(0, 10)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('NOT_ENOUGH_PLAYERS')
  })

  it('T1.35 — 48 joueurs, Tmax=7 → erreur TMAX_TOO_SMALL', () => {
    const r = calculerFormat(48, 7)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.code).toBe('TMAX_TOO_SMALL')
  })
})
