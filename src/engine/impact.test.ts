import { describe, expect, it } from 'vitest'
import type { Journey, Network, Scenario } from '../types/network'
import { analyzeImpact } from './impact'
import { applyScenario } from './scenarios'

const network: Network = {
  stops: [
    { id: 'origin', name: 'Origin', type: 'village', position: { x: 0, y: 0 } },
    { id: 'junction', name: 'Junction', type: 'junction', position: { x: 1, y: 0 } },
    { id: 'hospital', name: 'Hospital', type: 'hospital', position: { x: 2, y: 0 }, important: true },
    { id: 'college', name: 'College', type: 'college', position: { x: 3, y: 0 }, important: true },
  ],
  connections: [
    { id: 'direct', from: 'origin', to: 'junction', minutes: 5, mode: 'road', enabled: true, bidirectional: true },
    { id: 'to-hospital', from: 'junction', to: 'hospital', minutes: 5, mode: 'road', enabled: true, bidirectional: true },
    { id: 'to-college', from: 'junction', to: 'college', minutes: 10, mode: 'bus', enabled: true, bidirectional: true },
    { id: 'alternate', from: 'origin', to: 'hospital', minutes: 30, mode: 'road', enabled: true, bidirectional: true },
  ],
}

const journeys: Journey[] = [
  { id: 'delayed', label: 'Fictional patient', origin: 'origin', destination: 'hospital', departureMinute: 480, deadlineMinute: 500, category: 'patient', priority: 'time-sensitive' },
  { id: 'stranded', label: 'Fictional student', origin: 'origin', destination: 'college', departureMinute: 480, deadlineMinute: 510, category: 'student', priority: 'standard' },
  { id: 'unaffected', label: 'Fictional local trip', origin: 'junction', destination: 'hospital', departureMinute: 480, deadlineMinute: 490, category: 'general', priority: 'standard' },
]

const disruption: Scenario = {
  id: 'test', name: 'Test closure', description: 'Test input', kind: 'closure',
  closedConnectionIds: ['direct'], reopenedConnectionIds: [], timeMultipliers: {},
}

describe('applyScenario', () => {
  it('returns a derived network, closes listed connections, and applies time multipliers', () => {
    const slowed = { ...disruption, timeMultipliers: { 'to-hospital': 2 } }
    const result = applyScenario(network, slowed)
    expect(result.connections.find((edge) => edge.id === 'direct')?.enabled).toBe(false)
    expect(result.connections.find((edge) => edge.id === 'to-hospital')?.minutes).toBe(10)
    expect(network.connections.find((edge) => edge.id === 'direct')?.enabled).toBe(true)
    expect(network.connections.find((edge) => edge.id === 'to-hospital')?.minutes).toBe(5)
  })

  it('rejects invalid multipliers', () => {
    expect(() => applyScenario(network, { ...disruption, timeMultipliers: { direct: 0 } })).toThrow(RangeError)
  })
})

describe('analyzeImpact', () => {
  it('classifies delayed, stranded, and unaffected journeys separately', () => {
    const result = analyzeImpact(network, journeys, disruption, 10)
    expect(result.affectedCount).toBe(2)
    expect(result.delayedCount).toBe(1)
    expect(result.strandedCount).toBe(1)
    expect(result.unaffectedCount).toBe(1)
    expect(result.impacts.map((impact) => impact.status)).toEqual(['delayed', 'stranded', 'unaffected'])
  })

  it('clamps additional travel time to zero and reports deadline misses separately', () => {
    const result = analyzeImpact(network, journeys, disruption, 10)
    const delayed = result.impacts[0]
    expect(delayed.additionalMinutes).toBe(20)
    expect(delayed.deadlineMissed).toBe(true)
    expect(delayed.baselineDeadlineMissed).toBe(false)
    expect(result.deadlineMissCount).toBe(1)
    expect(result.criticalDestinationsAffected.map((stop) => stop.id)).toContain('hospital')
    expect(result.strandedAtCriticalDestinations).toHaveLength(1)
  })

  it('supports no-disruption analysis and a configurable significance threshold', () => {
    const baseline: Scenario = { id: 'baseline', name: 'Baseline', description: 'Open', kind: 'baseline', closedConnectionIds: [], reopenedConnectionIds: [], timeMultipliers: {} }
    const result = analyzeImpact(network, journeys, baseline, 100)
    expect(result.affectedCount).toBe(0)
    expect(result.significantDelayCount).toBe(0)
  })

  it('does not attribute a pre-existing disconnected journey to a new disruption', () => {
    const disconnected: Journey = { id: 'missing-origin', label: 'Fictional disconnected input', origin: 'missing-stop', destination: 'hospital', departureMinute: 480, category: 'general', priority: 'standard' }
    const result = analyzeImpact(network, [disconnected], disruption)
    expect(result.impacts[0].status).toBe('unaffected')
    expect(result.impacts[0].explanation).toContain('No valid baseline route')
    expect(result.affectedCount).toBe(0)
  })
})