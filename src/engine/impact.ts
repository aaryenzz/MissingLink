import type { Connection, ImpactSummary, Journey, JourneyImpact, Network, Scenario, Stop } from '../types/network'
import { findFastestRoute } from './routing'
import { applyScenario } from './scenarios'

export const SIGNIFICANT_DELAY_MINUTES = 15

function arrivalMissed(departure: number, travelMinutes: number, deadline?: number): boolean | null {
  return deadline === undefined ? null : departure + travelMinutes > deadline
}

export function explainJourney(
  journey: Journey,
  status: JourneyImpact['status'],
  baselineRoute: JourneyImpact['baselineRoute'],
  scenarioRoute: JourneyImpact['scenarioRoute'],
  delay: number | null,
  removedConnections: string[],
  network: Network,
  missed: boolean | null,
): string {
  const destination = network.stops.find((stop) => stop.id === journey.destination)?.name ?? journey.destination
  if (!baselineRoute) return 'No valid baseline route exists in the supplied network data.'
  if (status === 'stranded') {
    const names = removedConnections.map((id) => network.connections.find((connection) => connection.id === id)?.id ?? id)
    return `No route to ${destination} remains after the disruption${names.length ? `; the baseline used ${names.join(', ')}` : ''}.`
  }
  if (status === 'unaffected') return 'A fastest route remains at the baseline travel time.'
  const changes = removedConnections.length ? ` The baseline route used ${removedConnections.join(', ')}.` : ''
  const routeStops = scenarioRoute?.stopIds.map((id) => network.stops.find((stop) => stop.id === id)?.name ?? id).join(' → ')
  const deadlineText = missed === null ? '' : missed ? ' The modeled arrival is after the listed deadline.' : ' The modeled arrival remains within the listed deadline.'
  return `An alternative route adds ${delay ?? 0} minutes (${baselineRoute.minutes} to ${scenarioRoute?.minutes ?? 0} minutes) via ${routeStops ?? destination}.${changes}${deadlineText}`
}

function analyzeJourney(journey: Journey, original: Network, scenarioNetwork: Network): JourneyImpact {
  const baselineRoute = findFastestRoute(original, journey.origin, journey.destination)
  const scenarioRoute = findFastestRoute(scenarioNetwork, journey.origin, journey.destination)
  const removedBaselineConnections = baselineRoute?.connectionIds.filter((connectionId) => {
    const connection = scenarioNetwork.connections.find((candidate) => candidate.id === connectionId)
    return !connection?.enabled
  }) ?? []
  const status: JourneyImpact['status'] = !baselineRoute ? 'unaffected' : !scenarioRoute ? 'stranded' :
    scenarioRoute.minutes > baselineRoute.minutes ? 'delayed' : 'unaffected'
  const additionalMinutes = baselineRoute && scenarioRoute ? Math.max(0, scenarioRoute.minutes - baselineRoute.minutes) : null
  const deadlineMissed = scenarioRoute ? arrivalMissed(journey.departureMinute, scenarioRoute.minutes, journey.deadlineMinute) : null
  const baselineDeadlineMissed = baselineRoute ? arrivalMissed(journey.departureMinute, baselineRoute.minutes, journey.deadlineMinute) : null
  const explanation = explainJourney(journey, status, baselineRoute, scenarioRoute, additionalMinutes, removedBaselineConnections, original, deadlineMissed)
  return { journey, status, baselineRoute, scenarioRoute, additionalMinutes, deadlineMissed, baselineDeadlineMissed, removedBaselineConnections, explanation }
}

export function analyzeImpact(
  original: Network,
  journeys: Journey[],
  scenario: Scenario,
  significantDelayMinutes = SIGNIFICANT_DELAY_MINUTES,
): ImpactSummary {
  if (!Number.isFinite(significantDelayMinutes) || significantDelayMinutes < 0) {
    throw new RangeError('The significant delay threshold must be a non-negative finite number.')
  }
  const scenarioNetwork = applyScenario(original, scenario)
  const impacts = journeys.map((journey) => analyzeJourney(journey, original, scenarioNetwork))
  const delayed = impacts.filter((impact) => impact.status === 'delayed')
  const stranded = impacts.filter((impact) => impact.status === 'stranded')
  const byConnection = new Map<string, Set<string>>()
  for (const impact of impacts) {
    for (const connectionId of impact.baselineRoute?.connectionIds ?? []) {
      const connection = scenarioNetwork.connections.find((candidate) => candidate.id === connectionId)
      if (connection?.enabled) continue
      const journeyIds = byConnection.get(connectionId) ?? new Set<string>()
      journeyIds.add(impact.journey.id)
      byConnection.set(connectionId, journeyIds)
    }
  }
  const connectionById = new Map(original.connections.map((connection) => [connection.id, connection]))
  const affectedConnections = [...byConnection.entries()]
    .map(([id, journeyIds]) => ({ connection: connectionById.get(id) as Connection, journeyCount: journeyIds.size }))
    .filter((entry) => entry.connection)
    .sort((left, right) => right.journeyCount - left.journeyCount)
  const criticalDestinationIds = new Set(original.stops.filter((stop) => stop.important || stop.type === 'hospital' || stop.type === 'college').map((stop) => stop.id))
  const criticalDestinationsAffected = original.stops.filter((stop) => criticalDestinationIds.has(stop.id) && impacts.some((impact) =>
    impact.journey.destination === stop.id && (impact.status === 'stranded' || (impact.additionalMinutes ?? 0) >= significantDelayMinutes)))
  const largestDetours = [...delayed]
    .sort((left, right) => (right.additionalMinutes ?? 0) - (left.additionalMinutes ?? 0)).slice(0, 5)
  const strandedAtCriticalDestinations = stranded.filter((impact) => criticalDestinationIds.has(impact.journey.destination))
  return {
    impacts,
    affectedCount: delayed.length + stranded.length,
    delayedCount: delayed.length,
    strandedCount: stranded.length,
    unaffectedCount: impacts.filter((impact) => impact.status === 'unaffected').length,
    deadlineMissCount: impacts.filter((impact) => impact.deadlineMissed === true).length,
    significantDelayCount: delayed.filter((impact) => (impact.additionalMinutes ?? 0) >= significantDelayMinutes).length,
    criticalDestinationsAffected: criticalDestinationsAffected as Stop[],
    affectedConnections,
    largestDetours,
    strandedAtCriticalDestinations,
  }
}