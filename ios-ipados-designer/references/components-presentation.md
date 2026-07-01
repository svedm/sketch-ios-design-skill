# Components — Presentation, Modality & Actions

Reference for the AI agent: which modal/action surface to design in Sketch and the exact SwiftUI element + modifiers to reach for, current to iOS 26 / Liquid Glass. See also `patterns.md` (modality flow), `components-navigation.md` (toolbars/menus source), `liquid-glass.md` (material rules), `swiftui-catalog.md`.

## Pick the modality (decision table)

| Need | Use | SwiftUI anchor |
| --- | --- | --- |
| Critical info / must act now, blocks everything | **Alert** | `.alert(_:isPresented:actions:message:)` |
| Choices tied to an intentional action (incl. destructive) | **Confirmation dialog** (was "action sheet") | `.confirmationDialog(_:isPresented:titleVisibility:actions:)` |
| Scoped task related to current context; forms, input | **Sheet** | `.sheet(isPresented:)` / `.sheet(item:)` |
| Small transient info/controls anchored to a control (wide views) | **Popover** | `.popover(isPresented:attachmentAnchor:arrowEdge:content:)` |
| A menu of commands revealed on demand | **Menu** | `Menu { … } label: { … }` |
| Frequently-used actions for a specific item, hidden until invoked | **Context menu** | `.contextMenu { … }` |
| Edit commands on a selection (Copy/Look Up/Translate) | **Edit menu** (system) | `UIEditMenuInteraction` (UIKit); system-provided in text views |
| Share the current item/page | **Activity view / share sheet** | `ShareLink(item:)` (preferred) |
| In-depth media / multistep task | **Full-screen cover** | `.fullScreenCover(isPresented:)` |

Rules that cut across all of these:
- **One modal at a time.** Dismiss the current one before showing another. Only an alert may appear over another modal — and never two alerts at once.
- **Always give an obvious dismiss.** iOS/iPadOS: top-toolbar button or swipe-down. Confirm before dismissing if unsaved user content exists.
- **Liquid Glass:** sheets, popovers, alerts, menus, and confirmation dialogs are Liquid Glass surfaces in iOS 26 — the system renders them automatically. Don't rebuild these in a custom material. Use the **regular** glass variant (its default) for text-heavy surfaces like alerts, popovers, sidebars; use **clear** only for controls floating over media. See `liquid-glass.md`.

---

## Sheets

Scoped task closely related to the current context (attach a file, pick a location, compose). Modal or nonmodal in iOS/iPadOS.

**SwiftUI**
- Present: `.sheet(isPresented: $flag) { SheetView() }` or, for identified data, `.sheet(item: $selected) { item in … }` (auto-dismisses when `item == nil`).
- Detents: `.presentationDetents([.medium, .large])` — sheet rests at each; `PresentationDetent` cases include `.medium` (≈ half of full height), `.large` (full height), plus `.fraction(_)` and `.height(_)` for custom rests and `.custom(_)` for a custom type. Programmatic control: `.presentationDetents(_, selection: $detent)`.
- Grabber: `.presentationDragIndicator(.visible)`.
- Glass/edge: keep default background so the Liquid Glass sheet material and scroll edge effect render; avoid forcing an opaque background. `.presentationBackground(_)` only when you truly need to override (convention).
- Full-screen variant: `.fullScreenCover(isPresented:)` for media/multistep editing.
- iPad sizing: page/form-sheet default sizing is the system default for `.sheet` in a regular width; avoid forcing a giant custom size.

**Buttons / anatomy (iOS/iPadOS)**
- Single-view sheet: **Cancel/Close** on the leading edge of the top toolbar; **Done** on the trailing edge (place with `.toolbar { ToolbarItem(placement: .cancellationAction / .confirmationAction) }`).
- **Back** navigates a step; it does not dismiss. Never show Cancel + Done + Back together.
- Pair Done with a Cancel/Back — don't ship Done as the only exit.

**Detent guidance**
- Sheet supports `.large` automatically; add `.medium` for progressive disclosure (e.g. share-style content). Specify only `.medium` to cap it below full height.
- Skip `.medium` when content needs full height (compose in Mail/Messages = full height only).
- Include a drag indicator on any resizable sheet — it signals resizability, cycles detents on tap, and drives VoiceOver resize.

**Do / Don't**
- Do support swipe-to-dismiss; confirm via a confirmation dialog if there are unsaved edits.
- Do show only one sheet from the main interface at a time.
- Don't stack a sheet from a sheet — close the first, then present the second.
- Don't use a sheet for a long/complex flow — prefer full-screen cover or (iPad) a separate window.

---

## Alerts

Critical, time-sensitive info requiring a response. Modal, appears above all content. Up to **three** buttons; optional informative text; iOS/iPadOS may include a text field.

**SwiftUI**
```swift
.alert("Unable to Save", isPresented: $showAlert) {
    Button("Try Again") { save() }
    Button("Delete", role: .destructive) { discard() }
    Button("Cancel", role: .cancel) { }
} message: { Text("The connection to the server was lost.") }
```
- Text field / secure input: add a `TextField`/`SecureField` inside the `actions` closure (iOS/iPadOS).
- `role: .destructive` renders the destructive style; `role: .cancel` renders the Cancel affordance.

**Content & buttons**
- Title: succinct, describes the situation. Avoid "Error 329347". Sentence fragment → title-case, no ending period; full sentence → sentence case + punctuation.
- Button titles: 1–2 words, verb-first ("View All", "Erase", "Delete"). Use **OK only for purely informational** alerts; avoid Yes/No.
- Placement: default/most-likely button on the trailing side of a row (top of a stack); Cancel leading (bottom of stack).
- Use the destructive style only for a destructive action the user **didn't** deliberately choose. Always pair a destructive action with **Cancel**. Don't make Cancel the default.

**Do / Don't**
- Do use sparingly — every alert must be actionable.
- Don't use an alert merely to inform (surface it inline instead), and don't show one at app launch.
- Don't alert for common, undoable destructive actions (deleting an email).
- Don't let alert text scroll — keep titles short, messages brief.

---

## Confirmation dialogs (formerly "action sheets")

Choices related to an intentional action the user initiated (e.g. after tapping Delete or canceling a compose). In SwiftUI this is one API across platforms; on iPhone it slides up from the bottom, on iPad/regular width it presents as a popover.

**SwiftUI**
```swift
.confirmationDialog("Discard draft?", isPresented: $show, titleVisibility: .visible) {
    Button("Delete Draft", role: .destructive) { delete() }
    Button("Save Draft") { save() }
    // Cancel is added automatically
}
```
- A Cancel button is included by default. `role: .destructive` puts the destructive item in the prominent position.
- `titleVisibility: .automatic/.visible/.hidden` controls the title row.

**Do / Don't**
- Do use this — not an alert — to offer choices for an intentional action; use this — not a Menu — when the choice results from an action (a Menu appears when the user *chooses to reveal it*).
- Do keep the title to one line; add a message only if the title + context aren't enough.
- Do place destructive choices at the top (prominent); Cancel at the bottom.
- Don't let it scroll — few buttons; scrolling risks mis-taps.

---

## Popovers

Transient view above content, anchored with an arrow to the control that opened it. Small amount of info/functionality; a few related tasks.

**SwiftUI**
```swift
.popover(isPresented: $show, attachmentAnchor: .rect(.bounds), arrowEdge: .top) {
    PopoverContent()
}
```
- **iPad adaptivity:** popovers are for **regular width (wide) views only.** In compact width (iPhone, narrow multitasking) SwiftUI automatically adapts a popover to a sheet — design a sheet fallback. Force behavior with `.presentationCompactAdaptation(_)` when needed (convention).
- Sizing: `.presentationDetents` also applies to the adapted sheet; size the popover only as big as its content — the system may shrink to fit.
- Glass: renders on regular Liquid Glass; keep the default background.

**Do / Don't**
- Do point the arrow directly at the triggering element; don't cover that element or essential content.
- Do dismiss on outside tap/selection; keep open for multi-select until explicit dismiss. Always save work when a nonmodal popover auto-closes.
- Do let a single tap close one popover and open another (bar buttons).
- Don't show a popover over a popover, or anything except an alert on top of a popover.
- Don't use a popover for a warning — use an alert.

---

## Panels

macOS-only floating auxiliary window (inspectors, Fonts, Colors, HUD-style). **Not supported in iOS/iPadOS.**

**For iPad**, present the equivalent supplementary content as a nonmodal **sheet**, a **popover** (regular width), or a **split-view** inspector pane instead. AppKit anchor: `NSPanel` (macOS). No SwiftUI iOS anchor.

---

## Menus

Space-efficient reveal of commands/options. Reusable across pull-down buttons, toolbar overflow, and standalone triggers.

**SwiftUI**
```swift
Menu {
    Button("Duplicate", action: duplicate)
    Button("Rename", action: rename)
    Button("Delete…", role: .destructive, action: delete)
    Menu("Copy") { Button("Copy", action: copy) }   // submenu — keep to 1 level
} label: {
    Label("Actions", systemImage: "ellipsis.circle")
}
```
- **Primary action** variant: `Menu(…) { … } label: { … } primaryAction: { addBookmark() }` — tap fires the action, long-press/indicator reveals the menu.
- Item subtitles: give a `Button` two `Text` views (title, then subtitle) — only works inside a menu.
- Style: `.menuStyle(_)`.

**Labels / organization**
- Verb or verb phrase; **title-style capitalization**; drop articles (a/an/the). Append **…** when the action needs more info before completing.
- Group logically related items with separators (`Divider()` or `Section`); list important items first.
- Toggled item: one changeable label (Show Map ↔ Hide Map) or a checkmark for an in-effect attribute. Unavailable items dim; the menu itself stays available.
- Icons: use `Label(_, systemImage:)`; represent common actions with standard SF Symbols; all-or-none icons within a group.

**iOS/iPadOS layouts** (`preferredElementSize`, UIKit): **Large** (default, full list), **Medium** (3 icon+label items across the top), **Small** (4 icon-only items across the top, e.g. Bold/Italic/Underline/Strikethrough).

---

## Context menus

Actions for a specific item, hidden until invoked (touch-and-hold; Control-click / secondary click with trackpad on iPad). Optional graphical preview.

**SwiftUI**
```swift
Text("Turtle Rock")
    .contextMenu {
        Button { addFavorite() } label: { Label("Add to Favorites", systemImage: "heart") }
        Button(role: .destructive) { remove() } label: { Label("Delete", systemImage: "trash") }
    }
// with preview:
.contextMenu { … } preview: { PreviewView() }
```

**Do / Don't**
- Do keep it short and relevant (frequently used, current-context commands); support it consistently across the app.
- Do also expose every context-menu action elsewhere in the main UI (toolbar, etc.).
- Do put destructive items **last** and mark them `role: .destructive` (system renders red).
- Do match the preview's clipping path (corner radius) to the content so the emerge animation looks clean.
- Don't provide both a context menu and an edit menu for the same item.
- Don't dim unavailable items — hide them; don't show keyboard shortcuts here.

---

## Edit menus

System edit commands on a selection (Copy, Cut, Paste, Select, Look Up, Translate, plus data-detected actions like *Get Directions*). Prefer the **system-provided** menu.

- iOS: compact horizontal bar on touch-and-hold / double-tap; a trailing chevron expands into a context menu.
- iPadOS: compact bar via touch; opens directly as a context menu via keyboard/pointer — support both styles.
- SwiftUI: the edit menu appears automatically in `TextField`/`TextEditor`/`Text` (selectable). Custom targets/commands: `UIEditMenuInteraction` + `UIResponderStandardEditActions` (UIKit). Reposition (not reshape) if it would cover key content.
- Let people select and copy noneditable content text (captions, statuses) where it makes sense; support undo/redo. Don't duplicate edit-menu commands as separate controls.

---

## Activity views (share sheet)

Share/actions surface (Messages, Copy, Print, AirDrop, app-specific actions). Presents as a sheet or popover depending on device/orientation.

**SwiftUI — prefer `ShareLink`**
```swift
ShareLink(item: url)                         // system-standard button
ShareLink("Share URL", item: url)            // custom title
ShareLink(item: photo, subject: Text("Cool Photo"),
          message: Text("Check it out!"),
          preview: SharePreview(photo.caption, image: photo.image))
```
- Shareable content must be `Transferable` (URL/String conform already; provide a `SharePreview` for custom types — appears immediately and skips network metadata fetch).
- Add a `FileRepresentation` to the type if file-only services (Mail/Notes/AirDrop) don't appear.
- Custom `Label` for a bespoke share button; place in `.toolbar` for a standard Share affordance.

**Do / Don't**
- Do trigger the activity view from the standard **Share** control; use a symbol for any custom activity (custom interface icon centered in ~70×70 px area).
- Do give custom activities a succinct verb-phrase title ("Print Transaction"); exclude system activities that don't apply.
- Don't duplicate a system action (a second Print) without a clearly distinct custom title.

---

## Windows / scenes

Multi-window is **iPadOS + macOS** (not iPhone). iPadOS presents windows full-screen or windowed (user choice in Multitasking settings; system remembers size/placement).

**SwiftUI**
- Define scenes with `WindowGroup { RootView() }` in the `App`. Open on demand with the `openWindow` environment action (`OpenWindowAction`).
- iPad windowed mode places **window controls at the leading edge of the toolbar** — inset your own leading toolbar items so they aren't hidden. Ensure layouts adapt fluidly across sizes (see `platform-ios-ipados.md`, `metrics.md`).

**Do / Don't**
- Do open a new window to help multitasking / preserve context (Compose alongside an open message); offer "Open in New Window" via context menu or File menu.
- Don't open new windows as default behavior — it creates clutter.
- Don't build custom window chrome; use the term "window" (not "scene") in user-facing copy.

---

## Ornaments (note)

**visionOS-only.** A floating bar of controls/info anchored to a window edge (system toolbars/tab bars render as ornaments). **Not supported in iOS/iPadOS** — ignore for iPhone/iPad designs. SwiftUI: `.ornament(visibility:attachmentAnchor:contentAlignment:ornament:)`. Mentioned only so the agent doesn't mistake it for an iPad surface — for iPad "floating controls" use a toolbar or a Liquid Glass control cluster instead (see `components-navigation.md`).

---

## Home Screen quick actions

Menu of app-specific actions from the Home Screen (touch-and-hold the app icon). iOS/iPadOS only.

- Up to **four** app-specific actions; each has a title, an interface icon (leading or trailing depending on icon position), and an optional subtitle. Left-aligned in LTR. Can update dynamically.
- Titles: succinct, instantly communicate the result ("Directions Home", "New Message"); no app name; keep short to avoid truncation; localize.
- Icons: prefer **SF Symbols** / standard action icons; custom icons use the Quick Action Icon Template from Apple Design Resources. **No emoji** (symbols are monochrome and adapt to Dark Mode).
- Anchor: `UIApplicationShortcutItem` (UIKit; static in Info.plist or dynamic at runtime). No dedicated SwiftUI type.
</content>
</invoke>
