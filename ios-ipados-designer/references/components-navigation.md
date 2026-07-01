# Components — Navigation & Search

Navigation and search components for iOS/iPadOS, each with anatomy, states, Liquid Glass treatment, and the SwiftUI element to reach for. See `metrics.md` for exact point sizes, `liquid-glass.md` for material rules, `patterns.md` for search/navigation flows, `platform-ios-ipados.md` for size-class behavior.

---

## Tab bar

One-liner: Lets people navigate between top-level sections of an app while preserving each section's navigation state.

**iOS/iPadOS applicability**
- iOS: floats at the **bottom**, above content, on a Liquid Glass background that lets content peek through.
- iPadOS: sits **near the top**; can be a fixed bar or convert to a sidebar (see Sidebar).
- macOS: n/a. watchOS: not supported. visionOS: always vertical, fixed to window's leading side.

**Anatomy / variants**
- Icon + label per tab (SF Symbols; prefer **filled** symbols). Compact: icon above label. Regular (iPad): icon beside label.
- **Badge**: red oval, white text, number or `!` — reserve for critical info.
- **Search tab**: dedicated tab at the **trailing end** (iOS 26). Two styles: *standard tab* (opens a search landing page) or *button appearance* (focuses field + shows keyboard immediately).
- **More tab**: trailing tab collapses overflow into a list when tabs don't fit — avoid triggering it.
- **Bottom accessory** (iOS 26): e.g. Music MiniPlayer rests inline above the bar.

**Sizes / states**
- Selected / unselected / badged. Aim for **5 or fewer** default tabs to keep continuity across compact ↔ regular. (Height: see `metrics.md`; ~49 pt compact convention.)

**Do / Don't**
- Do use it for navigation only; use a Toolbar for actions on the current view.
- Do keep the bar visible across sections (exception: a modal may cover it).
- Don't disable or hide tab buttons when their content is empty — explain the empty state instead.

**Liquid Glass**
- Rests on Liquid Glass; content scrolls beneath. **Tab bar minimize on scroll**: with an attached accessory, the bar can minimize and move the accessory inline as the user scrolls down; tapping a tab or scrolling to top restores it.
- Prefer monochromatic tab labels; if content is colorful, pick an accent with enough contrast (see `liquid-glass.md`).

**SwiftUI**
```swift
TabView(selection: $tab) {
    Tab("Home", systemImage: "house", value: .home) { HomeView() }
    Tab("Library", systemImage: "square.stack", value: .library) { LibraryView() }
        .badge(2)
    Tab(value: .search, role: .search) { SearchView() }   // trailing search tab
}
.tabBarMinimizeBehavior(.onScrollDown)          // minimize on scroll (TabBarMinimizeBehavior)
.tabViewBottomAccessory { MiniPlayer() }        // inline accessory (TabViewBottomAccessoryPlacement)
```
- `TabView` + `Tab` (iOS 18+ `Tab`; `role: .search` for the search tab).
- `.badge(_:)` per `Tab`.
- Overflow "More" tab is system-managed — don't build it manually.

---

## Tab view style (adaptable / sidebar / page)

One-liner: The `.tabViewStyle` chosen decides whether a `TabView` renders as a bottom/top tab bar, a convertible sidebar, or a swipeable page deck.

**Variants (iOS/iPadOS)**
| Style | Result | Use |
| --- | --- | --- |
| `.sidebarAdaptable` | Tab bar ↔ sidebar with a toggle button; adapts to width/rotation | Complex apps; secondary hierarchy via `TabSection` |
| `.tabBarOnly` | Fixed tab bar, no sidebar conversion | Simpler iPad apps |
| `.page` (`PageTabViewStyle`) | Full-screen swipeable pages + page dots | Onboarding, photo/city carousels |
| `DefaultTabViewStyle` (`.automatic`) | System default per platform | Standard bottom/top bar |

**Do / Don't**
- Do prefer a tab bar first on iPad; offer the sidebar conversion only when you have more sections than a bar holds.
- Do give secondary tabs a `TabSection`; on compact they flow into the bar (header hidden).
- Don't exceed ~5 primary tabs if you want compact/regular parity.

**Liquid Glass**: `.sidebarAdaptable` sidebar and bar both float in the glass layer; extend content beneath with `.backgroundExtensionEffect()`.

**SwiftUI**
```swift
TabView { … TabSection("Library") { Tab(…) } … }
    .tabViewStyle(.sidebarAdaptable)
    .tabViewCustomization($customization)   // TabViewCustomization + .customizationID(_:) per Tab
```
- Customization (drag tab↔sidebar, hide, reorder) persists via `@AppStorage`/`@SceneStorage`.

> Note: **Tab views** in the macOS/NSTabView sense (mutually exclusive panes with a top tabbed control) are **not supported on iOS/iPadOS** — use a **segmented control** (`Picker(.segmented)`) instead. See `components-controls.md`.

---

## Sidebar (iPad)

One-liner: Leading-side list for navigating app areas or top-level collections (folders, playlists).

**iOS/iPadOS applicability**: needs generous width — regular size class only. Two routes:
1. Convertible sidebar via `.sidebarAdaptable` `TabView` (toggle to/from tab bar).
2. Persistent sidebar via `NavigationSplitView` (sidebar has no tab-bar toggle).

**Anatomy / variants**
- Rows: SF Symbol + label; group with **disclosure controls** and `Section` headers.
- Show **no more than two levels** of hierarchy; deeper → add a content column (three-column split).
- Sidebar icons default to the app accent color; use fixed colors only when they clarify meaning (e.g. VIP).

**Do / Don't**
- Do let people customize/reorder sidebar items and hide the sidebar (iPad edge-swipe).
- Do keep the sidebar discoverable — don't hide it by default.
- Don't put critical actions at the very bottom.

**Liquid Glass**: sidebar floats in the glass layer; reinforce separation by letting content scroll under it or applying a **background extension effect** (`.backgroundExtensionEffect()`) that mirrors adjacent content beneath the sidebar.

**SwiftUI**
```swift
NavigationSplitView {
    List(sections, selection: $selection) { Label($0.name, systemImage: $0.icon) }
        .listStyle(.sidebar)
} detail: { DetailView(selection) }
```
- `List(selection:)` + `.listStyle(.sidebar)`; or `TabView { … }.tabViewStyle(.sidebarAdaptable)`.
- `NavigationSplitView` auto-adds a `sidebarToggle` toolbar item — remove with `.toolbar(removing: .sidebarToggle)`.

---

## Split view

One-liner: Manages two or three adjacent panes so a selection in a leading pane drives content in the next.

**iOS/iPadOS applicability**
- iPad: two panes (Mail) or three panes (Keynote). iPhone/compact: collapses into a single stack showing the deepest useful column.
- iOS: prefer split views only in a **regular** environment; compact wraps/truncates.

**Anatomy / variants**
- Two-column: sidebar → detail. Three-column: sidebar → content → detail.
- Column visibility is programmatic (`NavigationSplitViewVisibility`: `.all`, `.detailOnly`, …).

**Do / Don't**
- Do persistently highlight the current selection in every pane that leads to detail.
- Do account for narrow / compact / intermediate iPad window widths (resizable windows) so navigation stays logical.
- Don't rely on a split view in compact width — let it collapse to a stack.

**Liquid Glass**: panes/sidebar float in the glass layer; extend content with `.backgroundExtensionEffect()`.

**SwiftUI**
```swift
NavigationSplitView(columnVisibility: $visibility) {
    Sidebar()
} content: {                 // omit for two-column
    ContentList()
} detail: {
    Detail()
}
.navigationSplitViewStyle(.balanced)   // or .prominentDetail
```
- Embed a `NavigationStack` inside a column for push navigation.
- Column width: `.navigationSplitViewColumnWidth(min:ideal:max:)`.
- `preferredCompactColumn:` binding chooses which column shows when collapsed.

---

## Toolbar (top / bottom / navigation bar)

One-liner: Horizontal set(s) of controls along the top or bottom edge for commands, navigation, and search acting on the current view.

**iOS/iPadOS applicability**
- iOS top toolbar = **navigation bar** (title + Back + a few actions). Bottom toolbar for reachable actions/search.
- iPadOS: top toolbar can **coexist with a tab bar** in the same top strip; center-area items auto-collapse to an overflow menu as the window narrows.

**Content types**: current view title · navigation controls (Back/Close, search) · actions (buttons, menus).

**Item groupings & placements**
| Region | Holds | Customizable? |
| --- | --- | --- |
| Leading | Back, sidebar toggle, title, document menu | No (always available) |
| Center | Common controls; title if not leading | Yes (iPad/macOS); overflows to system menu |
| Trailing | Persistent key items, inspector toggles, search, **More** menu, primary action (Done) | Stays visible at all widths |

**Sizes / states**
- Title < **15 characters**. Large title (iOS) transitions to standard title on scroll and back at top.
- Primary action uses `.prominent` (tinted, separated) — only **one**, on the trailing side.
- Aim for a **max of 3** logical groups.

**Do / Don't**
- Do prefer system SF Symbols without borders; the bar section already provides the container.
- Do insert fixed space between two text-labeled buttons so they don't read as one.
- Don't add a manual overflow menu — the system adds one when items don't fit. Don't apply custom bar backgrounds/tints that fight the system glass.

**Liquid Glass**
- Reduce custom backgrounds/tinted controls; let the content layer drive color. Use a **scroll edge effect** (`ScrollEdgeEffectStyle`) to separate the bar area from scrolling content instead of a hard background.
- Standard components get corner radii concentric with the bar; match that for custom controls.

**SwiftUI**
```swift
.navigationTitle("Inbox")
.navigationBarTitleDisplayMode(.large)      // .large | .inline | .automatic
.toolbar {
    ToolbarItem(placement: .topBarLeading) { EditButton() }
    ToolbarItemGroup(placement: .topBarTrailing) {
        Button("Filter", systemImage: "line.3.horizontal.decrease") { }
        Button("Done") { }.buttonStyle(.borderedProminent)   // .prominent-style primary action
    }
    ToolbarItemGroup(placement: .bottomBar) { … }
}
.toolbar(.hidden, for: .navigationBar)      // temporary distraction-free hide
```
- Placements: `.topBarLeading`, `.topBarTrailing`, `.bottomBar`, `.principal` (title/center), `.primaryAction`, `.navigation`, `.confirmationAction`.
- `.toolbar { ToolbarItem(placement:) }` / `ToolbarItemGroup` — see `swiftui-catalog.md`.

---

## Search field / `.searchable`

One-liner: Editable field (Search icon, Clear button, placeholder) that filters a collection; can pair with scope bars and tokens.

**iOS placement (choose per layout)**
| Placement | Behavior |
| --- | --- |
| **Search tab** | Always-available tab; *standard* (landing page) or *button* (instant keyboard). |
| **Bottom toolbar** | Field or button; animates to a field above the keyboard. Prefer bottom when there's room. |
| **Top toolbar / nav bar** | Button that expands to a field; use when deferring to bottom content. |
| **Inline** | Field next to the content it filters (e.g. Music library). |

**iPadOS**: trailing side of the toolbar for split-view/multi-column search; top of the sidebar to filter navigation; or a dedicated tab/sidebar item for discovery. Field resizes fluidly with the window.

**Scope bars & tokens**
- **Scope bar**: filter across defined categories (default broad → let people narrow).
- **Token**: selectable/editable chip representing a search term/filter; pair with suggestions so people discover them.

**Do / Don't**
- Do start searching as the user types and show recent/suggested terms.
- Do focus the field automatically in a dedicated search area (exception: iPad with only a virtual keyboard — leave unfocused).
- Don't hide search where its scope is ambiguous; place inline search directly above the list it filters.

**Liquid Glass**: search in a bar rides the same glass treatment as its toolbar/tab bar; the trailing iPad search tab can take a distinct background to set it apart.

**SwiftUI**
```swift
.searchable(text: $query, placement: .automatic, prompt: "Search")
.searchScopes($scope) { Text("All").tag(Scope.all); Text("Mine").tag(Scope.mine) }
.searchSuggestions { … }
```
- `.searchable(text:placement:prompt:)`; placements `.automatic`, `.toolbar`, `.sidebar`, `.navigationBarDrawer`.
- Token search: `.searchable(text:tokens:token:)`.
- Search tab: `Tab(role: .search)` inside `TabView` (see Tab bar). See `swiftui-catalog.md` → Search.

---

## Page control

One-liner: Row of indicator dots representing pages in a flat, ordered list; a solid dot marks the current page.

**iOS/iPadOS applicability**: yes (not macOS). visionOS shows but is non-interactive.

**Anatomy / variants**
- Equidistant dots; edge dots shrink when more pages exist than fit. Current dot filled.
- Custom indicator image allowed (e.g. `location.fill` for current location) — **max two** distinct images; don't color them.
- Background styles: **automatic** (shows on interaction), **prominent** (always), **minimal** (never).

**States / limits**
- Interactions: tap (discrete) leading/trailing of current dot → prev/next; scrub (continuous) to move through pages; iPad pointer targets a dot.
- Keep to **≤ ~10** dots; more → use a grid or other arrangement.

**Do / Don't**
- Do center it horizontally near the bottom of the view.
- Don't animate transitions during scrubbing (causes lag/flashes) — animate only on tap.
- Don't support the scrubber with the minimal style (no feedback).

**Liquid Glass**: the rounded translucent background (automatic/prominent) provides contrast for dots.

**SwiftUI**
```swift
TabView { ForEach(pages) { PageView($0) } }
    .tabViewStyle(.page)                          // PageTabViewStyle
    .indexViewStyle(.page(backgroundDisplayMode: .automatic))
```
- `.tabViewStyle(.page)` renders the dots; `.indexViewStyle(.page(backgroundDisplayMode:))` controls the background. (UIKit: `UIPageControl.backgroundStyle`.)

---

## Not on iOS/iPadOS (design-time awareness)

| Component | Status | iOS/iPadOS substitute |
| --- | --- | --- |
| **Path control** | macOS only (`NSPathControl`); window body, not toolbar | Breadcrumb via nav-stack titles / custom (convention) |
| **Token field** | macOS only (`NSTokenField`) | Search **tokens** via `.searchable(text:tokens:token:)`; token-like chips custom-built |
| **Tab view** (NSTabView panes) | macOS/AppKit | Segmented `Picker(.segmented)` (see `components-controls.md`) |

Don't place these on an iOS/iPadOS Sketch canvas; reach for the substitute instead.
