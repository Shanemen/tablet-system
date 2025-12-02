/**
 * Step 1: Applicant Information
 * 
 * Elder-friendly design:
 * - Large input fields (h-16)
 * - Large text (text-xl)
 * - Clear labels
 * - Sticky bottom button
 */

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { saveApplicantInfo, getApplicantInfo } from '@/lib/utils/application-storage'

interface ApplicantInfoStepProps {
  ceremonySlug: string
  onNext: () => void
}

export function ApplicantInfoStep({ ceremonySlug, onNext }: ApplicantInfoStepProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  // Load saved data on mount
  useEffect(() => {
    const saved = getApplicantInfo()
    if (saved) {
      setName(saved.name)
      setPhone(saved.phone)
    }
  }, [])

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string } = {}

    if (!name.trim()) {
      newErrors.name = '請輸入您的姓名'
    }

    if (!phone.trim()) {
      newErrors.phone = '請輸入聯絡電話'
    } else if (!/^[0-9\-\+\(\)\s]+$/.test(phone)) {
      newErrors.phone = '請輸入有效的電話號碼'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      saveApplicantInfo({ name: name.trim(), phone: phone.trim() }, ceremonySlug)
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="form-step-title text-3xl font-bold text-foreground mb-2">
          申請人資料
        </h2>
        <p className="text-lg text-muted-foreground">
          請填寫您的基本信息
        </p>
      </div>

      {/* Form Fields */}
      <Card className="p-6 space-y-6">
        {/* Name Field */}
        <div className="space-y-3">
          <label htmlFor="applicant-name" className="form-label block text-xl font-semibold text-foreground">
            姓名 <span className="text-red-500">*</span>
          </label>
          <Input
            id="applicant-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors({ ...errors, name: undefined })
            }}
            placeholder="請輸入您的姓名"
            className="form-input-large h-16 text-xl"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-red-600 text-base" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-3">
          <label htmlFor="applicant-phone" className="form-label block text-xl font-semibold text-foreground">
            聯絡電話 <span className="text-red-500">*</span>
          </label>
          <Input
            id="applicant-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (errors.phone) setErrors({ ...errors, phone: undefined })
            }}
            placeholder="例如：0912-345-678"
            className="form-input-large h-16 text-xl"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-red-600 text-base" role="alert">
              {errors.phone}
            </p>
          )}
          <p className="text-base text-muted-foreground">
            用於接收申請確認通知
          </p>
        </div>
      </Card>

      {/* Next Button */}
      <div>
        <Button
          onClick={handleNext}
          className="btn-primary-elder w-full"
        >
          下一步：選擇牌位類型
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

