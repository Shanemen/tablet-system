# 字体优化与子集化策略 (Font Optimization & Subsetting Strategy)

## ✅ 优化成果 (2024-11-23)

**成功解决了字体粗细不一的问题！**

### 问题根源
原字体子集包含 **3867 个字符**（文件大小 298 KB），虽然字符多，但包含了大量不必要的字符，导致：
1. 文件体积过大
2. 部分常用字缺失（如"唯"字）导致回退到系统粗体
3. 字符集混乱，没有系统性分类

### 优化方案
采用**精简策略**：只包含牌位业务实际需要的字符

**最终结果：**
- 字符数量：**666 个精选字符**（减少 82.8%）
- 文件大小：**186 KB**（减少 37.6%）  
- 字符覆盖：核心业务 + 百家姓 + 常见名字用字
- 视觉效果：✅ 字体粗细一致，不再回退

## 1. 当前字体方案

**使用字体：Noto Serif TC (思源宋体)**
- 风格：庄重、严谨、碑刻感
- 文件：`NotoSerifTC-Subset.otf` (186 KB)
- 格式：OpenType Font

## 2. 字符集覆盖范围 (Character Coverage)

**总计：666 个精选字符**

### 层级 1：核心业务字 (42 个)
牌位模板的固定词汇。

```text
佛光注照長生祿位佛力超薦往生蓮位
陽上敬薦叩薦氏歷代祖先累劫冤親債主
之地基主嬰靈菩薩父母孝孫兒女媳
```

### 层级 2：百家姓 (367 个)
覆盖完整的百家姓及复姓。

```text
赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许
何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章
云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳
... (完整列表见 scripts/generate-font-subset.py)
欧阳 上官 皇甫 令狐 诸葛
```

### 层级 3：常用名字字 (298 个)
高频人名用字（男性、女性）。

**男性常用：** 伟刚勇毅俊峰强军平保东文辉力明永健世广志义...  
**女性常用：** 秀娟英华慧巧美娜静淑惠珠翠雅芝玉萍红娥玲芬芳...

### 层级 4：特殊字符 (12 个)
宗教用字、少数民族常用字。

```text
龢䒟瑂靉阖买提热迪丽巴黎
```

## 3. 使用方法

### 重新生成字体子集

```bash
cd tablet-system

# 1. 确保已安装 fonttools
pip install fonttools

# 2. 确保有源字体文件（自动从 fontsource 获取）
# NotoSerifTC-Regular.woff2 (1.3 MB) 来自 @fontsource/noto-serif-tc

# 3. 运行生成脚本
python3 scripts/generate-font-subset.py

# 输出：
# ✅ Font subset generation complete!
# Output: public/fonts/NotoSerifTC-Subset.otf
# Size: 185.95 KB
```

### 测试字体

访问以下页面测试字体显示效果：
- `/font-test` - 字体子集测试页（包含所有字符类别）
- `/api/og/tablet?type=長生祿位&name=上弘下唯法师` - OG Image 生成测试

## 4. 技术细节

### 字体生成配置

```python
# scripts/generate-font-subset.py
INPUT_FONT = "NotoSerifTC-Regular.woff2"  # 1.29 MB 完整字体
OUTPUT_FONT = "public/fonts/NotoSerifTC-Subset.otf"  # 186 KB 子集

args = [
    INPUT_FONT,
    "--text-file=subset_chars.txt",
    "--output-file={OUTPUT_FONT}",
    "--layout-features=*",  # 保留所有排版特性
    "--flavor=",  # 输出 OTF 格式
]
```

### API 路由配置

```typescript
// app/api/og/tablet/route.tsx
const fontUrl = `${request.nextUrl.origin}/fonts/NotoSerifTC-Subset.otf`
const fontResponse = await fetch(fontUrl)
const fontData = await fontResponse.arrayBuffer()
```

## 5. 未来优化方向

1. **按需扩展**：如果用户输入生僻字，可以逐步添加到字符集
2. **多版本字体**：考虑提供"精简版"和"完整版"两个选项
3. **字体缓存**：利用 CDN 和浏览器缓存提升加载速度

---

## 附录：完整字符列表

完整字符列表定义在 `scripts/generate-font-subset.py` 中，包含：
- 42 个核心业务字
- 367 个百家姓（含复姓）
- 298 个常用名字字（男女）
- 12 个特殊字符（宗教、少数民族）

**总计：666 个精选字符**

