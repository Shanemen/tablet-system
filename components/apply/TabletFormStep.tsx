/**
 * Step 3: Tablet Form and Preview
 * 
 * Three states:
 * 3A - Form: Fill in tablet information
 * 3B - Preview: Show tablet preview with large text confirmation
 * 3C - Actions: Choose what to do next
 * 
 * Elder-friendly design throughout
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Check, Edit, Plus, List, ShoppingCart } from 'lucide-react'
import {
  TabletTypeValue,
  getTabletTypeConfig,
  getTabletTypeLabel,
  validateTabletFormData,
  getPreviewText,
  FormField as ConfigFormField,
} from '@/lib/tablet-types-config'
import { addTabletToCart, getTabletCountByType } from '@/lib/utils/application-storage'

interface TabletFormStepProps {
  tabletType: TabletTypeValue
  onBack: () => void
  onContinueSameType: () => void
  onSelectOtherType: () => void
  onViewCart: () => void
}

type FormState = 'filling' | 'previewing' | 'confirmed'

export function TabletFormStep({
  tabletType,
  onBack,
  onContinueSameType,
  onSelectOtherType,
  onViewCart,
}: TabletFormStepProps) {
  const config = getTabletTypeConfig(tabletType)
  const [formState, setFormState] = useState<FormState>('filling')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAddSuccess, setShowAddSuccess] = useState(false)

  if (!config) {
    return <div>無效的牌位類型</div>
  }

  const typeCount = getTabletCountByType()[tabletType] || 0

  // Handle field change
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData({ ...formData, [fieldName]: value })
    // Clear error for this field
    if (errors[fieldName]) {
      const newErrors = { ...errors }
      delete newErrors[fieldName]
      setErrors(newErrors)
    }
  }

  // Generate preview
  const handleGeneratePreview = () => {
    const validation = validateTabletFormData(tabletType, formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setFormState('previewing')
  }

  // Go back to editing
  const handleBackToEdit = () => {
    setFormState('filling')
  }

  // Confirm and add to cart
  const handleConfirm = () => {
    addTabletToCart(tabletType, formData)
    setFormState('confirmed')
    setShowAddSuccess(true)
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowAddSuccess(false)
    }, 2000)
  }

  // Continue adding same type
  const handleContinueAdding = () => {
    setFormData({}) // Clear form
    setFormState('filling')
    onContinueSameType()
  }

  // Render form field based on type
  const renderFormField = (field: ConfigFormField) => {
    const value = formData[field.name] || ''
    const error = errors[field.name]

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="space-y-3">
          <label htmlFor={field.name} className="form-label block text-xl font-semibold text-foreground">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            rows={4}
            className="form-input-large w-full text-xl p-4 rounded-md border-2 border-input bg-background"
            aria-invalid={!!error}
            aria-describedby={error ? `${field.name}-error` : undefined}
          />
          {field.helpText && !error && (
            <p className="text-base text-muted-foreground">{field.helpText}</p>
          )}
          {error && (
            <p id={`${field.name}-error`} className="text-red-600 text-base" role="alert">
              {error}
            </p>
          )}
        </div>
      )
    }

    // Default: text input
    return (
      <div key={field.name} className="space-y-3">
        <label htmlFor={field.name} className="form-label block text-xl font-semibold text-foreground">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <Input
          id={field.name}
          type="text"
          value={value}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="form-input-large h-16 text-xl"
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        />
        {field.helpText && !error && (
          <p className="text-base text-muted-foreground">{field.helpText}</p>
        )}
        {error && (
          <p id={`${field.name}-error`} className="text-red-600 text-base" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }

  // STATE 3A: FILLING FORM
  if (formState === 'filling') {
    return (
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h2 className="form-step-title text-3xl font-bold text-foreground mb-2">
            {getTabletTypeLabel(tabletType)} - 第 {typeCount + 1} 位
          </h2>
          {config.detailedDescription && (
            <p className="text-lg text-muted-foreground">{config.detailedDescription}</p>
          )}
        </div>

        {/* Form */}
        <Card className="p-6 space-y-6">
          {config.fields.map((field) => renderFormField(field))}
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="h-14 text-lg font-semibold order-2 sm:order-1"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            返回
          </Button>
          <Button
            onClick={handleGeneratePreview}
            className="btn-primary-elder h-14 text-lg font-semibold flex-1 order-1 sm:order-2"
          >
            生成牌位預覽
          </Button>
        </div>
      </div>
    )
  }

  // STATE 3B: PREVIEWING
  if (formState === 'previewing') {
    const previewText = getPreviewText(tabletType, formData)

    return (
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h2 className="form-step-title text-3xl font-bold text-foreground mb-2">
            請核對牌位信息
          </h2>
          <p className="text-lg text-muted-foreground">
            請仔細確認以下信息是否正確
          </p>
        </div>

        {/* Preview Section */}
        <Card className="p-6 space-y-8">
          {/* Tablet Image Preview */}
          <div className="flex justify-center bg-muted/30 rounded-lg p-4">
            <img
              src={`/api/og/tablet?name=${encodeURIComponent(previewText)}&type=${tabletType}`}
              alt="牌位預覽"
              className="max-w-full h-auto rounded-lg shadow-lg"
              style={{ maxHeight: '40vh' }}
            />
          </div>

          {/* Large Text Confirmation */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 text-center">
            <p className="text-lg text-muted-foreground mb-3">請核對信息：</p>
            <p className="preview-text-large text-3xl font-bold text-foreground tracking-wider">
              {previewText}
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={handleBackToEdit}
            variant="outline"
            className="h-16 text-lg font-semibold"
          >
            <Edit className="mr-2 h-5 w-5" />
            有錯，返回修改
          </Button>
          <Button
            onClick={handleConfirm}
            className="btn-primary-elder h-16 text-lg font-semibold bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-6 w-6" />
            確認無誤，加入清單
          </Button>
        </div>
      </div>
    )
  }

  // STATE 3C: CONFIRMED - Show next actions
  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showAddSuccess && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-center gap-3 text-green-700">
            <Check className="h-8 w-8" />
            <p className="text-2xl font-bold">已成功添加 1 位</p>
          </div>
        </Card>
      )}

      {/* Title */}
      <div>
        <h2 className="form-step-title text-3xl font-bold text-foreground mb-2">
          添加成功！
        </h2>
        <p className="text-lg text-muted-foreground">
          您已添加了 {typeCount + 1} 個{getTabletTypeLabel(tabletType)}，請選擇下一步操作
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Continue adding same type */}
        <button
          onClick={handleContinueAdding}
          className="p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-muted/50 text-left transition-all min-h-[100px] flex items-center justify-between group"
        >
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              繼續添加{getTabletTypeLabel(tabletType)}
            </h3>
            <p className="text-base text-muted-foreground">
              為同類型牌位添加更多名字
            </p>
          </div>
          <ArrowLeft className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors rotate-180" />
        </button>

        {/* Select other type */}
        <button
          onClick={onSelectOtherType}
          className="p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-muted/50 text-left transition-all min-h-[100px] flex items-center justify-between group"
        >
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <List className="h-6 w-6 text-primary" />
              選擇其他類型
            </h3>
            <p className="text-base text-muted-foreground">
              返回選擇其他牌位類型
            </p>
          </div>
          <ArrowLeft className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors rotate-180" />
        </button>

        {/* View cart and submit */}
        <button
          onClick={onViewCart}
          className="p-6 rounded-lg border-2 border-primary bg-primary/10 hover:bg-primary/20 text-left transition-all min-h-[100px] flex items-center justify-between group"
        >
          <div>
            <h3 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              完成添加，查看清單
            </h3>
            <p className="text-base text-primary/80">
              查看所有已添加的牌位並提交申請
            </p>
          </div>
          <ArrowLeft className="h-6 w-6 text-primary transition-colors rotate-180" />
        </button>
      </div>
    </div>
  )
}

