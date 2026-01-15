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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Check, Edit, Plus, List, ShoppingCart, Trash2, Loader2 } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'

interface TabletFormStepProps {
  tabletType: TabletTypeValue
  onBackToMenu: () => void
  imageStyle?: 'bw' | 'color'  // Temple's image style preference
}

type FormState = 'filling' | 'previewing' | 'confirmed'

export function TabletFormStep({
  tabletType,
  onBackToMenu,
  imageStyle = 'bw',  // Default to B&W (print on colored paper)
}: TabletFormStepProps) {
  const config = getTabletTypeConfig(tabletType)
  const [formState, setFormState] = useState<FormState>('filling')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [existingTablets, setExistingTablets] = useState<TabletItem[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [convertedTexts, setConvertedTexts] = useState<{ honoree: string; petitioner: string }>({ honoree: '', petitioner: '' })
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)

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
    
    // Set loading state first, then switch to previewing state
    // This ensures the loading state is visible before any async operations
    setIsGeneratingPreview(true)
    
    // Use setTimeout to ensure state update is processed before switching form state
    await new Promise(resolve => setTimeout(resolve, 0))
    setFormState('previewing')
    
    // Minimum display time for loading state (ensures users see feedback)
    const minLoadingTime = Promise.resolve().then(() => new Promise(resolve => setTimeout(resolve, 300)))
    
    try {
      // Smart conversion: language + text detection
      const previewText = getPreviewText(tabletType, formData)
      const traditionalText = await convertToTraditional(previewText)
      
      const petitionerText = getPetitionerText(tabletType, formData)
      const traditionalPetitioner = petitionerText 
        ? await convertToTraditional(petitionerText)
        : ''
      
      // Wait for minimum loading time to ensure users see the loading state
      await minLoadingTime
      
      setIsImageLoading(true)
      setConvertedTexts({
        honoree: traditionalText,
        petitioner: traditionalPetitioner
      })
    } catch (error) {
      console.error('转换失败:', error)
      // Fallback: use original text if conversion fails
      const previewText = getPreviewText(tabletType, formData)
      const petitionerText = getPetitionerText(tabletType, formData)
      
      // Wait for minimum loading time even on error
      await minLoadingTime
      
      setIsImageLoading(true)
      setConvertedTexts({
        honoree: previewText,
        petitioner: petitionerText || ''
      })
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  // Go back to editing
  const handleBackToEdit = () => {
    setIsGeneratingPreview(false)
    setIsImageLoading(true)
    setFormState('filling')
  }

  // Confirm and add to cart
  const handleConfirm = async () => {
    try {
      // Ensure we have converted texts (in case user skipped preview)
      let honoreeText = convertedTexts.honoree
      let petitionerText = convertedTexts.petitioner
      
      if (!honoreeText) {
        // Need to convert first
        const previewText = getPreviewText(tabletType, formData)
        honoreeText = await convertToTraditional(previewText)
        
        const petitionerRaw = getPetitionerText(tabletType, formData)
        petitionerText = petitionerRaw ? await convertToTraditional(petitionerRaw) : ''
      }

      // Build the API URL to generate the image
      const apiUrl = new URL('/api/og/tablet', window.location.origin)
      apiUrl.searchParams.set('name', honoreeText)
      apiUrl.searchParams.set('type', tabletType)
      apiUrl.searchParams.set('style', imageStyle)  // Temple-specific image style
      if (petitionerText) {
        apiUrl.searchParams.set('applicant', petitionerText)
      }

      // 1. 获取生成的图片
      const response = await fetch(apiUrl.toString())
      if (!response.ok) {
        throw new Error('图片生成失败')
      }
      const blob = await response.blob()

      // 2. 上传到 Supabase Storage
      const supabase = createClient()
      const fileName = `${Date.now()}-${tabletType}-${Math.random().toString(36).substr(2, 9)}.png`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tablet-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('图片上传失败:', uploadError)
        throw new Error('图片上传失败')
      }

      // 3. 获取图片 URL
      // CRITICAL: This URL MUST be the same one used everywhere (preview, admin, PDF)
      // For private bucket with RLS allowing anon read, getPublicUrl should work
      const { data: { publicUrl } } = supabase.storage
        .from('tablet-images')
        .getPublicUrl(fileName)

      if (!publicUrl) {
        throw new Error('无法获取图片 URL')
      }

      // Verify the URL format is correct
      if (!publicUrl.includes('supabase.co/storage/v1/object/public/tablet-images/')) {
        console.error('Unexpected URL format:', publicUrl)
        throw new Error('图片 URL 格式不正确')
      }

      // Build display text (same as confirmationText in previewing state)
      let displayText = ''
      if (tabletType === 'karmic-creditors') {
        displayText = honoreeText
      } else if (tabletType === 'aborted-spirits') {
        const parts = [honoreeText]
        if (petitionerText) {
          parts.push(petitionerText)
        }
        displayText = parts.join('，')
      } else {
        const parts = [honoreeText]
        if (petitionerText) {
          parts.push(petitionerText)
        }
        displayText = parts.join('，')
      }

      // CRITICAL: Save the EXACT URL that will be used everywhere
      // This ensures: user approved image = preview image = admin image = PDF image
      addTabletToCart(tabletType, formData, publicUrl, displayText)
      refreshExistingTablets()
      setFormState('confirmed')
    } catch (error) {
      console.error('确认添加失败:', error)
      alert('添加失败，请重试')
    }
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

    if (field.type === 'checkbox') {
      const isChecked = value === 'true' || value === '1'
      return (
        <div key={field.name} className="space-y-3">
          <label className="flex items-center gap-4 cursor-pointer p-4 rounded-lg border-2 border-input hover:border-primary transition-colors">
            <input
              type="checkbox"
              id={field.name}
              checked={isChecked}
              onChange={(e) => handleFieldChange(field.name, e.target.checked ? '1' : '0')}
              className="w-6 h-6 rounded border-2 border-muted-foreground bg-white cursor-pointer appearance-none checked:bg-primary checked:border-primary checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%206L9%2017l-5-5%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat"
            />
            <div className="flex-1">
              <span className="text-lg text-muted-foreground">
                {field.label}
              </span>
              {field.helpText && (
                <p className="text-base text-muted-foreground mt-1">{field.helpText}</p>
              )}
            </div>
          </label>
          {error && (
            <p id={`${field.name}-error`} className="text-red-600 text-base" role="alert">
              {error}
            </p>
          )}
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className="space-y-3">
          <label htmlFor={field.name} className="form-label">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            rows={4}
            className="form-input"
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
        <label htmlFor={field.name} className="form-label">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <Input
          id={field.name}
          type="text"
          value={value}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="form-input"
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
            <h2 className="section-title">
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
              // Fallback for old data without displayText
              const displayText = tablet.displayText || Object.values(tablet.formData).filter(v => v).join('，')
              const isConfirmingDelete = deleteConfirm === tablet.id

              return (
                <div
                  key={tablet.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-lg text-muted-foreground">
                        {index + 1}.
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
        <div className="p-4 sm:p-6 bg-card border border-border rounded-lg">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            {existingTablets.length > 0 ? '添加更多' : '填寫資料'} - 第 {typeCount + 1} 位
          </h3>
          <div className="space-y-4">
            {config.fields.map((field) => renderFormField(field))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleGeneratePreview}
            className="btn-primary-elder w-full sm:w-auto sm:flex-1"
          >
            預覽牌位
          </Button>
          <Button
            onClick={onBackToMenu}
            variant="ghost"
            className="btn-secondary-elder w-full sm:w-auto"
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
    apiUrl.searchParams.set('style', imageStyle)  // Temple-specific image style
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
          <h2 className="section-title mb-2">
            請核對牌位信息
          </h2>
          <p className="text-xl text-primary font-semibold">
            {confirmationText}
          </p>
        </div>

        {/* Preview Section */}
        {/* Tablet Image Preview */}
        <div className="flex justify-center bg-muted/30 rounded-lg p-4 sm:p-6 min-h-[400px] items-center relative">
          {/* Loading overlay - shown while generating or image loading */}
          {(isGeneratingPreview || isImageLoading) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-muted/30 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">生成預覽中...</p>
            </div>
          )}
          {/* Image - only render when conversion is complete */}
          {convertedTexts.honoree && !isGeneratingPreview && (
            <img
              key={`${convertedTexts.honoree}-${convertedTexts.petitioner}`}
              src={apiUrl.toString()}
              alt="牌位預覽"
              className={`max-w-full h-auto rounded-xl shadow-lg transition-opacity duration-300 ${
                isImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ maxHeight: '75vh' }}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false)
                console.error('Failed to load preview image')
              }}
            />
          )}
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
          <h2 className="section-title">
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
          // Fallback for old data without displayText
          const displayText = tablet.displayText || Object.values(tablet.formData).filter(v => v).join('，')
          const isConfirmingDelete = deleteConfirm === tablet.id

          return (
            <div
              key={tablet.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-lg text-muted-foreground">
                    {index + 1}.
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
          className="btn-primary-elder w-full sm:w-auto sm:flex-1"
        >
          繼續添加{getTabletTypeLabel(tabletType)}
        </Button>
        <Button
          onClick={onBackToMenu}
          variant="ghost"
          className="btn-secondary-elder w-full sm:w-auto"
        >
          返回選單
        </Button>
      </div>
    </div>
  )
}

