# Project Backlog
# 项目待办事项

> **Purpose**: Track future improvements, enhancements, and known issues that are not critical but should be addressed eventually.
> 
> **目的**: 跟踪未来的改进、增强功能和已知的非关键问题，这些问题应该最终得到解决。

---

## 🐛 Known Issues (已知问题)

### Low Priority

#### Long English Multi-line Rendering Vertical Centering
**长英文名字多行渲染的垂直居中微调**

**Issue**: 
When rendering long English names that require multi-line display (e.g., "Washington-Williamson"), there is a slight asymmetry in the vertical spacing - the top space appears slightly smaller than the bottom space.

**问题描述**:
当渲染需要多行显示的长英文名字（例如 "Washington-Williamson"）时，垂直间距存在轻微的不对称 - 上方空间明显比下方空间小。

**Impact**: 
- Visual: Minor aesthetic issue
- Functionality: Does not affect readability or functionality
- Frequency: Only affects very long English names (rare case)

**影响**:
- 视觉: 轻微的美观问题
- 功能: 不影响可读性或功能性
- 频率: 仅影响非常长的英文名字（罕见情况）

**Current Status**: 
- Attempted fix using `lineHeight` adjustment (commit a2e86bf)
- Issue persists but is minimal
- Deferred for future optimization

**当前状态**:
- 已尝试使用 `lineHeight` 调整修复（commit a2e86bf）
- 问题仍然存在但影响很小
- 推迟到未来优化

**Potential Solutions**:
1. Fine-tune the multi-line split logic in `calculateEnglishFont`
2. Adjust the rotation transform origin point
3. Use different flexbox alignment strategy
4. Consider using CSS Grid instead of Flexbox

**潜在解决方案**:
1. 微调 `calculateEnglishFont` 中的多行分割逻辑
2. 调整旋转变换的原点
3. 使用不同的 flexbox 对齐策略
4. 考虑使用 CSS Grid 而不是 Flexbox

**Test Case**:
```
http://localhost:3000/api/og/tablet?name=Washington-Williamson&type=deceased
```

**Priority**: Low 🟡  
**Created**: 2024-11-24  
**Last Updated**: 2024-11-24

---

## ✨ Future Enhancements (未来增强功能)

### Relationship Title Dropdowns
**关系称谓下拉菜单**

**Description**:
Implement dropdown menus in the application form to collect relationship titles for all tablets that require both Center and Left areas (Deceased, Ancestors, Aborted Spirits, Land Deity).

**描述**:
在申请表单中实现下拉菜单，用于收集所有需要填写中心区和左侧区的牌位的关系称谓（往生莲位、历代祖先、婴灵、地基主）。

**Universal Rule**: All tablets require both areas EXCEPT Longevity (which only needs Center) and Karmic Creditors (where Center is pre-filled).

**通用规则**：除了長生祿位（只需要中心区）和冤親債主（中心区已预填）之外，所有牌位都需要填写两个区域。

**Requirements**:
- **Honoree Relationship Dropdown** (往生者关系):
  - 先父 (Late father)
  - 先母 (Late mother)
  - 先祖父 (Late grandfather)
  - 先祖母 (Late grandmother)
  - 先曾祖父 (Late great-grandfather)
  - 先曾祖母 (Late great-grandmother)
  - 先外曾祖父 (Late maternal great-grandfather)
  - 先外曾祖母 (Late maternal great-grandmother)
  - ... (more options)

- **Petitioner Relationship Dropdown** (申请人关系):
  - 孝子 (Filial son)
  - 孝女 (Filial daughter)
  - 孝孫 (Filial grandson)
  - 孝孫女 (Filial granddaughter)
  - 孝曾孫 (Filial great-grandson)
  - 孝曾孫女 (Filial great-granddaughter)
  - 孝外曾孫 (Filial maternal great-grandson)
  - 孝外曾孫女 (Filial maternal great-granddaughter)
  - ... (more options)

**Priority**: Medium 🟠  
**Created**: 2024-11-24

---

## 🎯 Roadmap Items (路线图项目)

### Remaining Tablet Templates
**剩余牌位模板**

**Templates to Implement**:
1. ⏳ **嬰靈 (Aborted Spirits)**
   - Center: Baby spirit names
   - Left: Parents (阳上父母)

2. ⏳ **地基主 (Land Deity)**
   - Center: Address + 地基主
   - Left: Petitioner

**Priority**: High 🔴  
**Status**: Not started

---

## 📋 Maintenance Tasks (维护任务)

*No maintenance tasks at this time.*

---

**Last Updated**: November 24, 2024 (Version 1.1)  
**Maintained by**: Tablet System Development Team

