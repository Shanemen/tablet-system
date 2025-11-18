'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getCurrentCeremony, updateCeremony, Ceremony } from './actions'
import { Loader2 } from 'lucide-react'

export default function CeremoniesPage() {
  const [ceremony, setCeremony] = useState<Ceremony | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadCeremony()
  }, [])

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
        <div className="flex items-center gap-2 text-lg text-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          载入中...
        </div>
      </div>
    )
  }

  if (!ceremony) {
    return (
      <div className="min-h-screen bg-background p-6 sm:p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-primary mb-6">法会编辑</h1>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">未找到活动法会。请在数据库中创建一个法会。</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">法会编辑</h1>
          <p className="mt-2 text-base text-foreground/80">编辑当前法会信息</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
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
              <label htmlFor="name_zh" className="block text-sm font-medium text-foreground mb-2">
                法会名称（中文）*
              </label>
              <Input
                id="name_zh"
                name="name_zh"
                type="text"
                required
                defaultValue={ceremony.name_zh}
                placeholder="例如：2024年3月15日 三時繫念法會"
                className="w-full"
              />
            </div>

            {/* English Name */}
            <div>
              <label htmlFor="name_en" className="block text-sm font-medium text-foreground mb-2">
                法会名称（英文）
              </label>
              <Input
                id="name_en"
                name="name_en"
                type="text"
                defaultValue={ceremony.name_en || ''}
                placeholder="例如：2024 March 15 - San Shi Xi Nian Ceremony"
                className="w-full"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                法会地点
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                defaultValue={ceremony.location || ''}
                placeholder="例如：淨土道場"
                className="w-full"
              />
            </div>

            {/* Start Date/Time */}
            <div>
              <label htmlFor="start_at" className="block text-sm font-medium text-foreground mb-2">
                法会日期和时间 *
              </label>
              <Input
                id="start_at"
                name="start_at"
                type="datetime-local"
                required
                defaultValue={ceremony.start_at.slice(0, 16)}
                className="w-full"
              />
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline_at" className="block text-sm font-medium text-foreground mb-2">
                报名截止时间 *
              </label>
              <Input
                id="deadline_at"
                name="deadline_at"
                type="datetime-local"
                required
                defaultValue={ceremony.deadline_at.slice(0, 16)}
                className="w-full"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                超过此时间后，信众申请表单将自动关闭
              </p>
            </div>

            {/* Public URL (Read-only for now) */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
                信众申请链接
              </label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  value={`/apply/${ceremony.slug}`}
                  readOnly
                  className="w-full bg-muted"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/apply/${ceremony.slug}`)
                    alert('链接已复制到剪贴板！')
                  }}
                >
                  复制链接
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                将此链接分享给信众填写申请
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => loadCeremony()}
                disabled={saving}
              >
                重置
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/85 hover:shadow-md transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

