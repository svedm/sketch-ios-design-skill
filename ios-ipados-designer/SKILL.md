---
name: ios-ipados-designer
description: "Design iOS & iPadOS app UI/UX and build the mockups in Sketch. Use whenever the user wants to design, mock up, lay out, or critique an iPhone/iPad app screen, flow, or component — or mentions Apple's Human Interface Guidelines (HIG), Liquid Glass, SF Symbols, Dynamic Type, Apple Design Resources, or SwiftUI-accurate design. Encodes the current (iOS 26 / Liquid Glass) HIG, the SwiftUI element catalog, and a three-way HIG↔SwiftUI↔Sketch mapping so every designed element names the exact SwiftUI type it will become. Drives Sketch through the Sketch MCP using the official Apple Design Resources component library. Triggers: 'design an iOS screen', 'mock this up in Sketch', 'lay out this iPad view', 'is this HIG-compliant', 'build the settings screen', 'apply Liquid Glass', or a Sketch file + iOS/SwiftUI context."
disable-model-invocation: false
---

# iOS / iPadOS Designer

Design iOS & iPadOS interfaces to Apple's **current** Human Interface Guidelines and build them in **Sketch** (via the Sketch MCP) using the official **Apple Design Resources** library — while thinking in **SwiftUI** so the design transcribes cleanly into code.

This file is the router and the always-true rules. Details live in `references/`.

## The prime directive: think in SwiftUI while you design

Never draw a screen as anonymous rectangles and text. Every element you place is a **specific SwiftUI view** wearing a **specific HIG component** rendered by a **specific Apple Design Resources symbol**. Name it in all three vocabularies as you go. A finished mockup should read like a SwiftUI view tree. When unsure what an element "is", consult [`references/mapping.md`](references/mapping.md) — the HIG ↔ SwiftUI ↔ Sketch table.

## Non-negotiable rules (apply to every screen)

1. **Liquid Glass is the current material.** iOS/iPadOS 26 renders bars, controls, sheets, sidebars and menus as Liquid Glass in a floating layer above content. Do NOT design the pre-26 flat, opaque-bar look as if it were current. See [`references/liquid-glass.md`](references/liquid-glass.md).
2. **Use Apple Design Resources components, not primitives.** Insert real library symbols (nav bars, tab bars, buttons, list rows, controls) so sizes, insets, and states are correct by construction. See [`references/sketch-playbook.md`](references/sketch-playbook.md).
3. **Colors are semantic tokens, never raw hex.** `label`/`secondaryLabel`, `systemBackground`/`systemGroupedBackground`, `separator`, `tint`. In SwiftUI: `Color(.systemBackground)`, `Color.secondary`, `.tint(...)`. They adapt to Dark Mode and elevation for free.
4. **Type is Dynamic Type text styles, never arbitrary sizes.** `largeTitle`→`caption2`. In SwiftUI: `.font(.title)`, `.font(.body)`. See the scale in [`references/metrics.md`](references/metrics.md).
5. **Icons are SF Symbols by name.** e.g. `square.and.arrow.up`. In SwiftUI: `Image(systemName:)`. In Sketch use the library's symbol glyphs — never paste codepoints.
6. **Respect the grid & targets.** 44×44pt minimum hit target; spacing on a 4/8pt rhythm; honor safe areas (Dynamic Island, home indicator) and layout margins. Numbers in [`references/metrics.md`](references/metrics.md).
7. **Design for the size class, not the device.** iPhone (mostly compact) vs iPad (regular, split views, pointer, multitasking). See [`references/platform-ios-ipados.md`](references/platform-ios-ipados.md).

## Workflow for designing a screen

1. **Frame the intent & platform.** What is this screen for? iPhone, iPad, or both? Which size class(es)? Pick the artboard size from [`references/platform-ios-ipados.md`](references/platform-ios-ipados.md).
2. **Choose the navigation skeleton first** (it dictates the chrome): stack (`NavigationStack`), tabs (`TabView`), or split (`NavigationSplitView`). See [`references/components-navigation.md`](references/components-navigation.md).
3. **Place the chrome as Liquid Glass** — status bar, nav/large-title bar, tab bar or bottom toolbar — from the Apple Design Resources library.
4. **Compose the content** with the right components (lists/forms/collections/controls), each chosen from `references/components-*.md`, each named with its SwiftUI type.
5. **Apply foundations** — semantic colors, text styles, materials, spacing, SF Symbols — per [`references/foundations.md`](references/foundations.md).
6. **Cover the states** — empty/loading/error, selected/disabled, and Dark Mode. Loading & empty patterns in [`references/patterns.md`](references/patterns.md).
7. **Self-review against HIG** — targets, contrast, modality choice, Dynamic Type reflow, safe areas. Then hand a mental SwiftUI tree back to the user.

## Driving Sketch (MCP)

The Sketch MCP is configured + approved in this repo (`.mcp.json` + `.claude/settings.local.json`, server `sketch`, `http://localhost:31126/mcp`). Sketch must be running with the target document open. The user's library is the **Apple iOS 27 UI Kit** (Apple Design Resources), inventoried in [`references/sketch-library.md`](references/sketch-library.md). Before building, follow [`references/sketch-playbook.md`](references/sketch-playbook.md): verified MCP tools (`get_guide`, `get_document_info`, `run_code`, `get_symbol_overrides`, `get_screenshot`, …), the symbol import/override API, and artboard setup. If the `mcp__sketch__*` tools aren't registered in the session, drive the server via raw JSON-RPC `tools/call` (see the playbook).

## Reference map — load on demand

| File | Load when |
|---|---|
| [references/liquid-glass.md](references/liquid-glass.md) | Any modern screen; anything with bars, sheets, glass, materials |
| [references/foundations.md](references/foundations.md) | Color, typography, materials, SF Symbols, dark mode, accessibility |
| [references/metrics.md](references/metrics.md) | You need exact sizes, spacing, type scale, safe-area/device numbers |
| [references/components-navigation.md](references/components-navigation.md) | Tab bars, sidebars, split views, toolbars, search, page controls |
| [references/components-controls.md](references/components-controls.md) | Buttons, toggles, sliders, steppers, pickers, text fields, segmented |
| [references/components-presentation.md](references/components-presentation.md) | Sheets, alerts, action/confirmation, popovers, menus, share |
| [references/components-content.md](references/components-content.md) | Lists, tables, forms, collections, charts, labels, disclosure |
| [references/components-status-system.md](references/components-status-system.md) | Progress, gauges, activity rings, widgets, Live Activities, controls |
| [references/patterns.md](references/patterns.md) | Onboarding, modality, loading, entering data, settings, feedback, sharing |
| [references/inputs.md](references/inputs.md) | Keyboard avoidance, gestures, iPad pointer, Pencil, focus |
| [references/platform-ios-ipados.md](references/platform-ios-ipados.md) | iPhone vs iPad, size classes, multitasking, device dimensions |
| [references/swiftui-catalog.md](references/swiftui-catalog.md) | You need the exact SwiftUI type / style / signature |
| [references/mapping.md](references/mapping.md) | Translating between HIG ↔ SwiftUI ↔ Sketch; naming an element |
| [references/sketch-library.md](references/sketch-library.md) | Exact Apple iOS 27 UI Kit symbol / text-style / layer-style / swatch names |
| [references/sketch-playbook.md](references/sketch-playbook.md) | Actually building in Sketch via MCP + Apple Design Resources |

When a task spans several of these, load the router mental model first (this file), then only the references the screen actually needs.
