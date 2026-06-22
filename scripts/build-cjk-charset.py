#!/usr/bin/env python3
"""
⚠️⚠️⚠️  DO NOT RUN THIS SCRIPT.  ⚠️⚠️⚠️

This was a ONE-OFF generator used to first create scripts/subset-cjk-chars.txt.
It is now STALE and DESTRUCTIVE:
  - P2 greps Traditional blocks out of generate-font-subset.py, but those blocks
    were removed long ago -> P2 now yields almost nothing.
  - P3 needs /tmp/charfreq.csv, a temp file that no longer exists -> it fails.
Running it would OVERWRITE subset-cjk-chars.txt with a broken, much smaller set,
silently dropping the curated 3,500 + every char added since. (This is exactly the
"two separate subsets, the additions were wasted" bug we are guarding against.)

THE SINGLE SOURCE OF TRUTH IS scripts/subset-cjk-chars.txt.
To add/remove characters: edit that file directly, then run scripts/generate-font-subset.py.
A hard guard below refuses to run without an explicit override flag.

----------------------------------------------------------------------
Build the final ~3,500-character TRADITIONAL Chinese set for the CJK subset.

Pipeline (priority order):
  P1  ALL Atlanta fixed liturgical strings (extracted programmatically from
      lib/atlanta/config.ts + lib/atlanta/constants.ts). MUST-HAVE.
  P2  The Traditional curated blocks already in scripts/generate-font-subset.py
      (百家姓 / names / auspicious / address). Simplified blocks DROPPED.
  P3  Backbone of the most common Traditional chars (~3,000) from a reputable
      frequency list (forfudan 六億知乎語料通規漢字字頻表), Simplified->Traditional
      via opencc s2t.

Then: dedupe -> keep ONLY chars present in NotoSerifTC-Regular.woff2 cmap
(prevents silent drops) -> cap at ~3,500 keeping P1+P2 fully, trimming the
frequency tail. Output: scripts/subset-cjk-chars.txt (one continuous string).
"""
import os
import re
import csv

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_FONT = os.path.join(ROOT, "NotoSerifTC-Regular.woff2")
FREQ_CSV = "/tmp/charfreq.csv"  # forfudan list, pre-downloaded (see report)
OUTPUT = os.path.join(ROOT, "scripts", "subset-cjk-chars.txt")
CAP = 3500

HAN_RANGES = ((0x4E00, 0x9FFF), (0x3400, 0x4DBF), (0x20000, 0x2A6DF))
CJK_PUNCT = set("，。、；：？！「」『』（）《》〈〉【】〔〕…—·．")


def is_han(ch: str) -> bool:
    cp = ord(ch)
    return any(lo <= cp <= hi for lo, hi in HAN_RANGES)


# ---------------------------------------------------------------- P1
def extract_atlanta_strings() -> set:
    """Pull every CJK char from the Atlanta fixed/liturgical strings."""
    out = set()
    config = open(os.path.join(ROOT, "lib/atlanta/config.ts"), encoding="utf-8").read()

    # config.ts holds all the actual liturgical strings as single-quoted values
    # for fixedTop/fixedBottom/centerString/yang/jian plus LAND_DEITY_SUFFIX.
    # We restrict to lines containing those keys so we never pick up comment
    # prose. (constants.ts is geometry-only -- no liturgical strings -- and its
    # comments contain decorative symbols like 卍 / em-dash that must NOT enter
    # the subset, so we deliberately do NOT scan it.)
    keys = ("fixedTop", "fixedBottom", "centerString", "yang", "jian")
    for line in config.splitlines():
        if any(k in line for k in keys) or "LAND_DEITY_SUFFIX" in line:
            for lit in re.findall(r"'([^']*)'", line):
                out.update(c for c in lit if is_han(c) or c in CJK_PUNCT)

    return out


# ---------------------------------------------------------------- P2
def extract_curated_traditional() -> set:
    """
    Keep ONLY the Traditional curated blocks from generate-font-subset.py.
    The generator stores Simplified and Traditional on adjacent lines inside
    each triple-quoted block. We re-declare the Traditional lines here verbatim
    (copied from that file) so the source of truth stays one place visually,
    but we drop every Simplified block. To avoid drift, we instead parse the
    generator file and KEEP only Han chars that exist in the source font AND
    are NOT simplified-only -- however the cleanest deterministic rule per the
    task is: take the Traditional lines explicitly. We do that below.
    """
    gen = open(os.path.join(ROOT, "scripts/generate-font-subset.py"), encoding="utf-8").read()

    # The Traditional content lines are identifiable: in each block the
    # Traditional variants are the lines that do NOT contain simplified-only
    # markers. Rather than guess, we extract the four Traditional lines by their
    # known leading characters (stable anchors from the file).
    trad_anchors = [
        "佛光注照長生祿位",          # CORE traditional
        "趙錢孫李",                  # SURNAMES traditional
        "偉剛勇毅",                  # NAME_CHARS traditional (men)
        "秀娟英華慧巧美娜靜",        # NAME_CHARS traditional (women)
        "福祿壽喜財吉祥如意康寧",    # AUSPICIOUS traditional
        "龢䒟瑂靉闔買提熱迪麗",      # SPECIAL traditional
        "上下中大小高低新老前后內外左右近遠",  # SPECIAL positional (trad: 內遠)
        "東南西北省市區縣州台灣",    # ADDRESS traditional
    ]
    out = set()
    for line in gen.splitlines():
        s = line.strip()
        for a in trad_anchors:
            if s.startswith(a):
                out.update(c for c in s if is_han(c) or c in CJK_PUNCT)
                break
    return out


# ---------------------------------------------------------------- P3
def extract_freq_backbone(limit: int) -> list:
    """Frequency-ordered Traditional backbone (Simplified->Traditional s2t)."""
    from opencc import OpenCC
    cc = OpenCC("s2t")
    seen = set()
    ordered = []
    with open(FREQ_CSV, encoding="utf-8") as fh:
        reader = csv.reader(fh)
        next(reader, None)  # header
        for row in reader:
            if not row:
                continue
            simp = row[0]
            trad = cc.convert(simp)
            for ch in trad:  # s2t can yield >1 char for some inputs
                if is_han(ch) and ch not in seen:
                    seen.add(ch)
                    ordered.append(ch)
            if len(ordered) >= limit:
                break
    return ordered


# ---------------------------------------------------------------- main
def main():
    from fontTools.ttLib import TTFont
    font_cps = set(TTFont(SOURCE_FONT).getBestCmap().keys())

    def in_font(ch):
        return ord(ch) in font_cps

    p1 = {c for c in extract_atlanta_strings() if in_font(c)}
    p2 = {c for c in extract_curated_traditional() if in_font(c)}
    must = p1 | p2  # priority kept in full

    backbone = [c for c in extract_freq_backbone(CAP * 2) if in_font(c)]

    final = list(must)  # P1+P2 first (kept fully)
    final_set = set(final)
    p3_added = 0
    for ch in backbone:
        if len(final) >= CAP:
            break
        if ch not in final_set:
            final.append(ch)
            final_set.add(ch)
            p3_added += 1

    # Sanity: confirm 0 Simplified-ONLY leakage.
    # A char is Simplified-only iff s2t changes it (has a distinct Traditional
    # form) AND t2s leaves it unchanged (it is not itself a Traditional form).
    # Shared chars (s2t==self) and distinctly-Traditional chars (t2s!=self,
    # e.g. 范/台/干 whose s2t merely prefers a variant 範/臺/幹) are valid.
    from opencc import OpenCC
    s2t = OpenCC("s2t")
    t2s = OpenCC("t2s")
    simp_leak = [
        c for c in final
        if is_han(c) and s2t.convert(c) != c and t2s.convert(c) == c
    ]

    result = "".join(final)
    with open(OUTPUT, "w", encoding="utf-8") as fh:
        fh.write(result)

    # ---- report ----
    print("FINAL_TOTAL", len(final))
    print("P1_atlanta_count", len(p1))
    print("P2_curated_trad_count", len(p2))
    print("P1_union_P2_count", len(must))
    print("P3_backbone_added", p3_added)
    print("simplified_leak_count", len(simp_leak), "".join(simp_leak))
    # confirm every P1 char is present
    missing_p1 = [c for c in p1 if c not in final_set]
    print("P1_missing_from_final", len(missing_p1), "".join(missing_p1))
    print("P1_chars", "".join(sorted(p1)))


if __name__ == "__main__":
    import sys
    if "--yes-i-really-want-to-overwrite-the-charset" not in sys.argv:
        sys.exit(
            "\n⛔ Refusing to run: this stale one-off would OVERWRITE and shrink "
            "scripts/subset-cjk-chars.txt.\n"
            "   The source of truth is subset-cjk-chars.txt — edit it directly, then run "
            "scripts/generate-font-subset.py.\n"
            "   (If you truly mean to regenerate from scratch, re-read the header, then pass "
            "--yes-i-really-want-to-overwrite-the-charset.)\n"
        )
    main()
