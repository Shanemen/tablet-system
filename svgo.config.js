module.exports = {
  // 简化配置 - 使用 SVGO 3.x 兼容的设置
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // 保留 viewBox（重要！）
          removeViewBox: false,
          // 清理 ID
          cleanupIds: {
            remove: false,
            minify: true,
          },
          // 优化路径数据
          convertPathData: {
            floatPrecision: 2,
            transformPrecision: 2,
          },
          // 合并路径
          mergePaths: {
            force: false,
          },
          // 转换颜色
          convertColors: {
            names2hex: true,
            rgb2hex: true,
            shorthex: true,
          },
          // 不转换形状为路径
          convertShapeToPath: false,
        }
      }
    },
    // 移除尺寸属性（保留 viewBox）
    'removeDimensions',
    // 排序属性
    'sortAttrs'
  ]
}
