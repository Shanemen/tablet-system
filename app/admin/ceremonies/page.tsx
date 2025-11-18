'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
      setMessage({ type: 'success', text: result.success || '法会信息已成功更新！' })
      await loadCeremony()
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 sm:p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-xl text-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          载入中...
        </div>
      </div>
    )
  }

  if (!ceremony) {
    return (
      <div className="min-h-screen bg-background p-6 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-primary mb-6">法会编辑</h1>
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground">未找到活动法会。请在数据库中创建一个法会。</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">法会编辑</h1>
          <p className="text-lg text-muted-foreground">编辑当前法会信息</p>
        </div>

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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chinese Name */}
            <div>
              <label htmlFor="name_zh" className="block text-base text-muted-foreground mb-3">
                法会名称（中文）<span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                id="name_zh"
                name="name_zh"
                type="text"
                required
                defaultValue={ceremony.name_zh}
                placeholder="例如：2024年3月15日 三時繫念法會"
                className="w-full text-lg md:text-lg py-3 h-auto"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-base text-muted-foreground mb-3">
                法会地点
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                defaultValue={ceremony.location || ''}
                placeholder="例如：淨土道場"
                className="w-full text-lg md:text-lg py-3 h-auto"
              />
            </div>

            {/* Ceremony Duration */}
            <div>
              <label className="block text-base text-muted-foreground mb-3">
                法会日期和时间<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label htmlFor="start_at" className="sr-only">开始时间</label>
                  <Input
                    id="start_at"
                    name="start_at"
                    type="datetime-local"
                    required
                    defaultValue={ceremony.start_at.slice(0, 16)}
                    className="w-full text-lg md:text-lg py-3 h-auto"
                  />
                </div>
                <span className="text-lg text-muted-foreground font-medium">—</span>
                <div className="flex-1">
                  <label htmlFor="end_at" className="sr-only">结束时间</label>
                  <Input
                    id="end_at"
                    name="end_at"
                    type="datetime-local"
                    required
                    defaultValue={ceremony.end_at ? ceremony.end_at.slice(0, 16) : ceremony.start_at.slice(0, 16)}
                    className="w-full text-lg md:text-lg py-3 h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline_at" className="block text-base text-muted-foreground mb-3">
                網上申請截止時間<span className="text-red-500 ml-1">*</span>
                <span className="text-sm text-muted-foreground font-normal ml-2">（超过此时间后，申请表单将自动关闭）</span>
              </label>
              <Input
                id="deadline_at"
                name="deadline_at"
                type="datetime-local"
                required
                defaultValue={ceremony.deadline_at.slice(0, 16)}
                className="w-full text-lg md:text-lg py-3 h-auto"
              />
            </div>

            {/* Public URL and QR Code */}
            <div>
              <label className="block text-base text-muted-foreground mb-3">
                信众申请链接
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
                    className="w-full bg-muted text-lg md:text-lg py-3 h-auto font-mono"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const urlToCopy = fullUrl || `${window.location.origin}/apply/${ceremony.slug}`
                      navigator.clipboard.writeText(urlToCopy)
                      alert('链接已复制到剪贴板！')
                    }}
                    className="text-base px-6 py-3 whitespace-nowrap"
                  >
                    复制链接
                  </Button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
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
                  <p className="text-base text-muted-foreground mb-2">
                    <strong className="text-foreground">二维码分享</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    扫描二维码即可访问申请表单，方便信众使用手机填写
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => loadCeremony()}
                disabled={saving}
                className="text-base px-6 py-3"
              >
                重置
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/85 hover:shadow-md transition-all text-base px-8 py-3 font-semibold"
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
      </div>
    </div>
  )
}
