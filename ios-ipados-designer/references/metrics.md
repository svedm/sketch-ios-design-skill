# Metrics — Hard Numbers Quick Reference

The file you open to set exact values in Sketch: touch targets, bar heights, spacing, radii, Dynamic Type, device sizes, and the SwiftUI element each maps to. iOS 26 / Liquid Glass is the default. See `foundations.md` for concepts, `platform-ios-ipados.md` for full device/safe-area data, `swiftui-catalog.md` for API detail.

> **Citations** point to the source HIG page. Values marked **(convention)** are widely-used Apple defaults **not** stated numerically in the sources provided — verify against Apple Design Resources Sketch templates before shipping pixel-critical work.

---

## 1. Touch targets

| Target | Value | SwiftUI | Source |
| --- | --- | --- | --- |
| Min hit region, iOS/iPadOS | **44×44 pt** | native controls meet this; enforce on custom via `.frame(minWidth:44,minHeight:44)` + `.contentShape()` | Buttons |
| Min hit region, visionOS | **60×60 pt** | — | Buttons |
| Spacing between interactive elements | Enough to visually distinguish + reliably hit; group logically | `.padding()`, `Spacer()` | Layout / Buttons |
| visionOS: centers apart | **≥60 pt**; add **4 pt** padding if button ≥60 pt (hover) | — | Buttons / Layout |
| Recommended min spacing between targets | **8 pt** (convention) | — | (convention) |

Do: keep hit region ≥44 pt even when the visible glyph is smaller. Don't: rely on a 24 pt icon's bounds as the tap area.

---

## 2. Bar metrics (iOS/iPadOS, Liquid Glass)

Sources describe bar **behavior** (floating glass, scroll edge effect) but rarely publish pt heights; heights below are **(convention)** unless cited. Confirm in Apple Design Resources templates.

| Bar | Height / metric | Notes | SwiftUI | Source |
| --- | --- | --- | --- | --- |
| Status bar | **44–54 pt** tall depending on device; taller on Dynamic Island phones (convention) | Keep visible unless immersive | system-managed; read via safe area | Layout (hide guidance) |
| Dynamic Island | occupies top-center of safe area; treat as a system feature to design around (convention pt) | Respect safe area; don't place controls under it | `.safeAreaInset` / safe area | Layout (adaptability) |
| Navigation bar — standard title | **44 pt** (convention) | Collapses from large on scroll | `NavigationStack` + `.toolbar` | Toolbars |
| Navigation bar — large title | **~96 pt** total large area (convention) | Transitions to standard title as content scrolls to top | `.navigationBarTitleDisplayMode(.large)` | Toolbars (iOS) |
| Tab bar (iPhone) | Floating **Liquid Glass** bar at bottom; content peeks through; **~49 pt** item area (convention) | Can minimize on scroll; optional inline accessory (e.g. MiniPlayer); optional trailing Search tab | `TabView` (+ `.tabViewStyle`, `Tab(role:.search)`) | Tab bars (iOS) |
| Tab bar (iPad) | Sits **near the top**; can be fixed or convert to sidebar | Prefer ≤5 default tabs | `TabView().tabViewStyle(.sidebarAdaptable)` | Tab bars (iPadOS) |
| Toolbar / bottom bar | Uses content layer for color + **scroll edge effect** to separate from content; standard item corner radii are **concentric with the bar** | ≤3 groups; primary action `.prominent`, trailing | `.toolbar { ToolbarItem(...) }`, `ScrollEdgeEffectStyle` | Toolbars |
| Window title text | Keep **< 15 characters** | leave empty if redundant | `.navigationTitle` | Toolbars |
| Tab bar, tvOS (reference only) | **68 pt** tall, top edge **46 pt** from screen top | fixed; doesn't affect iPad | — | Tab bars (tvOS) |

Liquid Glass do/don't: **Don't** add custom bar backgrounds or tinted bar buttons — they fight the system glass + scroll edge effect (Toolbars). **Do** let content drive bar color; prefer monochromatic bar items over content-matching colors (Color § Liquid Glass color).

---

## 3. Spacing & margins

Not published as pt in the sources given; the rhythm below is **(convention)** — Apple templates use these consistently.

| Token | Value | Use |
| --- | --- | --- |
| Layout margin, compact width | **16 pt** leading/trailing (convention) | screen edge → content |
| Layout margin, regular width (iPad) | **20 pt** (convention) | wider gutters |
| Spacing rhythm | **4 / 8 / 12 / 16 / 20 pt** (convention) | 8 pt base grid; multiples for inter-element gaps |
| Section spacing (grouped) | **~24–35 pt** between grouped sections (convention) | grouped list style adds space + header/footer (Lists and tables) |
| Readable width | **~672 pt** cap on text column (convention) | restrict long text for readability — source describes the guide, no pt | Layout |

SwiftUI: `VStack(spacing:)`, `.padding(_:)`, `Spacer()`, and layout-margin-aware containers (`Form`, `List`) apply system margins automatically — prefer them over hardcoded insets. Readable width → `List`/`Form` do this by default; for custom use `.frame(maxWidth:)`.

Do: extend backgrounds & scroll content **edge-to-edge** under the glass control layer (Layout); use `backgroundExtensionEffect()` where content is narrower than the window. Don't: use full-width buttons flush to screen edges — inset from system margins (Layout, iOS).

---

## 4. Corner radii

Sources specify the **style and concentricity**, not pt values (those are **(convention)**).

| Element | Radius | Source |
| --- | --- | --- |
| Corner style | **Continuous** (squircle), not circular (convention) | — |
| Bar items / standard components | Corner radii **concentric with the bar's corners** — match if custom | Toolbars |
| Liquid Glass controls | Corners stay **concentric** with the glass shape; capsule for pills | Materials / Glass |
| Card / grouped container | **~10–12 pt** (convention) | — |
| Small control / field | **~8–10 pt** (convention) | — |
| Continuous alert / sheet card | **~13 pt** (convention) | — |

SwiftUI: `RoundedRectangle(cornerRadius:_, style: .continuous)`; for glass use `.glassEffect(_:in:)` with a shape; `Capsule()` for pill buttons; `ConcentricRectangle`/`.buttonBorderShape(.roundedRectangle)` where offered. See `liquid-glass.md`.

---

## 5. Dynamic Type — iOS/iPadOS text styles

> **Source gap:** the iOS/iPadOS Dynamic Type size table did **not** render in the provided Typography source (section header present, rows empty). Sizes/weights/leading below are the standard **Large (default) content-size** values — **(convention)** — download the authoritative table from Apple Design Resources. Only **Default 17 pt / Minimum 11 pt** is source-cited (Typography).

| Text style | Size pt | Weight | Leading pt | SwiftUI `Font` | Emphasized |
| --- | --- | --- | --- | --- | --- |
| Large Title | 34 | Regular | 41 | `.largeTitle` | Bold |
| Title 1 | 28 | Regular | 34 | `.title` | Bold |
| Title 2 | 22 | Regular | 28 | `.title2` | Bold |
| Title 3 | 20 | Regular | 25 | `.title3` | Semibold |
| Headline | 17 | Semibold | 22 | `.headline` | — |
| Body | 17 | Regular | 22 | `.body` | Semibold |
| Callout | 16 | Regular | 21 | `.callout` | Semibold |
| Subheadline | 15 | Regular | 20 | `.subheadline` | Semibold |
| Footnote | 13 | Regular | 18 | `.footnote` | Semibold |
| Caption 1 | 12 | Regular | 16 | `.caption` | Medium |
| Caption 2 | 11 | Regular | 13 | `.caption2` | Semibold |

All values above are **(convention)** except the emphasized-weight column pattern, which follows the source's stated approach (emphasized weight = medium/semibold/bold/heavy; apply with `.bold()` / symbolic traits) — Typography.

**Reference — macOS built-in text styles (source-cited, @2x/144 ppi):** Large Title 26/32, Title 1 22/26, Title 2 17/22, Title 3 15/20, Headline 13 Bold/16, Body 13/16, Callout 12/15, Subheadline 11/14, Footnote 10/13, Caption 1 10/13, Caption 2 10 Medium/13 (size/leading). Use only if targeting Mac Catalyst — Typography.

SwiftUI: use the semantic styles (`.font(.body)` etc.) — they carry Dynamic Type + accessibility scaling automatically. Avoid `.font(.system(size:))` for body content. Adjust leading with `.leading(.tight/.loose)` (Typography). SF Symbols in text scale with the style automatically.

Defaults & minimums (source-cited, Typography):

| Platform | Default | Minimum |
| --- | --- | --- |
| iOS, iPadOS | **17 pt** | **11 pt** |
| visionOS | 17 pt | 12 pt |
| watchOS | 16 pt | 12 pt |
| macOS | 13 pt | 10 pt |
| tvOS | 29 pt | 23 pt |

Do: prefer Regular/Medium/Semibold/Bold. Don't: use Ultralight/Thin/Light for UI text, especially at small sizes (Typography).

---

## 6. SF fonts — weights & symbol scales

**San Francisco (SF)** = system font (SF Pro on iOS/iPadOS; SF Compact on watchOS). **New York (NY)** = serif companion (`Font.Design.serif`). Rounded variant available for soft UI (Typography).

**Nine weights** (each maps 1:1 to an SF Symbol weight for text↔symbol matching) — Typography / SF Symbols:

`Ultralight → Thin → Light → Regular → Medium → Semibold → Bold → Heavy → Black`

- Avoid Ultralight, Thin, Light for UI text (Typography).
- SwiftUI: `.fontWeight(.semibold)` / `Font.system(_, weight:)`.

**SF Symbol scales** — three, relative to SF cap height (SF Symbols):

| Scale | SwiftUI |
| --- | --- |
| Small | `.imageScale(.small)` |
| Medium (default) | `.imageScale(.medium)` |
| Large | `.imageScale(.large)` |

Symbols come in all 9 weights (`.fontWeight` on the symbol) + rendering modes (monochrome / hierarchical / palette / multicolor, `.symbolRenderingMode(_)`). Prefer **fill** variants in tab bars & swipe actions; **outline** in toolbars/lists (SF Symbols). SwiftUI: `Image(systemName:)`, `Label`.

---

## 7. Control & row heights

Sources give explicit pt heights only for **visionOS** buttons; iOS/iPadOS heights are **(convention)**.

| Element | Height | SwiftUI | Source |
| --- | --- | --- | --- |
| Standard control / button (iOS) | **44 pt** to match min target (convention) | `.controlSize(.regular)` | (convention) |
| Standard list row (iOS) | **44 pt** (convention) | `List { }` | (convention) |
| Grouped list — adds header/footer + spacing | style-driven | `.listStyle(.insetGrouped)` | Lists and tables |
| Text field / small control | **~30–36 pt** (convention) | `TextField`, `.textFieldStyle(.roundedBorder)` | (convention) |
| visionOS button sizes | Mini **28**, Small **32**, Regular **44**, Large **52**, XL **64 pt** | `.controlSize(.mini/.small/.regular/.large/.extraLarge)` | Buttons (visionOS) |

`ControlSize` cases (`.mini .small .regular .large .extraLarge`) map to the visionOS size ladder and scale bordered controls on iOS/iPadOS — see `swiftui-catalog.md` / `components-controls.md`.

---

## 8. Sheet detents (iOS/iPadOS)

| Detent | Height | SwiftUI | Source |
| --- | --- | --- | --- |
| Medium | **~½** of full height | `.presentationDetents([.medium])` | Sheets |
| Large | full expanded height (default) | `.presentationDetents([.large])` | Sheets |
| Custom | any value | `.presentationDetents([.fraction(x)])` / `.height(_)` | Sheets |

Grabber: `.presentationDragIndicator(.visible)`. iPad: prefer **page** or **form** sheet styles (default sizes, dimmed backdrop) — Sheets. Buttons: Cancel = leading, Done = trailing top toolbar (Sheets). See `components-presentation.md`.

---

## 9. Materials & glass values (numeric)

| Value | Number | SwiftUI | Source |
| --- | --- | --- | --- |
| Dimming layer behind **clear** glass over bright content | **35% dark** | `Glass.clear` + dim layer | Materials |
| Standard materials, iOS/iPadOS | ultraThin / thin / regular (default) / thick | `.background(.regularMaterial)` etc. (`Material`) | Materials |
| Glass variants | regular (default) / clear | `.glassEffect(.regular / .clear, in:)` | Materials / Glass |

Rules: **Don't** put Liquid Glass in the content layer (only controls/nav) — except transient interactive elements (Slider/Toggle thumbs) that adopt glass on touch. Use **clear** only over rich media backgrounds. Larger glass (sidebars) is more opaque for legibility. See `liquid-glass.md`.

---

## 10. Device logical sizes (iPhone / iPad, portrait pt)

Source-cited (Layout). @3x unless noted. **Safe-area insets are not in these sources — see `platform-ios-ipados.md`** and Apple Design Resources templates.

**Current iPhones (2024–2025):**

| Model | Logical pt | Size class (portrait) |
| --- | --- | --- |
| iPhone 17 Pro Max / 16 Pro Max | **440×956** | Compact W, Regular H |
| iPhone Air | **420×912** | Compact W, Regular H |
| iPhone 17 Pro / 17 / 16 Pro / 15 Pro | **402×874** *(17)* / 393×852 *(15/16 Pro)* | Compact W, Regular H |
| iPhone 16 Plus / 15 Plus / 15 Pro Max | **430×932** | Compact W, Regular H |
| iPhone 16 | **393×852** | Compact W, Regular H |
| iPhone 16e / 15 / 14 | 390×844 / 393×852 | Compact W, Regular H |

All iPhones portrait = **Compact width, Regular height**; landscape = Compact or Regular width depending on model (Plus/Max/Air → Regular W landscape) — Layout.

**Current iPads (pt):**

| Model | Logical pt |
| --- | --- |
| iPad Pro 13-inch | **1032×1376** |
| iPad Pro 12.9-inch / Air 13-inch | **1024×1366** |
| iPad Pro 11-inch (5th/6th gen) | **834×1210** |
| iPad Air 11-inch / iPad 11-inch | **820×1180** |
| iPad 10.2-inch | 810×1080 |
| iPad mini 8.3-inch | **744×1133** |

All iPads = **Regular width, Regular height** in both orientations (Layout). Design full-screen first; defer switching to compact layouts until the full layout no longer fits; on resize hide tertiary columns (inspectors) first — Layout (iPadOS). iPad windows are freely resizable to a min — test halves/thirds/quadrants. SwiftUI: read `@Environment(\.horizontalSizeClass)`; use `NavigationSplitView` for multi-column.

---

## Quick do/don't recap

- **Do** enforce 44×44 pt targets; use semantic Dynamic Type styles; keep bars glass + monochromatic; inset from system margins; extend content edge-to-edge under the control layer.
- **Don't** invent bar backgrounds/tints; use light font weights for UI text; hardcode `.font(.system(size:))` for body; place controls at extreme edges without safe-area/margin respect; use clear glass over non-media backgrounds.
