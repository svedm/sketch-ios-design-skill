# HIG → Sketch → SwiftUI Mapping

The crown-jewel three-way table: read a row to go from an Apple HIG concept, to what to draw with the Apple Design Resources component in Sketch, to the exact SwiftUI type + style to write. iOS/iPadOS, Liquid Glass.

> **Sketch column** = the **top-level group** in the **Apple iOS 27 UI Kit** (verified against the live library). For the exact leaf symbol path, variant axes (Size/Style/State/Appearance) and text/layer/color styles, use **`sketch-library.md`** — it is the authoritative inventory. `— compose` means the HIG component has **no dedicated kit symbol** (build it from primitives + tokens). Navigation bars live under `Toolbars / Top (44pt)`; there is no separate "Navigation Bars" or "Search" group.
>
> **SwiftUI column** names are validated against the SwiftUI catalog slug list. Where a style is what matters, the modifier is shown (e.g. `Picker` + `.pickerStyle(.segmented)`).
>
> **Sizes** cross-ref `metrics.md`. The `44 pt` minimum hit target is system-wide (visionOS 60 pt). Button point sizes 28/32/44/52/64 are the system `ControlSize` scale (mini/small/regular/large/extraLarge) — the pt values are documented for the visionOS button size table; treat as the ControlSize ladder on iOS/iPadOS (convention for exact iOS pt).
>
> Siblings: `liquid-glass.md`, `foundations.md`, `metrics.md`, `components-*.md`, `swiftui-catalog.md`, `sketch-playbook.md`.

---

## 1 · Navigation & bars

| HIG component | SwiftUI type / modifier | Apple Design Resources (Sketch) | Key states & sizes | When to use / notes |
|---|---|---|---|---|
| Tab bar | `TabView { Tab(...) }`; `.tabViewStyle(.sidebarAdaptable)` for iPad sidebar-adaptable; `.tabBarMinimizeBehavior(.onScrollDown)`; bottom accessory via `TabViewBottomAccessoryPlacement` | `Tab Bars` | Floats on **Liquid Glass** at bottom; selected vs unselected; badge = red oval; minimizes on scroll with inline accessory (MiniPlayer). Height 68 pt / 46 pt-from-top is **tvOS-only**; iOS bar height is system-set. | 2–5 top-level peers. Add trailing **search tab**. Don't use for actions. See `components-navigation.md`. |
| Sidebar | `NavigationSplitView { … }` sidebar column; `List { … }.listStyle(.sidebar)`; `.tabViewStyle(.sidebarAdaptable)` | `Sidebar` | Regular width classes (iPad/Mac); collapses in compact. Sidebar rests on **Liquid Glass**. Selection-driven. | iPad primary nav / many sections. Content can scroll under it (background extension). |
| Navigation bar (title + back) | `NavigationStack` + `.navigationTitle(_:)` + `.navigationBarTitleDisplayMode(.large/.inline)` + `.toolbar { }` | `Toolbars / Top (44pt)` | Large vs inline title; back chevron; **scroll edge effect** blurs content under bar. Bar is Liquid Glass. | Push/pop hierarchy. `.navigationDestination(for:)` for data-driven. |
| Toolbar | `.toolbar { ToolbarItem(placement:) }`, `ToolbarItemGroup`, `ToolbarSpacer` (iOS 26) | `Toolbars / Bottom (44pt)` | Leading / center / trailing groups; max ~3 groups. Items get **Liquid Glass**; `ToolbarSpacer` splits groups into separate glass capsules. | Top or bottom. Prominent style for primary (Done). See `components-navigation.md`. |
| Split view | `NavigationSplitView(columnVisibility:sidebar:content:detail:)`; `.navigationSplitViewStyle(.balanced / .prominentDetail)` | `Sidebar` + layout | 2–3 columns; `NavigationSplitViewVisibility`; collapses to stack in compact width. | iPad multi-column master/detail. |
| Search field | `.searchable(text:placement:prompt:)`; scopes `.searchScopes(...)`; tokens variant | `Tab Bars (Search tab) — see Examples` | Bar-integrated or dedicated **search tab**; `.isSearching` env; suggestions. | Attach to `NavigationStack`/`NavigationSplitView`/`TabView`. See `inputs.md`. |
| Page control | `TabView` + `.tabViewStyle(.page)` + `.indexViewStyle(.page(backgroundDisplayMode:))` | `Page Control` | Dots, solid = current; custom symbol per page; ≤ ~10 dots; centered bottom. | Ordered peer pages only, not hierarchy. |

---

## 2 · Controls & input

| HIG component | SwiftUI type / modifier | Apple Design Resources (Sketch) | Key states & sizes | When to use / notes |
|---|---|---|---|---|
| Button | `Button(role:action:)`; `.buttonStyle(.borderedProminent / .bordered / .borderless / .plain / .glass / .glassProminent)`; `.controlSize(_:)`; `.buttonBorderShape(.capsule/.circle)` | `Buttons` | Roles: primary/`.destructive`/`.cancel`; states normal·pressed·disabled·(hover). Sizes mini 28 · small 32 · regular 44 · large 52 · xLarge 64 pt (ControlSize). Hit ≥ 44×44. | One–two prominent per view. **`.glass`/`.glassProminent` = Liquid Glass capsules (iOS 26).** Prefer capsule/circle. |
| Toggle (switch) | `Toggle(_:isOn:)`; `.toggleStyle(.switch / .button)` (`.checkbox` is macOS-only) | `Toggles` | On/off; on-tint = accent; transient **Liquid Glass** on activation. | Instant binary setting. `.button` style for toolbar toggles. |
| Slider | `Slider(value:in:step:)` (optional `minimumValueLabel:`/`maximumValueLabel:`) | `Sliders` | Track + thumb; thumb takes Liquid Glass while dragging; 44 pt touch. | Continuous range where exact value isn't critical. |
| Stepper | `Stepper(_:value:in:step:)` | `Stepper` | −/+ segments; disabled at bounds. | Small discrete adjustments; pair with a field. |
| Segmented control | `Picker` + `.pickerStyle(.segmented)` | `Segmented Controls` | 2–5 segments equal width; one selected; text **or** icon per segment (not mixed). | Mutually exclusive views/modes. |
| Picker (menu / pop-up button) | `Picker` + `.pickerStyle(.menu)` | `Menus` | Shows current value; opens menu; check-marks selection. | Choose one from many; compact. HIG "Pop-up button". |
| Picker (wheel / inline) | `Picker` + `.pickerStyle(.wheel / .inline / .navigationLink)` | `Date and Time Pickers` | Wheel drum; inline list; drill-in. | Wheel for long value sets in forms. |
| Date picker | `DatePicker` + `.datePickerStyle(.compact / .wheel / .graphical)`; `MultiDatePicker` for multi-select | `Date and Time Pickers` | Compact chip → popover calendar; graphical inline calendar. | `.compact` in forms; `.graphical` for full calendar. |
| Color well | `ColorPicker(_:selection:)` | `Color Pickers` | Swatch → system color picker popover; supports drag-drop of colors. | Let people pick/edit a color. |
| Pull-down button | `Menu { … } label: { … }` | `Menus` | Tap opens menu of actions/items; no persistent selection. | A set of related commands under one button. |
| Pop-up button | `Picker` + `.pickerStyle(.menu)` (see above) | `Menus` | Displays current choice. | Selection, not commands (vs pull-down). |
| Menu | `Menu`; sections via `Section`; `ControlGroup` for grouped controls | `Menus` | Actions, submenus, toggles, `Picker`s inline; destructive rows in red. | Command surface. See `components-controls.md`. |
| Context menu | `.contextMenu { }` (optional `preview:`) | `Menus` | Long-press/right-click; optional preview; on **Liquid Glass**. | Secondary actions on an item; don't hide primary actions here. |
| Edit button | `EditButton()` | `Buttons` (Edit) | Toggles list edit mode (Edit ⇄ Done). | Enable list reorder/delete. |
| Text field | `TextField(_:text:)`; `.textFieldStyle(.roundedBorder / .plain)`; `SecureField` for passwords | `Text Fields` | Placeholder, focus ring, clear button; keyboard/submit config. | Single-line input. See `inputs.md`. |
| Text view (multiline) | `TextEditor(text:)`; `.textEditorStyle(.plain / .roundedBorder)` | `Text Fields` (multiline) | Scrollable multiline; focus. | Longer freeform text. |
| Label | `Label(_:systemImage:)`; `.labelStyle(.titleAndIcon / .iconOnly / .titleOnly)` | (composed; SF Symbol + text) | Icon + title pairing. | Standard icon-with-text; use SF Symbols. See `foundations.md`. |
| Link | `Link(_:destination:)`; `ShareLink(item:)` for sharing | `Menus` / inline text | Tappable URL; ShareLink opens share sheet. | Navigate out / share. |
| Rename / Paste | `RenameButton()`, `PasteButton(payloadType:onPaste:)` | `Menus` | System-styled command buttons. | Rename in menus; paste typed data. |

---

## 3 · Presentation & modality

| HIG component | SwiftUI type / modifier | Apple Design Resources (Sketch) | Key states & sizes | When to use / notes |
|---|---|---|---|---|
| Sheet | `.sheet(isPresented:content:)`; `.presentationDetents([.medium,.large])`; `.presentationDragIndicator(.visible)`; `.presentationBackground(...)` | `Sheets` | Partial (medium) ↔ full (large) or custom `.fraction`/`.height`; grabber; rounded corners; background can use material. | Self-contained task/subtask. Detents = resizable card. See `components-presentation.md`. |
| Full-screen cover | `.fullScreenCover(isPresented:content:)` | `Sheets` (full) | Covers everything; own dismiss. | Immersive/onboarding flows needing full canvas. |
| Alert | `.alert(_:isPresented:actions:message:)` | `Alerts` | ~270 pt wide (convention); ≤2 primary actions; destructive red; cancel bold. Centered, **regular Liquid Glass**. | Critical, must-acknowledge info. Title terse. |
| Action sheet / confirmation dialog | `.confirmationDialog(_:isPresented:titleVisibility:actions:)` | `Action Sheets` | iPhone: bottom sheet of choices; iPad/Mac: popover; destructive + cancel roles. | Confirm a specific action, esp. destructive. |
| Popover | `.popover(isPresented:attachmentAnchor:arrowEdge:content:)` | `Popovers (iPad Only)` | Arrow to anchor; adapts to sheet in compact width (`.presentationCompactAdaptation`). | iPad transient focused content anchored to a control. |
| Edit menu (selection callout) | System-provided on selectable `Text`/`TextField`/`TextEditor`; custom items via UIKit `UIEditMenuInteraction` (no first-class SwiftUI API) | `Edit Menu` | Copy/Paste/Look Up… on long-press of text/item selection. | Don't hide system edit actions; add app-specific ones sparingly. |
| Ornament (iPad/visionOS-ish bars) | `.toolbar` placements / bottom accessory | `Toolbars / Bottom (44pt)` | — | On iPad, prefer toolbars/bottom accessory (ornaments are visionOS). |

---

## 4 · Content & collections

| HIG component | SwiftUI type / modifier | Apple Design Resources (Sketch) | Key states & sizes | When to use / notes |
|---|---|---|---|---|
| List (table view) | `List`; `.listStyle(.insetGrouped / .grouped / .plain / .sidebar)`; rows via `Section` | `Lists`, `Lists (Grouped Table View)` | Row selection, swipe actions, reorder (with `EditButton`), disclosure; 44 pt min row. | Single-column data / settings. `.insetGrouped` is the modern grouped look. See `components-content.md`. |
| Form | `Form`; `.formStyle(.grouped)`; group with `Section` | `Lists` (grouped) | Grouped rows of controls; headers/footers. | Settings & data-entry screens. |
| Table (multi-column) | `Table(of:)` { `TableColumn` }; `.tableStyle(...)` | `Lists (Grouped Table View)` (columns) | Sortable columns; selection; collapses on iPhone. | iPad/Mac multi-column data. |
| Collection / grid | `LazyVGrid(columns:)` / `LazyHGrid(rows:)` inside `ScrollView`; `Grid`/`GridRow` for static | `— compose` | Adaptive/fixed/flexible `GridItem`; cell selection. | Image/tile galleries. `Grid` for fixed 2-D layout. |
| Section | `Section { } header: { } footer: { }` | (part of list/form symbol) | Header/footer, collapsible in some styles. | Group rows in List/Form/Picker/Menu. |
| Disclosure control | `DisclosureGroup(isExpanded:)`; `OutlineGroup` / `List(children:)` for trees | `Lists (disclosure rows)` | Chevron expand/collapse; outline indentation. | Show/hide detail; hierarchical outlines. |
| Group box | `GroupBox { }` | `— compose` | Titled bordered container. | Visually group related content on a form-like screen. |
| Image | `Image(_:)`; `Image(systemName:)` (SF Symbols); `AsyncImage(url:)` for remote | `— compose` | `.resizable().scaledToFit()`; symbol weights/scales; async phases. | SF Symbols for iconography (see `foundations.md`). |
| Text | `Text(_:)` + `.font(.largeTitle/.title/.headline/.body/.caption…)` | (type styles) | Dynamic Type styles; `.foregroundStyle`. | Use semantic text styles, not fixed pt. See `foundations.md`. |
| Scroll view | `ScrollView`; `.scrollTargetBehavior(...)`; lazy stacks inside | `Lists / scroll` (scrolling) | Scroll edge effect blurs bars over content (Liquid Glass). | Wrap long/custom content. |
| Chart | **Swift Charts** `Chart { … }` (separate framework, outside SwiftUI catalog) | `— compose (Swift Charts)` | Bar/line/area/point marks. | Data visualization. Not in the core SwiftUI catalog — flag when generating. |
| Web view | `WebView(url:)` / `WebView(webPage)` + `WebPage` (WebKit, iOS 26); pre-26 → `WKWebView` in `UIViewRepresentable` | `— compose` | Inline web/HTML; show forward/back controls when multi-page. | Brief in-app web content — don't rebuild Safari. |

---

## 5 · Status & feedback

| HIG component | SwiftUI type / modifier | Apple Design Resources (Sketch) | Key states & sizes | When to use / notes |
|---|---|---|---|---|
| Progress indicator (bar) | `ProgressView(value:total:)` + `.progressViewStyle(.linear)` | `Progress Indicators` | Determinate 0–1; label/currentValueLabel. | Known-duration task. See `components-status-system.md`. |
| Activity indicator (spinner) | `ProgressView()` + `.progressViewStyle(.circular)` | `Progress Indicators` | Indeterminate spinner. | Unknown-duration wait. |
| Gauge | `Gauge(value:in:)` + `.gaugeStyle(.accessoryCircular / .accessoryLinear / .accessoryLinearCapacity / .linearCapacity)` | `— compose` | Circular/linear; min/max/current labels; capacity variants. | Show a value within a range (battery, rings). iOS 16+. |
| Badge | `.badge(_:)` on List rows / `TabView` items | (part of tab/list symbol) | Red oval, number or "!". | Critical unread/attention counts only. |
| Rating / other status | compose (`Image(systemName:)` stars, etc.) | `Status` | — | No dedicated control; compose from symbols. |

---

## 6 · Foundations / materials

| HIG concept | SwiftUI type / modifier | Apple Design Resources (Sketch) | Key states & sizes | When to use / notes |
|---|---|---|---|---|
| Liquid Glass (custom views) | `.glassEffect(_:in:)` with `Glass` (`.regular` / `.clear`, `.tint(_:)`, `.interactive(_:)`); group with `GlassEffectContainer`; morph via `.glassEffectID(_:in:)` | (material, not a symbol) | **regular** = blurs/adjusts luminosity (default, text-heavy: alerts, sidebars, popovers); **clear** = highly translucent over media (add 35% dim if bright). iOS 26. | Functional layer only — **never in the content layer**. Use sparingly on custom controls. See `liquid-glass.md`. |
| Standard materials | `.background(.ultraThinMaterial / .thinMaterial / .regularMaterial / .thickMaterial)` (`Material`) | (material) | Four tiers; thicker = more opaque/contrast, thinner = more context. | Content-layer separation (app backgrounds, cards) — NOT for the glass nav layer. |
| Vibrancy | `.foregroundStyle(.secondary / .tertiary / .quaternary)` on material | (material label styles) | Avoid quaternary on thin/ultraThin (low contrast). | Label legibility over materials. |
| Color | `.tint(_:)`, `.foregroundStyle(Color)`, system semantic colors | `Color` styles | Accent drives prominent controls; prefer monochrome labels over colorful content. | See `foundations.md`, Liquid Glass color. |
| Control size | `.controlSize(.mini/.small/.regular/.large/.extraLarge)` | (size variants) | 28 / 32 / 44 / 52 / 64 pt ladder (documented for buttons). | Scale controls consistently; cross-ref `metrics.md`. |
| Corner / shape | `.buttonBorderShape(.capsule/.circle/.roundedRectangle)`, `ContainerRelativeShape` | (shape) | Prefer capsule/circle for standalone buttons. | Rounded shapes read as tappable under glass. |

---

## Reverse index — SwiftUI → HIG → Sketch (code-first)

| SwiftUI | HIG name | Sketch (verify) |
|---|---|---|
| `Button` + `.buttonStyle(.borderedProminent/.glass/.glassProminent)` | Button | `Buttons` |
| `Toggle` `.toggleStyle(.switch/.button)` | Toggle | `Toggles` |
| `Slider` | Slider | `Sliders` |
| `Stepper` | Stepper | `Stepper` |
| `Picker` `.pickerStyle(.segmented)` | Segmented control | `Segmented Controls` |
| `Picker` `.pickerStyle(.menu)` | Pop-up button | `Menus` |
| `Picker` `.pickerStyle(.wheel/.inline)` | Picker | `Date and Time Pickers` |
| `DatePicker` / `MultiDatePicker` | Date picker | `Date and Time Pickers` |
| `ColorPicker` | Color well | `Color Pickers` |
| `Menu` | Pull-down button / Menu | `Menus` |
| `.contextMenu` | Context menu | `Menus` |
| `TextField` / `SecureField` | Text field | `Text Fields` |
| `TextEditor` | Text view | `Text Fields` |
| `Label` | Label | (SF Symbol + text) |
| `Link` / `ShareLink` | Link / Share | `Menus` |
| `TabView` (+`.tabViewStyle(.sidebarAdaptable/.page)`) | Tab bar / Page control | `Tab Bars` |
| `NavigationStack` + `.navigationTitle` | Navigation bar | `Toolbars / Top (44pt)` |
| `NavigationSplitView` | Split view / Sidebar | `Sidebar` |
| `.toolbar` / `ToolbarItem` / `ToolbarSpacer` | Toolbar | `Toolbars / Bottom (44pt)` |
| `.searchable` | Search field | `Tab Bars (Search tab) — see Examples` |
| `.sheet` + `.presentationDetents` | Sheet | `Sheets` |
| `.fullScreenCover` | Full-screen modal | `Sheets` |
| `.alert` | Alert | `Alerts` |
| `.confirmationDialog` | Action sheet | `Action Sheets` |
| `.popover` | Popover | `Popovers (iPad Only)` |
| `List` `.listStyle(.insetGrouped/.sidebar)` | List / Table view | `Lists` |
| `Form` `.formStyle(.grouped)` | Form | `Lists` |
| `Table` | Table (columns) | `Lists (Grouped Table View)` |
| `LazyVGrid`/`LazyHGrid`/`Grid` | Collection | `— compose` |
| `DisclosureGroup`/`OutlineGroup` | Disclosure control | `Lists (disclosure rows)` |
| `Image`/`AsyncImage` | Image / SF Symbol | `— compose` |
| `ProgressView` `.circular/.linear` | Activity / Progress indicator | `Progress Indicators` |
| `Gauge` | Gauge | `— compose` |
| `.badge` | Badge | (in tab/list symbol) |
| `.glassEffect` / `GlassEffectContainer` / `Glass` | Liquid Glass | (material) |
| `.background(.regularMaterial)` (`Material`) | Standard material | (material) |

---

## Rarely-on-iOS (group briefly)

These SwiftUI/HIG items are macOS/visionOS-leaning or niche; use only when the iPad decision needs them:

- **`GroupBox` / `ControlGroup`** — Mac-style grouped controls; on iPad appears in toolbars/menus (`ControlGroup` renders as a segmented cluster).
- **`WindowGroup` / `Window` / `Settings` / `MenuBarExtra`** — multi-window & menu bar; iPad supports multiple `WindowGroup` scenes, but menu bar / `Settings` scene are macOS.
- **`Table` heavy multi-column, `Inspector` (`.inspector`)** — iPad-capable trailing inspector column; rare in phone layouts.
- **Ornaments, immersive spaces, manipulation gestures, volumes** — visionOS only; do not draw for iOS/iPadOS.
- **Document types** (`DocumentGroup`, `FileDocument`, `.fileImporter`/`.fileExporter`) — document-based apps; system file UI, little to design.
- **Swift Charts `Chart`** — separate framework; design freely but note it's outside the core SwiftUI component catalog when handing to code.

## System experiences (out-of-app surfaces — not in-app views)

These are iOS/iPadOS but live **outside** your app's view tree, so they're deliberately not in the tables above. Design specs live in `components-status-system.md`; frameworks below.

| HIG component | Framework / entry point | Sketch (verify) | Notes |
|---|---|---|---|
| Widget | WidgetKit — `Widget`, `.systemSmall/.systemMedium/.systemLarge/.systemExtraLarge`, `accessory*` | `System / Lock Screen Widgets` | SwiftUI views, but a separate extension target + families. |
| Live Activity | ActivityKit + WidgetKit — Dynamic Island (compact/minimal/expanded) + Lock Screen | `System / Notifications` | Regions: leading/trailing/center/bottom. |
| Control (Control Center / Lock Screen / Action button) | `ControlWidget` (iOS 18+) | `System / Control Center` | Toggle/button controls outside the app. |
| Notification | UserNotifications; custom UI via Notification Content extension | `System / Notifications` | Design the content + actions. |
| Home Screen quick action | `UIApplicationShortcutItem` (UIKit) | `System / Home Screen Quick Actions` | Long-press app-icon menu. |
| Status bar | System-managed; `.statusBarHidden(_:)`, `.toolbarColorScheme` influence | (part of frame) | Light/dark content; don't obscure. |
