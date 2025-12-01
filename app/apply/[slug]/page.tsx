/**
 * Tablet Application Form - Multi-Step Single Page Application
 * 
 * User Journey:
 * Step 1: Applicant Information (name, phone)
 * Step 2: Select Tablet Type
 * Step 3: Fill Form & Preview (dynamic based on tablet type)
 * Step 4: Cart Review & Submit
 * 
 * Features:
 * - Shopping cart model: users can add multiple tablets of different types
 * - localStorage persistence: data saved automatically
 * - Elder-friendly UI: large text, buttons, and touch targets
 * - Single page: no URL changes, smooth transitions
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Loader2, Calendar, MapPin, Clock } from 'lucide-react'
import { PageLayout } from '@/components/admin/PageLayout'
import { getCeremonyBySlug, Ceremony } from '@/app/admin/ceremonies/actions'
import { submitMultiTypeApplication } from './actions'

// Step Components
import { ApplicantInfoStep } from '@/components/apply/ApplicantInfoStep'
import { TabletTypeSelector } from '@/components/apply/TabletTypeSelector'
import { TabletFormStep } from '@/components/apply/TabletFormStep'
import { CartReviewStep } from '@/components/apply/CartReviewStep'

// Utils
import {
  clearCart,
  isCartForCeremony,
  hasApplicantInfo,
  getCartCount,
} from '@/lib/utils/application-storage'
import { TabletTypeValue } from '@/lib/tablet-types-config'

type Step = 'applicant-info' | 'select-type' | 'fill-form' | 'review'

export default function ApplicationFormPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [ceremony, setCeremony] = useState<Ceremony | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<Step>('applicant-info')
  const [selectedTabletType, setSelectedTabletType] = useState<TabletTypeValue | null>(null)

  // Message state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadCeremony()
  }, [slug])

  useEffect(() => {
    if (ceremony) {
      const deadline = new Date(ceremony.deadline_at)
      const now = new Date()
      setIsDeadlinePassed(now > deadline)

      // Check if cart is for this ceremony, if not, clear it
      if (!isCartForCeremony(slug)) {
        clearCart()
      }

      // If applicant info already saved, skip to type selection
      if (hasApplicantInfo() && currentStep === 'applicant-info') {
        const cartCount = getCartCount()
        if (cartCount > 0) {
          setCurrentStep('select-type')
        }
      }
    }
  }, [ceremony, slug])

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

  // Step Navigation Handlers
  const handleApplicantInfoNext = () => {
    setCurrentStep('select-type')
  }

  const handleSelectType = (type: TabletTypeValue) => {
    setSelectedTabletType(type)
    setCurrentStep('fill-form')
  }

  const handleBackToTypeSelection = () => {
    setCurrentStep('select-type')
  }

  const handleBackToApplicantInfo = () => {
    setCurrentStep('applicant-info')
  }

  const handleContinueSameType = () => {
    // Stay on fill-form step, form will be reset in component
  }

  const handleSelectOtherType = () => {
    setSelectedTabletType(null)
    setCurrentStep('select-type')
  }

  const handleViewCart = () => {
    setCurrentStep('review')
  }

  const handleBackFromReview = () => {
    setCurrentStep('select-type')
  }

  const handleSubmit = async () => {
    if (!ceremony) return

    try {
      const result = await submitMultiTypeApplication(ceremony.id, slug)

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        // Clear cart and redirect to success page
        clearCart()
        router.push(`/apply/success/${result.applicationId}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      setMessage({ type: 'error', text: '提交失敗，請稍後再試' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Loading state
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

  // Ceremony not found
  if (!ceremony) {
    return (
      <PageLayout narrow>
        <Card className="p-8 text-center">
          <p className="text-lg text-muted-foreground">找不到此法會申請表單。</p>
        </Card>
      </PageLayout>
    )
  }

  // Deadline passed
  if (isDeadlinePassed) {
    return (
      <PageLayout narrow>
        {/* Ceremony Header */}
        <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
            {ceremony.name_zh}
          </h1>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <div className="text-center">
            <p className="text-xl font-bold text-red-700 mb-2">申請已截止</p>
            <p className="text-base text-red-600">
              本次法會的牌位申請已於 {formatDateTime(ceremony.deadline_at)} 截止。
            </p>
            <p className="text-sm text-red-600 mt-2">感恩您的參與。</p>
          </div>
        </Card>
      </PageLayout>
    )
  }

  // Main Application Form
  return (
    <PageLayout narrow>
      {/* Ceremony Header - Always visible */}
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
              <span className="font-medium text-foreground">
                {formatDateTime(ceremony.deadline_at)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Error/Success Message */}
      {message && (
        <Card
          className={`p-6 mb-6 ${
            message.type === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <p
            className={`text-lg font-medium ${
              message.type === 'error' ? 'text-red-700' : 'text-green-700'
            }`}
          >
            {message.text}
          </p>
        </Card>
      )}

      {/* Step Content - Single page with conditional rendering */}
      <Card className="p-6 sm:p-8">
        {currentStep === 'applicant-info' && (
          <ApplicantInfoStep ceremonySlug={slug} onNext={handleApplicantInfoNext} />
        )}

        {currentStep === 'select-type' && (
          <TabletTypeSelector
            onSelectType={handleSelectType}
            onBack={handleBackToApplicantInfo}
            onViewCart={handleViewCart}
          />
        )}

        {currentStep === 'fill-form' && selectedTabletType && (
          <TabletFormStep
            tabletType={selectedTabletType}
            onBack={handleBackToTypeSelection}
            onContinueSameType={handleContinueSameType}
            onSelectOtherType={handleSelectOtherType}
            onViewCart={handleViewCart}
          />
        )}

        {currentStep === 'review' && (
          <CartReviewStep onBack={handleBackFromReview} onSubmit={handleSubmit} />
        )}
      </Card>
    </PageLayout>
  )
}
