import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './GraphView.css'
import { S, PALETTE } from './lib/state.js'
import { initAppBridge } from './lib/bridge.js'
import { loadVaultFile, saveVault } from './lib/io.js'
import { applyEditorClose } from './lib/editorActions.js'
import { deleteSelected, resetView } from './lib/graph.js'
import {
  cancelInlineNode,
  confirmInlineNode,
  getEditorNodeForColor,
  resetSelectedColorToAuto,
  searchNodes,
  setEditorContext,
  setSelectedColorFromSwatch,
  startFresh,
  startInlineNode,
  toggleCutMode,
  toggleLinkMode,
  togglePhysics,
} from './lib/uiActions.js'
import { useGraphEngine } from './hooks/useGraphEngine.js'

export default function GraphView() {
  const [_, setTick] = useState(0)
  const onUINotify = useCallback(() => setTick(n => n + 1), [])

  const [mainUi, setMainUi] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [edTitle, setEdTitle] = useState('')
  const [edBody, setEdBody] = useState('')
  const [edNodeId, setEdNodeId] = useState(/** @type {number | null} */(null))
  const [search, setSearch] = useState('')

  const formRef = useRef({ title: '', body: '', editorNodeId: /** @type {number | null} */(null) })
  useEffect(() => {
    formRef.current = { title: edTitle, body: edBody, editorNodeId: edNodeId }
  }, [edTitle, edBody, edNodeId])

  const getEditorForm = useCallback(() => formRef.current, [])

  useEffect(() => {
    initAppBridge({ showMainUI: () => setMainUi(true) })
  }, [])

  useEffect(() => {
    document.body.classList.add('graph-page')
    return () => document.body.classList.remove('graph-page')
  }, [])

  const fileInputRef = useRef(/** @type {HTMLInputElement | null} */(null))
  const labelRef = useRef(/** @type {HTMLDivElement | null} */(null))
  const inlineWrapRef = useRef(/** @type {HTMLDivElement | null} */(null))
  const nodeInputRef = useRef(/** @type {HTMLInputElement | null} */(null))
  const dropZoneRef = useRef(/** @type {HTMLDivElement | null} */(null))

  const getEditorOpen = useCallback(() => editorOpen, [editorOpen])
  const getMainUiVisible = useCallback(() => mainUi, [mainUi])

  const closeEditorUI = useCallback(() => {
    setEditorOpen(false)
    setEdTitle('')
    setEdBody('')
    setEdNodeId(null)
  }, [])

  const openEditorForNode = useCallback((nodeId) => {
    if (nodeId) {
      setEditorContext(nodeId)
      const n = S.nodes.find(x => x.id === nodeId)
      setEdTitle(n?.label ?? '')
      setEdBody(n?.content ?? '')
      setEdNodeId(nodeId)
    } else {
      setEditorContext(null)
      setEdTitle('')
      setEdBody('')
      setEdNodeId(null)
    }
    setEditorOpen(true)
  }, [])

  const canvasRef = useGraphEngine({
    onUINotify,
    getEditorOpen,
    getEditorForm,
    onOpenEditor: (id) => {
      openEditorForNode(id)
    },
    onCloseEditorUI: closeEditorUI,
    labelRef,
    inlineWrapRef,
    nodeInputRef,
    dropZoneRef,
    getMainUiVisible,
  })

  const node = getEditorNodeForColor()

  return (
    <div className="app-root">
      <Link
        to="/"
        className="graph-back-link"
        style={{
          position: 'fixed',
          zIndex: 20000,
          top: 10,
          left: 10,
          color: 'rgba(255,255,255,0.85)',
          textDecoration: 'none',
          font: '14px/1.2 system-ui, sans-serif',
          padding: '6px 10px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        ← Tasks
      </Link>
      <canvas
        id="canvas"
        ref={canvasRef}
        tabIndex={0}
        aria-label="Graph canvas"
      />

      <div id="drop-overlay" className={mainUi ? 'hidden' : ''} aria-hidden={mainUi}>
        <div id="drop-zone" ref={dropZoneRef} role="presentation">
          <div className="icon" aria-hidden>⬡</div>
          <h2>Open your vault</h2>
          <p>
            Drag a <code>.md</code> vault file here
            <br />
            or use the buttons below
          </p>
          <div className="open-btns">
            <button
              type="button"
              className="open-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📄 Open vault file
            </button>
            <button
              type="button"
              className="open-btn"
              style={{ borderColor: 'rgba(124,111,205,.5)', background: 'rgba(124,111,205,.22)' }}
              onClick={startFresh}
            >
              ✎ Start fresh
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          id="file-input"
          accept=".md"
          onChange={e => {
            loadVaultFile(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
      </div>

      <div id="toolbar" style={{ display: mainUi ? 'flex' : 'none' }} role="toolbar" aria-label="Graph tools">
        <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
          📄 Open
        </button>
        <button type="button" className="btn" onClick={saveVault}>
          💾 Save
        </button>
        <div className="sep" />
        <button
          type="button"
          className="btn"
          id="btn-newfile"
          onClick={() => {
            startInlineNode()
            setTimeout(() => nodeInputRef.current?.focus(), 0)
          }}
        >
          ＋ New node
        </button>
        <button
          type="button"
          className={`btn${S.linkMode ? ' active' : ''}`}
          id="btn-link"
          onClick={toggleLinkMode}
        >
          ⟷ Link (A)
        </button>
        <button
          type="button"
          className={`btn${S.cutMode ? ' active' : ''}`}
          id="btn-cut"
          onClick={toggleCutMode}
        >
          ✂ Cut (C)
        </button>
        <div className="sep" />
        <button type="button" className="btn" onClick={deleteSelected}>
          🗑
        </button>
        <div className="sep" />
        <button type="button" className="btn" onClick={resetView}>
          ⊡
        </button>
        <button type="button" className="btn" onClick={togglePhysics} id="btn-phys">
          {S.physicsOn ? '⚡ Physics' : '⏸ Paused'}
        </button>
      </div>

      <div id="stats" style={{ display: mainUi ? 'block' : 'none' }}>
        <b>{S.nodes.filter(n => !n.isGhost).length}</b> nodes &nbsp;·&nbsp; <b>{S.edges.length}</b> links
      </div>

      <div id="search-wrap" style={{ display: mainUi ? 'flex' : 'none' }}>
        <span style={{ color: '#444', fontSize: 13 }} aria-hidden>⌕</span>
        <input
          id="search-input"
          placeholder="Search nodes…"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            searchNodes(e.target.value)
          }}
        />
      </div>

      <div id="node-label" ref={labelRef} role="status" />
      <div
        id="info"
        style={{ display: mainUi ? 'block' : 'none' }}
      >
        Drag to pan · Scroll to zoom · Double-click node to edit · Right-click to delete
      </div>

      <div id="node-input-wrap" ref={inlineWrapRef}>
        <input
          id="node-input"
          ref={nodeInputRef}
          placeholder="Node name…"
          maxLength={60}
          spellCheck={false}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const v = nodeInputRef.current?.value?.trim() ?? ''
              confirmInlineNode(v)
              if (nodeInputRef.current) nodeInputRef.current.value = ''
              onUINotify()
              canvasRef.current?.focus()
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              cancelInlineNode()
              onUINotify()
              canvasRef.current?.focus()
            }
          }}
        />
      </div>

      <div id="legend" style={{ display: mainUi ? 'block' : 'none' }} aria-label="Node degree legend">
        <div>
          <span className="dot" style={{ background: '#888880' }} />0 links &nbsp;{' '}
          <span className="dot" style={{ background: '#5dade2' }} />1–2 &nbsp;{' '}
          <span className="dot" style={{ background: '#7c6fcd' }} />3–5
        </div>
        <div>
          <span className="dot" style={{ background: '#48c9b0' }} />6–9 &nbsp;{' '}
          <span className="dot" style={{ background: '#f39c12' }} />10+
        </div>
      </div>

      <div id="editor" className={editorOpen ? 'open' : ''}>
        <div id="editor-header">
          <input
            id="editor-title"
            placeholder="Untitled"
            maxLength={80}
            spellCheck={false}
            value={edTitle}
            onChange={e => setEdTitle(e.target.value)}
          />
          <button
            type="button"
            id="editor-close"
            onClick={() => {
              applyEditorClose(false, formRef.current)
              closeEditorUI()
            }}
            title="Discard"
          >
            ✕
          </button>
        </div>
        <div id="editor-body">
          <textarea
            id="editor-textarea"
            placeholder={'Start writing your note…\n\nUse [[Note Name]] to link to other notes.'}
            value={edBody}
            onChange={e => setEdBody(e.target.value)}
          />
        </div>
        <div id="editor-color-row">
          <label>Color</label>
          <div id="editor-swatches">
            {PALETTE.map(col => (
              <div
                key={col}
                className={'cswatch' + (node?._customColor && node?.color === col ? ' active' : '')}
                style={{ background: col }}
                title={col}
                onClick={() => {
                  setSelectedColorFromSwatch(col)
                  onUINotify()
                }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelectedColorFromSwatch(col)}
              />
            ))}
          </div>
          <button
            type="button"
            id="editor-color-reset"
            title="Reset to auto color"
            style={{ marginLeft: 4, background: 'none', border: '1px solid rgba(255,255,255,.12)', color: (node?._customColor) ? '#888' : '#444', borderRadius: 5, padding: '2px 7px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => {
              resetSelectedColorToAuto()
              onUINotify()
            }}
          >
            auto
          </button>
        </div>
        <div id="editor-footer">
          <span id="editor-hint">Changes saved to vault on close</span>
          <button
            type="button"
            id="editor-save"
            onClick={() => {
              applyEditorClose(true, {
                title: edTitle,
                body: edBody,
                editorNodeId: edNodeId,
              })
              closeEditorUI()
            }}
          >
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  )
}
