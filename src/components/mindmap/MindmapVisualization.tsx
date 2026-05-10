'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export type PrimarySource = 'DIARY' | 'FEED' | 'LIKE' | 'COMMENT' | 'COMMENT_LIKE';

export interface NodeResponse {
  tagId: number;
  tagName: string;
  diaryCount: number;
  feedCount: number;
  likeCount: number;
  commentCount: number;
  commentLikeCount: number;
  totalCount: number;
  primarySource: PrimarySource;
}

export interface SourceWeightResponse {
  sourceType: PrimarySource;
  weight: number;
}

export interface EdgeResponse {
  tagIdA: number;
  tagIdB: number;
  sourceWeights: SourceWeightResponse[];
  totalWeight: number;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: number;
  data: NodeResponse;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  data: EdgeResponse;
}

export const SOURCE_STYLES: Record<PrimarySource, { fill: string; stroke: string; label: string }> = {
  DIARY:        { fill: '#EFF6FF', stroke: '#2563EB', label: '일기' },
  FEED:         { fill: '#F0FDF4', stroke: '#16A34A', label: '피드' },
  LIKE:         { fill: '#FFF1F2', stroke: '#BE185D', label: '좋아요' },
  COMMENT:      { fill: '#FFFBEB', stroke: '#B45309', label: '댓글' },
  COMMENT_LIKE: { fill: '#F5F3FF', stroke: '#7C3AED', label: '댓글좋아요' },
};

const EDGE_STYLES: Record<PrimarySource, { stroke: string; dash: string | null }> = {
  DIARY:        { stroke: '#93C5FD', dash: null },
  FEED:         { stroke: '#86EFAC', dash: null },
  LIKE:         { stroke: '#FCA5A5', dash: '6,5' },
  COMMENT:      { stroke: '#FCD34D', dash: '8,3,2,3' },
  COMMENT_LIKE: { stroke: '#C4B5FD', dash: '2,5' },
};

function getDominantSource(weights: SourceWeightResponse[]): PrimarySource {
  if (!weights?.length) return 'DIARY';
  return weights.reduce((a, b) => (a.weight >= b.weight ? a : b)).sourceType;
}

interface Props {
  nodes: NodeResponse[];
  edges: EdgeResponse[];
  onNodeClick: (node: NodeResponse) => void;
  onEdgeClick?: (edge: EdgeResponse) => void;
  selectedNodeId?: number | null;
  searchQuery?: string;
}

export default function MindmapVisualization({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  selectedNodeId,
  searchQuery,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const radiusScaleRef = useRef<d3.ScalePower<number, number, never> | null>(null);
  const onNodeClickRef = useRef(onNodeClick);
  const onEdgeClickRef = useRef(onEdgeClick);

  useEffect(() => { onNodeClickRef.current = onNodeClick; }, [onNodeClick]);
  useEffect(() => { onEdgeClickRef.current = onEdgeClick; }, [onEdgeClick]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();
    simulationRef.current?.stop();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const simMultiplier = nodes.length <= 20 ? 2 : nodes.length <= 40 ? 2.5 : 3;
    const simWidth = width * simMultiplier;
    const simHeight = height * simMultiplier;

    // Defs: glow filters
    const defs = svg.append('defs');
    (Object.keys(SOURCE_STYLES) as PrimarySource[]).forEach((src) => {
      const f = defs.append('filter')
        .attr('id', `glow-${src}`)
        .attr('x', '-60%').attr('y', '-60%')
        .attr('width', '220%').attr('height', '220%');
      f.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
      const merge = f.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    });

    const g = svg.append('g').attr('class', 'root');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom).on('dblclick.zoom', null);
    svg.call(zoom.transform, d3.zoomIdentity.translate(-(simWidth - width) / 2, -(simHeight - height) / 2));

    const minCount = d3.min(nodes, (d) => d.totalCount) ?? 0;
    const maxCount = d3.max(nodes, (d) => d.totalCount) ?? 10;
    const rDomain: [number, number] = minCount === maxCount ? [0, maxCount] : [minCount, maxCount];
    const rScale = d3.scaleSqrt().domain(rDomain).range([16, 46]);
    radiusScaleRef.current = rScale;

    const maxWeight = d3.max(edges, (d) => d.totalWeight) ?? 8;
    const wScale = d3.scaleLinear().domain([0, maxWeight]).range([1.5, 6]);

    const simNodes: SimNode[] = nodes.map((d) => ({ id: d.tagId, data: d }));
    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

    const simLinks: SimLink[] = edges
      .map((e) => ({
        source: nodeMap.get(e.tagIdA)!,
        target: nodeMap.get(e.tagIdB)!,
        data: e,
      }))
      .filter((l) => l.source && l.target);

    const sim = d3.forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance((l) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            return 140 + rScale(s.data?.totalCount ?? 5) + rScale(t.data?.totalCount ?? 5);
          })
          .strength(0.25),
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(simWidth / 2, simHeight / 2).strength(0.05))
      .force('collision', d3.forceCollide<SimNode>().radius((d) => rScale(d.data.totalCount) + 14));

    // 노드 클램프 영역: simulation 영역 전체가 아니라 initial zoom transform이
    // viewport에 매핑하는 영역(simulation 중앙의 width×height 박스)으로 좁힌다.
    // 이렇게 하지 않으면 엣지가 0개인 isolated 노드가 charge force에 밀려
    // simulation 영역 가장자리(viewport 밖)로 튕겨나가 화면에서 사라진다.
    const clampMinX = (simWidth - width) / 2;
    const clampMaxX = clampMinX + width;
    const clampMinY = (simHeight - height) / 2;
    const clampMaxY = clampMinY + height;

    sim.force('boundary', () => {
      for (const node of simNodes) {
        const r = rScale(node.data?.totalCount ?? 5) + 24;
        if (node.x != null) {
          if (node.x < clampMinX + r) { node.x = clampMinX + r; if ((node.vx ?? 0) < 0) node.vx = 0; }
          if (node.x > clampMaxX - r) { node.x = clampMaxX - r; if ((node.vx ?? 0) > 0) node.vx = 0; }
        }
        if (node.y != null) {
          if (node.y < clampMinY + r) { node.y = clampMinY + r; if ((node.vy ?? 0) < 0) node.vy = 0; }
          if (node.y > clampMaxY - r) { node.y = clampMaxY - r; if ((node.vy ?? 0) > 0) node.vy = 0; }
        }
      }
    });

    simulationRef.current = sim;

    // Edges — invisible thick hit area + visible line
    const linkG = g.append('g').attr('class', 'links');
    const linkEls = linkG
      .selectAll<SVGGElement, SimLink>('g.edge')
      .data(simLinks)
      .join('g')
      .attr('class', 'edge')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onEdgeClickRef.current?.(d.data);
      })
      .on('mouseover', function (_, d) {
        d3.select(this).select('.edge-line')
          .attr('stroke-opacity', 0.9)
          .attr('stroke-width', wScale(d.data.totalWeight) + 1);
      })
      .on('mouseout', function (_, d) {
        d3.select(this).select('.edge-line')
          .attr('stroke-opacity', 0.55)
          .attr('stroke-width', wScale(d.data.totalWeight));
      });

    linkEls.append('line')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 14);

    linkEls.append('line')
      .attr('class', 'edge-line')
      .attr('stroke', (d) => EDGE_STYLES[getDominantSource(d.data.sourceWeights)].stroke)
      .attr('stroke-dasharray', (d) => EDGE_STYLES[getDominantSource(d.data.sourceWeights)].dash ?? '')
      .attr('stroke-width', (d) => wScale(d.data.totalWeight))
      .attr('stroke-opacity', 0.55)
      .attr('stroke-linecap', 'round');

    // Nodes
    const nodeG = g.append('g').attr('class', 'nodes');
    const nodeEls = nodeG
      .selectAll<SVGGElement, SimNode>('g.node')
      .data(simNodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on('start', (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          }),
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClickRef.current(d.data);
      });

    // Shadow
    nodeEls.append('circle')
      .attr('r', (d) => rScale(d.data.totalCount) + 3)
      .attr('fill', 'rgba(0,0,0,0.07)')
      .attr('transform', 'translate(3,4)');

    // Main circle
    nodeEls.append('circle')
      .attr('class', 'node-circle')
      .attr('r', (d) => rScale(d.data.totalCount))
      .attr('fill', (d) => SOURCE_STYLES[d.data.primarySource].fill)
      .attr('stroke', (d) => SOURCE_STYLES[d.data.primarySource].stroke)
      .attr('stroke-width', 2)
      .attr('filter', (d) => `url(#glow-${d.data.primarySource})`)
      .on('mouseover', function (_, d) {
        d3.select(this).transition().duration(120)
          .attr('r', rScale(d.data.totalCount) + 5)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function (_, d) {
        d3.select(this).transition().duration(120)
          .attr('r', rScale(d.data.totalCount))
          .attr('stroke-width', 2);
      });

    // Label
    nodeEls.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', (d) => SOURCE_STYLES[d.data.primarySource].stroke)
      .attr('font-size', (d) => Math.max(10, Math.min(14, rScale(d.data.totalCount) * 0.42)))
      .attr('font-weight', '600')
      .attr('font-family', "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif")
      .attr('pointer-events', 'none')
      .attr('letter-spacing', '-0.3')
      .text((d) => `#${d.data.tagName}`);

    // Count
    nodeEls.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', (d) => rScale(d.data.totalCount) + 16)
      .attr('fill', '#A8A8A4')
      .attr('font-size', 10)
      .attr('font-family', "'Pretendard', 'Apple SD Gothic Neo', sans-serif")
      .attr('pointer-events', 'none')
      .text((d) => d.data.totalCount);

    sim.on('tick', () => {
      linkG.selectAll<SVGGElement, SimLink>('g.edge').each(function (d) {
        const sx = (d.source as SimNode).x ?? 0;
        const sy = (d.source as SimNode).y ?? 0;
        const tx = (d.target as SimNode).x ?? 0;
        const ty = (d.target as SimNode).y ?? 0;
        d3.select(this).selectAll('line').attr('x1', sx).attr('y1', sy).attr('x2', tx).attr('y2', ty);
      });
      nodeEls.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      sim.stop();
      svg.on('.zoom', null);
    };
  }, [nodes, edges]);

  // Search highlight — dims non-matching nodes/edges without restarting simulation
  useEffect(() => {
    if (!svgRef.current) return;
    const query = (searchQuery ?? '').trim().toLowerCase();
    const svg = d3.select(svgRef.current);
    if (!query) {
      svg.selectAll('g.node').attr('opacity', 1);
      svg.selectAll('g.edge').attr('opacity', 1);
      return;
    }
    svg.selectAll<SVGGElement, SimNode>('g.node')
      .attr('opacity', (d) => d.data.tagName.toLowerCase().includes(query) ? 1 : 0.15);
    svg.selectAll<SVGGElement, SimLink>('g.edge')
      .attr('opacity', (d) => {
        const s = d.source as SimNode;
        const t = d.target as SimNode;
        return (s.data.tagName.toLowerCase().includes(query) || t.data.tagName.toLowerCase().includes(query)) ? 0.8 : 0.08;
      });
  }, [searchQuery]);

  // Selected node highlight — runs without restarting simulation
  useEffect(() => {
    if (!svgRef.current || !radiusScaleRef.current) return;
    const scale = radiusScaleRef.current;
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, SimNode>('.node-circle')
      .attr('stroke-width', (d) => (d.data.tagId === selectedNodeId ? 4 : 2))
      .attr('r', (d) =>
        d.data.tagId === selectedNodeId
          ? scale(d.data.totalCount) + 4
          : scale(d.data.totalCount),
      );
  }, [selectedNodeId]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
