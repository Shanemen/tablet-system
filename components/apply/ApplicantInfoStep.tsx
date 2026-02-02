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
import { ArrowRight } from 'lucide-react'
import { saveApplicantInfo, getApplicantInfo } from '@/lib/utils/application-storage'

interface ApplicantInfoStepProps {
  ceremonySlug: string
  onNext: () => void
}

export function ApplicantInfoStep({ ceremonySlug, onNext }: ApplicantInfoStepProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({})

  // Load saved data on mount
  useEffect(() => {
    const saved = getApplicantInfo()
    if (saved) {
      setName(saved.name)
      setPhone(saved.phone)
      setEmail(saved.email || '')
    }
  }, [])

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string; email?: string } = {}

    if (!name.trim()) {
      newErrors.name = '請輸入您的姓名'
    }

    if (!phone.trim()) {
      newErrors.phone = '請輸入聯絡電話'
    } else if (!/^[0-9\-\+\(\)\s]+$/.test(phone)) {
      newErrors.phone = '請輸入有效的電話號碼'
    }

    // Email is required and must be valid format
    if (!email.trim()) {
      newErrors.email = '請輸入您的電郵地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = '請輸入有效的電郵地址'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      saveApplicantInfo({ name: name.trim(), phone: phone.trim(), email: email.trim() }, ceremonySlug)
      onNext()
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h2 className="section-title mb-2">
            申請人資料
          </h2>
          <p className="text-lg text-muted-foreground">
            請填寫您的基本信息
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name Field */}
          <div className="space-y-3">
            <label htmlFor="applicant-name" className="form-label">
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
              className="form-input"
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
            <label htmlFor="applicant-phone" className="form-label">
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
              className="form-input"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="text-red-600 text-base" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <label htmlFor="applicant-email" className="form-label">
              電郵地址 <span className="text-red-500">*</span>
            </label>
            <Input
              id="applicant-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: undefined })
              }}
              placeholder="例如：example@email.com"
              className="form-input"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-red-600 text-base" role="alert">
                {errors.email}
              </p>
            )}
            <p className="text-base text-muted-foreground">
              僅在申請有問題時聯繫您
            </p>
          </div>
        </div>

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
    </div>
  )
}

