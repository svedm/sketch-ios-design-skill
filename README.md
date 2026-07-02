# HIG — iOS / iPadOS Designer skill

A Claude Code **skill** that lets an agent design iOS & iPadOS app UI/UX to Apple's current
Human Interface Guidelines and build the mockups in **Sketch** (via the Sketch MCP) using the
official **Apple Design Resources** library — while thinking in **SwiftUI** so designs
transcribe cleanly into code.

## What's here

```
ios-ipados-designer/            ← the skill
  SKILL.md                      ← router + non-negotiable rules (entry point)
  references/
    liquid-glass.md             ← the current (iOS 26) design language
    foundations.md              ← color, type, materials, SF Symbols, dark mode, a11y
    metrics.md                  ← hard numbers: targets, bars, spacing, type scale, devices
    components-navigation.md     ← tab/side bars, split views, toolbars, search
    components-controls.md       ← buttons, toggles, sliders, steppers, pickers, fields
    components-presentation.md    ← sheets, alerts, popovers, menus, share
    components-content.md         ← lists, tables, forms, collections, charts
    components-status-system.md   ← progress, gauges, widgets, Live Activities, controls
    patterns.md                  ← onboarding, modality, loading, settings, feedback…
    inputs.md                    ← keyboard, gestures, iPad pointer, Pencil
    platform-ios-ipados.md       ← iPhone vs iPad, size classes, multitasking, devices
    swiftui-catalog.md           ← the SwiftUI element catalog (real API names)
    mapping.md                   ← HIG ↔ SwiftUI ↔ Sketch (Apple Design Resources) table
    sketch-library.md            ← Apple iOS 27 UI Kit inventory (real symbol/style/swatch names)
    sketch-playbook.md           ← how to build in Sketch via MCP + Apple Design Resources
```

The reference docs are distilled from Apple's **current** HIG and SwiftUI documentation
(crawled via Apple's DocC JSON API), reflecting the iOS/iPadOS 26 **Liquid Glass** design
language. SwiftUI API names are anchored to the real symbol set (no invented types).

## Using it

`SKILL.md` is a router. Start there for any iOS/iPadOS design task; it loads the specific
`references/*.md` a screen actually needs. The prime directive: **name every element in three
vocabularies** — HIG component, SwiftUI view, Apple Design Resources symbol — via `mapping.md`.

## Installing as a personal skill

To make it available across projects, link it into your Claude Code skills dir:

```sh
mkdir -p ~/.claude/skills
ln -s "$PWD/ios-ipados-designer" ~/.claude/skills/ios-ipados-designer
```

(Or copy it. A symlink keeps the installed skill in sync with this repo.)

## Sketch MCP

`.mcp.json` registers the local Sketch MCP (`http://localhost:31126/mcp`, served by the Sketch
app). It requires approval on first use (reconnect the session) and Sketch running with the
target document open. See `ios-ipados-designer/references/sketch-playbook.md` §0 for the
one-time MCP bootstrap (discover tools + inventory the Apple Design Resources library).

## Regenerating / updating

Apple updates the HIG and SwiftUI docs with each release. To refresh, re-crawl the DocC JSON
API (`developer.apple.com/tutorials/data/...json`) and re-synthesize the reference docs. The
crawler and synthesis workflow used to build this skill produce the corpus and the `references/`
files from primary sources.
