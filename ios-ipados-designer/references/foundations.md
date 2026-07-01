# Foundations

Design foundations (color, type, layout, materials, symbols, icons, dark mode, motion, writing, a11y) for iOS/iPadOS 26 — each paired with the exact SwiftUI element to reach for.

> Cross-refs: Liquid Glass depth → `liquid-glass.md`; every pt/spacing number → `metrics.md`; SwiftUI type index → `swiftui-catalog.md`; Sketch → SwiftUI names → `mapping.md`; iPad size-class behavior → `platform-ios-ipados.md`.

---

## Color

Use **semantic (dynamic) system colors**, never hard-coded hex. Each is defined by *purpose*, adapts to light/dark + Increase Contrast, and is required for Liquid Glass adaptivity. Even a single-appearance app must supply light+dark variants.

### Foreground / label roles

| Role | Use for | SwiftUI | UIKit |
|---|---|---|---|
| Label (primary) | Primary text | `.foregroundStyle(.primary)` or `Color(.label)` | `.label` |
| Secondary label | Subheads, supporting text | `.foregroundStyle(.secondary)` | `.secondaryLabel` |
| Tertiary label | De-emphasized text | `.foregroundStyle(.tertiary)` | `.tertiaryLabel` |
| Quaternary label | Watermark-level, lowest contrast | `.foregroundStyle(.quaternary)` | `.quaternaryLabel` |
| Placeholder | Field/text-view placeholders | `Color(.placeholderText)` | `.placeholderText` |
| Separator (translucent) | Divider that lets content show through | `Color(.separator)` | `.separator` |
| Opaque separator | Divider that blocks content | `Color(.opaqueSeparator)` | `.opaqueSeparator` |
| Link | Tappable link text | `Color(.link)` | `.link` |

- `.primary`/`.secondary`/`.tertiary`/`.quaternary` are SwiftUI `ShapeStyle` hierarchical styles and preserve **vibrancy** on materials; a custom `.foregroundStyle(someColor)` **disables vibrancy**.
- Don't: use `separator` as text color or `secondaryLabel` as a background — never repurpose a semantic role.

### Background roles (two families)

Pick **grouped** for grouped-`List`/table layouts, **system** otherwise. Each family has primary/secondary/tertiary for hierarchy.

| Level | System family (SwiftUI / UIKit) | Grouped family (SwiftUI / UIKit) |
|---|---|---|
| Primary — overall view | `Color(.systemBackground)` / `.systemBackground` | `Color(.systemGroupedBackground)` / `.systemGroupedBackground` |
| Secondary — grouped content | `Color(.secondarySystemBackground)` | `Color(.secondarySystemGroupedBackground)` |
| Tertiary — nested groups | `Color(.tertiarySystemBackground)` | `Color(.tertiarySystemGroupedBackground)` |

- Hierarchy rule: Primary = whole view · Secondary = a group inside it · Tertiary = a group inside a group.
- **Dark Mode elevation:** iOS keeps two dark background sets — *base* (recedes) and *elevated* (advances, used automatically for popovers/sheets/multitasking). Prefer system background colors so elevation happens for free; a custom background defeats it.

### Fills

Gray fills tint shapes behind controls/content (e.g., a custom bezel). SwiftUI: `.fill(.quaternary)` etc., or `Color(.systemFill)`, `.secondarySystemFill`, `.tertiarySystemFill`, `.quaternarySystemFill` (UIKit). System grays: `Color(.systemGray)` … `systemGray6` (SwiftUI `Color.gray` == `systemGray`).

### Tint / accent

- App accent color drives interactive elements. Set once via `.tint(_:)` on a container, or the asset-catalog **AccentColor**. Prefer `.tint()` over `.accentColor` (deprecated).
- On macOS the user's System Settings accent can replace yours; not a factor on iOS/iPadOS.

### System palette (ShapeStyle `Color`)

`red, orange, yellow, green, mint, teal, cyan, blue, indigo, purple, pink, brown` (+ `gray`). Each has light/dark + increased-contrast variants baked in. Sample resting values (default light → dark, sRGB): red `255,56,60 → 255,66,69` · blue `0,136,255 → 0,145,255` · green `52,199,89 → 48,209,88`. **Reference only — don't hard-code**; use `Color.red` etc.

### Liquid Glass color rules  → see `liquid-glass.md`

- Liquid Glass has **no inherent color** — it takes color from content behind it. Apply color *sparingly*, only to elements that need emphasis (a primary/prominent action like Done).
- To emphasize a primary action, apply the accent color to the **background** (prominent button), not to the symbol/text. Don't color multiple control backgrounds at once.
- Small elements (toolbars, tab bars) auto-adapt light/dark monochrome vs. content; prefer a **monochromatic** treatment over colorful backgrounds. Larger elements (sidebars) render more opaque for legibility.
- Keep the content layer's resting state (top of scroll) legible under floating controls.

### Inclusive color

Never rely on color alone — pair with text/shape/icon. Target contrast: see Accessibility below.

---

## Typography

**San Francisco (SF)** is the system sans: **SF Pro** = system font on iOS/iPadOS; **SF Compact** (watchOS); rounded variants for soft UI. **New York (NY)** is the system serif (`Font.Design.serif`). Both ship as *variable* fonts with **dynamic optical sizing** — you don't pick Text/Display cuts manually. SF Symbols weight-match SF automatically.

- Access via `Font.Design` — never embed system fonts. `.default` = SF, `.serif` = NY, `.rounded`, `.monospaced`.
- Avoid Ultralight/Thin/Light; prefer Regular/Medium/Semibold/Bold. iOS default text **17 pt**, minimum **11 pt**.

### Dynamic Type text styles (map to `.font(.body)` etc.)

Use built-in text styles so text scales with the user's setting and larger accessibility sizes. Emphasized weight applied via `.bold()` / `.fontWeight(.semibold)`.

| Style | SwiftUI `Font` | Size @ Large (pt) | Line height (pt) | Weight | Use for |
|---|---|---|---|---|---|
| Large Title | `.largeTitle` | 34 | 41 | Regular | Top-level screen title (scroll-collapsing) |
| Title 1 | `.title` | 28 | 34 | Regular | Prominent heading |
| Title 2 | `.title2` | 22 | 28 | Regular | Section heading |
| Title 3 | `.title3` | 20 | 25 | Regular | Subsection heading |
| Headline | `.headline` | 17 | 22 | Semibold | Emphasized row/list title |
| Body | `.body` | 17 | 22 | Regular | Default reading text |
| Callout | `.callout` | 16 | 21 | Regular | Secondary body |
| Subheadline | `.subheadline` | 15 | 20 | Regular | Supporting text / list subtitle |
| Footnote | `.footnote` | 13 | 18 | Regular | Fine print, metadata |
| Caption 1 | `.caption` | 12 | 16 | Regular | Captions, timestamps |
| Caption 2 | `.caption2` | 11 | 13 | Regular | Smallest caption |

> Size/line-height numbers above are the standard iOS Large values **(convention)** — the Apple source's iOS/iPadOS Dynamic Type table rendered empty; only default 17 pt / min 11 pt and the emphasized-weight note (medium/semibold/bold/heavy) are explicit. Verify against the Dynamic Type tables in Apple Design Resources when exactness matters.

### Scaling, leading, tracking

- **Scale custom fonts too:** wrap in `.font(.custom(_, size:relativeTo:))` or `ScaledMetric` so they honor Dynamic Type; also respond to Bold Text.
- Clamp/opt-in a view to specific sizes with `.dynamicTypeSize(...)` (e.g. `.dynamicTypeSize(...DynamicTypeSize.accessibility3)`); test up to the largest accessibility size (Settings › Accessibility › Display & Text Size › Larger Text).
- Adjust leading with `.font(...).leading(.tight|.standard|.loose)` — loose for wide columns, tight for constrained rows; avoid tight for 3+ lines.
- At AX sizes, prefer **stacked** layouts over inline (glyph + text side-by-side), reduce columns, keep primary elements at top, minimize truncation. Emphasize with `.bold()`.
- Tracking is auto at runtime; only tweak in static mockups.

---

## Layout

### Safe areas & margins

- **Safe area** = region not covered by bars/Dynamic Island/camera housing/corner radius. Content backgrounds and scroll views should extend **edge-to-edge under** the (floating) bars; safe area keeps interactive content clear.
- Push background art past bars with `.ignoresSafeArea()`; read insets via `GeometryReader`/`safeAreaInsets`. Add bar-aware content padding with `.safeAreaInset(edge:)` / `.safeAreaPadding()`.
- Under sidebars/inspectors, mirror content behind the control layer with `.backgroundExtensionEffect()` (UIKit `UIBackgroundExtensionView`).
- Standard content margins via `.contentMargins(...)`; respect readable width for long text (SwiftUI does this in `List`/`Form`; wrap prose in a constrained column otherwise).
- Avoid full-width edge-to-edge buttons; inset from system margins. If full-width is required, align to hardware curvature.

### Size classes (compact / regular)

`horizontalSizeClass` / `verticalSizeClass` = `.compact` or `.regular`.

- iPhone portrait = compact width; most iPhone landscape = compact width too (Plus/Max/Air landscape = regular width). **All iPad full-screen = regular width both axes.**
- Read via `@Environment(\.horizontalSizeClass)`; branch layout, or prefer `ViewThatFits` / adaptive `Grid`.
- iPad windows resize freely to a min size: design the **full** layout first, collapse to compact only when it no longer fits; hide tertiary columns (inspectors) first.
- Adaptive nav: `TabView { … }.tabViewStyle(.sidebarAdaptable)` switches tab bar ⇄ sidebar with width. See `components-navigation.md`.

### Alignment, spacing, grids

- Align elements to a consistent rhythm to aid scanning; group related items with negative space / fills / separators. Reading order = top→bottom, leading→trailing (RTL-aware).
- Stacks: `VStack`/`HStack`/`ZStack` (default spacing is system-standard; pass `spacing:` to override). `Spacer`, `Divider`.
- Grids: `Grid` (static, aligned rows/cols) · `LazyVGrid`/`LazyHGrid` with `GridItem(.adaptive/.flexible/.fixed)` for large scrollable collections.

---

## Materials

Two systems. **Liquid Glass** = the floating control/navigation layer (bars, sidebars, sheets, buttons). **Standard materials** = blur/vibrancy *within the content layer*.

| Standard material | SwiftUI `Material` | Note |
|---|---|---|
| Ultra-thin | `.ultraThinMaterial` | Most translucent; keeps background context |
| Thin | `.thinMaterial` | |
| Regular (default) | `.regularMaterial` | Balanced |
| Thick | `.thickMaterial` | Most opaque; best text contrast |
| Bar | `.bar` | Bar-style blend |

- Apply: `.background(.regularMaterial)` or shaped `.background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))`. Material blurs *your app's* background, not the Home Screen behind a widget.
- Choose by **semantic meaning**, not apparent tint (settings change appearance). Thicker = better fine-text contrast; thinner = more context.
- Keep foreground legible with vibrant colors: use hierarchical `.foregroundStyle(.secondary/.tertiary)` on materials (custom colors kill vibrancy). Avoid quaternary on `.thin`/`.ultraThin` (contrast too low).
- **Don't put Liquid Glass in the content layer** — use standard materials there. Exception: transient controls (Slider/Toggle) adopt a glass look while actively manipulated.
- Liquid Glass API: `.glassEffect()` (default), `.glassEffect(_:in:)` with `Glass` variants `.regular` (default, legibility-first) vs `.clear` (max translucency, media backgrounds — add a ~35% dark dimming layer over bright content). Group/morph with `GlassEffectContainer`. `Glass` is iOS 26+. Use sparingly on custom controls. See `liquid-glass.md`.

---

## SF Symbols

Thousands of variable symbols that weight-match SF text. Prefer over custom icons for common concepts; they scale with Dynamic Type and adapt to Dark Mode + a11y automatically. `Image(systemName: "square.and.arrow.up")`.

| Axis | Options | SwiftUI |
|---|---|---|
| Weight | 9: ultralight → black (match adjacent text) | `.fontWeight(.semibold)` / inherits `.font()` |
| Scale | small · **medium** (default) · large (relative to cap height) | `.imageScale(.large)` |
| Rendering mode | monochrome · hierarchical · palette · multicolor | `.symbolRenderingMode(.hierarchical)` |
| Variable color | fill layers by 0–100% value (capacity/strength) | `Image(_, variableValue:)` |
| Design variant | outline (default) · fill · slash · enclosed (circle/square) | `.symbolVariant(.fill)` |
| Animation | bounce, pulse, wiggle, breathe, rotate, replace, draw on/off, variable | `.symbolEffect(.bounce)` / `.contentTransition(.symbolEffect(.replace))` |

- Rendering modes: **monochrome** one color · **hierarchical** one color at layered opacities (depth) · **palette** 2+ colors, one per layer · **multicolor** intrinsic meaningful colors (green leaf, red trash.slash). Use system colors so they adapt.
- Gradients: SF Symbols 7+ generates a linear gradient from one color across any rendering mode; best at large sizes.
- Variant defaults are often view-driven: tab bars prefer **fill**, toolbars prefer **outline** — you usually don't specify.
- Selected states in bars/toolbars/buttons are system-handled; don't ship separate selected art.
- Don't use SF Symbols in app icons/logos (trademark terms); can't customize Apple-product symbols.
- Animate judiciously — each animation has discrete meaning; too many overwhelm. Provide accessibility labels for custom symbols. See standard-action symbol table in `mapping.md`/Icons below.

---

## Interface icons (glyphs)

Custom icons when no symbol fits. Streamlined shapes + touches of color (black/clear paths the system tints).

- Keep **consistent** size, detail, stroke weight, perspective across all icons; match weight to adjacent text unless emphasizing.
- **Optically** center asymmetric icons (add padding in the asset), don't just geometrically center.
- Ship as **vector PDF/SVG** (auto-scales) — not PNG. Or make a custom SF Symbol so it weight-matches text.
- Provide accessibility labels. Use inclusive, gender-neutral, culturally neutral imagery. Localize/flip icons containing characters for RTL. Don't replicate Apple hardware.
- Standard action → symbol (subset): Share `square.and.arrow.up` · Delete `trash` · Add `plus` · More `ellipsis` · Edit/Compose `square.and.pencil` · Search `magnifyingglass` · Filter `line.3.horizontal.decrease` · Done `checkmark` · Cancel/Close `xmark` · Account `person.crop.circle`.

---

## App icons

- Single canvas **1024×1024 px**, **layered** (background + one or more foreground layers) for depth. iOS/iPadOS/macOS/watchOS use **Icon Composer** (in Xcode); annotate default/dark/mono variants there.
- Icons take on **Liquid Glass** attributes — specular highlights, refraction, translucency — applied by the system. **Don't bake in** highlights/shadows/blurs/bevels; let the system draw them. Use clearly defined (non-feathered) edges; vary layer opacity for depth.
- Shape: iOS/iPadOS square canvas → system masks to rounded rectangle concentric with the device. Keep primary content centered; use the keyline grid in Apple Design Resources templates.
- **Appearances:** default, dark, clear (light/dark), tinted (light/dark). Keep core features consistent across all; base dark on the light icon; the system generates variants you omit. Alternate icons need their own variants.
- Prefer vector (SVG/PDF) layers; PNG for mesh gradients/raster. Simple concept, minimal shapes, avoid text (no a11y/localization) and photos. Color spaces: sRGB, Gray Gamma 2.2, Display P3.

---

## Dark Mode

Systemwide; users often default to it and expect apps to follow. **Don't** add an app-only appearance toggle.

- Use semantic colors (`.label`, `.separator`, system backgrounds) — they adapt automatically; add Color Set assets with light+dark variants for customs. Never hard-code.
- Two dark background sets — **base** vs **elevated** — give depth; foreground/modal surfaces auto-use elevated. SF Symbols adapt automatically.
- Design separate light/dark interface icons only when needed (e.g. add an outline so a shape reads on both). Slightly darken white-background content images to avoid glow.
- Test with Increase Contrast + Reduce Transparency (separately and together) in both modes. Contrast targets below.
- SwiftUI: `@Environment(\.colorScheme)`; force per-view only when justified via `.preferredColorScheme(_:)`.

---

## Motion (Reduce Motion)

System components animate for free (Liquid Glass responds more to direct touch, subtler to trackpad). For custom motion:

- Add motion purposefully; avoid gratuitous/frequent animation on common interactions. Keep feedback brief, precise, gesture-tracking. Let people cancel/interrupt.
- **Never** make motion the only way to convey info — pair with haptics/audio.
- Honor **Reduce Motion**: `@Environment(\.accessibilityReduceMotion)`. When on, cut zoom/scale/peripheral motion; replace x/y/z slides with **fades**, tighten springs, avoid z-axis depth changes and animating in/out of blurs.
- Prefer SF Symbol animations (`.symbolEffect`) where meaningful.

---

## Images

- Provide `@2x` and `@3x` bitmaps on iOS (`@2x` iPadOS). Design at 1x, align control points to whole values, scale up.
- Formats: de-interlaced PNG (raster/flat), JPEG/HEIC (photos), **PDF/SVG** (flat icons needing scaling). Embed a color profile (sRGB accurate on most displays; Display P3 for wide-gamut). SwiftUI: `Image("asset")` / async `AsyncImage(url:)`.

---

## Branding

- Express brand through the app icon, an accent color (`.tint`), and optionally a custom font (system font for body/captions for legibility). Keep branding subordinate to content.
- Don't plaster the logo throughout or use the launch screen as a branding moment — prefer an onboarding screen. Follow Apple trademark rules (no Apple marks in name/images).
- Keep familiar patterns/placements even in stylized UIs so the app stays approachable.

---

## Writing

- **Capitalization:** Title case reads formal; sentence case reads casual. Pick one style **per element type** and apply consistently (e.g. title case for all alerts). Button/menu labels follow their component's own rules (see `components-controls.md`).
- **Buttons/links:** use verbs — "Send", not "Let's do it!"; "Learn more about X", not "Click here". Say "tap" (not "click") on touch devices.
- Be clear and concise; active voice; put most important info first. Avoid "we"/"oops"; prefer "Unable to load content".
- Error messages: state the fix ("Choose a password with at least 8 characters"), place near the problem, don't blame. Show placeholder/hint text in fields ("name@example.com").
- Empty states: guide the next action with a button/link. Consistent language patterns across multi-step flows ("Get Started" → "Continue" → "Done").

---

## Accessibility (overview — deep dives cross-referenced)

- **Contrast (WCAG AA):** ≤17 pt → **4.5:1** · 18 pt or bold → **3:1**. Custom Dark Mode targets 7:1 for small text. Provide a higher-contrast scheme for Increase Contrast; verify light *and* dark. Prefer system colors (adapt automatically).
- **Touch targets:** min **44×44 pt** (default), absolute min 28×28 pt. ~12 pt padding around bezeled controls, ~24 pt around bezel-less. SwiftUI: `.frame(minWidth:44, minHeight:44)` / `.contentShape(...)`.
- **Dynamic Type:** support it (built-in styles do); don't truncate; test to largest AX size. See Typography above.
- **VoiceOver:** label every meaningful element — `.accessibilityLabel(_:)`, `.accessibilityValue`, `.accessibilityHint`; group with `.accessibilityElement(children:)`. Custom icons/symbols need labels.
- **Don't rely on color alone** — add shape/text/icon. Pair audio cues with haptics/visual cues.
- **Reduce Motion / Reduce Transparency:** `@Environment(\.accessibilityReduceMotion)` / `\.accessibilityReduceTransparency`; swap materials for solid backgrounds and motion for fades when on.
- Prefer simple, standard gestures; always offer a non-gesture alternative. Support Full Keyboard Access / Switch Control / Voice Control via correct labels.
