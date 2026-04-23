export const C = {
  purple: '#a78bfa',
  blue:   '#38bdf8',
  teal:   '#2dd4bf',
  amber:  '#fbbf24',
  gray:   '#6b7280',
}

export const PALETTE = [
  '#a78bfa', '#7c3aed', '#c4b5fd',
  '#38bdf8', '#1d4ed8', '#93c5fd',
  '#2dd4bf', '#0e7490', '#67e8f9',
  '#4ade80', '#15803d', '#86efac',
  '#fbbf24', '#b45309', '#fde68a',
  '#fb923c', '#c2410c', '#fed7aa',
  '#f87171', '#be123c', '#fda4af',
  '#e879f9', '#86198f', '#f0abfc',
  '#6b7280', '#e2e8f0', '#f43f5e',
]

let _notify = () => {}
export function setNotify(fn) {
  _notify = fn
}
export function notify() {
  _notify()
}

export const S = {
  nodes: [],
  edges: [],
  selected: null,
  hovered: null,
  linkMode: false,
  linkFirst: null,
  cutMode: false,
  hoveredEdge: null,
  physicsOn: true,
  camX: 0,
  camY: 0,
  zoom: 1,
  dragging: null,
  dragOffX: 0,
  dragOffY: 0,
  panStart: null,
  camStart: null,
  searchHighlight: null,
  uid: 1,
  W: 0,
  H: 0,
  ctx: null,
  focusNodeId: null,
  editorNodeId: null,
  vaultFilename: 'vault.md',
  inlineActive: false,
  inlineNode: null,
}
