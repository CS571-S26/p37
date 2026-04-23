import { useEffect, useRef } from 'react'
import { S, setNotify } from '../lib/state.js'
import { draw } from '../lib/draw.js'
import { getEdgeAt, getNodeAt, nodeRadius, tick, toWorld, deleteNode, recolorAll, updateStats } from '../lib/graph.js'
import { loadVaultFile } from '../lib/io.js'
import { applyEditorClose } from '../lib/editorActions.js'
import {
  cancelInlineNode,
  startInlineNode,
} from '../lib/uiActions.js'

/**
 * @param {object} o
 * @param {() => void} o.onUINotify
 * @param {() => boolean} o.getEditorOpen
 * @param {() => { title: string, body: string, editorNodeId: number | null }} o.getEditorForm
 * @param {() => void} o.onOpenEditor
 * @param {() => void} o.onCloseEditorUI
 * @param {import('react').RefObject<HTMLDivElement | null>} o.labelRef
 * @param {import('react').RefObject<HTMLDivElement | null>} o.inlineWrapRef
 * @param {import('react').RefObject<HTMLInputElement | null>} o.nodeInputRef
 * @param {import('react').RefObject<HTMLDivElement | null>} o.dropZoneRef
 * @param {() => boolean} o.getMainUiVisible
 */
export function useGraphEngine({
  onUINotify,
  getEditorOpen,
  getEditorForm,
  onOpenEditor,
  onCloseEditorUI,
  labelRef,
  inlineWrapRef,
  nodeInputRef,
  dropZoneRef,
  getMainUiVisible,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    setNotify(onUINotify)
    return () => setNotify(() => {})
  }, [onUINotify])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    S.ctx = ctx

    function resize() {
      S.W = canvas.width = canvas.offsetWidth
      S.H = canvas.height = canvas.offsetHeight
      draw()
    }
    resize()
    const onResize = () => {
      resize()
    }
    window.addEventListener('resize', onResize)

    function positionInline() {
      if (!S.inlineNode || !inlineWrapRef.current) return
      const sx = S.inlineNode.x * S.zoom + S.camX
      const sy = S.inlineNode.y * S.zoom + S.camY
      const r = nodeRadius(S.inlineNode.id)
      const wrap = inlineWrapRef.current
      wrap.style.display = 'block'
      wrap.style.left = `${sx}px`
      wrap.style.top = `${sy + r * S.zoom + 32}px`
    }

    function loop() {
      tick()
      draw()
      if (S.inlineActive && S.inlineNode) positionInline()
      else if (inlineWrapRef.current) inlineWrapRef.current.style.display = 'none'
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const labelEl = () => labelRef.current
    const nodeInp = () => nodeInputRef.current

    function onMouseMove(e) {
      const n = getNodeAt(e.clientX, e.clientY)
      S.hovered = n
      S.hoveredEdge = !n && !S.dragging ? getEdgeAt(e.clientX, e.clientY) : null
      canvas.style.cursor = S.hoveredEdge && S.cutMode
        ? 'crosshair'
        : S.dragging
          ? 'grabbing'
          : 'grab'
      const le = labelEl()
      if (le) {
        if (n) {
          const deg = S.edges.filter(x => x.s === n.id || x.t === n.id).length
          le.innerHTML = `${n.label}<small>${deg} connection${deg !== 1 ? 's' : ''}${n.isGhost ? ' · unresolved ref' : ''}</small>`
          le.style.display = 'block'
          le.style.left = `${e.clientX + 14}px`
          le.style.top = `${e.clientY - 28}px`
        } else {
          le.style.display = 'none'
        }
      }
      if (S.dragging) {
        const w = toWorld(e.clientX - S.dragOffX, e.clientY - S.dragOffY)
        S.dragging.fx = w.x; S.dragging.fy = w.y; S.dragging.x = w.x; S.dragging.y = w.y
      } else if (S.panStart) {
        S.camX = S.camStart.x + (e.clientX - S.panStart.x)
        S.camY = S.camStart.y + (e.clientY - S.panStart.y)
      }
    }

    function onMouseDown(e) {
      const n = getNodeAt(e.clientX, e.clientY)
      if (S.cutMode && !n && S.hoveredEdge) {
        S.edges = S.edges.filter(x => x !== S.hoveredEdge)
        S.hoveredEdge = null
        recolorAll()
        updateStats()
        S.cutMode = false
        onUINotify()
        return
      }
      if (n) {
        if (e.shiftKey) {
          S.focusNodeId = (S.focusNodeId === n.id) ? null : n.id
          onUINotify()
          return
        }
        if (S.linkMode) {
          if (!S.linkFirst) { S.linkFirst = n; return }
          if (S.linkFirst.id !== n.id) {
            const ex = S.edges.find(ee => (ee.s === S.linkFirst.id && ee.t === n.id) || (ee.s === n.id && ee.t === S.linkFirst.id))
            if (!ex) { S.edges.push({ s: S.linkFirst.id, t: n.id }); recolorAll(); updateStats() }
            S.linkFirst = null
            S.linkMode = false
            onUINotify()
          }
          return
        }
        S.selected = n
        S.dragOffX = e.clientX - n.x * S.zoom - S.camX
        S.dragOffY = e.clientY - n.y * S.zoom - S.camY
        S.dragging = n; n.fx = n.x; n.fy = n.y
      } else {
        if (getEditorOpen()) {
          S.panStart = { x: e.clientX, y: e.clientY }
          S.camStart = { x: S.camX, y: S.camY }
          return
        }
        S.selected = null
        S.focusNodeId = null
        S.panStart = { x: e.clientX, y: e.clientY }
        S.camStart = { x: S.camX, y: S.camY }
        onUINotify()
      }
    }

    function onMouseUp() {
      if (S.dragging) { S.dragging.fx = null; S.dragging.fy = null; S.dragging = null }
      S.panStart = null
    }

    function onContextMenu(e) {
      e.preventDefault()
      const n = getNodeAt(e.clientX, e.clientY)
      if (n) { deleteNode(n); onUINotify(); return }
      const edge = getEdgeAt(e.clientX, e.clientY)
      if (edge) {
        S.edges = S.edges.filter(x => x !== edge)
        S.hoveredEdge = null
        recolorAll()
        updateStats()
        onUINotify()
      }
    }

    function onWheel(e) {
      e.preventDefault()
      const f = e.deltaY < 0 ? 1.09 : 0.92
      const wx = (e.clientX - S.camX) / S.zoom, wy = (e.clientY - S.camY) / S.zoom
      S.zoom = Math.min(5, Math.max(0.04, S.zoom * f))
      S.camX = e.clientX - wx * S.zoom
      S.camY = e.clientY - wy * S.zoom
    }

    function onDblClick(e) {
      const n = getNodeAt(e.clientX, e.clientY)
      if (n) onOpenEditor(n.id)
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('contextmenu', onContextMenu)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('dblclick', onDblClick)

    const onDragOver = e => {
      e.preventDefault()
      if (getMainUiVisible()) return
      dropZoneRef.current?.classList.add('drag-over')
    }
    const onDragLeave = e => {
      if (!e.relatedTarget) dropZoneRef.current?.classList.remove('drag-over')
    }
    const onDrop = e => {
      e.preventDefault()
      dropZoneRef.current?.classList.remove('drag-over')
      const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.md'))
      if (files.length) loadVaultFile(files[0])
    }

    document.addEventListener('dragover', onDragOver)
    document.addEventListener('dragleave', onDragLeave)
    document.addEventListener('drop', onDrop)

    function isTyping() {
      const t = document.activeElement?.tagName
      return t === 'INPUT' || t === 'TEXTAREA'
    }

    function onKeyDown(e) {
      if (e.key === 'Enter' && !isTyping() && !getEditorOpen()) {
        e.preventDefault()
        startInlineNode()
        setTimeout(() => nodeInp()?.focus(), 0)
        onUINotify()
        return
      }
      if (e.key === 'Escape') {
        if (S.inlineActive) { e.preventDefault(); cancelInlineNode(); onUINotify(); canvas.focus(); return }
        S.linkMode = false; S.cutMode = false; S.linkFirst = null
        onUINotify()
        if (getEditorOpen()) {
          e.preventDefault()
          const f = getEditorForm()
          applyEditorClose(false, f)
          onCloseEditorUI()
        }
        return
      }
      if (!isTyping() && !getEditorOpen()) {
        if (e.key === 'a' || e.key === 'A') { e.preventDefault(); S.linkMode = !S.linkMode; S.linkFirst = null; onUINotify() }
        if (e.key === 'c' || e.key === 'C') { e.preventDefault(); S.cutMode = !S.cutMode; onUINotify() }
        if (e.key === 'd' || e.key === 'D') { e.preventDefault(); if (S.selected) deleteNode(S.selected); onUINotify() }
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && S.selected && !isTyping()) {
        deleteNode(S.selected)
        onUINotify()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafRef.current)
      S.ctx = null
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('contextmenu', onContextMenu)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('dblclick', onDblClick)
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('dragleave', onDragLeave)
      document.removeEventListener('drop', onDrop)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [
    onUINotify,
    getEditorOpen,
    getEditorForm,
    onOpenEditor,
    onCloseEditorUI,
    labelRef,
    inlineWrapRef,
    nodeInputRef,
    dropZoneRef,
    getMainUiVisible,
  ])

  return canvasRef
}
