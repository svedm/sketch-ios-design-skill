# Patterns

How to compose iOS/iPadOS flows — the pattern layer that ties components together, each with the exact SwiftUI hook to reach for. See also `components-presentation.md` (sheets/alerts), `inputs.md`, `platform-ios-ipados.md`, `swiftui-catalog.md`, `mapping.md`.

Cross-cutting Liquid Glass note: bars, toolbars, and sheets now float on Liquid Glass by default; content scrolls under them behind a scroll edge effect. Design flows so the primary content owns the full screen and controls ride the glass layer — don't paint opaque bar backgrounds. Details in `liquid-glass.md`, `foundations.md`.

---

## Modality — the decision (high priority)

**What:** A dedicated mode that blocks the parent view and needs an explicit dismiss. Use only when there's a clear benefit: deliver critical info, confirm/modify the last action, run a short self-contained task, or give an immersive/focused experience.

**Decision table**

| Need | Use | SwiftUI |
|---|---|---|
| Critical info / must act | Alert | `.alert(_:isPresented:)` |
| Confirm/modify last action, few options | Confirmation dialog (action sheet) | `.confirmationDialog(_:isPresented:)` |
| Short, self-contained task | Sheet | `.sheet(isPresented:)` / `.sheet(item:)` |
| Options tied to a control/origin (iPad) | Popover | `.popover(isPresented:)` |
| In-depth content, immersive, multistep edit | Full-screen cover | `.fullScreenCover(isPresented:)` / `.fullScreenCover(item:)` |
| Distinct doc/task, iPad | Separate window/scene | new `WindowGroup` scene |

**Guidance**
- Present modally only with clear benefit; keep the task simple, short, streamlined.
- Avoid an "app within your app" — no deep hierarchy of modal subviews; give a single path through and no buttons that could be mistaken for dismiss.
- Always give an obvious dismiss. iOS/iPadOS convention: a button in the top toolbar **and** swipe-down.
- Confirm before closing if user-generated content would be lost (e.g. action sheet with a Save option).
- Title the modal to name its task; add descriptive text if helpful.
- Dismiss one modal before showing another — no stacking. Exception: an alert may appear above everything, but never show two alerts at once.
- Prefer resizable sheet detents (`.presentationDetents([.medium, .large])`) so a sheet can stay partly non-modal / show context; see `components-presentation.md`.

---

## Onboarding (high priority)

**What:** Optional, fast, fun way to get started. Runs *after* Launching completes — it is not the launch experience.

**Guidance**
- Teach through interactivity — let people perform the action, not just read about it.
- Prefer a set of contextual tips over one upfront flow → **TipKit** (`TipView`, `popoverTip`).
- Keep any prerequisite flow brief; don't force memorization. If a full tutorial exists, make it skippable and re-findable later (help/account/settings) — don't re-show on later launches.
- Keep content about *your* app, not how to use the system/device.
- Postpone nonessential setup/customization; ship good defaults so people start immediately.
- Fold a permission request into onboarding only when core function needs the data first — it's the chance to explain *why*; otherwise request at first use (see `inputs.md`, privacy).
- Let people experience the app before prompting for ratings or purchases.
- Splash screen (if any): brief, glanceable, shown at the *start of onboarding* — not the launch screen.

**Components / SwiftUI:** `TipKit`; a `TabView(.page)` walkthrough (convention); `Button`; Sign in with Apple button (see Managing accounts). Gate first-run with an `@AppStorage("didOnboard")` flag (convention).

---

## Loading (high priority)

**What:** Best loading finishes before people notice. When it can't, show progress without blocking the app.

**Guidance**
- Show something ASAP — placeholder text/graphics/animation, replaced as content arrives. A blank wait reads as "broken."
- Let people do other things while content loads (load in background).
- Long unavoidable load → show something interesting (tips, hints, new features); estimate remaining time so filler isn't too short/looped.
- Determinate progress when you know duration; indeterminate when you don't (see `components-status-system.md`).
- Download large assets in background (Background Assets framework) to speed install/launch.
- Games may use a custom loading view; standard indicators fit most apps.

**Components / SwiftUI**
- Spinner / bar: `ProgressView()` (indeterminate) · `ProgressView(value:total:)` (determinate).
- Async image with placeholder: `AsyncImage(url:) { phase in … }`.
- Skeleton placeholder: `.redacted(reason: .placeholder)` on real views (convention for skeletons).
- Pull-to-refresh: `.refreshable { await load() }` on `List`/`ScrollView`.
- Lazy loading for long content: `LazyVStack`/`LazyVGrid` inside `ScrollView`.

---

## Entering data (high priority)

**What:** Make supplying info easy and error-resistant. Pre-gather what you can; support every input method.

**Guidance**
- Get info from the system whenever possible (settings, permissioned location/calendar) — don't ask for what you can gather.
- Be clear about the data: placeholder (`"username@company.com"`) or a leading label ("Email"); prefill reasonable defaults.
- Secure input for sensitive data → **`SecureField`** (dots per char). Never prepopulate a password; ask each time or use biometric/keychain (see Managing accounts).
- Offer choices over typing when you can — picker / menu / selection control.
- Let people drag-and-drop or paste data in.
- Validate dynamically; give feedback as soon as a problem is detected. Numeric → attach a formatter (accepts only numbers, can render %, currency, decimals).
- If data is required to proceed, keep Next/Continue disabled until it's supplied.

**Components / SwiftUI**
- Group inputs in **`Form`** with `Section`s (grouped list styling, labels, footers).
- `TextField(_:text:)`, `.textFieldStyle(...)`, `.keyboardType(...)`, `.textContentType(...)`, `.submitLabel(...)`.
- `TextField(value:format:)` for formatted/numeric entry.
- `SecureField`, `TextEditor` (multiline), `Picker`, `DatePicker`, `Stepper`, `Toggle`.
- `.disabled(!isValid)` on the continue button; `@FocusState` to drive focus and validation.

---

## Settings (high priority)

**What:** Customization split across three homes: task-level, in-app settings area, and the system Settings app.

**Where does a setting go?**

| Setting kind | Home | Notes |
|---|---|---|
| Affects only the current task (show/hide, sort, filter, reorder) | In the screen it affects | Discoverable & in-context; don't bury in a settings area |
| General, infrequently changed (appearance, save behavior, account, keymaps) | Custom in-app settings area | User must suspend their task to reach it — so only rarely-changed items |
| Rarely-changed + system-integration (permissions, notifications, Siri, Search) | System Settings app | Add only the most rarely changed; offer a button that jumps there |

**Guidance**
- Ship defaults that give the best experience to the most people — many should never need to change anything.
- Minimize the number of settings; too many feels unapproachable and hides the one they want.
- Respect systemwide settings; never duplicate global options (accessibility, scrolling, auth) inside your app — it implies system settings may not apply.
- Detect state instead of asking (Dark Mode, connected controller).

**Components / SwiftUI:** persist with `@AppStorage` / `UserDefaults`. Build the in-app screen as a `Form` of `Section`s (`NavigationLink` rows, `Toggle`, `Picker`). Jump to system settings via a `Link`/`Button` opening `UIApplication.openSettingsURLString` (convention). (`Settings` scene is macOS-only.)

---

## Feedback (high priority)

**What:** Tell people what's happening, what they can do next, results of actions, and how to avoid mistakes. Match delivery weight to significance.

**Guidance**
- Passive status for low-urgency info integrated near the item it describes (e.g. Mail's unread count + "Updated…" in the toolbar) — no action needed to see it.
- Alerts only for critical, ideally actionable info; overuse dilutes them (see `components-presentation.md`).
- Warn before *unexpected, irreversible* data loss — but not when the loss is the expected result (deleting a file people asked to delete).
- Confirm significant, important completions (e.g. Apple Pay). People assume success, so mainly signal failure.
- Show when a command can't run and why.
- Make feedback multi-channel & accessible: color + text + sound + haptics so it lands whether muted, looking away, or on VoiceOver.

**Components / SwiftUI**
- `.alert`, `.confirmationDialog`.
- Inline status via `Label`, `Text`, badges (`.badge(...)`), `ProgressView`.
- Haptics: `.sensoryFeedback(_:trigger:)` (convention for SwiftUI haptics).
- Transient in-context tips: TipKit.

---

## Charting data

**What:** Communicate complex info visually; range from glanceable graphic to interactive centerpiece. Not every dataset needs a chart — a searchable/sortable list/table may be better.

**Guidance**
- Use a chart to highlight the important takeaway; charts draw attention.
- Keep it simple; reveal detail progressively (levels, subsets) rather than cramming.
- Prefer common types (bar, line) — people already know how to read them; teach novel types.
- Add descriptive titles/subtitles/annotations and a plain-language headline (Weather-style summary).
- Make every chart accessible: labels describing values/components + interactive accessibility elements. A headline is not a substitute for labels.
- Keep type/color/annotations consistent across related charts; size the chart to its detail & interactivity.

**Components / SwiftUI:** **Swift Charts** — `Chart { BarMark/LineMark/PointMark/AreaMark … }`, `.chartXAxis`, `.chartLegend`, `.chartOverlay` for interaction. See `components-content.md` (Charts).

---

## Collaboration & sharing

**What:** Share content or start a live collaboration through the system share sheet / sharing popover and Messages integration (CloudKit, iCloud Drive, or custom + universal links).

**Guidance**
- Put the **Share** button somewhere convenient (toolbar). The share sheet/popover sets file-sharing method and permissions.
- Customize the sheet to your supported sharing types; "send copy" is auto-detected for multiple items / default on iCloud Drive.
- Write succinct permission phrases ("Only invited people can edit"); keep custom sharing options minimal and grouped.
- Show the **Collaboration** button as soon as collaboration starts, next to Share — it identifies who's sharing.
- Collaboration popover = 3 sections (people/comms · your custom items · manage). Keep custom actions to essentials.
- Optionally post collaboration events to Messages with a universal link back into your app.

**Components / SwiftUI:** **`ShareLink(item:)`** presents the system share sheet (also the watchOS path). CloudKit sharing provides a management view.

---

## Drag and drop

**What:** Move or duplicate a selection from a source to a destination — same container, another container, or another app. Same-container drop = move; cross-container / cross-app = copy.

**Guidance**
- Support it broadly; system text fields/views get it for free. Always offer non-drag alternatives (menu copy/move) and accessibility descriptors.
- Pick move vs copy by what people expect; default to the least-surprising, least-data-loss option. Option key at drop time forces copy within a container.
- Support multi-item drag; on iPad allow adding items to an in-progress drag (flocking).
- Prefer allowing undo of a drop; confirm irreversible drops.
- Offer multiple representations high→low fidelity so the destination takes the richest it can.
- Feedback: show a translucent drag image after ~3 pt of movement; highlight only valid destinations (or show `circle.slash`); animate failed drops back/evaporate; show progress + placeholder for slow transfers.
- Consider spring loading (drag over a button/segment to activate).

**Components / SwiftUI:** `.draggable(_:)` / `.dropDestination(for:action:isTargeted:)`; Transferable model types; `.onDrag` / `.onDrop` (lower level). Not supported tvOS/watchOS.

---

## File management

**What:** Document-based apps create/open/save files; people also browse via the Files app. See `components-navigation.md`, Printing below.

**Guidance**
- Provide familiar create/open commands + keyboard shortcuts (New, Open); always include an Add (+) button.
- Autosave — don't force an explicit Save. Save periodically, on close, and on switch away. Preserve work unless the user cancels/deletes.
- Hide file extensions by default; let people opt to show them (reflect the choice everywhere).
- Quick Look: use a viewer to preview files your app can't open; ship a generator for custom file types so Files/Spotlight can preview them.
- **iOS/iPadOS 18+ document launcher** — system-provided, highly graphical browse/create entry: title card (app name + 2 buttons), custom background + accessory images, and a browser sheet. Assign the title card's primary button to New; keep name + buttons legible over the background; animate accessories sparingly.

**Components / SwiftUI:** `DocumentGroup` + `DocumentGroupLaunchScene` (launcher); `.fileImporter` / `.fileExporter` / `.fileMover`; `.quickLookPreview(_:)`.

---

## Going full screen

**What:** iPhone/iPad/Mac full-screen modes expand a window and hide system controls for a distraction-free environment. Good for games, media, and in-depth focused tasks. (No full-screen mode on tvOS/watchOS/visionOS.)

**Guidance**
- Offer it when it fits (game, video/photo slideshow, in-depth task). Adjust layout subtly if the window is larger — don't programmatically resize the window.
- Keep essential controls reachable so people finish without exiting; media needs persistent or easily revealed playback controls.
- Hide toolbars/nav when content is the focus; restore with a familiar tap/swipe-down/pointer-to-top.
- Pause on switch-away and resume where they left off; let *people* decide when to exit — don't auto-exit.
- iOS/iPadOS: Home Screen indicator auto-hides; one swipe exits. If accidental exits happen, defer the first gesture so two swipes are required (`preferredScreenEdgesDeferringSystemGestures`); don't disturb the Dock except in games.

**Components / SwiftUI:** `.fullScreenCover(item:onDismiss:content:)` for modal full-screen; `.toolbar(.hidden, for:)` / `.statusBarHidden()` / `.persistentSystemOverlays(.hidden)` to hide chrome (convention). See Modality above and Multitasking below.

---

## Launching

**What:** From open → first screen ready. Onboarding (if any) comes after, not during.

**Guidance**
- Launch instantly — seconds matter.
- iOS/iPadOS require a **launch screen**: it's not branding, onboarding, or a splash. Make it *nearly identical to the first screen* (match orientation + appearance mode) so there's no flash; avoid text (won't localize); no logos unless a fixed part of the first screen.
- Splash screen (if needed) belongs at the start of onboarding, not as the launch screen.
- Restore previous state on relaunch — scroll position, window state — so people continue where they left off.
- iOS/iPadOS: launch in the device's current orientation (or your only supported one).

**Components / SwiftUI:** launch screen configured in Xcode (storyboard/Info.plist), not SwiftUI. Restore state with `@SceneStorage` (convention).

---

## Managing accounts (Sign in with Apple)

**What:** Require an account only if core function needs it; otherwise let people in without one.

**Guidance**
- Explain the benefit of an account and how to sign up, in the sign-in view.
- **Delay sign-in as long as possible** — let people sense the app's value first (browse before requiring sign-in to buy).
- Prefer **Sign in with Apple** for a trusted, consistent experience. If not using it, prefer a **passkey**; if you keep passwords, add two-factor.
- Always name the auth method ("Sign In with Face ID", not generic "Sign In"); reference only methods available on the current device (check `LABiometryType`). Don't add an app-level opt-in for biometrics (it's a system setting). Avoid the word "passcode."
- Never prepopulate a password.
- **Account deletion:** if you let people create an account in-app, you must let them *delete* it (not just deactivate) in-app, or link directly to a deletion page (easy to find, not buried in Privacy/ToS). Sign in with Apple → revoke tokens on deletion. Explain billing/subscription implications; tell people when deletion completes and notify when done.

**Components / SwiftUI:** `SignInWithAppleButton(.signIn) { … }` (AuthenticationServices). `SecureField` for password fallback; passkeys via AuthenticationServices.

---

## Managing notifications

**What:** Timely info, locked or in-use. Requires permission; people can silence/change in Settings. Integrates with Focus and scheduled delivery.

**Interruption levels (noncommunication)**

| Level | Overrides scheduled delivery | Breaks through Focus | Overrides Ring/Silent |
|---|---|---|---|
| Passive | No | No | No |
| **Active** (default) | No | No | No |
| Time Sensitive | Yes | Yes | No |
| Critical (needs entitlement) | Yes | Yes | Yes |

**Guidance**
- Represent urgency honestly — abused high levels lose trust and get your notifications turned off.
- Time Sensitive only for things relevant *now* (happening within ~an hour); the system lets people turn it off if they disagree.
- Communication notifications (calls/messages) adopt SiriKit intents; the *sender* determines delivery timing.
- Marketing/promo notifications need explicit opt-in and must **never** use Time Sensitive; provide an in-app settings screen to change the choice (see Settings).

**Components / SwiftUI:** UserNotifications framework (`UNUserNotificationCenter.requestAuthorization`, `UNNotificationInterruptionLevel`). No native SwiftUI presentation — request/permission is API-driven.

---

## Multitasking (iPad)

**What:** Quick switching among apps; iPad also shows multiple app windows at once and an app can open multiple windows. Nearly every app must support it (rare exceptions: some games).

**Guidance**
- Always be ready to save/restore context — you're not told when multitasking starts.
- Pause attention-requiring activity (game/media) on switch-away; resume seamlessly on return.
- Handle audio interruptions: pause indefinitely for primary audio (music/podcast); duck/pause briefly for short interruptions (GPS), then restore.
- Finish user-initiated tasks (downloads, video processing) in the background before suspending.
- Use notifications sparingly — notify only for important/time-sensitive completions.
- iPad windows are resizable (windowed mode) or full-screen; apps don't control the multitasking configuration or get told which one the user picked → **adapt to any size**.

**Components / SwiftUI:** design responsive layouts with `NavigationSplitView` (multi-column, collapses gracefully), `ViewThatFits`, size classes (`@Environment(\.horizontalSizeClass)`); support multiple windows via multiple `WindowGroup`/`.handlesExternalEvents`. See `platform-ios-ipados.md`, `components-navigation.md`.

---

## Offering help

**What:** Contextual, dismissible help tied to the exact task at hand.

**Guidance**
- Match help to task complexity: inline one-liner for simple tasks; tutorial for complex multistep goals. Make help easy to dismiss/avoid.
- Use consistent, platform-correct language/images ("tap" on iPhone, not "click"); keep it inclusive.
- Don't explain standard components — describe what the element does *in your app*. Orient novel controls quickly, preferring animation/graphics over long text.
- **Tips (TipKit):** small transient view for new/less-obvious features. Popover tip preserves content flow; inline tip keeps surroundings visible (annotation-style to point at UI, hint-style otherwise). Use only for simple features (≤3 actions). Keep to 1–2 sentences, action-oriented, non-promotional. Add eligibility rules and a sensible frequency (e.g. once/24h). Prefer the filled symbol variant; add buttons to jump to settings/more info.

**Components / SwiftUI:** `TipKit` — `TipView(tip)`, `.popoverTip(tip)`. macOS/visionOS tooltips: `.help("…")` (help tag; 60–75 char max, sentence case, verb-first, no ending punctuation).

---

## Printing

**What:** Integrate system print when it makes sense (iOS/iPadOS/macOS/visionOS; not tvOS/watchOS).

**Guidance**
- Make printing discoverable in standard spots: iOS/iPadOS → a toolbar button that opens an action sheet including Print; macOS → File menu Print.
- Show a print option only when possible — nothing to print or no printers → remove/dim it.
- Present relevant options (page range, copies, duplex) via the system print view when the printer supports them.

**Components / SwiftUI:** UIKit `UIPrintInteractionController` (no dedicated SwiftUI print presenter; wrap or use `ShareLink`/print activity). See File management above.

---

## Ratings and reviews

**What:** Ask for feedback at the right moment; people check ratings before downloading.

**Guidance**
- Ask only after demonstrated engagement (completed level/significant task). Never on first launch or during onboarding.
- Don't interrupt an active task/game — find natural stopping points.
- Don't pester — allow a week or two between prompts, and re-prompt only after more engagement.
- **Prefer the system prompt** — nonintrusive, one-tap, dedupes previous feedback, auto-limited to **3 times per app per 365 days**; people can opt out globally. You can't control exactly when it shows.
- Weigh resetting summary rating on a new release (fresher but fewer ratings).

**Components / SwiftUI:** StoreKit **`RequestReviewAction`** — `@Environment(\.requestReview) private var requestReview` then `requestReview()`.

---

## Undo and redo

**What:** Reverse recent actions; also lets people explore safely. People will keep undoing until something visibly changes — so make outcomes predictable and visible.

**Guidance**
- Help people predict the result: iPhone shake shows an alert describing the action; label menu items with the target ("Undo Typing", "Redo Bold").
- Show the result — scroll/highlight so an off-screen change is visible; otherwise people think nothing happened and repeat.
- Allow many undos (back to a logical point like open/save); consider batch-reverting related changes or all changes since open/save.
- Don't redefine standard gestures: three-finger swipe, or shake to undo/redo.
- Provide dedicated undo/redo buttons only when necessary — use standard SF Symbols and put them in a toolbar.
- iOS/iPadOS: the shake alert auto-prefixes "Undo "/"Redo " — supply a word or two ("Undo Name").

**Components / SwiftUI:** `@Environment(\.undoManager)` + `UndoManager` (register undo, set action names). `EditButton` for list edit mode is adjacent. Standard shortcuts (⌘Z / ⇧⌘Z) on iPad hardware keyboard.
