'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/admin/PageLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { FormField } from '@/components/admin/FormField'
import { getCurrentCeremony, updateCeremony, Ceremony } from './actions'
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
    if (!ceremony) return
    
    setSaving(true)
    setMessage(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateCeremony(ceremony.id, formData)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: result.success || '法會信息已成功更新！' })
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

  if (!ceremony) {
    return (
      <PageLayout narrow>
        <PageHeader title="法會編輯" />
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">未找到活動法會。請在數據庫中創建一個法會。</p>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout narrow>
      <PageHeader title="法會編輯" subtitle="編輯當前法會信息" />

      {message && (
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
              defaultValue={ceremony.name_zh}
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
              defaultValue={ceremony.location || ''}
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
                  defaultValue={ceremony.start_at.slice(0, 16)}
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
                  defaultValue={ceremony.end_at ? ceremony.end_at.slice(0, 16) : ceremony.start_at.slice(0, 16)}
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
              defaultValue={ceremony.deadline_at.slice(0, 16)}
              className="form-input"
            />
          </FormField>

          {/* Public URL and QR Code */}
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

          {/* Submit Button */}
          <div className="button-group">
            <Button
              type="button"
              variant="outline"
              onClick={() => loadCeremony()}
              disabled={saving}
              className="btn-secondary-large"
            >
              重置
            </Button>
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
              ) : (
                '保存修改'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  )
}
