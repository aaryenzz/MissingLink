import type { Network, Scenario } from '../types/network'

export function applyScenario(network: Network, scenario: Scenario): Network {
  const closed = new Set(scenario.closedConnectionIds)
  const reopened = new Set(scenario.reopenedConnectionIds)
  return {
    stops: network.stops.map((stop) => ({ ...stop, position: { ...stop.position } })),
    connections: network.connections.map((connection) => {
      const multiplier = scenario.timeMultipliers[connection.id] ?? 1
      if (!Number.isFinite(multiplier) || multiplier <= 0) {
        throw new RangeError(`Scenario multiplier for ${connection.id} must be positive and finite.`)
      }
      return {
        ...connection,
        enabled: reopened.has(connection.id) || (connection.enabled && !closed.has(connection.id)),
        minutes: connection.minutes * multiplier,
      }
    }),
  }
}