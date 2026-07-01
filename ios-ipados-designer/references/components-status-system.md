# Components — Status & System Experiences
Status indicators (progress, gauges, rings, ratings) and system-surface experiences (widgets, Live Activities, notifications, controls, status bars) — design decisions plus the exact SwiftUI element to reach for.

Scope: iOS/iPadOS, Liquid Glass (iOS 26). Cross-refs: `swiftui-catalog.md` (ProgressView/Gauge), `components-content.md` (Charts), `liquid-glass.md` (materials/rendering), `metrics.md` (margins/sizes), `patterns.md` (loading, feedback), `platform-ios-ipados.md`.

---

## Progress indicators

Transient — show only while an operation runs, remove on completion. Two axes: **determinate** (known duration → fills a track) vs **indeterminate** (unknown → animated spinner). Progress **bar** fills leading→trailing; **circular** determinate fills clockwise; **activity indicator / spinner** = indeterminate circular.

| Variant | SwiftUI |
|---|---|
| Indeterminate spinner | `ProgressView()` |
| Determinate bar | `ProgressView(value:total:)` + `.progressViewStyle(.linear)` |
| Determinate ring | `ProgressView(value:)` + `.progressViewStyle(.circular)` (on iOS the circular style may render as an **indeterminate** spinner) |
| Timed / countdown | `ProgressView(timerInterval:)` — auto-updates over a `Date` range |
| Description label | trailing-closure label: `ProgressView(value:) { Text("…") }` |
| Pull-to-refresh | `.refreshable { … }` on `List`/`ScrollView` (UIKit: `UIRefreshControl`) |
| Custom look | conform to `ProgressViewStyle`, apply via `.progressViewStyle(_:)` |

- Availability: `ProgressView` iOS 14+. Built-in styles: `.automatic`, `.linear`, `.circular`.
- Tint via `.tint(_:)`.

**Do**
- Prefer determinate when duration is knowable; switch indeterminate→determinate mid-task once you can estimate.
- Even out pacing so it doesn't jump 90% then stall.
- Keep it moving (a frozen indicator reads as a hung app); keep it in a consistent location.
- Offer Cancel when interruption is safe; add Pause when interrupting loses work; confirm destructive cancels with an alert.

**Don't**
- Switch circular↔bar mid-flow (different shape/size = jarring).
- Use vague labels ("Loading…", "Authenticating…"); label a spinner unnecessarily.

---

## Gauges

Displays one value within a range (fuel-gauge model). Optionally shows range endpoints + a color gradient for context (e.g. temperature red→blue). `Gauge` iOS 16+.

**Styles** (HIG axes: circular / linear × standard / capacity; plus an **accessory** variant for Lock Screen widgets & complication-like contexts):

| Intent | SwiftUI `.gaugeStyle(_:)` |
|---|---|
| Default linear w/ indicator | `.automatic` (default) |
| Circular w/ indicator | `.circular` |
| Circular, tinted/gradient | `CircularGaugeStyle(tint: Gradient(...))` |
| Accessory circular (Lock Screen widget) | `.accessoryCircular` *(convention)* |
| Accessory circular capacity (fill) | `.accessoryCircularCapacity` *(convention)* |
| Accessory linear | `.accessoryLinear` / `.accessoryLinearCapacity` *(convention)* |
| Linear capacity (fill stops at value) | `.linearCapacity` *(convention)* |

```swift
Gauge(value: current, in: 0...170) {
    Text("BPM")
} currentValueLabel: { Text("\(Int(current))") }
  minimumValueLabel: { Text("0") }
  maximumValueLabel: { Text("170") }
.gaugeStyle(.circular)
```

**Do** write succinct labels for value + both endpoints (VoiceOver reads them even when a style hides them visually); use a gradient fill to communicate meaning.
**Standard vs capacity:** *standard* shows an indicator dot at the value; *capacity* fills the path up to the value. For charts-style data, see `components-content.md`.

---

## Activity rings

Move / Exercise / Stand daily progress. iOS uses `HKActivityRingView` (HealthKit UI). With Apple Watch paired → all three rings; without → Move ring only (step/workout approximation).

- **Never** recolor, re-opacity, filter, or repurpose rings; **only** Move/Exercise/Stand data, **single person**, always on a **black** background.
- Keep black visible around the outer ring; round via the enclosing view's corner radius, not a circular mask.
- Min outer margin ≥ inter-ring gap; don't let other UI crop/obstruct.
- Related labels/values use exact RGB: Move `250,17,79` · Exercise `166,255,0` · Stand `0,255,246`.
- Don't decorate, brand, or put rings in your app icon; don't duplicate the Activity app's system notifications.

---

## Rating indicators

Horizontal row of symbols (default stars) showing a ranking. **Not supported on iOS/iPadOS** (macOS `NSLevelIndicator` `.rating` only). On iOS build a custom control (row of `Image(systemName: "star.fill")` toggles).

- Rounds to whole symbols (no partials); equal spacing, symbols never stretch.
- Let people re-rank inline; if replacing the star, make the meaning obvious.
- For collecting App Store ratings/reviews, see `patterns.md`.

---

## Widgets (WidgetKit)

Glanceable, timely content on Home/Lock Screen, Today View, StandBy, CarPlay. Built with SwiftUI; use `ContainerRelativeShape` for concentric corners, `.padding` for margins.

### Families & SwiftUI cases

| HIG size | SwiftUI `WidgetFamily` | iPhone | iPad |
|---|---|---|---|
| System small | `.systemSmall` | ✓ | ✓ |
| System medium | `.systemMedium` | ✓ | ✓ |
| System large | `.systemLarge` | ✓ | ✓ |
| System extra large | `.systemExtraLarge` | — | ✓ |
| Accessory circular | `.accessoryCircular` | Lock Screen | Lock Screen |
| Accessory rectangular | `.accessoryRectangular` | Lock Screen | Lock Screen |
| Accessory inline (single tap target) | `.accessoryInline` | Lock Screen (above clock) | Lock Screen |

Declare via `.supportedFamilies([...])` on the `Widget`. Interactivity: `Button`/`Toggle` backed by `AppIntent` (tapping elsewhere deep-links into the app).

### Rendering modes (iOS 18+ / Liquid Glass)
- `fullColor` — Home Screen, Today View, StandBy, CarPlay (bg removed).
- `accented` — Home Screen/Today View tinted & clear appearances; splits views into accent + primary groups (mark with `.widgetAccentable(_:)`). In the **clear** appearance the system desaturates and applies **Liquid Glass** material + highlights/translucency; in **tinted** it desaturates + applies the user's tint. See `optimizing-your-widget-for-accented-rendering-mode-and-liquid-glass`.
- `vibrant` — Lock Screen (iPhone/iPad) & StandBy low-light; desaturates for background legibility.
- Home Screen user appearances: **light, dark, clear, tinted**.

### Metrics
- Standard margin **16 pt** (tighter groupings **11 pt**); Lock Screen/StandBy use smaller margins.
- Min text **11 pt**; prefer system font + SF Symbols + text styles (never rasterize text — breaks Dynamic Type & VoiceOver). Dynamic Type Large→AX5 supported.
- iPhone canvas (390×844 ref): small 158×158, medium 338×158, large 338×354, circular 72×72, rectangular 160×72, inline 257×26. Full per-device tables in the HIG Specifications; also `metrics.md`.
- iPad renders at a **large canvas then scales down** — design at canvas size (e.g. 1024×1366: small 170, medium 378.5×170, large 378.5², XL 795×378.5).

**Do** pick one best size over all sizes; keep dense layouts glanceable; deep-link to the exact content; use full-color images sparingly (desaturated by default under tinted/clear).
**Don't** mirror the widget's look inside your app; use a widget to relaunch-only (add real value).

Widgets **don't** update in real time → for live data use Live Activities. Always-On (iPhone): render at reduced luminance with enough gray contrast.

---

## Live Activities (ActivityKit)

Track an ongoing, time-bounded task at a glance (best < 8 hr). Start on iPhone/iPad; auto-appears on Lock Screen, Home Screen, **Dynamic Island**, StandBy, plus Mac menu bar / Watch Smart Stack / CarPlay Dashboard. Built with SwiftUI via **ActivityKit**; you must support four presentations.

### Presentations & Dynamic Island regions

| Presentation | When | Notes |
|---|---|---|
| **Compact** | 1 activity, Dynamic Island | two elements: **leading** + **trailing** flanking the camera; design as one unit |
| **Minimal** | multiple activities | one attached + one detached (circular/oval) pill |
| **Expanded** | touch-and-hold | Dynamic Island regions: **leading, trailing, center, bottom** *(convention — ActivityKit `DynamicIsland` builder)* |
| **Lock Screen** | banner at bottom of Lock Screen | layout like Expanded; custom bg color allowed |

- Dynamic Island **corner radius 44 pt**; width by device: 250 (Max/Air/Plus), 230 (Pro/base). Expanded width 408 (Max) / 371 (Pro).
- Lock Screen standard margin **14 pt**. Expanded/Lock Screen heights range 84–160 pt.
- StandBy: minimal presentation; tap → Lock Screen scaled **2×**; Night Mode applies a **red** tint.

**Do** heavier/large text (medium weight+); bold brand colors for text/objects; tint the Dynamic Island **key line** to match content; animate updates (≤ 2 s), preserving shared elements across layout changes; dynamically grow/shrink height with content; limit interactivity to one essential `Button`/`Toggle` (deep-link on tap).
**Don't** set bg color for compact/minimal/expanded (only Lock Screen is customizable); show sensitive data (redact or summarize); replicate a notification layout; use for ads.
End immediately when the task ends; set a custom dismissal (typically 15–30 min). Verify the auto-generated dismiss color via `activitySystemActionForegroundColor(_:)`.

CarPlay: system merges compact leading+trailing into one view and **deactivates interactive elements** (the custom watchOS layout also applies to CarPlay).

---

## Notifications (UserNotifications)

Timely, glanceable, high-value. Require consent first. Styles: Lock/Home Screen banner, app-icon **badge**, Notification Center item; communication notifications show sender avatar + name instead of app icon.

- **Title**: title-case, no ending punctuation; short + contextual (headline/subject). If only a generic title exists, let the system show the app name.
- **Body**: sentence case, full sentences, don't pre-truncate (system truncates). Provide a hidden-preview placeholder ("Friend request", "Reminder").
- **Don't** include your app name/icon (system adds it) or sensitive/personal info.
- **Actions**: up to **4** buttons for in-place tasks; title-case, brief; add an SF Symbol interface icon (shown trailing); prefer non-destructive (system styles destructive distinctly). Don't add an action that merely opens the app.
- **Badge**: unread-notification count **only** — not weather/scores/stocks; keep current; don't fake a badge image (users can disable badging). Never rely on badge/sound alone for essential info.
- Foreground: don't fire a banner — quietly update the view / increment a badge.
- Use an **alert**, not a notification, for errors (`alerts` in `components-presentation.md`). Managing/permission flows → `patterns.md`.

---

## Controls (Control Center / Lock Screen / Action button — iOS 18+)

Quick access to an app feature from Control Center, Lock Screen, or the Action button. A control is a **button** (action / deep-link / camera launch) or **toggle** (two-state). Built with **`ControlWidget`** + `ControlWidgetConfiguration`, backed by an `AppIntent`.

- Anatomy: **symbol** (required), **title**, optional **value**. Control Center shows symbol (+ title/value at larger sizes); Lock Screen shows **symbol only**; Action button shows symbol + value in the Dynamic Island.
- Provide **both** on/off symbols for toggles (e.g. `door.garage.open` / `door.garage.closed`); animate state changes / in-progress actions (`SymbolEffect`).
- Tint color applies to a toggle's **on** symbol and to the Action-button Dynamic Island value.
- Configurable controls: prompt on first add via `promptsForUserConfiguration()`; supply placeholder title/value for the gallery.
- Action-button hint text (verbs) via `controlWidgetActionHint(_:)`.
- Redact title/value (and optionally symbol → off state) when the device is locked; require auth for security-sensitive actions (`IntentAuthenticationPolicy`).
- **Camera on locked device** (iOS 18+): `LockedCameraCapture` launches the camera experience while locked; reuse the same in-app camera UI; any post-capture task requires unlock.
- Not supported on watchOS/tvOS/visionOS.

---

## Status bars

Upper-edge system strip: time, cellular, Wi-Fi, battery. Background is **transparent** by default; content shows through.

- Keep it legible: prefer a **scroll edge effect** to place a blurred view behind it (`ScrollEdgeEffectStyle` / `UIScrollEdgeEffect`) — the Liquid Glass default for bars. Don't imply content behind it is interactive.
- Temporarily hide only for full-screen media; expose a simple discoverable gesture (single tap) to bring it back. **Never** hide permanently (users need time / Wi-Fi status).
- Style: UIKit `preferredStatusBarStyle` / `UIStatusBarStyle`. SwiftUI: `.statusBarHidden(_:)` *(convention)*; content color adapts to `.toolbarColorScheme` / `.preferredColorScheme` *(convention)*.
- Not supported on macOS/tvOS/visionOS/watchOS.
