// build-screen.js — iPad sidebar-split screen builder (Apple iOS 27 UI Kit)
// ---------------------------------------------------------------------------
// WHAT: composes a whole NavigationSplitView screen from kit components in ONE
//       run_code pass, driving fields via FROZEN override ids (stable per master).
// WHY : kills the re-probing tax. You edit SPEC (data), not the placement code.
// USE : Read this file, edit the SPEC block for your screen, submit to
//       mcp__sketch__run_code. It appends a new artboard to the selected page.
//       (Delete/rename any prior artboard of the same name first.)
// PATTERN COVERED: status bar + glass sidebar (toolbar trimmed to collapse
//       toggle, header, items with selection/badge/icon, bottom-pinned items) +
//       content large-title nav bar + optional bespoke status banner + grouped
//       Lists/Rows sections. For other patterns, extend N/ID from override-map.json.
// NOTES BAKED IN (see component-fields.md): selection = nested State swap using
//       the IN-DOCUMENT Selected id harvested from an Examples/Sidebar/Light
//       instance (library id won't resolve); the swap re-paths nested overrides
//       (item.s.* vs item.d.*); Text layers auto-recenter -> we pin frame.x.
// ---------------------------------------------------------------------------
// PORTABILITY — what is / isn't stable across users & machines:
//   • ID / N / LIBID are UUIDs baked into the "Apple iOS 27 UI Kit" LIBRARY FILE,
//     not the document or the machine — identical for every user on the SAME kit
//     version. They only drift when Apple ships a NEW kit version; then re-run the
//     dump to refresh override-map.json and reconcile these. Drift is now LOUD:
//     the script reports `misses` and returns ok:false if any id/component fails
//     to resolve (instead of silently building a broken screen).
//   • The Selected-state id is NOT hardcoded — harvested at runtime, so it is
//     correct in any user's document.
//   • Icons: SPEC names SF Symbols (e.g. 'ferry.fill'). There are NO bundled image
//     assets. Before submitting, resolve each name via the `sfsymbols` MCP into the
//     ICONS map (agent-side — the MCP isn't callable from run_code); icons render as
//     recolorable vectors via ShapePath.fromSVGPath. Unresolved names -> MISS.icons,
//     ok:false. No MCP? use the Swift-render fallback (component-fields.md §4).
// ---------------------------------------------------------------------------
const sketch = require('sketch')
const doc = sketch.getSelectedDocument()
const page = doc.selectedPage

// ============================ SPEC (edit per screen) ============================
const SPEC = {
  artboard: { name: 'Home — iPad — Light', x: 0, y: 0, w: 1210, h: 834, bg: '#F2F5F8' },
  statusApp: 'FreqLab',
  sidebar: {
    header: 'FreqLab',
    top: [
      { title: 'Home',       icon: 'house.fill', selected: true },
      { title: 'Airplanes',  icon: 'airplane',   badge: '7' },
      { title: 'Ships',      icon: 'ferry.fill' },
      { title: 'Manual SDR', icon: 'antenna.radiowaves.left.and.right' }
    ],
    bottom: [ { title: 'Settings', icon: 'gearshape' } ]
  },
  navTitle: 'Home',
  banner: {
    dot: '#34C759',
    title: 'Receiving · Airplanes',
    mono: '192.168.1.10:1234 · 1090 MHz · 7 aircraft',
    pill: 'LIVE'
  },
  sections: [
    { header: 'START RECEIVING', rows: [
      { title: 'Airplanes',  detail: '7 in range',        icon: 'airplane' },
      { title: 'Ships',      detail: 'Tap to start',      icon: 'ferry.fill' },
      { title: 'Manual SDR', detail: 'Tune any frequency', icon: 'antenna.radiowaves.left.and.right' }
    ]},
    { header: 'LEARN', rows: [
      { title: 'New to SDR? Start here', detail: 'About 2 min', icon: 'lightbulb' }
    ]}
  ]
}

// ===================== Icons (agent-resolved SF-Symbol vectors) =====================
// SPEC names SF Symbols. The `sfsymbols` MCP is NOT callable from run_code, so BEFORE
// submitting: for each symbol name used in SPEC, call mcp__sfsymbols__export_symbol{name},
// take the SVG `<path d="…">`, and add it here — only this screen's handful:
//   const ICONS = { 'ferry.fill': { d: 'M85…Z' }, 'airplane': { d: '…' }, … }
// Missing name -> MISS.icons -> ok:false. No sfsymbols MCP? fall back to the Swift
// render + place as an Image (see component-fields.md §4). fromSVGPath ignores the SVG
// fill, so one path recolors freely.
const ICONS = {}
const ICON_FILL = '#1E5C8Fff'  // blue/600 accent — the recolor applied in Sketch
const TRANSPARENT_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// ===================== Component names (Light) =====================
const N = {
  status:  'Status Bars/iPad/Light Background/Full Screen/Menu Collapsed',
  toolbar: 'Sidebar/Light/Toolbar/Fullscreen',
  header:  'Sidebar/Light/Header/Header',
  item:    'Sidebar/Light/Items/Level 0',
  nav:     'Toolbars/Top (44pt)/Light/iPad/Large Title',
  row:     'Lists/Light/Rows/Default',
  glass:   'Liquid Glass/Light/Regular - Large'
}

// ===================== Frozen override ids (stable per master) =====================
const ID = {
  statusApp: '7F7C6FFE-B2AD-4E11-9E28-5EA6059C2FBD/D0401EE0-B535-48A7-B20E-498C911A3766_stringValue',
  toolbar: {
    leadBtn:    'BB3688B1-3603-469D-9257-6C7A6CDBC84C_isVisible',
    leadLabel:  'BB3688B1-3603-469D-9257-6C7A6CDBC84C/85E5E1D7-59AD-4F98-B4C4-82358F07D728_isVisible',
    composeBtn: '1A727239-BE30-46F0-951D-B0864CE640CE_isVisible'
  },
  header: {
    title:  '4224ABCC-B7B0-4D1A-AD33-DFB975E2B152_stringValue',
    detail: '84D6B942-C318-4215-8917-D4D5BE3FD6D5_stringValue'
  },
  item: {
    state:   '7BAB935A-BB95-47E2-967B-D03A048A1F7E_symbolID',
    capsule: '7BAB935A-BB95-47E2-967B-D03A048A1F7E_color:fill-0',
    d: { // default state
      title:     '7BAB935A-BB95-47E2-967B-D03A048A1F7E/D7CFD994-EA4E-48AC-AD71-D895EDAE6BB7/E7748126-C206-4B21-BD46-A2A74B0A4667/91A3818D-9750-4A6C-8437-3A1B994A19AF_stringValue',
      glyph:     '7BAB935A-BB95-47E2-967B-D03A048A1F7E/D7CFD994-EA4E-48AC-AD71-D895EDAE6BB7/54DA7770-77C8-41C1-8232-BC0DC61070F7/082650B2-553D-47EF-A770-308ED521A953_stringValue',
      detail:    '7BAB935A-BB95-47E2-967B-D03A048A1F7E/7DFC7B00-0A2C-4F1A-B3C4-095EC3D0C702/6A40A5B9-9D5E-4C06-AEAF-51588349215F_stringValue',
      detailVis: '7BAB935A-BB95-47E2-967B-D03A048A1F7E/7DFC7B00-0A2C-4F1A-B3C4-095EC3D0C702_isVisible'
    },
    s: { // selected state (paths shift after State swap)
      title:      '7BAB935A-BB95-47E2-967B-D03A048A1F7E/6233DA22-8361-4043-9DCB-3337BDAFC60D/E7748126-C206-4B21-BD46-A2A74B0A4667/91A3818D-9750-4A6C-8437-3A1B994A19AF_stringValue',
      glyphColor: '7BAB935A-BB95-47E2-967B-D03A048A1F7E/6233DA22-8361-4043-9DCB-3337BDAFC60D/54DA7770-77C8-41C1-8232-BC0DC61070F7/082650B2-553D-47EF-A770-308ED521A953_textColor',
      subVis:     '7BAB935A-BB95-47E2-967B-D03A048A1F7E/6233DA22-8361-4043-9DCB-3337BDAFC60D/E7748126-C206-4B21-BD46-A2A74B0A4667/A6CB64E7-2082-4255-9D17-54DC5E07E05E_isVisible',
      detailVis:  '7BAB935A-BB95-47E2-967B-D03A048A1F7E/C77FD00C-3D7A-4FE7-A8BA-256ED59EA6D8_isVisible'
    }
  },
  nav: {
    title: '98EFC2BE-2602-49E5-9F3E-8EA3BC34D085/79951736-07FF-4F03-B2E1-47869D61EBDD_stringValue',
    hide: [
      '76C5B5DF-09EB-4F31-960E-7E5B624F26F7_isVisible', // Back
      'D42D22A5-BAF9-4EF3-B4F1-9F2B9BEB23F4_isVisible', // Window Controls
      'E26B264E-3AD9-4D12-9EC2-ECB53DDE3942_isVisible', // Search
      'BE400785-720D-4548-AE8E-BB0D77C1996B_isVisible', // Leading - Button 1
      'D4636553-30E0-488C-9206-EC98C878783C_isVisible', // Leading - Button 2
      '4E9B9428-92BE-469B-9C5D-3CF45B3703FC_isVisible', // Trailing - Button 5
      '2D8A7CF1-2FCC-4D81-988B-D24FB9B1487C_isVisible'  // Trailing - Button 6
    ]
  },
  row: {
    title:   '94786D60-6912-4218-BF59-C0C269FE069D_stringValue',
    detail:  'E542C57C-584A-488A-BD8A-09C8BF596693/34DFFD8A-FF38-497F-9F30-9BADC081920F_stringValue',
    image:   'D2174AE0-458E-42D9-AA12-1D6CDCC682B6/83167BF0-31D4-43A9-A2E0-61BC83578398_image',
    editVis: 'D2174AE0-458E-42D9-AA12-1D6CDCC682B6/60BA652D-801E-46E5-8763-FC9DFDA6F55D_isVisible'
  }
}

// ============================ helpers ============================
const LIBID = 'C4648B33-1215-43AD-851E-D785ECD1113D'
const lib = sketch.Library.getLibraries().find(l => l.id === LIBID) || sketch.Library.getLibraries().find(l => l.name && l.name.includes('iOS'))
if (!lib) throw new Error('Apple iOS UI Kit library not found — add it to this document first.')
const MISS = { components: [], overrides: [], icons: [] }  // drift/resolution alarm: anything unresolved lands here -> ok:false
function symRef(name){ return lib.getImportableSymbolReferencesForDocument(doc).find(x => x.name === name) }
function place(name, parent, x, y, w){ const r = symRef(name); if (!r){ MISS.components.push(name); return null } const i = r.import().createNewInstance(); i.parent = parent; i.frame.x = x; i.frame.y = y; if (w) i.frame.width = w; return i }
function setOv(inst, id, val){ if (!inst) return false; const o = inst.overrides.find(x => x.id === id); if (o){ o.value = val; return true } MISS.overrides.push(id); return false }
function txt(parent, s, x, y, w, size, weight, color, align){
  const t = new sketch.Text({ parent, text: s, frame: { x, y, width: w, height: size + 8 } })
  t.style.fontFamily = (weight === 'mono' ? 'SF Mono' : 'SF Pro Text')
  if (weight !== 'mono') t.style.fontWeight = weight
  t.style.fontSize = size; t.style.textColor = color
  if (align) t.style.alignment = align
  t.frame.x = x; t.frame.y = y   // pin: Text auto-resizes width and re-centers
  return t
}
function rect(parent, name, x, y, w, h, fill, border, radius){
  const r = new sketch.ShapePath({ parent, name, frame: { x, y, width: w, height: h }, shapeType: sketch.ShapePath.ShapeType.Rectangle })
  r.style.fills = [{ color: fill, fillType: 'Color' }]
  r.style.borders = border ? [{ color: border, fillType: 'Color', thickness: 1, position: 'Inside' }] : []
  if (radius) r.points.forEach(p => p.cornerRadius = radius)
  return r
}
function placeIcon(parent, name, cx, cy, size){
  const ic = ICONS[name]
  if (!ic || !ic.d){ MISS.icons.push(name); return null }   // agent didn't resolve it via the sfsymbols MCP
  const p = sketch.ShapePath.fromSVGPath(ic.d); p.parent = parent
  const m = Math.max(p.frame.width, p.frame.height) || 1
  const s = size / m
  p.frame.width = p.frame.width * s; p.frame.height = p.frame.height * s
  p.frame.x = cx - p.frame.width / 2; p.frame.y = cy - p.frame.height / 2
  p.style.fills = [{ color: ICON_FILL, fillType: 'Color' }]; p.style.borders = []
  p.name = 'ic/' + name
  return p
}
function harvestSelectedStateId(){
  const insts = sketch.find('SymbolInstance', doc).filter(i => i.master && i.master.name === 'Examples/Sidebar/Light')
  let temp = null, src = insts[0]
  if (!src){ const r = symRef('Examples/Sidebar/Light'); if (r){ temp = r.import().createNewInstance(); temp.parent = page; temp.frame.x = -4000; temp.frame.y = -4000; src = temp } }
  let selId = null
  if (src){
    const tally = {}
    src.overrides.forEach(o => { if (o.property === 'symbolID' && o.affectedLayer && o.affectedLayer.name === 'State') tally[o.value] = (tally[o.value] || 0) + 1 })
    const entries = Object.entries(tally).sort((a, b) => a[1] - b[1])
    if (entries.length > 1) selId = entries[0][0]  // least frequent = Selected
  }
  if (temp) temp.remove()
  return selId
}

// ============================ builders ============================
function buildItem(ab, it, y, SEL){
  const i = place(N.item, ab, 0, y, 320); if (!i) return
  i.name = 'SB/' + it.title
  if (it.selected && SEL){
    setOv(i, ID.item.state, SEL)
    setOv(i, ID.item.capsule, it.selTint || '#CCE2F3')
    setOv(i, ID.item.s.title, it.title)
    setOv(i, ID.item.s.glyphColor, '#00000000')
    setOv(i, ID.item.s.subVis, false)
    setOv(i, ID.item.s.detailVis, false)
  } else {
    setOv(i, ID.item.d.title, it.title)
    setOv(i, ID.item.d.glyph, ' ')
    if (it.badge) setOv(i, ID.item.d.detail, it.badge)
    else setOv(i, ID.item.d.detailVis, false)
  }
  if (it.icon) placeIcon(ab, it.icon, 34, y + 22, 19)   // sidebar glyph was neutralized above
}
function buildRow(ab, r, y){
  const row = place(N.row, ab, 360, y, 790); if (!row) return
  row.name = 'Row/' + r.title
  setOv(row, ID.row.title, r.title)
  if (r.detail) setOv(row, ID.row.detail, r.detail)
  // the Accessories/Image slot is 48px and FILLS -> huge glyph. Neutralize it (keep the
  // leading space so the Title doesn't shift) and overlay a fit-to-26pt vector instead.
  if (r.icon){ setOv(row, ID.row.image, { base64: TRANSPARENT_PNG }); placeIcon(ab, r.icon, 400, y + 26, 26) }
  setOv(row, ID.row.editVis, false)
}
function buildBanner(ab, b, x, y, w){
  rect(ab, 'Banner/Card', x, y, w, 96, '#FFFFFFff', '#D9DEE6ff', 14)
  const dot = new sketch.ShapePath({ parent: ab, name: 'Banner/Dot', frame: { x: x + 28, y: y + 31, width: 10, height: 10 }, shapeType: sketch.ShapePath.ShapeType.Oval })
  dot.style.fills = [{ color: b.dot + 'ff', fillType: 'Color' }]; dot.style.borders = []
  txt(ab, b.title, x + 50, y + 21, 500, 17, 8, '#11171Fff', 'left')
  txt(ab, b.mono, x + 50, y + 53, 600, 13, 'mono', '#6B7685ff', 'left')
  if (b.pill){ rect(ab, 'Banner/Pill', x + w - 84, y + 35, 60, 26, '#F7DEE2ff', null, 13); txt(ab, b.pill, x + w - 84, y + 40, 60, 12, 9, '#B5283Aff', 'center') }
}

// ============================ build ============================
function build(){
  const s = SPEC
  const ab = new sketch.Artboard({ name: s.artboard.name, parent: page, frame: { x: s.artboard.x, y: s.artboard.y, width: s.artboard.w, height: s.artboard.h } })
  ab.background.enabled = true; ab.background.color = s.artboard.bg + 'ff'

  // sidebar glass surface (Sidebar/BG/Active isn't standalone-importable -> layer style)
  const gref = lib.getImportableLayerStyleReferencesForDocument(doc).find(r => r.name === N.glass)
  const grect = new sketch.ShapePath({ parent: ab, name: 'SidebarGlass', frame: { x: 0, y: 0, width: 320, height: s.artboard.h }, shapeType: sketch.ShapePath.ShapeType.Rectangle })
  if (gref){ const gshared = gref.import(); grect.sharedStyle = gshared; grect.style = gshared.style } else { MISS.components.push('layerStyle:' + N.glass) }
  grect.index = 0

  const sb = place(N.status, ab, 0, 0, s.artboard.w); if (sb){ sb.name = 'StatusBar'; setOv(sb, ID.statusApp, s.statusApp) }

  const tb = place(N.toolbar, ab, 0, 32, 320)
  if (tb){ tb.name = 'SidebarToolbar'; setOv(tb, ID.toolbar.leadBtn, false); setOv(tb, ID.toolbar.leadLabel, false); setOv(tb, ID.toolbar.composeBtn, false) }

  const hd = place(N.header, ab, 0, 86, 320)
  if (hd){ hd.name = 'SidebarHeader'; setOv(hd, ID.header.title, s.sidebar.header); setOv(hd, ID.header.detail, ' ') }

  const SEL = harvestSelectedStateId()
  let iy = 140
  s.sidebar.top.forEach(it => { buildItem(ab, it, iy, SEL); iy += 44 })
  let by = s.artboard.h - 44 - 24
  s.sidebar.bottom.forEach(it => { buildItem(ab, it, by, SEL); by += 44 })

  const nav = place(N.nav, ab, 320, 32, 890)
  if (nav){ nav.name = 'NavBar'; setOv(nav, ID.nav.title, s.navTitle); ID.nav.hide.forEach(h => setOv(nav, h, false)) }

  let cy = 168
  if (s.banner){ buildBanner(ab, s.banner, 360, 168, 790); cy = 168 + 96 + 28 }
  s.sections.forEach(sec => {
    const lbl = txt(ab, sec.header, 376, cy, 400, 13, 6, '#6B7685ff', 'left'); lbl.style.kerning = 0.5
    cy += 26
    const cardH = sec.rows.length * 52 + 8
    rect(ab, 'Card/' + sec.header, 360, cy, 790, cardH, '#FFFFFFff', '#D9DEE6ff', 14)
    let ry = cy + 4
    sec.rows.forEach(r => { buildRow(ab, r, ry); ry += 52 })
    cy += cardH + 28
  })
  return ab.id
}

const result = build()
const clean = MISS.components.length === 0 && MISS.overrides.length === 0 && MISS.icons.length === 0
console.log(JSON.stringify({ ok: clean, artboard: result, misses: MISS }))
// ok:false + misses.components/overrides => library drifted (new kit version): re-dump
//   override-map.json and reconcile N/ID.
// ok:false + misses.icons => you forgot to resolve those SF Symbols into ICONS via the
//   sfsymbols MCP before submitting.
