import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  helpText?: string
  children: ReactNode
  htmlFor?: string
}

/**
 * 表单字段组件
 * 
 * 统一表单标签、必填标记、帮助文字的样式和布局
 */
export function FormField({ 
  label, 
  required = false, 
  helpText, 
  children,
  htmlFor 
}: FormFieldProps) {
  return (
    <div>
      <label 
        htmlFor={htmlFor} 
        className="form-label"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {helpText && (
          <span className="text-sm text-muted-foreground font-normal ml-2">
            （{helpText}）
          </span>
        )}
      </label>
      {children}
    </div>
  )
}

