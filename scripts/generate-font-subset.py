import os
from fontTools.subset import main as subset_main

# 1. Configuration
# Use Noto Serif TC WOFF2 font file (from fontsource)
INPUT_FONT = "NotoSerifTC-Regular.woff2"
OUTPUT_FONT = "public/fonts/NotoSerifTC-Subset.otf"

# 2. Character Source (Traditional Chinese ONLY)
# Input is normalized to Traditional Chinese via opencc before render, so we
# only ever need Traditional. The full curated set (3,500 Traditional CJK +
# needed CJK punctuation, including all Atlanta fixed liturgical strings) was
# produced in scripts/build-cjk-charset.py and frozen to this file.
CHARSET_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "subset-cjk-chars.txt")


def load_chars():
    """Read the frozen Traditional-only character set."""
    if not os.path.exists(CHARSET_FILE):
        raise FileNotFoundError(
            f"Character set file '{CHARSET_FILE}' not found. "
            f"Run scripts/build-cjk-charset.py to regenerate it."
        )
    with open(CHARSET_FILE, encoding="utf-8") as f:
        raw = f.read()
    # Defensive: strip any stray whitespace/newlines and dedupe.
    chars = "".join(sorted(set(raw.replace("\n", "").replace(" ", "").replace("\t", ""))))
    return chars


unique_chars = load_chars()

print("Character set (Traditional Chinese ONLY)")
print("=" * 50)
print(f"  Source file: {CHARSET_FILE}")
print(f"  Total (deduped): {len(unique_chars)} characters")
print("=" * 50)


def check_font():
    """Check if input font exists"""
    if not os.path.exists(INPUT_FONT):
        raise FileNotFoundError(
            f"Input font '{INPUT_FONT}' not found. "
            f"Please download Noto Serif TC and place it as {INPUT_FONT}"
        )
    size = os.path.getsize(INPUT_FONT)
    print(f"Using font: {INPUT_FONT} ({size/1024/1024:.2f} MB)")


def generate_subset():
    with open('subset_chars.txt', 'w', encoding='utf-8') as f:
        f.write(unique_chars)

    print("Generating subset...")
    os.makedirs(os.path.dirname(OUTPUT_FONT), exist_ok=True)

    args = [
        INPUT_FONT,
        f"--text-file=subset_chars.txt",
        f"--output-file={OUTPUT_FONT}",
        "--layout-features=*",
        "--flavor=",  # No flavor = TTF/OTF depending on input/conversion
    ]

    subset_main(args)
    print(f"Subset generated at {OUTPUT_FONT}")

    if os.path.exists('subset_chars.txt'):
        os.remove('subset_chars.txt')


if __name__ == "__main__":
    try:
        check_font()
        generate_subset()
        print("\n✅ Font subset generation complete!")
        print(f"Output: {OUTPUT_FONT}")
        if os.path.exists(OUTPUT_FONT):
            size = os.path.getsize(OUTPUT_FONT)
            print(f"Size: {size/1024:.2f} KB")
    except Exception as e:
        print(f"\n❌ Failed: {e}")
