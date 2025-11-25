'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/admin/PageLayout'
import { PageHeader } from '@/components/admin/PageHeader'
import { FormField } from '@/components/admin/FormField'
import { getCeremonyBySlug, Ceremony } from '@/app/admin/ceremonies/actions'
import { submitApplication } from './actions'
import { Loader2, Calendar, MapPin, Clock, Plus, X } from 'lucide-react'

const PLAQUE_TYPES = [
  { value: 'longevity', label: '長生祿位', description: '為在世親友祈福' },
  { value: 'deceased', label: '往生蓮位', description: '超薦往生者' },
  { value: 'karmic-creditors', label: '冤親債主', description: '超薦累劫冤親債主' },
  { value: 'aborted-spirits', label: '嬰靈排位', description: '超薦嬰靈菩薩' },
]

export default function ApplicationFormPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [ceremony, setCeremony] = useState<Ceremony | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form state
  const [applicantName, setApplicantName] = useState('')
  const [phone, setPhone] = useState('')
  const [plaqueType, setPlaqueType] = useState('')
  const [names, setNames] = useState<string[]>([''])
  
  // Preview state
  const [previewName, setPreviewName] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  
  useEffect(() => {
    loadCeremony()
  }, [slug])
  
  useEffect(() => {
    if (ceremony) {
      const deadline = new Date(ceremony.deadline_at)
      const now = new Date()
      setIsDeadlinePassed(now > deadline)
    }
  }, [ceremony])
  
  const loadCeremony = async () => {
    setLoading(true)
    const data = await getCeremonyBySlug(slug)
    setCeremony(data)
    setLoading(false)
  }
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  const handleAddName = () => {
    setNames([...names, ''])
  }
  
  const handleRemoveName = (index: number) => {
    if (names.length > 1) {
      setNames(names.filter((_, i) => i !== index))
    }
  }
  
  const handleNameChange = (index: number, value: string) => {
    // Limit to 8 characters for Chinese names
    if (value.length <= 8) {
      const newNames = [...names]
      newNames[index] = value
      setNames(newNames)
    }
  }
  
  const handlePreview = () => {
    const firstName = names[0]?.trim()
    if (!firstName) {
      setMessage({ type: 'error', text: '請至少輸入一個名字以預覽' })
      return
    }
    if (!plaqueType) {
      setMessage({ type: 'error', text: '請先選擇牌位類型' })
      return
    }
    setPreviewName(firstName)
    setShowPreview(true)
    setMessage(null)
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!ceremony) return
    
    // Validation
    if (!applicantName.trim()) {
      setMessage({ type: 'error', text: '請輸入申請人姓名' })
      return
    }
    
    if (!phone.trim()) {
      setMessage({ type: 'error', text: '請輸入聯絡電話' })
      return
    }
    
    if (!plaqueType) {
      setMessage({ type: 'error', text: '請選擇牌位類型' })
      return
    }
    
    const validNames = names.filter(name => name.trim().length > 0)
    if (validNames.length === 0) {
      setMessage({ type: 'error', text: '請至少輸入一個牌位名字' })
      return
    }
    
    setSubmitting(true)
    setMessage(null)
    
    const formData = new FormData()
    formData.append('ceremony_id', ceremony.id.toString())
    formData.append('applicant_name', applicantName.trim())
    formData.append('phone', phone.trim())
    formData.append('plaque_type', plaqueType)
    formData.append('names', validNames.join(','))
    formData.append('slug', slug)
    
    const result = await submitApplication(formData)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
      setSubmitting(false)
    } else {
      // Redirect to success page with preview
      router.push(`/apply/success/${result.applicationId}`)
    }
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
        <PageHeader title="法會申請" />
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">找不到此法會申請表單。</p>
        </Card>
      </PageLayout>
    )
  }
  
  return (
    <PageLayout narrow>
      {/* Ceremony Header */}
      <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
          {ceremony.name_zh}
        </h1>
        
        <div className="space-y-3 text-base">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-muted-foreground">法會日期：</span>
              <span className="text-foreground font-medium">
                {formatDateTime(ceremony.start_at)}
                {ceremony.end_at && ceremony.end_at !== ceremony.start_at && (
                  <> 至 {formatDateTime(ceremony.end_at)}</>
                )}
              </span>
            </div>
          </div>
          
          {ceremony.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-muted-foreground">地點：</span>
                <span className="text-foreground font-medium">{ceremony.location}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-muted-foreground">申請截止：</span>
              <span className={`font-medium ${isDeadlinePassed ? 'text-red-600' : 'text-foreground'}`}>
                {formatDateTime(ceremony.deadline_at)}
              </span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Deadline Notice */}
      {isDeadlinePassed ? (
        <Card className="p-6 mb-6 bg-red-50 border-red-200">
          <div className="text-center">
            <p className="text-xl font-bold text-red-700 mb-2">申請已截止</p>
            <p className="text-base text-red-600">
              本次法會的牌位申請已於 {formatDateTime(ceremony.deadline_at)} 截止。
            </p>
            <p className="text-sm text-red-600 mt-2">感恩您的參與。</p>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <PageHeader title="牌位申請表單" subtitle="請填寫以下信息申請牌位" />
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-lg ${
              message.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="form-section">
            {/* Applicant Name */}
            <FormField label="申請人姓名" required htmlFor="applicant_name">
              <Input
                id="applicant_name"
                name="applicant_name"
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="請輸入您的姓名"
                className="form-input"
              />
            </FormField>
            
            {/* Phone */}
            <FormField label="聯絡電話" required htmlFor="phone">
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="例如：0912-345-678"
                className="form-input"
              />
            </FormField>
            
            {/* Plaque Type */}
            <div>
              <label className="form-label">
                牌位類型<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLAQUE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPlaqueType(type.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      plaqueType === type.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-semibold text-base mb-1">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Names */}
            <div>
              <label className="form-label">
                牌位名字<span className="text-red-500 ml-1">*</span>
                <span className="text-sm text-muted-foreground font-normal ml-2">
                  （最多8個字，可添加多個名字）
                </span>
              </label>
              <div className="space-y-3">
                {names.map((name, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`名字 ${index + 1}`}
                      maxLength={8}
                      className="form-input"
                    />
                    {names.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveName(index)}
                        className="btn-secondary-large"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddName}
                  className="btn-secondary-large"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加名字
                </Button>
              </div>
            </div>
            
            {/* Preview Button */}
            <div className="button-group">
              <Button
                type="button"
                onClick={handlePreview}
                variant="outline"
                className="btn-secondary-large w-full"
              >
                預覽牌位
              </Button>
            </div>
            
            {/* Submit Button */}
            <div className="button-group">
              <Button
                type="submit"
                disabled={submitting}
                className="btn-primary-large"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    提交中...
                  </>
                ) : (
                  '提交申請'
                )}
              </Button>
            </div>
          </form>
          
          {/* Preview Section */}
          {showPreview && previewName && plaqueType && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-xl font-semibold mb-4">牌位預覽</h3>
              <div className="flex justify-center">
                <img
                  src={`/api/og/tablet?name=${encodeURIComponent(previewName)}&type=${plaqueType}`}
                  alt="牌位預覽"
                  className="max-w-full h-auto border rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
        </Card>
      )}
    </PageLayout>
  )
}

