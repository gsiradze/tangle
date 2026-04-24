import { segmentsIntersect } from './geometry';
import type { Edge, Graph, Vec2 } from './types';

function endpoints(edge: Edge, graph: Graph): readonly [Vec2, Vec2] {
  return [graph.vertices[edge.a]!, graph.vertices[edge.b]!];
}

function sharesVertex(e1: Edge, e2: Edge): boolean {
  return e1.a === e2.a || e1.a === e2.b || e1.b === e2.a || e1.b === e2.b;
}

export function countCrossings(graph: Graph): number {
  const { edges } = graph;
  let count = 0;
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i]!;
      const e2 = edges[j]!;
      if (sharesVertex(e1, e2)) continue;
      const [a, b] = endpoints(e1, graph);
      const [c, d] = endpoints(e2, graph);
      if (segmentsIntersect(a, b, c, d)) count++;
    }
  }
  return count;
}

export function edgesIncidentTo(vertexId: number, graph: Graph): Edge[] {
  return graph.edges.filter((e) => e.a === vertexId || e.b === vertexId);
}

export function findCrossingPairs(graph: Graph): [number, number][] {
  const { edges } = graph;
  const pairs: [number, number][] = [];
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i]!;
      const e2 = edges[j]!;
      if (sharesVertex(e1, e2)) continue;
      const [a, b] = endpoints(e1, graph);
      const [c, d] = endpoints(e2, graph);
      if (segmentsIntersect(a, b, c, d)) pairs.push([i, j]);
    }
  }
  return pairs;
}

export function hasSingleVertexCover(graph: Graph, pairs: readonly [number, number][]): boolean {
  if (pairs.length === 0) return true;
  const vertexCount = graph.vertices.length;
  for (let v = 0; v < vertexCount; v++) {
    let covers = true;
    for (const [ei, ej] of pairs) {
      const e1 = graph.edges[ei]!;
      const e2 = graph.edges[ej]!;
      const touches = e1.a === v || e1.b === v || e2.a === v || e2.b === v;
      if (!touches) {
        covers = false;
        break;
      }
    }
    if (covers) return true;
  }
  return false;
}

export function crossingEdgeIndices(graph: Graph): Set<number> {
  const { edges } = graph;
  const result = new Set<number>();
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const e1 = edges[i]!;
      const e2 = edges[j]!;
      if (sharesVertex(e1, e2)) continue;
      const [a, b] = endpoints(e1, graph);
      const [c, d] = endpoints(e2, graph);
      if (segmentsIntersect(a, b, c, d)) {
        result.add(i);
        result.add(j);
      }
    }
  }
  return result;
}

export function crossingsInvolving(vertexId: number, graph: Graph): number {
  const incident = edgesIncidentTo(vertexId, graph);
  let count = 0;
  for (const e1 of incident) {
    for (const e2 of graph.edges) {
      if (e1 === e2) continue;
      if (sharesVertex(e1, e2)) continue;
      const [a, b] = endpoints(e1, graph);
      const [c, d] = endpoints(e2, graph);
      if (segmentsIntersect(a, b, c, d)) count++;
    }
  }
  return count;
}
