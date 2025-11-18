import { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  narrow?: boolean
}

/**
 * 标准页面布局组件
 * 
 * @param narrow - 如果为 true，使用窄宽度容器 (max-w-3xl)，适合表单页面
 *                 如果为 false，使用标准宽度容器 (max-w-6xl)，适合列表页面
 */
export function PageLayout({ children, narrow = false }: PageLayoutProps) {
  return (
    <div className="page-container">
      <div className={narrow ? 'page-content-narrow' : 'page-content'}>
        {children}
      </div>
    </div>
  )
}

