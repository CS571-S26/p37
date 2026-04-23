import { C, S, notify } from './state.js'

export function colorForDeg(deg) {
  if (deg === 0) return C.gray
  if (deg <= 2)  return C.blue
  if (deg <= 5)  return C.purple
  if (deg <= 9)  return C.teal
  return C.amber
}

export function nodeRadius(id) {
  const deg = S.edges.filter(e => e.s === id || e.t === id).length
  return 5 + deg * 3
}

export function recolorAll() {
  S.nodes.forEach(n => {
    if (n.isGhost || n._customColor) return
    n.color = colorForDeg(S.edges.filter(e => e.s === n.id || e.t === n.id).length)
  })
}

export function addNode(wx, wy, label) {
  S.nodes.push({ id: S.uid++, x: wx, y: wy, label, color: C.purple, vx: 0, vy: 0, fx: null, fy: null, isGhost: false })
  updateStats()
}

export function deleteNode(n) {
  S.nodes = S.nodes.filter(x => x.id !== n.id)
  S.edges = S.edges.filter(e => e.s !== n.id && e.t !== n.id)
  if (S.selected && S.selected.id === n.id) S.selected = null
  recolorAll()
  updateStats()
}

export function deleteSelected() {
  if (S.selected) deleteNode(S.selected)
}

export function toWorld(cx, cy) {
  return { x: (cx - S.camX) / S.zoom, y: (cy - S.camY) / S.zoom }
}

export function getNodeAt(cx, cy) {
  const { x, y } = toWorld(cx, cy)
  for (let i = S.nodes.length - 1; i >= 0; i--) {
    const n = S.nodes[i]
    if (Math.hypot(x - n.x, y - n.y) < nodeRadius(n.id) + 3) return n
  }
  return null
}

export function getEdgeAt(cx, cy) {
  const { x, y } = toWorld(cx, cy)
  let best = null, bestD = 7 / S.zoom
  S.edges.forEach(e => {
    const a = S.nodes.find(n => n.id === e.s), b = S.nodes.find(n => n.id === e.t)
    if (!a || !b) return
    const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy
    if (!len2) return
    let t = ((x - a.x) * dx + (y - a.y) * dy) / len2
    t = Math.max(0, Math.min(1, t))
    const d = Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy))
    if (d < bestD) { bestD = d; best = e }
  })
  return best
}

export function tick() {
  if (!S.physicsOn || !S.nodes.length) return
  const rep = 9000, spring = 120, damp = 0.84, dt = 0.38
  for (let i = 0; i < S.nodes.length; i++) {
    S.nodes[i].vx *= damp; S.nodes[i].vy *= damp
    for (let j = i + 1; j < S.nodes.length; j++) {
      let dx = S.nodes[i].x - S.nodes[j].x, dy = S.nodes[i].y - S.nodes[j].y
      if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) { dx = (Math.random() - .5) * 0.5; dy = (Math.random() - .5) * 0.5 }
      let d = Math.sqrt(dx * dx + dy * dy) || 1
      const minD = nodeRadius(S.nodes[i].id) + nodeRadius(S.nodes[j].id) + 20
      let f = rep / (d * d) + (d < minD ? (minD - d) * 2 : 0)
      let ux = dx / d, uy = dy / d
      S.nodes[i].vx += ux * f * dt; S.nodes[i].vy += uy * f * dt
      S.nodes[j].vx -= ux * f * dt; S.nodes[j].vy -= uy * f * dt
    }
  }
  S.edges.forEach(e => {
    const a = S.nodes.find(n => n.id === e.s), b = S.nodes.find(n => n.id === e.t)
    if (!a || !b) return
    let dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1
    let f = (d - spring) * 0.1, ux = dx / d, uy = dy / d
    a.vx += ux * f * dt; a.vy += uy * f * dt
    b.vx -= ux * f * dt; b.vy -= uy * f * dt
  })
  S.nodes.forEach(n => {
    n.vx += -n.x * 0.003 * dt; n.vy += -n.y * 0.003 * dt
    if (n.fx !== null) { n.x = n.fx; n.y = n.fy; return }
    const spd = Math.hypot(n.vx, n.vy)
    if (spd > 30) { n.vx = n.vx / spd * 30; n.vy = n.vy / spd * 30 }
    n.x += n.vx; n.y += n.vy
  })
}

export function updateStats() {
  notify()
}

export function resetView() {
  S.zoom = 1
  S.camX = S.W / 2
  S.camY = S.H / 2
}
