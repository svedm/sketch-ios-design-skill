# Apple Design Resources — Sketch library inventory

The real, introspected inventory of the **Apple iOS 27 UI Kit** Sketch library (the official Apple Design Resources), as attached to the user's documents. This is the source of truth for **exact symbol / style / color names** to insert — pair it with `mapping.md` (what each thing is) and `sketch-playbook.md` (how to insert via MCP).

- **Library name:** `Apple iOS 27 UI Kit` · **id:** `C4648B33-1215-43AD-851E-D785ECD1113D`
- **Contents:** 952 symbols · 105 text styles · 42 layer styles · 107 color swatches
- iOS/iPadOS 27 — continues the **Liquid Glass** design language.

> **Refresh this inventory** any time (names can change with kit versions) via `run_code`:
> `sketch.Library.getLibraries().find(l => l.name.includes("iOS")).getImportableSymbolReferencesForDocument(doc).map(r => r.name)` (and the `…TextStyle…`, `…LayerStyle…`, `…Swatch…` variants). See `sketch-playbook.md`.

## Symbol naming convention

Every symbol path is:

```
<Group> / <Appearance: Dark|Light> / <variant axes…> / <State>
```

- **Appearance:** always `Dark` or `Light` — pick to match the artboard's mode. Build a Light artboard from `…/Light/…` symbols; duplicate + swap to `…/Dark/…` for the Dark variant.
- **State** (interactive components): `1 - Idle` · `3 - Pressed` · `4 - Disabled` (and `1 - Enabled` / `4 - Disabled` for some). Default to `1 - Idle`.
- Insert the leaf symbol, then set **overrides** (label text, SF Symbol, value) — see `sketch-playbook.md`. Don't detach.

## Component symbols → HIG → SwiftUI

| Insert symbol (path prefix) | HIG component | SwiftUI | Variant axes in the kit |
|---|---|---|---|
| `Buttons/{L}/{Size}/{Style}/{Content}/{State}` | Button | `Button` + `.buttonStyle(…)` + `.controlSize(…)` | Size: `Large·Medium·Regular·Small` → `.controlSize`. Style: `Bordered·Bordered Prominent·Default`(borderless)`·Destructive·Glass·Glass Prominent` → `.bordered·.borderedProminent·.borderless·role:.destructive·.glass·.glassProminent`. Content: `Symbol·Text·Symbol + Text` → `Label`/`Image`/`Text`. |
| `Tab Bars/{L}/{iPhone\|iPad (Regular)}/{Default\|Prominent Tab\|Search Selected…}` | Tab bar | `TabView { Tab(…) }` (+ `Tab(role:.search)`) | Floating Liquid Glass; iPhone vs iPad; search-tab states. |
| `Toolbars/{Bottom (44pt)\|Bottom (48pt)\|…}/{L}/{Left and Right\|Left, Center and Right\|…}` | Toolbar / bottom bar | `.toolbar { ToolbarItem(placement:) }`, `ToolbarSpacer` | 44/48pt bottom bars; item arrangement; glass groups. |
| `Sidebar/{L}/{Header\|Items/Level 0–2\|Toolbar/…}` | Sidebar | `NavigationSplitView` sidebar; `.listStyle(.sidebar)` | Header, nested item levels, floating/fullscreen toolbar. |
| `Lists/{L}/{Grouped Table View\|Rows/{Default\|Large\|…}\|Buttons/{Default\|Destructive\|Disabled}}` | List / table view | `List` + `.listStyle(.insetGrouped/.grouped/.plain)` + `Section` | Grouped table, row variants, in-list buttons. |
| `Text Fields/{L}/{Default\|Placeholder\|Typing\|Empty Typing}` | Text field | `TextField` + `.textFieldStyle(…)` | Placeholder vs focused/typing states. |
| `Toggles/{L}/{On\|Off}/{1 - Idle\|3 - Pressed\|4 - Disabled}` | Toggle (switch) | `Toggle` + `.toggleStyle(.switch)` | On/Off × state. |
| `Sliders/{L}/{Glyphs\|…}/{Min\|Mid\|Max} - {state}` | Slider | `Slider` | Value position × enabled/disabled × optional min/max glyphs. |
| `Stepper/{L}` | Stepper | `Stepper` | − / + segments. |
| `Segmented Controls/{L}/{Large\|Small}/{1 - Enabled\|4 - Disabled}` | Segmented control | `Picker` + `.pickerStyle(.segmented)` | Size × state. |
| `Date and Time Pickers/{Compact Picker\|…}/{L}/{Date\|Time\|Date and Time}` | Date picker | `DatePicker` + `.datePickerStyle(.compact/.graphical/.wheel)` | Compact/graphical/wheel × mode. |
| `Color Pickers/{L}/{iPhone\|iPad}` | Color well | `ColorPicker` | Device. |
| `Sheets/{L}/{iPad\|iPhone/{Large Detent\|Medium Detent\|Inspector}}` | Sheet | `.sheet` + `.presentationDetents([.medium,.large])` | Detent × device; inspector (iPad). |
| `Alerts/{L}/{Default\|Buttons Stacked\|Input Field x1\|Input Field x2\|Overlay}` | Alert | `.alert` | Button layout; text-field alerts; dim overlay. |
| `Action Sheets/{L}` | Action sheet | `.confirmationDialog` | — |
| `Popovers (iPad Only)/…` | Popover | `.popover` | iPad-only anchored popovers. |
| `Menus/{L}/{iPhone\|iPad\|iPad with Shortcuts\|Content View\|Overlay}` | Menu / context menu | `Menu`, `.contextMenu` | Device; with shortcuts; overlay. |
| `Edit Menu/…` | Edit menu | (system; UIKit `UIEditMenuInteraction`) | Selection callout. |
| `Activity View/…` | Activity view (share) | `ShareLink` / share sheet | — |
| `Page Control/{L}/{Background\|…}/{N Dots}` | Page control | `TabView` + `.tabViewStyle(.page)` | 2–10 dots; background variants. |
| `Progress Indicators/{L}/{Indeterminate Spinner - Large\|Regular\|Small\|…\|Table View Row}` | Progress / activity | `ProgressView` + `.progressViewStyle(.circular/.linear)` | Spinner sizes; with label; in-row. |
| `Status Bars/{iPhone\|iPad}/…` | Status bar | system-managed | Device × background × windowed/fullscreen. |
| `Home Indicators/…` | Home indicator | (safe area) | — |
| `Keyboard/…` (32) | Virtual keyboard | `.keyboardType`, `.toolbar(.keyboard)` | Keyboard variants. |
| `Scroll Edge Effect/…` (3) | (Liquid Glass bar edge) | `.scrollEdgeEffectStyle(_:for:)` | Blur transition at bar/content boundary. |
| `System/{Control Center\|Home Screen\|Home Screen Quick Actions\|Lock Screen Widgets\|Notifications}` | System experiences | WidgetKit / ControlWidget / ActivityKit / UNUserNotification | Out-of-app surfaces (see `mapping.md`). |
| `App Icons/…` (137) | App icon | (asset) | Icon templates / sizes. |
| `Examples/…` (58) | Full-screen examples | — | Reference full screens — study, don't ship. |
| `Windows/…`, `Menu Bar (iPad)/…`, `Wallpapers/…`, `FaceID/…` | (iPad/system chrome) | — | Situational. |

## Text styles → Dynamic Type → SwiftUI

105 styles. Core scale (each also has `2 Bold` / `3 Italic` / `4 Bold Italic`, plus a `Loose Leading/…` mirror):

| Text style (apply this) | Dynamic Type | SwiftUI |
|---|---|---|
| `01 LargeTitle/1 Default` | Large Title | `.font(.largeTitle)` |
| `02 Title1/1 Default` | Title 1 | `.font(.title)` |
| `03 Title2/1 Default` | Title 2 | `.font(.title2)` |
| `04 Title3/1 Default` | Title 3 | `.font(.title3)` |
| `05 Headline/1 Default` | Headline | `.font(.headline)` |
| `06 Body/1 Default` | Body | `.font(.body)` |
| `07 Callout/1 Default` | Callout | `.font(.callout)` |
| `08 Subheadline/1 Default` | Subheadline | `.font(.subheadline)` |
| `09 Footnote/1 Default` | Footnote | `.font(.footnote)` |
| `10 Caption1/1 Default` | Caption 1 | `.font(.caption)` |
| `11 Caption2/1 Default` | Caption 2 | `.font(.caption2)` |

Use `2 Bold` for emphasis (`.bold()`); use `Loose Leading/…` for the loose-leading variants. Numbers/sizes in `metrics.md`.

## Layer styles → SwiftUI

42 layer styles. The two that matter most:

| Layer style (apply this) | Use | SwiftUI |
|---|---|---|
| `Liquid Glass/{Dark\|Light}/Regular - {Large\|Medium\|Small}` | Liquid Glass on a custom chrome element | `.glassEffect(.regular, in:)` |
| `Liquid Glass/{Dark\|Light}/Regular - Small - Tinted` | Tinted (emphasis) glass | `.glassEffect(Glass.regular.tint(…))` |
| `Liquid Glass/Clear` | Clear variant over media | `.glassEffect(.clear, in:)` |
| `Liquid Glass/Widget Glass`, `…/Lock Screen Time`, `…/{Dark\|Light}/{Dock\|App Library\|Keyboard Background\|Regular - Small - Inactive}` | System glass surfaces | (system) |
| `Controls/{Dark\|Light}/Knobs - Toggle/…`, `Controls/…/Tracks/{Active, Filled\|Active, Unfilled}, {state}` | Custom toggle/slider knob+track | (compose; prefer the Toggle/Slider symbols) |

See `liquid-glass.md` for the glass rules.

## Color swatches → semantic colors → SwiftUI

107 swatches, organized by role. Apply the swatch, never a raw hex.

| Swatch group (path) | Role | SwiftUI |
|---|---|---|
| `Labels/{Dark\|Light}/{1 Primary…5 Quinary}` (+ `Labels - Vibrant`, `Labels - Liquid Glass`) | Text/foreground | `Color.primary` / `Color(.label)`, `.secondaryLabel`, `.tertiaryLabel`, `.quaternaryLabel` |
| `Backgrounds/{Dark - Base\|Dark - Elevated\|Light}/{Primary\|Secondary\|Tertiary}` | Base backgrounds | `Color(.systemBackground)`, `.secondarySystemBackground`, `.tertiarySystemBackground` |
| `Backgrounds Grouped/{…}/{Primary\|Secondary\|Tertiary}` | Grouped (Form/List) backgrounds | `Color(.systemGroupedBackground)`, `.secondarySystemGroupedBackground`, `.tertiary…` |
| `Fills/{Dark\|Light}(- Vibrant)/{1 Primary…5 Quinary}` | Fills behind controls | `Color(.systemFill)`, `.secondarySystemFill`, `.tertiary…`, `.quaternary…` |
| `Separators/{Dark\|Light}/{Non-Opaque\|Opaque\|Vibrant}` | Hairlines | `Color(.separator)`, `Color(.opaqueSeparator)` |
| `System Colors/{Dark\|Light}/{1 Red…N}` | Accent/status palette | `Color.red/.orange/.yellow/.green/.mint/.teal/.cyan/.blue/…` or `Color(.systemRed)` etc. |
| `Grays/{Dark\|Light}/{Gray…Gray 6}` | Gray ramp | `Color(.systemGray)` … `Color(.systemGray6)` |

`Dark - Elevated` backgrounds = the elevated surface set (sheets/popovers over a dark base). Use the `- Vibrant` variants for content over materials/Liquid Glass. See `foundations.md`.
