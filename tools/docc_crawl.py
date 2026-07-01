#!/usr/bin/env python3
"""Deterministic crawler for Apple's DocC JSON API (HIG + SwiftUI).

Human pages at developer.apple.com are JS SPAs, but every page has a render-JSON
twin under /tutorials/data/<path>.json. We BFS over the `references` graph,
render each page's content to markdown, and store raw JSON + markdown + an index.
"""
import json, os, sys, time, urllib.request, urllib.error, re

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17 Safari/605.1.15"
BASE = "https://developer.apple.com"

def fetch(url, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(1.2 * (i + 1))
        except Exception:
            time.sleep(1.2 * (i + 1))
    return None

def json_url_for(page_url):
    # /design/human-interface-guidelines/buttons -> /tutorials/data/design/...buttons.json
    p = page_url.strip()
    if p.startswith("http"):
        p = re.sub(r"^https?://[^/]+", "", p)
    p = p.rstrip("/")
    if not p:
        return None
    return f"{BASE}/tutorials/data{p}.json"

# ---------- DocC render-JSON -> markdown ----------
def render_inline(items, refs):
    out = []
    for it in items or []:
        t = it.get("type")
        if t == "text":
            out.append(it.get("text", ""))
        elif t == "codeVoice":
            out.append(f"`{it.get('code','')}`")
        elif t in ("emphasis", "newTerm"):
            out.append(f"*{render_inline(it.get('inlineContent'), refs)}*")
        elif t == "strong":
            out.append(f"**{render_inline(it.get('inlineContent'), refs)}**")
        elif t == "reference":
            rid = it.get("identifier", "")
            ref = refs.get(rid, {})
            title = ref.get("title") or it.get("overridingTitle") or rid.split("/")[-1]
            url = ref.get("url", "")
            if url:
                out.append(f"[{title}]({url})")
            else:
                out.append(title)
        elif t == "link":
            out.append(f"[{it.get('title', it.get('destination',''))}]({it.get('destination','')})")
        elif t == "image":
            rid = it.get("identifier", "")
            ref = refs.get(rid, {})
            out.append(f"[image: {ref.get('alt') or rid}]")
        elif t == "inlineHead":
            out.append(f"**{render_inline(it.get('inlineContent'), refs)}**")
        else:
            if "inlineContent" in it:
                out.append(render_inline(it.get("inlineContent"), refs))
            elif "text" in it:
                out.append(it.get("text", ""))
    return "".join(out)

def render_blocks(blocks, refs, depth=0):
    lines = []
    for b in blocks or []:
        t = b.get("type")
        if t == "paragraph":
            lines.append(render_inline(b.get("inlineContent"), refs))
            lines.append("")
        elif t == "heading":
            lvl = min(b.get("level", 2), 6)
            lines.append(f"{'#'*lvl} {b.get('text','')}")
            lines.append("")
        elif t == "aside":
            style = (b.get("style") or b.get("name") or "note").title()
            inner = render_blocks(b.get("content"), refs, depth)
            lines.append(f"> **{style}:** " + inner.replace("\n", "\n> "))
            lines.append("")
        elif t in ("unorderedList", "orderedList"):
            for i, item in enumerate(b.get("items", [])):
                bullet = "-" if t == "unorderedList" else f"{i+1}."
                inner = render_blocks(item.get("content"), refs, depth + 1).strip()
                inner = inner.replace("\n", "\n  ")
                lines.append(f"{'  '*depth}{bullet} {inner}")
            lines.append("")
        elif t == "codeListing":
            code = "\n".join(b.get("code", []))
            lines.append(f"```{b.get('syntax','')}\n{code}\n```")
            lines.append("")
        elif t == "image":
            rid = b.get("identifier", "")
            ref = refs.get(rid, {})
            alt = ref.get("alt") or rid
            variants = ref.get("variants", [])
            src = variants[0].get("url") if variants else ""
            lines.append(f"![{alt}]({src})")
            lines.append("")
        elif t == "table":
            rows = b.get("rows", [])
            for ri, row in enumerate(rows):
                cells = ["".join(render_blocks(c, refs).strip() for c in [cell]) for cell in row]
                lines.append("| " + " | ".join(cells) + " |")
                if ri == 0:
                    lines.append("| " + " | ".join(["---"] * len(cells)) + " |")
            lines.append("")
        elif t == "termList":
            for item in b.get("items", []):
                term = render_inline(item.get("term", {}).get("inlineContent"), refs)
                dfn = render_blocks(item.get("definition", {}).get("content"), refs).strip()
                lines.append(f"- **{term}** — {dfn}")
            lines.append("")
        else:
            if "content" in b:
                lines.append(render_blocks(b.get("content"), refs, depth))
            elif "inlineContent" in b:
                lines.append(render_inline(b.get("inlineContent"), refs))
    return "\n".join(lines)

def page_to_markdown(d):
    refs = d.get("references", {})
    meta = d.get("metadata", {})
    title = meta.get("title", "")
    role = meta.get("roleHeading", "")
    platforms = ", ".join(
        f"{p.get('name','')} {p.get('introducedAt','')}".strip()
        for p in meta.get("platforms", []) if p.get("name")
    )
    md = [f"# {title}"]
    if role:
        md.append(f"*{role}*")
    if platforms:
        md.append(f"Platforms: {platforms}")
    md.append("")
    ab = d.get("abstract")
    if ab:
        md.append(render_inline(ab, refs))
        md.append("")
    # declarations (SwiftUI symbols)
    for sec in d.get("primaryContentSections", []):
        k = sec.get("kind")
        if k == "declarations":
            for decl in sec.get("declarations", []):
                toks = "".join(t.get("text", "") for t in decl.get("tokens", []))
                md.append(f"```swift\n{toks}\n```\n")
        elif k == "content":
            md.append(render_blocks(sec.get("content"), refs))
        elif k == "parameters":
            md.append("## Parameters\n")
            for p in sec.get("parameters", []):
                md.append(f"- **{p.get('name','')}** — " + render_blocks(p.get("content"), refs).strip())
            md.append("")
    return "\n".join(md), refs, meta

def structural_child_urls(d):
    """Only the canonical child pages (topicSections + seeAlso), resolved to URLs.
    Avoids following the full `references` map, which for API docs pulls in every
    member/modifier leaf page."""
    refs = d.get("references", {})
    urls = []
    for sec in d.get("topicSections", []) + d.get("seeAlsoSections", []):
        for i in sec.get("identifiers", []):
            u = refs.get(i, {}).get("url", "")
            if u:
                urls.append(u)
    return urls

def crawl(root_url, prefix, outdir, max_pages=100000, allow_prefixes=None,
          max_depth=99, seeds=None, structural=False):
    os.makedirs(f"{outdir}/json", exist_ok=True)
    os.makedirs(f"{outdir}/md", exist_ok=True)
    allow = allow_prefixes or [prefix]
    seen = set()
    queue = [(root_url, 0)]
    for s in (seeds or []):
        queue.append((s, 0))
    index = []
    n = 0
    while queue and n < max_pages:
        url, depth = queue.pop(0)
        key = url.rstrip("/")
        if key in seen:
            continue
        seen.add(key)
        ju = json_url_for(url)
        if not ju:
            continue
        raw = fetch(ju)
        if raw is None:
            continue
        try:
            d = json.loads(raw)
        except Exception:
            continue
        n += 1
        slug = key.split("/design/human-interface-guidelines/")[-1] if "human-interface-guidelines" in key else key.split("/documentation/")[-1]
        slug = slug.replace("/", "__") or "index"
        with open(f"{outdir}/json/{slug}.json", "w") as f:
            f.write(raw)
        try:
            md, refs, meta = page_to_markdown(d)
            with open(f"{outdir}/md/{slug}.md", "w") as f:
                f.write(md)
            index.append({"slug": slug, "title": meta.get("title", ""), "role": meta.get("roleHeading", ""), "url": key})
        except Exception as e:
            refs = d.get("references", {})
            index.append({"slug": slug, "title": slug, "role": "ERR:" + str(e), "url": key})
        # enqueue children (respect depth budget)
        if depth < max_depth:
            if structural:
                child_urls = structural_child_urls(d)
            else:
                child_urls = [ref.get("url", "") for ref in d.get("references", {}).values()
                              if ref.get("type") == "topic"]
            for u in child_urls:
                if u and any(u.startswith(pp) for pp in allow) and u.rstrip("/") not in seen:
                    queue.append((u, depth + 1))
        if n % 20 == 0:
            print(f"[{outdir}] {n} pages, queue={len(queue)}", flush=True)
    with open(f"{outdir}/index.json", "w") as f:
        json.dump(index, f, indent=2)
    print(f"[{outdir}] DONE: {n} pages -> {outdir}/index.json", flush=True)
    return n

if __name__ == "__main__":
    target = sys.argv[1]
    outdir = sys.argv[2]
    maxp = int(sys.argv[3]) if len(sys.argv) > 3 else 100000
    if target == "hig":
        crawl("/design/human-interface-guidelines",
              "/design/human-interface-guidelines", outdir, maxp,
              allow_prefixes=["/design/human-interface-guidelines"])
    elif target == "swiftui":
        # depth-2 BFS = full component-type catalog; seeds add one level of
        # concrete styles / Liquid Glass APIs that live a level deeper.
        seeds = ["/documentation/swiftui/" + s for s in [
            "buttonstyle", "primitivebuttonstyle", "labelstyle", "textfieldstyle",
            "togglestyle", "pickerstyle", "datepickerstyle", "liststyle",
            "menustyle", "gaugestyle", "progressviewstyle", "controlsize",
            "tabviewstyle", "navigationsplitviewstyle", "presentationdetent",
            "glasseffectcontainer", "glass", "glassbuttonstyle",
            "prominentbuttonstyle", "controlgroupstyle", "formstyle",
            "texteditorstyle", "colorschemecontrast", "materialactivetint",
        ]]
        depth = int(sys.argv[4]) if len(sys.argv) > 4 else 3
        crawl("/documentation/swiftui",
              "/documentation/swiftui", outdir, maxp,
              allow_prefixes=["/documentation/swiftui"],
              max_depth=depth, seeds=seeds, structural=True)
