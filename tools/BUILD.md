# Build pipeline — regenerating the skill from Apple's docs

The `references/*.md` are distilled from Apple's **current** HIG + SwiftUI docs. Apple updates
these each release (WWDC), so the skill can be rebuilt from primary sources.

## Why the DocC JSON API

`developer.apple.com/design/...` and `/documentation/...` are JavaScript SPAs — the raw HTML is
a "requires JavaScript" shell. But every page has a structured **DocC render-JSON twin**:

- HIG: `https://developer.apple.com/tutorials/data/design/human-interface-guidelines/<slug>.json`
- SwiftUI: `https://developer.apple.com/tutorials/data/documentation/swiftui/<slug>.json`

These return full content (abstract, sections, declarations, platforms, topic graph) that we
parse deterministically — far more reliable than scraping rendered HTML.

## Steps

1. **Crawl HIG** (follows the full `references` graph — HIG pages have few member links):
   ```
   python3 docc_crawl.py hig hig_corpus
   ```
   ~170 pages → `hig_corpus/{json,md}/` + `index.json`. Apple's taxonomy lives in the grouping
   pages `foundations`, `components` (8 subcategories), `patterns`, `inputs`, `technologies`.

2. **Crawl SwiftUI** — for an API, following the whole `references` map explodes into thousands
   of member/modifier leaf pages, so use **structural** traversal (topicSections only) + a
   depth cap, then **targeted fetch** of the exact component/style symbols:
   ```
   python3 docc_crawl.py swiftui swiftui_corpus 100000 2   # structural depth-2 catalog
   python3 fetch_symbols.py button toggle slider list ...   # curated component/style types
   ```
   Component *type* pages sit at graph depth 2; their overview text names the styles inline.
   The core component pages are the ones to guarantee (BFS can spend its budget on niche style
   pages first) — `fetch_symbols.py` fetches them directly by slug.

3. **Extract ground-truth facts** (anchors the catalog + mapping to real names — no hallucinated
   types): build `swiftui_facts.json` (slug → title/abstract/decl/platforms/topics) and
   `swiftui_valid_slugs.json` (the validation set) from the crawled JSON.

4. **Synthesize** the reference docs: `synth_workflow.js` fans out one grounded doc-writer per
   reference file (reads its corpus slice, writes the distilled `.md`), then an adversarial
   verify pass audits SwiftUI names against the valid-slug set and checks component coverage.
   Run it with the Workflow tool.

5. **Verify against live docs.** The verify agents only see the crawled subset, so any API they
   flag as "not found" must be confirmed against `developer.apple.com` before removing it —
   several real iOS 26 APIs (`.tabViewBottomAccessory`, `.searchToolbarBehavior`) were false
   positives caught this way. Curl the `.json` twin to confirm (200 vs 404).

## Notes

- The absolute corpus/manifest paths in `docc_crawl.py` / `synth_workflow.js` were the scratch
  dir of the original build — adjust them for a fresh run.
- DocC JSON is stable release-to-release; re-running after a new iOS version refreshes everything.
- Keep the "current design language" framing current: as of this build it's **Liquid Glass
  (iOS 26)**. Check `foundations`/`materials`/`adopting-liquid-glass` for the latest.
