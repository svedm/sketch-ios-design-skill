# Components — Content, Layout & Organization

Reference for content/layout/organization components on iOS 26 / iPadOS 26 (Liquid Glass): the design decision plus the exact SwiftUI element to reach for. Siblings: `components-navigation.md`, `components-controls.md`, `components-presentation.md`, `swiftui-catalog.md`, `metrics.md`, `liquid-glass.md`, `foundations.md`.

Per-component format: **What / When → SwiftUI anchor → Key modifiers → Variants & states → Do / Don't**.

---

## Lists

Rows of data in a single column; the backbone of iOS/iPadOS information hierarchy (Settings, Mail). Prefer a list/table for **text**; use a collection/grid for image-heavy or size-varying content.

- **SwiftUI:** `List { … }` — static rows, or `List(items) { … }` / `List { ForEach(items) { … } }` for dynamic. Sections via `Section`. (`List`, iOS 13+)
- **Style:** `.listStyle(_:)` with `ListStyle` protocol.

| Style | SwiftUI | Use |
| --- | --- | --- |
| Plain | `.listStyle(.plain)` | Edge-to-edge rows, minimal chrome; simple lists, search results |
| Grouped | `.listStyle(.grouped)` | Header/footer + extra space to separate groups of data |
| Inset grouped | `.listStyle(.insetGrouped)` | Rounded, inset card-style groups — the default Settings look on iOS/iPadOS |
| Sidebar | `.listStyle(.sidebar)` | Collapsible source list; iPad/Mac navigation column (see `components-navigation.md`) |
| Automatic | `.listStyle(.automatic)` | Let SwiftUI pick per platform/context (default) |

- **Sections:** `Section { … } header: { … } footer: { … }`. Collapsible via `Section(isExpanded:)` binding — a disclosure indicator appears in the header **only under `.sidebar` style** (not all contexts provide a trigger).
- **Row content:** compose freely — `Label("Title", systemImage:)`, `HStack { … }`, or a leading `Image` + `VStack` of `Text`. Keep text succinct to avoid truncation/wrapping. Use secondary/tertiary label colors for supplemental text (`foregroundStyle(.secondary)`); see `foundations.md`.
- **Row accessories:** for drill-in use a disclosure indicator — `NavigationLink` inside the row supplies it automatically. An **info button** (detail disclosure) only reveals more info; it does **not** navigate.
- **Swipe actions:** `.swipeActions(edge: .trailing/.leading, allowsFullSwipe:) { Button(role:) { … } }`. Tint destructive with `.tint(.red)` / `role: .destructive`.
- **Editing:** `ForEach` + `.onDelete { … }` and `.onMove { … }` enable delete/reorder UI. Trigger edit mode with `EditButton()` in the toolbar (toggles the `editMode` environment value; title flips Edit↔Done). On iOS/iPadOS people must **enter edit mode** before multi-selecting via taps.
- **Selection:** `List(selection: $sel)` — bind to `ID?` (single) or `Set<ID>` (multiple). Single selection works outside edit mode on all platforms; multi-select without edit mode works on iPad/Mac with keyboard+pointer. Persistently highlight the selected row for navigation; briefly highlight + add a checkmark for option-picking.
- **Hierarchy:** `List(tree, children: \.children) { … }` builds collapsing outline rows inline.
- **Refresh:** `.refreshable { await … }` adds the standard pull-to-refresh control.
- **Index:** avoid an alphabetical index on rows that also carry trailing disclosure indicators — the two collide.
- **iOS 26 glass:** the list scrolls in the content layer **beneath** floating bars; a **scroll edge effect** blurs/reduces opacity of content passing under top toolbars and **pinned section headers** so controls stay legible. Prefer the default `.automatic` edge style (see Scroll views).

**Do:** keep rows short; give feedback on selection; allow reordering even when add/remove isn't offered.
**Don't:** stuff large text blocks into rows — list titles only, push detail to a detail view; don't use an info button for navigation.

---

## Tables (multicolumn)

Sortable, multicolumn data (spreadsheet/productivity). iPad + Mac; on iPhone/compact width it degrades to a list.

- **SwiftUI:** `Table(items) { TableColumn("Name", value: \.name) … }` (`Table`, iOS 16+/iPadOS 16+/macOS 12+).
- **Selection:** `Table(items, selection: $sel)` — `ID?` or `Set<ID>`.
- **Sorting:** `Table(items, sortOrder: $sortOrder)` with `[KeyPathComparator]`; re-sort your data in `.onChange(of: sortOrder) { items.sort(using: $1) }`. Column headers reflect sort state and direction.
- **Static rows:** `Table(of:columns:rows:)` with `TableRow`.
- **Style:** `.tableStyle(_:)` — `.automatic` (default, all platforms), `.inset`; `.bordered` (macOS only, alternating rows).
- **Compact behavior:** in a compact horizontal size class (iPhone, iPad Slide Over) the table auto-hides headers and all columns after the first. Enrich the first column when `horizontalSizeClass == .compact` for a list-like appearance and a seamless transition.

**Do:** descriptive noun column headings, title-style caps, no trailing punctuation; let people click headings to sort (re-click reverses) and resize columns (macOS).
**Don't:** use a table for hierarchical data — use an outline/`OutlineGroup` instead.

---

## Collections (grids)

Ordered, highly visual layout — ideal for **image-based** content. Standard row or grid layout; avoid custom layouts that confuse.

| Need | SwiftUI | Notes |
| --- | --- | --- |
| Large vertical scrolling grid | `LazyVGrid(columns: [GridItem])` in `ScrollView` | iOS 14+; creates cells lazily. Column count = number of `GridItem`s |
| Large horizontal scrolling grid | `LazyHGrid(rows: [GridItem])` in `ScrollView(.horizontal)` | iOS 14+; row count = number of `GridItem`s |
| Small, fully-visible 2-D grid | `Grid { GridRow { … } }` | iOS 16+; renders all cells at once → better spacing/alignment |

- **GridItem sizing:** `.flexible()` (share space), `.fixed(pt)`, `.adaptive(minimum:)` (as many columns as fit). Set `spacing:` and `alignment:` per item.
- **Grid spanning/alignment:** `Grid(alignment:horizontalSpacing:verticalSpacing:)`; `gridCellColumns(_:)`, `gridCellUnsizedAxes(_:)`, `gridColumnAlignment(_:)`, `gridCellAnchor(_:)`.
- **Performance:** start with `Grid` (correct sizing); switch to `LazyVGrid`/`LazyHGrid` only when profiling shows too many views loading at once.
- Default interactions: tap-select, touch-and-hold to edit, swipe to scroll. Add custom gestures only when needed. Use standard animations for insert/delete/reorder.

**Do:** adequate padding around images so focus/hover effects stay visible and content doesn't overlap; keep it easy to reach any item.
**Don't:** make dynamic layout changes while people are interacting; use a collection for plain text (use a list).

---

## Labels

Static, uneditable (often copyable) text: button titles, list item descriptions, in-view context.

- **SwiftUI:** `Text("…")` for plain/styled text; `Label("Title", systemImage: "bolt.fill")` for the icon+title idiom (`Label`, iOS 14+).
- **Label styles:** `.labelStyle(.automatic / .titleOnly / .iconOnly / .titleAndIcon)`. Toolbars may default to icon-only — opt back in with `.titleAndIcon`. Custom icon: `Label { Text … } icon: { … }`.
- **Colors — relative importance** (map to system label roles; use `.foregroundStyle`):

| Role | Use | SwiftUI/UIKit |
| --- | --- | --- |
| Label (primary) | Primary information | `.primary` / `UIColor.label` |
| Secondary | Subheading / supplemental | `.secondary` / `secondaryLabel` |
| Tertiary | Unavailable item/behavior | `UIColor.tertiaryLabel` |
| Quaternary | Watermark text | `UIColor.quaternaryLabel` |

**Do:** prefer system fonts; support Dynamic Type; make useful text selectable (`.textSelection(.enabled)`) so people can copy IP addresses, errors, etc.
**Don't:** use a label for editable text (use `TextField`) or for long/formatted text (use a text view). See `components-controls.md`, `swiftui-catalog.md`.

---

## Text views (long / editable / styled text)

Multiline, scrollable, optionally editable styled text — more display/input options than a field or label. Leading-aligned, system label color by default.

- **SwiftUI:** `TextEditor(text: $string)` for editable multiline; `Text` for long read-only content (see `swiftui-catalog.md`).
- iOS/iPadOS: an editable text view raises the keyboard on selection — set the appropriate keyboard type for the content (see `inputs.md`).

**Do:** keep text legible even with multiple fonts/colors; adopt Dynamic Type; test with Bold Text; make useful text selectable.
**Don't:** use a text view for a small, non-editable snippet — use a label; for a small editable value use a text field.

---

## Image views

Displays a single image (or animated sequence) on transparent/opaque background; typically non-interactive.

- **SwiftUI:** `Image("asset")` or `Image(systemName: "…")` for SF Symbols. Make interactive images a `Button` showing the image, not a tappable image view.
- **Fitting:** `.resizable()` then `.aspectRatio(_:contentMode: .fit/.fill)`; clip with `.clipShape`. Supported data: PNG, JPEG, HEIC, PDF.
- **Accessibility:** use a `label:` initializer when the image acts as a control; `Image(decorative:)` for purely aesthetic images (ignored by VoiceOver).

**Do:** prefer an SF Symbol or interface icon over an image view for icons (vector, tintable, accent-color aware — see `foundations.md`); keep all frames in an animated sequence the same size.
**Don't:** overlay text on images without ensuring contrast (add a shadow/background layer).

### AsyncImage (remote images)

- **SwiftUI:** `AsyncImage(url:) { image in image.resizable() } placeholder: { ProgressView() }` (iOS 15+). Uses shared `URLSession`; iOS 27+ caches downloaded data per transport protocol.
- Apply `resizable()`/image modifiers **inside** the `content` closure, not on `AsyncImage` itself.
- For full control use the `phase:` initializer (`AsyncImagePhase`: `.image` / `.error` / placeholder). Set a `.frame` since the placeholder fills available space.

---

## Web views

Loads rich web/HTML content inline (e.g., Mail message bodies).

- **SwiftUI (iOS 26):** native `WebView` (WebKit) — `WebView(url:)` or `WebView(webPage)` driven by a `WebPage` object (`@Observable final class WebPage`) for load state, navigation, and JS. Both are iOS 26.0+.
- **Pre-iOS-26 / advanced control:** wrap `WKWebView` in `UIViewRepresentable`.
- Support forward/back navigation with visible controls when people are likely to visit multiple pages (off by default).

**Do:** use for brief in-app access to a page.
**Don't:** rebuild Safari — full browsing belongs in Safari.

---

## Charts (Swift Charts)

Show quantitative data as a chart. iOS/iPadOS render charts with the **Swift Charts** framework (`import Charts`) — a separate framework from SwiftUI, but composed the same declarative way. See the HIG *Charting data* pattern in `patterns.md`.

- **SwiftUI anchor:** `Chart { … }` containing **marks**: `BarMark`, `LineMark`, `AreaMark`, `PointMark`, `RectangleMark`, `RuleMark`, `SectorMark` (pie/donut, iOS 17+). Data drives marks via `ForEach` or `Chart(data) { … }` (iOS 16+).
- **Encode dimensions:** `.value("Label", keyPath)` for `x:`/`y:`; series/color via `.foregroundStyle(by: .value("Category", …))`; size/symbol via matching modifiers.
- **Key modifiers:** `.chartXAxis { }` / `.chartYAxis { }` (ticks, gridlines, labels), `.chartXScale`/`.chartYScale`, `.chartLegend(position:)`, `.chartForegroundStyleScale(_:)`, `.chartPlotStyle { }`.
- **Interactivity (iOS 17+):** `.chartXSelection(value:)` / `.chartYSelection`, `.chartScrollableAxes`, `.chartXVisibleDomain`; drag/gesture to inspect values.
- **Variants:** bar (comparison), line/area (trend over time), point/scatter (correlation), pie/donut (`SectorMark`, part-to-whole).

**Do:** pick the mark type that fits the data question; label axes and provide a legend/units; support Dark Mode via semantic colors; provide an accessibility representation (`.accessibilityChartDescriptor` / audio graphs). **Don't:** decorate with 3-D or heavy chrome; don't rely on color alone to distinguish series (add symbols/labels). For simple single-value status, use a `Gauge` or `ProgressView` instead (see `components-status-system.md`).

---

## Boxes / GroupBox

Visually distinct group of logically related content, with an optional title; separated by border/background.

- **SwiftUI:** `GroupBox { … }` or `GroupBox(label: Label("End-User Agreement", systemImage:)) { … }` (`GroupBox`, iOS 14+).
- iOS/iPadOS default: uses **secondary/tertiary background colors** to separate contents (see `foundations.md`).

**Do:** keep a box small relative to its container; use padding/alignment to imply subgroups; add a brief title (sentence-style caps, no ending punctuation) to clarify contents and aid VoiceOver.
**Don't:** nest boxes to define subgroups — it feels busy and constrained.

---

## Disclosure controls

Reveal/hide detail tied to a control or view. Keep the most-used items always visible; hide advanced options by default.

- **SwiftUI:** `DisclosureGroup("Items") { … }` or `DisclosureGroup("Items", isExpanded: $expanded) { … }` (iOS 14+). States: **expanded** / **collapsed**.
- Triangle points inward (leading) when collapsed, down when expanded.

**Do:** give a descriptive label ("Advanced Options") indicating what's disclosed; place the control near its content.
**Don't:** use more than one disclosure button per view. Not supported in tvOS/watchOS.

---

## Outline views (hierarchical)

Hierarchical data in disclosable, expandable rows/columns (Finder). macOS-centric; on iPad/visionOS prefer a **split view** for hierarchy.

- **SwiftUI:** `OutlineGroup(root, children: \.children) { item in … }` (iOS 14+), or the inline `List(tree, children:)` form. Expose the hierarchy in the **first column only**.

**Do:** descriptive column headings; let people sort (macOS), resize columns, expand/collapse (Option-click expands all subfolders on Mac); retain expansion state; offer a search field for long outlines.
**Don't:** use an outline for non-hierarchical data — use a `Table`/list. Not supported on iOS/iPadOS/tvOS/visionOS as a native component (use `OutlineGroup` in a list instead).

---

## Column views (browser)

Navigate a **deep** hierarchy via a series of vertical columns; each column = one level (Finder column view).

- **API:** AppKit `NSBrowser` only — **macOS-exclusive**, not supported on iOS/iPadOS/tvOS/visionOS/watchOS. On iPad, use a `NavigationSplitView` (see `platform-ios-ipados.md`, `components-navigation.md`).

**Do (macOS):** show the root level in the first column; let people resize columns; show a preview when a selected item has no children.

---

## Lockups

tvOS-only unit combining content view + header + footer that expand/contract together on focus (cards, caption buttons, monograms, posters). **Not supported on iOS/iPadOS/macOS/visionOS/watchOS** — no iPad decision impact. APIs: `TVLockupView` & friends (TVUIKit). Listed for completeness only.

---

## Scroll views

View content larger than its bounds by scrolling vertically/horizontally. No appearance of its own beyond a translucent scroll indicator.

- **SwiftUI:** `ScrollView([.vertical] / [.horizontal] / [.vertical, .horizontal]) { … }`. Hide indicator via `showsIndicators:` param. Note: `List`, `Table`, and lazy grids scroll implicitly and honor scroll-view configuration.
- **Initial position:** `.defaultScrollAnchor(.center / .bottom / …)`.
- **Programmatic scroll:** wrap in `ScrollViewReader` and call `proxy.scrollTo(id:)`.
- **Paging / snap:** `.scrollTargetBehavior(.paging)` (`PagingScrollTargetBehavior`) or `.viewAligned`; mark targets with `.scrollTargetLayout()`. Consider a page control in page-by-page mode (and then hide the scroll indicator on that axis to avoid redundancy).

### iOS 26 scroll edge effects (Liquid Glass)

A **scroll edge effect** gives visual separation between floating interface elements (toolbars, tab bars, pinned headers) and the scrolling content behind them — content scrolls and peeks through the glass functional layer above it.

- **SwiftUI:** `ScrollEdgeEffectStyle` — `.automatic` (default), `.hard`, `.soft`. Adjust per view only for custom bars; UIKit `UIScrollEdgeEffect.Style`.
- **Prefer `.automatic`** — gives a more opaque separation for dense top toolbars, text outside Liquid Glass controls, and pinned table headers. If you use `.soft`, test legibility thoroughly.
- Use an edge effect **only** where a scroll view sits behind floating elements — it's functional, not decorative; it doesn't darken/overlay.
- **One effect per view.** In iPad/Mac split views each pane can have its own; keep their heights consistent for alignment.

**Do:** support default scroll gestures + keyboard shortcuts and elastic behavior; make it apparent content is scrollable (peek partial content at the edge); set sensible min/max zoom.
**Don't:** nest two same-orientation scroll views (a horizontal inside a vertical is fine); auto-scroll more than needed to keep context.

---

## Quick SwiftUI map

| Component | Primary SwiftUI | Key modifiers / companions |
| --- | --- | --- |
| List | `List` + `Section` + `ForEach` | `.listStyle(.plain/.grouped/.insetGrouped/.sidebar)`, `.swipeActions`, `.onDelete`, `.onMove`, `.refreshable`, `selection:`, `EditButton` |
| Table | `Table` + `TableColumn` | `sortOrder:`, `selection:`, `.tableStyle(.inset/.bordered)`, `KeyPathComparator` |
| Grid (visual) | `LazyVGrid`/`LazyHGrid` + `GridItem` (in `ScrollView`); `Grid`+`GridRow` | `.flexible/.fixed/.adaptive`, `gridCellColumns`, `.scrollTargetBehavior` |
| Label | `Label` / `Text` | `.labelStyle(.titleOnly/.iconOnly/.titleAndIcon)`, `.foregroundStyle(.secondary)`, `.textSelection(.enabled)` |
| Text view | `TextEditor` / `Text` | Dynamic Type, keyboard type |
| Image | `Image`, `AsyncImage` | `.resizable()`, `.aspectRatio(contentMode:)`, `placeholder:`, `phase:` |
| Box | `GroupBox` | `label:` |
| Disclosure | `DisclosureGroup` | `isExpanded:` |
| Outline | `OutlineGroup` / `List(children:)` | `children:` |
| Scroll | `ScrollView` | `.scrollTargetBehavior`, `.defaultScrollAnchor`, `ScrollViewReader`, `ScrollEdgeEffectStyle` |
