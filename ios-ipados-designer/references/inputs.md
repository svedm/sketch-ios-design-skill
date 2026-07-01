# Inputs
How keyboards, gestures, pointer, Pencil, and hardware controls shape iOS/iPadOS layout & interaction — and the SwiftUI hooks to reach for.

Scope note: this file covers the *input-side constraints a designer must accommodate*, not full component specs. For controls themselves see `components-controls.md`; for tap-target sizing rules see `metrics.md`; for iPad-specific structure see `platform-ios-ipados.md`.

> API-grounding: `.hoverEffect`, `@FocusState`/`.focused`, `onSubmit`, `focusSection`, `ignoresSafeArea` are confirmed in the SwiftUI sources. `.keyboardType`, `.submitLabel`, `.toolbar(placement: .keyboard)`, `.onTapGesture`, `.focusable`, `.textContentType`, `ScribbleSupport` are canonical SwiftUI but not present in the supplied source pages — treat as **(convention)** and verify signatures at build time. `.textInputAutocapitalization` is confirmed.

---

## 1. Keyboards (virtual + hardware)

The supplied HIG page ("Keyboards") covers **physical/hardware** keyboards and shortcuts. Virtual-keyboard specifics (types, return keys) below are **(convention)** — the virtual-keyboards HIG page was not in sources.

### Designer must accommodate
| Concern | Rule |
| --- | --- |
| Keyboard avoidance | The system pushes/scrolls focused content above the keyboard automatically. Design forms so the *active* field + its submit affordance can sit above a raised keyboard. Don't pin critical actions to the very bottom where the keyboard hides them. |
| Safe area | The keyboard participates in the safe area. Content laid out with default safe-area insets moves up correctly; content that opts out (`ignoresSafeArea`) will be covered. |
| Input accessory / toolbar-above-keyboard | Attach a bar riding on top of the keyboard for context actions (Done, Next/Previous field, formatting). This is the correct home for a "Done" dismiss button on number pads that lack a return key. |
| Hardware keyboard (iPad) | Many iPad users type on a physical keyboard. Support **Full Keyboard Access** rather than hand-rolling control navigation (see §4). Localize & mirror shortcuts automatically (RTL). |

### Keyboard-type decision (pick per field) — **(convention)**
| Field intent | `.keyboardType(_)` |
| --- | --- |
| Free text | `.default` |
| Email | `.emailAddress` |
| URL | `.URL` |
| Phone | `.phonePad` |
| Whole number / PIN | `.numberPad` |
| Decimal amount | `.decimalPad` |
| Search on web | `.webSearch` |

### Return-key intent — `.submitLabel(_)` **(convention)**
`.done` · `.next` · `.go` · `.search` · `.send` · `.join` · `.continue`. The label sets user expectation for what Return does; wire the actual action with `onSubmit { … }` (confirmed).

### SwiftUI hooks
```swift
TextField("Email", text: $email)
    .keyboardType(.emailAddress)          // (convention)
    .textContentType(.emailAddress)       // (convention) autofill/QuickType
    .textInputAutocapitalization(.never)  // confirmed
    .submitLabel(.next)                   // (convention)
    .focused($focus, equals: .email)      // confirmed (@FocusState)
    .onSubmit { focus = .password }       // confirmed

// Toolbar riding above the keyboard — (convention) placement
.toolbar {
    ToolbarItemGroup(placement: .keyboard) {
        Spacer()
        Button("Done") { focus = nil }
    }
}
```
- Dismiss keyboard = set the `@FocusState` binding to `nil`.
- `.numberPad` / `.decimalPad` have **no Return key** → always give a keyboard toolbar "Done" or a scroll-to-dismiss.

### Hardware shortcuts (grounded)
- Respect standard shortcuts; don't repurpose (⌘Z undo, ⌘C/V, ⌘F find, ⌘, Settings, ⌘? Help, Esc cancel). Only redefine a standard shortcut if its action is meaningless in your app.
- Define **custom** shortcuts only for frequent app-specific commands; too many hurts learnability.
- Prefer ⌘ as primary modifier; Shift for related secondary; Option sparingly; **avoid Control** (system-reserved). List modifiers in order Control-Option-Shift-Command.
- SwiftUI: `KeyboardShortcut` / `.keyboardShortcut(_:modifiers:)`.

---

## 2. Gestures

### Standard gestures (all-platform, grounded)
| Gesture | Common action | SwiftUI |
| --- | --- | --- |
| Tap | Activate control / select | `.onTapGesture` (convention) — but prefer `Button`/`NavigationLink` for real controls |
| Swipe | Reveal actions, dismiss, scroll | `.swipeActions`, `DragGesture` |
| Drag | Move an element | `DragGesture`, `.draggable` |
| Touch & hold | Reveal extra controls / context menu | `.contextMenu`, `LongPressGesture` |
| Double tap | Zoom in/out | `.gesture(TapGesture(count: 2))` |
| Zoom (pinch) | Magnify content | `MagnifyGesture` |
| Rotate | Rotate item | `RotateGesture` |

### iOS/iPadOS extra system gestures (grounded — reserve these)
| Gesture | System action |
| --- | --- |
| Three-finger swipe L/R | Undo / Redo |
| Three-finger pinch in/out | Copy / Paste |
| Four-finger swipe (iPad) | Switch apps |
| Shake | Undo/Redo |
| Edge swipe from leading side | Back |

### Do / Don't
- **Do** keep gestures consistent with system expectations; tap = activate/select.
- **Do** provide a visible control (e.g. a top-bar **Back** button) *in addition to* any shortcut gesture — never make a gesture the only path to an important action.
- **Don't** override the interactive **back-swipe** (leading-edge) or other system-UI gestures. Games/immersive experiences may *defer* a system gesture, not replace it.
- **Don't** invent a custom gesture for a standard action, or overload a familiar gesture (tap/swipe) with an app-unique meaning.
- **Do** give immediate, predictive feedback during a gesture; indicate clearly when a gesture is unavailable (else it reads as "frozen").
- Custom gestures must be discoverable, easy to perform, distinct, and never the sole path.

### Tap targets
Minimum **44×44 pt** for frequently used controls; **28×28 pt** acceptable for less-important controls (grounded, game-controls). See `metrics.md` for the general rule. Don't place controls where the Home indicator / Dynamic Island overlap them.

---

## 3. Pointing devices / pointer on iPad

iPad pointer *augments* touch — never replaces it. Everything must still work by finger.

### Content effects (grounded — match intent)
| Effect | Use for | Applied by default to |
| --- | --- | --- |
| **Highlight** | Small element, *transparent* background | bar buttons, tab bars, segmented controls, edit menus |
| **Lift** | Small element, *opaque* background | app icons, Control Center buttons |
| **Hover** | Large elements; custom scale/tint/shadow | (you apply) |

- Pointer default = circle; auto-becomes I-beam over text entry.
- **Magnetism** applies to lift + highlight elements and text areas — *not* hover (adding it feels jarring since hover keeps the default pointer shape).
- Pointer accessories (e.g. `plus` → `circle.slash`) can signal state changes.

### Hit-region padding (grounded numbers)
| Element | Padding around visible edges |
| --- | --- |
| Bezeled control | ~**12 pt** |
| Non-bezeled element | ~**24 pt** |
- Make adjacent custom bar-button hit regions **contiguous** (gaps cause pointer flicker).
- For large elements with little surrounding space: use tint-only hover (no scale/shadow — shadow without scale looks wrong; scale on a table row overlaps neighbors).

### Reveal-on-hover
Let the pointer reveal/hide auto-minimizing chrome (e.g. minimized Safari toolbar, full-screen video controls). Relevant under Liquid Glass, where bars minimize/fade — see `liquid-glass.md` and `components-navigation.md`.

### SwiftUI hooks
```swift
view.hoverEffect(.highlight)   // confirmed  (.highlight | .lift | .automatic)
```
- Prefer system pointer effects for custom elements that behave like standard ones (a custom toolbar button without `.highlight` reads as broken).
- Distinguish pointer vs finger input **only** when it adds value (e.g. precise video seek).
- iPadOS 15+: click-drag band selection in collections is default; custom views need `UIBandSelectionInteraction` (UIKit).

---

## 4. Focus & selection (hardware keyboard, focus engine)

Focus system is **not supported in iOS** (iPhone); it applies to **iPadOS** (and tvOS/visionOS).

### iPad focus model (grounded)
- Navigate text fields, text views, sidebars, collection & custom views via keyboard.
- **Focus groups** (sidebar, grid, list): **Tab** moves *between* groups; **arrow keys** move *within* a group. Focus advances leading→trailing, top→bottom (reading order).
- A group's **primary item** auto-receives focus on entry — raise an item's priority to make it primary.
- Two indicators: **halo** (focus ring — for text/search fields and opaque cell content like a photo) vs **highlight** (accent-tinted row — for list/collection rows). Rule of thumb: *ring for a field, highlight for a row*.

### Designer rule (grounded)
- With **Full Keyboard Access**, you only need to support focus for **content** (list items, text fields, search fields) — *not* for standard controls (buttons, sliders, toggles, segmented controls). Let Full Keyboard Access reach those. Explicitly **avoid** hand-rolling keyboard navigation for buttons/switches.
- Never move focus without user interaction; rely on system focus effects.

### SwiftUI hooks
```swift
@FocusState private var focus: Field?      // confirmed
TextField(...).focused($focus, equals: .name)
someView.focusSection()                     // confirmed — group for keyboard focus
someView.focusable(true)                    // (convention)
```

---

## 5. Apple Pencil & Scribble (iPad only)

Not supported outside iPadOS. A designer accommodates Pencil by sizing writable areas and keeping controls reachable.

### Do / Don't (grounded)
- **Do** let a mark begin the instant Pencil touches screen — no mode toggle, no button first.
- **Do** make every control respond to Pencil too (a Pencil-unresponsive button reads as dead/low-battery).
- **Do** design for left- **and** right-handed users; don't hide controls under the hand; allow repositioning if needed.
- **Scribble** works in all standard text components (text fields, text views, search fields, editable web fields) — **except password fields** — by default; no tap-to-focus required.
- **Do** give **enough width** to write: enlarge a text field before/when Pencil input is likely; a cramped field is uncomfortable.
- **Don't** move/resize/autoscroll a field *while* the person is writing (they lose track of input); delay changes until they pause. Hide placeholder + suppress autocompletion during handwriting.
- **Hover:** preview the mark (size/color) the tool will make; show a mid-range value; don't trigger actions on hover; prefer Pencil-only previews over pointer.
- **Double tap / Squeeze / Barrel roll (Pencil Pro):** respect the user's system setting; use only for nondestructive, easily-undone actions. Barrel roll = modify the *mark* only, never navigation.

### SwiftUI / framework hooks
- Custom drawing canvas + tool picker: **PencilKit** (`PKCanvasView`, `PKToolPicker`).
- Scribble opt-in/config on custom text: `ScribbleSupport` / scribble interactions **(convention)**; UIKit `UIScribbleInteraction` / `UIIndirectScribbleInteraction`.
- Compact environment lacks the tool-picker undo/redo — provide your own toolbar undo/redo and support the 3-finger undo gesture.

---

## 6. Hardware controls (iPhone) — accommodate, don't render

These are physical buttons; a *designer* accounts for their launch paths and safe areas, not on-screen chrome.

### Camera Control (iPhone 16 / 16 Pro) — grounded
- Light-press opens your camera experience; light double-press shows an overlay of controls; slide to adjust a value.
- Two control types: **slider** (range, e.g. contrast) and **picker** (discrete, e.g. grid on/off). System-standard zoom/exposure controls optional.
- **Layout impact:** the overlay + labels occupy the screen edge adjacent to the control in **both** portrait & landscape. Keep your viewfinder UI **outside** those overlay areas; maximize viewfinder size; don't duplicate a control in both your UI and the overlay.
- Use **SF Symbols** only (no custom symbols); short labels (Dynamic Type). Order common controls toward the middle. Controls are fixed at runtime (can't add/remove; can enable/disable per mode).
- Locked-camera launch from lock screen / Home / other apps via `LockedCameraCapture`. Framework: AVFoundation `AVCaptureControl` / `AVCaptureSlider` / `AVCapturePicker`.

### Action button (iPhone 15 Pro+, Apple Watch) — grounded
- Not supported on iPad/Mac/tvOS/visionOS.
- User-assigned in Settings; runs an **App Shortcut** or system function. As a designer, expose your app's **essential functions as App Shortcuts**; don't ship an "open my app" shortcut (system already does that).
- Prefer lightweight, in-context results (**Live Activities**, custom snippets) over launching the app.
- Labels: title-case, verb-first, present tense, no articles, ≤ **3 words** (e.g. "Start Egg Timer").

### Game controls — grounded
- Always provide a **touch fallback**; every iPhone/iPad has a touchscreen.
- Virtual buttons: frequently used **≥ 44×44 pt**, secondary (menus) **≥ 28×28 pt**; keep off Home indicator / Dynamic Island; movement on the left, camera on the right; always show visible + haptic press states.
- UI navigation mapping: **A** activates, **B** cancels/back, shoulders change screen/section, thumbstick/D-pad moves selection, **Menu** pauses/settings, Home reserved for system.
- Prefer **SF Symbols** (Game Controller framework provides them) over text/letters for controller elements. Frameworks: `GameController`, `TouchController`.

---

## 7. Nearby interactions — grounded

- Ultra Wideband (U1) proximity + direction via the **Nearby Interaction** framework; user grants permission; identifiers are ephemeral (privacy).
- **Layout/UX impact:** encourage **portrait** hold (landscape degrades accuracy); design for the device's directional field of view (like the Ultra Wide camera); intervening objects reduce accuracy.
- Provide **continuous** feedback that sharpens with proximity (arrow → pulsing circle pattern); combine visual + audible + haptic.
- **Never** make a nearby interaction the *only* way to do a task — always give a UI alternative.

---

## Quick reference — input → SwiftUI hook
| Need | Hook | Grounded? |
| --- | --- | --- |
| Choose virtual keyboard | `.keyboardType(_)` | convention |
| Return-key label | `.submitLabel(_)` | convention |
| Submit action | `onSubmit { }` | ✓ |
| Autofill semantics | `.textContentType(_)` | convention |
| Capitalization | `.textInputAutocapitalization(_)` | ✓ |
| Drive/track focus | `@FocusState` + `.focused(_)` | ✓ |
| Group keyboard focus | `.focusSection()` / `.focusable(_)` | ✓ / conv. |
| Bar above keyboard | `.toolbar { ToolbarItemGroup(placement: .keyboard) }` | convention |
| Tap on non-control | `.onTapGesture` (prefer `Button`) | convention |
| iPad pointer effect | `.hoverEffect(_)` | ✓ |
| Pencil canvas | PencilKit `PKCanvasView` / `PKToolPicker` | ✓ (HIG) |
| Keyboard shortcut | `.keyboardShortcut(_:modifiers:)` | ✓ (HIG) |

See also: `metrics.md` (44/28 pt targets), `inputs`→`components-controls.md` (TextField/SecureField specs), `platform-ios-ipados.md` (iPad multitasking & sidebars), `liquid-glass.md` (hover-reveal bars).
