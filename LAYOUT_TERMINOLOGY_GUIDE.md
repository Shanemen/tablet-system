# Layout Terminology Guide
# 布局术语指南

> **Purpose**: Standardized terminology for tablet template areas to ensure clear communication between team members, designers, and AI agents.
> 
> **目的**: 为牌位模板区域建立标准化术语，确保团队成员、设计师和 AI 助手之间的清晰沟通。

---

## 📘 Core Concepts / 核心概念

Every tablet template has **areas** where dynamic content (names) will be inserted. We use **two types of terminology** depending on the context:

每个牌位模板都有**区域**用于插入动态内容（名字）。我们根据上下文使用**两种类型的术语**：

---

## ⚠️ Universal Design Rule / 通用设计规则

### **CRITICAL**: All Tablets Require Both Areas (Except Longevity)

**English**:
- **Default Rule**: ALL tablet templates MUST fill BOTH the Center Honoree Area AND the Left Petitioner Area
- **Only Exception**: 長生祿位 (Longevity) is the ONLY template that does NOT require specifying the living petitioner
- **Special Case**: 冤親債主 (Karmic Creditors) technically fills both areas, but the honoree ("累劫冤親債主") is pre-filled in the SVG template, so only the Left Petitioner Area needs dynamic rendering

**中文**:
- **默认规则**：所有牌位模板都必须填写中央受祭者区域和左侧阳上者区域
- **唯一例外**：長生祿位（Longevity）是唯一不需要指定阳上者的模板
- **特殊情况**：冤親債主（Karmic Creditors）技术上也填写了两个区域，但受祭者（"累劫冤親債主"）已经在 SVG 模板中固定，所以只有左侧阳上者区域需要动态渲染

### Quick Summary Table

| Template | Center Area Required | Left Area Required | Notes |
|----------|---------------------|-------------------|-------|
| **Longevity** 長生祿位 | ✅ Yes | ❌ **NO** | **Only exception** - no petitioner needed |
| **Karmic Creditors** 冤親債主 | ✅ Pre-filled in SVG | ✅ Yes | Honoree is fixed: "累劫冤親債主" |
| **Deceased** 往生蓮位 | ✅ Yes | ✅ Yes | Both must be filled |
| **Ancestors** 歷代祖先 | ✅ Yes | ✅ Yes | Both must be filled |
| **Aborted Spirits** 嬰靈 | ✅ Yes | ✅ Yes | Both must be filled |
| **Land Deity** 地基主 | ✅ Yes | ✅ Yes | Both must be filled |

---

## 🎨 Layout/Position Terms (布局/位置术语)

**Use these when discussing:**
- SVG coordinates and measurements
- Visual design and spacing
- Template layout structure
- Technical implementation

**适用场景：**
- SVG 坐标和测量
- 视觉设计和间距
- 模板布局结构
- 技术实现

| English | Chinese | Description |
|---------|---------|-------------|
| **Center Area** | 中央区域 | The main vertical area in the center of the tablet |
| **Left Area** | 左侧区域 | The narrow vertical area on the left side |


**Example Usage:**
```
"The center area coordinates are X: 45-275, Y: 280-620"
"Measure the left area - it's very narrow at only 50px wide"
"The font size in the center area is 42px"
```

---

## 💡 Semantic/Purpose Terms (语义/用途术语)

**Use these when discussing:**
- What content/data goes where
- Business logic and user stories
- Database fields and API parameters
- User-facing features

**适用场景：**
- 内容/数据放置位置
- 业务逻辑和用户故事
- 数据库字段和 API 参数
- 面向用户的功能

| English | Chinese | Description |
|---------|---------|-------------|
| **Honoree Area** | 受祭者区域 | Where the blessed/deceased person's name appears |
| **Petitioner Area** | 阳上者区域 | Where the applicant's name appears (format: "陽上 XX 敬薦") |

### Detailed Definitions

#### Honoree (受祭者)
- **Definition**: The person being honored, blessed, or commemorated on the tablet
- **定义**: 牌位上被祈福、超度或纪念的对象
- **Examples**: 
  - Living person receiving blessings (長生祿位)
  - Deceased person being commemorated (往生蓮位)
  - Ancestors (歷代祖先)
  - Aborted spirits (嬰靈)
  - Land deity (地基主)

#### Petitioner (阳上者)
- **Definition**: The living person making the offering/request
- **定义**: 在世的申请人/敬献者
- **Format**: "陽上 [Name] 敬薦" or "陽上 [Name] 叩薦"
- **Examples**:
  - "陽上 陳小華 敬薦"
  - "陽上 孝孫 張三 叩薦"

**Example Usage:**
```
"The honoree area displays the deceased person's name"
"We need to add the petitioner's name to the database"
"The petitioner area shows who's making the offering"
```

---

## 💬 Best Practice: Combined Terms (最佳实践：组合术语)

For **maximum clarity**, combine both types:

为了**最大程度的清晰度**，结合两种术语：

### Format: `[Position] [Semantic] Area`

**Examples:**
- ✅ "center honoree area" - 中央受祭者区域
- ✅ "left petitioner area" - 左侧阳上者区域
- ✅ "center area (honoree)" - 中央区域（受祭者）

This tells us:
1. **WHERE** it is located (position)
2. **WHAT** it represents (semantic meaning)

---

## 📊 Template Configuration Overview

| Template Type | Center Area | Left Area |
|--------------|-------------|-----------|
| **Longevity**<br>長生祿位 | ✅ **Center Honoree Area**<br>被祈福者（在世） | ❌ **None** (Only exception) |
| **Karmic Creditors**<br>冤親債主 | ✅ **Pre-filled in SVG**<br>"累劫冤親債主" | ✅ **Left Petitioner Area**<br>申请人（阳上） |
| **Deceased**<br>往生蓮位 | ✅ **Center Honoree Area**<br>往生者 | ✅ **Left Petitioner Area**<br>阳上孝属 |
| **Ancestors**<br>歷代祖先 | ✅ **Center Honoree Area**<br>XX氏历代祖先 | ✅ **Left Petitioner Area**<br>阳上后裔 |
| **Aborted Spirits**<br>嬰靈 | ✅ **Center Honoree Area**<br>婴灵 | ✅ **Left Petitioner Area**<br>阳上父母 |
| **Land Deity**<br>地基主 | ✅ **Center Honoree Area**<br>地址 + 地基主 | ✅ **Left Petitioner Area**<br>阳上申请人 |

---

## 🔧 Code Implementation

In TypeScript code, we use both terminologies:

```typescript
// In active-areas-config.ts

interface ActiveArea {
  id: string              // Position-based identifier
  purpose: 'honoree' | 'petitioner'  // Semantic purpose
  x: number              // Layout coordinates
  y: number
  width: number
  height: number
  fontSize: number
  lineHeight: number
}

// Example: Longevity Template
{
  id: 'center',           // Position: center
  purpose: 'honoree',     // Semantic: honoree (被祈福者)
  x: 45,
  y: 312,
  width: 230,
  height: 300,
  fontSize: 42,
  lineHeight: 42,
}

// Example: Karmic Creditors Template
{
  id: 'left-petitioner',  // Position + Semantic (best practice!)
  purpose: 'petitioner',  // Semantic: petitioner (阳上者)
  x: 8,
  y: 350,
  width: 50,
  height: 320,
  fontSize: 20,
  lineHeight: 20,
}
```

---

## 🎯 Communication Guidelines

### When to Use Position Terms (何时使用位置术语)

✅ **Use for:**
- Measuring coordinates
- Discussing visual design
- Adjusting layout spacing
- Technical implementation

**Examples:**
- "Can you measure the **left area** coordinates?"
- "The **center area** needs more vertical space"
- "Move the text down 10px in the **center area**"
- "The **left area** is too narrow for long names"

---

### When to Use Semantic Terms (何时使用语义术语)

✅ **Use for:**
- Discussing content/data
- Business logic
- User stories
- Database design

**Examples:**
- "Display the **honoree's** name in traditional Chinese"
- "The **petitioner area** shows the applicant's information"
- "We need to store **petitioner** names in the database"
- "The **honoree** can be living or deceased"

---

### When to Use Combined Terms (何时使用组合术语)

✅ **Use for maximum clarity** (recommended for complex discussions):

**Examples:**
- "The **center honoree area** needs a larger font size"
- "Add the applicant's name to the **left petitioner area**"
- "The **center area** (honoree) displays the deceased person's name"
- "Measure the **left petitioner area** coordinates"

---

## 📐 Coordinate Reference

### Standard Dimensions (标准尺寸)

| Template | Center Area (Honoree) | Left Area (Petitioner) |
|----------|----------------------|----------------------|
| **Longevity** | X: 45-275, Y: 312-612<br>Font: 42px | N/A |
| **Karmic Creditors** | N/A (Fixed text) | X: 8-58, Y: 350-670<br>Font: 20px |
| **Other Templates** | X: 45-275, Y: 280-620<br>Font: 46px | X: 15-75, Y: 280-620<br>Font: 32px |

*Note: These are approximate values. Always verify with the actual SVG template.*

---

## 🌐 Multi-language Support

### Area Names in Different Contexts

| Context | Center Area | Left Area |
|---------|-------------|-----------|
| **Code** (English) | `center` / `honoree` | `left-petitioner` |
| **UI** (繁體中文) | 中央區域 / 受祭者 | 左側區域 / 陽上者 |
| **Comments** (中文) | 中心位置 / 被祈福者 | 左邊位置 / 申請人 |
| **Documentation** | Center Honoree Area | Left Petitioner Area |

---

## 🚀 Quick Reference Cheat Sheet

### For Designers 给设计师
```
Position Terms:
- Center Area (中央区域)
- Left Area (左侧区域)

Use when: Discussing coordinates, spacing, layout
```

### For Developers 给开发者
```
Code Terms:
- id: 'center' | 'left-petitioner'
- purpose: 'honoree' | 'petitioner'

Use in: TypeScript interfaces, function parameters
```

### For Product Managers 给产品经理
```
Semantic Terms:
- Honoree Area (受祭者区域) - Who is being honored
- Petitioner Area (阳上者区域) - Who is requesting

Use when: Writing user stories, requirements
```

### For AI Agents 给 AI 助手
```
Best Practice: Use combined terms
- "center honoree area" 
- "left petitioner area"

This provides both location and meaning context.
```

---

## 📋 Detailed Requirements by Template Type

### 往生蓮位 (Deceased Tablet)

**Design Rule**: Both Center and Left areas MUST be filled (following the universal rule).

**设计规则**：中心区和左侧区都必须填写（遵循通用规则）。

#### Format Structure

**Center Honoree Area (中央受祭者区域)**:
- **Content**: Relationship Title + Deceased's Name
- **格式**: 关系称谓 + 往生者名字
- **Examples**:
  - `先父 胡澤明` (Late father Hu Zeming)
  - `先曾祖父 梁熙` (Late great-great-grandfather Liang Xi)
  - `先外曾祖母 歐陽叔貞` (Late great-great-grandmother Ouyang Shuzhen)

**Left Petitioner Area (左侧阳上者区域)**:
- **Content**: Filial Title + Petitioner's Name
- **格式**: 孝属称谓 + 申请人名字
- **Examples**:
  - `孝子 胡靜安` (Filial son Hu Jing'an)
  - `孝曾孫女 梁思聰` (Filial great-great-granddaughter Liang Sicong)
  - `孝外曾孫女 梁燦燦` (Filial great-great-granddaughter from maternal side Liang Cancan)

#### Data Collection

**Relationship titles** will be collected via dropdown menus in the application form:
- Honoree relationship (e.g., 先父, 先母, 先祖父, 先祖母, etc.)
- Petitioner relationship (e.g., 孝子, 孝女, 孝孫, 孝孫女, etc.)

#### Test Cases

```
1. 曾祖父 - 曾孙女
   Honoree: 先曾祖父 梁熙
   Petitioner: 孝曾孫女 梁思聰
   URL: /api/og/tablet?name=先曾祖父%20梁熙&applicant=孝曾孫女%20梁思聰&type=deceased

2. 父亲 - 儿子
   Honoree: 先父 胡澤明
   Petitioner: 孝子 胡靜安
   URL: /api/og/tablet?name=先父%20胡澤明&applicant=孝子%20胡靜安&type=deceased

3. 外曾祖母 - 外曾孙女
   Honoree: 先外曾祖母 歐陽叔貞
   Petitioner: 孝外曾祖母 梁燦燦
   URL: /api/og/tablet?name=先外曾祖母%20歐陽叔貞&applicant=孝外曾祖母%20梁燦燦&type=deceased
```

---

## 📝 Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2024-11-24 | 1.2 | **Major update**: Clarified universal design rule - all tablets require both areas except Longevity |
| 2024-11-24 | 1.1 | Added Special Requirements section for Deceased Tablets |
| 2024-11-24 | 1.0 | Initial terminology guide created |

---

## 🤝 Contributing

When adding new terms or updating this guide:
1. Use clear, descriptive language in both English and Chinese
2. Provide examples for each term
3. Update the Quick Reference table
4. Maintain consistency with existing codebase

---

**Last Updated**: November 24, 2024  
**Maintained by**: Tablet System Development Team

