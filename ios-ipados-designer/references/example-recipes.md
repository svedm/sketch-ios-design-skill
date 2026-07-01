# Example recipes — copy real Apple screens 1:1

The Apple iOS 27 UI Kit ships **`Examples/…`** — full, HIG-correct screens built entirely from kit components. **This file is their pre-dumped composition** so "study the reference" is a lookup, not a guess. Pair with `component-fields.md` (how to set each component's fields) and `sketch-playbook.md` (insert mechanics).

## The loop — COMPOSE FROM EXAMPLE (do this for every screen/section)

1. **Pick the reference** — the closest `Examples/…` (index below).
2. **Read its composition** — the recipe here (or dump live, helper below).
3. **Replicate the stack 1:1** on your frame — same components, same order, same grouping. Insert each as an instance.
4. **Trim + tune** — hide the sub-elements you don't need (`isVisible = false`), then set your text / icon / value / state overrides (`component-fields.md`).
5. **Self-diff** — compare your composition to the recipe. **Any `ShapePath`/`Text` you hand-drew for something that appears in the recipe is a bug** — replace it with the component.

> The failure this prevents: improvising a sidebar (hand-drawn background + a `Text` "title", no `Sidebar/Toolbar`) instead of reproducing `Examples/Sidebar/Light`'s actual stack (`Sidebar/BG` + `Sidebar/Toolbar/Fullscreen` + `Sidebar/Header` + `Sidebar/Items`). Copy the stack; don't invent one.

## Dump any Example's composition live (verify / refresh a recipe)

```javascript
const sketch = require('sketch')
const doc = sketch.getSelectedDocument()
const lib = sketch.Library.getLibraries().find(l => l.name.includes('iOS'))
const ref = lib.getImportableSymbolReferencesForDocument(doc).find(r => r.name === 'Examples/Sidebar/Light')
const m = ref.import()
const counts = {}, order = []
function walk(l){ if (l.type==='SymbolInstance' && l.master){ const n=l.master.name; if(!counts[n]){counts[n]=0;order.push(n)} counts[n]++; return } (l.layers||[]).forEach(walk) }
;(m.layers||[]).forEach(walk)
console.log(JSON.stringify({ frame:[m.frame.width,m.frame.height], top:(m.layers||[]).map(l=>l.name), comps: order.map(n=>[counts[n],n]) }))
```

## Screen shape → which Example to copy

| You're building | Copy this Example | Root SwiftUI |
|---|---|---|
| iPad 2/3-column with sidebar | `Examples/Sidebar/Light` | `NavigationSplitView` |
| iPad tab-bar app | `Examples/Tab Bar/Light/iPad` | `TabView` (`.tabViewStyle(.sidebarAdaptable)`) |
| iPhone tab-bar app | `Examples/Tab Bar/Light/Tabs` (search: `… Tabs with Search` / `Search Selected`) | `TabView` |
| iPad screen with top+bottom toolbars | `Examples/Toolbar/iPad (Light)` | `NavigationStack` + `.toolbar` |
| iPhone screen with bottom bar | `Examples/Toolbar/Bottom/iPhone - Controls (Light)` / `… - Search (Light)` | `.toolbar(.bottomBar)` |
| Grouped/settings list | `Examples/Lists/Light/Grouped` | `List` `.listStyle(.insetGrouped)` |
| Form of text fields | `Examples/Text Fields/Light` | `Form { TextField }` |
| Date/time entry | `Examples/Date and Time Picker/Light` | `DatePicker` in a `List` |
| Alert | `Examples/Alert/Light` | `.alert` |
| Action sheet | `Examples/Action Sheet/Light` | `.confirmationDialog` |
| Context menu | `Examples/Menus/Light` | `Menu` / `.contextMenu` |
| Empty state | `Examples/Empty State/{Large Symbol\|Symbol in Circle\|Title and Subtitle}` | `ContentUnavailableView` |
| Keyboard visible | `Examples/Keyboard/Light/iPad/Lower Case` | `.keyboardType` |

## Recipes (pre-dumped composition — component × count, in stacking order)

Format: **top groups** = the Example's own layer groups (your frame's structure); **stack** = the component instances to place. `[n×]` = count.

### iPad — Sidebar split view · `Examples/Sidebar/Light` · 1210×834
Top groups: `Split View` · `Status Bar` · `Window Resize`
Stack:
- `Status Bars/iPad/Light Background/Full Screen/Menu Collapsed`
- **Sidebar column:** `Sidebar/…/Light/BG/Active` · `Sidebar/Light/Toolbar/Fullscreen` · `Sidebar/…/Light/Search/Placeholder` · `Sidebar/Light/Header/Header` · `Sidebar/Light/Items/Level 0` [8×] · `Sidebar/Light/Items/Level 1` [3×]
- **Content columns:** `Toolbars/Top (44pt)/Light/iPad/Default Title` · `Toolbars/Top (44pt)/Light/iPad/Default Title - 2 Lines Left` · `Scroll Edge Effect/Light/Top - Hard` [2×]
- `Windows/Light/Resize - Floating`
- Trim example (real): on `Sidebar/Toolbar/Fullscreen` → hide `Leading` (Edit) and the trailing compose `Button`; keep `Sidebar Disclosure` (collapse toggle).
- ⚠️ `…/BG/Active` and `…/Search/Placeholder` are **internal to the Example — not standalone-importable**. For the sidebar glass surface use layer style `Liquid Glass/Light/Regular - Large`; for search, omit or use a `Text Fields/…` instance. Everything else (`Toolbar`, `Header`, `Items`) **is** in the importable `Sidebar/…` folder — use it.
- ⚠️ `Scroll Edge Effect/…/Top - Hard` has a **hard bottom edge** — placed over a static (non-scrolling) mock it draws a visible white seam across the content. It's a scroll-transition element: **omit it in a resting-state Home/dashboard mock** (or use a `Soft` variant), and only include it when depicting content scrolling under the bar.
- Selecting the current sidebar row is a nested-`State` swap, not a drawn capsule — see `component-fields.md` → "Selecting a sidebar row (nested Selected state)".

### iPad — Tab bar · `Examples/Tab Bar/Light/iPad` · 1210×834
Stack: `Status Bars/iPad/…/Menu Collapsed` · `Tab Bars/Light/iPad (Regular)/iPad` · `Windows/Light/Resize - Floating`

### iPad — Toolbar screen · `Examples/Toolbar/iPad (Light)` · 1210×834
Top groups: `Toolbar` · `Window Resize` · `Scroll Edge Effect` · `Navigation Bar` · `Status Bar`
Stack: `Status Bars/iPad/…/Menu Collapsed` · `Toolbars/Top (44pt)/Light/iPad/Default Title` · `Scroll Edge Effect/Light/Top - Hard` · `Toolbars/Bottom (44pt)/Light/Left and Right` · `Windows/Light/Resize - Floating`

### iPad — Keyboard · `Examples/Keyboard/Light/iPad/Lower Case` · 1210×834
Stack: `Status Bars/iPad/…/Menu Collapsed` · `Keyboard/Light/iPad/Lower Case`

### iPhone — Tab bar · `Examples/Tab Bar/Light/Tabs` · 402×874
Stack: `Tab Bars/Light/iPhone/Default` (with search: `…/iPhone/Prominent Tab` or `…/Search Selected - Placeholder`)

### iPhone — Grouped list · `Examples/Lists/Light/Grouped` · 402×874
Top groups: `Content` · `Status Bar`
Stack: `Status Bars/iPhone/Light Background` · `Lists/Light/Header/Extra Prominent` · `Lists/Light/Header/Nested` · `Lists/Light/Rows/Default` [6×] · `Lists/Light/Footer/Footer` [2×] · in-list `Lists/Light/Buttons/Destructive` · `Sliders/Light/Glyphs/Mid - 1 - Enabled`
(A grouped list = section headers + rows + footers + in-list buttons/controls — all components.)

### iPhone — Text-field form · `Examples/Text Fields/Light` · 402×874
Stack: `Status Bars/iPhone/Light Background` · `Text Fields/Light/Default` · `…/Placeholder` · `…/Typing` · `…/Empty Typing` (one per state you show)

### iPhone — Date/time entry · `Examples/Date and Time Picker/Light` · 402×874
Stack: `Status Bars/iPhone/Light Background` · `Lists/Light/Rows/Default` [4×] · `Date and Time Pickers/Compact Picker/Light/Date and Time`

### iPhone — Bottom toolbar · `Examples/Toolbar/Bottom/iPhone - Controls (Light)` (or `… - Search`) · 402×874
Top groups: `Toolbar` · `Scroll Edge Effect` · `Navigation Bar` · `Status Bar`
Stack: `Status Bars/iPhone/Light Background` · `Toolbars/Top (44pt)/Light/iPhone/Standard - Large` · `Scroll Edge Effect/Top - Soft (no text)` · `Toolbars/Bottom (48pt)/Light/Composed/Controls` (or `…/Composed/Search`)

### Empty state · `Examples/Empty State/{Large Symbol | Symbol in Circle | Title and Subtitle}` · 402×874
Top groups: `Button` · `Content` · (`Navigation Bar`) · `Status Bar`
Stack: `Status Bars/iPhone/Light Background` · (`Toolbars/Top (44pt)/Light/iPhone/Standard - Large`) · `Buttons/Light/Large/Glass Prominent/Default`. The symbol + title + subtitle in `Content` are the one bespoke part (→ `ContentUnavailableView`).

### Alert · `Examples/Alert/Light` · 402×874
Stack: `Status Bars/iPhone/Light Background` · `Alerts/Light/Overlay` (dim scrim) · `Alerts/Light/Default`

### Action sheet · `Examples/Action Sheet/Light` · 402×874
Stack: `Toolbars/Bottom (48pt)/Light/Composed/Controls` · `Status Bars/iPhone/Light Background` · `Alerts/Light/Overlay` · `Action Sheets/Light`

### Context menu · `Examples/Menus/Light` · 402×874
Stack: `Menus/Light/iPhone` · `Menus/Light/Overlay` · `Menus/Light/Content View`

### iPad — Multi-window (reference) · `Examples/Windows` · 1210×834
Shows two windows: `Sidebar/…/BG/Active` + `…/BG/Inactive`, `Sidebar/Light/Toolbar/Floating Window` [2×], `Windows/Light/Resize - Floating` [2×]. Use when designing windowed/Stage-Manager states.

## After you replicate — the build checklist (fill before claiming done)

- **Reference Example:** `Examples/…`
- **Components placed (from recipe):** …
- **Trimmed (hidden sub-elements):** …
- **Tuned (text / icon / value / state overrides):** …
- **Bespoke content (no component exists):** … ← must be a short, justified list
- **Self-diff vs recipe:** no hand-drawn primitive duplicates a recipe component ✅
