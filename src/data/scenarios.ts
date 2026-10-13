import type { Scenario } from '../types/network'

export const scenarios: Scenario[] = [
  { id: 'baseline', name: 'No disruption', description: 'All modeled connections are available at their usual demo travel times.', kind: 'baseline', closedConnectionIds: [], reopenedConnectionIds: [], timeMultipliers: {} },
  { id: 'bridge-closure', name: 'Single bridge closure', description: 'Close the Old Bridge connection and recalculate every modeled journey.', kind: 'closure', closedConnectionIds: ['bridge-oldbridge-riverside'], reopenedConnectionIds: [], timeMultipliers: {} },
  { id: 'bus-cancel', name: 'Bus connection cancellation', description: 'Cancel the Central Exchange to East University bus connection.', kind: 'cancellation', closedConnectionIds: ['bus-central-university'], reopenedConnectionIds: [], timeMultipliers: {} },
  { id: 'multiple-closures', name: 'Multiple road closures', description: 'Close Oak Junction to Central Exchange and the Old Bridge connection.', kind: 'multiple', closedConnectionIds: ['road-oak-central', 'bridge-oldbridge-riverside'], reopenedConnectionIds: [], timeMultipliers: {} },
  { id: 'slow-roads', name: 'Increased road travel times', description: 'Model slower travel on two roads using transparent time multipliers.', kind: 'delay', closedConnectionIds: [], reopenedConnectionIds: [], timeMultipliers: { 'road-oak-central': 1.7, 'road-southhospital-central': 1.5 } },
]