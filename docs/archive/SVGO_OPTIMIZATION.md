# SVG 模板优化指南

## 概述

SVG 模板文件从设计工具导出时可能包含大量冗余数据，导致文件过大（500KB+）。使用 SVGO 可以自动优化 SVG 文件，减少 60-80% 的文件大小，同时保持视觉质量。

## 快速开始

### 1. 安装 SVGO

```bash
npm install --save-dev svgo
```

### 2. 优化 SVG

```bash
# 使用项目配置优化
npx svgo --config svgo.config.js -i input.svg -o output.svg

# 示例：优化长生禄位模板
npx svgo --config svgo.config.js \
  -i "./public/long-living-template-original.svg" \
  -o "./public/long-living-template-optimized.svg"
```

### 3. 查看优化结果

访问测试页面查看优化前后的对比：
```
http://localhost:3000/test-svg
```

## 优化结果示例

**长生禄位模板：**
- **原始大小**: 581 KB
- **优化后**: 154 KB
- **减少**: 73.5% (427 KB)
- **视觉质量**: 无可见差异 ✅

## 配置文件说明

`svgo.config.js` 使用保守设置，确保：
- ✅ 保留 `viewBox`（重要！）
- ✅ 保留必要的 ID 和属性
- ✅ 路径精度设置为 2 位小数（平衡质量和大小）
- ✅ 合并相同样式的路径
- ✅ 移除元数据、注释、编辑器数据
- ✅ 优化颜色值（`#3C362E` → `#3c362e`）

## 何时使用

- ✅ **总是优化** SVG 模板后再用于生产环境
- ✅ **优化后测试** 确保视觉质量可接受
- ✅ **使用保守设置** 保持细节
- ⚠️ **如果优化后仍 > 100KB**: 考虑转换为 PNG（320×848，质量 90%）

## 测试流程

1. 优化 SVG 文件
2. 在测试页面 (`/test-svg`) 对比原始和优化版本
3. 测试在 Satori 中的兼容性
4. 如果质量可接受，在生产环境使用优化版本

## 文件位置

- **配置文件**: `svgo.config.js`
- **原始模板**: `public/long-living-template-original.svg` (581 KB)
- **优化模板**: `public/long-living-template-optimized.svg` (154 KB)
- **测试页面**: `app/test-svg/page.tsx`

## 注意事项

- SVGO 会修改 SVG 文件，建议保留原始文件备份
- 优化后检查 `viewBox` 是否正确保留
- 如果 SVG 包含动画或脚本，可能需要调整配置
- 对于非常复杂的 SVG（> 200KB 优化后），考虑转换为 PNG

## 相关文档

- [SVGO 官方文档](https://github.com/svgo/svgo)
- [TDD.md - SVG Template Optimization](./TDD.md#21-svg-template-optimization-option-use-svgo)

