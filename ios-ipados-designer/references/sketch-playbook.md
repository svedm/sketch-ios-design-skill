# Sketch Playbook — building iOS/iPadOS mockups via MCP

How to build screens in Sketch with the **Sketch MCP** + the **Apple iOS 27 UI Kit** (Apple Design Resources). Verified against the live server. Pair with `sketch-library.md` (exact symbol/style/color names), `mapping.md` (what each element is), `metrics.md` (numbers).

## 0. Connect + bootstrap (once per session)

- The `sketch` MCP is in `.mcp.json` (`http://localhost:31126/mcp`, served by the Sketch app). Sketch must be **running with the target document open**. It's enabled in `.claude/settings.local.json` → `enabledMcpjsonServers`.
- **Load `get_guide` first.** Before any Sketch tool, call `get_guide` topic `mcp`; before creating/editing content also load `use` (and `symbols`, `layout`, `styling`, `assets`, `prototyping` as needed). The tools return errors nudging you to do this.
- **Connection quirk:** the server (GCDWebServer in Sketch) may drop the **first** request after idle — if a call returns empty, just retry; calls are stable once warm.
- **Tool registration:** in a normal interactive session the tools appear as `mcp__sketch__*`. If they don't (e.g. a resumed background session), you can still drive the server via raw JSON-RPC `tools/call` over curl to `:31126/mcp` — same tool names + args.

## The tools

| Tool | Use |
|---|---|
| `get_guide` | `{topic}` → operating guidance. Load `mcp` + `use` before mutating. |
| `get_document_info` | `{targetDocumentID?}` → file name, pages, layer counts, top-level frames. Omit ID for current doc. |
| `get_layer_tree_summary` | `{targetDocumentID?, layerID?, depth?}` → indented layer tree (type, name, id, frame, text). Prefer over `run_code` for exploring hierarchy. |
| `get_libraries` | `{targetDocumentID}` → attached libraries. |
| `get_design_assets` | `{targetDocumentID, kind, sourceLibraryID?, nameContains?}`, kind ∈ `symbol·textStyle·layerStyle·swatch·frameTemplate·graphicTemplate` → assets grouped by library. |
| `get_symbol_overrides` | `{targetDocumentID, symbolInstanceID, kind}`, kind ∈ `text·color·image·all` → overrides + `commonOverrideIDPrefix`. |
| `get_screenshot` | `{targetDocumentID, layerID?}` → PNG (layer or current selection). **`targetDocumentID` is required.** Use to visually verify. |
| `run_code` | `{script, title}` → runs Sketch plugin JS (ES2020). The workhorse for create/edit/style/layout/export. |

> `get_libraries` / `get_design_assets` were flaky in testing (empty responses). Enumerating via `run_code` + the Sketch JS API (below) is the reliable path.

## `run_code` rules

- Start every script with `const sketch = require('sketch')`.
- One focused action per call; re-resolve `doc`, selection, target layers each time.
- **No comments** inside submitted scripts. Report with `console.log(JSON.stringify({ ok, ... }))`.
- No Node `fs`. For images use `get_screenshot`; for asset files use `sketch.export` with an absolute `output`.

## 1. Artboard setup

Frame from `platform-ios-ipados.md` (iPhone 393×852 / Pro Max 440×956 / iPad 820×1180 portrait). Name artboards `Screen — iPhone — Default` / `— Dark` / `— Loading`.

```javascript
const sketch = require('sketch')
const doc = sketch.getSelectedDocument()
const page = new sketch.Page({ name: 'Settings', parent: doc })
doc.selectedPage = page
const ab = new sketch.Artboard({ name: 'Settings - iPhone - Light', parent: page, frame: { x: 0, y: 0, width: 393, height: 852 } })
console.log(JSON.stringify({ ok: true, artboard: ab.id }))
```

## 2. Insert Apple Design Resources symbols (verified)

Import a library symbol by its exact `sketch-library.md` name, instance it, place it. This is the verified pattern (a Tab Bar imported + placed + screenshotted successfully):

```javascript
const sketch = require('sketch')
const doc = sketch.getSelectedDocument()
const ab = sketch.find('#ARTBOARD_ID', doc)[0]
const lib = sketch.Library.getLibraries().find(l => l.id === 'C4648B33-1215-43AD-851E-D785ECD1113D')
const ref = lib.getImportableSymbolReferencesForDocument(doc).find(r => r.name === 'Tab Bars/Light/iPhone/Default')
const master = ref.import()
const inst = master.createNewInstance()
inst.parent = ab
inst.frame.x = Math.round((ab.frame.width - inst.frame.width) / 2)
inst.frame.y = ab.frame.height - inst.frame.height
console.log(JSON.stringify({ ok: true, instance: inst.id, w: inst.frame.width, h: inst.frame.height }))
```

- `lib` id `C4648B33-1215-43AD-851E-D785ECD1113D` = **Apple iOS 27 UI Kit** (re-resolve by `l.name.includes('iOS')` if the id changes).
- Build chrome first (status bar → nav/large-title bar → tab bar/toolbar), then content (list rows, controls), then overlays (sheets, alerts) as separate artboards.
- Match `…/Light/…` symbols to a Light artboard; duplicate + swap to `…/Dark/…` for Dark.

## 3. Set overrides (text, SF Symbol, value, state) — don't detach

Get the override prefixes, then set values. Prefer matching by `id` (`prefix + '_' + property`).

```javascript
const sketch = require('sketch')
const doc = sketch.getSelectedDocument()
const inst = sketch.find('#INSTANCE_ID', doc)[0]
const o = inst.overrides.find(x => x.id === 'PREFIX_stringValue')
if (o) o.value = 'General'
console.log(JSON.stringify({ ok: !!o }))
```

- Get `PREFIX` (`commonOverrideIDPrefix`) from `get_symbol_overrides` (`{targetDocumentID, symbolInstanceID, kind:'all'}`).
- Property values: `stringValue` (text), `image` (`{path}`/`{base64}`), `symbolID` (swap nested symbol), `textStyle`/`layerStyle` (shared-style id), color props (`textColor`, `color:fill-0`, …) accept a **Swatch** (preferred) or `#hex`.
- SF Symbol glyphs ride on nested symbol overrides / image slots — use the kit's symbol overrides, never paste codepoints.

## 4. Apply design-system tokens (see sketch-library.md)

- **Color:** apply library **swatches** — `Labels/…`, `Backgrounds/…`, `Backgrounds Grouped/…`, `Fills/…`, `Separators/…`, `System Colors/…`, `Grays/…`. Import + use on one line: `override.swatchValue = ref.import()`. Never hardcode hex.
- **Type:** apply **text styles** `01 LargeTitle … 11 Caption2` (+ `2 Bold`, `Loose Leading/…`). Maps to `.font(.largeTitle…)`.
- **Liquid Glass / materials:** apply **layer styles** `Liquid Glass/{Light|Dark}/Regular - {Large|Medium|Small}` (+ `Clear`, `… - Tinted`). Bars/sheets/controls from symbols already carry glass. Glass = chrome layer only (`liquid-glass.md`).
- **Spacing:** 4/8pt rhythm; hit targets ≥ 44×44pt (`metrics.md`).

## 5. States & Dark Mode

Per screen produce **Light**, **Dark**, and relevant **empty / loading / error** (`patterns.md`). Duplicate the artboard; swap `Light`→`Dark` symbol/style/swatch variants; swap content symbols for the empty/loading/error variants.

## 6. Verify visually

After each section call `get_screenshot` (`{targetDocumentID, layerID: artboardID}`) and check alignment, insets, glass, safe areas before moving on. Use `get_layer_tree_summary` to inspect structure.

## 7. Hand-off = a SwiftUI tree

Every element was named by its SwiftUI type as you built it (`mapping.md`), so present the mockup with its SwiftUI skeleton (`NavigationStack { List { … } }.toolbar { … }`). That's the payoff.

## Pitfalls

- Drawing bars/controls by hand → wrong metrics + no glass. Insert kit symbols.
- Hardcoded hex / arbitrary font sizes → break Dark Mode + Dynamic Type. Use swatches + text styles.
- Detaching symbols early → loses overrides + library updates.
- Splitting `ref.import()` across statements can lose the reference — import + use on one line.
- Forgetting `targetDocumentID` on `get_screenshot` → error.
- Designing the pre-Liquid-Glass flat look → not current.
