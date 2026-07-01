# Components — Selection & Input Controls
One-stop reference for every iOS/iPadOS control that takes a decision or value from the user — design intent plus the exact SwiftUI type/style to reach for.

Scope: buttons, pop-up/pull-down buttons, toggles, sliders, steppers, pickers, segmented controls, text fields, color wells, and the macOS-only siblings (combo/image wells, digit entry). For bars/nav controls see `components-navigation.md`; for status controls (progress, gauges) see `components-status-system.md`; for sizing tokens see `metrics.md`; for glass mechanics see `liquid-glass.md`; SwiftUI↔Sketch naming lives in `mapping.md` and `sketch-playbook.md`.

Global rules
- **Hit target ≥ 44×44 pt** for any control, regardless of visible size (HIG Buttons). visionOS uses 60×60 pt.
- **Always show a press/pressed state** on custom controls or they feel dead.
- **Liquid Glass is the default (iOS 26).** Bars and floating controls are Liquid Glass; in-content controls stay flat and monochromatic. Don't tint a control the same hue as colorful content behind it — prefer the default monochrome label. See `liquid-glass.md`.
- **One or two prominent buttons per view, max.** Distinguish the preferred choice by *style*, not size.

---

## Buttons

**Purpose** — Initiate an instantaneous action.
**Applicability** — Everywhere; the default action affordance. For state use Toggle; for a menu of options use pop-up/pull-down.

### Roles (semantic — affects color/behavior)
| Role | Meaning | Appearance | SwiftUI |
|---|---|---|---|
| Normal | No special meaning | Accent-neutral | `Button(title, action:)` |
| Primary | Default / most likely; responds to Return, auto-closes temporary views | Accent-color background | make it prominent + `.keyboardShortcut(.defaultAction)` |
| Cancel | Cancels current action | Standard | `Button(role: .cancel)` |
| Destructive | May destroy data | System red | `Button(role: .destructive)` |

Don't give the primary role to a destructive action, even if it's the likely choice.

### Styles (`.buttonStyle`)
| Style | Use | Fill |
|---|---|---|
| `.automatic` | Context default | Adapts to container |
| `.bordered` | Standard secondary action | Tinted glass/gray capsule |
| `.borderedProminent` | Primary action | Accent-filled |
| `.borderless` | Inline / text-like action | No background |
| `.plain` | No system styling | None |
| `.glass` | Liquid Glass floating control (iOS 26) | Adaptive Liquid Glass — `GlassButtonStyle` |
| `.glassProminent` | Prominent Liquid Glass primary (iOS 26) | Accent-tinted glass |

Set role via init, tint via `.tint(_:)`, shape via `.buttonBorderShape(.capsule/.roundedRectangle/.circle)`.

### Sizes — `.controlSize`
`.mini` · `.small` · `.regular` (default) · `.large` · `.extraLarge`. Visible height scales, but keep the 44 pt hit region. (Exact pt heights not enumerated in source — treat as system-driven.)

### States
Normal · pressed (required) · disabled (`.disabled(true)`) · in-progress. For slow actions, show an inline activity indicator inside the button and optionally swap the label ("Checkout" → "Checking out…"); the system hides the button image while spinning (HIG iOS/iPadOS).

### Do / Don't
- Do: pair verb-first title-case labels with familiar SF Symbols (`square.and.arrow.up` = share).
- Do: use `Button(_:systemImage:action:)` or a `Label` so the button adapts (icon-only in toolbars, title+icon in menus).
- Don't: crowd prominent buttons; don't rely on an image-only label without an accessibility label.

### Liquid Glass
`.glass` / `.glassProminent` render adaptive Liquid Glass that refracts content behind it (iOS 26). Prefer them for floating/overlay actions; keep default monochrome labels over bright content. Wrap adjacent glass buttons in a `GlassEffectContainer` so they morph/merge correctly.

### SwiftUI mapping
```swift
Button("Add to Cart", systemImage: "cart", action: addToCart)
    .buttonStyle(.borderedProminent)   // or .glassProminent (iOS 26)
    .controlSize(.large)
    .tint(.accentColor)
Button("Delete", role: .destructive, action: delete)
```
Types: `Button`, `ButtonRole`, `ButtonStyle`/`PrimitiveButtonStyle`, `.buttonStyle(_:)`, `.controlSize(_:)`, `.buttonBorderShape(_:)`, `GlassButtonStyle`. UIKit: `UIButton`.

---

## Pop-up buttons

**Purpose** — Present a **flat list of mutually exclusive options/states**; button updates to show the current selection.
**Applicability** — Space-limited choice among values (not commands). Use pull-down instead if you need actions, multi-select, or submenus.

**Variants / states** — Collapsed button (shows current or default selection) → tap opens menu → menu closes on pick, label updates. Always provide a useful default; give an intro label so people can predict options.
**iPadOS** — In a popover/modal list row, prefer a pop-up button over a disclosure indicator for a small, well-defined option set.

### Do / Don't
- Do: pick a meaningful default that reflects likely choice.
- Do: add a "Custom…" item for occasional extra values; explanatory text can sit below the list.
- Don't: use for commands/actions — that's a pull-down.

### Liquid Glass
In toolbars the pop-up adopts the toolbar's Liquid Glass; in content it stays a flat control.

### SwiftUI mapping
```swift
Picker("Sort", selection: $sortField) {
    Text("Name").tag(SortField.name)
    Text("Date").tag(SortField.date)
}
.pickerStyle(.menu)   // pop-up button appearance
```
Types: `Picker` + `.pickerStyle(.menu)` (a.k.a. `MenuPickerStyle`). UIKit: `UIButton` with `changesSelectionAsPrimaryAction = true`. AppKit: `NSPopUpButton`.

---

## Pull-down buttons

**Purpose** — Menu of **items/actions** directly related to the button's purpose; performs the chosen action (button label doesn't change to the pick).
**Applicability** — A cluster of related commands (Add▾, Sort▾, Back▾), or a "More" (ellipsis) button for secondary actions.

**Variants / states** — Standard label+chevron, or icon-only (e.g. `ellipsis.circle`). iOS/iPadOS can also open the menu via touch-and-hold on a button.
**Length** — Aim for ≥ 3 items to feel worthwhile; if only 1–2, use plain buttons/toggles instead. Don't dump all of a view's actions here.

### Do / Don't
- Do: mark destructive items red; on selection the system shows a confirming action sheet (iOS) / popover (iPadOS).
- Do: add SF Symbols after item labels when they add meaning.
- Don't: hide primary/discoverable actions behind a pull-down; don't over-rely on ellipsis "More" (hurts discoverability).

### SwiftUI mapping
```swift
Menu("Add") {
    Button("New Folder", systemImage: "folder.badge.plus", action: newFolder)
    Button("Import…", systemImage: "square.and.arrow.down", action: importItems)
}
// Icon-only "More":
Menu { … } label: { Image(systemName: "ellipsis.circle") }
```
Types: `Menu` (pull-down). For a primary-action button that also carries a menu: `.menuIndicator`, or UIKit `showsMenuAsPrimaryAction`. AppKit: `NSPopUpButton(pullsDown: true)`. See `components-presentation.md` for `Menu`/context menus.

---

## Toggles (switch)

**Purpose** — Choose between two opposing states (on/off).
**Applicability** — Managing state. For choosing among items use a pop-up; for >2 mutually exclusive options use a segmented control or (macOS) radio buttons.

### Variants
| Style | iOS/iPadOS use | SwiftUI |
|---|---|---|
| Switch | **List rows only** — the row's content is the label | `.toggleStyle(.switch)` |
| Button-toggle | Outside lists — an icon button that changes background when active (e.g. Phone call filter, blue when on) | `.toggleStyle(.button)` |
| Checkbox / radio | macOS only (hierarchies / mutually exclusive sets) | `.toggleStyle(.checkbox)` (macOS) |

### Sizes / states
On / off / (macOS) mixed. Default switch tint is green — change only if needed, and only to a color with enough contrast vs. the off state. macOS grouped forms can use `.controlSize(.mini)` switches for subordinate rows.

### Do / Don't
- Do: make the on/off difference obvious beyond color (fill/shape/checkmark) — not everyone perceives hue.
- Do: rely on the row/context for the label with the switch style (no separate label needed).
- Don't: use a switch outside a list on iOS — use a button-toggle instead.

### SwiftUI mapping
```swift
Toggle("Wi-Fi", isOn: $wifiOn)
    .toggleStyle(.switch)      // default in a List row
Toggle(isOn: $isFlagged) { Label("Flag", systemImage: "flag.fill") }
    .toggleStyle(.button)      // button-toggle outside lists
```
Types: `Toggle`, `ToggleStyle` (`.switch`, `.button`, `.automatic`; macOS `.checkbox`). UIKit: `UISwitch`.

---

## Sliders

**Purpose** — Adjust a continuous value between min and max via a draggable thumb; track fills from min to thumb.
**Applicability** — Continuous ranges (brightness, size). Not audio volume on iOS — use the system volume view (HIG).

**Variants / states** — Horizontal (iOS/iPadOS): min on leading, max on trailing. Optional min/max icons flanking the track. macOS adds tick marks + circular sliders; iOS has no tick-mark slider. States: normal · dragging (live-update the bound value) · disabled.

### Do / Don't
- Do: keep familiar direction (leading = min, trailing = max; bottom = min for vertical).
- Do: for wide ranges, pair with a text field (exact value) and/or stepper (whole increments).
- Don't: use for volume on iOS.

### SwiftUI mapping
```swift
Slider(value: $brightness, in: 0...1) {
    Text("Brightness")
} minimumValueLabel: { Image(systemName: "sun.min") }
  maximumValueLabel: { Image(systemName: "sun.max") }
// Discrete: Slider(value:in:step:)
```
Types: `Slider` (`value`, `in:`, `step:`, min/max value labels). UIKit: `UISlider`.

---

## Steppers

**Purpose** — Increment/decrement a value in fixed steps via a two-segment −/＋ control. The stepper itself shows no value.
**Applicability** — Small, precise changes (copies, quantity). Pair with a text field when large jumps are likely.

**Variants / states** — Bound to a value+range+step, or driven by explicit `onIncrement`/`onDecrement` closures. Buttons disable at range bounds. macOS supports Shift-click for ×10 jumps (not iOS).

### Do / Don't
- Do: make the affected value obvious (put a label/field next to it — the stepper is silent).
- Do: pair with a `TextField` for wide-ranging values.
- Don't: rely on a stepper alone for large ranges.

### SwiftUI mapping
```swift
Stepper("Copies: \(count)", value: $count, in: 1...99)
Stepper("Zoom", onIncrement: zoomIn, onDecrement: zoomOut)
```
Types: `Stepper` (`value:in:step:`, or `onIncrement:onDecrement:`). UIKit: `UIStepper`.

---

## Pickers

**Purpose** — Choose from one or more scrollable lists of distinct values (incl. dates/times).
**Applicability** — Medium-to-long value lists. Short list → pull-down button; very large list → List/Table (adjustable height, index).

### Value-picker styles — `.pickerStyle`
| Style | Appearance | When |
|---|---|---|
| `.automatic` | System default for context | Default |
| `.menu` | Pop-up button (current selection + menu) | Compact, flat mutually-exclusive set |
| `.segmented` | Inline segmented control | 2–~5 options, always visible |
| `.wheel` | Spinning wheel(s) | In-context multi/long value entry |
| `.inline` | Rows rendered inline in a List/Form | Show all options in place |
| `.navigationLink` | Row pushes a selection screen | Long lists (also watchOS) |
| `.palette` | Compact row of selectable items | Emoji/quick sets (convention) |

Place a picker in context (below/near the edited field, bottom of view, or a popover) — don't switch views to show one.

### Date pickers (iOS/iPadOS)
Styles: **Compact** (button → modal calendar/time editor; use when space is tight; shows value in accent color), **Inline** (inline calendar, or wheels for time-only), **Wheels**, **Automatic**.
Modes: Date · Time · Date & Time · Countdown timer (max 23h59m; not in inline/compact).
Minute granularity: default 60 values; may use any interval dividing 60 (e.g. 15).

### Do / Don't
- Do: use predictable, logically ordered values (alphabetized, chronological).
- Don't: use a wheel for a tiny list (too much visual weight) — use `.menu` or a pull-down.

### SwiftUI mapping
```swift
Picker("Color", selection: $color) {
    ForEach(Palette.allCases) { Text($0.name).tag($0) }
}
.pickerStyle(.wheel)   // or .menu / .segmented / .inline / .navigationLink

DatePicker("Date", selection: $date, displayedComponents: [.date])
    .datePickerStyle(.compact)   // or .wheel / .graphical
```
Types: `Picker`, `PickerStyle`, `DatePicker`, `DatePickerStyle` (`.compact`, `.wheel`, `.graphical`, `.automatic`). UIKit: `UIPickerView`, `UIDatePicker`. (Exact `.pickerStyle` case set beyond `.menu`/`.segmented`/`.wheel`/`.inline` is well-known convention; source explicitly names `MenuPickerStyle`, `segmented`, `wheels`, `navigationLink`.)

---

## Segmented controls

**Purpose** — Linear set of 2+ equal-width segments, each a button; single choice (iOS/iPadOS) among closely related options or subviews.
**Applicability** — Switch between related subviews (e.g. Event/Reminder in Calendar's sheet), or filter/scope. For switching whole app sections use a **Tab bar** (`components-navigation.md`), not a segmented control.

**Variants / states** — Text OR image per segment (don't mix within one control). Selected vs. unselected segment; disabled. macOS additionally supports multi-select and momentary (action) segments.

### Sizes / limits
Keep segments equal width; keep icon/title widths similar. Limit count: ≤ ~5 on iPhone, ≤ ~5–7 in wider layouts.

### Do / Don't
- Do: use noun/noun-phrase, title-case labels; no intro text needed for text segments.
- Don't: mix text and icons in one control; don't mix selection segments with action segments.

### SwiftUI mapping
```swift
Picker("Scope", selection: $scope) {
    Text("Event").tag(Scope.event)
    Text("Reminder").tag(Scope.reminder)
}
.pickerStyle(.segmented)
```
Types: `Picker` + `.pickerStyle(.segmented)`. UIKit: `UISegmentedControl` (`isMomentary` for action mode).

---

## Text fields

**Purpose** — Enter/edit a small, specific piece of text (name, email). For long text use `TextEditor` / Text view.
**Applicability** — Single-line-ish input. Secure input → `SecureField`.

**Variants / states** — Placeholder (hint) vs. entered text; focused/editing; disabled; error/validation. Styles via `.textFieldStyle`: `.automatic`, `.plain`, `.roundedBorder`. iOS clear button, leading/trailing accessory images/buttons.

### Sizes / behavior
- Match field width to expected input length; stack multiple fields vertically with consistent widths and even spacing.
- Ensure logical tab order (system usually handles it).
- Show the right keyboard: `.keyboardType(_:)`; format numbers with `.formatter`/`format:`. See `inputs.md` for keyboards.
- Line-break handling: clip (default), wrap, or truncate (leading/middle/trailing).

### Do / Don't
- Do: add a persistent label beside/above the field (placeholder disappears on typing).
- Do: validate at the right moment (email → on field-exit; new password → before leaving).
- Do: use `SecureField` for passwords/sensitive data.
- Don't: assume locale-independent number/currency formatting.

### SwiftUI mapping
```swift
TextField("Email", text: $email)
    .textFieldStyle(.roundedBorder)
    .keyboardType(.emailAddress)
    .textContentType(.emailAddress)
SecureField("Password", text: $password)
TextField("Amount", value: $amount, format: .currency(code: "USD"))
```
Types: `TextField`, `SecureField`, `TextFieldStyle` (`.automatic`/`.plain`/`.roundedBorder`), `TextEditor` (multiline). UIKit: `UITextField`.

---

## Color wells

**Purpose** — Let people pick a color; opens the system color picker (or a custom one).
**Applicability** — iOS, iPadOS, macOS, visionOS (not tvOS/watchOS).

**Variants / states** — Swatch shows current color → tap opens picker → swatch updates. macOS adds active highlight + drag-and-drop between wells and from the picker.

### Do / Don't
- Do: prefer the system picker for a familiar, cross-platform experience (shared saved colors).
- Do: disable opacity when alpha is irrelevant.

### SwiftUI mapping
```swift
ColorPicker("Fill", selection: $color, supportsOpacity: false)
```
Types: `ColorPicker` (renders as a color well; opens system picker). UIKit: `UIColorWell` / `UIColorPickerViewController`.

---

## macOS-/tvOS-only siblings (know when NOT to use on iOS/iPadOS)

| Control | What it is | Platforms | SwiftUI/API | iOS/iPadOS substitute |
|---|---|---|---|---|
| **Combo box** | Text field + pull-down of predefined values; user may type a custom value (not added to list) | **macOS only** | `NSComboBox` | `TextField` + `Menu`/`Picker(.menu)`, or a searchable list |
| **Image well** | Editable image view; copy/paste/delete, drag a new image in | **macOS only** | `NSImageView` | Custom image + `PhotosPicker`/drag-drop |
| **Digit entry view** | Full-screen PIN/passcode entry with digit keyboard; use secure (asterisk) fields | **tvOS only** | `TVDigitEntryViewController` | `SecureField` (numeric keyboard) or custom OTP field |

On iPad, don't reach for combo/image wells or digit-entry views — they don't exist there; use the substitutes above.

---

## Quick SwiftUI cheat-sheet
| Design element | SwiftUI | Key style/modifier |
|---|---|---|
| Action button | `Button` | `.buttonStyle(.borderedProminent/.glass/.glassProminent)`, `.controlSize`, `role:` |
| Pop-up (choose value) | `Picker` | `.pickerStyle(.menu)` |
| Pull-down (choose command) | `Menu` | — |
| On/off | `Toggle` | `.toggleStyle(.switch/.button)` |
| Continuous value | `Slider` | `in:`, `step:` |
| Increment value | `Stepper` | `value:in:step:` |
| Value list | `Picker` | `.pickerStyle(.wheel/.inline/.navigationLink)` |
| Segmented choice | `Picker` | `.pickerStyle(.segmented)` |
| Date/time | `DatePicker` | `.datePickerStyle(.compact/.wheel/.graphical)` |
| Text entry | `TextField` / `SecureField` | `.textFieldStyle(.roundedBorder)` |
| Color | `ColorPicker` | `supportsOpacity:` |
