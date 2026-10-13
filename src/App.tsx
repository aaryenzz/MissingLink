import { useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowRight, BookOpen,
  Check, ChevronDown, CircleHelp, Clock3, Download, FileText,
  GitBranch, Hospital, MapPinned, RotateCcw, Route, ShieldAlert, SlidersHorizontal,
  UsersRound, Zap,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { journeys } from './data/journeys'
import { network } from './data/network'
import { scenarios } from './data/scenarios'
import { analyzeImpact, SIGNIFICANT_DELAY_MINUTES } from './engine/impact'
import { applyScenario } from './engine/scenarios'
import NetworkCanvas from './components/NetworkCanvas'
import type { JourneyImpact, Scenario } from './types/network'

type View = 'overview' | 'scenarios' | 'journeys' | 'report'

const baselineScenario = scenarios[0]
const baselineSummary = analyzeImpact(network, journeys, baselineScenario)
const numberFormat = new Intl.NumberFormat('en-GB')

function formatTime(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60) % 24
  const minute = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function StatusTag({ status }: { status: JourneyImpact['status'] }) {
  const label = status === 'unaffected' ? 'Unaffected' : status === 'delayed' ? 'Delayed' : 'Stranded'
  return <span className={`status-tag status-${status}`}>{label}</span>
}

function App() {
  const [activeView, setActiveView] = useState<View>('overview')
  const [activeScenarioId, setActiveScenarioId] = useState('baseline')
  const [scenarioState, setScenarioState] = useState<Scenario>(baselineScenario)
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>('bridge-oldbridge-riverside')
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [significantDelayMinutes, setSignificantDelayMinutes] = useState(SIGNIFICANT_DELAY_MINUTES)
  const [refreshCount, setRefreshCount] = useState(0)

  const scenarioNetwork = useMemo(() => applyScenario(network, scenarioState), [scenarioState])
  const summary = useMemo(() => analyzeImpact(network, journeys, scenarioState, significantDelayMinutes), [scenarioState, significantDelayMinutes, refreshCount])
  const selectedJourney = summary.impacts.find((impact) => impact.journey.id === selectedJourneyId) ?? null
  const selectedConnection = scenarioNetwork.connections.find((connection) => connection.id === selectedConnectionId) ?? undefined
  const selectedStop = network.stops.find((stop) => stop.id === selectedStopId) ?? undefined
  const selectedStopJourneys = selectedStop ? summary.impacts.filter((impact) => impact.journey.origin === selectedStop.id || impact.journey.destination === selectedStop.id) : []

  const affectedConnectionIds = summary.affectedConnections.map((entry) => entry.connection.id)
  const filteredImpacts = summary.impacts.filter((impact) =>
    (categoryFilter === 'all' || impact.journey.category === categoryFilter) &&
    (statusFilter === 'all' || impact.status === statusFilter))

  function chooseScenario(id: string) {
    const chosen = scenarios.find((scenario) => scenario.id === id) ?? baselineScenario
    setActiveScenarioId(chosen.id)
    setScenarioState(chosen)
    setSelectedStopId(null)
    setSelectedJourneyId(null)
  }

  function resetNetwork() {
    chooseScenario('baseline')
    setSelectedConnectionId(null)
    setRefreshCount((count) => count + 1)
  }

  function toggleConnection(connectionId: string) {
    const currentConnection = scenarioNetwork.connections.find((connection) => connection.id === connectionId)
    if (!currentConnection) return
    setScenarioState((current) => {
      const closed = new Set(current.closedConnectionIds)
      const reopened = new Set(current.reopenedConnectionIds)
      if (currentConnection.enabled) {
        closed.add(connectionId)
        reopened.delete(connectionId)
      } else {
        closed.delete(connectionId)
        reopened.add(connectionId)
      }
      return {
        ...current,
        id: 'custom',
        name: 'Manual network edits',
        description: 'Manual connection changes layered onto the selected scenario.',
        closedConnectionIds: [...closed],
        reopenedConnectionIds: [...reopened],
      }
    })
    setActiveScenarioId('custom')
  }

  function printReport() {
    setActiveView('report')
    window.setTimeout(() => window.print(), 60)
  }

  const navItems: Array<{ id: View; label: string; icon: typeof MapPinned; count?: string }> = [
    { id: 'overview', label: 'Network overview', icon: MapPinned },
    { id: 'scenarios', label: 'Scenario lab', icon: SlidersHorizontal },
    { id: 'journeys', label: 'Journey analysis', icon: Route, count: String(summary.affectedCount) },
    { id: 'report', label: 'Impact report', icon: FileText },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><GitBranch size={20} strokeWidth={2.2} /></div>
          <div><strong>missinglink</strong><span>TRANSPORT RESILIENCE</span></div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="network-picker"><span className="network-dot" /> Fable County <ChevronDown size={14} /></div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button key={id} title={label} aria-label={label} className={`nav-item ${activeView === id ? 'active' : ''}`} onClick={() => setActiveView(id)}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="fictional-note"><span className="note-icon"><CircleHelp size={15} /></span><span><strong>Fictional network</strong><small>All places and journey inputs are demo data.</small></span></div>
          <div className="profile-row"><div className="avatar">AM</div><span><strong>Alex Morgan</strong><small>Resilience team</small></span><ChevronDown size={14} /></div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="breadcrumb"><span>Fable County</span><span className="crumb-slash">/</span><strong>{navItems.find((item) => item.id === activeView)?.label}</strong></div>
          <div className="topbar-actions">
            <span className="simulation-state"><span className="live-dot" /> Simulation ready</span>
            <button className="button button-quiet reset-button" onClick={resetNetwork}><RotateCcw size={15} /> Reset</button>
            <button className="button button-primary" onClick={() => setRefreshCount((count) => count + 1)}><Zap size={15} /> Recalculate</button>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> RESILIENCE DESK <span className="data-badge">SIMULATED DATA</span></div>
              <h1>{activeView === 'overview' ? 'Network at a glance' : activeView === 'scenarios' ? 'Scenario laboratory' : activeView === 'journeys' ? 'Journey analysis' : 'Impact report'}</h1>
              <p>{activeView === 'overview' ? 'Explore how service changes ripple across everyday journeys.' : activeView === 'scenarios' ? 'Compare modeled disruptions against the no-disruption network.' : activeView === 'journeys' ? 'Inspect each fictional journey and the calculated route outcome.' : 'A plain-language account of the selected disruption and its modeled effects.'}</p>
            </div>
            <div className="scenario-control">
              <label htmlFor="scenario-select">ACTIVE SCENARIO</label>
              <div className="select-shell"><Activity size={15} /><select id="scenario-select" value={activeScenarioId} onChange={(event) => chooseScenario(event.target.value)}>
                {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.name}</option>)}
                {activeScenarioId === 'custom' && <option value="custom">Manual network edits</option>}
              </select><ChevronDown size={14} /></div>
            </div>
          </section>

          <section className="metric-grid" aria-label="Calculated journey summary">
            <MetricCard icon={UsersRound} label="Affected journeys" value={summary.affectedCount} detail={`${summary.impacts.length} modeled journeys`} tone="green" />
            <MetricCard icon={ShieldAlert} label="Stranded" value={summary.strandedCount} detail="No available route" tone="coral" />
            <MetricCard icon={Clock3} label="Delayed" value={summary.delayedCount} detail="Alternative route is slower" tone="amber" />
            <MetricCard icon={Hospital} label="Critical destinations" value={summary.criticalDestinationsAffected.length} detail="With stranded or significant delay" tone="blue" />
          </section>

          {activeView === 'overview' && (
            <div className="overview-grid">
              <section className="panel network-panel">
                <div className="panel-heading network-heading">
                  <div><div className="panel-title-row"><h2>Transport network</h2><span className="network-size">{network.stops.length} stops <i /> {network.connections.length} connections</span></div><p>Choose a stop or connection to inspect its modeled role.</p></div>
                  <div className="panel-heading-actions"><span className="schematic-tag">SCHEMATIC</span><button className="icon-button" title="Show scenario laboratory" aria-label="Show scenario laboratory" onClick={() => setActiveView('scenarios')}><SlidersHorizontal size={16} /></button></div>
                </div>
                <NetworkCanvas
                  network={scenarioNetwork}
                  selectedConnectionId={selectedConnectionId}
                  selectedStopId={selectedStopId}
                  affectedConnectionIds={affectedConnectionIds}
                  onSelectConnection={(id) => { setSelectedConnectionId(id); setSelectedStopId(null) }}
                  onSelectStop={(id) => { setSelectedStopId(id); setSelectedConnectionId(null) }}
                />
                <div className="network-footer">
                  <div className="legend"><strong>LEGEND</strong><span><i className="legend-dot stop-dot" /> Stop</span><span><i className="legend-line road-line" /> Road</span><span><i className="legend-line bus-line" /> Bus</span><span><i className="legend-line closed-line" /> Closed</span><span><i className="legend-dot critical-dot" /> Critical destination</span></div>
                  <label className="threshold-setting">Significant delay ≥ <input type="number" min="0" max="180" step="5" aria-label="Significant delay threshold in minutes" value={significantDelayMinutes} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value) && value >= 0) setSignificantDelayMinutes(value) }} /> min</label>
                </div>
              </section>

              <aside className="analysis-column">
                <SelectionPanel
                  selectedConnection={selectedConnection}
                  selectedStop={selectedStop}
                  selectedStopJourneys={selectedStopJourneys}
                  summary={summary}
                  onToggleConnection={toggleConnection}
                  onShowJourney={(id) => { setSelectedJourneyId(id); setActiveView('journeys') }}
                  onClear={() => { setSelectedConnectionId(null); setSelectedStopId(null) }}
                />
                <ImpactPanel summary={summary} selectedJourney={selectedJourney} onSelectJourney={(id) => { setSelectedJourneyId(id); setActiveView('journeys') }} />
                <div className="safety-note"><AlertTriangle size={15} /><p><strong>Simulation only.</strong> Not for real-world dispatch or emergency routing.</p></div>
              </aside>
            </div>
          )}

          {activeView === 'scenarios' && (
            <div className="scenario-view-grid">
              <section className="panel scenario-list-panel">
                <div className="panel-heading"><div><h2>Disruption presets</h2><p>Each scenario edits modeled connections and recalculates journeys.</p></div><span className="small-counter">{scenarios.length} PRESETS</span></div>
                <div className="scenario-list">
                  {scenarios.map((scenario, index) => {
                    const result = analyzeImpact(network, journeys, scenario, significantDelayMinutes)
                    const active = activeScenarioId === scenario.id
                    return <button key={scenario.id} className={`scenario-card ${active ? 'selected' : ''}`} onClick={() => chooseScenario(scenario.id)}>
                      <span className={`scenario-number ${active ? 'active-number' : ''}`}>{String(index + 1).padStart(2, '0')}</span>
                      <span className="scenario-card-copy"><strong>{scenario.name}</strong><small>{scenario.description}</small></span>
                      <span className="scenario-card-result"><b>{result.affectedCount}</b><small>affected</small></span>
                      {active && <Check size={16} className="scenario-check" />}
                    </button>
                  })}
                </div>
                <div className="manual-scenario"><div className="manual-mark"><SlidersHorizontal size={16} /></div><div><strong>Manual network edits</strong><p>Close or restore a selected connection on the overview.</p></div><button className="button button-quiet" onClick={() => setActiveView('overview')}>Open network <ArrowRight size={14} /></button></div>
              </section>
              <ComparisonPanel summary={summary} significantDelayMinutes={significantDelayMinutes} />
            </div>
          )}

          {activeView === 'journeys' && (
            <section className="panel journeys-panel">
              <div className="panel-heading journey-heading"><div><h2>Modeled journeys</h2><p>Fictional records used by the simulator; no passenger totals are inferred.</p></div><div className="filters"><label><span>Category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All categories</option><option value="student">Student</option><option value="worker">Worker</option><option value="patient">Patient</option><option value="general">General travel</option></select></label><label><span>Outcome</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All outcomes</option><option value="delayed">Delayed</option><option value="stranded">Stranded</option><option value="unaffected">Unaffected</option></select></label></div></div>
              <div className="table-wrap"><table className="journey-table"><thead><tr><th>Journey</th><th>From → To</th><th>Depart</th><th>Fastest route</th><th>Change</th><th>Outcome</th></tr></thead><tbody>
                {filteredImpacts.map((impact) => <tr key={impact.journey.id} tabIndex={0} aria-selected={selectedJourneyId === impact.journey.id} className={selectedJourneyId === impact.journey.id ? 'row-selected' : ''} onClick={() => setSelectedJourneyId(impact.journey.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedJourneyId(impact.journey.id) } }}>
                  <td><strong>{impact.journey.label}</strong><small>{impact.journey.id} · {impact.journey.category}{impact.journey.priority === 'time-sensitive' ? ' · time-sensitive' : ''}</small></td>
                  <td>{network.stops.find((stop) => stop.id === impact.journey.origin)?.name} <ArrowRight size={12} /> {network.stops.find((stop) => stop.id === impact.journey.destination)?.name}</td>
                  <td>{formatTime(impact.journey.departureMinute)}</td>
                  <td>{impact.baselineRoute ? `${impact.baselineRoute.minutes} min` : 'Unavailable'} <span className="route-arrow">→</span> {impact.scenarioRoute ? `${impact.scenarioRoute.minutes} min` : 'No route'}</td>
                  <td>{impact.additionalMinutes === null ? '—' : impact.additionalMinutes === 0 ? '0 min' : `+${impact.additionalMinutes} min`}</td>
                  <td><StatusTag status={impact.status} /></td>
                </tr>)}
              </tbody></table></div>
              {filteredImpacts.length === 0 && <div className="empty-state"><Route size={20} /><strong>No journeys match these filters</strong><span>Choose another category or outcome.</span></div>}
              <div className="journey-detail-strip">{selectedJourney ? <><div className="detail-icon"><BookOpen size={16} /></div><div><strong>{selectedJourney.journey.label}</strong><p>{selectedJourney.explanation}{selectedJourney.deadlineMissed === null ? ' Deadline outcome cannot be calculated for this route.' : selectedJourney.deadlineMissed ? ` Arrival at ${formatTime(selectedJourney.journey.departureMinute + (selectedJourney.scenarioRoute?.minutes ?? 0))} is after the ${formatTime(selectedJourney.journey.deadlineMinute ?? 0)} deadline.` : ` Arrival remains before the ${formatTime(selectedJourney.journey.deadlineMinute ?? 0)} deadline.`}</p></div><button className="icon-button" aria-label="Clear selected journey" onClick={() => setSelectedJourneyId(null)}>×</button></> : <span>Select a journey row to see the route explanation and deadline result.</span>}</div>
            </section>
          )}

          {activeView === 'report' && <ReportView summary={summary} scenario={scenarioState} significantDelayMinutes={significantDelayMinutes} onPrint={printReport} />}

          <footer className="page-footer"><span>MissingLink · Fable County simulation</span><span>All locations and journey inputs are fictional. Not an emergency-routing service.</span></footer>
        </div>
      </main>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, detail, tone }: { icon: typeof Activity; label: string; value: number; detail: string; tone: string }) {
  return <article className="metric-card"><div className={`metric-icon tone-${tone}`}><Icon size={17} /></div><div className="metric-copy"><span>{label}</span><strong>{numberFormat.format(value)}</strong><small>{detail}</small></div><span className={`metric-accent accent-${tone}`} /></article>
}

function SelectionPanel({
  selectedConnection, selectedStop, selectedStopJourneys, summary, onToggleConnection, onShowJourney, onClear,
}: {
  selectedConnection: ReturnType<typeof applyScenario>['connections'][number] | undefined
  selectedStop: typeof network.stops[number] | undefined
  selectedStopJourneys: JourneyImpact[]
  summary: ReturnType<typeof analyzeImpact>
  onToggleConnection: (id: string) => void
  onShowJourney: (id: string) => void
  onClear: () => void
}) {
  if (!selectedConnection && !selectedStop) return <section className="panel selection-panel selection-empty"><div className="empty-illustration"><MapPinned size={20} /></div><div><h2>Inspect the network</h2><p>Select a stop or connection on the map to see details and available actions.</p></div><span className="empty-hint">Waiting for selection</span></section>
  if (selectedStop) return <section className="panel selection-panel">
    <div className="panel-heading"><div><div className="panel-kicker">STOP DETAILS</div><h2>{selectedStop.name}</h2></div><button className="icon-button" onClick={onClear} aria-label="Clear selection">×</button></div>
    <div className="stop-detail-type"><span className="stop-type-mark" />{selectedStop.type}{selectedStop.important && <span className="important-tag">Critical destination</span>}</div>
    <div className="stop-stats"><div><strong>{selectedStopJourneys.length}</strong><small>journeys in sample</small></div><div><strong>{selectedStopJourneys.filter((impact) => impact.status !== 'unaffected').length}</strong><small>affected journeys</small></div></div>
    <div className="detail-subhead">Journey links</div>
    {selectedStopJourneys.length ? selectedStopJourneys.slice(0, 3).map((impact) => <button className="mini-journey" key={impact.journey.id} onClick={() => onShowJourney(impact.journey.id)}><span>{impact.journey.label}</span><StatusTag status={impact.status} /></button>) : <p className="muted-copy">No modeled journeys start or end at this stop.</p>}
  </section>
  return <section className="panel selection-panel">
    <div className="panel-heading"><div><div className="panel-kicker">CONNECTION DETAILS</div><h2>{selectedConnection?.id.replaceAll('-', ' ')}</h2></div><button className="icon-button" onClick={onClear} aria-label="Clear selection">×</button></div>
    <div className="connection-route"><span>{network.stops.find((stop) => stop.id === selectedConnection?.from)?.name}</span><ArrowRight size={14} /><span>{network.stops.find((stop) => stop.id === selectedConnection?.to)?.name}</span></div>
    <div className="connection-facts"><div><small>Travel time</small><strong>{selectedConnection?.minutes} min</strong></div><div><small>Mode</small><strong className="capitalize">{selectedConnection?.mode}</strong></div><div><small>Availability</small><strong className={selectedConnection?.enabled ? 'text-green' : 'text-coral'}>{selectedConnection?.enabled ? 'Open' : 'Closed'}</strong></div></div>
    <div className="connection-impact"><span>Baseline journeys using this connection</span><strong>{summary.impacts.filter((impact) => impact.baselineRoute?.connectionIds.includes(selectedConnection?.id ?? '')).length}</strong></div>
    <button className={`button connection-toggle ${selectedConnection?.enabled ? 'button-close' : 'button-open'}`} onClick={() => selectedConnection && onToggleConnection(selectedConnection.id)}>{selectedConnection?.enabled ? <><ShieldAlert size={15} /> Close connection</> : <><Check size={15} /> Reopen connection</>}</button>
    {selectedConnection?.importance && <small className="importance-caption">Modeled connection importance: {selectedConnection.importance}</small>}
  </section>
}

function ImpactPanel({ summary, selectedJourney, onSelectJourney }: { summary: ReturnType<typeof analyzeImpact>; selectedJourney: JourneyImpact | null; onSelectJourney: (id: string) => void }) {
  const lead = summary.largestDetours[0] ?? summary.impacts.find((impact) => impact.status === 'stranded') ?? null
  const relevant = selectedJourney ?? lead
  return <section className="panel impact-panel">
    <div className="panel-heading"><div><div className="panel-kicker">IMPACT ANALYSIS</div><h2>What changed</h2></div><span className="analysis-symbol"><Activity size={16} /></span></div>
    {relevant ? <>
      <div className="impact-lead"><span className={`impact-lead-mark ${relevant.status}`} />
        <div><strong>{relevant.journey.label}</strong><p>{relevant.explanation}</p></div>
      </div>
      <div className="impact-route-row"><span>{relevant.baselineRoute ? `${relevant.baselineRoute.minutes} min baseline` : 'No baseline route'}</span><ArrowRight size={14} /><strong>{relevant.scenarioRoute ? `${relevant.scenarioRoute.minutes} min now` : 'No route'}</strong></div>
      {summary.affectedConnections.length > 0 && <div className="connection-count-note"><AlertTriangle size={14} /> {summary.affectedConnections[0].connection.id.replaceAll('-', ' ')} appears on {summary.affectedConnections[0].journeyCount} baseline journey{summary.affectedConnections[0].journeyCount === 1 ? '' : 's'}.</div>}
      <button className="text-action" onClick={() => onSelectJourney(relevant.journey.id)}>View journey detail <ArrowRight size={13} /></button>
    </> : <div className="calm-state"><span className="calm-check"><Check size={16} /></span><strong>No journey changes calculated</strong><p>Every modeled journey keeps its baseline travel time in this scenario.</p></div>}
    <div className="analysis-footnote">Priority labels describe fictional journey categories only; they are not a prediction of harm.</div>
  </section>
}

function ComparisonPanel({ summary, significantDelayMinutes = SIGNIFICANT_DELAY_MINUTES }: { summary: ReturnType<typeof analyzeImpact>; significantDelayMinutes?: number }) {
  const chartData = [
    { name: 'Unaffected', baseline: baselineSummary.unaffectedCount, scenario: summary.unaffectedCount },
    { name: 'Delayed', baseline: baselineSummary.delayedCount, scenario: summary.delayedCount },
    { name: 'Stranded', baseline: baselineSummary.strandedCount, scenario: summary.strandedCount },
  ]
  return <section className="panel comparison-panel">
    <div className="panel-heading"><div><div className="panel-kicker">BASELINE COMPARISON</div><h2>Scenario vs. normal service</h2></div><span className="compare-stamp">LIVE</span></div>
    <p className="comparison-intro">Journey outcomes are recalculated from the same {journeys.length} fictional journey records.</p>
    <div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 5, right: 5, left: -24, bottom: 0 }} barGap={5}>
      <CartesianGrid vertical={false} stroke="#e8ebe6" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#77847d' }} />
      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#77847d' }} />
      <Tooltip cursor={{ fill: '#f1f3ee' }} contentStyle={{ border: '1px solid #e0e5df', borderRadius: 8, fontSize: 11 }} />
      <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
      <Bar dataKey="baseline" name="Baseline" fill="#bac4bd" radius={[3, 3, 0, 0]} />
      <Bar dataKey="scenario" name="Selected scenario" radius={[3, 3, 0, 0]}>{chartData.map((entry) => <Cell key={entry.name} fill={entry.name === 'Stranded' ? '#d87968' : entry.name === 'Delayed' ? '#d3a14e' : '#5b8a79'} />)}</Bar>
    </BarChart></ResponsiveContainer></div>
    <div className="comparison-totals"><div><span>Baseline affected</span><strong>{baselineSummary.affectedCount}</strong></div><div className="comparison-arrow"><ArrowRight size={15} /></div><div><span>Selected scenario</span><strong className={summary.affectedCount > baselineSummary.affectedCount ? 'text-coral' : ''}>{summary.affectedCount}</strong></div></div>
    <div className="threshold-caption">Affected = delayed + stranded. Significant delay threshold: {significantDelayMinutes} min.</div>
  </section>
}

function ReportView({ summary, scenario, significantDelayMinutes, onPrint }: { summary: ReturnType<typeof analyzeImpact>; scenario: Scenario; significantDelayMinutes: number; onPrint: () => void }) {
  return <div className="report-layout">
    <section className="panel report-panel">
      <div className="report-header"><div><div className="panel-kicker">MISSINGLINK · SIMULATION REPORT</div><h2>{scenario.name}</h2><p>{scenario.description}</p></div><button className="button button-primary no-print" onClick={onPrint}><Download size={15} /> Print report</button></div>
      <div className="report-disclaimer"><AlertTriangle size={16} /><span><strong>Fictional simulation.</strong> This report uses synthetic network and journey inputs. It is not real passenger data or emergency-routing guidance.</span></div>
      <div className="report-stats"><div><small>Affected journeys</small><strong>{summary.affectedCount}</strong><span>of {summary.impacts.length} modeled</span></div><div><small>Delayed</small><strong>{summary.delayedCount}</strong><span>alternative route available</span></div><div><small>Stranded</small><strong>{summary.strandedCount}</strong><span>no route remains</span></div><div><small>Deadline misses</small><strong>{summary.deadlineMissCount}</strong><span>where arrival is calculable</span></div></div>
      <div className="report-section"><h3>Largest modeled detours</h3>{summary.largestDetours.length ? <div className="report-list">{summary.largestDetours.map((impact) => <ReportJourney key={impact.journey.id} impact={impact} />)}</div> : <p className="report-empty">No journey has a slower alternative route in this scenario.</p>}</div>
      <div className="report-section"><h3>Stranded journeys and critical destinations</h3>{summary.strandedAtCriticalDestinations.length ? <div className="report-list">{summary.strandedAtCriticalDestinations.map((impact) => <ReportJourney key={impact.journey.id} impact={impact} />)}</div> : <p className="report-empty">No modeled journey to a hospital or college is stranded in this scenario.</p>}</div>
      <div className="report-section"><h3>Connections used on baseline routes</h3>{summary.affectedConnections.length ? <div className="connection-report-list">{summary.affectedConnections.map(({ connection, journeyCount }) => <div key={connection.id}><span className="closed-connection-icon"><AlertTriangle size={14} /></span><span><strong>{connection.id.replaceAll('-', ' ')}</strong><small>{connection.mode} · {connection.minutes} min · {connection.importance ?? 'importance not specified'}</small></span><b>{journeyCount} journey{journeyCount === 1 ? '' : 's'}</b></div>)}</div> : <p className="report-empty">No closed connection appears on a baseline journey.</p>}</div>
      <div className="report-section"><h3>Alternative-route availability</h3><p className="report-prose">{summary.delayedCount} modeled journey{summary.delayedCount === 1 ? '' : 's'} retain an alternative route with additional travel time. {summary.strandedCount} have no available route. These results use the currently modeled connections only; they do not account for live traffic, actual capacity, accessibility constraints, or real-world service operation.</p></div>
      <div className="report-footer">Method: Dijkstra shortest paths over available connections; affected = delayed + stranded; significant delay = {significantDelayMinutes} minutes or more. All entities and records are fictional.</div>
    </section>
    <div className="report-side-column"><ComparisonPanel summary={summary} significantDelayMinutes={significantDelayMinutes} /><div className="safety-note"><AlertTriangle size={15} /><p><strong>Not an emergency service.</strong> Verify real-world conditions through responsible local transport and emergency authorities.</p></div></div>
  </div>
}

function ReportJourney({ impact }: { impact: JourneyImpact }) {
  return <article className="report-journey"><div className="report-journey-top"><strong>{impact.journey.label}</strong><StatusTag status={impact.status} /><span>{impact.additionalMinutes === null ? 'No route' : `+${impact.additionalMinutes} min`}</span></div><p>{impact.explanation}</p><small>{network.stops.find((stop) => stop.id === impact.journey.origin)?.name} → {network.stops.find((stop) => stop.id === impact.journey.destination)?.name} · {impact.journey.category} · depart {formatTime(impact.journey.departureMinute)}</small></article>
}

export default App