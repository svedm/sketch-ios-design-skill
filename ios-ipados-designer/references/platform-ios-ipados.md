# Platform: iOS vs iPadOS

What changes a layout between iPhone and iPad, and the SwiftUI adaptivity toolkit to express it. Cross-refs: `metrics.md` (spacing/type), `liquid-glass.md` (materials), `components-navigation.md` (bars/sidebars), `patterns.md` (multitasking).

## Mental model

| | iPhone (iOS) | iPad (iPadOS) |
|---|---|---|
| Display | Medium, high-res | Large, high-res |
| Hold / distance | One or two hands, ~1–2 ft | Handheld, stand, or desk, ~3 ft |
| Inputs | Multi-Touch, virtual keyboard, voice | + hardware keyboard, trackpad/pointer, Apple Pencil, often combined |
| Chrome default | Floating glass tab bar at **bottom** | Tab bar near **top**; sidebar; multi-column |
| Nav root | `TabView` or `NavigationStack` | `NavigationSplitView`, or `sidebarAdaptable` `TabView` |
| Windows | Full-screen (+ PiP) | Resizable windowed apps, tiling, multiple windows |
| Design bias | Limit onscreen controls; reachable mid/bottom; support swipe-back | Elevate content; minimize modals/full-screen; place controls out of the way |

Do: adapt to orientation, Dark Mode, Dynamic Type, window resizing. Don't: assume a fixed screen size or a single orientation.

## Device dimensions (logical points, portrait)

Points from the HIG *Layout* specifications. Safe-area insets are **not** given in source — values below are (convention); verify against Apple Design Resources templates in Sketch. See also `metrics.md`.

| Device | Pts W×H (portrait) | Scale | Top safe area | Bottom safe area |
|---|---|---|---|---|
| iPhone 17 Pro Max / 16 Pro Max | 440×956 | @3x | 59 (convention, Dynamic Island) | 34 (convention, home indicator) |
| iPhone 17 Pro / 17 / 16 Pro / 15 Pro | 402×874 / 393×852 | @3x | 59 (convention) | 34 (convention) |
| iPhone Air | 420×912 | @3x | 59 (convention) | 34 (convention) |
| iPhone 16 Plus / 15 Plus / 15 Pro Max | 430×932 | @3x | 59 (convention) | 34 (convention) |
| iPhone 16 / 15 | 393×852 | @3x | 59 (convention) | 34 (convention) |
| iPhone 16e / 14 | 390×844 | @3x | 47/59 (convention) | 34 (convention) |
| iPhone 13 mini | 360×780 | @3x | 50 (convention, notch) | 34 (convention) |
| iPhone SE (4.7") | 375×667 | @2x | 20 (convention, status bar) | 0 (Home button) |
| iPad Pro 13" | 1032×1376 | @2x | 24 (convention) | 0 (convention) |
| iPad Pro 12.9" / Air 13" | 1024×1366 | @2x | 24 (convention) | 0 (convention) |
| iPad Pro 11" (5th/6th gen) | 834×1210 | @2x | 24 (convention) | 0 (convention) |
| iPad Air 11" / iPad 11" | 820×1180 | @2x | 24 (convention) | 0 (convention) |
| iPad 10.2" | 810×1080 | @2x | 24 (convention) | 0 (convention) |
| iPad mini 8.3" | 744×1133 | @2x | 24 (convention) | 0 (convention) |
| iPad 9.7" / mini 7.9" | 768×1024 | @2x | 20 (convention) | 0 (convention) |

- Landscape = swap W/H. iPad supports both freely; iPhone often both, sometimes one only (don't tell users to rotate — they'll try).
- Dynamic Island / notch = **top** interactive/display feature; home indicator = **bottom**. Respect the safe area for both; extend backgrounds and scroll content edge-to-edge underneath. `SafeAreaRegions`, `.ignoresSafeArea()`.
- Status bar: keep visible unless an immersive game/media view — it shows useful info and occupies space most apps don't use.

## Size classes

`regular` = larger screen or landscape; `compact` = smaller screen or portrait. Trait = `horizontalSizeClass` × `verticalSizeClass`. SwiftUI: `@Environment(\.horizontalSizeClass)`, `@Environment(\.verticalSizeClass)`, type `UserInterfaceSizeClass`.

| Context | H width | V height |
|---|---|---|
| iPad (any model, portrait & landscape, full screen) | Regular | Regular |
| iPhone portrait (all) | Compact | Regular |
| iPhone landscape — Plus/Max ("Max"-width) | Regular | Compact |
| iPhone landscape — standard/Pro (non-Max) | Compact | Compact |
| iPad windowed (narrow tile / Slide Over) | Compact | Regular (behaves iPhone-like) |

Decision rule: switch layout on **`horizontalSizeClass`**, not device model. Compact width ⇒ single-column stack, bottom bars; Regular width ⇒ sidebar/split, multi-column, larger margins.

## iPad specifics

### Sidebar + NavigationSplitView (2 / 3 columns)
- 2-column (`NavigationSplitView { sidebar } detail:`) like Mail; 3-column (`{ sidebar } content: { } detail:`) like Keynote/Files.
- Selection in a leading column drives the next column; embed `NavigationStack` in a column with `.navigationDestination(for:)` for deeper drill-in.
- Column collapses into a single stack at narrow sizes (iPhone width, iPad Slide Over, watchOS/tvOS) — shows the last useful column; list rows draw disclosure chevrons.
- Sidebar shows ≤ 2 hierarchy levels; deeper ⇒ add a content column. Group with `DisclosureGroup`; label items with `Label` + SF Symbols; default icon color = app accent.
- Sidebars/tab bars/toolbars float in the **Liquid Glass** layer above content. Extend content beneath with `.backgroundExtensionEffect()` (mirrors adjacent content under the bar). See `liquid-glass.md`.
- Sidebar-only ⇒ `NavigationSplitView`. Sidebar↔tab-bar convertible ⇒ `TabView(...).tabViewStyle(.sidebarAdaptable)`.

### Multitasking & windows (current model)
- iPad runs full-screen **or** windowed apps; windows are freely resizable down to a min width/height (macOS-like). System provides window controls for tiling (halves, thirds, quadrants), full screen, minimize, close. App switcher for full-screen apps. An app can open multiple windows.
- Apps don't control or get told the multitasking config — **adapt to any window size**. (Legacy mode names Split View / Slide Over / Stage Manager are the user-facing framing; design to size, not to a named mode.)
- PiP: video/FaceTime overlays above content in both full-screen and windowed apps.
- Resize rule: design full-screen first; **defer switching to a compact layout as long as possible**; hide tertiary columns (inspectors) first as the window narrows. Test at system halves/thirds/quadrants.

### External display, pointer & keyboard
- External display / Display Zoom / resizable windows are context changes to handle via size classes + safe areas.
- Support pointer (trackpad/mouse) and hardware keyboard; combine input modes (e.g., Pencil + touch). Use viewing distance + input mode to set content size/density. See `inputs.md`.

### Popover vs sheet adaptivity
- On iPad (regular width) a `.popover` stays a popover; in compact width it **adapts to a sheet** by default. Control with `.presentationCompactAdaptation(_:)`. Prefer popovers for iPad transient tasks; prefer sheets on iPhone. See `components-presentation.md`.

### Margins & multi-column
- iPad uses larger margins and multi-column layouts; elevate content, minimize modals/full-screen transitions. Numeric margins live in `metrics.md`.

## iOS-26 chrome (Liquid Glass)

| Element | iPhone | iPad | SwiftUI |
|---|---|---|---|
| Tab bar | Floats above content at **bottom**, glass background content peeks through; search tab at trailing end; can minimize on scroll | Near **top**; fixed or convertible to sidebar; can coexist with a toolbar in the same top row | `TabView` + `Tab`; `.tabViewStyle(.sidebarAdaptable)` or `.tabBarOnly`; `.tabBarMinimizeBehavior(.onScrollDown)` |
| Toolbar / nav bar | Top; large title collapses to inline on scroll | Top; overflow menu **auto-added** when items don't fit; customizable | `.toolbar { ToolbarItem(placement:) }`; `.navigationTitle`; large title via nav bar |
| Sidebar | (converts to tab bar) | Floating glass, background-extended content | `NavigationSplitView` / `.sidebarAdaptable` |

Bar treatment do/don't:
- Do use a **scroll edge effect** (`ScrollEdgeEffectStyle`) to separate bar from content instead of a solid background.
- Do reserve `.prominent` for one primary action (Done/Submit), placed **trailing**.
- Don't add custom bar backgrounds/tints that fight system glass; don't manually add an overflow menu (system manages it on iPad/macOS); don't cause items to overflow by default.
- Prefer borderless system SF Symbols in toolbars; keep concentric corner radii; separate text-labeled buttons with fixed space.
- Avoid full-width buttons on iPhone — inset from screen edges; if full-width, align to hardware curvature and safe areas.

## SwiftUI adaptivity toolkit

| Need | Reach for |
|---|---|
| 2/3-column root that collapses on iPhone | `NavigationSplitView` (`init(sidebar:detail:)` / `(sidebar:content:detail:)`) |
| Branch layout on width | `@Environment(\.horizontalSizeClass) var hSize` → `if hSize == .regular { … } else { … }` |
| Pick largest layout that fits available space | `ViewThatFits(in: .horizontal) { largest; …; smallest }` — order most→least preferred |
| Column visibility / hide sidebar | `@State NavigationSplitViewVisibility`; `init(columnVisibility:…)`; default item removable via `.toolbar(removing: .sidebarToggle)` |
| Choose top column when collapsed on iPhone | `@State NavigationSplitViewColumn`; `init(preferredCompactColumn:…)` |
| Column sizing | `.navigationSplitViewColumnWidth(_:)` or `(min:ideal:max:)` per column |
| Emphasis / balance of columns | `.navigationSplitViewStyle(_:)` (e.g. `.balanced`, `.prominentDetail`) |
| Sidebar⇄tab bar in one control | `TabView { Tab(...) }.tabViewStyle(.sidebarAdaptable)` |
| Popover→sheet control on compact | `.presentationCompactAdaptation(_:)` |
| Content under floating bars | `.backgroundExtensionEffect()`; respect `safeAreaInsets` |

Pattern: root `NavigationSplitView` gives you iPad multi-column **and** iPhone stack for free — prefer it over hand-rolling size-class branches when the structure is list→detail. Use `ViewThatFits` / `horizontalSizeClass` for finer within-screen adaptation.
