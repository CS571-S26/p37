import { C, S, notify } from './state.js'
import { recolorAll, updateStats } from './graph.js'
import { extractWikilinks } from './io.js'

/**
 * @param {boolean} save
 * @param {{ title: string, body: string, editorNodeId: number | null }} form
 */
export function applyEditorClose(save, form) {
  const title = (form.title || '').trim() || 'Untitled'
  const body = form.body || ''

  if (save) {
    if (form.editorNodeId != null) {
      const n = S.nodes.find(x => x.id === form.editorNodeId)
      if (n) {
        n.label = title
        n.content = body
      }
      const newLinks = extractWikilinks(body)
      newLinks.forEach(target => {
        const tgt = S.nodes.find(n => n.label.toLowerCase() === target.toLowerCase())
        if (tgt) {
          const ex = S.edges.find(
            e => (e.s === form.editorNodeId && e.t === tgt.id) || (e.s === tgt.id && e.t === form.editorNodeId),
          )
          if (!ex) S.edges.push({ s: form.editorNodeId, t: tgt.id })
        }
      })
    } else {
      const angle = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 120
      const id = S.uid++
      S.nodes.push({
        id,
        label: title,
        color: C.gray,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        isGhost: false,
        content: body,
      })
      extractWikilinks(body).forEach(target => {
        const tgt = S.nodes.find(n => n.label.toLowerCase() === target.toLowerCase())
        if (tgt) {
          const ex = S.edges.find(
            e => (e.s === id && e.t === tgt.id) || (e.s === tgt.id && e.t === id),
          )
          if (!ex) S.edges.push({ s: id, t: tgt.id })
        }
      })
    }
    recolorAll()
    updateStats()
  }
  S.focusNodeId = null
  S.editorNodeId = null
  notify()
}
