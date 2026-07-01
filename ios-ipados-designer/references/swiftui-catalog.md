# SwiftUI Catalog

Authoritative "think in SwiftUI" element list — real API names, minimal signatures, concrete style values, and iOS 26 Liquid Glass APIs — that `mapping.md` relies on for correct symbol names.

Rules for readers: every type/modifier/style below is copied from Apple's SwiftUI reference. Do **not** invent names. Items marked **(convention)** are common usage not verified in-source. Platform notes call out **iOS 26** (Liquid Glass) and **iOS 27** additions. HIG realizations cross-ref `mapping.md`, `components-*.md`; sizes/spacing live in `metrics.md`; glass depth in `liquid-glass.md`.

Availability shorthand = first iOS version. All types are iOS/iPadOS unless noted.

---

## Text & images

| Type | Purpose | Minimal signature | iOS | HIG |
|---|---|---|---|---|
| `Text` | Read-only text, one+ lines. | `Text("Hello")` / `Text(date, style: .relative)` | 13 | Labels / typography → `foundations.md` |
| `Label` | Icon + title pair; adapts per container. | `Label("Sign In", systemImage: "arrow.up")` | 14 | Labels |
| `Image` | Displays image or SF Symbol. | `Image(systemName: "star.fill")` / `Image("photo").resizable()` | 13 | Images / SF Symbols |
| `AsyncImage` | Async-loads + displays a remote image. | `AsyncImage(url: url) { $0.resizable() } placeholder: { ProgressView() }` | 15 | Images |
| `Link` | Navigates to a URL (opens externally). | `Link("Apple", destination: url)` | 14 | Links |
| `ShareLink` | Presents the share sheet. | `ShareLink(item: url)` | 16 | Activity views / share |

Snippet — prefer title+icon initializers so labels adapt in toolbars/menus:
```swift
Button("Sign In", systemImage: "arrow.up", action: signIn)
    .labelStyle(.iconOnly) // still exposes title to VoiceOver
```
Don't ship image-only controls without an accessibility label.

---

## Controls & indicators

| Type | Purpose | Minimal signature | iOS | HIG |
|---|---|---|---|---|
| `Button` | Initiates an action. | `Button("Save", action: save)` | 13 | Buttons → `components-controls.md` |
| `EditButton` | Toggles `editMode` for a List. | `EditButton()` | 13 (no watchOS) | Edit / Done |
| `Toggle` | On/off switch. | `Toggle("Wi‑Fi", isOn: $on)` | 13 | Toggles / switches |
| `Stepper` | Increment / decrement. | `Stepper("Qty", value: $n, in: 0...10)` | 13 | Steppers |
| `Slider` | Pick from a bounded linear range. | `Slider(value: $v, in: 0...1)` | 13 | Sliders |
| `Gauge` | Show a value within a range. | `Gauge(value: v) { Text("Speed") }` | 16 | Gauges |
| `ProgressView` | Determinate/indeterminate progress. | `ProgressView(value: p)` / `ProgressView()` | 14 | Progress indicators |
| `Menu` | Presents a menu of actions/pickers. | `Menu("Options") { Button("Rename"){} }` | 14 (no watchOS) | Pull-down menus |
| `ControlGroup` | Groups related controls into one visual unit. | `ControlGroup { Button…; Button… }` | 15 (no watchOS) | Segmented / grouped controls |

Roles & tint:
- `Button("Delete", role: .destructive, action: delete)` — role drives system styling (destructive → red). `.cancel` role for cancels **(convention)**.
- `.tint(_:)` colors a control; `.controlSize(_:)` scales it: `.mini · .small · .regular · .large · .extraLarge` (`ControlSize`).
- **iOS 26** `buttonSizing(_:)` modifier + `ButtonSizing` set the preferred sizing behavior of buttons/button-like controls.

---

## Value selection

| Type | Purpose | Minimal signature | iOS | HIG |
|---|---|---|---|---|
| `Picker` | Choose one of mutually exclusive values. | `Picker("Color", selection: $c) { ForEach(...) { Text($0).tag($0) } }` | 13 | Pickers / segmented |
| `DatePicker` | Pick an absolute date/time. | `DatePicker("Date", selection: $d, displayedComponents: .date)` | 13 | Date pickers |
| `ColorPicker` | Pick a color via system UI. | `ColorPicker("Ink", selection: $color)` | 14 (no watchOS) | Color wells |

---

## Text input

| Type | Purpose | Minimal signature | iOS | HIG |
|---|---|---|---|---|
| `TextField` | Single-line editable text. | `TextField("Email", text: $email)` | 13 | Text fields → `inputs.md` |
| `SecureField` | Masked private text entry. | `SecureField("Password", text: $pw)` | 13 | Secure text fields |
| `TextEditor` | Multi-line long-form editing. | `TextEditor(text: $notes)` | 14 (no watchOS) | Text views |

Common modifiers: `.keyboardType(_:)`, `.textInputAutocapitalization(_:)`, `.submitLabel(_:)`, `.focused($field, equals:)`, `.textContentType(_:)`. See `inputs.md`.

---

## Collections · Lists · Tables

| Type | Purpose | Minimal signature | iOS | HIG |
|---|---|---|---|---|
| `List` | Single-column rows, optional selection/edit. | `List(items) { Text($0.name) }` / `List(selection: $sel){…}` | 13 | Lists / tables → `components-content.md` |
| `Table` | Multi-column rows (iPad/Mac). | `Table(people) { TableColumn("Name", value: \.name) }` | 16 (no watchOS/tvOS) | Tables (iPad) |
| `Form` | Grouped data-entry container (Settings-style). | `Form { Section("Account"){ … } }` | 13 | Forms / grouped lists |
| `Section` | Adds hierarchy w/ header & footer. | `Section("Header"){ … } footer: { Text("…") }` | 13 | List sections |
| `OutlineGroup` | Tree of disclosure rows from hierarchical data. | `OutlineGroup(root, children: \.children){ Text($0.name) }` | 14 (no watchOS) | Outline / source lists |
| `ForEach` | Generates views per element (row/grid builder). | `ForEach(items) { row($0) }` | 13 | — |

List row modifiers: `.swipeActions(edge:){ … }`, `.listRowSeparator(_:)`, `.listRowInsets(_:)`, `.onDelete/.onMove`, `.refreshable{ … }`, `.searchable(...)`. **iOS 26** lists/forms/sidebars pick up Liquid Glass and the scroll-edge effect automatically — don't hand-draw bar backgrounds.

---

## Layout containers & stacks

| Type | Purpose | Minimal signature | iOS | HIG |
|---|---|---|---|---|
| `VStack` / `HStack` / `ZStack` | Stack subviews vertically / horizontally / depth. | `VStack(alignment: .leading, spacing: 8){ … }` | 13 | Layout → `metrics.md` |
| `LazyVStack` / `LazyHStack` | Lazy stacks inside a `ScrollView`. | `LazyVStack{ ForEach(...) }` | 14 | Long scrolling content |
| `Grid` | Eager 2‑D row/column layout. | `Grid { GridRow { … } }` | 16 | Grids |
| `LazyVGrid` / `LazyHGrid` | Lazy grid w/ `GridItem` columns. | `LazyVGrid(columns: [GridItem(.adaptive(minimum: 100))]){ … }` | 14 | Collections / grids |
| `ScrollView` | Scrollable region. | `ScrollView { … }` / `ScrollView(.horizontal){…}` | 13 | Scroll views |
| `ViewThatFits` | First child that fits available space. | `ViewThatFits { WideView(); NarrowView() }` | 16 | Adaptive layout |
| `Spacer` | Flexible gap along stack axis. | `Spacer()` / `Spacer(minLength: 8)` | 13 | Spacing |
| `Divider` | Thin separator line. | `Divider()` | 13 | Separators |

Scroll modifiers worth knowing: `.scrollTargetBehavior(.paging / .viewAligned)`, `.scrollPosition(id:)`, `.scrollClipDisabled()`, `.contentMargins(_:)`.

---

## Grouping

| Type | Purpose | Minimal signature | iOS | HIG |
|---|---|---|---|---|
| `Group` | Transparent grouping (no layout of its own). | `Group { … }` | 13 | — |
| `GroupBox` | Titled, visually-bounded group. | `GroupBox("Details"){ … }` | 14 (no watchOS) | Boxes / grouped content |
| `DisclosureGroup` | Show/hide content via a disclosure control. | `DisclosureGroup("More"){ … }` | 14 (no watchOS) | Disclosure triangles |
| `ControlGroup` | See Controls above. | — | 15 | — |

---

## Navigation

| Type | Purpose | Minimal signature | iOS | HIG |
|---|---|---|---|---|
| `NavigationStack` | Root + push/pop stack (replaces `NavigationView`). | `NavigationStack(path: $path){ Root() }` | 16 | Navigation → `components-navigation.md` |
| `NavigationSplitView` | 2–3 column split (iPad/Mac primary). | `NavigationSplitView { Sidebar() } detail: { Detail() }` | 16 | Split views (iPad) |
| `NavigationLink` | Pushes a destination in a stack. | `NavigationLink("Detail", value: item)` + `.navigationDestination(for:)` | 13 | Disclosure / drill-in |
| `TabView` | Switches between top-level views. | `TabView { Tab("Home", systemImage:"house"){…} }` | 13 | Tab bars |
| `Tab` | One tab's content + tab item. | `Tab("Search", systemImage: "magnifyingglass"){ … }` | 18 | Tab bar item |

Navigation modifiers: `.navigationTitle(_:)`, **iOS 26** `.navigationSubtitle(_:)`, `.navigationBarTitleDisplayMode(.inline/.large)`, `.navigationDestination(for:destination:)`.

**iOS 26 / Liquid Glass navigation:**
- Tab bar floats as glass and **minimizes on scroll** — `TabView { … }.tabBarMinimizeBehavior(_:)` (`TabBarMinimizeBehavior`).
- Bottom accessory above the tab bar: `.tabViewBottomAccessory { … }` reads `TabViewBottomAccessoryPlacement` to adapt content.
- iPad/large sidebar-or-tab adaptivity: `TabView { … }.tabViewStyle(.sidebarAdaptable)` (iOS 18) with `AdaptableTabBarPlacement`.

---

## Presentation & modality

| Modifier / type | Purpose | Minimal signature | iOS |
|---|---|---|---|
| `.sheet(isPresented:content:)` | Resizable modal card. | `.sheet(isPresented: $show){ EditView() }` | 13 |
| `.fullScreenCover(isPresented:content:)` | Full-screen modal. | `.fullScreenCover(isPresented: $show){ … }` | 14 |
| `.popover(isPresented:content:)` | Popover (iPad = bubble, iPhone = sheet). | `.popover(isPresented: $show){ … }` | 13 |
| `.alert(_:isPresented:actions:message:)` | Alert w/ button views. | `.alert("Delete?", isPresented: $show){ Button("Delete", role:.destructive){} }` | 15 (error/data overloads **iOS 27**) |
| `.confirmationDialog(_:isPresented:actions:)` | Action-sheet style choices. | `.confirmationDialog("Options", isPresented: $show){ … }` | 15 |
| `PresentationDetent` | Sheet rest heights. | `.presentationDetents([.medium, .large])` | 16 |

Sheet tuning: `.presentationDetents([.fraction(0.3), .height(200), .large])`, `.presentationDragIndicator(.visible)`, `.presentationBackground(_:)` (16.4), `.presentationBackgroundInteraction(_:)` (16.4), `.presentationCornerRadius(_:)`. `PresentationDetent` values: `.medium · .large · .fraction(_:) · .height(_:) · .custom(_:)`. Sheets render on Liquid Glass by default in iOS 26 — see `liquid-glass.md`. Legacy `Alert` / `ActionSheet` value types exist but the modifier forms above are current.

---

## Toolbars & search

| Type / modifier | Purpose | Minimal signature | iOS |
|---|---|---|---|
| `.toolbar { … }` | Adds bar/nav items. | `.toolbar { ToolbarItem(placement:.topBarTrailing){ Button… } }` | 14 |
| `ToolbarItem` | One placed toolbar item. | `ToolbarItem(placement: .primaryAction){ … }` | 14 |
| `ToolbarItemGroup` | Multiple items sharing a placement. | `ToolbarItemGroup(placement:.bottomBar){ … }` | 14 |
| `ToolbarSpacer` | **iOS 26** fixed space that splits toolbar items into separate glass groups. | `ToolbarSpacer(.flexible, placement: .bottomBar)` | 26 |
| `DefaultToolbarItem` | **iOS 26** references a system-provided toolbar component. | `DefaultToolbarItem(kind:, placement:)` | 26 |
| `.searchable(text:)` | Adds a search field bound to state. | `.searchable(text: $query, prompt: "Search")` | 15 |
| `SearchToolbarBehavior` | **iOS 26** how the search field sits in the toolbar. | `.searchToolbarBehavior(.minimize)`; also `.searchPresentationToolbarBehavior(_:)` | 26 |

Placements: `.topBarLeading · .topBarTrailing · .principal · .bottomBar · .primaryAction · .confirmationAction · .cancellationAction · .automatic`. Search extras: token overloads `.searchable(text:tokens:...)` (16), scopes `.searchScopes(_:scopes:)`, suggestions `.searchSuggestions{ … }`, programmatic `isPresented:` (17). **iOS 26** toolbars group into Liquid Glass capsules; use `ToolbarSpacer` to separate logical groups rather than manual padding.

---

## Styles (concrete values)

Apply with the matching `.xStyle(_:)` modifier. Values below are exact `static` members present in the reference; platform-restricted ones are tagged.

**`ButtonStyle` / `PrimitiveButtonStyle`** → `.buttonStyle(_:)`
`.automatic · .bordered · .borderedProminent · .borderless · .plain · .glass` **(iOS 26)** `· .glassProminent` **(iOS 26)**. Other-platform: `.card` (tvOS) `· .accessoryBar · .accessoryBarAction · .link` (macOS). Concrete structs: `GlassButtonStyle`, `GlassProminentButtonStyle` (iOS 26).

**`ToggleStyle`** → `.toggleStyle(_:)`
`.automatic · .switch · .button`; `.checkbox` (macOS).

**`PickerStyle`** → `.pickerStyle(_:)`
`.automatic · .inline · .menu · .segmented · .wheel · .navigationLink · .palette · .tabs` **(iOS 27, `TabsPickerStyle`)**; `.radioGroup` (macOS).

**`DatePickerStyle`** → `.datePickerStyle(_:)`
`.automatic · .compact · .wheel · .graphical`; `.field · .stepperField` (macOS).

**`ListStyle`** → `.listStyle(_:)`
`.automatic · .plain · .inset · .insetGrouped · .grouped · .sidebar`; `.bordered` (macOS) `· .carousel/.elliptical` (watchOS).

**`FormStyle`** → `.formStyle(_:)`
`.automatic · .grouped · .columns`.

**`LabelStyle`** → `.labelStyle(_:)`
`.automatic · .titleAndIcon · .titleOnly · .iconOnly`.

**`MenuStyle`** → `.menuStyle(_:)`
`.automatic · .button`; `.borderlessButton · .borderedButton` (macOS).

**`ControlGroupStyle`** → `.controlGroupStyle(_:)`
`.automatic · .navigation · .menu · .palette · .compactMenu`.

**`GaugeStyle`** → `.gaugeStyle(_:)`
`.automatic · .accessoryCircular · .accessoryCircularCapacity · .accessoryLinear · .accessoryLinearCapacity · .linearCapacity`; `.linear · .circular` (watchOS).

**`ProgressViewStyle`** → `.progressViewStyle(_:)`
`.automatic · .linear · .circular`.

**`TextFieldStyle`** → `.textFieldStyle(_:)`
`.automatic · .plain · .roundedBorder`; `.bordered` **(iOS 27, `BorderedTextFieldStyle`)**; `.squareBorder` (macOS).

**`TextEditorStyle`** → `.textEditorStyle(_:)`
`.automatic · .plain · .roundedBorder`.

**`TabViewStyle`** → `.tabViewStyle(_:)`
`.automatic · .page · .sidebarAdaptable · .tabBarOnly`; `.grouped` (macOS 15, `GroupedTabViewStyle`) `· .verticalPage · .carousel` (watchOS). `.page(indexDisplayMode:)` for paged dots.

**`NavigationSplitViewStyle`** → `.navigationSplitViewStyle(_:)`
`.automatic · .balanced · .prominentDetail`.

**`ControlSize`** → `.controlSize(_:)`
`.mini · .small · .regular · .large · .extraLarge`.

---

## Liquid Glass APIs (iOS 26)

The default system look. Bars, sheets, tab bars, and standard controls adopt Liquid Glass automatically — reach for these only for **custom** views. Depth/usage guidance in `liquid-glass.md`.

| API | Purpose | Signature |
|---|---|---|
| `.glassEffect(_:in:)` | Apply Liquid Glass to a custom view. | `Text("Hi").padding().glassEffect()` — default shape is a capsule (`DefaultGlassEffectShape`) |
| `Glass` | Configures the material variant. | `.glassEffect(.regular.tint(.blue).interactive(), in: .rect(cornerRadius: 16))` |
| `Glass` variants | Material flavor. | `.regular` (default) `· .clear` `· .identity` (no effect, for morph endpoints) |
| `Glass` modifiers | Tune the material. | `.tint(_:)` · `.interactive(_:)` |
| `GlassEffectContainer` | Combine/morph multiple glass shapes as one. | `GlassEffectContainer(spacing: 20){ … }` |
| `.glassEffectID(_:in:)` | Identity for morph transitions across a container. | `.glassEffectID(id, in: namespace)` |
| `.glassEffectUnion(id:namespace:)` | Merge shapes into a single glass blob. | `.glassEffectUnion(id: "grp", namespace: ns)` |
| `.glassEffectTransition(_:)` | Transition applied on add/remove. | `.glassEffectTransition(.matchedGeometry)` **(convention value)** |
| `GlassEffectTransition` | Describes those add/remove changes. | type |

Do: let system bars/controls carry glass; group custom glass in a `GlassEffectContainer`; use `.identity` as a morph start/end. Don't: stack glass on glass, or tint glass so heavily it stops reading as a material — see `liquid-glass.md`.

---

## Cross-references
- Point sizes, margins, tap targets, corner radii → `metrics.md`.
- HIG component ↔ SwiftUI type table → `mapping.md` (uses the names above verbatim).
- Color/typography/SF Symbols tokens → `foundations.md`.
- Bar/glass depth & materials rationale → `liquid-glass.md`.
- iPad-specific split/sidebar/pointer decisions → `platform-ios-ipados.md`.
- Sketch component picking → `sketch-playbook.md`.
