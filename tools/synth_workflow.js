export const meta = {
  name: 'ios-designer-skill-synth',
  description: 'Distill crawled Apple HIG + SwiftUI corpus into the reference docs of an iOS/iPadOS designer skill, then verify the SwiftUI mapping.',
  phases: [
    { title: 'Synthesize', detail: '13 grounded doc-writers, one reference file each' },
    { title: 'Verify', detail: 'audit mapping API names + component coverage against source' },
  ],
}

const SCRATCH = '/private/tmp/claude-501/-Users-s-karasev-Work-hig/78bf890b-6d25-46af-b607-cdebdec28a6c/scratchpad'
const MANIFEST = `${SCRATCH}/manifest/groups_final.json`
const FACTS = `${SCRATCH}/manifest/swiftui_facts.json`
const VALID = `${SCRATCH}/manifest/swiftui_valid_slugs.json`
const OUT = '/Users/s.karasev/Work/hig/ios-ipados-designer/references'

const SIBLINGS = [
  'liquid-glass.md', 'foundations.md', 'metrics.md',
  'components-navigation.md', 'components-controls.md', 'components-presentation.md',
  'components-content.md', 'components-status-system.md',
  'patterns.md', 'inputs.md', 'platform-ios-ipados.md',
  'swiftui-catalog.md', 'mapping.md', 'sketch-playbook.md',
].join(', ')

const SHARED = `You are a senior iOS/iPadOS product designer who also ships SwiftUI. You are writing ONE reference file for a reusable Claude Code skill called "ios-ipados-designer". The skill's user is an AI agent that (1) designs iOS/iPadOS screens in Sketch using the official Apple Design Resources component library, and (2) later implements them in SwiftUI. Your file must serve BOTH: design decisions AND the exact SwiftUI element to reach for.

SOURCES: Apple's own current HIG / SwiftUI documentation, pre-rendered to markdown at the absolute paths you'll be given. READ THEM ALL before writing. Ground every claim, number, and API name in these sources. NEVER invent point sizes or SwiftUI type/modifier names — if a number isn't in the source and you rely on a well-known convention, mark it "(convention)".

CURRENCY — CRITICAL: The current design language is Liquid Glass (iOS 26 / 2025). Describe the CURRENT system, not the pre-iOS-26 flat look. Where sources mention Liquid Glass, glass, materials, scroll edge effects, or the new bar/control treatments, reflect them as the default.

AUDIENCE NEEDS: actionable specifics — exact sizes/spacing in pt, states & variants, terse do/don't, and for every UI thing the SwiftUI type + key modifiers/styles so the reader "thinks in SwiftUI". Keep iOS/iPadOS focus; mention macOS/watchOS/tvOS/visionOS only when it changes an iPad decision.

STYLE: tight, scannable markdown. Tables and bullet lists over prose. No marketing, no filler, no restating the obvious. Start the file with a single H1 title and a one-sentence purpose line. Cross-reference sibling files by name when useful. The skill's other reference files are: ${SIBLINGS}.

OUTPUT: Use the Write tool to write your file to the EXACT path given. Do NOT print the document in your final message. Your final message must be a 3-line summary: (1) what you covered, (2) notable Liquid Glass / iOS-26 points captured, (3) any gaps or source ambiguities.`

function corpusPrompt(key, file, brief) {
  return `${SHARED}

YOUR FILE: ${OUT}/${file}

READ FIRST: open the JSON manifest at ${MANIFEST}. It maps doc-keys to arrays of absolute markdown file paths. Read EVERY file listed under the key "${key}". Those are your primary sources.

WHAT THIS FILE MUST CONTAIN:
${brief}`
}

const DOCS = [
  ['liquid-glass', 'liquid-glass.md', `The current design language — this is the most-loaded doc; make it the best one.
- What Liquid Glass IS (a dynamic material/layer that refracts + reflects content; sits in a distinct functional layer above content).
- The glass variants (regular vs clear) and exactly when to use each.
- How glass applies to: navigation bars, tab bars, toolbars, sidebars, sheets, popovers, controls/buttons, search. Note the concentric/rounded-corner + floating treatment and scroll edge effects.
- Legibility & contrast rules; tinting glass; when text/symbols need a scrim.
- GlassEffectContainer — what it does and when to group multiple glass elements (morphing, spacing, performance).
- Accessibility: Reduce Transparency, Increase Contrast, Reduce Motion behaviors.
- Do/Don't: never glass-on-glass, don't put glass over busy content without a shape, don't overuse.
- SwiftUI APIs (verify names against the corpus): .glassEffect(_:in:), GlassEffectContainer, Glass (regular/clear/tint/interactive), .buttonStyle(.glass) and .glassProminent, .backgroundExtensionEffect, scroll edge effect modifiers. Give a minimal code snippet for each.
Keep it practical: a designer should know what to draw, and the SwiftUI to name it.`],

  ['foundations', 'foundations.md', `The design foundations, each with its SwiftUI hook.
- COLOR: the semantic system color roles (label/secondaryLabel/tertiaryLabel/quaternaryLabel; systemBackground + secondary/tertiary; systemGroupedBackground + secondary/tertiary; separator/opaqueSeparator; tint/accent; the system palette reds/blues/etc.; fills). Dynamic + Dark Mode + elevation. Liquid Glass color rules. Map to SwiftUI: Color(.systemBackground), Color.secondary, .tint(), Color(.separator), .foregroundStyle.
- TYPOGRAPHY: SF Pro / SF Compact / New York; the Dynamic Type text styles (largeTitle, title, title2, title3, headline, body, callout, subheadline, footnote, caption, caption2) with their default point size / weight / leading at Large; when to use each; accessibility sizes & scaling; leading/tracking. Map to .font(.title), .font(.system(...)), Dynamic Type, .dynamicTypeSize.
- LAYOUT: safe areas, layout margins, readable content width, the compact/regular size classes, alignment & spacing rhythm, grids. Map to safe area APIs, size classes.
- MATERIALS: ultraThin/thin/regular/thick/bar + how they relate to Liquid Glass. Map to Material / .background(.regularMaterial).
- SF SYMBOLS: weights, scales (small/medium/large), rendering modes (monochrome, hierarchical, palette, multicolor), variable color; when to use over custom icons. Map to Image(systemName:), .symbolRenderingMode, .imageScale, .fontWeight.
- ICONS & APP ICONS: keyline grid, required sizes, the layered/tintable app icon direction. DARK MODE. MOTION (Reduce Motion). IMAGES. BRANDING. WRITING (title-style vs sentence-style capitalization, tone).
- ACCESSIBILITY overview: contrast, Dynamic Type support, VoiceOver labels, 44pt minimum targets, Reduce Motion/Transparency. (Deep specifics can be brief — cross-ref where relevant.)`],

  ['components-navigation', 'components-navigation.md', `Navigation & search components. For EACH: 1-line purpose; iOS/iPadOS applicability; anatomy/variants; key sizes/states; 2-3 do/don't; Liquid Glass treatment; SwiftUI mapping (type + key modifiers/styles).
Cover: Tab bars (+ the iPad/iOS 26 floating glass tab bar, tab bar minimize on scroll), Tab views, Sidebars (iPad), Split views, Toolbars (+ bottom bar, .toolbar placements), Search fields / searchable, Path controls, Page controls, Token fields.
SwiftUI anchors: TabView + Tab, .tabViewStyle, NavigationStack, NavigationSplitView (two/three column), .navigationTitle, .navigationBarTitleDisplayMode, .toolbar { ToolbarItem(placement:) }, ToolbarItemGroup, .searchable, PageTabViewStyle, DefaultTabViewStyle.`],

  ['components-controls', 'components-controls.md', `Selection & input controls. Same per-component format (purpose, applicability, variants, sizes/states, do/don't, Liquid Glass, SwiftUI mapping).
Cover: Buttons (roles: normal/primary/cancel/destructive; styles incl. .bordered, .borderedProminent, .borderless, .plain, .glass, .glassProminent; sizes via .controlSize; 44pt target), Pop-up buttons, Pull-down buttons, Toggles (switch), Sliders, Steppers, Pickers (menu/wheel/segmented/inline), Segmented controls, Text fields, Color wells, Digit entry views, Combo boxes (note macOS), Image wells.
SwiftUI anchors: Button + ButtonStyle/.buttonStyle + .controlSize + ButtonRole, Menu (pull-down) & Picker(menu) (pop-up), Toggle + .toggleStyle(.switch), Slider, Stepper, Picker + .pickerStyle(.menu/.wheel/.segmented/.inline), TextField + .textFieldStyle, SecureField, ColorPicker. Give the exact style values.`],

  ['components-presentation', 'components-presentation.md', `Presentation, modality & actions components. Same per-component format.
Cover: Sheets (+ detents, .presentationDetents, grabber, resizing), Alerts, Action sheets (now confirmation dialogs), Popovers (iPad adaptivity), Panels, Menus, Context menus, Edit menus, Activity views (share sheet), Windows/scenes, Ornaments (note), Home Screen quick actions.
SwiftUI anchors: .sheet(isPresented:)/.sheet(item:), .presentationDetents([.medium,.large]) + PresentationDetent + .presentationDragIndicator, .alert, .confirmationDialog, .popover, Menu, .contextMenu, ShareLink / .sheet share, WindowGroup. Emphasize the iOS-26 sheet/popover glass + detent behavior and when to use each modality (from patterns/modality).`],

  ['components-content', 'components-content.md', `Content, layout & organization components. Same per-component format.
Cover: Lists & tables (plain/grouped/insetGrouped styles, sections, swipe actions, row content, editing, selection), Collections (grids), Labels, Charts (Swift Charts), Text views, Image views, Web views, Boxes/GroupBox, Disclosure controls (DisclosureGroup/OutlineGroup), Lockups, Scroll views, Column views (iPad/macOS), Outline views.
SwiftUI anchors: List + .listStyle(.plain/.grouped/.insetGrouped/.sidebar) + Section + .swipeActions + ForEach, Table, LazyVGrid/LazyHGrid + GridItem, Grid, Label, Chart, Text, Image/AsyncImage, GroupBox, DisclosureGroup, OutlineGroup, ScrollView + .scrollTargetBehavior. Note iOS-26 list/scroll edge glass behavior.`],

  ['components-status-system', 'components-status-system.md', `Status indicators & system experiences. Same per-component format.
Cover: Progress indicators (bar + activity/spinner), Gauges, Activity rings, Rating indicators, Widgets (WidgetKit families & sizes), Live Activities (Dynamic Island + Lock Screen), Notifications, Controls (Control Center / Lock Screen controls, iOS 18+), Status bars.
SwiftUI anchors: ProgressView + .progressViewStyle(.linear/.circular), Gauge + .gaugeStyle, widget families (.systemSmall/Medium/Large/ExtraLarge, accessory*), ActivityKit for Live Activities, ControlWidget. Keep widgets/live-activities concise but note the sizes & the Dynamic Island regions.`],

  ['patterns', 'patterns.md', `Design PATTERNS (the how-to-compose-flows layer). For each pattern: what it is (1 line), 3-6 concrete guidance bullets, the components + SwiftUI involved.
Cover: Charting data, Collaboration & sharing, Drag and drop, Entering data, Feedback, File management, Going full screen, Launching (launch screen, first run), Loading (skeletons/placeholders/progress), Managing accounts (Sign in with Apple), Managing notifications, Modality (when to use sheets/alerts/full-screen; the modality decision), Multitasking (iPad), Offering help, Onboarding, Printing, Ratings and reviews (SKStoreReview), Searching, Settings (in-app vs Settings app), Undo and redo.
Give special weight to MODALITY, ONBOARDING, LOADING, ENTERING DATA, SETTINGS, FEEDBACK — the everyday ones. Note SwiftUI hooks (.sheet, .fullScreenCover, .refreshable, requestReview, .searchable, Form).`],

  ['inputs', 'inputs.md', `INPUTS that shape layout & interaction. Lighter than components — focus on what a DESIGNER must accommodate.
Cover: Keyboards & virtual keyboards (keyboard avoidance, keyboard types, return keys, input accessory / toolbar above keyboard, safe area), Gestures (standard system gestures, don't override back-swipe, tap targets), Pointing devices / pointer on iPad (hover, pointer effects, min target), Focus and selection (hardware keyboard, focus engine), Apple Pencil & Scribble, Camera Control, Action button, Game controls, Nearby interactions.
SwiftUI hooks: .keyboardType, .submitLabel, .focused, .toolbar(placement: .keyboard), .onTapGesture, .hoverEffect, .focusable, ScribbleSupport. Emphasize keyboard avoidance + hit targets + iPad pointer.`],

  ['platform-ios-ipados', 'platform-ios-ipados.md', `Platform specifics for iOS vs iPadOS — what changes a layout.
- Device families & logical point sizes for current iPhones and iPads; portrait/landscape; the Dynamic Island + home indicator safe areas; status bar.
- Size classes: how compact/regular differ across iPhone (portrait vs landscape) and iPad, and adaptivity.
- iPad-specific: sidebar + NavigationSplitView (2/3 column), multitasking (Split View, Slide Over, Stage Manager), external display, pointer & hardware keyboard, popover vs sheet adaptivity, larger margins & multi-column.
- iOS-26 chrome: floating glass tab bar, toolbar/nav treatments, how they adapt iPhone↔iPad.
- Give the SwiftUI adaptivity toolkit: NavigationSplitView, @Environment(\\.horizontalSizeClass), ViewThatFits, .navigationSplitViewStyle, size-class-driven layout.
Include a compact device dimensions table (name, points WxH portrait, scale, safe-area top/bottom).`],

  ['metrics', 'metrics.md', `A HARD-NUMBERS quick reference — the file a designer opens to set exact values in Sketch. Tables, minimal prose. Pull numbers from the sources; where a value is a well-known convention not stated in-source, mark it "(convention)".
Tables to include:
- Touch targets: 44x44pt minimum (60x60 visionOS). Recommended spacing.
- Bar metrics: status bar / Dynamic Island height, navigation bar (standard + large title), tab bar (incl. iOS-26 floating glass), toolbar / bottom bar heights.
- Standard spacing & margins: default layout margin (compact ~16pt / regular), inter-element spacing rhythm (4/8/12/16/20), readable width.
- Corner radii: continuous corners; common control/card radii; concentric corners with glass.
- Dynamic Type table: each text style → default pt / weight / leading (at Large).
- SF font weights list; SF Symbol scales.
- Device table: current iPhone & iPad logical sizes + safe-area insets (cross-ref platform doc; don't duplicate fully).
- List row heights, standard control heights.
Cite the source file/section next to non-obvious numbers.`],

  ['swiftui-catalog', 'swiftui-catalog.md', `The SwiftUI element catalog — the "think in SwiftUI" reference. Anchored to REAL API names.
READ the facts file at ${FACTS} (a JSON map: slug -> {title, kind, abstract, decl, platforms, topics}) AND the corpus files under manifest key "swiftui-catalog". Use ONLY symbol/style names present in the facts file — do not invent.
Organize by category with a subsection per element:
  Text & images · Controls & indicators · Value selection · Collections/Lists/Tables · Layout containers & stacks · Grouping · Navigation · Presentation & modality · Toolbars & search · Styles (button/label/toggle/picker/list/etc. with their CONCRETE style values) · Liquid Glass APIs.
For each element give: SwiftUI type + one-line purpose (from abstract) + minimal usage signature/snippet + its available styles/config (concrete values from the facts 'topics', e.g. Button styles: .automatic .bordered .borderedProminent .borderless .plain .glass .glassProminent) + platform availability (esp. iOS 26 for glass) + the HIG component it realizes (cross-ref mapping.md).
This must be the authoritative list the mapping.md relies on for correct names.`],

  ['mapping', 'mapping.md', `THE three-way mapping — the crown jewel. A designer reads this to go HIG concept -> what to draw in Sketch -> what SwiftUI to write.
READ: the facts file ${FACTS} and the valid-names list ${VALID} (use ONLY SwiftUI names that appear there), plus the HIG component files under manifest key "_mapping_hig" for the design intent.
Produce grouped tables (Navigation & bars · Controls & input · Presentation & modality · Content & collections · Status & feedback · Foundations/materials) with columns:
  | HIG component | SwiftUI type / modifier | Apple Design Resources (Sketch) symbol | Key states & sizes | When to use / notes |
Rules:
- SwiftUI column: exact type(s) + the style/modifier that matters (e.g., Button -> .buttonStyle(.borderedProminent); Segmented control -> Picker + .pickerStyle(.segmented)). Validate every name against ${VALID}.
- Sketch column: the official Apple Design Resources iOS/iPadOS UI kit symbol path, e.g. "Bars / Tab Bars", "Controls / Buttons", "Menus & Actions". THESE ARE PROVISIONAL — prefix the section with a note that exact symbol names must be verified against the user's live Apple Design Resources library via the Sketch MCP, and mark uncertain ones with "≈".
- States & sizes: key variants + the 44pt / bar heights etc. (cross-ref metrics.md).
Also add a short "reverse index" at the end: common SwiftUI type -> HIG name -> Sketch, for the code-first reader.
Be exhaustive across the ~64 HIG components (group the rarely-iOS ones briefly).`],
]

phase('Synthesize')
const synth = await parallel(DOCS.map(([key, file, brief]) => () =>
  agent(corpusPrompt(key, file, brief), { label: `write:${file}`, phase: 'Synthesize', effort: 'high' })
))
log(`Synthesis: ${synth.filter(Boolean).length}/${DOCS.length} docs written`)

phase('Verify')
const checks = await parallel([
  () => agent(`Adversarially AUDIT the SwiftUI accuracy of ${OUT}/mapping.md and ${OUT}/swiftui-catalog.md.
Read both files, plus the valid-names list ${VALID} and facts ${FACTS}.
Report, as a concise list: (a) any SwiftUI type or style name used that is NOT in the valid list or is misspelled/renamed; (b) any style value attributed to the wrong control; (c) any HIG component from the 64 that is missing from mapping.md; (d) any place the pre-iOS-26 look is described as current. Cite file + the offending line text. If a claim is fine, don't list it. End with a VERDICT: SHIP or FIX (list the must-fixes).`,
    { label: 'verify:mapping+catalog', phase: 'Verify', effort: 'high' }),
  () => agent(`Coverage check. Read all five ${OUT}/components-*.md files. Against this HIG component list [tab-bars, tab-views, sidebars, split-views, toolbars, search-fields, path-controls, page-controls, token-fields, buttons, pop-up-buttons, pull-down-buttons, toggles, sliders, steppers, pickers, segmented-controls, text-fields, color-wells, digit-entry-views, combo-boxes, image-wells, sheets, alerts, action-sheets, popovers, panels, menus, context-menus, edit-menus, activity-views, windows, ornaments, home-screen-quick-actions, lists-and-tables, collections, labels, charts, text-views, image-views, web-views, boxes, disclosure-controls, lockups, scroll-views, column-views, outline-views, progress-indicators, gauges, activity-rings, rating-indicators, widgets, live-activities, notifications, controls, status-bars], list which are MISSING or only trivially mentioned, and which files have weak/absent SwiftUI mappings. End with VERDICT: SHIP or FIX.`,
    { label: 'verify:coverage', phase: 'Verify', effort: 'medium' }),
])

return {
  synthesized: synth.map((s, i) => ({ file: DOCS[i][1], ok: !!s })),
  verify_mapping: checks[0],
  verify_coverage: checks[1],
}
