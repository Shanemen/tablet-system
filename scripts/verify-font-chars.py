#!/usr/bin/env python3
"""
Font coverage gate.

Asserts two fonts are correct for the edge OG renderer:

  public/fonts/NotoSerifTC-Subset.otf   -> CJK-ONLY (Traditional). Must cover:
      * every Atlanta fixed-string char (lib/atlanta/config.ts + constants.ts),
      * a sample of common surnames / rare name chars,
      * and must contain NO Simplified-only chars (input is opencc-normalized to
        Traditional before render, so Simplified must never ship).

  public/fonts/NotoSerif-LatinVi.ttf    -> Latin + Vietnamese. Must cover:
      * full Basic Latin A-Za-z + space,
      * Vietnamese samples incl. the U+1E00-1EFF block.

Re-runnable as a CI/pre-deploy gate. Exit 0 on pass, 1 on any failure.
"""
import os
from fontTools.ttLib import TTFont

CJK_FONT = "public/fonts/NotoSerifTC-Subset.otf"
LATIN_FONT = "public/fonts/NotoSerif-LatinVi.ttf"

# --- CJK expectations -------------------------------------------------------

# Atlanta fixed liturgical strings (rendered as font text, NOT baked into SVG).
# Mirrors lib/atlanta/config.ts (fixedTop/fixedBottom/centerString, LAND_DEITY_SUFFIX).
ATLANTA_FIXED = [
    "佛光注照",            # longevity fixedTop
    "長生祿位",            # longevity fixedBottom
    "佛力超薦",            # shared fixedTop (deceased/ancestors/aborted/land-deity)
    "往生蓮位",            # shared fixedBottom
    "氏歷代祖先往生蓮位",  # ancestors fixedBottom
    "陽上",                # LEFT.yang
    "敬薦",                # jian (most types)
    "叩薦",                # ancestors jian
    "佛力超薦累劫冤親債主往生蓮位",  # karmic centerString
    "之地基主",            # LAND_DEITY_SUFFIX
]

# Representative common surnames + a few rare name chars that must render.
CJK_NAME_SAMPLES = "王李張劉陳楊黃趙吳徐孫朱馬胡郭林何高羅鄭梁謝宋唐許韓馮鄧曹彭曾蕭歐陽諸葛皇甫令狐唯弘華正法師闔嬰靈菩薩"

# Simplified-only chars that must be ABSENT (their Traditional forms must be PRESENT).
# NOTE: 于 is intentionally NOT here — it is a valid Traditional surname (于 is itself,
# NOT simplified-of-於) and is deliberately included in the subset. opencc cn->tw wrongly
# maps the surname 于 -> 於, which the renderer's converter special-cases back to 于.
SIMPLIFIED_FORBIDDEN = {
    "长": "長", "赵": "趙", "产": "產", "万": "萬",
    "后": "後", "丰": "豐", "云": "雲",
}

# --- Latin / Vietnamese expectations ----------------------------------------

LATIN_ASCII = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz "
VIETNAMESE_SAMPLES = "ễầđơưăâêôạệ"


def cmap_chars(path):
    font = TTFont(path)
    return set(chr(code) for code in font.getBestCmap().keys())


def check_present(label, chars, available):
    missing = [c for c in chars if c not in available]
    if missing:
        print(f"FAIL  {label}: missing {len(missing)} -> {''.join(missing)}")
        return False
    print(f"PASS  {label}: all {len(set(chars))} present")
    return True


def main():
    ok = True

    # --- CJK font ---
    if not os.path.exists(CJK_FONT):
        print(f"FAIL  CJK font missing: {CJK_FONT}")
        return 1
    cjk = cmap_chars(CJK_FONT)
    cjk_ideo = sum(1 for c in cjk if 0x4E00 <= ord(c) <= 0x9FFF
                   or 0x3400 <= ord(c) <= 0x4DBF or 0x20000 <= ord(c) <= 0x2FFFF)
    print(f"INFO  {CJK_FONT}: {len(cjk)} glyphs ({cjk_ideo} CJK ideographs), "
          f"{os.path.getsize(CJK_FONT)/1024:.2f} KB")

    fixed_all = "".join(ATLANTA_FIXED)
    ok &= check_present("Atlanta fixed strings", fixed_all, cjk)
    ok &= check_present("CJK name samples", CJK_NAME_SAMPLES, cjk)

    # Simplified must be absent; Traditional equivalents must be present.
    for s, t in SIMPLIFIED_FORBIDDEN.items():
        if s in cjk:
            print(f"FAIL  Simplified leaked into subset: {s}")
            ok = False
        if t not in cjk:
            print(f"FAIL  Traditional equivalent missing: {t}")
            ok = False
    if ok:
        print(f"PASS  No Simplified-only leakage; Traditional equivalents present "
              f"({len(SIMPLIFIED_FORBIDDEN)} pairs checked)")

    # --- Latin/Vi font ---
    if not os.path.exists(LATIN_FONT):
        print(f"FAIL  Latin font missing: {LATIN_FONT}")
        return 1
    latin = cmap_chars(LATIN_FONT)
    vi_block = sum(1 for c in latin if 0x1E00 <= ord(c) <= 0x1EFF)
    print(f"INFO  {LATIN_FONT}: {len(latin)} glyphs (U+1E00-1EFF: {vi_block}), "
          f"{os.path.getsize(LATIN_FONT)/1024:.2f} KB")

    ok &= check_present("Latin ASCII A-Za-z + space", LATIN_ASCII, latin)
    ok &= check_present("Vietnamese samples", VIETNAMESE_SAMPLES, latin)

    print("=" * 50)
    if ok:
        print("ALL CHECKS PASSED")
        return 0
    print("VERIFICATION FAILED")
    return 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        print(f"ERROR during verification: {e}")
        raise SystemExit(1)
