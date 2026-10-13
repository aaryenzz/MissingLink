export type StopType = 'bus stop' | 'junction' | 'college' | 'hospital' | 'workplace' | 'village'
export type ConnectionMode = 'road' | 'bus' | 'walking'
export type JourneyCategory = 'student' | 'worker' | 'patient' | 'general'
export type PriorityLevel = 'standard' | 'time-sensitive'

export interface Stop {
  id: string
  name: string
  type: StopType
  position: { x: number; y: number }
  important?: boolean
}

export interface Connection {
  id: string
  from: string
  to: string
  minutes: number
  mode: ConnectionMode
  enabled: boolean
  bidirectional: boolean
  capacity?: number
  importance?: 'low' | 'medium' | 'high'
}

export interface Network {
  stops: Stop[]
  connections: Connection[]
}

export interface Journey {
  id: string
  label: string
  origin: string
  destination: string
  departureMinute: number
  deadlineMinute?: number
  category: JourneyCategory
  priority: PriorityLevel
}

export interface Scenario {
  id: string
  name: string
  description: string
  kind: 'baseline' | 'closure' | 'cancellation' | 'multiple' | 'delay'
  closedConnectionIds: string[]
  reopenedConnectionIds: string[]
  timeMultipliers: Record<string, number>
}

export interface RouteResult {
  stopIds: string[]
  connectionIds: string[]
  minutes: number
}

export type JourneyStatus = 'unaffected' | 'delayed' | 'stranded'

export interface JourneyImpact {
  journey: Journey
  status: JourneyStatus
  baselineRoute: RouteResult | null
  scenarioRoute: RouteResult | null
  additionalMinutes: number | null
  deadlineMissed: boolean | null
  baselineDeadlineMissed: boolean | null
  removedBaselineConnections: string[]
  explanation: string
}

export interface ImpactSummary {
  impacts: JourneyImpact[]
  affectedCount: number
  delayedCount: number
  strandedCount: number
  unaffectedCount: number
  deadlineMissCount: number
  significantDelayCount: number
  criticalDestinationsAffected: Stop[]
  affectedConnections: Array<{ connection: Connection; journeyCount: number }>
  largestDetours: JourneyImpact[]
  strandedAtCriticalDestinations: JourneyImpact[]
}