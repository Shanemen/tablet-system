import os
from fontTools.subset import main as subset_main

# 1. Configuration
# Use Noto Serif TC WOFF2 font file (from fontsource)
INPUT_FONT = "NotoSerifTC-Regular.woff2"
OUTPUT_FONT = "public/fonts/NotoSerifTC-Subset.otf" 

# 2. Define Character Sets (简体 + 繁体 双覆盖)

# Level 1: Core Template Words (Must have - 简繁体)
CORE_CHARS = """
佛光注照長生祿位佛力超薦往生蓮位
陽上敬薦叩薦氏歷代祖先累劫冤親債主
之地基主嬰靈菩薩父母孝孫兒女媳
长生禄位佛力超荐往生莲位
阳上敬荐叩荐氏历代祖先累劫冤亲债主
之地基主婴灵菩萨父母孝孙儿女媳
"""

# Level 2: 百家姓 (简体 + 繁体双覆盖)
SURNAMES = """
赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邓安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲郁单杭洪包诸左石崔吉纽龚程嵇邢滑裴陆荣翁荀羊於惠甄曲家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴鬱胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍郤璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧阳上官皇甫令狐诸葛曾
趙錢孫李週吳鄭王馮陳褚衛蔣沈韓楊朱秦尤許何呂施張孔曹嚴華金魏陶姜戚謝鄒喻柏水竇章雲蘇潘葛奚范彭郎魯韋昌馬苗鳳花方俞任袁柳酆鮑史唐費廉岑薛雷賀倪湯滕殷羅畢郝鄧安常樂於時傅皮卞齊康伍餘元卜顧孟平黃和穆蕭尹姚邵湛汪祁毛禹狄米貝明臧計伏成戴談宋茅龐熊紀舒屈項祝董梁杜阮藍閔席季麻強賈路婁危江童顏郭梅盛林刁鐘徐邱駱高夏蔡田樊胡凌霍虞萬支柯昝管盧莫經房裘繆干解應宗丁宣賁郁單杭洪包諸左石崔吉鈕龔程嵇邢滑裴陸榮翁荀羊於惠甄曲家封芮羿儲靳汲邴糜松井段富巫烏焦巴弓牧隗山谷車侯宓蓬全郗班仰秋仲伊宮寧仇欒暴甘鐸厲戎祖武符劉景詹束龍葉幸司韶郜黎薊薄印宿白懷蒲台從鄂索咸籍賴卓藺屠蒙池喬陰鬱胥能蒼雙聞莘黨翟譚貢勞逄姬申扶堵冉宰酈雍郤璩桑桂濮牛壽通邊扈燕冀郟浦尚農溫別莊晏柴瞿閻充慕連茹習宦艾魚容向古易慎戈廖庾終暨居衡步都耿滿弘匡國文寇廣祿闕東歐陽上官皇甫令狐諸葛曾
"""

# Level 3: 高频人名用字 (简体 + 繁体)
NAME_CHARS = """
伟刚勇毅俊峰强军平保东文辉力明永健世广志义兴良海山仁波宁贵福生龙元全国胜学祥才发武新利清飞彬富顺信子杰涛昌成康星光天达安岩中茂进林有坚和彪博诚先敬震振壮会思群豪心邦承乐绍功松善厚庆磊民友裕河哲江超浩亮政谦亨奇固之轮翰朗伯宏言若鸣朋斌梁栋维启克伦翔旭鹏泽晨辰士以建家致树炎德行时泰盛雄琛钧冠策腾楠榕风航弘宇轩昊
秀娟英华慧巧美娜静淑惠珠翠雅芝玉萍红娥玲芬芳燕彩春菊兰凤洁梅琳素云莲真环雪荣爱妹霞香月莺媛艳瑞凡佳嘉琼勤珍贞莉桂娣叶璧璐娅琦晶妍茜秋珊莎锦黛青倩婷姣婉娴瑾颖露瑶怡婵雁蓓纨仪荷丹蓉眉君琴蕊薇菁梦岚苑婕馨瑗琰韵融园艺咏卿聪澜纯毓悦昭冰爽琬茗羽希欣飘育滢馥筠柔竹霭凝晓欢霄枫芸菲寒伊亚宜可姬舒影荔枝思丽琪瑜珺璃琨珀
偉剛勇毅俊峰強軍平保東文輝力明永健世廣志義興良海山仁波寧貴福生龍元全國勝學祥才發武新利清飛彬富順信子傑濤昌成康星光天達安岩中茂進林有堅和彪博誠先敬震振壯會思群豪心邦承樂紹功松善厚慶磊民友裕河哲江超浩亮政謙亨奇固之輪翰朗伯宏言若鳴朋斌梁棟維啟克倫翔旭鵬澤晨辰士以建家致樹炎德行時泰盛雄琛鈞冠策騰楠榕風航弘宇軒昊
秀娟英華慧巧美娜靜淑惠珠翠雅芝玉萍紅娥玲芬芳燕彩春菊蘭鳳潔梅琳素雲蓮真環雪榮愛妹霞香月鶯媛艷瑞凡佳嘉瓊勤珍貞莉桂娣葉璧璐娅琦晶妍茜秋珊莎錦黛青倩婷姣婉嫻瑾穎露瑤怡嬋雁蓓紈儀荷丹蓉眉君琴蕊薇菁夢嵐苑婕馨瑗琰韻融園藝詠卿聰瀾純毓悅昭冰爽琬茗羽希欣飄育瀅馥筠柔竹靄凝曉歡霄楓芸菲寒伊亞宜可姬舒影荔枝思麗琪瑜珺璃琨珀
"""

# Level 4: 美好寓意常用字 (适合名字的字 - 简繁体)
AUSPICIOUS_CHARS = """
福禄寿喜财吉祥如意康宁团圆满盈丰盛兴旺荣华富贵安健智慧真善美仁义礼智信忠孝廉耻温良恭俭让天地日月春夏秋冬金木水火土年月日时分秒一二三四五六七八九十百千万亿
福祿壽喜財吉祥如意康寧團圓滿盈豐盛興旺榮華富貴安健智慧真善美仁義禮智信忠孝廉恥溫良恭儉讓天地日月春夏秋冬金木水火土年月日時分秒一二三四五六七八九十百千萬億
"""

# Level 5: 特殊字符 (宗教、少数民族、关键字)
SPECIAL_CHARS = """
龢䒟瑂靉阖买提热迪丽巴黎唯法师正哈
龢䒟瑂靉闔買提熱迪麗巴黎唯法師正哈
上下中大小高低新老前后內外左右近远
"""

# Level 6: 地址和关系常用字 (简繁体)
ADDRESS_RELATION_CHARS = """
东南西北省市区县州台湾北京人民共和深圳湾座楼叔相科觉溥锋故妙音姓流产孩朝拉舅甥姑奥侄莲
東南西北省市區縣州台灣北京人民共和深圳灣座樓叔相科覺溥鋒故妙音姓流產孩朝拉舅甥姑奧姪蓮
"""

# Combine all unique characters
all_text = CORE_CHARS + SURNAMES + NAME_CHARS + AUSPICIOUS_CHARS + SPECIAL_CHARS + ADDRESS_RELATION_CHARS
unique_chars = "".join(sorted(set(all_text.replace("\n", "").replace(" ", ""))))

print(f"✨ 字符集统计 (简体 + 繁体双覆盖)")
print(f"=" * 50)
core_clean = CORE_CHARS.replace(' ', '').replace('\n', '')
surnames_clean = SURNAMES.replace(' ', '').replace('\n', '')
names_clean = NAME_CHARS.replace(' ', '').replace('\n', '')
auspicious_clean = AUSPICIOUS_CHARS.replace(' ', '').replace('\n', '')
special_clean = SPECIAL_CHARS.replace(' ', '').replace('\n', '')
address_clean = ADDRESS_RELATION_CHARS.replace(' ', '').replace('\n', '')
print(f"  核心业务字: {len(set(core_clean))} 个")
print(f"  百家姓: {len(set(surnames_clean))} 个")
print(f"  人名用字: {len(set(names_clean))} 个")
print(f"  美好寓意字: {len(set(auspicious_clean))} 个")
print(f"  特殊字符: {len(set(special_clean))} 个")
print(f"  地址关系字: {len(set(address_clean))} 个")
print(f"-" * 50)
print(f"  总计（去重后）: {len(unique_chars)} 个精选字符")
print(f"=" * 50)

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
        "--flavor=", # No flavor = TTF/OTF depending on input/conversion
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
