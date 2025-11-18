'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/admin/PageLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { FormField } from '@/components/admin/FormField'
import { getCurrentCeremony, updateCeremony, createCeremony, activateCeremony, Ceremony } from './actions'
import { Loader2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function CeremoniesPage() {
  const [ceremony, setCeremony] = useState<Ceremony | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [fullUrl, setFullUrl] = useState<string>('')

  useEffect(() => {
    loadCeremony()
  }, [])

  useEffect(() => {
    // Set full URL once ceremony is loaded (client-side only)
    if (typeof window !== 'undefined' && ceremony?.slug) {
      setFullUrl(`${window.location.origin}/apply/${ceremony.slug}`)
    }
  }, [ceremony?.slug])

  const loadCeremony = async () => {
    setLoading(true)
    const data = await getCurrentCeremony()
    setCeremony(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    setSaving(true)
    setMessage(null)
    
    const formData = new FormData(e.currentTarget)
    
    if (!ceremony) {
      // Create new ceremony
      const result = await createCeremony(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: result.success || '法會已創建！' })
        await loadCeremony()
      }
    } else {
      // Update existing ceremony
      const result = await updateCeremony(ceremony.id, formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: result.success || '法會信息已成功更新！' })
        await loadCeremony()
      }
    }
    
    setSaving(false)
  }

  const handleActivate = async () => {
    if (!ceremony) return
    
    setSaving(true)
    setMessage(null)
    
    const result = await activateCeremony(ceremony.id)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.success || '申請表連結已生成！' })
      await loadCeremony()
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">
          <Loader2 className="h-6 w-6 animate-spin" />
          載入中...
        </div>
      </div>
    )
  }

  // Show create form if no ceremony exists
  const isDraft = ceremony?.status === 'draft'
  const isActive = ceremony?.status === 'active'

  return (
    <PageLayout narrow>
      <PageHeader 
        title="表格編輯" 
        subtitle={ceremony ? "編輯申請表上的法會詳情" : "創建新的法會牌位申請表"} 
      />

      {message && ceremony && (
        <div className={`mb-6 p-4 rounded-lg text-lg ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="form-section">
          {/* Chinese Name */}
          <FormField label="法會名稱（中文）" required htmlFor="name_zh">
            <Input
              id="name_zh"
              name="name_zh"
              type="text"
              required
              defaultValue={ceremony?.name_zh || ''}
              placeholder="例如：2024年3月15日 三時繫念法會"
              className="form-input"
            />
          </FormField>

          {/* Location */}
          <FormField label="法會地點" required htmlFor="location">
            <Input
              id="location"
              name="location"
              type="text"
              required
              defaultValue={ceremony?.location || ''}
              placeholder="例如：淨土道場"
              className="form-input"
            />
          </FormField>

          {/* Ceremony Duration */}
          <div>
            <label className="form-label">
              法會日期和時間<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label htmlFor="start_at" className="sr-only">開始時間</label>
                <Input
                  id="start_at"
                  name="start_at"
                  type="datetime-local"
                  required
                  defaultValue={ceremony?.start_at ? ceremony.start_at.slice(0, 16) : ''}
                  className="form-input"
                />
              </div>
              <span className="text-lg text-muted-foreground font-medium">—</span>
              <div className="flex-1">
                <label htmlFor="end_at" className="sr-only">結束時間</label>
                <Input
                  id="end_at"
                  name="end_at"
                  type="datetime-local"
                  required
                  defaultValue={ceremony?.end_at ? ceremony.end_at.slice(0, 16) : ceremony?.start_at ? ceremony.start_at.slice(0, 16) : ''}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Deadline */}
          <FormField 
            label="網上申請截止時間" 
            required 
            htmlFor="deadline_at"
            helpText="超過此時間後，申請表單將自動關閉"
          >
            <Input
              id="deadline_at"
              name="deadline_at"
              type="datetime-local"
              required
              defaultValue={ceremony?.deadline_at ? ceremony.deadline_at.slice(0, 16) : ''}
              className="form-input"
            />
          </FormField>

          {/* Public URL and QR Code - Only show if active */}
          {isActive && ceremony && (
            <div>
              <label className="form-label">
                信眾申請鏈接
              </label>
              
              {/* URL Copy Section */}
              <div className="mb-4">
                <div className="flex gap-3">
                  <Input
                    id="slug"
                    name="slug"
                    type="text"
                    value={fullUrl || `/apply/${ceremony.slug}`}
                    readOnly
                    className="bg-primary/10 text-primary font-mono border-primary/20 h-9 py-2 text-base"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const urlToCopy = fullUrl || `${window.location.origin}/apply/${ceremony.slug}`
                      navigator.clipboard.writeText(urlToCopy)
                      alert('鏈接已複製到剪貼板！')
                    }}
                    className="btn-secondary-large whitespace-nowrap"
                  >
                    複製鏈接
                  </Button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-lg">
                <div className="flex-shrink-0">
                  {fullUrl && (
                    <QRCodeSVG
                      value={fullUrl}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-base text-primary mb-2">
                    <strong className="text-primary">二維碼分享</strong>
                  </p>
                  <p className="text-sm text-primary">
                    掃描二維碼即可訪問申請表單，方便信眾使用手機填寫
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Draft Status Notice */}
          {isDraft && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-base text-foreground mb-2">
                <strong>草稿狀態</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                法會信息已保存為草稿。填寫完成後，點擊「生成申請表連結」按鈕來激活申請表單。
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="button-group">
            {ceremony && (
              <Button
                type="button"
                variant="outline"
                onClick={() => loadCeremony()}
                disabled={saving}
                className="btn-secondary-large"
              >
                重置
              </Button>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="btn-primary-large"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  保存中...
                </>
              ) : ceremony ? (
                '保存修改'
              ) : (
                '創建法會'
              )}
            </Button>
            {isDraft && ceremony && (
              <Button
                type="button"
                onClick={handleActivate}
                disabled={saving}
                className="btn-primary-large"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    處理中...
                  </>
                ) : (
                  '生成申請表連結'
                )}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </PageLayout>
  )
}
