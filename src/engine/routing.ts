import type { Network, RouteResult } from '../types/network'

export function findFastestRoute(network: Network, startId: string, destinationId: string): RouteResult | null {
  const stopIds = new Set(network.stops.map((stop) => stop.id))
  if (!stopIds.has(startId) || !stopIds.has(destinationId)) return null
  if (startId === destinationId) return { stopIds: [startId], connectionIds: [], minutes: 0 }

  const adjacency = new Map<string, Array<{ nextId: string; connectionId: string; minutes: number }>>()
  for (const stop of network.stops) adjacency.set(stop.id, [])

  for (const connection of network.connections) {
    if (!Number.isFinite(connection.minutes) || connection.minutes < 0) {
      throw new RangeError(`Connection ${connection.id} must have a finite, non-negative travel time.`)
    }
    if (!connection.enabled || !stopIds.has(connection.from) || !stopIds.has(connection.to)) continue
    adjacency.get(connection.from)?.push({ nextId: connection.to, connectionId: connection.id, minutes: connection.minutes })
    if (connection.bidirectional) {
      adjacency.get(connection.to)?.push({ nextId: connection.from, connectionId: connection.id, minutes: connection.minutes })
    }
  }

  const distances = new Map<string, number>(network.stops.map((stop) => [stop.id, Infinity]))
  const previous = new Map<string, { stopId: string; connectionId: string }>()
  const pending = new Set(stopIds)
  distances.set(startId, 0)

  while (pending.size > 0) {
    let currentId: string | undefined
    let currentDistance = Infinity
    for (const candidate of pending) {
      const candidateDistance = distances.get(candidate) ?? Infinity
      if (candidateDistance < currentDistance) {
        currentId = candidate
        currentDistance = candidateDistance
      }
    }
    if (currentId === undefined || currentDistance === Infinity) break
    if (currentId === destinationId) break
    pending.delete(currentId)

    for (const neighbor of adjacency.get(currentId) ?? []) {
      if (!pending.has(neighbor.nextId)) continue
      const nextDistance = currentDistance + neighbor.minutes
      if (nextDistance < (distances.get(neighbor.nextId) ?? Infinity)) {
        distances.set(neighbor.nextId, nextDistance)
        previous.set(neighbor.nextId, { stopId: currentId, connectionId: neighbor.connectionId })
      }
    }
  }

  const minutes = distances.get(destinationId) ?? Infinity
  if (!Number.isFinite(minutes)) return null

  const routeStops = [destinationId]
  const routeConnections: string[] = []
  let cursor = destinationId
  while (cursor !== startId) {
    const step = previous.get(cursor)
    if (!step) return null
    routeConnections.unshift(step.connectionId)
    routeStops.unshift(step.stopId)
    cursor = step.stopId
  }
  return { stopIds: routeStops, connectionIds: routeConnections, minutes }
}