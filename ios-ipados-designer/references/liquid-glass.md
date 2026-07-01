# Liquid Glass

The current (iOS 26 / iPadOS 26) design language: a dynamic material for the controls-and-navigation layer that floats above content — what to draw, and the SwiftUI to name it.

> Sibling files: `foundations.md` (color/typography), `metrics.md` (sizes/spacing), `components-navigation.md` (bars/sidebars/search), `components-presentation.md` (sheets/popovers), `components-controls.md` (buttons/toggles), `swiftui-catalog.md`, `mapping.md`. Standard (frosted) materials live under "Standard materials" below and in `foundations.md`.

## What Liquid Glass IS

- A **dynamic material** that refracts + reflects the content behind it, adapting luminosity to keep foreground legible. Source calls it "a dynamic material that unifies the design language across Apple platforms."
- Forms a **distinct functional layer** for controls and navigation (tab bars, sidebars, toolbars) that **floats above the content layer**, establishing hierarchy. Content scrolls and **peeks through** from beneath for depth.
- **Two material families** (don't conflate):
  - **Liquid Glass** — the functional/navigation layer. SwiftUI `Glass` + `.glassEffect(_:in:)`.
  - **Standard materials** — frosted-blur layers *within the content layer* (`ultraThin`/`thin`/`regular`/`thick`). SwiftUI `Material` + `.background(.regularMaterial)`.
- Platforms: `Glass`, `GlassEffectContainer`, `GlassButtonStyle` are all **iOS 26.0 / iPadOS 26.0+**. `Material` is iOS 15+.

**Golden rule:** Liquid Glass = functional layer only. Standard materials = content layer. Never put Liquid Glass in the content layer (adds complexity, confuses hierarchy). Sole exception: transient controls like **Sliders** and **Toggles** briefly take on a Liquid Glass look while the user is actively manipulating them.

## Variants: regular vs clear

`Glass` provides two variants; system components pick these automatically, choose explicitly only for custom components.

| Variant | SwiftUI | Behavior | Draw / use when |
| --- | --- | --- | --- |
| **regular** (default) | `Glass.regular` | Blurs + adjusts luminosity of background to protect legibility; scroll edge effects further blur/reduce opacity. **Most system components use this.** | Background may cause legibility issues, or the element has significant text — alerts, sidebars, popovers, standard bars. |
| **clear** | `Glass.clear` | Highly translucent; lets rich background stay prominent. | Elements floating over **media** (photos/video) for an immersive feel. |

**clear + dimming layer (contrast rule):**
- Bright underlying content → add a **dark dimming layer at 35% opacity** behind the glass.
- Sufficiently dark content, or AVKit standard playback controls (they self-dim) → **no dimming layer needed**.

Do: default to **regular**. Don't: reach for **clear** unless there's genuinely rich media behind it.

## Where glass applies + the floating treatment

System frameworks apply Liquid Glass automatically to standard components. Shared visual traits: **concentric rounded-corner shapes**, a **floating** appearance separated from content, and **scroll edge effects** (background blurs/fades under the bar as content scrolls beneath).

| Surface | Variant (typical) | Notes |
| --- | --- | --- |
| Navigation bar / toolbar | regular | Floats; monochromatic symbols/text flip light↔dark vs content. Scroll edge effect at the fade boundary. See `components-navigation.md`. |
| Tab bar | regular | Floating capsule; adapts light/dark to underlying content. |
| Sidebar | regular (more **opaque**) | System renders sidebars more opaque to preserve legibility over complex backgrounds + carry richer content. |
| Sheets / popovers | regular | Text-heavy → regular for contrast. See `components-presentation.md`. |
| Search | regular | Search field sits in the glass bar layer. |
| Buttons / controls | regular or tinted | `.buttonStyle(.glass)`; prominent CTA gets accent-tinted background. |

## Legibility, contrast & tinting

- **By default Liquid Glass has NO inherent color** — it takes color from the content directly behind it.
- **Tinting** = "colored/stained glass," for **emphasis only** (primary CTA, status). System uses it for prominent buttons (e.g. Done) by tinting the **background** with the app accent color.
  - **To emphasize a primary action, tint the background — not the symbol/text.** Don't tint the background of multiple controls on one screen.
- **Small elements** (toolbars, tab bars): symbols/text default to **monochromatic**, darkening over light content and lightening over dark content. Prefer monochrome bars if the app has colorful content; if tinting, pick an accent with strong differentiation.
- **Scrim/legibility:** the regular variant's blur + scroll edge effects act as the built-in scrim; for **clear** over bright media, add the 35% dark dimming layer (above). Keep the **resting state** of scrollable content (e.g. top of screen under a bar) legible even if colorful content scrolls under later.
- Provide **both light and dark** custom colors even in a single-appearance app — required for Liquid Glass adaptivity. See `foundations.md`.

## GlassEffectContainer — grouping glass

`GlassEffectContainer` combines multiple Liquid Glass shapes into one rendered set so they **morph into each other** based on geometry, and renders together for **better performance**.

- Use it whenever you have **multiple adjacent glass elements** (e.g. a cluster of custom glass buttons) — not for a single element.
- **Spacing** parameter controls morphing: as shapes approach, paths blend; **higher spacing → blending begins sooner**.
- Custom glass should be **sparing** — limit to the most important functional elements; overusing distracts from content.

```swift
GlassEffectContainer(spacing: 20) {
    HStack(spacing: 20) {
        Image(systemName: "star.fill").padding().glassEffect()
        Image(systemName: "heart.fill").padding().glassEffect()
    }
}
```

## Accessibility

Liquid Glass adapts to system settings — design and test all three:

| Setting | Behavior to expect |
| --- | --- |
| **Reduce Transparency** | Glass becomes more opaque / falls back toward solid; don't rely on see-through content for meaning. |
| **Increase Contrast** | Glass appearance shifts for higher contrast; supply an increased-contrast variant for every custom color (far greater visual differentiation). |
| **Reduce Motion** | Minimize glass motion/morphing animations tied to scrolling and transitions. |

The `regular`/`clear` appearance also changes if the user picks a preferred Liquid Glass look in device settings. Never hard-code system color values — use `Color` APIs so adaptivity works. See `foundations.md` for contrast pairings.

## Do / Don't

- **Do** let system components adopt glass automatically; apply custom glass sparingly to the few most important controls.
- **Do** use **regular** by default; reserve **clear** for media backgrounds.
- **Do** tint the **background** of a single primary action; keep bars monochromatic over colorful content.
- **Don't** put glass in the content layer (except transient Slider/Toggle activation).
- **Don't** stack **glass on glass** — it destroys the layering metaphor.
- **Don't** float glass over busy content without the material's own shape/blur doing the legibility work (add clear-variant dimming when needed).
- **Don't** over-tint — color on many controls overwhelms and hurts label legibility.

## SwiftUI API reference

Verified in the provided corpus:

| API | Kind | Purpose |
| --- | --- | --- |
| `Glass` | struct | Configures the Liquid Glass material; feeds `.glassEffect(_:in:)`. |
| `Glass.regular` / `Glass.clear` | variants | The two variants (see table above). |
| `.glassEffect(_:in:)` | View modifier | Applies Liquid Glass to a custom view, in a given shape. |
| `GlassEffectContainer` | View | Groups/morphs multiple glass shapes; `spacing:` tunes blending + perf. |
| `GlassButtonStyle` / `.buttonStyle(.glass)` | ButtonStyle | Glass border artwork based on button context. |
| `Material` (`.ultraThin`/`.thin`/`.regular`/`.thick`) | struct | **Standard** frosted material for the content layer via `.background(_:)`. |

```swift
// Glass on a custom view, default (regular) variant, in a capsule
Text("Hello, World!")
    .font(.title)
    .padding()
    .glassEffect()                          // Glass.regular by default

// Explicit clear variant in a shape
myView.glassEffect(.clear, in: .rect(cornerRadius: 16))   // shape arg (convention)

// Glass button
Button("Done") { }.buttonStyle(.glass)

// Standard material in the CONTENT layer (not Liquid Glass)
Label("Flag", systemImage: "flag.fill")
    .padding()
    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
```

**More Liquid Glass APIs (verified against developer.apple.com, all iOS 26.0):**

| API | Kind | Purpose |
| --- | --- | --- |
| `.buttonStyle(.glassProminent)` / `GlassProminentButtonStyle` | ButtonStyle | Prominent glass border artwork based on the button's context — the tinted/CTA glass button. |
| `Glass.tint(_:)` | method | Returns a copy of the `Glass` with a configured tint color (stained-glass emphasis). |
| `Glass.interactive(_:)` | method | Returns a copy of the `Glass` configured to respond interactively (press/morph). |
| `.backgroundExtensionEffect()` | View modifier | Duplicates the view into mirrored copies on any edge with available safe area + blurs them — extends content beneath floating glass bars. |
| `.scrollEdgeEffectStyle(_:for:)` / `ScrollEdgeEffectStyle` | View modifier | Configures the blur transition between scrolling content and a controls area (e.g. toolbars). `.scrollEdgeEffectHidden(_:for:)` disables it. |
| `.glassEffectID(_:in:)` | View modifier | Associates a glass element with an identity in a `GlassEffectContainer` so it morphs across transitions. |
| `.glassEffectUnion(id:namespace:)` / `.glassEffectTransition(_:)` | View modifier | Merge multiple glass shapes into one union; control the enter/exit transition (`.matchedGeometry` / `.materialize`). |

```swift
Button("Buy", action: buy).buttonStyle(.glassProminent)   // prominent glass CTA
myBar.glassEffect(Glass.regular.tint(.blue).interactive()) // tinted, interactive glass
ScrollView { content }.scrollEdgeEffectStyle(.soft, for: .top)   // blur where content meets the bar
heroImage.backgroundExtensionEffect()                      // mirror+blur content under a floating bar
```
