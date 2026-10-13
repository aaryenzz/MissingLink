import { describe, expect, it } from 'vitest'
import type { Network } from '../types/network'
import { findFastestRoute } from './routing'

const sample: Network = {
  stops: [
    { id: 'a', name: 'A', type: 'bus stop', position: { x: 0, y: 0 } },
    { id: 'b', name: 'B', type: 'junction', position: { x: 1, y: 0 } },
    { id: 'c', name: 'C', type: 'hospital', position: { x: 2, y: 0 } },
    { id: 'isolated', name: 'Isolated', type: 'village', position: { x: 3, y: 0 } },
  ],
  connections: [
    { id: 'ab', from: 'a', to: 'b', minutes: 4, mode: 'road', enabled: true, bidirectional: true },
    { id: 'bc', from: 'b', to: 'c', minutes: 5, mode: 'bus', enabled: true, bidirectional: true },
    { id: 'ac', from: 'a', to: 'c', minutes: 20, mode: 'road', enabled: true, bidirectional: true },
    { id: 'disabled', from: 'a', to: 'c', minutes: 1, mode: 'road', enabled: false, bidirectional: true },
  ],
}

describe('findFastestRoute', () => {
  it('returns the fastest route with ordered stops, connections, and total time', () => {
    expect(findFastestRoute(sample, 'a', 'c')).toEqual({ stopIds: ['a', 'b', 'c'], connectionIds: ['ab', 'bc'], minutes: 9 })
  })

  it('does not use disabled connections', () => {
    const network = { ...sample, connections: sample.connections.map((edge) => edge.id === 'bc' ? { ...edge, enabled: false } : edge) }
    expect(findFastestRoute(network, 'a', 'c')?.connectionIds).toEqual(['ac'])
  })

  it('returns null when the destination is unreachable or an endpoint is unknown', () => {
    expect(findFastestRoute(sample, 'a', 'isolated')).toBeNull()
    expect(findFastestRoute(sample, 'missing', 'a')).toBeNull()
  })

  it('returns a zero-minute route when start and destination match', () => {
    expect(findFastestRoute(sample, 'b', 'b')).toEqual({ stopIds: ['b'], connectionIds: [], minutes: 0 })
  })

  it('rejects negative and non-finite travel times', () => {
    const invalid = { ...sample, connections: [{ ...sample.connections[0], minutes: -1 }] }
    expect(() => findFastestRoute(invalid, 'a', 'b')).toThrow(RangeError)
    const nonFinite = { ...sample, connections: [{ ...sample.connections[0], minutes: Number.NaN }] }
    expect(() => findFastestRoute(nonFinite, 'a', 'b')).toThrow(RangeError)
  })

  it('does not mutate the source network', () => {
    const before = structuredClone(sample)
    findFastestRoute(sample, 'a', 'c')
    expect(sample).toEqual(before)
  })
})