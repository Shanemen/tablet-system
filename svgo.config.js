module.exports = {
  // 保守优化配置 - 保持视觉质量
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // 保留 viewBox（重要！）
          // removeViewBox 不在 preset-default 中，需要单独配置
          // 清理 ID 但保留必要的
          cleanupIds: {
            remove: false,
            minify: true,
            prefix: {
              toString: () => 'svg-'
            }
          },
          // 压缩样式
          minifyStyles: true,
          // 优化路径数据（减少小数位数但保持精度）
          convertPathData: {
            floatPrecision: 2, // 保留 2 位小数（平衡质量和大小）
            transformPrecision: 2,
            makeArcs: {
              threshold: 2.5,
              tolerance: 0.5
            }
          },
          // 合并路径（相同样式的路径）
          mergePaths: {
            force: false,
            noSpaceAfterFlags: false
          },
          // 移除无用的 stroke 和 fill
          removeUselessStrokeAndFill: true,
          // 移除隐藏元素
          removeHiddenElems: true,
          // 移除空属性
          removeEmptyAttrs: true,
          // 移除空容器
          removeEmptyContainers: true,
          // 移除元数据
          removeMetadata: true,
          // 移除编辑器数据
          removeEditorsNSData: true,
          // 移除注释
          removeComments: true,
          // 移除未使用的定义
          removeUnusedNS: true,
          // 移除 DOCTYPE
          removeDoctype: true,
          // 移除 XML 处理指令
          removeXMLProcInst: true,
          // 移除未知内容
          removeUnknownsAndDefaults: {
            keepDataAttrs: false,
            keepAriaAttrs: true,
            keepRoleAttr: false
          },
          // 转换颜色（优化颜色值）
          convertColors: {
            names2hex: true,
            rgb2hex: true,
            shorthex: true,
            shortname: true
          },
          // 不转换形状（保持原始形状）
          convertShapeToPath: false,
          // 不移动组属性（保持结构）
          moveGroupAttrsToElems: false,
          // 不移动样式到属性
          moveElemsAttrsToGroup: false,
          // 不内联样式
          inlineStyles: false
        }
      }
    },
    // 保留 viewBox（重要！不要移除）
    {
      name: 'removeViewBox',
      active: false // 禁用，保留 viewBox
    },
    // 移除尺寸属性（保留 viewBox）
    'removeDimensions',
    // 移除默认属性
    'removeDefaults',
    // 移除未使用的样式
    'removeUnusedStyles',
    // 保留 style 元素
    {
      name: 'removeStyleElement',
      active: false
    },
    // 保留 title 和 desc（可访问性）
    {
      name: 'removeTitle',
      active: false
    },
    {
      name: 'removeDesc',
      active: false
    },
    // 清理属性
    {
      name: 'removeAttrs',
      params: {
        attrs: ['data-name', 'data-id'] // 移除不必要的属性，但保留 id（如果需要）
      }
    },
    // 排序属性（提高可读性）
    'sortAttrs'
  ]
}
