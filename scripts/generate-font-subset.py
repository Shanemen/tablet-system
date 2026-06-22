import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.subset import Subsetter

# 1. Configuration
# SOURCE FONT = the FULL Noto Serif TC (variable, ~20,748 glyphs, ~16MB).
#   - It is the raw material we cut glyphs FROM. It is build-time only: NOT shipped,
#     NOT committed to git (see .gitignore). Download it once and place it here:
#       https://raw.githubusercontent.com/google/fonts/main/ofl/notoseriftc/NotoSerifTC%5Bwght%5D.ttf
#       -> save as NotoSerifTC-Full.ttf at the repo root.
#   - We use the FULL font (not the old 6,606-glyph NotoSerifTC-Regular.woff2 slice) so that
#     any name/address char in subset-cjk-chars.txt can actually be cut out.
INPUT_FONT = "NotoSerifTC-Full.ttf"
OUTPUT_FONT = "public/fonts/NotoSerifTC-Subset.otf"
INSTANCE_WEIGHT = 400  # cut the Regular instance; render registers 400 + 500 from this same data

# 2. Character Source (Traditional Chinese ONLY) — the SINGLE SOURCE OF TRUTH.
# Input is normalized to Traditional via opencc before render, so we only ever need Traditional.
# To add chars: edit scripts/subset-cjk-chars.txt directly, then run this script.
# (Do NOT run scripts/build-cjk-charset.py — it is a stale one-off and would clobber this file.)
CHARSET_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "subset-cjk-chars.txt")


def load_chars():
    """Read the Traditional-only character set (single source of truth)."""
    if not os.path.exists(CHARSET_FILE):
        raise FileNotFoundError(f"Character set file '{CHARSET_FILE}' not found.")
    with open(CHARSET_FILE, encoding="utf-8") as f:
        raw = f.read()
    # Defensive: strip stray whitespace/newlines and dedupe.
    chars = "".join(sorted(set(raw.replace("\n", "").replace(" ", "").replace("\t", ""))))
    return chars


unique_chars = load_chars()

print("Character set (Traditional Chinese ONLY)")
print("=" * 50)
print(f"  Source file: {CHARSET_FILE}")
print(f"  Total (deduped): {len(unique_chars)} characters")
print("=" * 50)


def check_font():
    if not os.path.exists(INPUT_FONT):
        raise FileNotFoundError(
            f"Source font '{INPUT_FONT}' not found. Download the FULL Noto Serif TC and place it "
            f"at the repo root as {INPUT_FONT} (see the header comment for the URL). "
            f"It is gitignored on purpose (16MB, build-time only)."
        )
    print(f"Using source font: {INPUT_FONT} ({os.path.getsize(INPUT_FONT)/1024/1024:.2f} MB)")


def generate_subset():
    os.makedirs(os.path.dirname(OUTPUT_FONT), exist_ok=True)
    font = TTFont(INPUT_FONT)

    # If the source is a variable font, pin it to the Regular weight first so the
    # output is a plain static face (matches the previously shipped subset exactly).
    if "fvar" in font:
        print(f"Variable font detected -> instantiating at wght={INSTANCE_WEIGHT}")
        font = instancer.instantiateVariableFont(font, {"wght": INSTANCE_WEIGHT}, inplace=False)

    print("Generating subset...")
    ss = Subsetter()
    ss.options.layout_features = ["*"]
    ss.populate(text=unique_chars)
    ss.subset(font)
    font.save(OUTPUT_FONT)
    print(f"Subset generated at {OUTPUT_FONT}")


if __name__ == "__main__":
    try:
        check_font()
        generate_subset()
        print("\n✅ Font subset generation complete!")
        if os.path.exists(OUTPUT_FONT):
            print(f"Output: {OUTPUT_FONT}  ({os.path.getsize(OUTPUT_FONT)/1024:.2f} KB)")
    except Exception as e:
        print(f"\n❌ Failed: {e}")
