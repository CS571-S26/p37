import { C, S, notify } from './state.js'
import { recolorAll, resetView, toWorld, updateStats } from './graph.js'
import { showMainUI } from './bridge.js'

export function startFresh() {
  S.nodes = []
  S.edges = []
  S.uid = 1
  S.vaultFilename = 'vault.md'
  S.searchHighlight = null
  showMainUI()
  resetView()
  updateStats()
  notify()
  setTimeout(() => {
    startInlineNode()
  }, 50)
}

export function toggleLinkMode() {
  S.linkMode = !S.linkMode
  S.linkFirst = null
  notify()
}

export function toggleCutMode() {
  S.cutMode = !S.cutMode
  notify()
}

export function togglePhysics() {
  S.physicsOn = !S.physicsOn
  notify()
}

export function searchNodes(v) {
  S.searchHighlight = v.trim().toLowerCase() || null
  notify()
}

export function startInlineNode() {
  if (S.inlineActive) return
  S.inlineActive = true
  const w = toWorld(S.W / 2, S.H / 2)
  const id = S.uid++
  S.inlineNode = {
    id,
    label: '',
    color: C.purple,
    x: w.x,
    y: w.y,
    vx: 0,
    vy: 0,
    fx: w.x,
    fy: w.y,
    isGhost: false,
    content: '',
    _inline: true,
  }
  S.nodes.push(S.inlineNode)
  notify()
}

export function positionInlineInput() {
  // Screen layout is updated in the canvas rAF loop via DOM refs, not React state
}

export function confirmInlineNode(label) {
  const inlineNode = S.inlineNode
  if (inlineNode) {
    if (label) {
      inlineNode.label = label
      inlineNode.fx = null
      inlineNode.fy = null
      inlineNode._inline = false
      S.nodes.forEach(n => {
        if (n === inlineNode || n.isGhost || n._inline) return
        if (n.fx !== null && Math.hypot(n.x - inlineNode.x, n.y - inlineNode.y) < 5) {
          n.fx = null; n.fy = null
          n.vx = (Math.random() - .5) * 2; n.vy = (Math.random() - .5) * 2
        }
      })
      recolorAll()
      updateStats()
    } else {
      S.nodes = S.nodes.filter(n => n !== inlineNode)
    }
  }
  S.inlineNode = null
  S.inlineActive = false
  notify()
}

export function cancelInlineNode() {
  if (S.inlineNode) {
    S.nodes = S.nodes.filter(n => n !== S.inlineNode)
    S.inlineNode = null
  }
  S.inlineActive = false
  notify()
}

export function setSelectedColorFromSwatch(col) {
  if (S.editorNodeId == null) return
  const n = S.nodes.find(x => x.id === S.editorNodeId)
  if (n) {
    n.color = col
    n._customColor = true
  }
  notify()
}

export function resetSelectedColorToAuto() {
  if (S.editorNodeId == null) return
  const n = S.nodes.find(x => x.id === S.editorNodeId)
  if (n) {
    n._customColor = false
    recolorAll()
  }
  notify()
}

export function getEditorNodeForColor() {
  if (S.editorNodeId == null) return null
  return S.nodes.find(x => x.id === S.editorNodeId) || null
}

export function setEditorContext(nodeId) {
  S.editorNodeId = nodeId
  S.focusNodeId = nodeId || null
  notify()
}

export function clearEditorContext() {
  S.editorNodeId = null
  notify()
}
