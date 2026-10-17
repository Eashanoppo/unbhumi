'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GraphData, GraphNode, GraphEdge, GraphRAGResult, api } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import {
  GitFork, AlertCircle, Info, ZoomIn, ZoomOut, RotateCcw, Maximize2,
  List, Network, Clock, Search, Filter, ShieldAlert, Sparkles,
  ArrowRight, FileText, User, MapPin, BookOpen, FileCheck2,
  AlertTriangle, X, CheckCircle2, ChevronRight, ExternalLink,
  Layers, Copy, Check, CornerDownRight, HelpCircle
} from 'lucide-react';

export interface OwnershipGraphVisualizerProps {
  data: GraphData;
  caseId?: string;
  className?: string;
  onOpenDocumentPreview?: (docId: string | number, page?: number) => void;
}

export const OwnershipGraphVisualizer: React.FC<OwnershipGraphVisualizerProps> = ({
  data,
  caseId,
  className = '',
  onOpenDocumentPreview
}) => {
  const { language, t, formatNumber } = useLanguage();

  // Primary interactive states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'chain' | 'table'>('graph');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterConflictOnly, setFilterConflictOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Graph Canvas Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // GraphRAG State
  const [ragQuery, setRagQuery] = useState<string>('');
  const [isRagLoading, setIsRagLoading] = useState<boolean>(false);
  const [ragResult, setRagResult] = useState<GraphRAGResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeCaseId = caseId || data.case_id || 'UB-2026-1002';

  const rawNodes = data.nodes || [];
  const rawEdges = data.edges || [];

  // 1. Initial Smart Structured Layout Calculation
  useEffect(() => {
    const initialPositions: Record<string, { x: number; y: number }> = {};
    const persons = rawNodes.filter((n) => n.type === 'person');
    const deeds = rawNodes.filter((n) => n.type === 'deed' || n.type === 'baya_deed');
    const parcels = rawNodes.filter((n) => n.type === 'parcel');
    const khatians = rawNodes.filter((n) => n.type === 'khatian');
    const mutations = rawNodes.filter((n) => n.type === 'mutation');
    const mouzas = rawNodes.filter((n) => n.type === 'mouza');
    const conflicts = rawNodes.filter((n) => n.type === 'conflict');

    // Layout Columns:
    // Col 0: Persons (x: 100)
    // Col 1: Deeds & Baya Deeds (x: 350)
    // Col 2: Parcels & Khatians (x: 620)
    // Col 3: Mutations & Mouzas (x: 880)
    // Conflicts: Elevated top/center (x: 350, y: 50)

    persons.forEach((n, idx) => {
      initialPositions[n.id] = { x: 100, y: 140 + idx * 120 };
    });

    deeds.forEach((n, idx) => {
      initialPositions[n.id] = { x: 360, y: 130 + idx * 140 };
    });

    parcels.forEach((n, idx) => {
      initialPositions[n.id] = { x: 640, y: 220 + idx * 130 };
    });

    khatians.forEach((n, idx) => {
      initialPositions[n.id] = { x: 640, y: 80 + idx * 100 };
    });

    mutations.forEach((n, idx) => {
      initialPositions[n.id] = { x: 880, y: 200 + idx * 110 };
    });

    mouzas.forEach((n, idx) => {
      initialPositions[n.id] = { x: 880, y: 80 + idx * 100 };
    });

    conflicts.forEach((n, idx) => {
      initialPositions[n.id] = { x: 360 + idx * 140, y: 40 };
    });

    // Fallback for any unpositioned nodes
    rawNodes.forEach((n, idx) => {
      if (!initialPositions[n.id]) {
        initialPositions[n.id] = { x: 200 + (idx % 4) * 180, y: 350 + Math.floor(idx / 4) * 80 };
      }
    });

    setNodePositions(initialPositions);
  }, [rawNodes]);

  // Combined node positions with manual drags
  const nodes = useMemo(() => {
    return rawNodes.map((n) => {
      const pos = nodePositions[n.id] || { x: 150, y: 150 };
      return { ...n, x: pos.x, y: pos.y };
    });
  }, [rawNodes, nodePositions]);

  // Filtering & Search
  const filteredNodes = useMemo(() => {
    let result = nodes;

    // Node type filter
    if (filterType !== 'all') {
      result = result.filter((n) => n.type === filterType);
    }

    // Conflict only filter
    if (filterConflictOnly) {
      const conflictNodeIds = new Set<string>();
      rawEdges.forEach((e) => {
        if (e.is_conflict) {
          conflictNodeIds.add(e.source);
          conflictNodeIds.add(e.target);
        }
      });
      rawNodes.forEach((n) => {
        if (n.type === 'conflict') conflictNodeIds.add(n.id);
      });
      result = result.filter((n) => conflictNodeIds.has(n.id));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          (n.subtext && n.subtext.toLowerCase().includes(q)) ||
          n.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [nodes, filterType, filterConflictOnly, searchQuery, rawEdges, rawNodes]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    let result = rawEdges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
    if (filterConflictOnly) {
      result = result.filter((e) => e.is_conflict);
    }
    return result;
  }, [rawEdges, visibleNodeIds, filterConflictOnly]);

  // Selected node and neighborhood calculation
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  const selectedEdge = useMemo(() => {
    if (!selectedEdgeId) return null;
    return rawEdges.find((e) => e.id === selectedEdgeId) || null;
  }, [selectedEdgeId, rawEdges]);

  const neighborhoodIds = useMemo(() => {
    if (!selectedNodeId) return null;
    const neighborSet = new Set<string>([selectedNodeId]);
    rawEdges.forEach((e) => {
      if (e.source === selectedNodeId) neighborSet.add(e.target);
      if (e.target === selectedNodeId) neighborSet.add(e.source);
    });
    return neighborSet;
  }, [selectedNodeId, rawEdges]);

  // Node Category Configuration (Styling & Icons)
  const getNodeConfig = (type: string, isConflict = false) => {
    switch (type) {
      case 'person':
        return {
          icon: User,
          bg: '#FFFFFF',
          darkBg: '#131B26',
          border: isConflict ? '#DC2626' : '#64748B',
          textColor: '#0F172A',
          badgeText: language === 'bn' ? 'ব্যক্তি' : 'Person',
          badgeBg: 'rgba(100, 116, 139, 0.12)'
        };
      case 'deed':
        return {
          icon: FileText,
          bg: '#FFFFFF',
          darkBg: '#131B26',
          border: isConflict ? '#DC2626' : '#15803D',
          textColor: '#0F172A',
          badgeText: language === 'bn' ? 'সাফ-কবলা দলিল' : 'Deed',
          badgeBg: 'rgba(21, 128, 61, 0.12)'
        };
      case 'baya_deed':
        return {
          icon: FileText,
          bg: '#FFFFFF',
          darkBg: '#131B26',
          border: isConflict ? '#DC2626' : '#D97706',
          textColor: '#0F172A',
          badgeText: language === 'bn' ? 'বায়া দলিল' : 'Baya Deed',
          badgeBg: 'rgba(217, 119, 6, 0.12)'
        };
      case 'parcel':
        return {
          icon: MapPin,
          bg: '#FFFFFF',
          darkBg: '#131B26',
          border: '#0F766E',
          textColor: '#0F172A',
          badgeText: language === 'bn' ? 'নির্দিষ্ট দাগ' : 'Parcel',
          badgeBg: 'rgba(15, 118, 110, 0.12)'
        };
      case 'khatian':
        return {
          icon: BookOpen,
          bg: '#FFFFFF',
          darkBg: '#131B26',
          border: '#2563EB',
          textColor: '#0F172A',
          badgeText: language === 'bn' ? 'রেকর্ডীয় খতিয়ান' : 'Khatian',
          badgeBg: 'rgba(37, 99, 235, 0.12)'
        };
      case 'mutation':
        return {
          icon: FileCheck2,
          bg: '#FFFFFF',
          darkBg: '#131B26',
          border: '#7C3AED',
          textColor: '#0F172A',
          badgeText: language === 'bn' ? 'নামজারি খারিজ' : 'Mutation',
          badgeBg: 'rgba(124, 58, 237, 0.12)'
        };
      case 'mouza':
        return {
          icon: Layers,
          bg: '#FFFFFF',
          darkBg: '#131B26',
          border: '#475569',
          textColor: '#0F172A',
          badgeText: language === 'bn' ? 'মৌজা সীমানা' : 'Mouza',
          badgeBg: 'rgba(71, 85, 105, 0.12)'
        };
      case 'conflict':
      default:
        return {
          icon: AlertTriangle,
          bg: '#FEF2F2',
          darkBg: '#2D1515',
          border: '#DC2626',
          textColor: '#991B1B',
          badgeText: language === 'bn' ? 'অসঙ্গতি সংকেত' : 'Conflict',
          badgeBg: 'rgba(220, 38, 38, 0.15)'
        };
    }
  };

  // Pan & Zoom Handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 2.2));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggingNodeId) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      // Reposition dragged node
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        setNodePositions((prev) => ({
          ...prev,
          [draggingNodeId]: { x: Math.round(mouseX), y: Math.round(mouseY) }
        }));
      }
      return;
    }

    if (isPanning) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleFitToView = () => {
    if (nodes.length === 0) return;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const graphWidth = maxX - minX + 220;
    const graphHeight = maxY - minY + 180;
    const containerWidth = containerRef.current?.clientWidth || 900;
    const containerHeight = containerRef.current?.clientHeight || 500;

    const scaleX = containerWidth / graphWidth;
    const scaleY = containerHeight / graphHeight;
    const newZoom = Math.min(Math.min(scaleX, scaleY) * 0.9, 1.2);

    setZoom(newZoom);
    setPan({
      x: (containerWidth - graphWidth * newZoom) / 2 - minX * newZoom + 50,
      y: (containerHeight - graphHeight * newZoom) / 2 - minY * newZoom + 40
    });
  };

  const handleResetLayout = () => {
    setZoom(1);
    setPan({ x: 20, y: 20 });
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  // GraphRAG Query Execution
  const handleRunRagQuery = async (queryText?: string) => {
    const q = (queryText || ragQuery || '').trim();
    if (!q) return;
    setRagQuery(q);
    setIsRagLoading(true);

    try {
      const res = await api.queryGraphRAG(activeCaseId, q);
      setRagResult(res);

      // Auto-select first retrieved node and focus
      if (res.retrieved_nodes && res.retrieved_nodes.length > 0) {
        setSelectedNodeId(res.retrieved_nodes[0].id);
      }
    } catch (err) {
      console.warn('GraphRAG query execution fallback:', err);
    } finally {
      setIsRagLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Derive chronological transfer sequence for Ownership Chain View
  const chainSequence = useMemo(() => {
    const deedNodes = rawNodes.filter((n) => n.type === 'deed' || n.type === 'baya_deed');
    return deedNodes
      .map((deed) => {
        const relatedEdges = rawEdges.filter((e) => e.source === deed.id || e.target === deed.id);
        const sellerEdge = relatedEdges.find((e) => e.relation === 'SELLER_OF' && e.target === deed.id);
        const buyerEdge = relatedEdges.find(
          (e) => (e.relation === 'TRANSFERRED_TO' || e.relation === 'BUYER_OF') && e.source === deed.id
        );
        const sellerNode = rawNodes.find((n) => n.id === sellerEdge?.source);
        const buyerNode = rawNodes.find((n) => n.id === buyerEdge?.target);
        const isConflict = relatedEdges.some((e) => e.is_conflict);

        return {
          deed,
          sellerNode,
          buyerNode,
          isConflict,
          conflictReason: relatedEdges.find((e) => e.is_conflict)?.conflict_reason || '',
          date: deed.properties?.deed_date || deed.subtext || '2026'
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rawNodes, rawEdges]);

  return (
    <div className={`rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden shadow-sm flex flex-col ${className}`}>
      {/* 1. TOP TOOLBAR & CONTROLS */}
      <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--brand-accent)] text-white flex items-center justify-center shadow-2xs">
            <GitFork className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {t('graph_card_title')}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.2 rounded-md bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--brand-accent)] font-bold">
                <Sparkles className="w-3 h-3" />
                NetworkX GraphRAG
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {language === 'bn'
                ? `মালিকানা নোড: ${formatNumber(nodes.length)} | নির্দেশক সংযোগ: ${formatNumber(rawEdges.length)} | অসঙ্গতি সংকেত: ${formatNumber(data.metrics?.conflict_edges || 0)}`
                : `Entity Nodes: ${nodes.length} | Directed Edges: ${rawEdges.length} | Conflict Warnings: ${data.metrics?.conflict_edges || 0}`}
            </p>
          </div>
        </div>

        {/* View Mode Switcher + Canvas Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented View Switcher */}
          <div className="bg-[var(--bg-surface)] p-0.5 rounded-xl border border-[var(--border-color)] flex items-center text-xs">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'graph'
                  ? 'bg-[var(--accent-light)] text-[var(--brand-accent)] font-bold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>{t('btn_graph')}</span>
            </button>
            <button
              onClick={() => setViewMode('chain')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'chain'
                  ? 'bg-[var(--accent-light)] text-[var(--brand-accent)] font-bold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মালিকানা ধারাবাহিকতা' : 'Chain of Title'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-[var(--accent-light)] text-[var(--brand-accent)] font-bold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t('btn_table')}</span>
            </button>
          </div>

          {/* Canvas Actions */}
          {viewMode === 'graph' && (
            <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-0.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)]">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
                title="Zoom In (+)"
                className="p-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
                title="Zoom Out (-)"
                className="p-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleFitToView}
                title="Fit to View"
                className="p-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetLayout}
                title="Reset Canvas Layout"
                className="p-1.5 rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. FILTER & GRAPHRAG RETRIEVAL TOOLBAR */}
      <div className="px-4 py-2.5 bg-[var(--bg-surface)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[260px] flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'ব্যক্তি, দলিল, খতিয়ান বা দাগ নম্বর খুঁজুন...' : 'Search person, deed, khatian, or dag...'}
            className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-accent)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            {language === 'bn' ? 'ফিল্টার:' : 'Filter:'}
          </span>

          {[
            { id: 'all', labelBn: 'সকল নোড', labelEn: 'All' },
            { id: 'person', labelBn: 'ব্যক্তি', labelEn: 'Person' },
            { id: 'deed', labelBn: 'দলিল', labelEn: 'Deeds' },
            { id: 'parcel', labelBn: 'দাগ', labelEn: 'Parcels' },
            { id: 'khatian', labelBn: 'খতিয়ান', labelEn: 'Khatian' },
            { id: 'conflict', labelBn: 'অসঙ্গতি', labelEn: 'Conflicts' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterType(chip.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                filterType === chip.id
                  ? 'bg-[var(--brand-accent)] text-white font-bold shadow-2xs'
                  : 'bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {language === 'bn' ? chip.labelBn : chip.labelEn}
            </button>
          ))}

          {/* Conflict Toggle */}
          <button
            onClick={() => setFilterConflictOnly(!filterConflictOnly)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
              filterConflictOnly
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 ring-1 ring-rose-500/20'
                : 'bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-rose-600'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>{language === 'bn' ? 'কেবল বিরোধ' : 'Only Conflicts'}</span>
          </button>
        </div>
      </div>

      {/* 3. GRAPHRAG INTERACTIVE PRE-SET QUERIES */}
      <div className="px-4 py-2 bg-[var(--bg-surface-soft)]/40 border-b border-[var(--border-color)] flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-1 tracking-wider">
          <Sparkles className="w-3 h-3 text-[var(--brand-accent)]" />
          GraphRAG:
        </span>
        {[
          { q: 'কামাল হোসেন', labelBn: '🔍 বিক্রেতা কামাল হোসেনের হস্তান্তর চেইন' },
          { q: 'দাগ ৮৮', labelBn: '🔍 দাগ ৮৮ সংক্রান্ত সকল দলিল ও বিরোধ' },
          { q: 'double_sale', labelBn: '🔍 দ্বৈত বিক্রির সাংঘর্ষিক সাব-গ্রাফ' },
          { q: 'বায়া দলিল', labelBn: '🔍 বায়া দলিলের ধারাবাহিকতা যাচাই' }
        ].map((item, idx) => (
          <button
            key={idx}
            disabled={isRagLoading}
            onClick={() => handleRunRagQuery(item.q)}
            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--accent-light)] text-[var(--text-primary)] hover:text-[var(--brand-accent)] border border-[var(--border-color)] hover:border-[var(--brand-accent)]/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {item.labelBn}
          </button>
        ))}
      </div>

      {/* 4. MAIN CANVAS & SIDEBAR CONTAINER */}
      <div className="relative w-full flex-1 min-h-[520px] bg-[var(--bg-primary)] overflow-hidden flex flex-col md:flex-row">
        {/* GRAPH CANVAS VIEW */}
        {viewMode === 'graph' && (
          <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="flex-1 h-[520px] relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          >
            {/* Legend Overlay (Top Left) */}
            <div className="absolute top-3 left-3 z-10 p-2.5 rounded-xl bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xs text-[10px] space-y-1.5 pointer-events-auto">
              <span className="font-bold text-[var(--text-primary)] block uppercase tracking-wider text-[9px]">
                {language === 'bn' ? 'নোড লেজেন্ড' : 'Node Legend'}
              </span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                  {language === 'bn' ? 'ব্যক্তি (মালিক)' : 'Person'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" />
                  {language === 'bn' ? 'সাফ-কবলা দলিল' : 'Deed'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                  {language === 'bn' ? 'বায়া দলিল' : 'Baya Deed'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                  {language === 'bn' ? 'দাগ (জমি)' : 'Parcel'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" />
                  {language === 'bn' ? 'খতিয়ান' : 'Khatian'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                  {language === 'bn' ? 'বিরোধ সংকেত' : 'Conflict'}
                </span>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <svg
              className="w-full h-full pointer-events-auto"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isPanning || draggingNodeId ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              <defs>
                <marker
                  id="arrow-normal"
                  viewBox="0 0 10 10"
                  refX="26"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
                </marker>
                <marker
                  id="arrow-conflict"
                  viewBox="0 0 10 10"
                  refX="26"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#DC2626" />
                </marker>
                <marker
                  id="arrow-selected"
                  viewBox="0 0 10 10"
                  refX="26"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#15803D" />
                </marker>
              </defs>

              {/* DIRECTED EDGES */}
              {filteredEdges.map((edge) => {
                const src = nodes.find((n) => n.id === edge.source);
                const tgt = nodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;

                const isConflict = edge.is_conflict;
                const isSelected = selectedEdgeId === edge.id;
                const isInNeighborhood =
                  neighborhoodIds && (neighborhoodIds.has(edge.source) && neighborhoodIds.has(edge.target));
                const isDimmed = neighborhoodIds && !isInNeighborhood;

                const midX = (src.x + tgt.x) / 2;
                const midY = (src.y + tgt.y) / 2;

                return (
                  <g
                    key={edge.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                      setSelectedNodeId(null);
                    }}
                    className={`cursor-pointer transition-opacity ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                  >
                    {/* Edge Line */}
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={
                        isConflict
                          ? '#DC2626'
                          : isSelected
                          ? '#15803D'
                          : '#94A3B8'
                      }
                      strokeWidth={isConflict ? 2.5 : isSelected ? 2.5 : 1.8}
                      strokeDasharray={isConflict ? '6 4' : 'none'}
                      markerEnd={
                        isConflict
                          ? 'url(#arrow-conflict)'
                          : isSelected
                          ? 'url(#arrow-selected)'
                          : 'url(#arrow-normal)'
                      }
                    />

                    {/* Edge Label Pill */}
                    <rect
                      x={midX - 45}
                      y={midY - 11}
                      width={90}
                      height={20}
                      rx={6}
                      fill={isConflict ? '#FEF2F2' : '#FFFFFF'}
                      stroke={isConflict ? '#DC2626' : isSelected ? '#15803D' : '#E2E8F0'}
                      strokeWidth={1}
                      className="shadow-2xs"
                    />
                    <text
                      x={midX}
                      y={midY + 3}
                      textAnchor="middle"
                      fill={isConflict ? '#991B1B' : '#0F172A'}
                      fontSize="9.5"
                      fontWeight="bold"
                      className="pointer-events-none select-none font-sans"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* NODES */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isConflict = node.type === 'conflict';
                const isNeighborhood = neighborhoodIds ? neighborhoodIds.has(node.id) : true;
                const isDimmed = neighborhoodIds && !isNeighborhood;
                const cfg = getNodeConfig(node.type, isConflict);
                const Icon = cfg.icon;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      setSelectedEdgeId(null);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingNodeId(node.id);
                    }}
                    className={`cursor-pointer transition-opacity ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                  >
                    {/* Active Selection Glow Ring */}
                    {isSelected && (
                      <circle
                        r={34}
                        fill="none"
                        stroke={isConflict ? '#DC2626' : 'var(--brand-accent)'}
                        strokeWidth={2.5}
                        strokeDasharray="4 3"
                        className="animate-spin-slow"
                      />
                    )}

                    {/* Base Node Shape */}
                    <circle
                      r={24}
                      fill={cfg.bg}
                      stroke={isSelected ? (isConflict ? '#DC2626' : 'var(--brand-accent)') : cfg.border}
                      strokeWidth={isSelected ? 2.5 : 1.8}
                      className="shadow-md transition-transform hover:scale-105"
                    />

                    {/* Node Category Icon */}
                    <foreignObject x={-11} y={-11} width={22} height={22} className="pointer-events-none">
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-4 h-4 stroke-[2.2]" style={{ color: cfg.border }} />
                      </div>
                    </foreignObject>

                    {/* Node Main Title */}
                    <text
                      y={36}
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none select-none drop-shadow-xs font-sans"
                    >
                      {node.label}
                    </text>

                    {/* Node Subtitle / Role Badge */}
                    {node.subtext && (
                      <text
                        y={49}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize="9.5"
                        fontWeight="500"
                        className="pointer-events-none select-none font-sans"
                      >
                        {node.subtext.length > 28 ? `${node.subtext.substring(0, 26)}...` : node.subtext}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* CHAIN OF TITLE (CHRONOLOGICAL SEQUENCE VIEW) */}
        {viewMode === 'chain' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span>{language === 'bn' ? 'মালিকানা হস্তান্তরের ধারাবাহিক চেইন' : 'Chronological Chain of Title Flow'}</span>
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {language === 'bn'
                    ? 'নথিপত্র থেকে নিষ্কাশিত পূর্ববর্তী বায়া দলিল হতে প্রস্তাবিত সাফ-কবলা পর্যন্ত ধারাবাহিক হস্তান্তর রেখা।'
                    : 'Reconstructed chronological ownership progression from historical baya deeds to proposed transfers.'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                {formatNumber(chainSequence.length)} {language === 'bn' ? 'টি লেনদেন পর্যায়' : 'Transitions'}
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-[var(--border-color)]">
              {chainSequence.map((item, idx) => (
                <div key={idx} className="relative pl-12">
                  {/* Step Pin */}
                  <div
                    className={`absolute left-4 top-3 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                      item.isConflict
                        ? 'bg-rose-500 text-white border-rose-200'
                        : 'bg-[var(--brand-accent)] text-white border-emerald-100'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Transition Card */}
                  <div
                    onClick={() => {
                      setViewMode('graph');
                      setSelectedNodeId(item.deed.id);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      item.isConflict
                        ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50'
                        : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-[var(--brand-accent)]/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--brand-accent)]">
                          {item.deed.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[var(--bg-surface-soft)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          {item.date}
                        </span>
                      </div>

                      {item.isConflict && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          {language === 'bn' ? 'দ্বৈত বিক্রি / চেইন বিচ্ছিন্নতা' : 'Conflicting Transfer Path'}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs text-[var(--text-primary)]">
                      <div className="p-2 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)]">
                        <span className="text-[10px] text-[var(--text-secondary)] block">বিক্রেতা:</span>
                        <strong className="text-xs">{item.sellerNode?.label || 'অজ্ঞাত'}</strong>
                      </div>

                      <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />

                      <div className="p-2 rounded-lg bg-[var(--bg-surface-soft)] border border-[var(--border-color)]">
                        <span className="text-[10px] text-[var(--text-secondary)] block">ক্রেতা:</span>
                        <strong className="text-xs">{item.buyerNode?.label || 'অজ্ঞাত'}</strong>
                      </div>
                    </div>

                    {item.isConflict && (
                      <p className="mt-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                        ⚠️ {item.conflictReason || 'একই দাগ একই বিক্রেতার দ্বারা একাধিক ভিন্ন ক্রেতার নামে হস্তান্তরের দাবি।'}
                      </p>
                    )}

                    {item.deed.doc_ids && item.deed.doc_ids.length > 0 && onOpenDocumentPreview && (
                      <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDocumentPreview(item.deed.doc_ids![0]);
                          }}
                          className="text-[11px] font-bold text-[var(--brand-accent)] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{language === 'bn' ? 'দলিল প্রিভিউ দেখুন' : 'View Source Deed'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABULAR RELATIONSHIP MATRIX */}
        {viewMode === 'table' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-surface)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-surface-soft)] border-b border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                  <tr>
                    <th className="p-3">উৎস নোড (Source)</th>
                    <th className="p-3">সম্পর্ক (Relation)</th>
                    <th className="p-3">গন্তব্য নোড (Target)</th>
                    <th className="p-3">স্থিতি (Status)</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredEdges.map((e) => {
                    const src = nodes.find((n) => n.id === e.source);
                    const tgt = nodes.find((n) => n.id === e.target);
                    return (
                      <tr key={e.id} className="hover:bg-[var(--bg-surface-soft)]/50 transition-colors">
                        <td className="p-3 font-semibold text-[var(--text-primary)]">
                          {src?.label || e.source}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[var(--text-secondary)]">
                          {e.relation} ({e.label})
                        </td>
                        <td className="p-3 font-semibold text-[var(--text-primary)]">
                          {tgt?.label || e.target}
                        </td>
                        <td className="p-3">
                          {e.is_conflict ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                              CONFLICT
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              VERIFIED
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setViewMode('graph');
                              setSelectedEdgeId(e.id);
                            }}
                            className="text-xs font-bold text-[var(--brand-accent)] hover:underline"
                          >
                            {language === 'bn' ? 'গ্রাফে দেখুন' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CONTEXTUAL NODE / EDGE / GRAPHRAG DETAILS PANEL (SIDEBAR) */}
        {(selectedNode || selectedEdge || ragResult) && (
          <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-[var(--border-color)] bg-[var(--bg-surface)] p-5 space-y-4 overflow-y-auto animate-in slide-in-from-right-2 duration-150 shadow-md">
            {/* Header with Close */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                {selectedNode
                  ? (language === 'bn' ? 'এনটিটি বিবরণী' : 'Node Inspector')
                  : selectedEdge
                  ? (language === 'bn' ? 'সম্পর্ক বিবরণী' : 'Edge Inspector')
                  : (language === 'bn' ? 'গ্রাফ আরএজি ফলাফল' : 'GraphRAG Synthesis')}
              </span>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                  setRagResult(null);
                }}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-soft)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A. NODE DETAILS */}
            {selectedNode && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--brand-accent)] font-bold uppercase">
                      {selectedNode.type}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedNode.canonical_id || selectedNode.id, 'node_id')}
                      className="text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                    >
                      {copiedKey === 'node_id' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>ID কপি</span>
                    </button>
                  </div>
                  <h4 className="text-base font-extrabold text-[var(--text-primary)] mt-1.5">
                    {selectedNode.label}
                  </h4>
                  {selectedNode.subtext && (
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {selectedNode.subtext}
                    </p>
                  )}
                </div>

                {/* Properties Table */}
                {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
                      {language === 'bn' ? 'বৈশিষ্ট্যাবলী (Properties)' : 'Node Properties'}:
                    </span>
                    {Object.entries(selectedNode.properties).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11px]">
                        <span className="text-[var(--text-secondary)] font-mono">{k}:</span>
                        <span className="font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Connected Relationships */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
                    {language === 'bn' ? 'সংযুক্ত সম্পর্কসমূহ (Edges)' : 'Connected Relationships'}:
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {rawEdges
                      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((e) => {
                        const otherNodeId = e.source === selectedNode.id ? e.target : e.source;
                        const otherNode = nodes.find((n) => n.id === otherNodeId);
                        const isOut = e.source === selectedNode.id;

                        return (
                          <div
                            key={e.id}
                            onClick={() => setSelectedNodeId(otherNodeId)}
                            className={`p-2 rounded-lg border text-[11px] cursor-pointer transition-colors flex items-center justify-between ${
                              e.is_conflict
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
                                : 'bg-[var(--bg-surface-soft)] border-[var(--border-color)] hover:border-[var(--brand-accent)]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <CornerDownRight className="w-3 h-3 text-[var(--brand-accent)] shrink-0" />
                              <span className="font-semibold">
                                {isOut ? '→' : '←'} {e.label}
                              </span>
                            </div>
                            <span className="font-bold text-[var(--text-primary)] truncate max-w-[100px]">
                              {otherNode?.label || otherNodeId}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 1-Click Document Preview Navigation (MANDATORY) */}
                {selectedNode.doc_ids && selectedNode.doc_ids.length > 0 && onOpenDocumentPreview && (
                  <div className="pt-2 border-t border-[var(--border-color)] space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
                      {language === 'bn' ? 'প্রমাণ দলিল ও পাতা সূত্র' : 'Supporting Evidence Document'}:
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenDocumentPreview(selectedNode.doc_ids![0], selectedNode.page_refs?.[0] || 1)}
                      className="w-full py-2 px-3 rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সরাসরি মূল দলিল প্রিভিউ দেখুন' : 'Open Evidence Document Preview'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* B. EDGE DETAILS */}
            {selectedEdge && !selectedNode && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedEdge.is_conflict
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    }`}
                  >
                    {selectedEdge.relation}
                  </span>
                  <h4 className="text-base font-extrabold text-[var(--text-primary)] mt-1.5">
                    {selectedEdge.label}
                  </h4>
                </div>

                {selectedEdge.is_conflict && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                    <span className="text-[10px] font-bold uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      {language === 'bn' ? 'চিহ্নিত অসঙ্গতি' : 'Flagged Conflict'}:
                    </span>
                    <p className="text-xs leading-relaxed">
                      {selectedEdge.conflict_reason || 'একই দাগ একই বিক্রেতার দ্বারা একাধিক ভিন্ন ক্রেতার নামে হস্তান্তরের দাবি।'}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-secondary)]">উৎস নোড (Source):</span>
                    <strong className="text-xs text-[var(--text-primary)]">{selectedEdge.source}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-secondary)]">গন্তব্য নোড (Target):</span>
                    <strong className="text-xs text-[var(--text-primary)]">{selectedEdge.target}</strong>
                  </div>
                </div>

                {selectedEdge.doc_ids && selectedEdge.doc_ids.length > 0 && onOpenDocumentPreview && (
                  <div className="pt-2 border-t border-[var(--border-color)]">
                    <button
                      type="button"
                      onClick={() => onOpenDocumentPreview(selectedEdge.doc_ids![0])}
                      className="w-full py-2 px-3 rounded-xl bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সংশ্লিষ্ট দলিল প্রিভিউ দেখুন' : 'View Supporting Document'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* C. GRAPHRAG EVIDENCE SYNTHESIS */}
            {ragResult && !selectedNode && !selectedEdge && (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--brand-accent)]">
                    <Sparkles className="w-3 h-3" />
                    GraphRAG Response
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {ragResult.metrics.retrieved_node_count} nodes retrieved
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)]">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">
                    {language === 'bn' ? 'গ্রাফ ভিত্তিক তথ্য সংশ্লেষণ' : 'Graph Topology Synthesis'}:
                  </span>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    {language === 'bn' ? ragResult.graph_synthesis_bn : ragResult.graph_synthesis_en}
                  </p>
                </div>

                {/* Grounded Evidence Citations */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">
                    {language === 'bn' ? 'উদ্ধৃত প্রমাণ দলিল' : 'Grounded Evidence Citations'}:
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {ragResult.grounded_evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--text-primary)] truncate max-w-[160px]">
                            {ev.doc_title}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-600 font-bold">
                            {(ev.confidence * 100).toFixed(0)}% OCR
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] flex items-center justify-between">
                          <span>{ev.field_label_bn}: <strong>{ev.field_value}</strong></span>
                          <span>পাতা {formatNumber(ev.page)}</span>
                        </div>
                        {onOpenDocumentPreview && (
                          <button
                            type="button"
                            onClick={() => onOpenDocumentPreview(ev.doc_id, ev.page)}
                            className="text-[10px] font-bold text-[var(--brand-accent)] hover:underline flex items-center gap-1 pt-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>{language === 'bn' ? 'নথিতে দেখুন' : 'Verify in Document'}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
