#!/usr/bin/env python3
"""
验证字体文件是否包含所有预期的字符
"""
import os
from fontTools.ttLib import TTFont

# 配置
FONT_FILE = "public/fonts/NotoSerifTC-Subset.otf"

# 测试用例 (繁体版本 - 因为 Noto Serif TC 是繁体字体)
TEST_CASES = [
    ("核心业务字（繁体）", "佛光注照長生祿位往生蓮位陽上敬薦叩薦氏歷代祖先累劫冤親債主之地基主嬰靈菩薩父母孝孫兒女媳"),
    ("常见姓氏（繁体）", "王李張劉陳楊黃趙週吳徐孫朱馬胡郭林何高羅鄭梁謝宋唐許韓馮鄧曹彭曾蕭田董袁潘於蔣蔡餘杜葉程蘇魏呂丁任"),
    ("复姓（繁体）", "歐陽上官皇甫令狐諸葛"),
    ("关键测试字（繁体）", "唯弘華正法師闔"),
    ("男性名字（繁体）", "偉強勇明志傑峰濤浩宇軒昊博文輝"),
    ("女性名字（繁体）", "秀娟英華慧美靜芳燕娜麗雲琳玉萍紅"),
    ("少数民族（繁体）", "買提熱迪麗巴黎"),
]

def verify_font():
    """验证字体文件"""
    if not os.path.exists(FONT_FILE):
        print(f"❌ 字体文件不存在: {FONT_FILE}")
        return False
    
    # 加载字体
    font = TTFont(FONT_FILE)
    cmap = font.getBestCmap()
    
    # 获取字体包含的所有字符
    available_chars = set(chr(code) for code in cmap.keys())
    
    print(f"📊 字体文件信息:")
    print(f"   路径: {FONT_FILE}")
    print(f"   大小: {os.path.getsize(FONT_FILE) / 1024:.2f} KB")
    print(f"   字符数: {len(available_chars)}")
    print()
    
    # 测试所有测试用例
    all_passed = True
    total_tested = 0
    total_missing = 0
    
    for category, test_chars in TEST_CASES:
        missing_chars = []
        for char in test_chars:
            total_tested += 1
            if char not in available_chars:
                missing_chars.append(char)
                total_missing += 1
        
        if missing_chars:
            print(f"❌ {category}: 缺失 {len(missing_chars)} 个字符")
            print(f"   缺失字符: {''.join(missing_chars)}")
            all_passed = False
        else:
            print(f"✅ {category}: 全部包含 ({len(test_chars)} 个字符)")
    
    print()
    print(f"{'='*50}")
    
    if all_passed:
        print(f"🎉 验证通过！所有 {total_tested} 个测试字符都已包含在字体中")
        return True
    else:
        print(f"⚠️  验证失败：{total_missing}/{total_tested} 个字符缺失")
        print(f"   请更新 scripts/generate-font-subset.py 并重新生成字体")
        return False

if __name__ == "__main__":
    try:
        success = verify_font()
        exit(0 if success else 1)
    except Exception as e:
        print(f"❌ 验证过程出错: {e}")
        exit(1)

