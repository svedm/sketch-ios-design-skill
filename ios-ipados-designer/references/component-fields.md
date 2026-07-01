# Driving component fields — the override map (Apple iOS 27 UI Kit)

**The rule this file enforces:** navigation & structure is never drawn by hand. You **insert the Apple kit component** and **drive its fields via overrides** — exactly how Apple's own `Examples/…` screens are built. Custom layers (ShapePath/Text/Image) are allowed **only** for content that has no native component (a map, a spectrum/waterfall, a bespoke dashboard card), and even then they sit inside kit containers.

Pair with `sketch-library.md` (exact symbol names), `sketch-playbook.md` (import/insert mechanics), `mapping.md` (what each element is), `metrics.md` (numbers).

---

## 0. Study a kit Example first (mandatory for a new screen shape)

Before composing a screen, insert the closest `Examples/…` symbol and read what it is made of — it is the ground-truth recipe. Apple's `Examples/Sidebar/Light` (a 3-column iPad Mail layout) is **11 components**, not a single drawing:

```javascript
const sketch = require('sketch')
const doc = sketch.getSelectedDocument()
const inst = sketch.find('[name="Examples/Sidebar/Light"]', doc)[0]   // after inserting it
const counts = {}
function walk(l){ if (l.type==='SymbolInstance' && l.master){ counts[l.master.name]=(counts[l.master.name]||0)+1; return } (l.layers||[]).forEach(walk) }
inst.master.layers.forEach(walk)
console.log(JSON.stringify(counts))
```

Recipe of a standard iPad `NavigationSplitView` screen (mirror this):

| Role (SwiftUI) | Kit component to insert |
|---|---|
| Status bar | `Status Bars/iPad/{Light\|Dark} Background/Full Screen/Menu Collapsed` |
| Sidebar glass background | `Sidebar/…/{Light\|Dark}/BG/Active` |
| Sidebar title (`.navigationTitle`) | `Sidebar/{L}/Header/Header` |
| Sidebar search (`.searchable`) | `Sidebar/…/{L}/Search/Placeholder` |
| Sidebar rows (`List{Label}` `.listStyle(.sidebar)`) | `Sidebar/{L}/Items/Level 0` · `Level 1` · `Level 2` |
| Sidebar toolbar (Edit / add / toggle) | `Sidebar/{L}/Toolbar/Fullscreen` |
| Column nav bars (`.toolbar`) | `Toolbars/Top (44pt)/{L}/iPad/Default Title` (+ `… - 2 Lines Left`) |
| Bar↔content glass transition | `Scroll Edge Effect/{L}/Top - Hard` |
| Window controls | `Windows/{L}/Resize - Floating` |

(`…/BG/` and `…/Search/` groups carry an SF-Symbol glyph inside the *name* — resolve them by filtering, not by typing the glyph: `refs.find(n => n.startsWith('Sidebar') && n.includes('Search') && !n.includes('Dark'))`.)

---

## 1. The universal override vocabulary

Every editable field on a kit component is an **override** on the instance. Roles repeat across the whole kit:

| Slot layer name(s) | `property` | What it is | Set it to | SwiftUI it stands for |
|---|---|---|---|---|
| `Title`, `Label`, `Detail`, `Subtitle`, `Description`, `Placeholder`, `Action`, `Search`, `Value` | `stringValue` | a text run | a string | `Text` / label / value |
| `Symbol` (and glyph-named layers like `􀆊`) | `stringValue` | an **SF Symbol glyph** in "SF Pro" | a glyph char (see §4) | `Image(systemName:)` |
| `Image`, `Thumbnail`, `App Icon` | `image` | a raster/vector slot | `{ path: '/abs.png' }` | `Image(...)` / photo |
| `State`, or the leaf variant itself | `symbolID` / choose leaf | selection / on-off / pressed / disabled | swap nested symbol or pick the right leaf | `.disabled`, selection, `isOn` |
| `Leading - Button N`, `Trailing - Button N`, `Row N`, `Item N`, `Tab N`, `Action N`, `Quick Action - N`, `Knob`, `Track`, `Accessories`, `Trailing Accessory` | `symbolID` / visibility | a repeated / swappable sub-element | show/hide, swap, or set its inner Title/Symbol | array of items, `ToolbarItem`s, accessory |
| any `color:*`, `textColor` | color | a themed color | a **swatch** (preferred) or hex | `.tint` / `.foregroundStyle` |

### How to set an override (reliable)

```javascript
const sketch = require('sketch')
const doc = sketch.getSelectedDocument()
const inst = sketch.find('#INSTANCE_ID', doc)[0]
// text field
inst.overrides.filter(o => o.property==='stringValue' && o.affectedLayer.name==='Title')[0].value = 'Home'
// image slot (drop a rendered SF Symbol or photo)
const io = inst.overrides.find(o => o.property==='image' && o.affectedLayer.name==='Image')
if (io) io.value = { path: '/abs/icon.png' }
// color via library swatch (preferred over hex)
```

When a slot name repeats (six `Symbol`s in a nav bar, five `Label`s in a segmented control), disambiguate by the **wrapper** in the override id path (`…/Trailing - Button 2/…/Symbol_stringValue`) or by order. Prefer `get_symbol_overrides {kind:'all'}` to read the `commonOverrideIDPrefix` and match by `id`, per `sketch-playbook.md` §3. Never detach the symbol.

### Trimming — turn OFF the inner element, never hide the container

To remove a sub-element you don't want (a button, a label, an icon), hide the **innermost content layer** (`Button`, `Label`, `Symbol`) — **not** its layout container (`Leading`, `Trailing`, a group/stack). Hiding the container removes its reserved space and **reflows the surviving siblings**.

- Verified: a sidebar-toolbar showing only the collapse toggle = keep `Leading` **visible**, hide its inner `Button` + `Label` (the "Edit"). If you instead hide the whole `Leading`, the layout collapses and the `Sidebar Disclosure` (collapse toggle) jumps from the **right** to the **left**. "Turn it off, don't delete it."
- Same rule for nav bars, toolbars, list rows: hide `Trailing - Button N`'s inner content or set its icon empty; keep the `Trailing`/`Leading` group so positions hold. (Some deeply-nested groups won't reflow — but default to inner-not-container.)

### Before debugging "my override did nothing" — check for a DUPLICATE instance

If a visibility/override reads as set (`value = 0`) but the thing still renders, **you almost certainly placed the component twice** and are editing one instance while a second, stacked one still shows its defaults. (Real case: two overlapping `Toolbars/Top` instances made `isVisible` look broken — it wasn't; the other bar was showing.) Rule: **one instance per element.** After any `.remove()` + re-add, re-query by name and assert the expected count before touching overrides; never place a second instance to "fix" a bad-looking first one — delete and redo the first.

### Selecting a sidebar row (nested Selected state) — the reliable recipe

A `Sidebar/…/Items/Level 0` selection is a **nested `State` symbol** (`States/Default | Selected | Disabled`), NOT a hand-drawn capsule. Getting it to render is fiddly because Sketch **re-IDs foreign symbols on import**, so you can't just use the library's original symbolId, and `libMaster.createNewInstance()` reparented into your doc imports as a null-master stub. The working path (verified):

1. **Harvest the in-document Selected id** from an already-placed `Examples/…` instance (e.g. the kit's own `Examples/Sidebar/Light` on the page): walk its `.overrides`, keep `o.property==='symbolID' && o.affectedLayer.name==='State'`, tally values — the value shared by most rows is **Default**, the odd one out is **Selected**. That id already resolves in your doc.
2. **Set State first, then re-read overrides.** Swapping `State` (`<prefix>_symbolID = <selectedId>`) **re-paths every nested override** — the `Leading/Stack/Title`, glyph, etc. ids all change (the State's own layer id is in the path). So call `get_symbol_overrides` again *after* the swap and use the new prefixes for Title/Detail.
3. **Tint the capsule:** the Selected state exposes `<statePrefix>_color:fill-0` (the selection background) — set it to your selection tint (`blue/100`-type). It defaults to `<unknown>` (invisible) so an un-tinted swap shows no capsule.
4. **Icon under Selected:** the glyph slot loses its `stringValue` override under Selected (only `textColor` remains) — hide the default glyph with a transparent `textColor` (`#00000000`) and overlay your rendered PNG at the slot.

> Foreign-symbol reach-in, in general: imported library symbols are **not** in `sketch.find('SymbolMaster', doc)` (they're foreign masters). To enumerate a component's nested variants, go `anyInstance.master.getLibrary().getDocument()` then `sketch.find('SymbolMaster', thatDoc)`. But to actually *apply* a nested variant, use the **in-document** id (step 1), not the library id.

### Custom Text layers auto-size and re-center — pin `frame.x` after creating

`new sketch.Text({frame:{x,width}})` shrinks the layer to its content width but **keeps the original frame center**, so text you meant to left-align drifts right and *looks* centered even with `style.alignment='left'`. After creating, set `layer.frame.x` explicitly (and re-check with a probe). This bit a status-banner headline: created at x=408/width=500, it rendered at x=571/width=175.

---

## 2. Component field maps (verified against the live kit)

Leaf pattern uses `{L}` = `Light|Dark`. Pick the leaf whose **variant axes** already encode the state you want (Idle/Pressed/Disabled, On/Off, Enabled, size) — that is how you set "state": you choose the right leaf, then override text/icon.

### Navigation & structure

| Component | Leaf pattern | Editable fields (slot → what) | State / variant axis | SwiftUI |
|---|---|---|---|---|
| **Status bar** | `Status Bars/iPad/{L} Background/Full Screen/Menu Collapsed` | `Time`, `AM/PM`, `Date`, `Menu` (app label — blank it for a real app) | Light/Dark bg · Full/Windowed | system-managed |
| **Nav bar (top toolbar)** | `Toolbars/Top (44pt)/{L}/iPad/Default Title` (+ `… - 2 Lines Left`, `… Large Title`) | `Title`; up to 6 `Leading - Button N` + 3 `Trailing - Button N` (show the wrapper, set its inner `Symbol` glyph); `Back Button`; inline `Search`; `Window Controls` | title style; button count | `.navigationTitle` + `.toolbar{ToolbarItem(placement:)}` |
| **Bottom toolbar** | `Toolbars/Bottom (44pt)/{L}/{Left and Right\|Left, Center and Right\|…}` | `Leading - Button N`, `Trailing - Button N` → each inner `Symbol` glyph | item arrangement | `.toolbar{ ToolbarItemGroup(placement:.bottomBar) }` |
| **Tab bar (iPad)** | `Tab Bars/{L}/iPad (Regular)/iPad` (iPhone: `Tab Bars/{L}/iPhone/Default`) | `Tab N` (swap icon glyph) + `Label` ×N; `Search` tab; `Sidebar Disclosure` | selected tab; iPhone/iPad; search state | `TabView{ Tab(_,systemImage:) }` (`.tabViewStyle(.sidebarAdaptable)`) |
| **Sidebar background** | `Sidebar/…/{L}/BG/Active` | (Liquid Glass surface — no text) | active/inactive | `NavigationSplitView` sidebar column |
| **Sidebar header** | `Sidebar/{L}/Header/Header` | `Title` (section), `Detail`, `Disclosure` (collapse chevron) | expanded/collapsed | `Section(header:)` / `.navigationTitle` |
| **Sidebar search** | `Sidebar/…/{L}/Search/Placeholder` | `Placeholder`/value text | placeholder/typing | `.searchable(text:)` |
| **Sidebar row** | `Sidebar/{L}/Items/Level 0` (nest `Level 1`/`Level 2`) | `Symbol` (icon glyph), `Title`, `Subtitle`, `Detail` (trailing count/badge); nested `State` = selection | Level 0/1/2 depth; `State` selected | `List{ Label(_,systemImage:) }` `.listStyle(.sidebar)`, `.badge()` |
| **Sidebar toolbar** | `Sidebar/{L}/Toolbar/Fullscreen` (also `Floating Window`) | `Label` (e.g. "Edit"); `Button`/`Button 1` inner `Symbol` glyphs (add, sidebar-toggle); `Sidebar Disclosure` | fullscreen/floating | `.toolbar` on the sidebar column |
| **Scroll edge effect** | `Scroll Edge Effect/{L}/Top - Hard` (`Soft`) | `Blur`, `Color` (no text) | hard/soft | `.scrollEdgeEffectStyle(_:for:)` |

### Content

| Component | Leaf pattern | Editable fields | Variant axis | SwiftUI |
|---|---|---|---|---|
| **List row** | `Lists/{L}/Rows/Default` (`Large`, `Subtitle`, `Value`, …) | `Stack/Title`, `Stack/Trailing/Detail` text; **`Accessories/Image` slot** (`property:image` — drop a rendered SF-Symbol PNG straight in, no glyph needed); `Stack/Trailing/Chevron` (drill-in) keep visible; **hide `Accessories/Edit Action`** (the red delete accessory is ON by default) | row style; accessory type | `List`/`Section` row; `Label`, `.badge`, accessory |
| **Grouped table** | `Lists/{L}/Grouped Table View` | `Row 1..N` each with `Title`/`Detail`/`Symbol` glyph/**`Image`**/`Accessories`/`Trailing`; swipe `Action 1..3` | grouped/inset | `List{ Section }` `.listStyle(.insetGrouped)` |
| **Text field** | `Text Fields/{L}/Default` (`Placeholder`, `Typing`) | `Placeholder`/value text | empty/placeholder/typing | `TextField` |

### Controls — style = which leaf you pick

| Component | Leaf pattern | Editable fields | Variant axis (= the state/style) | SwiftUI |
|---|---|---|---|---|
| **Button** | `Buttons/{L}/{Large\|Medium\|Regular\|Small}/{Bordered\|Bordered Prominent\|Glass\|Glass Prominent\|Default\|Destructive}/{Symbol\|Text\|Symbol + Text}/{1 - Idle\|3 - Pressed\|4 - Disabled}` | `Label` text and/or `Symbol` glyph | **size** → `.controlSize`; **style** → `.bordered`/`.borderedProminent`/`.glass`/`.glassProminent`/`.borderless`/role:`.destructive`; **state** → Idle/Pressed/Disabled | `Button` + `.buttonStyle` |
| **Toggle** | `Toggles/{L}/{On\|Off}/{1 - Idle\|3 - Pressed\|4 - Disabled}` | (no text) — pick On/Off leaf | on/off × state | `Toggle` `.toggleStyle(.switch)` |
| **Slider** | `Sliders/{L}/{Glyphs\|No Glyphs}/{Min\|Mid\|Max} - {1 - Enabled\|4 - Disabled}` | `Min symbol`/`Max symbol` glyphs; nested `Knob`,`Track` (value = Min/Mid/Max leaf) | value position × enabled | `Slider(value:in:)` |
| **Stepper** | `Stepper/{L}` | `Decrement`/`Increment` inner −/+ glyphs | enabled/disabled | `Stepper` |
| **Segmented** | `Segmented Controls/{L}/{Large\|Small}/{1 - Enabled\|4 - Disabled}` | `Label` ×5 (`Item N`) — set/hide to change count | size × enabled; selected segment | `Picker` `.pickerStyle(.segmented)` |
| **Date picker** | `Date and Time Pickers/Compact Picker/{L}/{Date\|Time\|Date and Time}` (also `Graphical`, `Wheel`) | header month text, `Date N` cells; nav `􀆉`/`􀆊` | compact/graphical/wheel × mode | `DatePicker` `.datePickerStyle(...)` |
| **Color well** | `Color Pickers/{L}/{iPhone\|iPad}` | swatch color | device | `ColorPicker` |

### Presentation & status

| Component | Leaf pattern | Editable fields | SwiftUI |
|---|---|---|---|
| **Alert** | `Alerts/{L}/{Default\|Buttons Stacked\|Input Field x1\|x2\|Overlay}` | `Title`, `Description`; `Label` ×(Primary/Secondary…) via `Leading/Trailing Action` | `.alert` |
| **Action sheet** | `Action Sheets/{L}` | `Title`, `Description`, `Label` for `Action 1..7` | `.confirmationDialog` |
| **Sheet** | `Sheets/{L}/iPad` (iPhone `Large/Medium Detent`, `Inspector`) | contains a `Navigation Bar` (own `Title` + Leading/Trailing buttons + `Symbol`s) | `.sheet` + `.presentationDetents` |
| **Popover (iPad)** | `Popovers (iPad Only)/{L} - Presentation Controller` | content overrides | `.popover` |
| **Menu / context menu** | `Menus/{L}/iPad` (`iPhone`, `with Shortcuts`, `Content View`) | `Row`s: `Symbol` glyph + `Label`/`Action` text + `Subtitle` + `Trailing Accessory`; `Quick Action - N`; `Separator` | `Menu` / `.contextMenu` |
| **Share sheet** | `Activity View/{L}/Card - Full Height` | `Title`,`Subtitle`, `Thumbnail` (**Image**), contact `Label`s + `App Icon`s, action rows (`Copy`, glyph slots) | `ShareLink` |
| **Progress** | `Progress Indicators/{L}/{Indeterminate Spinner - Large\|Regular\|Small\|… Table View Row\|Determinate…}` | (spinner — pick size) | `ProgressView` `.progressViewStyle(.circular/.linear)` |
| **Page control** | `Page Control/{L}/{Background\|…}/{N Dots}` | `Dot` ×N (count = leaf) | `TabView` `.tabViewStyle(.page)` |
| **Keyboard** | `Keyboard/…` / `Examples/Keyboard/{L}/iPad/…` | key labels | `.keyboardType`, `.toolbar(.keyboard)` |

---

## 3. Composition order (build like the Example)

1. **Artboard** at the device size (`platform-ios-ipados.md`), semantic background.
2. **Structure components, back-to-front:** status bar → sidebar BG → sidebar header/search/items/toolbar → column nav bars → scroll-edge. Set each component's fields.
3. **Content:** insert `Lists`/`Text Fields`/controls and override their fields; only genuinely bespoke content (map, spectrum, custom card) is custom-drawn — placed *inside* a kit container/column.
4. **State & Dark:** duplicate the artboard, swap `Light`→`Dark` leaves and swatches; swap component variants for empty/loading/error.
5. Screenshot after each section (`sketch-playbook.md`).

Rule of thumb: if you are typing `new sketch.ShapePath` / `new sketch.Text` for something that is a **bar, row, field, button, toggle, menu, sheet, or selection** — stop; there is a component for it. Custom primitives are for content pixels only.

---

## 4. Icons inside components (the honest state)

SF Symbols in this kit are **glyphs in the "SF Pro" font** carried by `Symbol` text layers (default `􀀀` blank). There is **no local name→codepoint table** — Apple bakes it into `CoreGlyphs.bundle`/the font (glyph names are opaque `uniXXXXXX`), and the SF Symbols.app metadata plists carry only names/aliases/availability, no codepoints. So you **cannot** derive a symbol's glyph char from its name programmatically.

**BEST PATH for icons (when available) — the `sfsymbols` MCP → SVG → `ShapePath.fromSVGPath`.** The **`sfsymbols` MCP** — [github.com/svedm/sfsymbols-mcp](https://github.com/svedm/sfsymbols-mcp), a local Swift `stdio` server — is an **optional dependency of this skill**: it may or may not be installed in a given environment (it's a personal/local tool, not bundled). **Probe first:** if the `mcp__sfsymbols__*` tools are present, use them; if not, either install + register the server from that repo, or use the Swift/kit fallback below. When available it exposes `mcp__sfsymbols__search_symbols`, `mcp__sfsymbols__list_symbols`, and `mcp__sfsymbols__export_symbol{name, fill, point_size, weight}`, returning a **vector SVG** for any of ~9184 SF Symbols — the cleanest icon source (replaces the Swift render-to-PNG step). Pipeline in Sketch: get the SVG → extract the path `d` (and the `viewBox` for aspect) → build a real vector layer: `const p = sketch.ShapePath.fromSVGPath(d); p.parent = ab; p.style.fills = [{ color, fillType:'Color' }]` → set `p.frame` to the target size (fit within a box using the viewBox aspect). **`fromSVGPath` uses only the geometry — the SVG's `fill` attribute is ignored, so you recolor in Sketch** (one exported path serves both a blue and a white icon; the MCP's `fill` arg only matters if you keep the SVG as a raster). Crisp at any scale, no rasterization. Caveats: it **can't be called from inside `run_code`** (Sketch's JS sandbox — resolve icons agent-side, then inline the `d` into the script); `search` matches aliases but multi-word queries can miss (search one keyword). Supersedes the PNG methods below whenever available.

> **List-row / Image-slot gotcha — icons come out HUGE.** `Lists/Rows` `Accessories/Image` slot is ~48×48 and *fills* it, so a tight glyph renders ~40px (too big). Fix: **neutralize the slot** (set its `image` override to a 1×1 transparent PNG via `{base64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='}` — keeps the leading space so the Title doesn't shift) and **overlay a fit-to-~26pt vector icon** (fromSVGPath) centered on the slot (≈ rowX+40, rowY+h/2). Don't hide the slot (that collapses the space and shifts the Title).

Other ways to get an icon into a component, in order of preference:

1. **`Image` slot → rendered PNG.** List rows, activity/share, thumbnails expose an `image` override; set `override.value = { path }`. Simple, but see the HUGE gotcha above — pad the asset or prefer the vector overlay.
2. **`Symbol` glyph slot → vector/PNG overlay at the slot frame.** For bars/tab/sidebar/menu icons (glyph-only slots): hide the glyph (`stringValue = ' '`, or transparent `textColor` when no stringValue override exists) and place a fromSVGPath vector (or PNG) at that frame. Keeps the real component; swaps only the icon.
3. **Keep the component's informative default glyph** when it is already the right symbol (nav back `􀯶`, compose `􀟈`, sidebar toggle `􀏚`, etc. — the kit is itself a partial glyph source you can screenshot-verify).

**Fallback — render an SF Symbol to a tinted PNG** (Swift/AppKit — only when you specifically need a raster and the `sfsymbols` MCP is unavailable: deterministic, any symbol, any weight, any color):

```swift
// swift render.swift jobs.txt   — each line "name|#HEX|/abs/out.png"
import AppKit
let cfg = NSImage.SymbolConfiguration(pointSize: 160, weight: .medium)
for line in try! String(contentsOfFile: CommandLine.arguments[1]).split(separator:"\n") {
  let p = line.split(separator:"|").map(String.init); if p.count<3 { continue }
  guard let s = NSImage(systemSymbolName: p[0], accessibilityDescription: nil)?.withSymbolConfiguration(cfg) else { continue }
  let img = NSImage(size: s.size); img.lockFocus()
  s.draw(in: .init(origin:.zero,size:s.size)); NSColor(/* parse p[1] */).set()
  NSRect(origin:.zero,size:s.size).fill(using:.sourceAtop); img.unlockFocus()
  let png = NSBitmapImageRep(data: img.tiffRepresentation!)!.representation(using:.png,properties:[:])!
  try! png.write(to: URL(fileURLWithPath: p[2]))
}
```

Place: `new sketch.Image({ parent, frame, image: '/abs/out.png' })`, size to the symbol's aspect (the script's output dimensions give it). Needs a real device with the symbol available in the installed SF Symbols version.

> If a future kit ships an SF-Symbols symbol set (glyph pickers), prefer that over PNGs. Re-check with `getImportableSymbolReferencesForDocument` filtered for an icon group.
