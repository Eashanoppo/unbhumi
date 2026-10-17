'use client';

import React, { useState } from 'react';
import { GraphData, GraphNode, GraphEdge } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { GitFork, AlertCircle, Info, ZoomIn, ZoomOut, RotateCcw, List, Network, Clock, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface OwnershipGraphVisualizerProps {
  data: GraphData;
  className?: string;
}

export const OwnershipGraphVisualizer: React.FC<OwnershipGraphVisualizerProps> = ({ data, className = '' }) => {
  const { language, t, formatNumber } = useLanguage();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline' | 'table'>('graph');
  const [zoom, setZoom] = useState(1);

  const nodes = data.nodes || [];
  const edges = data.edges || [];

  // Calculate layout coordinates for nodes
  // Categorize by type: Person (left/top), Deed (center), Parcel (right/bottom), Khatian/Mutation
  const positionedNodes = nodes.map((node, index) => {
    let x = 150;
    let y = 100 + index * 80;

    if (node.type === 'person') {
      x = 120;
      y = 120 + (index % 3) * 140;
    } else if (node.type === 'deed') {
      x = 380;
      y = 100 + (index % 3) * 160;
    } else if (node.type === 'parcel') {
      x = 650;
      y = 220;
    } else if (node.type === 'khatian' || node.type === 'mutation') {
      x = 650;
      y = node.type === 'khatian' ? 80 : 360;
    }

    return { ...node, x, y };
  });

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'parcel':
        return { bg: '#245838', border: '#1E4D30', text: '#FAF9F6' };
      case 'deed':
        return { bg: '#FFFFFF', border: '#245838', text: '#1F2421' };
      case 'person':
        return { bg: '#F4F3EF', border: '#5A6560', text: '#1F2421' };
      case 'khatian':
      case 'mutation':
        return { bg: '#EBF3EE', border: '#245838', text: '#1F2421' };
      default:
        return { bg: '#FFFFFF', border: '#E2E0D8', text: '#1F2421' };
    }
  };

  // Derive timeline events from deeds and edges
  const deedNodes = nodes.filter(n => n.type === 'deed');
  const parcelNode = nodes.find(n => n.type === 'parcel');
  const personNodes = nodes.filter(n => n.type === 'person');

  const timelineEvents = deedNodes.map((deed, idx) => {
    // Find edges connected to this deed
    const deedEdges = edges.filter(e => e.source === deed.id || e.target === deed.id);
    const conflictEdge = deedEdges.find(e => e.is_conflict);
    
    // Attempt to extract year from deed label
    const yearMatch = deed.label.match(/\b(19\d\d|20\d\d)\b/);
    const year = yearMatch ? yearMatch[1] : (2020 + idx).toString();

    return {
      id: deed.id,
      title: deed.label,
      subtitle: deed.subtext,
      year: year,
      parcel: parcelNode?.label || (language === 'bn' ? 'দাগ রেকর্ড' : 'Parcel Record'),
      isConflict: Boolean(conflictEdge),
      conflictReason: conflictEdge?.conflict_reason || '',
      edges: deedEdges
    };
  }).sort((a, b) => parseInt(a.year) - parseInt(b.year));

  return (
    <div className={`rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden ${className}`}>
      {/* Header & Controls */}
      <div className="p-4 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface-soft)]/50">
        <div className="flex items-center gap-2">
          <GitFork className="w-5 h-5 text-[var(--accent-deep)]" />
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t('graph_card_title')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {t('graph_card_sub', { nodes: nodes.length, edges: edges.length, conflicts: data.metrics?.conflict_edges || 0 })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-[var(--border-color)] overflow-hidden bg-[var(--bg-surface)] p-0.5">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1 rounded transition-colors ${
                viewMode === 'graph' ? 'bg-[var(--accent-deep)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>{t('btn_graph')}</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1 rounded transition-colors ${
                viewMode === 'timeline' ? 'bg-[var(--accent-deep)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t('btn_timeline')}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1 rounded transition-colors ${
                viewMode === 'table' ? 'bg-[var(--accent-deep)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t('btn_table')}</span>
            </button>
          </div>

          {/* Zoom Controls */}
          {viewMode === 'graph' && (
            <div className="flex items-center gap-1 border border-[var(--border-color)] rounded-lg bg-[var(--bg-surface)] p-0.5">
              <button
                onClick={() => setZoom(Math.min(zoom + 0.15, 1.8))}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom - 0.15, 0.6))}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'graph' ? (
        <div className="relative w-full h-[460px] bg-[var(--bg-surface-soft)]/30 overflow-auto cursor-grab active:cursor-grabbing">
          {/* Conflict Alert Banner if double sale detected */}
          {data.metrics?.has_conflicting_paths && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{t('graph_conflict_banner')}</span>
            </div>
          )}

          {/* SVG Canvas */}
          <div
            className="w-[840px] h-[480px] relative transition-transform duration-150 origin-top-left"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg className="w-full h-full pointer-events-auto">
              <defs>
                <marker
                  id="arrow-normal"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#697265" />
                </marker>
                <marker
                  id="arrow-conflict"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#C84C4C" />
                </marker>
              </defs>

              {/* Render Directed Edges */}
              {edges.map((edge) => {
                const src = positionedNodes.find((n) => n.id === edge.source);
                const tgt = positionedNodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;

                const isConflict = edge.is_conflict;
                const isSelected = selectedEdge?.id === edge.id;

                const midX = (src.x + tgt.x) / 2;
                const midY = (src.y + tgt.y) / 2;

                return (
                  <g
                    key={edge.id}
                    onClick={() => { setSelectedEdge(edge); setSelectedNode(null); }}
                    className="cursor-pointer group"
                  >
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={isConflict ? '#C84C4C' : isSelected ? '#286B35' : '#8A9A86'}
                      strokeWidth={isConflict ? 3 : isSelected ? 3 : 2}
                      strokeDasharray={isConflict ? '6 4' : 'none'}
                      markerEnd={isConflict ? 'url(#arrow-conflict)' : 'url(#arrow-normal)'}
                      className="transition-all"
                    />
                    {/* Edge Label Pill */}
                    <rect
                      x={midX - 45}
                      y={midY - 10}
                      width={90}
                      height={20}
                      rx={4}
                      fill={isConflict ? '#FFF0F0' : '#FFFFFF'}
                      stroke={isConflict ? '#C84C4C' : '#E5E0D2'}
                      strokeWidth={1}
                      className="group-hover:stroke-black"
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isConflict ? 'bold' : 'normal'}
                      fill={isConflict ? '#C84C4C' : '#263126'}
                    >
                      {edge.label?.slice(0, 14)}
                    </text>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {positionedNodes.map((node) => {
                const color = getNodeColor(node.type);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => { setSelectedNode(node); setSelectedEdge(null); }}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={node.type === 'parcel' ? 36 : 28}
                      fill={color.bg}
                      stroke={isSelected ? '#E8A23A' : color.border}
                      strokeWidth={isSelected ? 4 : 2.5}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                      className="transition-transform group-hover:scale-110"
                    />
                    <text
                      textAnchor="middle"
                      y={node.type === 'parcel' ? -4 : 2}
                      fontSize="11"
                      fontWeight="bold"
                      fill={color.text}
                    >
                      {node.type === 'parcel' ? (language === 'bn' ? 'দাগ' : 'Plot') : node.type === 'deed' ? (language === 'bn' ? 'দলিল' : 'Deed') : (language === 'bn' ? 'ব্যক্তি' : 'Person')}
                    </text>
                    <text
                      textAnchor="middle"
                      y={node.type === 'parcel' ? 12 : 14}
                      fontSize="9"
                      fill={color.text}
                      opacity={0.9}
                    >
                      {node.label.length > 12 ? node.label.slice(0, 11) + '..' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node / Edge Details Drawer */}
          {(selectedNode || selectedEdge) && (
            <div className="absolute bottom-3 right-3 max-w-xs p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-lg text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between font-bold border-b border-[var(--border-color)] pb-1">
                <span>{selectedNode ? t('node_detail_title') : t('edge_detail_title')}</span>
                <button
                  onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              {selectedNode && (
                <>
                  <p className="font-semibold text-sm text-[var(--accent-deep)]">{selectedNode.label}</p>
                  <p className="text-[var(--text-secondary)]">{selectedNode.subtext}</p>
                  <p className="text-[10px] uppercase font-mono text-gray-500">{t('id_label')} {selectedNode.id}</p>
                </>
              )}
              {selectedEdge && (
                <>
                  <p className={`font-semibold ${selectedEdge.is_conflict ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
                    {selectedEdge.label}
                  </p>
                  {selectedEdge.conflict_reason && (
                    <p className="text-red-700 bg-red-50 p-1.5 rounded text-[11px] font-medium border border-red-200">
                      ⚠️ {selectedEdge.conflict_reason}
                    </p>
                  )}
                  <p className="text-[var(--text-secondary)]">{t('relation_label')} {selectedEdge.relation}</p>
                </>
              )}
            </div>
          )}
        </div>
      ) : viewMode === 'timeline' ? (
        /* Chronological Transaction Timeline View */
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {t('timeline_header_title')}
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                {t('timeline_header_sub')}
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              {t('timeline_event_count', { count: timelineEvents.length })}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-color)]">
            {timelineEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Timeline node dot */}
                <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-[var(--bg-surface)] flex items-center justify-center ${
                  evt.isConflict ? 'border-red-600 bg-red-100 dark:bg-red-950' : 'border-[var(--accent-deep)]'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${evt.isConflict ? 'bg-red-600' : 'bg-[var(--accent-deep)]'}`} />
                </div>

                {/* Event Card */}
                <div className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                  evt.isConflict
                    ? 'border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-soft)]/40'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--bg-surface-soft)] border border-[var(--border-color)] text-[var(--text-primary)]">
                        {t('year_prefix', { year: formatNumber(evt.year) })}
                      </span>
                      <h5 className="text-sm font-bold text-[var(--text-primary)]">
                        {evt.title}
                      </h5>
                    </div>

                    {evt.isConflict ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>{t('double_sale_badge')}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('legit_chain_badge')}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    {evt.subtitle || (language === 'bn' ? `লক্ষ্য প্লট: ${evt.parcel}` : `Target Plot: ${evt.parcel}`)}
                  </p>

                  {/* Conflict alert callout */}
                  {evt.isConflict && evt.conflictReason && (
                    <div className="p-3 rounded-lg bg-red-100/70 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{t('conflict_reason_lead')}</span>
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        {evt.conflictReason}
                      </p>
                    </div>
                  )}

                  {/* Linked Parties */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[var(--text-secondary)]">
                    <span className="font-medium">{t('connected_nodes_lead')}</span>
                    {evt.edges.map(e => (
                      <span key={e.id} className="px-2 py-0.5 rounded bg-[var(--bg-surface-soft)] border border-[var(--border-color)]">
                        {e.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Accessible Tabular Alternative */
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] bg-[var(--bg-surface-soft)]/50">
                <th className="py-2.5 px-3">{t('tbl_source')}</th>
                <th className="py-2.5 px-3">{t('tbl_relation')}</th>
                <th className="py-2.5 px-3">{t('tbl_target')}</th>
                <th className="py-2.5 px-3">{t('tbl_status')}</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((edge) => {
                const src = nodes.find((n) => n.id === edge.source);
                const tgt = nodes.find((n) => n.id === edge.target);
                return (
                  <tr key={edge.id} className="border-b border-[var(--border-color)]/60 hover:bg-[var(--bg-surface-soft)]/30">
                    <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">{src?.label || edge.source}</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">{edge.label}</td>
                    <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">{tgt?.label || edge.target}</td>
                    <td className="py-2.5 px-3">
                      {edge.is_conflict ? (
                        <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{t('tbl_conflict')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{t('tbl_consistent')}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
