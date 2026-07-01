#!/usr/bin/env python3
"""Targeted fetch of specific SwiftUI symbol pages into the corpus."""
import json, os, sys
from docc_crawl import fetch, json_url_for, page_to_markdown

OUT = "swiftui_d2"
os.makedirs(f"{OUT}/md", exist_ok=True)
os.makedirs(f"{OUT}/json", exist_ok=True)

slugs = sys.argv[1:]
ok, missing = [], []
for slug in slugs:
    url = f"/documentation/swiftui/{slug}"
    raw = fetch(json_url_for(url))
    if raw is None:
        missing.append(slug); continue
    try:
        d = json.loads(raw)
    except Exception:
        missing.append(slug); continue
    fn = f"swiftui__{slug}"
    with open(f"{OUT}/json/{fn}.json", "w") as f:
        f.write(raw)
    md, _, meta = page_to_markdown(d)
    with open(f"{OUT}/md/{fn}.md", "w") as f:
        f.write(md)
    ok.append(slug)
print(f"OK ({len(ok)}):", " ".join(ok))
print(f"\nMISSING/404 ({len(missing)}):", " ".join(missing))
