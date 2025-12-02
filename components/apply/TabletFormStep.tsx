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

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Check, Edit, Plus, List, ShoppingCart, Trash2 } from 'lucide-react'
import {
  TabletTypeValue,
  getTabletTypeConfig,
  getTabletTypeLabel,
  validateTabletFormData,
  getPreviewText,
  getPetitionerText,
  FormField as ConfigFormField,
} from '@/lib/tablet-types-config'
import { addTabletToCart, getTabletCountByType, getCartTabletsByType, removeTabletFromCart, TabletItem } from '@/lib/utils/application-storage'
import { convertToTraditional } from '@/lib/utils/chinese-converter-client'

interface TabletFormStepProps {
  tabletType: TabletTypeValue
  onBackToMenu: () => void
}

type FormState = 'filling' | 'previewing' | 'confirmed'

export function TabletFormStep({
  tabletType,
  onBackToMenu,
}: TabletFormStepProps) {
  const config = getTabletTypeConfig(tabletType)
  const [formState, setFormState] = useState<FormState>('filling')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [existingTablets, setExistingTablets] = useState<TabletItem[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [convertedTexts, setConvertedTexts] = useState<{ honoree: string; petitioner: string }>({ honoree: '', petitioner: '' })

  // Load existing tablets on mount and when type changes
  useEffect(() => {
    refreshExistingTablets()
  }, [tabletType])

  const refreshExistingTablets = () => {
    const tabletsByType = getCartTabletsByType()
    setExistingTablets(tabletsByType[tabletType] || [])
  }

  const handleDeleteExisting = (tabletId: string) => {
    if (deleteConfirm === tabletId) {
      removeTabletFromCart(tabletId)
      refreshExistingTablets()
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(tabletId)
      setTimeout(() => {
        setDeleteConfirm(null)
      }, 3000)
    }
  }

  if (!config) {
    return <div>無效的牌位類型</div>
  }

  const typeCount = existingTablets.length

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

  // Generate preview with smart Chinese conversion
  const handleGeneratePreview = async () => {
    const validation = validateTabletFormData(tabletType, formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    
    setFormState('previewing')
    
    try {
      // Smart conversion: language + text detection
      const previewText = getPreviewText(tabletType, formData)
      const traditionalText = await convertToTraditional(previewText)
      
      const petitionerText = getPetitionerText(tabletType, formData)
      const traditionalPetitioner = petitionerText 
        ? await convertToTraditional(petitionerText)
        : ''
      
      setConvertedTexts({
        honoree: traditionalText,
        petitioner: traditionalPetitioner
      })
    } catch (error) {
      console.error('转换失败:', error)
      // Fallback: use original text if conversion fails
      const previewText = getPreviewText(tabletType, formData)
      const petitionerText = getPetitionerText(tabletType, formData)
      setConvertedTexts({
        honoree: previewText,
        petitioner: petitionerText || ''
      })
    }
  }

  // Go back to editing
  const handleBackToEdit = () => {
    setFormState('filling')
  }

  // Confirm and add to cart
  const handleConfirm = async () => {
    await addTabletToCart(tabletType, formData)
    refreshExistingTablets()
    setFormState('confirmed')
  }

  // Continue adding same type (Add more)
  const handleContinueAdding = () => {
    setFormData({}) // Clear form
    setFormState('filling')
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
        {/* Title with count badge */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="form-step-title text-3xl font-bold text-foreground">
              {getTabletTypeLabel(tabletType)}
            </h2>
            {existingTablets.length > 0 && (
              <div className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-lg font-bold">
                {existingTablets.length} 位
              </div>
            )}
          </div>
          {config.detailedDescription && (
            <p className="text-lg text-muted-foreground">{config.detailedDescription}</p>
          )}
        </div>

        {/* Existing tablets list - 简化布局 */}
        {existingTablets.length > 0 && (
          <div className="space-y-3">
            {existingTablets.map((tablet, index) => {
              const displayText = getPreviewText(tablet.tabletType, tablet.formData)
              const isConfirmingDelete = deleteConfirm === tablet.id

              return (
                <div
                  key={tablet.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-lg text-muted-foreground">
                        第 {index + 1} 位
                      </span>
                      <span className="text-xl font-semibold text-foreground">
                        {displayText}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteExisting(tablet.id)}
                    variant={isConfirmingDelete ? 'destructive' : 'outline'}
                    className="h-12 px-4 text-base"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    {isConfirmingDelete ? '確認刪除' : '刪除'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {/* Form - Add another */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            {existingTablets.length > 0 ? '添加更多' : '填寫資料'} - 第 {typeCount + 1} 位
          </h3>
          <div className="space-y-4">
            {config.fields.map((field) => renderFormField(field))}
          </div>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleGeneratePreview}
            className="btn-primary-elder flex-1"
          >
            預覽牌位
          </Button>
          <Button
            onClick={onBackToMenu}
            variant="ghost"
            className="btn-secondary-elder"
          >
            返回選單
          </Button>
        </div>
      </div>
    )
  }

  // STATE 3B: PREVIEWING
  if (formState === 'previewing') {
    // Build API URL with converted (traditional) text
    const apiUrl = new URL('/api/og/tablet', window.location.origin)
    apiUrl.searchParams.set('name', convertedTexts.honoree)
    apiUrl.searchParams.set('type', tabletType)
    if (convertedTexts.petitioner) {
      apiUrl.searchParams.set('applicant', convertedTexts.petitioner)
    }

    // Build combined confirmation text with commas
    let confirmationText = ''
    
    if (tabletType === 'karmic-creditors') {
      // For karmic-creditors: only show name once (it's both honoree and petitioner)
      confirmationText = convertedTexts.honoree
    } else if (tabletType === 'aborted-spirits') {
      // For aborted-spirits: show baby name + parents
      const confirmationParts = [convertedTexts.honoree]
      if (convertedTexts.petitioner) {
        confirmationParts.push(convertedTexts.petitioner)
      }
      confirmationText = confirmationParts.join('，')
    } else {
      // For other types: combine honoree and petitioner if both exist
      const confirmationParts = [convertedTexts.honoree]
      if (convertedTexts.petitioner) {
        confirmationParts.push(convertedTexts.petitioner)
      }
      confirmationText = confirmationParts.join('，')
    }

    return (
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h2 className="form-step-title text-3xl font-bold text-foreground mb-2">
            請核對牌位信息
          </h2>
          <p className="text-xl text-primary font-semibold">
            {confirmationText}
          </p>
        </div>

        {/* Preview Section */}
        {/* Tablet Image Preview */}
        <div className="flex justify-center bg-muted/30 rounded-lg p-4">
          <img
            src={apiUrl.toString()}
            alt="牌位預覽"
            className="max-w-full h-auto rounded-lg shadow-lg"
            style={{ maxHeight: '75vh' }}
          />
        </div>

        {/* Action Buttons - Primary on top */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleConfirm}
            className="btn-primary-elder bg-green-600 hover:bg-green-700"
          >
            確認，加入清單
          </Button>
          <Button
            onClick={handleBackToEdit}
            variant="ghost"
            className="btn-secondary-elder"
          >
            返回修改
          </Button>
        </div>
      </div>
    )
  }

  // STATE 3C: CONFIRMED - Success page with fixed title + 2 buttons
  return (
    <div className="space-y-8">
      {/* Success Title with count badge */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="form-step-title text-3xl font-bold text-foreground">
            添加成功！
          </h2>
        </div>
      </div>

      {/* Type header with count badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">
          {getTabletTypeLabel(tabletType)}
        </h3>
        <div className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-lg font-bold">
          {existingTablets.length} 位
        </div>
      </div>

      {/* Added tablets list - 简化布局 */}
      <div className="space-y-3">
        {existingTablets.map((tablet, index) => {
          const displayText = getPreviewText(tablet.tabletType, tablet.formData)
          const isConfirmingDelete = deleteConfirm === tablet.id

          return (
            <div
              key={tablet.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg text-muted-foreground">
                    第 {index + 1} 位
                  </span>
                  <span className="text-xl font-semibold text-foreground">
                    {displayText}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => handleDeleteExisting(tablet.id)}
                variant={isConfirmingDelete ? 'destructive' : 'outline'}
                className="h-12 px-4 text-base"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                {isConfirmingDelete ? '確認刪除' : '刪除'}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Two buttons: Add more + Go Back to Menu */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleContinueAdding}
          className="btn-primary-elder flex-1"
        >
          繼續添加{getTabletTypeLabel(tabletType)}
        </Button>
        <Button
          onClick={onBackToMenu}
          variant="ghost"
          className="btn-secondary-elder"
        >
          返回選單
        </Button>
      </div>
    </div>
  )
}

