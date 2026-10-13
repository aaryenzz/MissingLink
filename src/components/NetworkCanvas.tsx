import { useMemo } from 'react'
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react'
import type { Network } from '../types/network'

interface NetworkCanvasProps {
  network: Network
  selectedConnectionId: string | null
  selectedStopId: string | null
  affectedConnectionIds: string[]
  onSelectConnection: (id: string) => void
  onSelectStop: (id: string) => void
}

const stopColors: Record<string, string> = {
  hospital: '#d96352',
  college: '#cb923d',
  junction: '#3f7772',
  workplace: '#6c7c70',
  village: '#8a946d',
  'bus stop': '#668caa',
}

export default function NetworkCanvas({
  network,
  selectedConnectionId,
  selectedStopId,
  affectedConnectionIds,
  onSelectConnection,
  onSelectStop,
}: NetworkCanvasProps) {
  const nodes = useMemo<Node[]>(() => network.stops.map((stop) => ({
    id: stop.id,
    position: stop.position,
    data: {
      label: (
        <span className="network-node-label">
          <span className="node-mark" style={{ background: stopColors[stop.type] }} />
          <span>
            <strong>{stop.name}</strong>
            <small>{stop.type}</small>
          </span>
          {stop.important && <span className="critical-mark" aria-label="Critical destination">!</span>}
        </span>
      ),
    },
    style: {
      width: 154,
      height: 54,
      border: selectedStopId === stop.id ? '2px solid #183f3b' : '1px solid #d9dfd9',
      borderRadius: 10,
      background: '#fffefa',
      boxShadow: selectedStopId === stop.id ? '0 0 0 4px rgba(47, 112, 101, .12)' : '0 2px 8px rgba(28, 45, 40, .07)',
      padding: 0,
      color: '#263b37',
      fontSize: 12,
    },
  })), [network.stops, selectedStopId])

  const edges = useMemo<Edge[]>(() => network.connections.map((connection) => {
    const selected = selectedConnectionId === connection.id
    const affected = affectedConnectionIds.includes(connection.id)
    const stroke = !connection.enabled ? '#cf685d' : affected ? '#cd933e' : connection.mode === 'bus' ? '#6388a3' : '#97a7a0'
    return {
      id: connection.id,
      source: connection.from,
      target: connection.to,
      type: 'smoothstep',
      label: `${Math.round(connection.minutes)}m`,
      animated: selected,
      style: { stroke, strokeWidth: selected ? 3 : affected ? 2.5 : 1.8, strokeDasharray: connection.enabled ? undefined : '5 4' },
      labelStyle: { fill: '#53635d', fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: '#f9faf7', fillOpacity: 0.9 },
      labelBgPadding: [3, 3],
      interactionWidth: 18,
      data: { connectionId: connection.id },
    }
  }), [network.connections, selectedConnectionId, affectedConnectionIds])

  return (
    <div className="network-canvas" aria-label="Interactive fictional transport network">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.35}
        maxZoom={1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        onNodeClick={(_, node) => onSelectStop(node.id)}
        onEdgeClick={(_, edge) => onSelectConnection(edge.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e5e9e4" gap={22} size={1} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => stopColors[network.stops.find((stop) => stop.id === node.id)?.type ?? 'junction']}
          maskColor="rgba(246, 247, 243, .72)"
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}